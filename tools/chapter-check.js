const { chromium } = require("playwright");
const path = require("path");
const { pathToFileURL } = require("url");

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", args: ["--use-angle=swiftshader"] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(pathToFileURL(path.resolve(__dirname, "..", "index.html")).href, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#titleScreen.is-active", { timeout: 7000 });
  await page.click("#startButton");
  await page.waitForTimeout(300);
  await page.click("#textPrologueSkip");
  await page.waitForTimeout(250);
  await page.click("#skipCinematic");
  await page.waitForSelector("#chapter3dGate:not([hidden])", { timeout: 4000 });
  await page.click("#chapter3dEnter");
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.resolve(__dirname, "chapter-live-start.png") });

  const beforeMove = await page.evaluate(() => window.__starTailChapter.snapshot());
  await page.keyboard.down("w");
  await page.waitForTimeout(900);
  await page.keyboard.up("w");
  await page.waitForTimeout(120);
  const afterMove = await page.evaluate(() => window.__starTailChapter.snapshot());
  await page.evaluate(() => window.__starTailChapter.teleport(0, 6.4));
  await page.waitForTimeout(180);
  await page.screenshot({ path: path.resolve(__dirname, "chapter-live-collar.png") });
  await page.keyboard.press("e");
  await page.waitForSelector("#chapter3dMemory:not([hidden])", { timeout: 2000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.resolve(__dirname, "chapter-live-memory.png") });
  await page.click("#chapter3dMemoryContinue");
  await page.waitForTimeout(180);
  await page.keyboard.press("q");
  await page.waitForTimeout(650);
  await page.screenshot({ path: path.resolve(__dirname, "chapter-live-scent.png") });

  await page.evaluate(() => window.__starTailChapter.teleport(0, -10));
  await page.waitForTimeout(2300);
  const afterRobot = await page.evaluate(() => window.__starTailChapter.snapshot());
  await page.screenshot({ path: path.resolve(__dirname, "chapter-live-alert.png") });

  await page.evaluate(() => window.__starTailChapter.teleport(3.8, -23));
  await page.waitForTimeout(150);
  await page.keyboard.down("e");
  await page.waitForTimeout(850);
  const duringScratch = await page.evaluate(() => window.__starTailChapter.snapshot());
  await page.waitForTimeout(900);
  await page.keyboard.up("e");
  await page.waitForTimeout(550);
  await page.screenshot({ path: path.resolve(__dirname, "chapter-live-door.png") });

  await page.evaluate(() => window.__starTailChapter.teleport(0, -46));
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.resolve(__dirname, "chapter-live-complete.png") });

  const snapshot = await page.evaluate(() => ({
    gateHidden: document.querySelector("#chapter3dGate").hidden,
    objective: document.querySelector("#chapter3dObjective").textContent,
    prompt: document.querySelector("#chapter3dPrompt").textContent,
    promptHidden: document.querySelector("#chapter3dPrompt").hidden,
    scent: document.querySelector("#chapter3dScent").textContent,
    canvas: document.querySelector("#chapter3dCanvas").getBoundingClientRect().toJSON()
  }));
  console.log(JSON.stringify({ errors, beforeMove, afterMove, afterRobot, duringScratch, snapshot, final: await page.evaluate(() => window.__starTailChapter.snapshot()) }, null, 2));
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
