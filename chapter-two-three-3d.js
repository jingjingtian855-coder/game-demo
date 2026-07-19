import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import bulbRobotUrl from "./assets/models/ue5-source/SM_BulbRobot.glb";
import ecologyPodUrl from "./assets/models/ue5-source/SM_EcologyPod.glb";
import energyCoreUrl from "./assets/models/ue5-source/SM_EnergyCore.glb";

(() => {
  "use strict";

  const gameScreen = document.querySelector("#gameScreen");
  if (!gameScreen) return;

  const root = document.createElement("div");
  root.id = "chapterLater3d";
  root.hidden = true;
  root.innerHTML = `
    <canvas class="later3d-canvas" aria-label="星尾归航三维探索地图"></canvas>
    <div class="later3d-grade" aria-hidden="true"></div>
    <section id="port2d" class="port2d" aria-label="第二章横版探索关卡" hidden>
      <div class="port2d-sky"><i class="port2d-moon"></i><i class="port2d-rain rain-a"></i><i class="port2d-rain rain-b"></i><i class="port2d-rain rain-c"></i></div>
      <div class="port2d-city" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
      <div id="port2dWorld" class="port2d-world">
        <div class="port2d-ground"><i></i></div>
        <div class="port2d-platform platform-a"></div><div class="port2d-platform platform-b"></div><div class="port2d-platform platform-c"></div>
        <div class="port2d-crane"><i></i><b></b></div>
        <div id="port2dCat" class="port2d-cat" aria-label="米粒"><i class="cat-ear ear-left"></i><i class="cat-ear ear-right"></i><i class="cat-eye eye-left"></i><i class="cat-eye eye-right"></i><i class="cat-nose"></i><i class="cat-tail"></i></div>
        <button id="port2dFeather0" class="port2d-feather" type="button" aria-label="第一束光羽"><i></i></button>
        <button id="port2dFeather1" class="port2d-feather" type="button" aria-label="第二束光羽" hidden><i></i></button>
        <button id="port2dFeather2" class="port2d-feather" type="button" aria-label="第三束光羽" hidden><i></i></button>
      </div>
      <p class="port2d-tip">左右移动 · 空格跳跃 · 碰到光羽即可收集</p>
    </section>
    <div class="later3d-hud">
      <section class="later3d-objective"><small id="later3dKicker">第二章 · 百目港</small><strong id="later3dObjective"></strong><div id="later3dSteps" class="later3d-steps"><i></i><i></i><i></i></div></section>
      <div class="later3d-status"><span id="later3dMode">追踪模式</span><b id="later3dAlert"></b></div>
    </div>
    <div class="later3d-crosshair" aria-hidden="true"><i></i></div>
    <div id="later3dPrompt" class="later3d-prompt" hidden><kbd>按 E</kbd><span>互动</span></div>
    <div id="later3dProgress" class="later3d-progress" hidden><i></i><span></span></div>
    <div id="later3dToast" class="later3d-toast" aria-live="polite"></div>
    <section id="later3dMemory" class="later3d-memory" hidden>
      <article>
        <small id="later3dMemoryKicker"></small><h2 id="later3dMemoryTitle"></h2><p id="later3dMemoryText"></p>
        <button id="later3dMemoryContinue" type="button">收起记忆 · 继续前行</button>
      </article>
    </section>
    <section id="later3dCommunicatorMemory" class="later3d-memory later3d-communicator-memory" hidden>
      <article><img src="assets/images/communicator-memory.png" alt="破碎飞船残骸间漂浮的远距通讯器" /><div><small>通讯器记录 · 最后一段声音</small><h2>不要害怕</h2><p>“米粒，看着我。”<br>“别害怕。”<br><br>飞船结构开始解体。<br><br>“不是不要你。”<br>“是要你活下去。”<br><br>救生舱被弹出。<br>林澈留在即将解体的驾驶舱中，启动远距离求救信标。<br>最后一段声音传入项圈：<br>“往亮的地方走。”<br>“我会找到你。”</p><button id="later3dCommunicatorContinue" type="button">收起通讯器 · 继续前行</button></div></article>
    </section>
    <section id="later3dGate" class="later3d-gate">
      <div><small id="later3dGateKicker"></small><h2 id="later3dGateTitle"></h2><p id="later3dGateHint">鼠标控制视角 · W A S D 移动 · 空格跳跃 · Q 感知 · E 互动</p><button id="later3dEnter" type="button">进入场景</button></div>
    </section>
    <section id="later3dComplete" class="later3d-complete" hidden>
      <div><small id="later3dCompleteKicker"></small><h2 id="later3dCompleteTitle"></h2><p id="later3dCompleteText"></p><button id="later3dNext" type="button"></button><button id="later3dReplay" class="later3d-replay" type="button">重新游玩本章</button></div>
    </section>
    <section class="chapter3d-bridge" id="later3dBridge" aria-label="第二章到第三章过场" hidden>
      <video id="later3dBridgeVideo" preload="auto" playsinline><source src="assets/video/chapter-bridge/chapter-2-to-3.mp4" type="video/mp4" /></video>
      <div class="chapter3d-bridge-shade" aria-hidden="true"></div>
      <header class="chapter3d-bridge-chrome"><div class="chapter3d-bridge-progress"><i id="later3dBridgeProgress"></i></div><button id="later3dBridgeSkip" type="button">跳过过场</button></header>
      <div class="chapter3d-bridge-launch" id="later3dBridgeLaunch" hidden><span>CHAPTER 03 / ZERO POINT TOWER</span><h2>出发</h2><p>光门另一端，零点塔正在等待米粒。</p><button id="later3dBridgeStart" type="button">进入第三章</button></div>
    </section>
    <section class="later3d-final-launch" id="later3dFinalLaunch" aria-label="启程" hidden>
      <div class="later3d-final-stars" id="later3dFinalStars" aria-hidden="true"></div>
      <button class="later3d-final-card" id="later3dFinalStart" type="button"><small>COORDINATES LOCKED</small><strong>启程</strong><em>沿着林澈的信号出发</em></button>
    </section>
    <section class="later3d-final-video" id="later3dFinalVideoScreen" aria-label="终章过场" hidden><video id="later3dFinalVideo" preload="metadata" playsinline><source src="assets/video/finale/final-departure.mp4" type="video/mp4" /></video></section>
    <section class="later3d-final-ending" id="later3dFinalEnding" aria-label="游戏结尾" hidden>
      <p>这次，换我来找你...</p>
      <div class="later3d-final-options" id="later3dFinalOptions" hidden><small>JOURNEY COMPLETE</small><h2>归航之后</h2><em>下一次出发，由你选择。</em><div><button id="later3dFinalReplay" type="button">重返零点塔</button><button id="later3dFinalChapters" type="button">章节选择</button><button id="later3dFinalReturn" type="button">返回标题</button></div></div>
    </section>
    <div class="later3d-touch" aria-label="触屏游戏控制"><div id="later3dStick" class="later3d-stick"><i></i></div><div class="later3d-actions"><button id="later3dSense" type="button">感知</button><button id="later3dJump" type="button">跳</button><button id="later3dInteract" type="button">互动</button></div></div>
    <div id="later3dLookzone" class="later3d-lookzone" aria-hidden="true"></div>
    <div class="later3d-rotate"><span>请旋转设备至横屏游玩</span></div>
    <div class="later3d-damage" aria-hidden="true"></div>
  `;
  gameScreen.prepend(root);

  const $ = (selector) => root.querySelector(selector);
  const canvas = $(".later3d-canvas");
  const port2d = $("#port2d");
  const port2dCat = $("#port2dCat");
  const port2dFeathers = [$("#port2dFeather0"), $("#port2dFeather1"), $("#port2dFeather2")];
  const gate = $("#later3dGate");
  const objectiveEl = $("#later3dObjective");
  const kickerEl = $("#later3dKicker");
  const stepsEl = $("#later3dSteps");
  const modeEl = $("#later3dMode");
  const alertEl = $("#later3dAlert");
  const promptEl = $("#later3dPrompt");
  const progressEl = $("#later3dProgress");
  const progressFill = progressEl.querySelector("i");
  const progressText = progressEl.querySelector("span");
  const toastEl = $("#later3dToast");
  const memoryEl = $("#later3dMemory");
  const memoryKicker = $("#later3dMemoryKicker");
  const memoryTitle = $("#later3dMemoryTitle");
  const memoryText = $("#later3dMemoryText");
  const memoryContinue = $("#later3dMemoryContinue");
  const communicatorMemory = $("#later3dCommunicatorMemory");
  const communicatorContinue = $("#later3dCommunicatorContinue");
  const enterButton = $("#later3dEnter");
  const gateKicker = $("#later3dGateKicker");
  const gateTitle = $("#later3dGateTitle");
  const gateHint = $("#later3dGateHint");
  const completeEl = $("#later3dComplete");
  const completeKicker = $("#later3dCompleteKicker");
  const completeTitle = $("#later3dCompleteTitle");
  const completeText = $("#later3dCompleteText");
  const nextButton = $("#later3dNext");
  const replayButton = $("#later3dReplay");
  const bridgeEl = $("#later3dBridge");
  const bridgeVideo = $("#later3dBridgeVideo");
  const bridgeProgress = $("#later3dBridgeProgress");
  const bridgeSkipButton = $("#later3dBridgeSkip");
  const bridgeLaunch = $("#later3dBridgeLaunch");
  const bridgeStartButton = $("#later3dBridgeStart");
  const finalLaunch = $("#later3dFinalLaunch");
  const finalStars = $("#later3dFinalStars");
  const finalStartButton = $("#later3dFinalStart");
  const finalVideoScreen = $("#later3dFinalVideoScreen");
  const finalVideo = $("#later3dFinalVideo");
  const finalEnding = $("#later3dFinalEnding");
  const finalOptions = $("#later3dFinalOptions");
  const finalReplayButton = $("#later3dFinalReplay");
  const finalChaptersButton = $("#later3dFinalChapters");
  const finalReturnButton = $("#later3dFinalReturn");
  const stick = $("#later3dStick");
  const stickKnob = stick.querySelector("i");
  const lookzone = $("#later3dLookzone");
  const touchSense = $("#later3dSense");
  const touchJump = $("#later3dJump");
  const touchInteract = $("#later3dInteract");
  const pauseScreen = document.querySelector("#pauseScreen");
  const pauseButton = document.querySelector("#pauseButton");
  const resumeButton = document.querySelector("#resumeButton");
  const restartButton = document.querySelector("#restartButton");
  const isTouch = matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;
  root.classList.toggle("touch-mode", isTouch);
  for(let index=0;index<44;index++){const star=document.createElement("i"),angle=index/44*Math.PI*2+(index%5)*.31,distance=150+(index%9)*34;star.style.setProperty("--i",index);star.style.setProperty("--x",`${Math.cos(angle)*distance}px`);star.style.setProperty("--y",`${Math.sin(angle)*distance*.62}px`);star.style.setProperty("--size",`${2+index%4}px`);finalStars.appendChild(star);}

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  } catch (_) { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(72, 1, 0.04, 160);
  camera.rotation.order = "YXZ";
  scene.add(camera);
  const world = new THREE.Group();
  scene.add(world);
  const clock = new THREE.Clock();
  const loader = new GLTFLoader();
  const keys = new Set();
  const colliders = [];
  const platforms = [];
  const scanners = [];
  const guides = [];
  const scentMarks = [];
  const animated = [];
  const temp = new THREE.Vector3();
  const tempB = new THREE.Vector3();
  let toastTimer = 0;
  let finalLaunchTimer = 0;
  let finalOptionsTimer = 0;
  let audioContext = null;
  let activeTarget = null;
  let waterLines = [];
  let solarMirror = null;
  let gardenVines = [];
  let targetLight = null;
  let sceneCameraLamp = null;
  let zeroAnchors = [];
  let falseEchoes = [];
  let timeGhosts = [];
  let gloveObject = null;
  let routeBeam = null;
  let gatheringStars = [];
  let coordinatePanel = null;
  let coordinateLight = null;
  let coordinateOrb = null;
  let chapterExitGate = null;
  let communicatorObject = null;

  const player = {
    position: new THREE.Vector3(0, 1.13, 14), checkpoint: new THREE.Vector3(0, 1.13, 14), yaw: 0, pitch: 0,
    velocityY: 0, grounded: true, moving: false, step: 0
  };
  const state = {
    active: false, playing: false, chapter: 0, complete: false, memoryOpen: false, stage: 0, puzzleTurns: 0,
    scent: false, nearby: null, alert: 0, gloveHold: 0, holdingGlove: false, touchMove: { x: 0, y: 0 }, stickPointer: null, lookPointer: null,
    lookLast: { x: 0, y: 0 }, lastAlertReset: 0, lastStepTone: 0, pawReachUntil: 0, twoD: false, runner: false,
    zeroProgress: 0, coordinateLocked: false, communicatorCollected: false, communicatorMemoryOpen: false, exitGateOpen: false
  };
  const port = {
    x: 6, y: 7, vx: 0, vy: 0, grounded: true, checkpoint: { x: 6, y: 7 },
    width: 4.6, height: 7.2,
    floor: 7,
    platforms: [
      { x: 22, y: 13, width: 16 },
      { x: 45, y: 20, width: 16 },
      { x: 71, y: 14, width: 17 }
    ],
    feathers: [
      { x: 17, y: 12 },
      { x: 52, y: 28 },
      { x: 83, y: 21 }
    ]
  };
  const runner = {
    lanes: [-4.2, 0, 4.2], lane: 1, speed: 6.2, obstacles: [],
    touchReady: true, keyReady: true, lastHit: 0, endZ: -56
  };

  const COLOR = { ink: 0x06101d, steel: 0x2d4252, trim: 0x607482, cyan: 0x20e5d4, pink: 0xff3f92, amber: 0xffc34b, orange: 0xd96a27, leaf: 0x7abf68, greenGlow: 0x9be968, danger: 0xff3155 };
  const PORT = { ink: 0x0d1025, steel: 0x323454, trim: 0x70669e, violet: 0x9a7cff, blue: 0x4d8dff, amber: 0xffb654 };
  const GARDEN = { ink: 0x14251f, frame: 0x53675a, gold: 0xffce70, aqua: 0x79e5cf, glass: 0x799e98 };
  const ZERO = { void: 0x08070a, ivory: 0xfff2da, warm: 0xffdfad, glass: 0xf7ead0, cyan: 0x56f6ff, blue: 0x7ccfff, amber: 0xffc86a, red: 0xff4268 };
  const material = (color, metalness = .5, roughness = .55, emissive = 0x000000, intensity = 0) => new THREE.MeshStandardMaterial({ color, metalness, roughness, emissive, emissiveIntensity: intensity });
  const metal = material(COLOR.steel, .82, .42);
  const dark = material(COLOR.ink, .88, .35);
  const trim = material(COLOR.trim, .68, .42);
  const cyan = material(0x8cfff1, .18, .25, COLOR.cyan, 3.2);
  const pink = material(0xff81bd, .2, .28, COLOR.pink, 3.1);
  const amber = material(0xffd17a, .18, .28, COLOR.amber, 3.5);
  const leaf = material(0x8bbf6b, .08, .78, 0x3c6f34, .25);
  const vineMaterial = material(0x466c3b, .08, .82, 0x1b3e2b, .18);
  const portMetal = material(PORT.steel, .86, .34);
  const portDark = material(PORT.ink, .9, .3);
  const portTrim = material(PORT.trim, .7, .36);
  const portViolet = material(0xc3b2ff, .16, .24, PORT.violet, 3.6);
  const portBlue = material(0x9fc4ff, .14, .22, PORT.blue, 3.4);
  const portAmber = material(0xffd497, .13, .25, PORT.amber, 3.6);
  const gardenFrame = material(GARDEN.frame, .55, .48);
  const gardenGold = material(0xffd796, .12, .28, GARDEN.gold, 2.9);
  const gardenAqua = material(0xa7fff0, .1, .3, GARDEN.aqua, 2.7);
  const zeroFloor = material(ZERO.ivory, .52, .42, 0x3b2b16, .16);
  const zeroFrame = material(0xded2bd, .78, .26, 0x2e2216, .1);
  const zeroGlass = new THREE.MeshPhysicalMaterial({ color: ZERO.glass, metalness: .08, roughness: .18, transparent: true, opacity: .24, transmission: .18, side: THREE.DoubleSide });
  const zeroCyan = material(0xdffffc, .12, .18, ZERO.cyan, 3.8);
  const zeroAmber = material(0xffdf9c, .12, .26, ZERO.amber, 3.4);
  const zeroRed = material(0xff9aa6, .08, .32, ZERO.red, 2.8);

  function seeded(seed) { let value = seed >>> 0; return () => ((value = (value * 1664525 + 1013904223) >>> 0) / 4294967296); }
  function furTexture() {
    const canvas = document.createElement("canvas"); canvas.width = canvas.height = 256;
    const ctx = canvas.getContext("2d"); const gradient = ctx.createLinearGradient(0, 0, 256, 256);
    gradient.addColorStop(0, "#f6aa56"); gradient.addColorStop(.5, "#c75f24"); gradient.addColorStop(1, "#e8843a"); ctx.fillStyle = gradient; ctx.fillRect(0, 0, 256, 256);
    const random = seeded(76433);
    for (let i = 0; i < 1450; i++) { const x = random() * 256, y = random() * 256; ctx.strokeStyle = random() > .52 ? `rgba(255,224,166,${.04 + random()*.15})` : `rgba(81,25,8,${.04 + random()*.13})`; ctx.lineWidth = .4 + random(); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (random()-.5)*3, y + 2 + random()*5); ctx.stroke(); }
    [42, 127, 209].forEach(y => { ctx.fillStyle = "rgba(80,22,7,.34)"; ctx.fillRect(0, y, 256, 13); });
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(1, 2); return texture;
  }
  const fur = furTexture();
  const furMat = new THREE.MeshPhysicalMaterial({ color: 0xcc6727, map: fur, bumpMap: fur, bumpScale: .05, roughness: .86, sheen: .38, sheenColor: new THREE.Color(0xffb66d) });
  const underfur = furMat.clone(); underfur.color.setHex(0xe89b53); underfur.bumpScale = .025;
  const padMat = new THREE.MeshPhysicalMaterial({ color: 0x7e4037, roughness: .72, sheen: .2 });
  const clawMat = new THREE.MeshPhysicalMaterial({ color: 0xffe9c7, roughness: .28, transparent: true, opacity: .86, clearcoat: .4 });

  function addBox(size, pos, mat = metal, parent = world, rotation = null) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), mat); mesh.position.set(...pos); if (rotation) mesh.rotation.set(...rotation); parent.add(mesh); return mesh;
  }
  function addCollider(x, z, w, d) { colliders.push({ minX: x-w/2, maxX: x+w/2, minZ: z-d/2, maxZ: z+d/2 }); }
  function addPlatform(x, z, w, d, height) { platforms.push({ minX: x-w/2, maxX:x+w/2, minZ:z-d/2, maxZ:z+d/2, height }); }
  function signTexture(text, color = "#20e5d4") {
    const canvas = document.createElement("canvas"); canvas.width = 1024; canvas.height = 256; const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#071220"; ctx.fillRect(0,0,1024,256); ctx.strokeStyle = color; ctx.lineWidth = 12; ctx.strokeRect(18,18,988,220); ctx.fillStyle = "#fff7df"; ctx.font = "800 76px Microsoft YaHei"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(text,512,132);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; return texture;
  }
  function addSign(text, pos, width, color, rotationY = 0) { const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, width*.25), new THREE.MeshBasicMaterial({ map: signTexture(text, color), transparent: true })); mesh.position.set(...pos); mesh.rotation.y = rotationY; world.add(mesh); return mesh; }
  function addTube(points, radius, mat, parent = world) { const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point))); const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, radius, 10, false), mat); parent.add(tube); return tube; }
  function radialTexture() { const canvas = document.createElement("canvas"); canvas.width = canvas.height = 128; const ctx = canvas.getContext("2d"); const g = ctx.createRadialGradient(64,64,2,64,64,62); g.addColorStop(0,"rgba(255,255,240,1)");g.addColorStop(.18,"rgba(255,210,87,.9)");g.addColorStop(.5,"rgba(255,76,167,.32)");g.addColorStop(1,"rgba(255,40,140,0)");ctx.fillStyle=g;ctx.fillRect(0,0,128,128);return new THREE.CanvasTexture(canvas); }
  const glowTexture = radialTexture();
  function addGlow(position, color = 0xffcc55, scale = 1.2) { const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending }));sprite.position.set(...position);sprite.scale.setScalar(scale);world.add(sprite);return sprite; }
  function addArcLight(pos, color, intensity = 30, distance = 8) { const light = new THREE.PointLight(color, intensity, distance, 2);light.position.set(...pos);world.add(light);return light; }

  function buildPaw(side) {
    const group = new THREE.Group();
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(.11,.36,10,24), furMat); leg.rotation.x = Math.PI/2; leg.position.z = -.04; group.add(leg);
    const wrist = new THREE.Mesh(new THREE.SphereGeometry(.13,28,18), furMat); wrist.scale.set(1.06,.82,1.1); wrist.position.set(0,-.01,-.25); group.add(wrist);
    const foot = new THREE.Mesh(new THREE.SphereGeometry(.16,32,22), furMat); foot.scale.set(1.1,.65,1.25); foot.position.set(0,-.04,-.36); group.add(foot);
    const belly = new THREE.Mesh(new THREE.SphereGeometry(.11,24,16), underfur); belly.scale.set(.9,.3,1); belly.position.set(0,-.1,-.38);group.add(belly);
    const palm = new THREE.Mesh(new THREE.SphereGeometry(.072,20,14),padMat);palm.scale.set(1.2,.32,.9);palm.position.set(0,-.126,-.395);group.add(palm);
    const claws=[];
    for(let i=0;i<4;i++){ const offset=i-1.5, outer=Math.abs(offset)/1.5; const toe = new THREE.Mesh(new THREE.SphereGeometry(.06,22,14),i===0||i===3?underfur:furMat);toe.scale.set(.82,.6,1.1);toe.position.set(offset*.066,-.075+outer*.008,-.48+outer*.018);group.add(toe);const toePad=new THREE.Mesh(new THREE.SphereGeometry(.025,16,10),padMat);toePad.scale.set(.88,.27,.92);toePad.position.set(offset*.066,-.124,-.49+outer*.018);group.add(toePad);const claw=new THREE.Mesh(new THREE.ConeGeometry(.014,.075,12),clawMat);claw.rotation.x=-Math.PI/2;claw.position.set(offset*.066,-.07,-.53+outer*.018);claw.scale.y=.44;group.add(claw);claws.push(claw); }
    group.userData.claws=claws; group.position.set(side*.29,-.31,-.63);group.rotation.set(-.06,side*.06,side*-.04);group.traverse(item=>item.layers.set(1));camera.add(group);return group;
  }
  const leftPaw=buildPaw(-1), rightPaw=buildPaw(1); leftPaw.scale.setScalar(.56);rightPaw.scale.setScalar(.56); camera.layers.enable(1);
  const pawLight=new THREE.HemisphereLight(0xffddb4,0x4a190b,1.45);pawLight.layers.set(1);scene.add(pawLight);const pawKey=new THREE.PointLight(0xffad6c,3.2,4,2);pawKey.layers.set(1);pawKey.position.set(-.2,.3,.1);camera.add(pawKey);

  function clearWorld() { while(world.children.length) world.remove(world.children[0]); colliders.length=0;platforms.length=0;scanners.length=0;guides.length=0;scentMarks.length=0;animated.length=0;waterLines=[];gardenVines=[];zeroAnchors=[];falseEchoes=[];timeGhosts=[];gatheringStars=[];solarMirror=null;gloveObject=null;routeBeam=null;coordinatePanel=null;coordinateLight=null;coordinateOrb=null;chapterExitGate=null;communicatorObject=null;activeTarget=null;targetLight=null; }
  function addBackground(stars = 600, tint = 0x243f70, skyColor = 0xbfeaff, upperColor = 0x9ccfff) { scene.background=new THREE.Color(0x020813);scene.fog=new THREE.FogExp2(tint,.022);const sky=new THREE.BufferGeometry();const pos=[];for(let i=0;i<stars;i++)pos.push((Math.random()-.5)*80,Math.random()*34-3,-48-Math.random()*100);sky.setAttribute("position",new THREE.Float32BufferAttribute(pos,3));world.add(new THREE.Points(sky,new THREE.PointsMaterial({color:skyColor,size:.07,transparent:true,opacity:.86,depthWrite:false})));const hemi=new THREE.HemisphereLight(upperColor,0x080410,2.25);world.add(hemi);const fill=new THREE.AmbientLight(upperColor,.75);world.add(fill);if(sceneCameraLamp)camera.remove(sceneCameraLamp);sceneCameraLamp=new THREE.PointLight(upperColor,15,12,2);camera.add(sceneCameraLamp); }
  function loadProp(url, position, height, rotationY = 0) { loader.load(url, gltf=>{ if(!state.active)return;const model=gltf.scene;model.traverse(node=>{if(!node.isMesh)return;node.material=Array.isArray(node.material)?node.material.map(mat=>mat.clone()):node.material.clone();node.material.metalness=Math.min(.85,node.material.metalness??.6);node.material.roughness=Math.max(.35,node.material.roughness??.5);if(node.material.map)node.material.map.colorSpace=THREE.SRGBColorSpace;});const box=new THREE.Box3().setFromObject(model), size=box.getSize(new THREE.Vector3()), center=box.getCenter(new THREE.Vector3());model.position.set(-center.x,-box.min.y,-center.z);const holder=new THREE.Group();holder.position.set(...position);holder.rotation.y=rotationY;holder.scale.setScalar(height/Math.max(.01,size.y));holder.add(model);world.add(holder);},undefined,()=>{}); }
  function makeCargoCrate(x,z,w,d,h,color=metal,platform=false) { const group=new THREE.Group();group.position.set(x,0,z);world.add(group);addBox([w,h,d],[0,h/2,0],color,group);addBox([w+.04,.12,d+.04],[0,h*.67,0],dark,group);for(const px of [-1,1])for(const pz of [-1,1]){const pin=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,h*.72,8),trim);pin.position.set(px*(w*.39),h*.5,pz*(d*.39));group.add(pin);} if(platform)addPlatform(x,z,w,d,h);else addCollider(x,z,w+.15,d+.15);return group; }
  function makeSafeCargoSteps(x, z, direction = 1) { [0.24, .48, .72].forEach((height, index) => makeCargoCrate(x + direction * index * .78, z - index * .72, 1.18, 1.1, height, portMetal, true)); }
  function makePortMachinery(x, z) { const group=new THREE.Group();group.position.set(x,0,z);world.add(group);addBox([2.2,.34,1.4],[0,.2,0],portDark,group);for(const side of [-1,1]){const fan=new THREE.Mesh(new THREE.TorusGeometry(.38,.08,10,24),portViolet);fan.rotation.y=Math.PI/2;fan.position.set(side*.7,.78,.55);group.add(fan);const hub=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.12,12),portAmber);hub.rotation.z=Math.PI/2;hub.position.copy(fan.position);group.add(hub);}for(let i=0;i<3;i++)addBox([.12,1.45,.12],[-.75+i*.75,.87,-.48],portTrim,group);return group; }
  function makeDrone(position, color = COLOR.pink) { const drone=new THREE.Group();drone.position.set(...position);world.add(drone);const core=new THREE.Mesh(new THREE.SphereGeometry(.38,22,16),dark);core.scale.set(1.2,.7,1);drone.add(core);const eye=new THREE.Mesh(new THREE.SphereGeometry(.11,16,12),material(0xff8abf,.15,.25,color,4));eye.position.z=.37;drone.add(eye);for(let i=0;i<4;i++){const arm=new THREE.Mesh(new THREE.BoxGeometry(.6,.06,.1),trim);arm.rotation.y=i*Math.PI/2;drone.add(arm);const pod=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,.16,10),metal);pod.position.set(Math.cos(i*Math.PI/2)*.34,-.06,Math.sin(i*Math.PI/2)*.34);drone.add(pod);}const light=new THREE.PointLight(color,20,5,2);eye.add(light);const beam=new THREE.Mesh(new THREE.ConeGeometry(.86,7,20,1,true),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.08,depthWrite:false,side:THREE.DoubleSide}));beam.rotation.x=Math.PI/2;beam.position.z=3.5;drone.add(beam);scanners.push({drone,beam,origin:new THREE.Vector3(...position),phase:Math.random()*6.28});return drone; }
  function makeFeather(position) { const group=new THREE.Group();group.position.set(...position);group.userData.baseY=position[1];const quill=new THREE.Mesh(new THREE.CylinderGeometry(.028,.018,.82,10),portAmber);quill.rotation.z=-.55;group.add(quill);const vaneMat=new THREE.MeshBasicMaterial({color:0xbfa8ff,transparent:true,opacity:.94,side:THREE.DoubleSide});for(const side of [-1,1]){const vane=new THREE.Mesh(new THREE.PlaneGeometry(.38,.72),vaneMat);vane.position.set(side*.105,.18,0);vane.rotation.z=side*.52;group.add(vane);}const glow=addGlow(position,PORT.amber,1.55);group.userData.glow=glow;world.add(group);animated.push({type:"feather",group});return group; }
  function makeRootMark(x,z,color=COLOR.greenGlow) { const ring=new THREE.Mesh(new THREE.TorusGeometry(.34,.02,8,32),new THREE.MeshBasicMaterial({color,transparent:true,opacity:0,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.set(x,.02,z);world.add(ring);scentMarks.push(ring); }

  function buildPort() {
    root.dataset.chapter="2";addBackground(720,0x211538,0xd3c7ff,0xa99aff);world.add(new THREE.Mesh(new THREE.PlaneGeometry(25,78),new THREE.MeshStandardMaterial({color:0x17192f,metalness:.88,roughness:.28})));world.children[world.children.length-1].rotation.x=-Math.PI/2;world.children[world.children.length-1].position.z=-20;
    const ceiling=addBox([25,.16,78],[0,8,-20],portDark);
    for(let z=15;z>-58;z-=6){ addBox([.22,6,5.7],[-12.2,3,z],z%12?portMetal:portTrim);addBox([.22,6,5.7],[12.2,3,z],z%12?portMetal:portTrim);addBox([25,.13,.14],[0,5.85,z-2.82],portTrim);const lampColor=z%12?PORT.violet:PORT.blue;addBox([.12,.08,2.4],[-11.96,3.9,z],material(0xffffff,.1,.3,lampColor,3.4));addBox([.12,.08,2.4],[11.96,3.9,z],material(0xffffff,.1,.3,lampColor,3.4)); }
    for(const x of [-10.8,10.8])for(const y of [4.7,5.05]){const tube=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,73,10),portDark);tube.rotation.x=Math.PI/2;tube.position.set(x,y,-20);world.add(tube);}
    [[-5,5,2.4,2.5,1.2,false],[5.6,1,2.8,2.4,1.4,false],[-7,-7,3.4,2.5,.66,true],[3.2,-12,3,2.8,.72,true],[-3.5,-22,4,3,1.6,false],[6,-29,3.1,2.4,.70,true],[-5,-37,3.3,3.3,.62,true],[2,-44,3.4,3,.72,true]].forEach(data=>makeCargoCrate(data[0],data[1],data[2],data[3],data[4],data[5]?portMetal:portTrim,data[5]));
    makeSafeCargoSteps(-8.6,-4,1);makeSafeCargoSteps(4.1,-18,-1);makeSafeCargoSteps(-6.8,-33,1);makePortMachinery(-8.2,-19);makePortMachinery(8.1,-40);
    const crane=new THREE.Group();crane.position.set(0,0,-19);world.add(crane);addBox([.32,6,.32],[0,3,0],portTrim,crane);addBox([12,.24,.34],[0,5.6,0],portMetal,crane);addBox([.12,3,.12],[5.1,4.1,0],portDark,crane);const hook=new THREE.Mesh(new THREE.TorusGeometry(.24,.07,10,18,Math.PI),portAmber);hook.position.set(5.1,2.45,0);crane.add(hook);animated.push({type:"crane",group:crane});
    addSign("百目港 · 漂浮货运层",[-11.92,3.1,10],4.6,"#9a7cff",Math.PI/2);addSign("扫描区",[11.92,3.1,-25],3.2,"#ffb654",-Math.PI/2);
    [[-5.9,1.32,.2],[5.5,-15.7,1.24],[2,-43.4,1.42]].forEach((p,index)=>guides.push(makeFeather(p)));
    guides.forEach((guide,index)=>guide.visible=index===0);activeTarget=guides[0];targetLight=addArcLight(activeTarget.position.toArray(),PORT.amber,56,7);
    makeDrone([4.5,2.7,-9],PORT.violet);makeDrone([-5.2,2.6,-31],PORT.blue);makeDrone([2.8,3.2,-47],PORT.violet);
    for(let z=5;z>-46;z-=4)makeRootMark(Math.sin(z)*2.4,z,PORT.amber);
    [[-8,2.3,7],[8,2.4,-10],[-8,2.8,-28],[8,2.7,-46]].forEach((p,i)=>addArcLight(p,i%2?PORT.violet:PORT.blue,42,10));
  }
  function makeRunnerBarrier(lane, z, low = false) {
    const group = new THREE.Group();
    group.position.set(runner.lanes[lane], 0, z); world.add(group);
    const height = low ? .78 : 1.15;
    addBox([2.35, height, .62], [0, height / 2, 0], portMetal, group);
    addBox([2.48, .12, .72], [0, height + .04, 0], portAmber, group);
    for (const side of [-1, 1]) {
      addBox([.12, height + .38, .12], [side * 1.03, (height + .38) / 2, 0], portTrim, group);
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(.11, 14, 10), portViolet);
      lamp.position.set(side * .92, height + .27, .05); group.add(lamp);
    }
    runner.obstacles.push({ lane, z, height });
  }
  function makeChapterExitGate() {
    const group = new THREE.Group(); group.position.set(0, 0, -56.5); world.add(group);
    const frameMaterial = material(0xffffff, .1, .24, PORT.amber, 4.2);
    const fieldMaterial = new THREE.MeshBasicMaterial({ color: 0x8df7ff, transparent: true, opacity: .2, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
    addBox([.22, 4.5, .24], [-4.65, 2.25, 0], frameMaterial, group); addBox([.22, 4.5, .24], [4.65, 2.25, 0], frameMaterial, group);
    const arch = new THREE.Mesh(new THREE.TorusGeometry(4.65, .1, 10, 72, Math.PI), frameMaterial); arch.position.y = 2.25; group.add(arch);
    const field = new THREE.Mesh(new THREE.PlaneGeometry(9.1, 4.45), fieldMaterial); field.position.y = 2.22; group.add(field);
    const halo = new THREE.Mesh(new THREE.RingGeometry(2.3, 2.5, 64), new THREE.MeshBasicMaterial({ color: PORT.violet, transparent: true, opacity: .48, depthWrite: false, blending: THREE.AdditiveBlending })); halo.position.set(0, 2.25, .03); group.add(halo);
    const light = addArcLight([0, 2.25, -56.5], PORT.amber, 86, 18);
    group.userData = { fieldMaterial, halo, light, baseY: group.position.y }; animated.push({ type: "exitGate", group }); return group;
  }
  function openChapterExitGate() {
    if (state.exitGateOpen || state.chapter !== 2) return;
    state.exitGateOpen = true; activeTarget = null; if (targetLight) targetLight.intensity = 0; chapterExitGate = makeChapterExitGate();
    player.checkpoint.copy(player.position); updateObjective(); showToast("前方出现了一道发光的门，穿过去。", 3200); tone(520, .22, "sine", .045);
  }
  function buildRunnerWorld() {
    root.dataset.chapter = "2";
    runner.lane = 1; runner.speed = 6.2; runner.obstacles.length = 0; runner.touchReady = true; runner.keyReady = true; runner.lastHit = 0;
    addBackground(1500, 0x111d4d, 0xc7d7ff, 0x7d9dff); scene.fog = new THREE.FogExp2(0x050916, .012);
    const track = addBox([14.2, .24, 88], [0, -.12, -29], portDark);
    track.material = new THREE.MeshStandardMaterial({ color: 0x111a36, metalness: .88, roughness: .3 });
    for (let z = 14; z > -71; z -= 3.6) {
      addBox([13.8, .045, .08], [0, .03, z], portTrim);
      for (const x of [-2.1, 2.1]) addBox([.07, .05, 2.1], [x, .07, z - 1.05], z % 7 ? portViolet : portAmber);
      for (const x of [-6.65, 6.65]) addBox([.13, .46, 3.55], [x, .28, z - 1.75], portMetal);
    }
    for (const z of [8, -13, -34, -55]) {
      for (const x of [-6.3, 6.3]) addBox([.22, 5.4, .24], [x, 2.7, z], portTrim);
      addBox([12.8, .18, .28], [0, 5.18, z], portMetal);
      addBox([.18, .1, 6.3], [-3.1, 4.7, z], portViolet);
      addBox([.18, .1, 6.3], [3.1, 4.7, z], portBlue);
    }
    const planet = new THREE.Mesh(new THREE.SphereGeometry(9, 48, 32), new THREE.MeshStandardMaterial({ color: 0x334687, metalness: .12, roughness: .7, emissive: 0x101c5d, emissiveIntensity: 1.5 }));
    planet.position.set(18, 10, -43); world.add(planet);
    const planetHalo = new THREE.Mesh(new THREE.TorusGeometry(11.5, .08, 12, 72), new THREE.MeshBasicMaterial({ color: 0x768cff, transparent: true, opacity: .52 }));
    planetHalo.position.copy(planet.position); planetHalo.rotation.x = Math.PI / 2.55; world.add(planetHalo);
    for (let i = 0; i < 19; i++) {
      const asteroid = new THREE.Mesh(new THREE.IcosahedronGeometry(.28 + (i % 4) * .14, 1), portMetal);
      asteroid.position.set((i % 2 ? -1 : 1) * (9 + (i % 5) * 2.8), 1.6 + (i % 6) * 1.45, 7 - i * 4.1);
      asteroid.rotation.set(i * .37, i * .61, i * .22); world.add(asteroid);
    }
    addSign("百目港 · 外环逃逸航道", [0, 3.1, 10.6], 5.8, "#ffcf72");
    [[0, 3.1], [1, -17.1], [2, -38.1]].forEach(([lane, z], index) => guides.push(makeFeather([runner.lanes[lane], 1.3, z])));
    guides.forEach((guide, index) => guide.visible = index === 0);
    activeTarget = guides[0]; targetLight = addArcLight(activeTarget.position.toArray(), PORT.amber, 58, 7);
    makeRunnerBarrier(0, -7); makeRunnerBarrier(1, -25); makeRunnerBarrier(2, -31, true);
    [[-9, 2.2, 5], [9, 2.8, -15], [-9, 2.6, -38], [9, 3.1, -56]].forEach((p, i) => addArcLight(p, i % 2 ? PORT.violet : PORT.blue, 45, 12));
  }
  function changeRunnerLane(direction) {
    if (!state.runner || !state.playing || state.complete || !pauseScreen.hidden) return;
    const next = THREE.MathUtils.clamp(runner.lane + direction, 0, runner.lanes.length - 1);
    if (next === runner.lane) return;
    runner.lane = next; tone(260 + next * 80, .06, "square", .018);
  }
  function updateRunner(dt) {
    if (!state.playing || state.complete || !pauseScreen.hidden) { player.moving = false; return; }
    const leftHeld = keys.has("KeyA") || keys.has("ArrowLeft");
    const rightHeld = keys.has("KeyD") || keys.has("ArrowRight");
    if (!leftHeld && !rightHeld) runner.keyReady = true;
    if (runner.keyReady && leftHeld !== rightHeld) { changeRunnerLane(rightHeld ? 1 : -1); runner.keyReady = false; }
    const touch = state.touchMove.x;
    if (Math.abs(touch) < .28) runner.touchReady = true;
    if (runner.touchReady && Math.abs(touch) > .68) { changeRunnerLane(touch > 0 ? 1 : -1); runner.touchReady = false; }
    const accelerating = keys.has("KeyW") || keys.has("ArrowUp") || state.touchMove.y < -.3;
    const braking = keys.has("KeyS") || keys.has("ArrowDown") || state.touchMove.y > .3;
    runner.speed = THREE.MathUtils.damp(runner.speed, braking ? 3.5 : accelerating ? 7.7 : 6.2, 7, dt);
    player.position.z -= runner.speed * dt;
    player.position.x = THREE.MathUtils.damp(player.position.x, runner.lanes[runner.lane], 16, dt);
    player.moving = true; player.step += dt * runner.speed * 2.7;
    const previousFoot = player.position.y - 1.13;
    player.velocityY -= 10.8 * dt; player.position.y += player.velocityY * dt;
    const foot = player.position.y - 1.13;
    if (player.velocityY <= 0 && foot <= 0 && previousFoot >= -.05) { player.position.y = 1.13; player.velocityY = 0; player.grounded = true; } else player.grounded = false;
    if (player.grounded) playFootstep(runner.speed);
    const now = performance.now();
    for (const obstacle of runner.obstacles) {
      if (Math.abs(player.position.z - obstacle.z) < .68 && Math.abs(player.position.x - runner.lanes[obstacle.lane]) < 1.16 && player.position.y < 1.88 && now - runner.lastHit > 900) {
        runner.lastHit = now; resetCheckpoint("撞上了航道障碍，已返回最近的光羽位置。"); return;
      }
    }
    if (activeTarget && player.position.distanceTo(activeTarget.position) < 1.5) captureFeather();
    if (activeTarget && player.position.z < activeTarget.position.z - 1.9 && now - runner.lastHit > 900) {
      runner.lastHit = now; resetCheckpoint("光羽掠过了前方跑道，已返回最近检查点。"); return;
    }
    if (state.exitGateOpen && chapterExitGate && player.position.z < chapterExitGate.position.z + .2) { finishChapter(); return; }
    if (player.position.z < runner.endZ && state.stage < 3 && now - runner.lastHit > 900) {
      runner.lastHit = now; resetCheckpoint("航道仍在延伸，先追上前方的光羽。");
    }
  }
  function renderPort2D() {
    port2dCat.style.setProperty("--x", `${port.x}%`);
    port2dCat.style.setProperty("--y", `${port.y}%`);
    port2dCat.classList.toggle("is-running", Math.abs(port.vx) > 1);
    port2dCat.classList.toggle("is-airborne", !port.grounded);
    port2dCat.classList.toggle("facing-left", port.vx < -1);
    port.feathers.forEach((feather, index) => {
      const node = port2dFeathers[index];
      node.style.left = `${feather.x}%`;
      node.style.bottom = `${feather.y}%`;
      node.hidden = index !== state.stage;
    });
  }
  function buildPort2D() {
    state.twoD = true;
    root.classList.add("two-d-mode");
    canvas.hidden = true;
    port2d.hidden = false;
    port.x = 6; port.y = port.floor; port.vx = 0; port.vy = 0; port.grounded = true;
    port.checkpoint = { x: 6, y: port.floor };
    port2dCat.classList.remove("is-running", "is-airborne", "facing-left");
    renderPort2D();
  }
  function collectPortFeather() {
    if (!state.twoD || !state.playing || state.stage > 2) return;
    const index = state.stage;
    state.pawReachUntil = performance.now() + 420;
    tone(660, .12, "triangle", .05); setTimeout(() => tone(880, .22, "sine", .04), 80);
    state.stage++;
    if (state.stage < 3) {
      port.checkpoint = { x: port.x, y: port.y };
      showToast(state.stage === 1 ? "第一束光羽飞向上方平台了，按空格跳上去。" : "最后一束光羽在右侧，继续向前。", 2600);
      updateObjective(); renderPort2D();
      return;
    }
    renderPort2D(); updateObjective(); finishChapter();
  }
  function updatePort2D(dt) {
    if (!state.playing || state.complete || !pauseScreen.hidden) return;
    const input = (keys.has("KeyD") || keys.has("ArrowRight") ? 1 : 0) - (keys.has("KeyA") || keys.has("ArrowLeft") ? 1 : 0) + state.touchMove.x;
    const direction = Math.abs(input) > .12 ? Math.sign(input) : 0;
    port.vx = THREE.MathUtils.damp(port.vx, direction * 31, direction ? 16 : 12, dt);
    port.x = THREE.MathUtils.clamp(port.x + port.vx * dt, 1, 95);
    const previousY = port.y;
    port.vy -= 92 * dt;
    port.y += port.vy * dt;
    let landing = port.floor;
    const catLeft = port.x - port.width * .5;
    const catRight = port.x + port.width * .5;
    for (const platform of port.platforms) {
      const platformLeft = platform.x - platform.width * .5;
      const platformRight = platform.x + platform.width * .5;
      if (catRight > platformLeft && catLeft < platformRight && previousY >= platform.y - .1 && port.y <= platform.y && port.vy <= 0) landing = Math.max(landing, platform.y);
    }
    if (port.y <= landing) { port.y = landing; port.vy = 0; port.grounded = true; } else port.grounded = false;
    if (direction && port.grounded) playFootstep(Math.abs(port.vx) > 24 ? 6 : 4);
    if (state.stage < 3) {
      const feather = port.feathers[state.stage];
      const dx = port.x - feather.x;
      const dy = (port.y + port.height * .45) - feather.y;
      if (Math.hypot(dx, dy) < 6.2) collectPortFeather();
    }
    renderPort2D();
  }
  function port2DJump() {
    if (!state.playing || !port.grounded || !pauseScreen.hidden) { feedback("error"); return; }
    port.vy = 39;
    port.grounded = false;
    tone(188, .1, "triangle", .026);
  }
  function makePlant(position, scale=1, hue=0) { const plant=new THREE.Group();plant.position.set(...position);world.add(plant);const stalk=new THREE.Mesh(new THREE.CylinderGeometry(.055,.08,1.2*scale,10),vineMaterial);stalk.position.y=.6*scale;plant.add(stalk);for(let i=0;i<7;i++){const leafMesh=new THREE.Mesh(new THREE.SphereGeometry(.18*scale,18,12),leaf);leafMesh.scale.set(1.35,.28,.68);leafMesh.position.set(Math.sin(i*2.4)*.18*scale,.42*scale+i*.11*scale,Math.cos(i*2.4)*.18*scale);leafMesh.rotation.z=Math.sin(i*2.4)*.7;leafMesh.rotation.y=i*1.8;plant.add(leafMesh);}plant.userData.base=plant.scale.clone();gardenVines.push(plant);return plant; }
  function makeConsole(x,z,color,label) { const group=new THREE.Group();group.position.set(x,0,z);world.add(group);addBox([1.2,1.4,.7],[0,.7,0],dark,group);addBox([.8,.56,.08],[0,1.02,.39],material(0xffffff,.1,.25,color,3),group);for(let i=0;i<4;i++){const dot=new THREE.Mesh(new THREE.SphereGeometry(.045,10,8),material(0xffffff,.1,.2,color,3));dot.position.set(-.25+i*.17,.93,.45);group.add(dot);}const sign=addSign(label,[x,1.85,z],1.6,"#fff7df",0);sign.rotation.x=0;return group; }
  function buildGarden() {
    root.dataset.chapter="3";addBackground(520,0x293522,0xffdf9c,0xffd499);scene.fog=new THREE.FogExp2(0x263826,.016);const floor=new THREE.Mesh(new THREE.CircleGeometry(17,80),new THREE.MeshStandardMaterial({color:0x26352d,metalness:.38,roughness:.62}));floor.rotation.x=-Math.PI/2;floor.scale.set(1,2.8,1);floor.position.z=-20;world.add(floor);
    const glassMaterial=new THREE.MeshPhysicalMaterial({color:GARDEN.glass,metalness:.12,roughness:.2,transparent:true,opacity:.13,transmission:.1,side:THREE.DoubleSide});
    for(let z=16;z>-58;z-=6){const ring=new THREE.Mesh(new THREE.TorusGeometry(12.4,.12,12,46),gardenFrame);ring.rotation.x=Math.PI/2;ring.position.z=z;world.add(ring);const upper=new THREE.Mesh(new THREE.TorusGeometry(12.4,.09,12,46),gardenGold);upper.rotation.x=Math.PI/2;upper.position.set(0,7,z);world.add(upper);const glass=new THREE.Mesh(new THREE.CylinderGeometry(12.32,12.32,6,46,1,true),glassMaterial);glass.position.set(0,3.5,z);world.add(glass);for(const x of [-12,12])addBox([.18,7,.18],[x,3.5,z],gardenFrame);}
    for(let i=0;i<26;i++){const angle=i*2.399;const radius=4+(i%4)*1.7;makePlant([Math.cos(angle)*radius,0,8-i*2.5+Math.sin(angle)*2],.65+(i%3)*.22);}
    for(const z of [10,-5,-21,-38,-53]){const lamp=addArcLight([0,5.6,z],z%2?GARDEN.aqua:GARDEN.gold,55,12);animated.push({type:"gardenLight",light:lamp,phase:z});}
    const podRing=new THREE.Group();podRing.position.set(-7,0,-28);world.add(podRing);for(let i=0;i<4;i++){const pod=new THREE.Mesh(new THREE.CylinderGeometry(.8,.95,2.8,16),new THREE.MeshPhysicalMaterial({color:0x5d7865,metalness:.2,roughness:.34,transparent:true,opacity:.68,transmission:.18}));pod.position.set(Math.cos(i*Math.PI/2)*2,1.45,Math.sin(i*Math.PI/2)*2);podRing.add(pod);makePlant([podRing.position.x+Math.cos(i*Math.PI/2)*2,pod.position.y-.85,podRing.position.z+Math.sin(i*Math.PI/2)*2],.52);}
    for(let i=0;i<14;i++){const x=-10+(i%7)*3.2,z=12-Math.floor(i/7)*44;const hanging=addTube([[x,6.7,z],[x+Math.sin(i)*.35,5.2,z-.35],[x+Math.cos(i)*.5,4.25,z-.55]],.055,vineMaterial);hanging.rotation.y=i*.4;const bud=addGlow([x+Math.cos(i)*.5,4.18,z-.55],i%2?GARDEN.gold:GARDEN.aqua,.36);animated.push({type:"bud",sprite:bud,phase:i});}
    const water=makeConsole(-6,4,GARDEN.aqua,"水循环");const mirror=makeConsole(6,-17,GARDEN.gold,"折光镜");const vent=makeConsole(0,-39,GARDEN.aqua,"气流阀");
    water.userData.kind="water";mirror.userData.kind="mirror";vent.userData.kind="vent";guides.push(water,mirror,vent);
    solarMirror=new THREE.Group();solarMirror.position.set(6,2.25,-17);world.add(solarMirror);const disc=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.1,.08,32),new THREE.MeshPhysicalMaterial({color:0xb2c9c0,metalness:.88,roughness:.12,clearcoat:.72}));disc.rotation.x=Math.PI/2;solarMirror.add(disc);const rim=new THREE.Mesh(new THREE.TorusGeometry(1.12,.08,12,32),gardenGold);rim.rotation.x=Math.PI/2;solarMirror.add(rim);const beam=new THREE.Mesh(new THREE.CylinderGeometry(.11,.38,10,12,true),new THREE.MeshBasicMaterial({color:GARDEN.gold,transparent:true,opacity:.05,depthWrite:false}));beam.position.set(-2.4,.2,-4.5);beam.rotation.x=Math.PI/2;solarMirror.add(beam);solarMirror.userData.beam=beam;
    [[-6,4,0,0,-9,0],[0,-9,0,6,-17,0],[6,-17,0,0,-28,0],[0,-28,0,0,-39,0]].forEach(points=>{const line=addTube([[points[0],.14,points[1]],[points[2],.14,points[3]],[points[4],.14,points[5]]],.085,material(0x42675b,.3,.5,GARDEN.aqua,0));waterLines.push(line);});
    for(let z=7;z>-43;z-=3.5)makeRootMark(Math.sin(z*.4)*3,z,GARDEN.aqua);
    loadProp(ecologyPodUrl,[-9,0,-45],3.1,.28);loadProp(energyCoreUrl,[1.2,.15,-39],.8,.4);loadProp(bulbRobotUrl,[2.7,.05,-48],1.35,-.5);
  }

  function makeZeroRoom(x,y,z,rotation=.0,ghost=false) {
    const group=new THREE.Group();group.position.set(x,y,z);group.rotation.set(Math.sin(x+z)*.12,rotation,Math.cos(x-z)*.08);world.add(group);
    const wall=ghost?zeroGlass:zeroFrame, floor=ghost?zeroGlass:zeroFloor;
    addBox([4.8,.2,3.6],[0,0,0],floor,group);
    addBox([4.9,.12,.16],[0,1.9,-1.72],wall,group);
    addBox([.16,2.9,3.4],[-2.36,1.35,0],wall,group);
    addBox([.16,2.9,3.4],[2.36,1.35,0],wall,group);
    const screen=new THREE.Mesh(new THREE.PlaneGeometry(2.3,1.1),new THREE.MeshBasicMaterial({color:ghost?ZERO.cyan:ZERO.warm,transparent:true,opacity:ghost ? .22 : .72,side:THREE.DoubleSide}));
    screen.position.set(0,1.55,1.75);screen.rotation.y=Math.PI;group.add(screen);
    animated.push({type:ghost?"zeroGhostRoom":"zeroRoom",group,phase:x+z});
    return group;
  }
  function makeZeroCatEcho(position,scale=.8,collar=false,kitten=false) {
    const mat=new THREE.MeshBasicMaterial({color:0xffb66c,transparent:true,opacity:kitten ? .34 : .46,depthWrite:false});
    const group=new THREE.Group();group.position.set(...position);group.scale.setScalar(scale*(kitten ? .66 : 1));world.add(group);
    const body=new THREE.Mesh(new THREE.SphereGeometry(.42,20,14),mat);body.scale.set(1.45,.72,.82);body.position.y=.52;group.add(body);
    const head=new THREE.Mesh(new THREE.SphereGeometry(.28,18,12),mat);head.position.set(-.48,.78,.08);group.add(head);
    const tail=new THREE.Mesh(new THREE.TorusGeometry(.32,.035,8,20,Math.PI*1.2),mat);tail.position.set(.56,.68,-.06);tail.rotation.set(.2,-.6,.2);group.add(tail);
    if(collar){const ring=new THREE.Mesh(new THREE.TorusGeometry(.18,.018,8,24),zeroCyan);ring.position.copy(head.position);ring.position.y-=.08;ring.rotation.x=Math.PI/2;group.add(ring);}
    timeGhosts.push(group);animated.push({type:"zeroCat",group,phase:position[0]+position[2]});
    return group;
  }
  function makeFalseOwner(position,rotation=0,label="错误记忆") {
    const mat=new THREE.MeshBasicMaterial({color:ZERO.red,transparent:true,opacity:.38,depthWrite:false});
    const group=new THREE.Group();group.position.set(...position);group.rotation.y=rotation;world.add(group);
    const body=new THREE.Mesh(new THREE.CapsuleGeometry(.28,1.5,8,18),mat);body.position.y=1.25;group.add(body);
    const head=new THREE.Mesh(new THREE.SphereGeometry(.24,18,12),mat);head.position.y=2.25;group.add(head);
    const arm=new THREE.Mesh(new THREE.BoxGeometry(1.15,.1,.1),mat);arm.position.set(.45,1.64,.18);arm.rotation.z=-.36;group.add(arm);
    const hand=new THREE.Mesh(new THREE.SphereGeometry(.12,14,10),zeroRed);hand.position.set(1.02,1.44,.22);group.add(hand);
    const warning=new THREE.Mesh(new THREE.TorusGeometry(.92,.025,8,42),new THREE.MeshBasicMaterial({color:ZERO.red,transparent:true,opacity:.5,depthWrite:false}));warning.rotation.x=Math.PI/2;warning.position.y=.08;group.add(warning);
    if(label)addSign(label,[position[0],2.72,position[2]],1.65,"#ff4268",rotation);
    falseEchoes.push(group);animated.push({type:"falseOwner",group,phase:position[0]-position[2]});
    return group;
  }
  function makeZeroAnchor(kind,position,color,label) {
    const group=new THREE.Group();group.position.set(...position);world.add(group);
    const mat=material(0xffffff,.12,.2,color,3.4);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.68,.04,10,36),mat);ring.rotation.x=Math.PI/2;group.add(ring);
    const core=new THREE.Mesh(new THREE.SphereGeometry(.22,22,14),mat);core.position.y=.08;group.add(core);
    if(kind==="feather"){const feather=new THREE.Mesh(new THREE.PlaneGeometry(.48,1.12),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.78,side:THREE.DoubleSide}));feather.position.y=.56;feather.rotation.z=-.45;group.add(feather);}
    if(kind==="treat"){addBox([.72,.12,.4],[0,.22,0],zeroAmber,group,[0,.2,.08]);}
    if(kind==="wreck"){addBox([1.3,.18,.7],[0,.3,0],portDark,group,[.08,.35,-.1]);addBox([.78,.06,.72],[.18,.52,.03],zeroCyan,group,[.2,.35,0]);}
    if(label)addSign(label,[position[0],position[1]+1.05,position[2]],2.05,"#fff7df");
    const light=addArcLight(position,color,40,7);
    const anchor={kind,group,position:group.position,light};zeroAnchors.push(anchor);animated.push({type:"zeroAnchor",group,phase:zeroAnchors.length});
    return anchor;
  }
  function makeZeroGlove() {
    const group=new THREE.Group();group.position.set(0,3.2,-50);world.add(group);
    const palm=new THREE.Mesh(new THREE.SphereGeometry(.46,28,18),new THREE.MeshPhysicalMaterial({color:0xf5e8d0,metalness:.24,roughness:.45,clearcoat:.2}));palm.scale.set(.78,.3,1.08);group.add(palm);
    for(let i=0;i<5;i++){const finger=new THREE.Mesh(new THREE.CapsuleGeometry(.07,.58,8,14),palm.material);finger.position.set((i-2)*.16,.08,-.45-Math.abs(i-2)*.025);finger.rotation.x=.22;group.add(finger);}
    const chip=new THREE.Mesh(new THREE.BoxGeometry(.34,.045,.22),zeroCyan);chip.position.set(.2,.18,.08);group.add(chip);
    const palmRing=new THREE.Mesh(new THREE.TorusGeometry(.72,.025,10,44),new THREE.MeshBasicMaterial({color:ZERO.cyan,transparent:true,opacity:.72,depthWrite:false}));palmRing.rotation.x=Math.PI/2;group.add(palmRing);
    addArcLight(group.position.toArray(),ZERO.cyan,70,10);
    for(let i=0;i<4;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(1.15+i*.42,.022,8,64),new THREE.MeshBasicMaterial({color:i%2?ZERO.warm:ZERO.cyan,transparent:true,opacity:.25,depthWrite:false}));ring.rotation.set(Math.PI/2+i*.2,i*.32,0);group.add(ring);animated.push({type:"gloveRing",group:ring,phase:i});}
    animated.push({type:"zeroGlove",group,phase:0});return group;
  }
  function coordinateTexture() {
    const canvas=document.createElement("canvas");canvas.width=1024;canvas.height=512;const ctx=canvas.getContext("2d");
    const gradient=ctx.createLinearGradient(0,0,1024,512);gradient.addColorStop(0,"rgba(24,16,9,.64)");gradient.addColorStop(1,"rgba(255,243,205,.14)");ctx.fillStyle=gradient;ctx.fillRect(0,0,1024,512);
    ctx.strokeStyle="rgba(255,247,223,.74)";ctx.lineWidth=10;ctx.strokeRect(28,28,968,456);
    ctx.fillStyle="#fff7df";ctx.textAlign="center";ctx.textBaseline="middle";ctx.font="800 72px Microsoft YaHei";ctx.fillText("林澈坐标",512,126);
    ctx.font="700 52px Consolas, Microsoft YaHei";ctx.fillStyle="#7ff5ff";ctx.fillText("LINCHE / SIGNAL LOCKED",512,228);
    ctx.font="600 40px Consolas, Microsoft YaHei";ctx.fillStyle="#ffe7a8";ctx.fillText("X-2749.07  ·  Y-0318.42  ·  Z-远汐外域",512,314);
    ctx.font="500 30px Microsoft YaHei";ctx.fillStyle="rgba(255,247,223,.78)";ctx.fillText("持续求救定位正在发送",512,386);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
  }
  function makeCoordinatePanel() {
    const group=new THREE.Group();group.position.set(0,4.5,-56.4);world.add(group);
    const material=new THREE.MeshBasicMaterial({map:coordinateTexture(),transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide});
    const panel=new THREE.Mesh(new THREE.PlaneGeometry(6.2,3.1),material);group.add(panel);
    const halo=new THREE.Mesh(new THREE.RingGeometry(3.55,3.72,96),new THREE.MeshBasicMaterial({color:ZERO.cyan,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));halo.position.z=-.05;group.add(halo);
    group.userData={panelMaterial:material,haloMaterial:halo.material};coordinateLight=addArcLight([0,4.5,-56.4],ZERO.cyan,0,18);return group;
  }
  function makeGatheringStars() {
    for(let i=0;i<48;i++){
      const z=8-Math.random()*60,side=Math.random()>.5?1:-1,x=side*(3.4+Math.random()*10.5),y=.8+Math.random()*5.8;
      const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture,color:i%4===0?ZERO.cyan:i%3===0?ZERO.amber:ZERO.warm,transparent:true,opacity:.18,depthWrite:false,blending:THREE.AdditiveBlending}));
      sprite.position.set(x,y,z);sprite.scale.setScalar(.06+Math.random()*.1);
      sprite.userData={home:sprite.position.clone(),phase:Math.random()*Math.PI*2};
      world.add(sprite);gatheringStars.push(sprite);
    }
  }
  function makeCoordinateOrb() {
    const group=new THREE.Group();group.position.set(0,2.25,-54.5);world.add(group);
    const coreMaterial=new THREE.MeshBasicMaterial({color:0xfff4c8,transparent:true,opacity:.96,depthWrite:false,blending:THREE.AdditiveBlending});
    const core=new THREE.Mesh(new THREE.SphereGeometry(.48,30,20),coreMaterial);group.add(core);
    const glow=new THREE.Mesh(new THREE.SphereGeometry(1.18,30,20),new THREE.MeshBasicMaterial({map:glowTexture,color:ZERO.cyan,transparent:true,opacity:.32,depthWrite:false,blending:THREE.AdditiveBlending}));group.add(glow);
    const rings=[];for(let i=0;i<3;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(.78+i*.22,.018,8,56),new THREE.MeshBasicMaterial({color:i===1?ZERO.warm:ZERO.cyan,transparent:true,opacity:.48,depthWrite:false,blending:THREE.AdditiveBlending}));ring.rotation.set(Math.PI/2+i*.32,i*.7,0);group.add(ring);rings.push(ring);}
    const light=addArcLight([0,2.25,-54.5],ZERO.cyan,82,13);group.userData={core,coreMaterial,glow,glowMaterial:glow.material,rings,light};return group;
  }
  function makeCommunicator() {
    const group=new THREE.Group();group.position.set(1.8,1.35,-42.5);group.rotation.set(-.18,.35,.12);world.add(group);
    const bodyMaterial=new THREE.MeshPhysicalMaterial({color:0x17150f,metalness:.78,roughness:.32,clearcoat:.18});
    const trimMaterial=material(0xffe2a0,.16,.24,ZERO.amber,3.6);
    addBox([1.05,.32,1.28],[0,0,0],bodyMaterial,group);addBox([.84,.08,.62],[0,.2,-.08],trimMaterial,group);
    const screen=new THREE.Mesh(new THREE.BoxGeometry(.62,.045,.43),new THREE.MeshBasicMaterial({color:0xffd53f,transparent:true,opacity:.94}));screen.position.set(0,.255,-.1);group.add(screen);
    for(const side of [-1,1]){addBox([.1,.22,1.02],[side*.58,-.02,0],bodyMaterial,group);addBox([.12,.12,.5],[side*.69,-.04,.05],trimMaterial,group);}
    const antenna=new THREE.Mesh(new THREE.CylinderGeometry(.025,.035,.82,10),bodyMaterial);antenna.position.set(.32,.62,.28);antenna.rotation.z=-.2;group.add(antenna);
    const dish=new THREE.Mesh(new THREE.CircleGeometry(.24,28),new THREE.MeshBasicMaterial({color:0x3b3424,side:THREE.DoubleSide}));dish.position.set(.4,1.02,.28);dish.rotation.set(-.8,.15,.12);group.add(dish);
    const signal=new THREE.Mesh(new THREE.TorusGeometry(.82,.025,8,48),new THREE.MeshBasicMaterial({color:ZERO.amber,transparent:true,opacity:.55,depthWrite:false,blending:THREE.AdditiveBlending}));signal.rotation.x=Math.PI/2;signal.position.y=-.2;group.add(signal);
    const light=addArcLight([1.8,1.65,-42.5],ZERO.amber,74,9);group.userData={baseY:group.position.y,screen,signal,light};animated.push({type:"communicator",group,phase:0});return group;
  }
  function buildZeroPointTower() {
    root.dataset.chapter="3";addBackground(1200,0x4a3827,0xfff1d2,0xffdfb6);scene.fog=new THREE.FogExp2(0x4b3a2d,.012);
    const floor=new THREE.Mesh(new THREE.CylinderGeometry(16,16,.28,88),zeroFloor);floor.position.y=-.14;floor.position.z=-20;world.add(floor);
    for(const radius of [4.8,9.2,14.4]){const ring=new THREE.Mesh(new THREE.TorusGeometry(radius,.035,8,72),zeroAmber);ring.rotation.x=Math.PI/2;ring.position.set(0,.03,-20);world.add(ring);}
    [[0,-6,5.6,24,0],[0,-31,5.4,27,0],[-7,-18,14,4,.18],[7,-34,13,4,-.16]].forEach(([x,z,w,d,r])=>{const group=new THREE.Group();group.position.set(x,0,z);group.rotation.y=r;world.add(group);addBox([w,.2,d],[0,0,0],zeroFloor,group);addBox([w,.18,.12],[0,.28,-d/2+.12],zeroFrame,group);addBox([w,.18,.12],[0,.28,d/2-.12],zeroFrame,group);});
    for(let z=12;z>-55;z-=8){const arch=new THREE.Mesh(new THREE.TorusGeometry(6.2,.08,12,48),zeroFrame);arch.position.set(0,3.2,z);arch.rotation.x=Math.PI/2;world.add(arch);const lamp=addArcLight([Math.sin(z)*4,3.7,z],z%16?ZERO.warm:ZERO.cyan,45,10);animated.push({type:"zeroLamp",light:lamp,phase:z});}
    makeZeroRoom(-11,3.4,-8,.4,true);makeZeroRoom(10,4.5,-24,-.35,true);makeZeroRoom(-8,2.8,-42,.75,false);makeZeroRoom(9,3.2,-47,-.7,false);
    const wreck=new THREE.Group();wreck.position.set(0,0,-39);wreck.rotation.set(.1,.28,-.08);world.add(wreck);addBox([5.8,.36,3.6],[0,.35,0],portDark,wreck);addBox([.18,2.4,3.1],[-2.6,1.3,0],portTrim,wreck);addBox([.18,2.1,2.8],[2.6,1.15,0],zeroGlass,wreck);addBox([4.2,.08,.16],[0,1.75,-1.55],zeroRed,wreck);
    zeroAnchors=[
      makeZeroAnchor("collar",[-7,1.05,-4],ZERO.cyan,""),
      makeZeroAnchor("feather",[7,1.05,-14],ZERO.amber,""),
      makeZeroAnchor("treat",[0,1.05,-26],0xfff0aa,""),
      makeZeroAnchor("wreck",[0,1.05,-38],ZERO.blue,"")
    ];
    waterLines=[
      addTube([[-7,.18,-4],[-2,.18,-9],[7,.18,-14]],.055,material(0x8b7d62,.25,.42,ZERO.cyan,.05)),
      addTube([[7,.18,-14],[4,.18,-21],[0,.18,-26]],.055,material(0x8b7d62,.25,.42,ZERO.amber,.05)),
      addTube([[0,.18,-26],[-2,.18,-34],[0,.18,-38]],.055,material(0x8b7d62,.25,.42,ZERO.warm,.05)),
      addTube([[0,.18,-38],[0,1.5,-44],[0,3.2,-50]],.06,material(0x8b7d62,.2,.38,ZERO.cyan,.05))
    ];
    for(let i=0;i<18;i++){const z=-7-i*1.55;makeRootMark(Math.sin(i*.8)*2.2,z,0xfff0aa);}
    makeFalseOwner([-9,0,-12],.55,"");makeFalseOwner([9,0,-24],-.55,"");makeFalseOwner([-6,0,-33],.2,"");
    makeZeroCatEcho([-4,.02,1],.82,true,false);makeZeroCatEcho([4,.02,-9],.62,false,true);makeZeroCatEcho([-3,.02,-18],.82,false,false);makeZeroCatEcho([5,.02,-31],.82,true,false);
    gloveObject=makeZeroGlove();gloveObject.visible=false;communicatorObject=makeCommunicator();
    routeBeam=new THREE.Mesh(new THREE.CylinderGeometry(.12,.5,22,18,true),new THREE.MeshBasicMaterial({color:ZERO.cyan,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));routeBeam.position.set(0,6.8,-59);routeBeam.rotation.x=.38;world.add(routeBeam);
    makeGatheringStars();coordinateOrb=makeCoordinateOrb();coordinatePanel=makeCoordinatePanel();
  }

  function buildChapter(chapter) {
    clearWorld(); state.chapter=chapter;state.stage=0;state.puzzleTurns=0;state.complete=false;state.memoryOpen=false;state.communicatorMemoryOpen=false;state.scent=false;state.nearby=null;state.alert=0;state.gloveHold=0;state.holdingGlove=false;state.zeroProgress=0;state.coordinateLocked=false;state.communicatorCollected=false;state.exitGateOpen=false;communicatorMemory.hidden=true;player.position.set(0,1.13,14);player.checkpoint.copy(player.position);player.yaw=0;player.pitch=0;player.velocityY=0;player.grounded=true;
    state.twoD = false; state.runner = chapter === 2;
    root.classList.remove("two-d-mode"); canvas.hidden=false; port2d.hidden=true;
    if(chapter===2) buildRunnerWorld(); else buildZeroPointTower();
    updateCopy();updateWorldState();
  }
  function legacyChapterConfig() { return state.chapter===2 ? { kicker:"第二章 · 百目港", gateKicker:"第二章 · 记忆锚点：逗猫棒", gateTitle:"外环逃逸航道", objective:["切到左侧跑道，追上第一束光羽","回到中间跑道，避开前方障碍","切到右侧并跳过能量栏，接住最后光羽","穿过前方的发光门"], memory:{k:"逗猫棒记忆 · 02",t:"一束追不上的光",p:"彩色羽毛在走廊尽头晃了一下。你扑过去，主人总会在最后一刻把它抬高，又在你快要失望时把它放回爪边。那时你只记得追逐和笑声。现在，逗猫棒的铃铛重新响起：原来那个一直陪你玩的人，从来没有离开过你的记忆。"}, complete:{k:"第二章完成",t:"追逐没有终点",p:"逗猫棒留下的铃声穿过港口噪音，点亮了下一处异常坐标。更温暖的气味，正从星环温室的方向传来。",next:"前往第三章"} } : { kicker:"第三章 · 零点塔", gateKicker:"第三章 · 记忆锚点：导航手套", gateTitle:"零点塔观测站", objective:["根据项圈蓝色脉冲识别真实声音","扑抓逗猫棒反光，击碎错误影像","开启感知，沿猫条气味找到稳定空间","读取远汐号残骸中的事故影像","顶住乱流，长按导航手套掌心"], memory:{k:"导航手套记忆 · 04",t:"不是不要你",p:"完整事故画面重新亮起。林澈把米粒放进动物休眠舱，将项圈信号接入救生系统，又把逗猫棒和猫条放进救生袋。米粒抓挠透明舱门时，林澈把手掌贴在同一个位置。\n“不是不要你。是要你活下去。”\n救生舱弹射前，破损舱门扯落了林澈的导航手套。米粒只看见那只手突然离开，于是把离别误记成了被放开。最后一段声音留在项圈里：往亮的地方走。我会找到你。"}, complete:{k:"归航信标启动",t:"林澈仍在发送定位",p:"灯泡读取手套里的身份芯片，确认信号来自遥远星域：林澈。它不是过去留下的录音，而是在固定周期内持续发送的求救定位。米粒依次放入项圈、逗猫棒、猫条包装和主人手套，四段时间坐标合成完整航线。青色航线从零点塔延伸向星海：归航并不是回到原点，是终于想起自己为什么出发。",next:"游戏结束 · 返回标题"} };
  }
  function chapterConfig() {
    if(state.chapter===2)return legacyChapterConfig();
    return {
      kicker:"第三章 · 零点塔",
      gateKicker:"第三章 · 坐标浮现",
      gateTitle:"零点塔观测站",
      objective:["向零点塔深处前进","拾取残骸旁的通讯器","靠近尽头的光球","林澈坐标已浮现"],
      memory:{k:"坐标信号",t:"林澈",p:"星光聚在米粒身边。远方传来持续发送的坐标：林澈仍在等待归航。"},
      complete:{k:"坐标锁定",t:"林澈坐标已浮现",p:"星光落在米粒身上，汇成一条暖白色航线。主人坐标已经锁定。",next:"返回标题"}
    };
  }
  function updateCopy() { const data=chapterConfig();kickerEl.textContent=data.kicker;gateKicker.textContent=data.gateKicker;gateTitle.textContent=data.gateTitle;gateHint.textContent=state.runner?"W S 调整速度 · A D 或左右方向键切换跑道 · 空格跳跃":state.chapter===3?"W A S D 移动 · 按 E 拾取通讯器与读取坐标":"鼠标控制视角 · W A S D 移动 · 空格跳跃 · Q 感知 · E 互动";completeKicker.textContent=data.complete.k;completeTitle.textContent=data.complete.t;completeText.textContent=data.complete.p;nextButton.textContent=data.complete.next; }
  function updateObjective() { const data=chapterConfig();while(stepsEl.children.length<data.objective.length)stepsEl.appendChild(document.createElement("i"));while(stepsEl.children.length>data.objective.length)stepsEl.lastElementChild.remove();let text=data.objective[Math.min(state.stage,data.objective.length-1)];if(state.chapter===3&&state.stage===4&&state.gloveHold>0)text=`长按导航手套掌心 ${Math.round(Math.min(1,state.gloveHold/2.25)*100)}%`;
    objectiveEl.textContent=text;[...stepsEl.children].forEach((dot,index)=>{dot.classList.toggle("done",index<state.stage);dot.classList.toggle("active",index===Math.min(state.stage,data.objective.length-1));}); }
  function updateWorldState() { updateObjective();root.classList.toggle("scent-on",state.scent);modeEl.textContent=state.runner?"自动奔跑":state.chapter===3?(state.coordinateLocked?"林澈坐标 · 已浮现":state.communicatorCollected?"零点塔 · 寻找光球":"零点塔 · 通讯信号"):state.scent?"感知模式 · 根系可见":"感知模式 · 关闭";if(state.chapter===3){const glowStep=state.zeroProgress*4;waterLines.forEach((line,index)=>{const active=index<glowStep;line.material.emissiveIntensity=active?2.4:.08;line.material.color.setHex(active?ZERO.cyan:0x8b7d62);});zeroAnchors.forEach((anchor,index)=>{const active=index<glowStep+.6;anchor.group.scale.setScalar(active?1.08:1);anchor.light.intensity=active?54:16;});if(gloveObject)gloveObject.visible=false;if(routeBeam)routeBeam.material.opacity=state.coordinateLocked ? .32 : 0;} }
  function showToast(text,duration=2800){clearTimeout(toastTimer);toastEl.textContent=text;toastEl.classList.add("visible");toastTimer=setTimeout(()=>toastEl.classList.remove("visible"),duration);}
  function ensureAudio(){if(window.startailAudio){window.startailAudio.unlock();return true;}const AudioContextClass=window.AudioContext||window.webkitAudioContext;if(!AudioContextClass)return false;if(!audioContext)audioContext=new AudioContextClass();if(audioContext.state==="suspended")audioContext.resume().catch(()=>{});return true;}
  function tone(freq,duration=.12,type="sine",gain=.035){try{if(window.startailAudio){window.startailAudio.tone(freq,duration,type,gain);return;}if(!ensureAudio())return;const o=audioContext.createOscillator(),g=audioContext.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(gain,audioContext.currentTime);g.gain.exponentialRampToValueAtTime(.0001,audioContext.currentTime+duration);o.connect(g).connect(audioContext.destination);o.start();o.stop(audioContext.currentTime+duration);}catch(_){}}
  function feedback(kind="tap"){if(window.startailAudio){if(kind==="error")window.startailAudio.error();else window.startailAudio.ui(kind);return;}tone(kind==="error"?145:kind==="soft"?280:430,kind==="error"?.18:.07,kind==="error"?"sawtooth":"triangle",.025);}
  function playFootstep(speed=4){const now=performance.now();if(now-state.lastStepTone<(speed>5?205:285))return;state.lastStepTone=now;tone(88+Math.random()*28,.055,"triangle",.014);}
  function setScent(force){if(state.twoD||state.runner||!state.playing||state.complete||state.chapter===3){feedback("error");return;}state.scent=typeof force==="boolean"?force:!state.scent;updateWorldState();tone(state.scent?550:210,.18,"sine",.025);}
  function showMemory(){const data=chapterConfig().memory;state.memoryOpen=true;state.playing=false;clearInput();memoryKicker.textContent=data.k;memoryTitle.textContent=data.t;memoryText.textContent=data.p;memoryEl.hidden=false;if(document.pointerLockElement===canvas)document.exitPointerLock();memoryContinue.focus();}
  function hideMemory(){if(memoryEl.hidden)return;memoryEl.hidden=true;state.memoryOpen=false;finishChapter();}
  function captureFeather(){if(state.twoD){collectPortFeather();return;}const previous=activeTarget;previous.visible=false;previous.userData.glow.visible=false;state.pawReachUntil=performance.now()+720;tone(650,.15,"triangle",.05);setTimeout(()=>tone(880,.28,"sine",.04),90);if(state.stage<2){state.stage++;activeTarget=guides[state.stage];activeTarget.visible=true;activeTarget.userData.glow.visible=true;targetLight.position.copy(activeTarget.position);player.checkpoint.copy(player.position);updateObjective();showToast(state.runner?(state.stage===1?"前方中央跑道亮起光羽，避开障碍后追上它。":"最后一束光羽在右侧，跳过能量栏！"):(state.stage===1?"光羽跃上了集装箱高台。跟上它。":"铃铛声穿过扫描区，光羽又飞远了。"),2600);}else{state.stage=3;updateObjective();if(state.chapter===2)openChapterExitGate();else showMemory();}}
  function startGloveHold(){if(state.stage!==4||state.nearby!=="glove")return;state.holdingGlove=true;progressEl.hidden=false;progressText.textContent="正在贴近导航手套掌心";progressFill.style.width=`${Math.min(100,state.gloveHold/2.25*100)}%`;}
  function stopGloveHold(){state.holdingGlove=false;if(state.chapter===3&&state.stage===4&&state.gloveHold<2.25)progressEl.hidden=true;}
  function solveGarden(){state.pawReachUntil=performance.now()+620;if(state.stage===0){state.stage=1;player.checkpoint.copy(player.position);showToast("项圈蓝色脉冲确认了真实声音。不要追逐红色影像。",3000);tone(540,.18,"sine",.05);}else if(state.stage===1){state.stage=2;player.checkpoint.copy(player.position);showToast("逗猫棒反光击碎了一层虚假离别，残影开始退开。",3000);tone(720,.16,"triangle",.045);setTimeout(()=>tone(880,.22,"sine",.035),90);}else if(state.stage===2){if(!state.scent){showToast("先按 Q 展开感知，让猫条气味指出稳定空间。",2300);return;}state.stage=3;player.checkpoint.copy(player.position);showToast("猫条气味稳定了重复走廊，观测核心的道路打开了。",3000);tone(480,.2,"sine",.05);}else if(state.stage===3){state.stage=4;state.gloveHold=0;player.checkpoint.copy(player.position);showToast("事故前后的影像重叠在远汐号残骸里。上方出现损坏的导航手套。",3600);tone(380,.2,"triangle",.045);setTimeout(()=>tone(620,.28,"sine",.04),140);}else if(state.stage===4){startGloveHold();}updateWorldState();}
  function collectCommunicator(){if(state.communicatorCollected||!communicatorObject)return;state.communicatorCollected=true;state.communicatorMemoryOpen=true;state.stage=2;state.nearby=null;state.playing=false;clearInput();communicatorObject.visible=false;communicatorMemory.hidden=false;promptEl.hidden=true;updateWorldState();tone(460,.2,"triangle",.045);setTimeout(()=>tone(720,.32,"sine",.04),120);if(document.pointerLockElement===canvas)document.exitPointerLock();communicatorContinue.focus();}
  function hideCommunicatorMemory(){if(communicatorMemory.hidden)return;communicatorMemory.hidden=true;state.communicatorMemoryOpen=false;state.playing=true;clearInput();updateWorldState();if(!isTouch&&canvas.requestPointerLock)canvas.requestPointerLock();}
  function revealCoordinate(){if(state.coordinateLocked||!state.communicatorCollected)return;state.coordinateLocked=true;state.stage=3;state.nearby=null;updateWorldState();tone(520,.22,"sine",.04);setTimeout(()=>tone(840,.38,"triangle",.04),150);clearTimeout(finalLaunchTimer);finalLaunchTimer=setTimeout(showFinalLaunch,2200);}
  function interact(){if(!state.playing){feedback("error");return;}if(state.chapter===3){if(state.nearby==="communicator")collectCommunicator();else if(state.nearby==="coordinate")revealCoordinate();else feedback("error");return;}if(state.twoD){feedback("soft");showToast("靠近发光羽毛即可自动收集。",1300);return;}if(state.runner){feedback("soft");showToast("航道会自动前进：切换跑道避障，按空格跳过低栏。",1800);return;}if(!state.nearby){feedback("error");return;}if(state.chapter===2)captureFeather();else solveGarden();}
  function resetChapterBridge(){bridgeVideo.pause();bridgeVideo.currentTime=0;bridgeEl.hidden=true;bridgeLaunch.hidden=true;bridgeSkipButton.hidden=false;bridgeEl.classList.remove("is-finished");bridgeProgress.style.width="0%";}
  function enterThirdChapter(){if(bridgeEl.hidden)return;resetChapterBridge();window.__starTailActiveChapter=3;window.dispatchEvent(new CustomEvent("startail:chapter-select",{detail:{chapter:3}}));window.dispatchEvent(new CustomEvent("startail:chapter-enter",{detail:{chapter:3}}));}
  function showChapterBridge(){if(state.chapter!==2||!bridgeEl.hidden)return;clearInput();state.playing=false;completeEl.hidden=true;bridgeEl.hidden=false;bridgeLaunch.hidden=true;bridgeSkipButton.hidden=false;bridgeEl.classList.remove("is-finished");bridgeProgress.style.width="0%";if(document.pointerLockElement===canvas)document.exitPointerLock();bridgeVideo.currentTime=0;bridgeVideo.muted=document.querySelector("#soundButton")?.classList.contains("muted")||false;const play=bridgeVideo.play();if(play?.catch)play.catch(()=>{bridgeVideo.muted=true;bridgeVideo.play().catch(showBridgeLaunch);});}
  function updateBridgeProgress(){if(Number.isFinite(bridgeVideo.duration)&&bridgeVideo.duration>0)bridgeProgress.style.width=`${Math.min(100,bridgeVideo.currentTime/bridgeVideo.duration*100)}%`;}
  function showBridgeLaunch(){if(bridgeEl.hidden)return;bridgeVideo.pause();bridgeEl.classList.add("is-finished");bridgeSkipButton.hidden=true;bridgeLaunch.hidden=false;bridgeProgress.style.width="100%";bridgeStartButton.focus();}
  function resetFinalSequence(){clearTimeout(finalLaunchTimer);clearTimeout(finalOptionsTimer);finalLaunchTimer=0;finalOptionsTimer=0;finalVideo.pause();finalVideo.currentTime=0;finalLaunch.hidden=true;finalLaunch.classList.remove("is-forming");finalVideoScreen.hidden=true;finalEnding.hidden=true;finalEnding.classList.remove("is-visible","show-options");finalOptions.hidden=true;document.body.classList.remove("later3d-final-running");}
  function showFinalLaunch(){if(!state.active||state.chapter!==3||!state.coordinateLocked)return;state.playing=false;clearInput();promptEl.hidden=true;document.body.classList.add("later3d-final-running");finalLaunch.hidden=false;finalLaunch.classList.remove("is-forming");requestAnimationFrame(()=>finalLaunch.classList.add("is-forming"));if(document.pointerLockElement===canvas)document.exitPointerLock();setTimeout(()=>{if(!finalLaunch.hidden)finalStartButton.focus();},1450);}
  function showFinalOptions(){if(finalEnding.hidden)return;finalOptions.hidden=false;finalEnding.classList.add("show-options");setTimeout(()=>{if(!finalOptions.hidden)finalReplayButton.focus();},850);}
  function showFinalEnding(){state.complete=true;state.playing=false;finalVideo.pause();finalVideoScreen.hidden=true;finalEnding.hidden=false;finalOptions.hidden=true;finalEnding.classList.remove("is-visible","show-options");requestAnimationFrame(()=>finalEnding.classList.add("is-visible"));clearTimeout(finalOptionsTimer);finalOptionsTimer=setTimeout(showFinalOptions,4800);}
  function startFinalVideo(){if(finalLaunch.hidden)return;finalLaunch.hidden=true;finalLaunch.classList.remove("is-forming");finalVideoScreen.hidden=false;finalVideo.currentTime=0;finalVideo.muted=document.querySelector("#soundButton")?.classList.contains("muted")||false;const play=finalVideo.play();if(play?.catch)play.catch(()=>{finalVideo.muted=true;finalVideo.play().catch(showFinalEnding);});}
  function replayFinalChapter(){resetFinalSequence();resetChapter();state.playing=true;gate.hidden=true;if(!isTouch&&canvas.requestPointerLock)canvas.requestPointerLock();}
  function openFinalChapterSelect(){resetFinalSequence();document.querySelector("#restartButton")?.click();}
  function returnFromFinal(){resetFinalSequence();window.__starTailActiveChapter=1;document.querySelector("#returnTitleButton")?.click();}
  function finishChapter(){state.complete=true;state.playing=false;state.holdingGlove=false;progressEl.hidden=true;updateWorldState();if(document.pointerLockElement===canvas)document.exitPointerLock();tone(430,.22,"sine",.05);setTimeout(()=>tone(660,.42,"triangle",.04),160);if(state.chapter===2){showChapterBridge();return;}completeEl.hidden=false;}
  function updateNearby(){state.nearby=null;let text="";if(state.twoD||state.runner){promptEl.hidden=true;touchInteract.classList.remove("ready");return;}if(state.chapter===3&&!state.communicatorCollected&&communicatorObject&&player.position.distanceTo(communicatorObject.position)<3.05){state.nearby="communicator";text="拾取远距通讯器";}else if(state.chapter===3&&state.communicatorCollected&&!state.coordinateLocked&&coordinateOrb&&player.position.distanceTo(coordinateOrb.position)<3.2){state.nearby="coordinate";text="触碰尽头的光球";}else if(state.chapter===2&&activeTarget&&player.position.distanceTo(activeTarget.position)<2.1){state.nearby="feather";text="接住逗猫棒光羽";}promptEl.hidden=!state.nearby;if(state.nearby){promptEl.querySelector("span").textContent=text;promptEl.querySelector("kbd").textContent="按 E";touchInteract.classList.add("ready");}else touchInteract.classList.remove("ready");}
  function isBlocked(x,z){const r=.31,limitX=state.chapter===3?15.6:11.72,limitZ=state.chapter===3?-61:-58;if(x<-limitX+r||x>limitX-r||z>17||z<limitZ)return true;for(const box of colliders){const cx=Math.max(box.minX,Math.min(x,box.maxX)),cz=Math.max(box.minZ,Math.min(z,box.maxZ));if((x-cx)**2+(z-cz)**2<r*r)return true;}const footHeight=player.position.y-1.13;for(const platform of platforms){if(x>platform.minX-r&&x<platform.maxX+r&&z>platform.minZ-r&&z<platform.maxZ+r&&footHeight<platform.height-.04)return true;}return false;}
  function groundAt(x,z){let height=0;for(const platform of platforms)if(x>platform.minX&&x<platform.maxX&&z>platform.minZ&&z<platform.maxZ)height=Math.max(height,platform.height);return height;}
  function resetCheckpoint(message){player.position.copy(player.checkpoint);player.velocityY=0;player.grounded=true;state.alert=0;root.classList.add("hit");setTimeout(()=>root.classList.remove("hit"),500);showToast(message);tone(90,.35,"sawtooth",.045);}
  function jump(){if(state.twoD){port2DJump();return;}if(!state.playing||!player.grounded||!pauseScreen.hidden){feedback("error");return;}player.velocityY=5.45;player.grounded=false;tone(175,.1,"triangle",.024);}
  function updateMovement(dt){if(state.twoD){updatePort2D(dt);return;}if(!state.playing||state.complete||!pauseScreen.hidden){player.moving=false;return;}const f=(keys.has("KeyW")||keys.has("ArrowUp")?1:0)-(keys.has("KeyS")||keys.has("ArrowDown")?1:0)-state.touchMove.y;const s=(keys.has("KeyD")||keys.has("ArrowRight")?1:0)-(keys.has("KeyA")||keys.has("ArrowLeft")?1:0)+state.touchMove.x;const length=Math.hypot(f,s);let speed=4.1;if(length>.08){const forward=f/Math.max(1,length),side=s/Math.max(1,length);speed=keys.has("ShiftLeft")||keys.has("ShiftRight")?6:4.1;const dx=(Math.sin(player.yaw)*forward+Math.cos(player.yaw)*side)*speed*dt,dz=(-Math.cos(player.yaw)*forward+Math.sin(player.yaw)*side)*speed*dt;if(!isBlocked(player.position.x+dx,player.position.z))player.position.x+=dx;if(!isBlocked(player.position.x,player.position.z+dz))player.position.z+=dz;player.moving=true;player.step+=dt*speed*2.4;}else player.moving=false;const previousFoot=player.position.y-1.13;player.velocityY-=10.8*dt;player.position.y+=player.velocityY*dt;const terrain=groundAt(player.position.x,player.position.z),foot=player.position.y-1.13;if(player.velocityY<=0&&foot<=terrain&&previousFoot>=terrain-.05){player.position.y=terrain+1.13;player.velocityY=0;player.grounded=true;}else player.grounded=false;if(player.moving&&player.grounded)playFootstep(speed);if(player.position.y<-2)resetCheckpoint("跌回了下层货道，已返回最近检查点。");}
  const updateFreeMovement = updateMovement;
  updateMovement = function updateMovementWithRunner(dt){ if(state.runner){ updateRunner(dt); return; } updateFreeMovement(dt); };
  function updateScanners(dt,time){if(state.chapter!==2||state.twoD||state.runner||!state.playing)return;let detected=false;for(const scanner of scanners){scanner.drone.position.x=scanner.origin.x+Math.sin(time*.72+scanner.phase)*4.3;scanner.drone.position.y=scanner.origin.y+Math.sin(time*2+scanner.phase)*.16;scanner.drone.rotation.y=Math.sin(time*.72+scanner.phase)>0?Math.PI:0;scanner.beam.material.opacity=.045+Math.abs(Math.sin(time*2+scanner.phase))*.07;const dist=scanner.drone.position.distanceTo(player.position);if(dist<5.4&&player.position.y<scanner.drone.position.y+.8)detected=true;}state.alert=THREE.MathUtils.clamp(state.alert+(detected?32:-22)*dt,0,100);alertEl.style.width=`${state.alert}%`;alertEl.parentElement.classList.toggle("visible",state.alert>2);if(state.alert>99&&performance.now()-state.lastAlertReset>1200){state.lastAlertReset=performance.now();resetCheckpoint("扫描眼锁定了米粒，已返回最近的安全货台。");}}
  function updateZeroJourney(dt,time){
    const progress=THREE.MathUtils.clamp((14-player.position.z)/62,0,1);
    if(progress>state.zeroProgress+.002)state.zeroProgress=THREE.MathUtils.lerp(state.zeroProgress,progress,Math.min(1,dt*7));
    const stage=state.coordinateLocked?3:state.communicatorCollected?2:state.zeroProgress>.54?1:0;
    if(stage!==state.stage){state.stage=stage;updateWorldState();tone(stage===1?560:760,.18,"sine",.032);}
    gatheringStars.forEach((star,index)=>{
      const gather=THREE.MathUtils.smoothstep(state.zeroProgress,.18+index*.008,.62+index*.008);
      const angle=time*(.7+index%4*.12)+star.userData.phase;
      const radius=.78+(index%6)*.12;
      temp.set(Math.cos(angle)*radius,2.25+Math.sin(angle*1.7)*.56, -54.5+Math.sin(angle)*radius*.52);
      star.position.lerpVectors(star.userData.home,temp,gather);
      star.material.opacity=.08+gather*.27+Math.max(0,Math.sin(time*1.8+index))*.08;
      star.scale.setScalar(.06+gather*.09);
    });
    if(coordinateOrb){const pulse=1+Math.sin(time*2.3)*.08;coordinateOrb.scale.setScalar(pulse);coordinateOrb.userData.glowMaterial.opacity=state.coordinateLocked?.18:.26+Math.sin(time*2.3)*.06;coordinateOrb.userData.coreMaterial.opacity=state.coordinateLocked?.78:.94;coordinateOrb.userData.rings.forEach((ring,index)=>{ring.rotation.z+=dt*(.48+index*.16);ring.material.opacity=state.coordinateLocked?.2:.42+Math.sin(time*2+index)*.08;});coordinateOrb.userData.light.intensity=state.coordinateLocked?55:76+Math.sin(time*2)*10;}
    const coordinateOpacity=state.coordinateLocked?1:0;
    if(coordinatePanel){
      coordinatePanel.userData.panelMaterial.opacity=THREE.MathUtils.lerp(coordinatePanel.userData.panelMaterial.opacity,coordinateOpacity,Math.min(1,dt*3.4));
      coordinatePanel.userData.haloMaterial.opacity=THREE.MathUtils.lerp(coordinatePanel.userData.haloMaterial.opacity,coordinateOpacity*.58,Math.min(1,dt*3.4));
      coordinatePanel.rotation.y=Math.sin(time*.45)*.045;
    }
    if(coordinateLight)coordinateLight.intensity=THREE.MathUtils.lerp(coordinateLight.intensity,coordinateOpacity*92,Math.min(1,dt*3.4));
    if(routeBeam)routeBeam.material.opacity=THREE.MathUtils.lerp(routeBeam.material.opacity,coordinateOpacity*.34,Math.min(1,dt*3.4));
  }
  function updateGloveHold(dt){if(state.chapter!==3||state.stage!==4)return;if(gloveObject&&player.position.z<-43.5&&!state.holdingGlove)player.position.z+=dt*(1.15+Math.max(0,-45-player.position.z)*.18);if(state.holdingGlove&&state.nearby==="glove"){state.gloveHold=Math.min(2.25,state.gloveHold+dt);progressFill.style.width=`${state.gloveHold/2.25*100}%`;updateObjective();if(state.gloveHold>=2.25){state.stage=5;state.holdingGlove=false;progressEl.hidden=true;tone(520,.22,"sine",.05);setTimeout(()=>tone(840,.42,"triangle",.045),130);updateWorldState();showMemory();}}else if(!state.holdingGlove&&state.gloveHold>0&&state.gloveHold<2.25){state.gloveHold=Math.max(0,state.gloveHold-dt*.35);}}
  function updateWorld(dt,time){if(state.chapter===2&&!state.twoD){guides.forEach((guide,index)=>{guide.rotation.y+=dt*(1.2+index*.1);if(index===state.stage)guide.position.y=guide.userData.baseY+Math.sin(time*3+index)*.12;if(guide.userData.glow){guide.userData.glow.position.copy(guide.position);guide.userData.glow.scale.setScalar(1.2+Math.sin(time*4+index)*.16);}});if(targetLight&&activeTarget){targetLight.position.copy(activeTarget.position);targetLight.intensity=50+Math.sin(time*5)*10;}}
    if(state.chapter===3){scentMarks.forEach((mark,index)=>mark.material.opacity=THREE.MathUtils.lerp(mark.material.opacity,.18+Math.max(0,Math.sin(time*3-index*.45))*.32,Math.min(1,dt*4)));falseEchoes.forEach(echo=>{echo.children.forEach(child=>{if(child.material&&"opacity"in child.material)child.material.opacity=.12+Math.sin(time*1.7+echo.position.x)*.06;});});timeGhosts.forEach((ghost,index)=>{ghost.position.y=.02+Math.sin(time*1.4+index)*.05;ghost.rotation.y=Math.sin(time*.8+index)*.18;});updateZeroJourney(dt,time);}
    animated.forEach(item=>{if(item.type==="crane")item.group.position.y=Math.sin(time*.7)*.08;if(item.type==="gardenLight"||item.type==="zeroLamp")item.light.intensity=45+Math.sin(time*1.5+item.phase)*10;if(item.type==="bud"){const size=.32+Math.sin(time*2+item.phase)*.055;item.sprite.scale.setScalar(size);}if(item.type==="zeroAnchor")item.group.position.y=.05+Math.sin(time*2+item.phase)*.06;if(item.type==="zeroGhostRoom")item.group.position.y+=Math.sin(time*.8+item.phase)*dt*.05;if(item.type==="zeroGlove")item.group.rotation.y+=dt*.55;if(item.type==="gloveRing")item.group.rotation.z+=dt*(.35+item.phase*.1);if(item.type==="communicator"){item.group.position.y=item.group.userData.baseY+Math.sin(time*1.8)*.1;item.group.rotation.y+=dt*.34;item.group.userData.signal.rotation.z+=dt*.7;item.group.userData.screen.material.opacity=.78+Math.sin(time*3.2)*.18;item.group.userData.light.intensity=62+Math.sin(time*2.2)*12;}if(item.type==="exitGate"){const pulse=1+Math.sin(time*2.4)*.055;item.group.scale.setScalar(pulse);item.group.userData.fieldMaterial.opacity=.15+Math.sin(time*2.4)*.06;item.group.userData.halo.rotation.z+=dt*.8;item.group.userData.light.intensity=76+Math.sin(time*2.4)*14;}});updateScanners(dt,time);
  }
  function updatePaws(time){const walk=player.moving&&player.grounded&&state.playing?Math.sin(player.step):Math.sin(time*1.4)*.1;const bob=player.moving&&player.grounded?Math.abs(Math.sin(player.step*.5))*.026:0;leftPaw.position.set(-.24,-.45-bob+Math.max(0,walk)*.014,-.67+Math.max(0,walk)*.045);rightPaw.position.set(.24,-.45-bob-Math.min(0,walk)*.014,-.67+Math.max(0,-walk)*.045);leftPaw.rotation.z=-.04+walk*.035;rightPaw.rotation.z=.04-walk*.035;const reach=state.pawReachUntil-performance.now();if(reach>0){const amount=Math.sin((1-reach/720)*Math.PI);rightPaw.position.x-=amount*.05;rightPaw.position.y+=amount*.18;rightPaw.position.z+=amount*.15;rightPaw.rotation.x=amount*.2;}else rightPaw.rotation.x=-.03;}
  function updateCamera(){camera.position.copy(player.position);camera.rotation.y=state.runner?0:player.yaw;camera.rotation.x=state.runner?0:player.pitch;camera.rotation.z=0;}
  function animate(){requestAnimationFrame(animate);const dt=Math.min(.04,clock.getDelta()),time=clock.elapsedTime;if(state.active){updateMovement(dt);updateNearby();updateWorld(dt,time);updatePaws(time);updateCamera();}renderer.render(scene,camera);}animate();
  function setSize(){const width=Math.max(1,root.clientWidth),height=Math.max(1,root.clientHeight);renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();}new ResizeObserver(setSize).observe(root);setSize();
  function clearInput(){keys.clear();state.touchMove.x=state.touchMove.y=0;state.stickPointer=null;state.holdingGlove=false;stickKnob.style.transform="translate(0,0)";player.moving=false;}
  function resetChapter(){resetChapterBridge();resetFinalSequence();buildChapter(state.chapter);memoryEl.hidden=true;completeEl.hidden=true;progressEl.hidden=true;showToast(state.chapter===2?"外环航道已开启：跟随光羽，切换跑道并跳过低栏。":"零点塔的走廊正在重复，只有熟悉气味没有被扭曲。",3800);}
  function enterPlay(){clearInput();ensureAudio();state.playing=true;gate.hidden=true;if(!isTouch&&!state.twoD&&canvas.requestPointerLock)canvas.requestPointerLock();}
  function showResume(){if(!state.active||state.complete||state.memoryOpen||state.communicatorMemoryOpen||!pauseScreen.hidden||isTouch)return;clearInput();state.playing=false;gate.hidden=false;gateTitle.textContent="继续探索";enterButton.textContent="返回场景";}
  function selectChapter(chapter){const shouldActive=gameScreen.classList.contains("is-active")&&chapter>=2;if(!shouldActive){resetChapterBridge();resetFinalSequence();if(state.active){state.active=false;root.hidden=true;gameScreen.classList.remove("later-chapter-active");}document.body.classList.remove("later-chapter-running");return;}const changed=state.chapter!==chapter;if(!state.active||changed){resetChapterBridge();resetFinalSequence();state.active=true;root.hidden=false;gameScreen.classList.add("later-chapter-active");document.body.classList.add("later-chapter-running");buildChapter(chapter);memoryEl.hidden=true;completeEl.hidden=true;progressEl.hidden=true;state.memoryOpen=false;state.holdingGlove=false;state.playing=false;gate.hidden=false;enterButton.textContent="进入场景";} }
  function syncActive(){const chapter=window.__starTailActiveChapter||1;if(chapter>=2)selectChapter(chapter);else selectChapter(0);}

  window.addEventListener("startail:chapter-select",event=>selectChapter(event.detail?.chapter||window.__starTailActiveChapter||1));
  window.addEventListener("startail:chapter-enter",event=>{const chapter=event.detail?.chapter||window.__starTailActiveChapter||1;if(chapter<2)return;window.__starTailActiveChapter=chapter;selectChapter(chapter);if(state.active)enterPlay();});
  new MutationObserver(syncActive).observe(gameScreen,{attributes:true,attributeFilter:["class"]});
  enterButton.addEventListener("click",enterPlay);memoryContinue.addEventListener("click",hideMemory);communicatorContinue.addEventListener("click",hideCommunicatorMemory);replayButton.addEventListener("click",()=>{resetChapter();state.playing=true;if(!isTouch&&!state.twoD&&canvas.requestPointerLock)canvas.requestPointerLock();});
  bridgeVideo.addEventListener("timeupdate",updateBridgeProgress);bridgeVideo.addEventListener("ended",showBridgeLaunch);bridgeSkipButton.addEventListener("click",showBridgeLaunch);bridgeStartButton.addEventListener("click",enterThirdChapter);
  finalStartButton.addEventListener("click",startFinalVideo);finalVideo.addEventListener("ended",showFinalEnding);
  finalReplayButton.addEventListener("click",replayFinalChapter);finalChaptersButton.addEventListener("click",openFinalChapterSelect);finalReturnButton.addEventListener("click",returnFromFinal);
  nextButton.addEventListener("click",()=>{if(state.chapter===2){window.__starTailActiveChapter=3;window.dispatchEvent(new CustomEvent("startail:chapter-select",{detail:{chapter:3}}));window.dispatchEvent(new CustomEvent("startail:chapter-enter",{detail:{chapter:3}}));}else{window.__starTailActiveChapter=1;document.querySelector("#returnTitleButton")?.click();}});
  canvas.addEventListener("click",()=>{if(state.active&&!state.twoD&&state.playing&&!isTouch&&document.pointerLockElement!==canvas&&pauseScreen.hidden){feedback("soft");canvas.requestPointerLock();}});
  document.addEventListener("pointerlockchange",()=>{if(state.active&&document.pointerLockElement!==canvas&&state.playing)showResume();});
  document.addEventListener("mousemove",event=>{if(!state.active||document.pointerLockElement!==canvas||!state.playing)return;player.yaw-=event.movementX*.00215;player.pitch=THREE.MathUtils.clamp(player.pitch-event.movementY*.00185,-.92,.78);});
  window.addEventListener("keydown",event=>{if(!state.active)return;if(!bridgeEl.hidden){if(["Escape","Enter","Space"].includes(event.code)){event.preventDefault();event.stopImmediatePropagation();if(event.repeat)return;feedback(bridgeLaunch.hidden?"soft":"confirm");if(event.code==="Escape"||bridgeLaunch.hidden)showBridgeLaunch();else enterThirdChapter();}return;}if(!finalLaunch.hidden||!finalVideoScreen.hidden||!finalEnding.hidden){if(["Escape","Enter","Space"].includes(event.code)){event.preventDefault();event.stopImmediatePropagation();if(!event.repeat&&!finalLaunch.hidden&&["Enter","Space"].includes(event.code))startFinalVideo();else if(!event.repeat&&!finalOptions.hidden){if(event.code==="Escape")returnFromFinal();else if(finalOptions.contains(document.activeElement))document.activeElement.click();}}return;}if(state.communicatorMemoryOpen){if(["Escape","Enter","Space","KeyE"].includes(event.code)){event.preventDefault();event.stopImmediatePropagation();hideCommunicatorMemory();}return;}if(state.memoryOpen){if(["Escape","Enter","Space","KeyE"].includes(event.code)){event.preventDefault();event.stopImmediatePropagation();hideMemory();}return;}const handled=["KeyW","KeyA","KeyS","KeyD","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space","KeyQ","KeyE","ShiftLeft","ShiftRight","Escape"].includes(event.code);if(handled){event.preventDefault();event.stopImmediatePropagation();}if(event.repeat&&["Space","KeyQ"].includes(event.code))return;if(event.code==="Escape"){clearInput();if(document.pointerLockElement===canvas)document.exitPointerLock();if(pauseScreen.hidden)pauseButton.click();else resumeButton.click();return;}if(!pauseScreen.hidden||!state.playing)return;if(state.runner&&!event.repeat&&runner.keyReady&&(event.code==="KeyA"||event.code==="ArrowLeft"||event.code==="KeyD"||event.code==="ArrowRight")){changeRunnerLane(event.code==="KeyD"||event.code==="ArrowRight"?1:-1);runner.keyReady=false;}if(["KeyW","KeyA","KeyS","KeyD","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","ShiftLeft","ShiftRight"].includes(event.code))keys.add(event.code);if(event.code==="Space")jump();if(event.code==="KeyQ")setScent();if(event.code==="KeyE")interact();},true);
  window.addEventListener("keyup",event=>{if(!state.active)return;if(["KeyW","KeyA","KeyS","KeyD","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space","KeyQ","KeyE","ShiftLeft","ShiftRight"].includes(event.code)){event.preventDefault();event.stopImmediatePropagation();}if(event.code==="KeyE")stopGloveHold();keys.delete(event.code);},true);
  window.addEventListener("blur",()=>{if(state.active){clearInput();if(document.pointerLockElement===canvas)document.exitPointerLock();}});document.addEventListener("visibilitychange",()=>{if(document.hidden&&state.active)clearInput();});pauseButton?.addEventListener("click",()=>{if(state.active)clearInput();});resumeButton?.addEventListener("click",()=>{if(!state.active||state.complete)return;clearInput();state.playing=true;gate.hidden=true;if(!isTouch&&!state.twoD&&canvas.requestPointerLock)canvas.requestPointerLock();});restartButton?.addEventListener("click",()=>{if(!state.active)return;resetChapter();state.playing=true;gate.hidden=true;if(!isTouch&&!state.twoD&&canvas.requestPointerLock)canvas.requestPointerLock();});
  function updateStick(event){const rect=stick.getBoundingClientRect();let x=(event.clientX-(rect.left+rect.width/2))/(rect.width*.34),y=(event.clientY-(rect.top+rect.height/2))/(rect.height*.34);const len=Math.hypot(x,y);if(len>1){x/=len;y/=len;}state.touchMove.x=x;state.touchMove.y=y;stickKnob.style.transform=`translate(${x*31}px,${y*31}px)`;}
  stick.addEventListener("pointerdown",event=>{feedback("soft");state.stickPointer=event.pointerId;stick.setPointerCapture(event.pointerId);updateStick(event);});stick.addEventListener("pointermove",event=>{if(event.pointerId===state.stickPointer)updateStick(event);});const stopStick=event=>{if(event.pointerId!==state.stickPointer)return;state.stickPointer=null;state.touchMove.x=state.touchMove.y=0;stickKnob.style.transform="translate(0,0)";};stick.addEventListener("pointerup",stopStick);stick.addEventListener("pointercancel",stopStick);
  lookzone.addEventListener("pointerdown",event=>{feedback("soft");state.lookPointer=event.pointerId;state.lookLast.x=event.clientX;state.lookLast.y=event.clientY;lookzone.setPointerCapture(event.pointerId);});lookzone.addEventListener("pointermove",event=>{if(event.pointerId!==state.lookPointer||!state.playing)return;const dx=event.clientX-state.lookLast.x,dy=event.clientY-state.lookLast.y;state.lookLast.x=event.clientX;state.lookLast.y=event.clientY;player.yaw-=dx*.0062;player.pitch=THREE.MathUtils.clamp(player.pitch-dy*.0052,-.92,.78);});["pointerup","pointercancel"].forEach(type=>lookzone.addEventListener(type,event=>{if(event.pointerId===state.lookPointer)state.lookPointer=null;}));touchSense.addEventListener("click",()=>setScent());touchJump.addEventListener("click",jump);touchInteract.addEventListener("pointerdown",event=>{if(state.chapter===3&&state.nearby==="glove"){event.preventDefault();interact();}});["pointerup","pointercancel","pointerleave"].forEach(type=>touchInteract.addEventListener(type,stopGloveHold));touchInteract.addEventListener("click",()=>{if(!(state.chapter===3&&state.nearby==="glove"))interact();});
  port2dFeathers.forEach((feather, index) => feather.addEventListener("click", () => { if (state.twoD && state.playing && index === state.stage) collectPortFeather(); }));
  window.__starTailLaterChapters={select:chapter=>{window.__starTailActiveChapter=chapter;selectChapter(chapter);},snapshot:()=>({chapter:state.chapter,stage:state.stage,complete:state.complete,position:player.position.toArray(),scent:state.scent,zeroProgress:state.zeroProgress,communicatorCollected:state.communicatorCollected,coordinateLocked:state.coordinateLocked})};syncActive();
})();
