const { chromium } = require('playwright');
const path = require('path');
const { pathToFileURL } = require('url');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const pageUrl = pathToFileURL(path.resolve(__dirname, '..', 'index.html')).href;
  const cases = [
    { name: 'desktop', viewport: { width: 1440, height: 900 } },
    { name: 'desktop-small', viewport: { width: 1280, height: 720 } },
    { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    { name: 'mobile-small', viewport: { width: 360, height: 640 }, isMobile: true, hasTouch: true },
    { name: 'mobile-landscape', viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true }
  ];
  const report = [];

  for (const testCase of cases) {
    const context = await browser.newContext(testCase);
    const page = await context.newPage();
    const errors = [];
    page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
    page.on('pageerror', error => errors.push(`page: ${error.message}`));
    await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(180);
    await page.screenshot({ path: path.resolve(__dirname, `check-${testCase.name}-loading.png`) });
    await page.waitForSelector('#titleScreen.is-active', { timeout: 6000 });
    await page.screenshot({ path: path.resolve(__dirname, `check-${testCase.name}-title.png`) });

    const inspect = async label => {
      const data = await page.evaluate(() => {
        const viewport = { width: innerWidth, height: innerHeight };
        const selectors = 'button:not([hidden]), .chapter-mark, .objective, .subtitle:not([hidden]), .panel:not([hidden]), .story-frame:not([hidden]), .title-copy, .title-cat, .text-prologue-copy';
        const issues = [...document.querySelectorAll(selectors)].flatMap(node => {
          const style = getComputedStyle(node);
          if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return [];
          const rect = node.getBoundingClientRect();
          const outside = rect.right < -2 || rect.bottom < -2 || rect.left > viewport.width + 2 || rect.top > viewport.height + 2;
          const clipped = rect.width > viewport.width + 4 || rect.height > viewport.height + 4;
          return outside || clipped ? [{ node: node.id || node.className, rect: [rect.x, rect.y, rect.width, rect.height], outside, clipped }] : [];
        });
        const text = document.body.innerText;
        return {
          issues,
          replacementChars: (text.match(/\uFFFD/g) || []).length,
          bodyScroll: [document.documentElement.scrollWidth, document.documentElement.scrollHeight],
          viewport,
          titleCatImage: getComputedStyle(document.querySelector('.title-cat')).backgroundImage
        };
      });
      report.push({ case: testCase.name, screen: label, ...data });
    };

    await inspect('title');
    await page.click('#startButton');
    await page.waitForTimeout(450);
    await page.screenshot({ path: path.resolve(__dirname, `check-${testCase.name}-text-prologue.png`) });
    await inspect('text-prologue');
    await page.click('#textPrologueSkip');
    await page.waitForTimeout(450);
    await page.screenshot({ path: path.resolve(__dirname, `check-${testCase.name}-cinematic.png`) });
    await inspect('cinematic');
    await page.click('#skipCinematic');
    await page.waitForTimeout(950);
    await page.screenshot({ path: path.resolve(__dirname, `check-${testCase.name}-game.png`) });
    await inspect('game');
    await page.click('#pauseButton');
    await page.waitForTimeout(120);
    await page.screenshot({ path: path.resolve(__dirname, `check-${testCase.name}-pause.png`) });
    await inspect('pause');
    await page.evaluate(() => {
      document.querySelector('#pauseScreen').hidden = true;
      const puzzle = document.querySelector('#puzzleOverlay');
      puzzle.hidden = false;
      document.querySelectorAll('.signal-ring').forEach(ring => ring.style.setProperty('--angle', '0deg'));
    });
    await page.screenshot({ path: path.resolve(__dirname, `check-${testCase.name}-puzzle.png`) });
    await inspect('puzzle');
    await page.evaluate(() => {
      document.querySelector('#puzzleOverlay').hidden = true;
      document.querySelector('#storyOverlay').hidden = false;
      document.querySelector('#storyText').textContent = '星际历 2749 年。\n米粒跟着主人，第一次离开地球。';
    });
    await page.screenshot({ path: path.resolve(__dirname, `check-${testCase.name}-story.png`) });
    await inspect('story');
    await page.evaluate(() => {
      document.querySelector('#storyOverlay').hidden = true;
      document.querySelector('#gameScreen').classList.remove('is-active');
      document.querySelector('#endingScreen').classList.add('is-active');
      document.querySelector('#endingBackdrop').style.backgroundImage = 'url("assets/images/energy-bay.png")';
      document.querySelector('#endingText').textContent = '米粒终于重新锁定了那束来自家的微弱信号。';
      document.querySelector('#endingQuote').textContent = '回家的方向，就藏在仍然回应你的声音里。';
    });
    await page.waitForTimeout(760);
    await page.screenshot({ path: path.resolve(__dirname, `check-${testCase.name}-ending.png`) });
    await inspect('ending');
    report.push({ case: testCase.name, errors });
    await context.close();
  }

  console.log(JSON.stringify(report, null, 2));
  await browser.close();
})().catch(error => {
  console.error(error);
  process.exit(1);
});
