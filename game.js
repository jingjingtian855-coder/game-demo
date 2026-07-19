(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  const el = {
    loading: $("#loadingScreen"), loadingText: $("#loadingText"), loadingPercent: $("#loadingPercent"), loadingFill: $("#loadingFill"),
    textPrologue: $("#textPrologueScreen"), textPrologueKicker: $("#textPrologueKicker"),
    textPrologueLine: $("#textPrologueLine"), textPrologueProgress: $("#textPrologueProgress"), textPrologueSkip: $("#textPrologueSkip"),
    title: $("#titleScreen"), cinematic: $("#cinematicScreen"), game: $("#gameScreen"), ending: $("#endingScreen"), world: $("#world"),
    start: $("#startButton"), cat: $("#cat"), firstPerson: $("#firstPersonView"), robot: $("#robot"), objectLayer: $("#objectLayer"),
    particles: $("#particles"), senseTrails: $("#senseTrails"), prompt: $("#proximityPrompt"),
    promptText: $("#promptText"), objective: $("#objective"), chapterIndex: $("#chapterIndex"),
    chapterName: $("#chapterName"), caption: $("#sceneCaption"), subtitle: $("#subtitle"),
    speaker: $("#speaker"), subtitleText: $("#subtitleText"), sound: $("#soundButton"), pause: $("#pauseButton"),
    pauseScreen: $("#pauseScreen"), pauseMenu: $("#pauseScreen .compact-panel"), chapterSelect: $("#chapterSelectPanel"), chapterSelectBack: $("#chapterSelectBack"), resume: $("#resumeButton"), restart: $("#restartButton"),
    settings: $("#settingsButton"), returnTitle: $("#returnTitleButton"),
    story: $("#storyOverlay"), storyIndex: $("#storyIndex"), storyTitle: $("#storyTitle"),
    storyText: $("#storyText"), storyNext: $("#storyNext"), puzzle: $("#puzzleOverlay"),
    puzzleStatus: $("#puzzleStatus"), puzzleClose: $("#puzzleClose"), signalPuzzle: $(".signal-puzzle"),
    endingBackdrop: $("#endingBackdrop"), endingEyebrow: $("#endingEyebrow"), endingTitle: $("#endingTitle"),
    endingText: $("#endingText"), endingQuote: $("#endingQuote"), replayFinal: $("#replayFinalButton"),
    replay: $("#replayButton"), stars: $(".ending-stars"), left: $("#leftButton"), right: $("#rightButton"),
    jump: $("#jumpButton"), action: $("#actionButton"), sense: $("#senseButton"),
    prologueVideo: $("#prologueVideo"), skipCinematic: $("#skipCinematic"), cinematicProgress: $("#cinematicProgress"),
    cinematicPrompt: $("#cinematicPrompt"), cinematicStep: $("#cinematicStep"), cinematicInstruction: $("#cinematicInstruction"),
    cinematicSubtext: $("#cinematicSubtext"), wakeHotspot: $("#wakeHotspot"), orbHotspot: $("#orbHotspot"),
    orbCounter: $("#orbCounter"), turbulenceQte: $("#turbulenceQte"), stabilityPercent: $("#stabilityPercent"),
    stabilityFill: $("#stabilityFill"), stabilityButton: $("#stabilityButton"), cinematicResult: $("#cinematicResult"),
    cinematicFlash: $("#cinematicFlash"), departure: $("#departureVideoScreen"), departureVideo: $("#departureVideo"),
    departureProgress: $("#departureVideoProgress"), skipDepartureVideo: $("#skipDepartureVideo"),
    departureLaunch: $("#departureLaunch"), departureStart: $("#departureStartButton")
  };

  const introSlides = [
    {
      title: "未记录的乱流",
      text: "遥远未来，人类沿折跃航道往返群星。\n一次普通货运任务，却撞上了不存在于星图中的时空乱流。",
      voice: "警告：航道坐标失效。"
    },
    {
      title: "飞船解体",
      text: "船体被瞬间撕裂。\n货物、生活用品与乘员的记忆信号被抛向不同空间。",
      voice: "救生舱已脱离……一定要活下去。"
    },
    {
      title: "失去名字",
      text: "休眠系统保护了小猫的身体，却没能保存它的记忆。\n醒来时，它甚至不记得自己的名字。",
      voice: "……别怕……我会找到你……"
    }
  ];

  const textProloguePages = [
    [
      "星际历二七四九年，人类借助“折跃航道”往返群星。",
      "橘猫米粒跟随主人登上一艘远航货船，第一次离开地球，前往遥远星区的新家。"
    ],
    [
      "一次普通运输途中，飞船撞上了从未被记录的时空乱流。",
      "船体在折跃中被撕裂，货物、生活用品与乘员的记忆信号被抛向不同空间。"
    ],
    [
      "最后一刻，主人将米粒送进救生休眠舱，自己却消失在断裂的船舱另一端。",
      "休眠系统保护了它的身体，却没能保存那些关于名字、陪伴与家的记忆。"
    ],
    [
      "当舱门再次开启，米粒不记得自己，也不记得那个一直呼唤它的人。",
      "只有那些散落的物品，还保留着熟悉的声音与气味。",
      "每一次触碰，都会让一段失落的过去重新亮起——也让回家的坐标更近一步。"
    ]
  ];

  const textPrologueBackgrounds = [
    "assets/images/prologue/intro-1.png",
    "assets/images/prologue/intro-2.png",
    "assets/images/prologue/intro-3.png",
    "assets/images/prologue/lost-home.png"
  ];

  const scenes = [
    {
      index: "01", name: "应急培育舱", code: "RECOVERY BAY / LOST SIGNAL", startX: 11,
      caption: "乱流之后",
      objects: [
        { id: "collar", x: 29, type: "memory", label: "触碰记忆锚点：项圈" },
        { id: "cable", x: 61, type: "scratch", label: "抓挠电缆" },
        { id: "door", x: 87, type: "door", label: "进入维修通道" }
      ]
    },
    {
      index: "02", name: "苔原七号", code: "TUNDRA-7 / GREEN CONCOURSE", startX: 8,
      caption: "没有人的花园",
      objects: [
        { id: "moduleA", x: 25, type: "module", label: "拾取维修模块", onlySense: true },
        { id: "robot", x: 51, type: "robot", label: "靠近灯泡" },
        { id: "moduleB", x: 72, type: "module", label: "拾取维修模块", onlySense: true },
        { id: "vent", x: 90, type: "door", label: "钻入通风管" }
      ]
    },
    {
      index: "03", name: "能源舱", code: "ESCAPE BAY / FINAL LINK", startX: 47,
      caption: "回家需要什么",
      objects: [
        { id: "plantChoice", x: 23, type: "ending", label: "抽取生态能源" },
        { id: "solar", x: 38, type: "solar", label: "检查太阳能阵列", onlySense: true },
        { id: "robotChoice", x: 65, type: "ending", label: "取出灯泡核心" },
        { id: "pod", x: 88, type: "door", label: "查看逃生艇" }
      ]
    }
  ];

  const endings = {
    alone: {
      eyebrow: "ENDING 01 / 独自归航", title: "越来越近，越来越远",
      text: "米粒把灯泡的核心装进逃生艇。舱门关闭前，最后一束橙色的光在身后熄灭。导航仪终于找到了家的方向，但副驾驶的位置永远安静。",
      quote: "项圈录音：回家的路很长。别忘了看看，谁在陪你走。",
      background: "assets/images/cargo-bay-clean.png", filter: "brightness(.34) saturate(.45) hue-rotate(-8deg)"
    },
    companion: {
      eyebrow: "ENDING 02 / 两颗星", title: "我们一起离开",
      text: "生态舱的光缓缓暗下。灯泡把最后一片叶子的影像存进记忆，而后飞到米粒身旁。逃生艇驶向星海，两颗微小的光并肩闪烁。",
      quote: "灯泡：目的地无法确认。同行者——已经确认。",
      background: "assets/images/tundra-seven-clean.png", filter: "brightness(.4) saturate(.65)"
    },
    true: {
      eyebrow: "ENDING 03 / 星光不熄", title: "把这里也变成家",
      text: "太阳能阵列重新朝向恒星。植物舒展叶片，灯泡亮起温暖的橙光，沉睡多年的航标再次发出信号。米粒没有立刻离开，却第一次真正听见了远方的回答。",
      quote: "主人：米粒，我听见你了。不要怕，我正在找你。",
      background: "assets/images/energy-bay.png", filter: "brightness(.56) saturate(.9) sepia(.06)"
    }
  };

  const state = {
    started: false, scene: 0, x: 11, direction: 1, moving: 0, jumping: false, sensing: false,
    paused: false, locked: false, muted: false, nearby: null, lastTime: performance.now(), lastStep: 0,
    intro: 0, textProloguePage: 0, textPrologueSentence: 0, textPrologueTimer: null, subtitleTimer: null, senseTimer: null, puzzle: [1, 3, 2], cinematicPhase: "idle",
    orbHits: 0, stability: 62, holdingStability: false, qteLast: 0, qteRaf: 0, cinematicFinished: false,
    flags: { heardCollar: false, scratchedCable: false, modules: new Set(), robotRepaired: false, puzzleSolved: false }
  };

  class AudioEngine {
    constructor() { this.ctx = null; this.master = null; this.drone = null; this.droneGain = null; this.outputLevel = .58; }
    start() {
      if (this.ctx) {
        if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
        return true;
      }
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return false;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = state.muted ? 0 : this.outputLevel;
      const compressor = this.ctx.createDynamicsCompressor();
      compressor.threshold.value = -18;
      compressor.knee.value = 16;
      compressor.ratio.value = 5;
      compressor.attack.value = .003;
      compressor.release.value = .22;
      this.master.connect(compressor); compressor.connect(this.ctx.destination);
      this.droneGain = this.ctx.createGain(); this.droneGain.gain.value = .022; this.droneGain.connect(this.master);
      this.drone = this.ctx.createOscillator(); this.drone.type = "sine"; this.drone.frequency.value = 54;
      const filter = this.ctx.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = 230;
      this.drone.connect(filter); filter.connect(this.droneGain); this.drone.start();
      if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
      return true;
    }
    setScene(index) {
      if (!this.ctx || !this.drone) return;
      const f = [54, 66, 47][index]; this.drone.frequency.exponentialRampToValueAtTime(f, this.ctx.currentTime + 1.2);
    }
    tone(freq = 440, duration = .12, type = "sine", volume = .08, delay = 0) {
      if (!this.start() || !this.ctx || state.muted) return;
      const startAt = this.ctx.currentTime + Math.max(0, delay);
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = type; o.frequency.value = freq; g.gain.setValueAtTime(.0001, startAt);
      g.gain.linearRampToValueAtTime(volume, startAt + .01);
      g.gain.exponentialRampToValueAtTime(.0001, startAt + duration);
      o.connect(g); g.connect(this.master); o.start(startAt); o.stop(startAt + duration + .02);
    }
    chime() { [0, .11, .24].forEach((d, i) => this.tone([392, 523, 659][i], .45, "sine", .07, d)); }
    error() { this.tone(145, .22, "sawtooth", .04); }
    step() { this.tone(105 + Math.random() * 18, .045, "triangle", .025); }
    meow() { this.tone(610, .18, "sine", .06); this.tone(430, .32, "sine", .055, .13); }
    ui(kind = "tap") {
      this.start();
      if (!this.ctx || state.muted) return;
      const voices = {
        tap: [430, 645, .052, .025],
        soft: [270, 405, .07, .022],
        confirm: [520, 780, .1, .034],
        back: [330, 220, .09, .028],
        hover: [760, 920, .032, .009]
      };
      const [first, second, duration, volume] = voices[kind] || voices.tap;
      this.tone(first, duration, "triangle", volume);
      this.tone(second, duration * .9, "sine", volume * .62, .022);
    }
    setMuted(muted) {
      if (!this.master || !this.ctx) return;
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.setTargetAtTime(muted ? 0 : this.outputLevel, this.ctx.currentTime, .018);
    }
  }
  const audio = new AudioEngine();
  window.startailAudio = {
    tone: (...args) => audio.tone(...args),
    ui: kind => audio.ui(kind),
    chime: () => audio.chime(),
    error: () => audio.error(),
    unlock: () => audio.start(),
    isMuted: () => state.muted
  };

  function initParticles() {
    el.particles.innerHTML = "";
    for (let i = 0; i < 24; i++) {
      const p = document.createElement("i"); p.className = "particle";
      const size = Math.random() * 2.2 + .7;
      p.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;width:${size}px;height:${size}px;--speed:${9+Math.random()*13}s;animation-delay:${-Math.random()*20}s`;
      el.particles.appendChild(p);
    }
  }

  function renderSenseTrails() {
    el.senseTrails.innerHTML = "";
    const targets = scenes[state.scene].objects.filter(o => o.onlySense || o.type === "memory");
    targets.forEach((obj, n) => {
      for (let i = 0; i < 4; i++) {
        const trail = document.createElement("i"); trail.className = "scent-trail";
        trail.style.cssText = `--sx:${obj.x - 13 + i * 5}%;--sy:${58 + ((i+n)%3)*5}%;--w:${9+i*2}%;--rot:${-14+i*8}deg;--color:${obj.type === "memory" ? "#f6c76a" : "#75f0ec"};animation-delay:${i*.14}s`;
        el.senseTrails.appendChild(trail);
      }
    });
  }

  function renderObjects() {
    el.objectLayer.innerHTML = "";
    scenes[state.scene].objects.forEach(obj => {
      const node = document.createElement("div");
      node.className = `world-object object-${obj.type}`; node.dataset.id = obj.id; node.style.setProperty("--x", `${obj.x}%`);
      if (isCompleted(obj.id)) node.classList.add("completed");
      node.innerHTML = `<i class="object-icon"></i>`; node.setAttribute("aria-label", obj.label);
      el.objectLayer.appendChild(node);
    });
    renderSenseTrails();
  }

  function isCompleted(id) {
    return (id === "collar" && state.flags.heardCollar) || (id === "cable" && state.flags.scratchedCable) ||
      ((id === "moduleA" || id === "moduleB") && state.flags.modules.has(id)) ||
      (id === "robot" && state.flags.robotRepaired) || (id === "solar" && state.flags.puzzleSolved);
  }

  function isAvailable(obj) {
    if (isCompleted(obj.id)) return false;
    if (obj.onlySense && !state.sensing) return false;
    if (state.scene === 1 && obj.id === "vent" && !state.flags.robotRepaired) return true;
    return true;
  }

  function updateFirstPersonCamera() {
    const cameraOffset = 50 - state.x;
    el.world.style.setProperty("--camera-offset", `${cameraOffset}%`);
    el.world.style.setProperty("--camera-bg-x", `${cameraOffset * .16}%`);
  }

  function animateFirstPerson(className, duration = 480) {
    el.world.classList.remove(className); void el.world.offsetWidth; el.world.classList.add(className);
    setTimeout(() => el.world.classList.remove(className), duration);
  }

  function setScene(index, immediate = false) {
    state.locked = true; state.scene = index; state.x = scenes[index].startX; state.nearby = null;
    const swap = () => {
      el.world.className = `world first-person scene-${index}${state.sensing ? " sensing" : ""}`;
      el.chapterIndex.textContent = scenes[index].index; el.chapterName.textContent = scenes[index].name;
      el.cat.style.left = `${state.x}%`; updateFirstPersonCamera(); renderObjects(); updateRobot(); updateObjective(); initParticles(); audio.setScene(index);
      showCaption(scenes[index].code, scenes[index].caption);
      setTimeout(() => { state.locked = false; }, 500);
    };
    if (immediate) swap();
    else { el.world.classList.add("scene-changing"); setTimeout(swap, 450); }
  }

  function showCaption(code, title) {
    el.caption.classList.remove("show"); void el.caption.offsetWidth;
    el.caption.innerHTML = `<small>${code}</small>${title}`; el.caption.classList.add("show");
  }

  function updateObjective() {
    let text = "";
    if (state.scene === 0) {
      text = !state.flags.heardCollar ? "找到记忆锚点：项圈" : !state.flags.scratchedCable ? "让门禁系统断电" : "穿过开启的维修门";
    } else if (state.scene === 1) {
      text = state.flags.modules.size < 2 ? `启动感知，寻找维修模块 ${state.flags.modules.size}/2` : !state.flags.robotRepaired ? "把模块带给受损的机器人" : "跟随灯泡，钻入通风管";
    } else text = "寻找第三种能源，或作出选择";
    el.objective.textContent = text;
  }

  function updateRobot() {
    if (state.scene === 0) { el.robot.hidden = true; return; }
    el.robot.hidden = false;
    el.robot.classList.toggle("damaged", state.scene === 1 && !state.flags.robotRepaired);
    el.robot.classList.toggle("trusting", state.flags.robotRepaired);
    if (state.scene === 1 && !state.flags.robotRepaired) { el.robot.style.left = "51%"; el.robot.style.bottom = "31%"; }
    else if (state.scene === 2) { el.robot.style.left = "65%"; el.robot.style.bottom = "27%"; }
  }

  function updateNearby() {
    if (state.locked || state.paused) { hidePrompt(); return; }
    const candidates = scenes[state.scene].objects.filter(isAvailable).map(obj => ({ obj, d: Math.abs(obj.x - state.x) })).filter(x => x.d < 7.2).sort((a,b) => a.d-b.d);
    state.nearby = candidates[0]?.obj || null;
    if (!state.nearby) { hidePrompt(); return; }
    el.prompt.hidden = false; el.prompt.style.left = `${50 + state.nearby.x - state.x}%`; el.promptText.textContent = state.nearby.label;
    el.action.querySelector("span").textContent = state.nearby.label.length > 5 ? "互动" : state.nearby.label;
  }

  function hidePrompt() { state.nearby = null; el.prompt.hidden = true; el.action.querySelector("span").textContent = "互动"; }

  function moveFrame(dt) {
    if (!state.started || state.paused || state.locked || state.jumping || !state.moving) { el.cat.classList.remove("cat-running"); el.world.classList.remove("fp-moving"); return; }
    state.direction = Math.sign(state.moving); state.x += state.moving * dt * .026;
    state.x = Math.max(5, Math.min(94, state.x)); el.cat.style.left = `${state.x}%`; updateFirstPersonCamera();
    el.cat.classList.add("cat-running"); el.cat.classList.toggle("is-left", state.direction < 0);
    el.world.classList.add("fp-moving"); el.world.classList.toggle("fp-moving-left", state.direction < 0); el.world.classList.toggle("fp-moving-right", state.direction > 0);
    const now = performance.now(); if (now - state.lastStep > 250) { audio.step(); state.lastStep = now; }
    if (state.flags.robotRepaired && state.scene === 1) el.robot.style.left = `${Math.max(5, Math.min(94, state.x - state.direction * 8))}%`;
  }

  function loop(now) {
    const dt = Math.min(40, now - state.lastTime); state.lastTime = now;
    moveFrame(dt); updateNearby(); requestAnimationFrame(loop);
  }

  function jump() {
    if (!state.started || state.paused || state.locked || state.jumping) return;
    state.jumping = true; el.cat.classList.remove("cat-running"); el.cat.classList.add("cat-jumping"); el.world.classList.remove("fp-moving"); el.world.classList.add("fp-jumping");
    audio.tone(220, .16, "triangle", .045); setTimeout(() => { el.cat.classList.remove("cat-jumping"); el.world.classList.remove("fp-jumping"); state.jumping = false; }, 710);
  }

  function setSense(on, timed = false) {
    if (!state.started || state.paused || state.locked) return;
    clearTimeout(state.senseTimer); state.sensing = on; el.world.classList.toggle("sensing", on); el.sense.classList.toggle("active", on);
    if (on) { audio.tone(280, .7, "sine", .035); audio.tone(560, .8, "sine", .02, .05); }
    if (timed && on) state.senseTimer = setTimeout(() => setSense(false), 4200);
    renderSenseTrails(); updateNearby();
  }

  function interact() {
    if (!state.nearby || state.locked || state.paused) { audio.error(); return; }
    animateFirstPerson("fp-interacting", 560);
    const id = state.nearby.id;
    if (id === "collar") hearCollar();
    else if (id === "cable") scratchCable();
    else if (id === "door") tryDoor();
    else if (id === "moduleA" || id === "moduleB") collectModule(id);
    else if (id === "robot") repairRobot();
    else if (id === "vent") enterVent();
    else if (id === "solar") openPuzzle();
    else if (id === "plantChoice") showDecision("companion");
    else if (id === "robotChoice") showDecision("alone");
    else if (id === "pod") showSubtitle("逃生艇", "能源不足。它只够带走米粒和一个选择。", 3600);
  }

  function hearCollar() {
    state.flags.heardCollar = true; audio.chime(); audio.meow(); renderObjects(); updateObjective();
    showSubtitle("项圈记忆", "一双温暖的手把你从纸箱里抱起。‘小家伙，以后你就叫米粒。’", 5600, true);
  }

  function scratchCable() {
    if (!state.flags.heardCollar) { showSubtitle("米粒", "空气里有刺鼻的电流味。它还在工作。", 2800); audio.error(); return; }
    state.locked = true; el.cat.classList.add("cat-scratching"); el.world.classList.add("fp-scratching");
    let hits = 0; const timer = setInterval(() => { audio.tone(95 + Math.random()*45, .08, "sawtooth", .035); hits++; if (hits >= 7) { clearInterval(timer); state.flags.scratchedCable = true; state.locked = false; el.cat.classList.remove("cat-scratching"); el.world.classList.remove("fp-scratching"); renderObjects(); updateObjective(); audio.chime(); showSubtitle("系统", "门禁供能中断。维修通道已释放。", 3000); } }, 170);
  }

  function tryDoor() {
    if (!state.flags.scratchedCable) { showSubtitle("门禁", "电流仍在门锁里跳动。也许可以让它停下来。", 3200); audio.error(); return; }
    audio.tone(170, .5, "triangle", .06); audio.tone(290, .7, "sine", .05, .18); setTimeout(() => setScene(1), 450);
  }

  function collectModule(id) {
    state.flags.modules.add(id); setSense(false); renderObjects(); updateObjective(); audio.chime();
    showSubtitle("米粒", state.flags.modules.size === 1 ? "沾着机油味的小零件。还有一块。" : "两块零件发出相同的嗡鸣。", 2800);
  }

  function repairRobot() {
    if (state.flags.modules.size < 2) { showSubtitle("受损机器人", "蓝白色的光断断续续。它像是在寻找什么。", 3200); audio.error(); return; }
    state.locked = true; el.cat.classList.add("cat-scratching"); el.world.classList.add("fp-scratching");
    showSubtitle("维修机器人", "配件识别……重启中……同行请求？", 4200, true);
    setTimeout(() => { state.flags.robotRepaired = true; state.locked = false; el.cat.classList.remove("cat-scratching"); el.world.classList.remove("fp-scratching"); updateRobot(); renderObjects(); updateObjective(); audio.chime(); }, 1800);
  }

  function enterVent() {
    if (!state.flags.robotRepaired) { showSubtitle("通风管", "里面太黑。独自进去的话，米粒看不清路。", 3000); audio.error(); return; }
    showSubtitle("灯泡", "照明已开启。米粒，跟紧我。", 2600, true); setTimeout(() => setScene(2), 700);
  }

  function showSubtitle(speaker, text, duration = 3200, speak = false) {
    clearTimeout(state.subtitleTimer); el.speaker.textContent = speaker; el.subtitleText.textContent = text; el.subtitle.hidden = false;
    if (speak && !state.muted && "speechSynthesis" in window) {
      speechSynthesis.cancel(); const utter = new SpeechSynthesisUtterance(text.replace(/……/g, "，")); utter.lang = "zh-CN"; utter.rate = .84; utter.pitch = speaker.includes("机器人") || speaker.includes("灯泡") ? .72 : 1.08; utter.volume = .55; speechSynthesis.speak(utter);
    }
    state.subtitleTimer = setTimeout(() => { el.subtitle.hidden = true; }, duration);
  }

  function showDecision(type) {
    const companion = type === "companion";
    const overlay = document.createElement("section"); overlay.className = "overlay-screen decision-overlay";
    overlay.innerHTML = `<div class="panel compact-panel"><div class="eyebrow">ENERGY TRANSFER / IRREVERSIBLE</div><h2>${companion ? "抽取生态能源？" : "取出灯泡核心？"}</h2><p style="color:#a8b6c9;line-height:1.8;font-size:13px;margin:-12px 0 28px">${companion ? "植物会失去维生能源，灯泡可以与你一起离开。" : "灯泡会永久关闭，逃生艇将获得足够能源。"}</p><button class="primary-button confirm-decision" type="button">确认选择</button><br><button class="text-button cancel-decision" type="button">再想一想</button></div>`;
    document.body.appendChild(overlay); state.paused = true;
    overlay.querySelector(".cancel-decision").addEventListener("click", () => { state.paused = false; overlay.remove(); });
    overlay.querySelector(".confirm-decision").addEventListener("click", () => { state.paused = false; overlay.remove(); showEnding(type); });
  }

  function openPuzzle() {
    if (state.flags.puzzleSolved) return;
    state.paused = true; el.puzzle.hidden = false; updatePuzzle(); audio.tone(330, .4, "sine", .05);
  }

  function updatePuzzle() {
    $$(".signal-ring").forEach((ring, i) => ring.style.setProperty("--angle", `${state.puzzle[i]*90}deg`));
    const aligned = state.puzzle.filter(v => v === 0).length; el.puzzleStatus.textContent = `同步率 ${18 + aligned * 27}%`;
    if (aligned === 3) {
      el.signalPuzzle.classList.add("solved"); el.puzzleStatus.textContent = "同步率 100% · 航标重新上线"; audio.chime();
      state.flags.puzzleSolved = true; renderObjects();
      setTimeout(() => { el.puzzle.hidden = true; state.paused = false; showSubtitle("远距离信号", "……米粒……我听见你了……", 3800, true); setTimeout(() => showEnding("true"), 2400); }, 1200);
    }
  }

  function showEnding(type) {
    const ending = endings[type]; state.locked = true; setSense(false); if ("speechSynthesis" in window) speechSynthesis.cancel();
    el.game.classList.remove("is-active"); el.endingBackdrop.style.backgroundImage = `url("${ending.background}")`; el.endingBackdrop.style.filter = ending.filter;
    el.endingEyebrow.textContent = ending.eyebrow; el.endingTitle.textContent = ending.title; el.endingText.textContent = ending.text; el.endingQuote.textContent = ending.quote;
    makeEndingStars(); setTimeout(() => el.ending.classList.add("is-active"), 80);
    audio.setScene(type === "true" ? 1 : 0); if (type === "true") audio.chime(); else audio.tone(196, 1.4, "sine", .045);
    try { const found = new Set(JSON.parse(localStorage.getItem("startail-endings") || "[]")); found.add(type); localStorage.setItem("startail-endings", JSON.stringify([...found])); } catch (_) {}
  }

  function makeEndingStars() {
    el.stars.innerHTML = "";
    for (let i = 0; i < 42; i++) { const s = document.createElement("i"); s.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;--speed:${1+Math.random()*3}s;animation-delay:${-Math.random()*3}s`; el.stars.appendChild(s); }
  }

  function resetGame(finalOnly = false) {
    el.ending.classList.remove("is-active"); el.title.classList.remove("is-active"); el.game.classList.add("is-active");
    state.started = true; state.paused = false; state.locked = false; state.moving = 0; state.sensing = false; state.puzzle = [1,3,2]; el.signalPuzzle.classList.remove("solved");
    if (finalOnly) {
      state.flags = { heardCollar: true, scratchedCable: true, modules: new Set(["moduleA","moduleB"]), robotRepaired: true, puzzleSolved: false };
      setScene(2, true); showSubtitle("灯泡", "我们还有一次选择。", 2400, true);
    } else {
      state.flags = { heardCollar: false, scratchedCable: false, modules: new Set(), robotRepaired: false, puzzleSolved: false };
      setScene(0, true);
    }
  }

  function cinematicFlash() {
    el.cinematicFlash.classList.remove("flash"); void el.cinematicFlash.offsetWidth; el.cinematicFlash.classList.add("flash");
  }

  function setCinematicPrompt(step, instruction, subtext) {
    el.cinematicStep.textContent = step; el.cinematicInstruction.textContent = instruction; el.cinematicSubtext.textContent = subtext;
    el.cinematicPrompt.hidden = false; el.cinematic.classList.add("awaiting");
  }

  function hideCinematicPrompt() {
    el.cinematicPrompt.hidden = true; el.cinematic.classList.remove("awaiting");
  }

  const textPrologueTiming = { sentence: 2500, hold: 2800, fade: 1000 };

  function updateTextPrologueProgress() {
    while (el.textPrologueProgress.children.length < textProloguePages.length) el.textPrologueProgress.appendChild(document.createElement("i"));
    [...el.textPrologueProgress.children].forEach((dot, index) => {
      dot.classList.toggle("is-active", index === state.textProloguePage);
      dot.classList.toggle("is-done", index < state.textProloguePage);
    });
  }

  function scheduleTextPrologue() {
    clearTimeout(state.textPrologueTimer);
    const page = textProloguePages[state.textProloguePage];
    if (state.textPrologueSentence < page.length - 1) {
      state.textPrologueTimer = setTimeout(() => {
        state.textPrologueSentence++;
        el.textPrologueLine.children[state.textPrologueSentence]?.classList.add("is-visible");
        scheduleTextPrologue();
      }, textPrologueTiming.sentence);
      return;
    }
    state.textPrologueTimer = setTimeout(advanceTextProloguePage, textPrologueTiming.hold);
  }

  function renderTextProloguePage() {
    clearTimeout(state.textPrologueTimer);
    const copy = el.textPrologueLine.parentElement;
    const page = textProloguePages[state.textProloguePage];
    el.textPrologueLine.replaceChildren(...page.map(text => {
      const sentence = document.createElement("span");
      sentence.textContent = text;
      return sentence;
    }));
    state.textPrologueSentence = 0;
    el.textPrologue.style.setProperty("--prologue-bg", `url("${textPrologueBackgrounds[state.textProloguePage]}")`);
    el.textPrologueKicker.textContent = "";
    updateTextPrologueProgress();
    copy.classList.remove("is-leaving", "is-page-enter");
    void copy.offsetWidth;
    copy.classList.add("is-visible", "is-page-enter");
    requestAnimationFrame(() => el.textPrologueLine.children[0]?.classList.add("is-visible"));
    scheduleTextPrologue();
  }

  function advanceTextProloguePage() {
    clearTimeout(state.textPrologueTimer);
    const copy = el.textPrologueLine.parentElement;
    copy.classList.add("is-leaving");
    state.textPrologueTimer = setTimeout(() => {
      if (state.textProloguePage >= textProloguePages.length - 1) finishTextPrologue();
      else {
        state.textProloguePage++;
        renderTextProloguePage();
      }
    }, textPrologueTiming.fade);
  }

  function startTextPrologue() {
    audio.start();
    state.textProloguePage = 0;
    state.textPrologueSentence = 0;
    el.textPrologueLine.replaceChildren();
    el.title.classList.remove("is-active");
    el.textPrologue.classList.add("is-active");
    renderTextProloguePage();
  }

  function advanceTextPrologue() {
    clearTimeout(state.textPrologueTimer);
    const page = textProloguePages[state.textProloguePage];
    if (state.textPrologueSentence < page.length - 1) {
      state.textPrologueSentence++;
      el.textPrologueLine.children[state.textPrologueSentence]?.classList.add("is-visible");
      scheduleTextPrologue();
      return;
    }
    advanceTextProloguePage();
  }

  function finishTextPrologue() {
    clearTimeout(state.textPrologueTimer);
    el.textPrologue.classList.remove("is-active");
    startCinematic();
  }

  function startCinematic() {
    state.cinematicFinished = false; state.cinematicPhase = "opening"; state.orbHits = 0; state.stability = 62; state.holdingStability = false;
    el.cinematic.dataset.phase = "opening";
    el.title.classList.remove("is-active"); el.cinematic.classList.add("is-active");
    el.wakeHotspot.hidden = true; el.orbHotspot.hidden = true; el.turbulenceQte.hidden = true; el.cinematicResult.hidden = true;
    el.cinematicProgress.style.width = "0%"; hideCinematicPrompt();
    el.prologueVideo.currentTime = 0; el.prologueVideo.muted = state.muted;
    const play = el.prologueVideo.play();
    if (play?.catch) play.catch(() => setCinematicPrompt("PLAY", "点击画面开始序章", "浏览器阻止了自动播放"));
  }

  function onCinematicTime() {
    const video = el.prologueVideo;
    if (Number.isFinite(video.duration) && video.duration > 0) el.cinematicProgress.style.width = `${Math.min(100, video.currentTime / video.duration * 100)}%`;
    if (state.cinematicPhase === "opening" && video.currentTime >= 2.82) {
      video.pause(); state.cinematicPhase = "wake"; el.cinematic.dataset.phase = "wake"; setCinematicPrompt("第一步 · 苏醒", "轻触舱壁，唤醒小猫", "休眠舱外传来不属于引擎的震动"); el.wakeHotspot.hidden = false;
    } else if (state.cinematicPhase === "afterWake" && video.currentTime >= 5.08) {
      video.pause(); state.cinematicPhase = "chase"; el.cinematic.dataset.phase = "chase"; state.orbHits = 0; el.orbCounter.textContent = "0 / 3";
      setCinematicPrompt("第二步 · 追逐", "连续触碰漂浮光球", "身体仍记得如何追逐，记忆却一片空白"); el.orbHotspot.hidden = false;
    } else if (state.cinematicPhase === "afterChase" && video.currentTime >= 7.55) {
      beginTurbulence();
    } else if (state.cinematicPhase === "turbulence" && video.currentTime >= 13.58) {
      finishTurbulence();
    }
  }

  function wakeCat() {
    if (state.cinematicPhase !== "wake") return;
    el.wakeHotspot.classList.add("hit"); hideCinematicPrompt(); state.cinematicPhase = "afterWake"; el.cinematic.dataset.phase = "after-wake";
    setTimeout(() => { el.wakeHotspot.hidden = true; el.wakeHotspot.classList.remove("hit"); el.prologueVideo.play(); }, 720);
  }

  function chaseOrb() {
    if (state.cinematicPhase !== "chase") return;
    state.orbHits++; el.orbCounter.textContent = `${state.orbHits} / 3`; el.orbHotspot.classList.add("hit");
    const positions = [[29,59],[33,53],[27,61]];
    setTimeout(() => {
      el.orbHotspot.classList.remove("hit");
      if (state.orbHits < 3) {
        const [left,top] = positions[state.orbHits]; el.orbHotspot.style.left = `${left}%`; el.orbHotspot.style.top = `${top}%`;
      } else {
        el.orbHotspot.hidden = true; hideCinematicPrompt(); cinematicFlash(); state.cinematicPhase = "afterChase"; el.cinematic.dataset.phase = "after-chase"; el.prologueVideo.play();
      }
    }, 280);
  }

  function updateStability() {
    const value = Math.round(state.stability); el.stabilityPercent.textContent = `${value}%`; el.stabilityFill.style.width = `${value}%`;
    el.stabilityPercent.style.color = value < 25 ? "#f25aa6" : value < 55 ? "#f6c76a" : "#75f0ec";
  }

  function beginTurbulence() {
    state.cinematicPhase = "turbulence"; state.stability = 62; state.holdingStability = false; state.qteLast = performance.now();
    el.cinematic.dataset.phase = "turbulence";
    el.turbulenceQte.hidden = false; el.stabilityButton.classList.remove("retry");
    el.stabilityButton.innerHTML = "<span>按住抵抗乱流</span><small>长按空格</small>";
    setCinematicPrompt("第三步 · 稳定", "保持休眠舱稳定", "长按按钮或空格，抵抗不断增强的乱流");
    el.cinematic.classList.remove("awaiting"); el.prologueVideo.play(); updateStability(); state.qteRaf = requestAnimationFrame(stabilityLoop);
  }

  function stabilityLoop(now) {
    if (state.cinematicPhase !== "turbulence") return;
    const dt = Math.min(.06, (now - state.qteLast) / 1000); state.qteLast = now;
    state.stability += (state.holdingStability ? 17 : -10.5) * dt; state.stability = Math.max(0, Math.min(100, state.stability)); updateStability();
    state.qteRaf = requestAnimationFrame(stabilityLoop);
  }

  function setStabilityHold(on) {
    if (state.cinematicPhase === "qteFail" && on) { retryTurbulence(); return; }
    if (state.cinematicPhase !== "turbulence") return;
    state.holdingStability = on; el.stabilityButton.classList.toggle("holding", on);
  }

  function finishTurbulence() {
    cancelAnimationFrame(state.qteRaf); state.holdingStability = false; el.stabilityButton.classList.remove("holding");
    if (state.stability < 25) {
      state.cinematicPhase = "qteFail"; el.prologueVideo.pause(); el.stabilityButton.classList.add("retry");
      el.stabilityButton.innerHTML = "<span>信号丢失 · 点击重试</span><small>重新稳定</small>";
      setCinematicPrompt("信号中断", "休眠系统即将失效", "重新抵抗乱流，保持在标记线以上"); return;
    }
    state.cinematicPhase = "aftermath"; el.turbulenceQte.hidden = true; hideCinematicPrompt(); el.cinematicResult.hidden = false; cinematicFlash();
    el.prologueVideo.play(); setTimeout(() => { el.cinematicResult.hidden = true; }, 1600);
  }

  function retryTurbulence() {
    state.cinematicPhase = "turbulence"; state.stability = 62; state.holdingStability = false; state.qteLast = performance.now();
    el.stabilityButton.classList.remove("retry"); el.stabilityButton.innerHTML = "<span>按住抵抗乱流</span><small>长按空格</small>";
    el.prologueVideo.currentTime = 7.55; el.prologueVideo.play(); updateStability();
    setCinematicPrompt("第三步 · 稳定", "保持休眠舱稳定", "长按按钮或空格，抵抗不断增强的乱流"); el.cinematic.classList.remove("awaiting");
    state.qteRaf = requestAnimationFrame(stabilityLoop);
  }

  function finishCinematic() {
    if (state.cinematicFinished) return;
    state.cinematicFinished = true; cancelAnimationFrame(state.qteRaf); state.holdingStability = false; el.prologueVideo.pause();
    el.cinematic.classList.remove("is-active", "awaiting");
    startDepartureVideo();
  }

  function startDepartureVideo() {
    state.started = false; state.paused = false; state.moving = 0; state.locked = false;
    el.departure.classList.add("is-active"); el.departure.classList.remove("is-finished");
    el.departureLaunch.hidden = true; el.skipDepartureVideo.hidden = false; el.departureProgress.style.width = "0%";
    el.departureVideo.currentTime = 0; el.departureVideo.muted = state.muted;
    const play = el.departureVideo.play();
    if (play?.catch) play.catch(() => {
      el.departureVideo.muted = true;
      el.departureVideo.play().catch(showDepartureLaunch);
    });
  }

  function updateDepartureProgress() {
    const video = el.departureVideo;
    if (Number.isFinite(video.duration) && video.duration > 0) {
      el.departureProgress.style.width = `${Math.min(100, video.currentTime / video.duration * 100)}%`;
    }
  }

  function showDepartureLaunch() {
    el.departureVideo.pause();
    el.departure.classList.add("is-finished");
    el.skipDepartureVideo.hidden = true;
    el.departureLaunch.hidden = false;
    el.departureProgress.style.width = "100%";
  }

  function enterFirstChapterFromDeparture() {
    el.departureVideo.pause();
    el.departure.classList.remove("is-active", "is-finished");
    el.departureLaunch.hidden = true;
    el.game.classList.add("is-active");
    window.__starTailActiveChapter = 1;
    state.started = true; state.paused = false; audio.start(); setScene(0, true); audio.meow();
    window.dispatchEvent(new CustomEvent("startail:chapter-select", { detail: { chapter: 1 } }));
    window.dispatchEvent(new CustomEvent("startail:chapter-enter", { detail: { chapter: 1 } }));
    setTimeout(() => showSubtitle("未知声音", "……别怕……我会找到你……", 3400, true), 700);
  }

  function startIntro() {
    audio.start(); state.intro = 0; el.story.hidden = false; showIntroSlide();
  }
  function showIntroSlide() {
    const s = introSlides[state.intro]; el.storyIndex.textContent = `记忆 ${String(state.intro+1).padStart(2,"0")} / 03`; el.storyTitle.textContent = s.title; el.storyText.textContent = s.text;
    el.storyNext.textContent = state.intro === introSlides.length - 1 ? "醒来" : "继续";
    showSubtitle("主人", s.voice, 2800, state.intro > 0);
  }
  function nextIntro() {
    if (state.intro < introSlides.length - 1) { state.intro++; showIntroSlide(); return; }
    el.story.hidden = true; el.title.classList.remove("is-active"); el.game.classList.add("is-active"); state.started = true; setScene(0, true); audio.meow();
  }

  function setPaused(on) {
    if (!state.started || el.ending.classList.contains("is-active")) return;
    state.paused = on; el.pauseScreen.hidden = !on; if (on) state.moving = 0; else closeChapterSelect();
  }

  function openChapterSelect() {
    if (!state.started) return;
    state.moving = 0; state.paused = true;
    el.pauseMenu.hidden = true; el.chapterSelect.hidden = false;
    el.chapterSelect.querySelector("[data-chapter='1']")?.focus();
  }

  function closeChapterSelect() {
    if (!el.chapterSelect || el.chapterSelect.hidden) return;
    el.chapterSelect.hidden = true; el.pauseMenu.hidden = false;
  }

  function startSelectedChapter(chapter) {
    closeChapterSelect();
    state.paused = false; state.started = true; state.locked = false; state.moving = 0; state.sensing = false;
    el.world.classList.remove("sensing"); el.pauseScreen.hidden = true; el.game.classList.add("is-active");
    window.__starTailActiveChapter = chapter;
    if (chapter === 1) setScene(0, true);
    window.dispatchEvent(new CustomEvent("startail:chapter-select", { detail: { chapter } }));
    window.dispatchEvent(new CustomEvent("startail:chapter-enter", { detail: { chapter } }));
  }

  function returnToTitle() {
    state.paused = false; state.started = false; state.locked = false; state.moving = 0; state.sensing = false;
    el.pauseScreen.hidden = true; el.story.hidden = true; el.puzzle.hidden = true;
    el.cinematic.classList.remove("is-active", "awaiting"); el.departure.classList.remove("is-active", "is-finished");
    el.game.classList.remove("is-active"); el.ending.classList.remove("is-active");
    el.title.classList.add("is-active"); el.prologueVideo.pause(); el.departureVideo.pause();
    if (document.pointerLockElement) document.exitPointerLock();
    if ("speechSynthesis" in window) speechSynthesis.cancel();
  }

  function bindHold(button, value) {
    const down = e => { e.preventDefault(); if (!state.paused) state.moving = value; };
    const up = e => { e.preventDefault(); if (state.moving === value) state.moving = 0; };
    button.addEventListener("pointerdown", down); button.addEventListener("pointerup", up); button.addEventListener("pointercancel", up); button.addEventListener("pointerleave", up);
  }

  function bindButtonAudio() {
    const soundKind = button => {
      if (button.matches("#startButton,#departureStartButton,#chapter3dEnter,#chapter3dMemoryContinue,#chapter3dNext,#chapter3dBridgeStart,#later3dEnter,#later3dMemoryContinue,#later3dCommunicatorContinue,#later3dNext,#later3dBridgeStart,#later3dFinalStart,#storyNext,#puzzleClose,#chapter3dTouchInteract,#later3dInteract,.chapter-select-card,.confirm-decision,.primary-button")) return "confirm";
      if (button.matches("#pauseButton,#resumeButton,#soundButton,#settingsButton,#skipCinematic,#skipDepartureVideo,#textPrologueSkip,#chapter3dBridgeSkip,#later3dBridgeSkip,#chapter3dTouchSense,#later3dSense")) return "soft";
      if (button.matches("#returnTitleButton,#restartButton,#replayButton,#chapter3dReplay,#later3dReplay,#later3dFinalReplay,#later3dFinalChapters,#later3dFinalReturn,.cancel-decision")) return "back";
      return "tap";
    };
    document.addEventListener("pointerdown", event => {
      const button = event.target.closest?.("button");
      if (!button || button.disabled) return;
      if (button.matches("#soundButton,#settingsButton")) return;
      audio.ui(soundKind(button));
    }, true);
    document.addEventListener("keydown", event => {
      if (event.repeat || !["Enter", " "].includes(event.key)) return;
      const button = event.target.closest?.("button");
      if (button && !button.disabled && !button.matches("#soundButton,#settingsButton")) audio.ui(soundKind(button));
    }, true);
    document.addEventListener("pointerover", event => {
      if (!audio.ctx || state.muted || !matchMedia("(pointer:fine)").matches) return;
      const button = event.target.closest?.("button");
      if (!button || button.disabled || button.contains(event.relatedTarget)) return;
      audio.ui("hover");
    }, true);
  }

  function syncSoundState() {
    el.sound.classList.toggle("muted", state.muted);
    el.sound.setAttribute("aria-label", state.muted ? "开启声音" : "关闭声音");
    el.settings.setAttribute("aria-label", state.muted ? "设置：声音已关闭" : "设置：声音已开启");
    audio.setMuted(state.muted);
  }

  function toggleSound() {
    if (state.muted) {
      state.muted = false;
      syncSoundState();
      audio.ui("confirm");
      return;
    }
    audio.ui("soft");
    window.setTimeout(() => {
      state.muted = true;
      syncSoundState();
      if ("speechSynthesis" in window) speechSynthesis.cancel();
    }, 90);
  }

  function bindEvents() {
    bindButtonAudio();
    el.start.addEventListener("click", startTextPrologue); el.storyNext.addEventListener("click", nextIntro);
    el.textPrologueSkip.addEventListener("click", finishTextPrologue);
    el.prologueVideo.addEventListener("timeupdate", onCinematicTime); el.prologueVideo.addEventListener("ended", finishCinematic);
    el.skipCinematic.addEventListener("click", finishCinematic); el.wakeHotspot.addEventListener("click", wakeCat); el.orbHotspot.addEventListener("click", chaseOrb);
    el.departureVideo.addEventListener("timeupdate", updateDepartureProgress); el.departureVideo.addEventListener("ended", showDepartureLaunch);
    el.skipDepartureVideo.addEventListener("click", showDepartureLaunch); el.departureStart.addEventListener("click", enterFirstChapterFromDeparture);
    el.stabilityButton.addEventListener("pointerdown", e => { e.preventDefault(); setStabilityHold(true); });
    ["pointerup","pointercancel","pointerleave"].forEach(type => el.stabilityButton.addEventListener(type, e => { e.preventDefault(); setStabilityHold(false); }));
    el.jump.addEventListener("click", jump); el.action.addEventListener("click", interact);
    el.sense.addEventListener("click", () => setSense(!state.sensing, !state.sensing));
    bindHold(el.left, -1); bindHold(el.right, 1);
    el.pause.addEventListener("click", () => setPaused(true)); el.resume.addEventListener("click", () => setPaused(false));
    el.restart.addEventListener("click", event => { event.stopImmediatePropagation(); openChapterSelect(); });
    el.chapterSelectBack.addEventListener("click", closeChapterSelect);
    $$(".chapter-select-card").forEach(card => card.addEventListener("click", () => startSelectedChapter(Number(card.dataset.chapter))));
    el.settings.addEventListener("click", toggleSound);
    el.returnTitle.addEventListener("click", returnToTitle);
    el.sound.addEventListener("click", toggleSound);
    el.puzzleClose.addEventListener("click", () => { el.puzzle.hidden = true; state.paused = false; });
    $$(".signal-ring").forEach((ring, i) => ring.addEventListener("click", () => { if (state.flags.puzzleSolved) return; state.puzzle[i] = (state.puzzle[i] + 1) % 4; audio.tone(240 + i*100, .16, "triangle", .04); updatePuzzle(); }));
    el.replayFinal.addEventListener("click", () => resetGame(true)); el.replay.addEventListener("click", () => resetGame(false));
    window.addEventListener("keydown", e => {
      if (["ArrowLeft","ArrowRight","Space"].includes(e.code)) e.preventDefault();
      if (el.textPrologue.classList.contains("is-active")) {
        if (["ArrowRight","Enter","Space"].includes(e.code) && !e.repeat) { audio.ui("confirm"); advanceTextPrologue(); }
        if (e.code === "Escape") { audio.ui("back"); finishTextPrologue(); }
        return;
      }
      if (el.departure.classList.contains("is-active")) {
        if (["Enter","Space"].includes(e.code) && !e.repeat) {
          audio.ui("confirm");
          if (el.departureLaunch.hidden) showDepartureLaunch(); else enterFirstChapterFromDeparture();
        }
        if (e.code === "Escape") { audio.ui("soft"); showDepartureLaunch(); }
        return;
      }
      if (e.repeat && ["KeyE","Space"].includes(e.code)) return;
      if (e.code === "ArrowLeft" || e.code === "KeyA") state.moving = -1;
      if (e.code === "ArrowRight" || e.code === "KeyD") state.moving = 1;
      if (e.code === "Space" && el.cinematic.classList.contains("is-active")) setStabilityHold(true); else if (e.code === "Space") jump();
      if (e.code === "KeyE") interact();
      if (e.code === "ShiftLeft" || e.code === "ShiftRight") setSense(true);
      if (e.code === "Escape") { audio.ui(state.paused ? "confirm" : "soft"); setPaused(!state.paused); }
    });
    window.addEventListener("keyup", e => {
      if ((e.code === "ArrowLeft" || e.code === "KeyA") && state.moving < 0) state.moving = 0;
      if ((e.code === "ArrowRight" || e.code === "KeyD") && state.moving > 0) state.moving = 0;
      if (e.code === "Space" && el.cinematic.classList.contains("is-active")) setStabilityHold(false);
      if (e.code === "ShiftLeft" || e.code === "ShiftRight") setSense(false);
    });
    window.addEventListener("blur", () => { state.moving = 0; setStabilityHold(false); if (state.started && !state.paused && !el.ending.classList.contains("is-active")) setPaused(true); });
  }

  function preloadImage(src) {
    return new Promise(resolve => {
      const image = new Image();
      image.onload = image.onerror = resolve;
      image.src = src;
    });
  }

  function startLoading() {
    const sources = [
      ...textPrologueBackgrounds,
      "assets/images/title-cat-3d.png",
      "assets/images/cargo-bay-clean.png",
      "assets/images/tundra-seven-clean.png",
      "assets/images/energy-bay.png",
      "assets/images/first-person-paws.png",
      "assets/ui/cat-punk-sprites.png",
      "assets/ui/title-wordmark.png",
      "assets/video/scene-01/scene-01-poster.jpg",
      "assets/video/scene-01/keyframes/01-calm.png",
      "assets/images/keyframes/title-hangar.png",
      "assets/images/keyframes/corridor-first-person.png",
      "assets/images/keyframes/sense-trail.png",
      "assets/images/keyframes/final-choice.png",
      "assets/images/keyframes/pause-menu.png"
    ];
    const startedAt = performance.now();
    let resourcesReady = false;
    let displayed = 0;

    const readyTasks = [Promise.allSettled(sources.map(preloadImage))];
    if (document.fonts && document.fonts.ready) readyTasks.push(document.fonts.ready.catch(() => {}));
    Promise.race([
      Promise.allSettled(readyTasks),
      new Promise(resolve => setTimeout(resolve, 3200))
    ]).then(() => { resourcesReady = true; });

    const statusFor = value => {
      if (value < 28) return "正在校准休眠舱信号";
      if (value < 58) return "正在同步星图坐标";
      if (value < 86) return "正在唤醒舱内系统";
      if (value < 100) return "正在确认回家方向";
      return "导航系统已就绪";
    };

    const tick = now => {
      const elapsed = now - startedAt;
      const holdingTarget = Math.min(92, 8 + elapsed / 19);
      const target = resourcesReady && elapsed > 1350 ? 100 : holdingTarget;
      displayed += (target - displayed) * (target === 100 ? .13 : .075);
      if (target === 100 && 100 - displayed < .45) displayed = 100;
      const value = Math.max(0, Math.min(100, Math.round(displayed)));
      el.loadingFill.style.width = `${value}%`;
      el.loadingPercent.textContent = `${value}%`;
      el.loadingText.textContent = statusFor(value);

      if (displayed >= 100) {
        el.loading.classList.add("is-leaving");
        setTimeout(() => { el.title.classList.add("is-active"); }, 700);
        setTimeout(() => {
          el.loading.classList.remove("is-active");
          el.loading.hidden = true;
        }, 760);
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  bindEvents(); initParticles(); renderObjects(); startLoading(); requestAnimationFrame(loop);
})();
