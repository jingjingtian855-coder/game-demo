import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import bulbRobotUrl from "./assets/models/ue5-source/SM_BulbRobot.glb";
import catBackpackUrl from "./assets/models/ue5-source/SM_CatBackpack.glb";
import energyCoreUrl from "./assets/models/ue5-source/SM_EnergyCore.glb";
import ecologyPodUrl from "./assets/models/ue5-source/SM_EcologyPod.glb";
import escapePodUrl from "./assets/models/ue5-source/SM_EscapePod.glb";

(() => {
  "use strict";

  const gameScreen = document.querySelector("#gameScreen");
  if (!gameScreen) return;

  const root = document.createElement("div");
  root.id = "chapterOne3d";
  root.setAttribute("aria-label", "第一章实时三维关卡");
  root.innerHTML = `
    <canvas id="chapter3dCanvas" aria-label="第一人称三维游戏画面"></canvas>
    <div class="chapter3d-grade" aria-hidden="true"></div>
    <div class="chapter3d-hud">
      <section class="chapter3d-objective" aria-live="polite">
        <small>第一章 · 失联</small>
        <strong id="chapter3dObjective">找到记忆锚点：项圈</strong>
        <div class="chapter3d-steps" aria-hidden="true"><i class="active"></i><i></i><i></i></div>
      </section>
      <div class="chapter3d-scent" id="chapter3dScent"><i></i><span>感知关闭</span></div>
      <div class="chapter3d-alert" id="chapter3dAlert"><span>巡逻机警戒</span><i><b></b></i></div>
    </div>
    <div class="chapter3d-crosshair" id="chapter3dCrosshair" aria-hidden="true"><i></i></div>
    <div class="chapter3d-prompt" id="chapter3dPrompt" hidden><kbd>按住 E</kbd><span>互动</span></div>
    <div class="chapter3d-progress" id="chapter3dProgress" hidden><i></i><span>正在抓挠电缆</span></div>
    <div class="chapter3d-toast" id="chapter3dToast" aria-live="polite"></div>
    <section class="chapter3d-memory" id="chapter3dMemory" role="dialog" aria-modal="true" aria-labelledby="chapter3dMemoryTitle" hidden>
      <article class="chapter3d-memory-card">
        <span class="chapter3d-memory-kicker">项圈记忆 · 01</span>
        <h2 id="chapter3dMemoryTitle">雨里的名字</h2>
        <p>货运港的灯坏了一半，水滴顺着金属屋檐落下。小小的它躲在空货箱里，尾巴紧紧贴着身体。有人经过，有人停下，又很快离开。</p>
        <p>只有一个人蹲了下来。</p>
        <p>那个人没有说太多话，只把自己的外套铺在箱口，又把一只旧项圈轻轻放在上面。</p>
        <p>雨声里，项圈亮起一行小小的字：</p>
        <strong class="chapter3d-memory-name">MILI</strong>
        <p>那个人笑了一下。</p>
        <button id="chapter3dMemoryContinue" type="button">收起记忆 · 继续前行</button>
      </article>
    </section>
    <section class="chapter3d-gate" id="chapter3dGate">
      <div>
        <span>第一章</span>
        <h2>失联舱段</h2>
        <p id="chapter3dGateHint">鼠标控制视角 · W A S D 移动 · 空格跳跃 · Q 感知 · E 互动</p>
        <button id="chapter3dEnter" type="button">进入场景</button>
      </div>
    </section>
    <section class="chapter3d-complete" id="chapter3dComplete" hidden>
      <div>
        <span>检查点已抵达</span>
        <h2>第一章完成</h2>
        <p>项圈唤回了第一段记忆：一双手曾把你从纸箱里抱起，并轻声叫你“米粒”。更远处，还有熟悉的气味等待回应。</p>
        <button id="chapter3dNext" class="chapter3d-next" type="button">前往第二章</button>
        <button id="chapter3dReplay" type="button">重新游玩</button>
      </div>
    </section>
    <section class="chapter3d-bridge" id="chapter3dBridge" aria-label="第一章到第二章过场" hidden>
      <video id="chapter3dBridgeVideo" preload="auto" playsinline>
        <source src="assets/video/chapter-bridge/chapter-1-to-2.mp4" type="video/mp4" />
      </video>
      <div class="chapter3d-bridge-shade" aria-hidden="true"></div>
      <header class="chapter3d-bridge-chrome">
        <div class="chapter3d-bridge-progress"><i id="chapter3dBridgeProgress"></i></div>
        <button id="chapter3dBridgeSkip" type="button">跳过过场</button>
      </header>
      <div class="chapter3d-bridge-launch" id="chapter3dBridgeLaunch" hidden>
        <span>CHAPTER 02 / PORT OF EYES</span>
        <h2>出发</h2>
        <p>港口的霓虹重新亮起，下一段记忆正从噪声里发出回响。</p>
        <button id="chapter3dBridgeStart" type="button">出发</button>
      </div>
    </section>
    <div class="chapter3d-lookzone" id="chapter3dLookzone" aria-hidden="true"></div>
    <div class="chapter3d-touch" aria-label="触屏游戏控制">
      <div class="chapter3d-joystick" id="chapter3dJoystick"><i></i></div>
      <div class="chapter3d-touch-actions">
        <button id="chapter3dTouchSense" type="button">感知</button>
        <button id="chapter3dTouchJump" type="button">跳</button>
        <button id="chapter3dTouchInteract" class="main" type="button">互动</button>
      </div>
    </div>
    <div class="chapter3d-rotate"><span>请将设备旋转至横屏游玩</span></div>
    <div class="chapter3d-damage" aria-hidden="true"></div>
  `;
  gameScreen.prepend(root);

  const canvas = root.querySelector("#chapter3dCanvas");
  const gate = root.querySelector("#chapter3dGate");
  const gateHint = root.querySelector("#chapter3dGateHint");
  const enterButton = root.querySelector("#chapter3dEnter");
  const objectiveEl = root.querySelector("#chapter3dObjective");
  const promptEl = root.querySelector("#chapter3dPrompt");
  const progressEl = root.querySelector("#chapter3dProgress");
  const progressFill = progressEl.querySelector("i");
  const toastEl = root.querySelector("#chapter3dToast");
  const memoryEl = root.querySelector("#chapter3dMemory");
  const memoryContinueButton = root.querySelector("#chapter3dMemoryContinue");
  const scentEl = root.querySelector("#chapter3dScent");
  const alertEl = root.querySelector("#chapter3dAlert");
  const alertFill = alertEl.querySelector("b");
  const completeEl = root.querySelector("#chapter3dComplete");
  const nextButton = root.querySelector("#chapter3dNext");
  const replayButton = root.querySelector("#chapter3dReplay");
  const bridgeEl = root.querySelector("#chapter3dBridge");
  const bridgeVideo = root.querySelector("#chapter3dBridgeVideo");
  const bridgeProgress = root.querySelector("#chapter3dBridgeProgress");
  const bridgeSkipButton = root.querySelector("#chapter3dBridgeSkip");
  const bridgeLaunch = root.querySelector("#chapter3dBridgeLaunch");
  const bridgeStartButton = root.querySelector("#chapter3dBridgeStart");
  const joystick = root.querySelector("#chapter3dJoystick");
  const joystickKnob = joystick.querySelector("i");
  const lookzone = root.querySelector("#chapter3dLookzone");
  const touchSense = root.querySelector("#chapter3dTouchSense");
  const touchJump = root.querySelector("#chapter3dTouchJump");
  const touchInteract = root.querySelector("#chapter3dTouchInteract");
  const pauseScreen = document.querySelector("#pauseScreen");
  const pauseButton = document.querySelector("#pauseButton");
  const resumeButton = document.querySelector("#resumeButton");
  const restartButton = document.querySelector("#restartButton");
  const isTouch = matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;
  root.classList.toggle("touch-mode", isTouch);
  if (isTouch) gateHint.textContent = "左侧摇杆移动 · 右侧拖动视角 · 使用右下角动作按钮";

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  } catch (error) {
    gate.querySelector("h2").textContent = "无法启动三维场景";
    gate.querySelector("p").textContent = "当前浏览器未开启 WebGL，请启用硬件加速后重新打开。";
    enterButton.hidden = true;
    return;
  }

  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020711);
  scene.fog = new THREE.FogExp2(0x030914, 0.024);

  const camera = new THREE.PerspectiveCamera(72, 1, 0.05, 130);
  camera.rotation.order = "YXZ";
  scene.add(camera);

  const clock = new THREE.Clock();
  const keys = new Set();
  const colliders = [];
  const blockerMeshes = [];
  const scentPrints = [];
  const interactiveLights = [];
  const tempVector = new THREE.Vector3();
  const tempVectorB = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();
  let toastTimer = 0;
  let audioContext = null;

  const player = {
    position: new THREE.Vector3(0, 1.13, 14),
    checkpoint: new THREE.Vector3(0, 1.13, 14),
    yaw: 0,
    pitch: 0,
    velocityY: 0,
    grounded: true,
    step: 0,
    moving: false
  };

  const state = {
    active: false,
    playing: false,
    complete: false,
    memoryOpen: false,
    stage: 0,
    scent: false,
    holdingInteract: false,
    scratch: 0,
    scratchStartedAt: 0,
    doorAmount: 0,
    alert: 0,
    nearby: null,
    touchMove: { x: 0, y: 0 },
    joystickPointer: null,
    lookPointer: null,
    lookLast: { x: 0, y: 0 },
    lastRobotHit: 0,
    lastScratchTone: 0,
    pawReachUntil: 0
  };

  const colors = {
    ink: 0x07111f,
    metal: 0x223345,
    metal2: 0x3d4e5c,
    cyan: 0x27e0d1,
    blue: 0x3aaef2,
    magenta: 0xff2d87,
    amber: 0xffb329,
    orange: 0xc96823,
    orangeLight: 0xef9a45,
    danger: 0xff284c
  };

  function material(color, metalness = 0.4, roughness = 0.62, emissive = 0x000000, emissiveIntensity = 0) {
    return new THREE.MeshStandardMaterial({ color, metalness, roughness, emissive, emissiveIntensity });
  }

  function seededRandom(seed) {
    let value = seed >>> 0;
    return () => {
      value = (value * 1664525 + 1013904223) >>> 0;
      return value / 4294967296;
    };
  }

  function makeFurTexture() {
    const furCanvas = document.createElement("canvas");
    furCanvas.width = furCanvas.height = 512;
    const context = furCanvas.getContext("2d");
    const gradient = context.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, "#f4a54f");
    gradient.addColorStop(.48, "#cc6725");
    gradient.addColorStop(1, "#f2a05a");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 512);

    const random = seededRandom(32459);
    const stripes = [76, 224, 386];
    stripes.forEach((center, stripeIndex) => {
      context.fillStyle = stripeIndex === 1 ? "rgba(78,25,9,.48)" : "rgba(91,30,10,.4)";
      context.beginPath();
      context.moveTo(0, center - 24);
      for (let x = 0; x <= 512; x += 32) context.lineTo(x, center - 18 + Math.sin(x * .035 + stripeIndex) * 13);
      for (let x = 512; x >= 0; x -= 32) context.lineTo(x, center + 22 + Math.sin(x * .03 + stripeIndex + 1.3) * 11);
      context.closePath();
      context.fill();
    });

    for (let i = 0; i < 3600; i++) {
      const x = random() * 512;
      const y = random() * 512;
      const length = 2.5 + random() * 9;
      const light = random() > .58;
      context.strokeStyle = light ? `rgba(255,224,167,${.05 + random() * .19})` : `rgba(92,29,9,${.035 + random() * .14})`;
      context.lineWidth = .45 + random() * 1.2;
      context.beginPath();
      context.moveTo(x, y);
      context.quadraticCurveTo(x + (random() - .5) * 3, y + length * .5, x + (random() - .5) * 4, y + length);
      context.stroke();
    }

    const texture = new THREE.CanvasTexture(furCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1.25, 2.4);
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return texture;
  }

  function makeMetalSurfaceTexture() {
    const surfaceCanvas = document.createElement("canvas");
    surfaceCanvas.width = surfaceCanvas.height = 256;
    const context = surfaceCanvas.getContext("2d");
    context.fillStyle = "#77828a";
    context.fillRect(0, 0, 256, 256);
    const random = seededRandom(19073);
    for (let i = 0; i < 1250; i++) {
      const value = 82 + Math.floor(random() * 95);
      context.fillStyle = `rgba(${value},${value + 5},${value + 8},${.025 + random() * .13})`;
      const x = random() * 256;
      const y = random() * 256;
      context.fillRect(x, y, .6 + random() * 1.5, 2 + random() * 14);
    }
    context.strokeStyle = "rgba(8,17,28,.25)";
    context.lineWidth = 2;
    context.strokeRect(4, 4, 248, 248);
    const texture = new THREE.CanvasTexture(surfaceCanvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return texture;
  }

  function makeRadialGlowTexture() {
    const glowCanvas = document.createElement("canvas");
    glowCanvas.width = glowCanvas.height = 256;
    const context = glowCanvas.getContext("2d");
    const glow = context.createRadialGradient(128, 128, 3, 128, 128, 124);
    glow.addColorStop(0, "rgba(255,255,235,1)");
    glow.addColorStop(.08, "rgba(255,219,126,.98)");
    glow.addColorStop(.28, "rgba(255,139,42,.58)");
    glow.addColorStop(.62, "rgba(255,61,18,.16)");
    glow.addColorStop(1, "rgba(255,30,0,0)");
    context.fillStyle = glow;
    context.fillRect(0, 0, 256, 256);
    const texture = new THREE.CanvasTexture(glowCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  function makeSoftParticleTexture() {
    const particleCanvas = document.createElement("canvas");
    particleCanvas.width = particleCanvas.height = 96;
    const context = particleCanvas.getContext("2d");
    const particle = context.createRadialGradient(48, 48, 2, 48, 48, 46);
    particle.addColorStop(0, "rgba(255,255,255,1)");
    particle.addColorStop(.18, "rgba(255,255,255,.92)");
    particle.addColorStop(.52, "rgba(255,255,255,.35)");
    particle.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = particle;
    context.fillRect(0, 0, 96, 96);
    return new THREE.CanvasTexture(particleCanvas);
  }

  const metalMaterial = material(colors.metal, 0.74, 0.46);
  const darkMetalMaterial = material(colors.ink, 0.82, 0.38);
  const trimMaterial = material(colors.metal2, 0.68, 0.42);
  const cyanMaterial = material(0x8ff9ee, 0.25, 0.28, colors.cyan, 3.5);
  const magentaMaterial = material(0xff7bb7, 0.2, 0.34, colors.magenta, 3.2);
  const amberMaterial = material(0xffcb6a, 0.2, 0.34, colors.amber, 3.2);
  const metalSurfaceTexture = makeMetalSurfaceTexture();
  [metalMaterial, darkMetalMaterial, trimMaterial].forEach((surface, index) => {
    surface.roughnessMap = metalSurfaceTexture;
    surface.bumpMap = metalSurfaceTexture;
    surface.bumpScale = index === 1 ? .018 : .012;
  });
  const furTexture = makeFurTexture();
  const pawMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xb95720, map: furTexture, bumpMap: furTexture, bumpScale: .048,
    metalness: 0, roughness: .88, sheen: .48, sheenColor: new THREE.Color(0xf2a35c), sheenRoughness: .84
  });
  const pawUnderfurMaterial = pawMaterial.clone();
  pawUnderfurMaterial.color.setHex(0xd48648);
  pawUnderfurMaterial.bumpScale = .028;
  const pawPadMaterial = new THREE.MeshPhysicalMaterial({ color: 0x7d3b31, metalness: 0, roughness: .72, sheen: .2, sheenColor: new THREE.Color(0xff9c8d) });
  const clawMaterial = new THREE.MeshPhysicalMaterial({ color: 0xffefd0, metalness: 0, roughness: .32, clearcoat: .42, clearcoatRoughness: .28, transparent: true, opacity: .88 });

  function addBox(size, position, meshMaterial = metalMaterial, parent = scene, rotation = null) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), meshMaterial);
    mesh.position.copy(position);
    if (rotation) mesh.rotation.set(rotation.x || 0, rotation.y || 0, rotation.z || 0);
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function addCollider(x, z, width, depth, mesh = null) {
    colliders.push({ minX: x - width / 2, maxX: x + width / 2, minZ: z - depth / 2, maxZ: z + depth / 2 });
    if (mesh) blockerMeshes.push(mesh);
  }

  const packagedLoader = new GLTFLoader();

  function preparePackagedMaterial(source) {
    const prepared = source.clone();
    if (prepared.map) {
      prepared.map.colorSpace = THREE.SRGBColorSpace;
      prepared.map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    }
    if (!prepared.name.includes("Glass") && !prepared.transparent) {
      prepared.roughnessMap = metalSurfaceTexture;
      prepared.bumpMap = metalSurfaceTexture;
      prepared.bumpScale = .009;
      prepared.roughness = Math.max(.42, prepared.roughness ?? .6);
    }
    if (prepared.emissive && prepared.emissive.getHex() !== 0) prepared.emissiveIntensity = Math.max(2.2, prepared.emissiveIntensity || 0);
    return prepared;
  }

  function loadPackagedModel(url, { parent = scene, position = [0, 0, 0], height = 1, rotationY = 0, onLoad = null } = {}) {
    packagedLoader.load(url, gltf => {
      const model = gltf.scene;
      model.traverse(node => {
        if (!node.isMesh) return;
        node.castShadow = false;
        node.receiveShadow = true;
        node.material = Array.isArray(node.material) ? node.material.map(preparePackagedMaterial) : preparePackagedMaterial(node.material);
      });
      const bounds = new THREE.Box3().setFromObject(model);
      const size = bounds.getSize(new THREE.Vector3());
      const center = bounds.getCenter(new THREE.Vector3());
      model.position.set(-center.x, -bounds.min.y, -center.z);
      const holder = new THREE.Group();
      holder.name = "网页内嵌原型模型";
      holder.position.set(position[0], position[1], position[2]);
      holder.rotation.y = rotationY;
      holder.scale.setScalar(height / Math.max(.001, size.y));
      holder.add(model);
      parent.add(holder);
      if (onLoad) onLoad(holder, model);
    }, undefined, error => console.warn("模型载入失败", error));
  }

  function makePanelTexture() {
    const textureCanvas = document.createElement("canvas");
    textureCanvas.width = textureCanvas.height = 512;
    const context = textureCanvas.getContext("2d");
    context.fillStyle = "#142333";
    context.fillRect(0, 0, 512, 512);
    context.strokeStyle = "rgba(120,170,190,.22)";
    context.lineWidth = 3;
    for (let i = 0; i <= 512; i += 64) {
      context.beginPath(); context.moveTo(i, 0); context.lineTo(i, 512); context.stroke();
      context.beginPath(); context.moveTo(0, i); context.lineTo(512, i); context.stroke();
    }
    context.fillStyle = "rgba(0,0,0,.28)";
    for (let y = 24; y < 512; y += 64) for (let x = 24; x < 512; x += 64) {
      context.beginPath(); context.arc(x, y, 5, 0, Math.PI * 2); context.fill();
    }
    context.strokeStyle = "rgba(255,255,255,.07)";
    context.lineWidth = 2;
    context.beginPath(); context.moveTo(36, 454); context.lineTo(185, 415); context.lineTo(292, 444); context.stroke();
    const texture = new THREE.CanvasTexture(textureCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 18);
    return texture;
  }

  function makeSign(text, width, height) {
    const signCanvas = document.createElement("canvas");
    signCanvas.width = 1024;
    signCanvas.height = 256;
    const context = signCanvas.getContext("2d");
    context.fillStyle = "#07121f";
    context.fillRect(0, 0, 1024, 256);
    context.strokeStyle = "#27e0d1";
    context.lineWidth = 10;
    context.strokeRect(18, 18, 988, 220);
    context.fillStyle = "#eaf7ee";
    context.font = "700 78px Microsoft YaHei";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, 512, 130);
    const texture = new THREE.CanvasTexture(signCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map: texture, transparent: true }));
    return mesh;
  }

  function buildEnvironment() {
    const floorTexture = makePanelTexture();
    const floorMaterial = new THREE.MeshStandardMaterial({ map: floorTexture, color: 0x5b7180, metalness: 0.78, roughness: 0.5 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 78), floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, -19);
    floor.receiveShadow = true;
    scene.add(floor);

    addBox(new THREE.Vector3(10, 0.18, 78), new THREE.Vector3(0, 4.25, -19), darkMetalMaterial);

    for (let z = 16; z >= -54; z -= 5) {
      const left = addBox(new THREE.Vector3(0.22, 3.8, 4.55), new THREE.Vector3(-5, 2.05, z), z % 10 === 6 ? trimMaterial : metalMaterial);
      const right = addBox(new THREE.Vector3(0.22, 3.8, 4.55), new THREE.Vector3(5, 2.05, z), z % 10 === 6 ? trimMaterial : metalMaterial);
      blockerMeshes.push(left, right);
      addBox(new THREE.Vector3(10.2, 0.18, 0.22), new THREE.Vector3(0, 4.02, z - 2.2), trimMaterial);
      const stripMaterial = z % 10 === 6 ? cyanMaterial : magentaMaterial;
      addBox(new THREE.Vector3(0.08, 0.1, 2.4), new THREE.Vector3(-4.84, 2.85, z), stripMaterial);
      addBox(new THREE.Vector3(0.08, 0.1, 2.4), new THREE.Vector3(4.84, 2.85, z), stripMaterial);
    }

    [-4.55, 4.55].forEach((x, index) => {
      for (const y of [3.25, 3.62]) {
        const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 72, 12), index ? trimMaterial : darkMetalMaterial);
        pipe.rotation.x = Math.PI / 2;
        pipe.position.set(x, y, -18);
        scene.add(pipe);
      }
    });

    const crateData = [
      { x: -2.65, z: 1.4, w: 1.65, d: 1.65, h: 1.35 },
      { x: 2.55, z: -7.1, w: 1.8, d: 1.5, h: 1.55 },
      { x: -2.7, z: -15.2, w: 1.9, d: 1.9, h: 1.25 },
      { x: 1.45, z: -31.5, w: 1.55, d: 1.55, h: 1.7 }
    ];
    crateData.forEach((crate, index) => {
      const group = new THREE.Group();
      group.position.set(crate.x, 0, crate.z);
      scene.add(group);
      const box = addBox(new THREE.Vector3(crate.w, crate.h, crate.d), new THREE.Vector3(0, crate.h / 2, 0), index % 2 ? trimMaterial : metalMaterial, group);
      const band = addBox(new THREE.Vector3(crate.w + 0.03, 0.13, crate.d + 0.03), new THREE.Vector3(0, crate.h * 0.68, 0), darkMetalMaterial, group);
      blockerMeshes.push(box, band);
      addCollider(crate.x, crate.z, crate.w + 0.35, crate.d + 0.35, box);
    });

    const signA = makeSign("维修通道 03", 3.6, 0.9);
    signA.position.set(-4.86, 2.15, 10);
    signA.rotation.y = Math.PI / 2;
    scene.add(signA);
    const signB = makeSign("失联区域", 3.1, 0.78);
    signB.position.set(4.86, 2.05, -26);
    signB.rotation.y = -Math.PI / 2;
    scene.add(signB);

    const hemi = new THREE.HemisphereLight(0x9fdcff, 0x100711, 2.5);
    scene.add(hemi);
    const ambient = new THREE.AmbientLight(0x64869c, 1.15);
    scene.add(ambient);
    const keyLight = new THREE.DirectionalLight(0xc3e8ff, 2.35);
    keyLight.position.set(-2, 7, 8);
    scene.add(keyLight);
    const headLamp = new THREE.PointLight(0xaadfff, 18, 15, 1.8);
    headLamp.position.set(0, 0.25, 0.15);
    camera.add(headLamp);
    [11, -5, -20, -36, -49].forEach((z, index) => {
      const light = new THREE.PointLight(index % 2 ? colors.magenta : colors.cyan, index === 4 ? 120 : 76, 15, 2.1);
      light.position.set(index % 2 ? 3.7 : -3.7, 3.35, z);
      scene.add(light);
      interactiveLights.push(light);
    });

    const starGeometry = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < 360; i++) positions.push((Math.random() - 0.5) * 42, Math.random() * 18 - 2, -55 - Math.random() * 50);
    starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xbdeeff, size: 0.07, transparent: true, opacity: 0.92 }));
    scene.add(stars);
  }

  const collar = new THREE.Group();
  const cableStation = new THREE.Group();
  const door = new THREE.Group();
  const robot = new THREE.Group();
  let robotFallback;
  let robotEye;
  let robotBeam;
  let doorLeft;
  let doorRight;
  let scratchSparks;
  let scratchSmoke;
  let scratchGlow;
  let scratchLight;
  let memoryBurst;
  let scratchSparkCursor = 0;
  let scratchSmokeCursor = 0;

  function makeParticleSystem(count, pointsMaterial) {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) positions[i * 3 + 1] = -100;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const system = new THREE.Points(geometry, pointsMaterial);
    system.frustumCulled = false;
    system.userData.velocities = new Float32Array(count * 3);
    system.userData.lives = new Float32Array(count);
    return system;
  }

  function buildCollar() {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.09, 12, 32), amberMaterial);
    ring.rotation.x = Math.PI / 2;
    collar.add(ring);
    const tag = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.08, 20), magentaMaterial);
    tag.rotation.z = Math.PI / 2;
    tag.position.set(0.34, -0.05, 0.05);
    collar.add(tag);
    collar.position.set(0, 0.35, 6.2);
    const light = new THREE.PointLight(colors.amber, 72, 5, 2);
    collar.add(light);
    scene.add(collar);

    memoryBurst = makeParticleSystem(96, new THREE.PointsMaterial({
      color: 0xffd27a, size: .075, transparent: true, opacity: 0,
      depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
    }));
    memoryBurst.position.copy(collar.position);
    scene.add(memoryBurst);
  }

  function buildCableStation() {
    cableStation.position.set(4.62, 1.25, -23);
    cableStation.rotation.y = -Math.PI / 2;
    scene.add(cableStation);
    addBox(new THREE.Vector3(1.5, 1.55, 0.34), new THREE.Vector3(0, 0, 0), darkMetalMaterial, cableStation);
    addBox(new THREE.Vector3(0.8, 0.48, 0.38), new THREE.Vector3(0, 0.2, -0.05), magentaMaterial, cableStation);
    for (let i = -1; i <= 1; i++) addBox(new THREE.Vector3(0.14, 0.42, 0.08), new THREE.Vector3(i * 0.27, 0.2, -0.25), i === 0 ? amberMaterial : cyanMaterial, cableStation);

    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(4.5, 1.15, -23),
      new THREE.Vector3(3.95, 0.85, -23.4),
      new THREE.Vector3(4.05, 0.16, -24.3),
      new THREE.Vector3(3.5, 0.08, -25.4)
    ]);
    const cable = new THREE.Mesh(new THREE.TubeGeometry(curve, 36, 0.075, 8, false), material(0x17202a, 0.45, 0.72));
    scene.add(cable);

    const softParticleTexture = makeSoftParticleTexture();
    scratchSparks = makeParticleSystem(84, new THREE.PointsMaterial({
      color: 0xffad45, size: .038, map: softParticleTexture, alphaTest: .015, transparent: true, opacity: 0,
      depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
    }));
    scratchSparks.position.set(.17, -.3, -.8);
    camera.add(scratchSparks);

    scratchSmoke = makeParticleSystem(30, new THREE.PointsMaterial({
      color: 0x9aa8ad, size: .052, map: softParticleTexture, alphaTest: .01, transparent: true, opacity: 0,
      depthWrite: false, sizeAttenuation: true
    }));
    scratchSmoke.position.copy(scratchSparks.position);
    camera.add(scratchSmoke);

    scratchGlow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: makeRadialGlowTexture(), color: 0xffa340, transparent: true, opacity: 0,
      depthWrite: false, blending: THREE.AdditiveBlending
    }));
    scratchGlow.position.copy(scratchSparks.position);
    scratchGlow.scale.set(.2, .2, .2);
    camera.add(scratchGlow);
    scratchLight = new THREE.PointLight(0xff7a2e, 0, 2.2, 2);
    scratchLight.layers.enable(1);
    scratchLight.position.copy(scratchSparks.position);
    camera.add(scratchLight);
  }

  function buildDoor() {
    door.position.set(0, 2, -42);
    scene.add(door);
    doorLeft = addBox(new THREE.Vector3(4.75, 4, 0.52), new THREE.Vector3(-2.4, 0, 0), metalMaterial, door);
    doorRight = addBox(new THREE.Vector3(4.75, 4, 0.52), new THREE.Vector3(2.4, 0, 0), metalMaterial, door);
    addBox(new THREE.Vector3(10.4, 0.35, 0.7), new THREE.Vector3(0, 2.13, 0), darkMetalMaterial, door);
    addBox(new THREE.Vector3(0.35, 4.4, 0.7), new THREE.Vector3(-5.03, 0, 0), darkMetalMaterial, door);
    addBox(new THREE.Vector3(0.35, 4.4, 0.7), new THREE.Vector3(5.03, 0, 0), darkMetalMaterial, door);
    addBox(new THREE.Vector3(1.3, 0.12, 0.57), new THREE.Vector3(-1.65, 0.7, -0.29), cyanMaterial, doorLeft);
    addBox(new THREE.Vector3(1.3, 0.12, 0.57), new THREE.Vector3(1.65, 0.7, -0.29), magentaMaterial, doorRight);
    const exitGlow = new THREE.Mesh(new THREE.PlaneGeometry(8.7, 3.8), new THREE.MeshBasicMaterial({ color: 0x6ad9ff, transparent: true, opacity: 0.12 }));
    exitGlow.position.set(0, 2, -50);
    scene.add(exitGlow);
  }

  function buildRobot() {
    robot.position.set(0, 0.72, -10);
    scene.add(robot);
    robotFallback = new THREE.Group();
    robot.add(robotFallback);
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.72, 0.9), darkMetalMaterial);
    robotFallback.add(body);
    const shell = new THREE.Mesh(new THREE.SphereGeometry(0.48, 18, 12), trimMaterial);
    shell.scale.set(1.15, 0.72, 0.9);
    shell.position.y = 0.24;
    robotFallback.add(shell);
    robotEye = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), magentaMaterial);
    robotEye.position.set(0, 0.3, 0.49);
    robot.add(robotEye);
    const eyeLight = new THREE.PointLight(colors.danger, 68, 4.5, 2);
    robotEye.add(eyeLight);
    [[-.42,-.35],[.42,-.35],[-.42,.35],[.42,.35]].forEach(([x,z]) => {
      const leg = addBox(new THREE.Vector3(0.12, 0.62, 0.12), new THREE.Vector3(x, -0.46, z), darkMetalMaterial, robotFallback, new THREE.Vector3(0,0,x > 0 ? -.18 : .18));
      leg.userData.baseY = leg.position.y;
    });

    loadPackagedModel(bulbRobotUrl, {
      parent: robot,
      position: [0, -.72, 0],
      height: 1.55,
      rotationY: Math.PI,
      onLoad: () => { robotFallback.visible = false; }
    });

    const beamGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0, 1)]);
    robotBeam = new THREE.Line(beamGeometry, new THREE.LineBasicMaterial({ color: colors.danger, transparent: true, opacity: 0 }));
    scene.add(robotBeam);
  }

  function addPackagedProps() {
    loadPackagedModel(catBackpackUrl, { position: [-.72, .04, 5.72], height: .48, rotationY: -.38 });
    loadPackagedModel(energyCoreUrl, { position: [3.72, .04, -22.35], height: .72, rotationY: .24 });
    loadPackagedModel(ecologyPodUrl, { position: [-3.45, 0, -49.2], height: 2.65, rotationY: .18 });
    loadPackagedModel(escapePodUrl, { position: [2.8, 0, -51.6], height: 2.25, rotationY: -Math.PI / 2 });
  }

  function addPawPrint(x, z, rotation) {
    const group = new THREE.Group();
    const printMaterial = new THREE.MeshBasicMaterial({ color: colors.cyan, transparent: true, opacity: 0, depthWrite: false });
    const pad = new THREE.Mesh(new THREE.CircleGeometry(0.12, 16), printMaterial);
    pad.scale.set(1.15, 0.85, 1);
    pad.rotation.x = -Math.PI / 2;
    group.add(pad);
    for (let i = 0; i < 4; i++) {
      const toe = new THREE.Mesh(new THREE.CircleGeometry(0.052, 12), printMaterial);
      toe.rotation.x = -Math.PI / 2;
      toe.position.set((i - 1.5) * 0.075, 0.002, -0.14 - Math.abs(i - 1.5) * 0.018);
      group.add(toe);
    }
    group.position.set(x, 0.018, z);
    group.rotation.y = rotation;
    scene.add(group);
    scentPrints.push(group);
  }

  function buildScentTrail() {
    const points = [new THREE.Vector3(0, 0, 5), new THREE.Vector3(-1.4, 0, -1), new THREE.Vector3(2.4, 0, -8), new THREE.Vector3(-1.7, 0, -15), new THREE.Vector3(3.55, 0, -22)];
    const curve = new THREE.CatmullRomCurve3(points);
    for (let i = 0; i < 28; i++) {
      const point = curve.getPoint(i / 27);
      const next = curve.getPoint(Math.min(1, (i + 1) / 27));
      addPawPrint(point.x + (i % 2 ? 0.16 : -0.16), point.z, Math.atan2(next.x - point.x, next.z - point.z));
    }
    for (let i = 0; i < 15; i++) addPawPrint(3.4 - i * 0.22, -24 - i * 1.05, Math.PI);
  }

  function emitMemoryParticles() {
    const positions = memoryBurst.geometry.attributes.position;
    const velocities = memoryBurst.userData.velocities;
    const lives = memoryBurst.userData.lives;
    memoryBurst.position.copy(collar.position);
    for (let i = 0; i < lives.length; i++) {
      const angle = Math.random() * Math.PI * 2;
      const elevation = (Math.random() - .18) * Math.PI * .78;
      const speed = .55 + Math.random() * 1.85;
      positions.setXYZ(i, (Math.random() - .5) * .18, (Math.random() - .5) * .12, (Math.random() - .5) * .18);
      velocities[i * 3] = Math.cos(angle) * Math.cos(elevation) * speed;
      velocities[i * 3 + 1] = Math.sin(elevation) * speed + .42;
      velocities[i * 3 + 2] = Math.sin(angle) * Math.cos(elevation) * speed;
      lives[i] = .85 + Math.random() * 1.15;
    }
    positions.needsUpdate = true;
    memoryBurst.material.opacity = 1;
  }

  function spawnScratchParticles(amount) {
    const positions = scratchSparks.geometry.attributes.position;
    const velocities = scratchSparks.userData.velocities;
    const lives = scratchSparks.userData.lives;
    for (let n = 0; n < amount; n++) {
      const i = scratchSparkCursor++ % lives.length;
      positions.setXYZ(i, (Math.random() - .5) * .08, (Math.random() - .5) * .1, (Math.random() - .5) * .06);
      velocities[i * 3] = -(.22 + Math.random() * .82);
      velocities[i * 3 + 1] = .12 + Math.random() * 1.15;
      velocities[i * 3 + 2] = (Math.random() - .5) * .72;
      lives[i] = .18 + Math.random() * .36;
    }
    positions.needsUpdate = true;
  }

  function spawnScratchSmoke(amount) {
    const positions = scratchSmoke.geometry.attributes.position;
    const velocities = scratchSmoke.userData.velocities;
    const lives = scratchSmoke.userData.lives;
    for (let n = 0; n < amount; n++) {
      const i = scratchSmokeCursor++ % lives.length;
      positions.setXYZ(i, (Math.random() - .5) * .12, (Math.random() - .5) * .06, (Math.random() - .5) * .1);
      velocities[i * 3] = -.12 - Math.random() * .3;
      velocities[i * 3 + 1] = .22 + Math.random() * .48;
      velocities[i * 3 + 2] = (Math.random() - .5) * .24;
      lives[i] = .75 + Math.random() * .72;
    }
    positions.needsUpdate = true;
  }

  function updateParticleSystem(system, dt, verticalForce, drag) {
    const positions = system.geometry.attributes.position;
    const velocities = system.userData.velocities;
    const lives = system.userData.lives;
    let maxLife = 0;
    for (let i = 0; i < lives.length; i++) {
      if (lives[i] <= 0) continue;
      lives[i] -= dt;
      if (lives[i] <= 0) {
        positions.setXYZ(i, 0, -100, 0);
        continue;
      }
      maxLife = Math.max(maxLife, lives[i]);
      const offset = i * 3;
      positions.setXYZ(i,
        positions.getX(i) + velocities[offset] * dt,
        positions.getY(i) + velocities[offset + 1] * dt,
        positions.getZ(i) + velocities[offset + 2] * dt
      );
      velocities[offset] *= drag;
      velocities[offset + 1] = velocities[offset + 1] * drag + verticalForce * dt;
      velocities[offset + 2] *= drag;
    }
    positions.needsUpdate = true;
    return maxLife;
  }

  function clearParticleSystem(system) {
    if (!system) return;
    const positions = system.geometry.attributes.position;
    system.userData.lives.fill(0);
    system.userData.velocities.fill(0);
    for (let i = 0; i < positions.count; i++) positions.setXYZ(i, 0, -100, 0);
    positions.needsUpdate = true;
    system.material.opacity = 0;
  }

  function makePaw(side) {
    const group = new THREE.Group();
    const foreleg = new THREE.Mesh(new THREE.CapsuleGeometry(.112, .38, 12, 30), pawMaterial);
    foreleg.rotation.x = Math.PI / 2;
    foreleg.scale.set(1.08, 1, .98);
    foreleg.position.z = -.035;
    group.add(foreleg);

    const wrist = new THREE.Mesh(new THREE.SphereGeometry(.132, 32, 22), pawMaterial);
    wrist.scale.set(1.04, .82, 1.08);
    wrist.position.set(0, -.012, -.245);
    group.add(wrist);

    const foot = new THREE.Mesh(new THREE.SphereGeometry(.154, 36, 24), pawMaterial);
    foot.scale.set(1.12, .68, 1.28);
    foot.position.set(0, -.038, -.34);
    group.add(foot);

    const underfur = new THREE.Mesh(new THREE.SphereGeometry(.105, 28, 18), pawUnderfurMaterial);
    underfur.scale.set(.78, .34, .9);
    underfur.position.set(0, -.105, -.365);
    group.add(underfur);

    const palmPad = new THREE.Mesh(new THREE.SphereGeometry(.076, 24, 16), pawPadMaterial);
    palmPad.scale.set(1.18, .36, .86);
    palmPad.position.set(0, -.126, -.382);
    group.add(palmPad);

    const claws = [];
    const toePads = [];
    for (let i = 0; i < 4; i++) {
      const toe = new THREE.Mesh(new THREE.SphereGeometry(.061, 26, 16), i === 0 || i === 3 ? pawUnderfurMaterial : pawMaterial);
      const offset = i - 1.5;
      const outer = Math.abs(offset) / 1.5;
      toe.scale.set(.82, .65, 1.16);
      toe.position.set(offset * .066, -.076 + outer * .008, -.475 + outer * .018);
      group.add(toe);

      const toePad = new THREE.Mesh(new THREE.SphereGeometry(.027, 18, 12), pawPadMaterial);
      toePad.scale.set(.86, .32, .92);
      toePad.position.set(offset * .066, -.124 + outer * .006, -.485 + outer * .018);
      group.add(toePad);
      toePads.push(toePad);

      const claw = new THREE.Mesh(new THREE.ConeGeometry(.015, .082, 14), clawMaterial);
      claw.rotation.x = -Math.PI / 2;
      claw.position.set(offset * .066, -.073 + outer * .007, -.526 + outer * .018);
      claw.scale.set(1, .46, 1);
      group.add(claw);
      claws.push(claw);
    }

    group.userData.claws = claws;
    group.userData.toePads = toePads;
    group.userData.palmPad = palmPad;
    group.position.set(side * .31, -.31, -.63);
    group.rotation.set(-.06, side * .06, side * -.04);
    group.traverse((child) => child.layers.set(1));
    camera.add(group);
    return group;
  }

  buildEnvironment();
  buildCollar();
  buildCableStation();
  buildDoor();
  buildRobot();
  addPackagedProps();
  buildScentTrail();
  const leftPaw = makePaw(-1);
  const rightPaw = makePaw(1);
  camera.layers.enable(1);
  const pawFill = new THREE.HemisphereLight(0xffd7af, 0x421a0e, 1.55);
  pawFill.layers.set(1);
  scene.add(pawFill);
  const pawKey = new THREE.PointLight(0xffaa6a, 3.6, 4, 2);
  pawKey.position.set(-.25, .35, .2);
  pawKey.layers.set(1);
  camera.add(pawKey);
  leftPaw.scale.setScalar(0.56);
  rightPaw.scale.setScalar(0.56);

  function setCanvasSize() {
    const width = Math.max(1, root.clientWidth);
    const height = Math.max(1, root.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(setCanvasSize).observe(root);
  setCanvasSize();

  function ensureAudio() {
    if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === "suspended") audioContext.resume();
  }

  function tone(frequency, duration = 0.12, type = "sine", gainValue = 0.035) {
    try {
      ensureAudio();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(gainValue, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);
    } catch (_) {}
  }

  function showToast(text, duration = 2600) {
    clearTimeout(toastTimer);
    toastEl.textContent = text;
    toastEl.classList.add("visible");
    toastTimer = setTimeout(() => toastEl.classList.remove("visible"), duration);
  }

  function showCollarMemory() {
    clearTimeout(toastTimer);
    toastEl.classList.remove("visible");
    clearMovementInput();
    state.memoryOpen = true;
    state.playing = false;
    memoryEl.hidden = false;
    if (document.pointerLockElement === canvas) document.exitPointerLock();
    memoryContinueButton.focus();
  }

  function hideCollarMemory() {
    if (memoryEl.hidden) return;
    memoryEl.hidden = true;
    state.memoryOpen = false;
    if (!state.active || state.complete || !pauseScreen.hidden || !gate.hidden) return;
    state.playing = true;
    showToast("身份信息恢复：名称“米粒”。前方还有熟悉的气味。", 3800);
    if (!isTouch && canvas.requestPointerLock) canvas.requestPointerLock();
  }

  function updateObjective() {
    const objectives = ["找到记忆锚点：项圈", "开启感知并找到损坏的电缆", "穿过已经开启的维修舱门"];
    objectiveEl.textContent = objectives[Math.min(state.stage, 2)];
    [...root.querySelectorAll(".chapter3d-steps i")].forEach((dot, index) => {
      dot.classList.toggle("done", index < state.stage);
      dot.classList.toggle("active", index === state.stage);
    });
  }

  function toggleScent(force) {
    if (!state.playing || state.complete) return;
    state.scent = typeof force === "boolean" ? force : !state.scent;
    root.classList.toggle("scent-on", state.scent);
    scentEl.classList.toggle("active", state.scent);
    scentEl.querySelector("span").textContent = state.scent ? "感知开启" : "感知关闭";
    tone(state.scent ? 520 : 240, 0.28, "sine", 0.03);
    if (state.scent && state.stage === 1) showToast("项圈共鸣：附近残留着异常空间波动");
  }

  function collectCollar() {
    if (state.stage !== 0) return;
    state.stage = 1;
    state.pawReachUntil = performance.now() + 950;
    emitMemoryParticles();
    collar.visible = false;
    player.checkpoint.set(0, 1.13, 4.2);
    updateObjective();
    tone(620, 0.18, "triangle", 0.05);
    setTimeout(() => tone(840, 0.3, "sine", 0.04), 100);
    showCollarMemory();
  }

  function finishCable() {
    if (state.stage !== 1) return;
    state.stage = 2;
    state.scratch = 0;
    state.scratchStartedAt = 0;
    state.holdingInteract = false;
    progressEl.hidden = true;
    player.checkpoint.set(2.8, 1.13, -24.8);
    updateObjective();
    tone(180, 0.2, "square", 0.045);
    setTimeout(() => tone(440, 0.35, "triangle", 0.04), 160);
    showToast("维修电路已接通，舱门正在开启");
  }

  function startInteract() {
    if (!state.playing || state.complete || !state.nearby) return;
    if (state.nearby === "collar") collectCollar();
    if (state.nearby === "cable") {
      state.holdingInteract = true;
      state.scratchStartedAt = performance.now() - state.scratch * 1000;
      progressEl.hidden = false;
    }
  }

  function stopInteract() {
    state.holdingInteract = false;
    state.scratchStartedAt = 0;
    if (state.stage === 1 && state.scratch < 1.45) {
      state.scratch = Math.max(0, state.scratch - 0.15);
      progressFill.style.width = `${state.scratch / 1.45 * 100}%`;
    }
  }

  function jump() {
    if (!state.playing || state.complete || !player.grounded || !pauseScreen.hidden) return;
    player.velocityY = 4.35;
    player.grounded = false;
    tone(190, 0.12, "triangle", 0.025);
  }

  function isBlocked(x, z) {
    const radius = 0.31;
    if (x < -4.48 + radius || x > 4.48 - radius || z > 17.2 || z < -54) return true;
    if (state.stage < 2 && z < -40.9 && z > -43.2) return true;
    for (const box of colliders) {
      const nearestX = Math.max(box.minX, Math.min(x, box.maxX));
      const nearestZ = Math.max(box.minZ, Math.min(z, box.maxZ));
      if ((x - nearestX) ** 2 + (z - nearestZ) ** 2 < radius ** 2) return true;
    }
    return false;
  }

  function resetToCheckpoint(message) {
    player.position.copy(player.checkpoint);
    player.velocityY = 0;
    player.grounded = true;
    state.alert = 0;
    root.classList.add("hit");
    setTimeout(() => root.classList.remove("hit"), 500);
    showToast(message);
    tone(90, 0.45, "sawtooth", 0.045);
  }

  function resetChapter() {
    state.complete = false;
    state.memoryOpen = false;
    state.stage = 0;
    state.scent = false;
    state.holdingInteract = false;
    state.scratch = 0;
    state.scratchStartedAt = 0;
    state.doorAmount = 0;
    state.alert = 0;
    state.nearby = null;
    state.lastScratchTone = 0;
    state.pawReachUntil = 0;
    player.position.set(0, 1.13, 14);
    player.checkpoint.set(0, 1.13, 14);
    player.yaw = 0;
    player.pitch = 0;
    player.velocityY = 0;
    player.grounded = true;
    collar.visible = true;
    memoryEl.hidden = true;
    completeEl.hidden = true;
    bridgeVideo.pause();
    bridgeVideo.currentTime = 0;
    bridgeEl.hidden = true;
    bridgeLaunch.hidden = true;
    bridgeEl.classList.remove("is-finished");
    progressEl.hidden = true;
    progressFill.style.width = "0%";
    clearParticleSystem(memoryBurst);
    clearParticleSystem(scratchSparks);
    clearParticleSystem(scratchSmoke);
    scratchGlow.material.opacity = 0;
    scratchLight.intensity = 0;
    root.classList.remove("scent-on", "hit");
    scentEl.classList.remove("active");
    scentEl.querySelector("span").textContent = "感知关闭";
    updateObjective();
    showToast("你从陌生的休眠舱醒来。某种熟悉气味正在前方。", 4200);
  }

  function finishChapter() {
    if (state.complete) return;
    state.complete = true;
    state.playing = false;
    state.holdingInteract = false;
    if (document.pointerLockElement === canvas) document.exitPointerLock();
    tone(440, 0.3, "sine", 0.045);
    setTimeout(() => tone(660, 0.4, "sine", 0.04), 180);
    setTimeout(() => tone(880, 0.55, "triangle", 0.035), 360);
    showChapterBridge();
  }

  function showChapterBridge() {
    clearMovementInput();
    state.playing = false;
    completeEl.hidden = true;
    bridgeEl.hidden = false;
    bridgeLaunch.hidden = true;
    bridgeSkipButton.hidden = false;
    bridgeEl.classList.remove("is-finished");
    bridgeProgress.style.width = "0%";
    if (document.pointerLockElement === canvas) document.exitPointerLock();
    bridgeVideo.currentTime = 0;
    bridgeVideo.muted = document.querySelector("#soundButton")?.classList.contains("muted") || false;
    const play = bridgeVideo.play();
    if (play?.catch) play.catch(() => {
      bridgeVideo.muted = true;
      bridgeVideo.play().catch(showBridgeLaunch);
    });
  }

  function updateBridgeProgress() {
    if (Number.isFinite(bridgeVideo.duration) && bridgeVideo.duration > 0) {
      bridgeProgress.style.width = `${Math.min(100, bridgeVideo.currentTime / bridgeVideo.duration * 100)}%`;
    }
  }

  function showBridgeLaunch() {
    bridgeVideo.pause();
    bridgeEl.classList.add("is-finished");
    bridgeSkipButton.hidden = true;
    bridgeLaunch.hidden = false;
    bridgeProgress.style.width = "100%";
    bridgeStartButton.focus();
  }

  function enterSecondChapter() {
    bridgeVideo.pause();
    bridgeEl.hidden = true;
    bridgeLaunch.hidden = true;
    bridgeEl.classList.remove("is-finished");
    window.__starTailActiveChapter = 2;
    window.dispatchEvent(new CustomEvent("startail:chapter-select", { detail: { chapter: 2 } }));
    window.dispatchEvent(new CustomEvent("startail:chapter-enter", { detail: { chapter: 2 } }));
  }

  function updateNearby() {
    state.nearby = null;
    let label = "";
    let hold = false;
    if (state.stage === 0 && player.position.distanceTo(collar.position) < 2.15) {
      state.nearby = "collar";
      label = "触碰记忆锚点：项圈";
    } else if (state.stage === 1 && player.position.distanceTo(tempVector.set(4.1, 1.13, -23)) < 2.25) {
      state.nearby = "cable";
      label = "抓挠损坏的电缆";
      hold = true;
    }
    promptEl.hidden = !state.nearby;
    if (state.nearby) {
      promptEl.querySelector("kbd").textContent = isTouch ? "按住" : hold ? "按住 E" : "按 E";
      promptEl.querySelector("span").textContent = label;
      touchInteract.classList.add("ready");
    } else {
      touchInteract.classList.remove("ready");
      if (state.stage !== 1 || !state.holdingInteract) progressEl.hidden = true;
    }
  }

  function updateMovement(dt) {
    if (!state.playing || state.complete || !pauseScreen.hidden) {
      player.moving = false;
      return;
    }
    const forwardInput = (keys.has("KeyW") || keys.has("ArrowUp") ? 1 : 0) - (keys.has("KeyS") || keys.has("ArrowDown") ? 1 : 0) - state.touchMove.y;
    const sideInput = (keys.has("KeyD") ? 1 : 0) - (keys.has("KeyA") ? 1 : 0) + state.touchMove.x;
    const inputLength = Math.hypot(forwardInput, sideInput);
    const speed = keys.has("ShiftLeft") || keys.has("ShiftRight") ? 6.1 : 4.15;
    let dx = 0;
    let dz = 0;
    if (inputLength > 0.08) {
      const forward = forwardInput / Math.max(1, inputLength);
      const side = sideInput / Math.max(1, inputLength);
      dx = (Math.sin(player.yaw) * forward + Math.cos(player.yaw) * side) * speed * dt;
      dz = (-Math.cos(player.yaw) * forward + Math.sin(player.yaw) * side) * speed * dt;
      player.moving = true;
      player.step += dt * speed * 2.4;
    } else {
      player.moving = false;
    }
    if (!isBlocked(player.position.x + dx, player.position.z)) player.position.x += dx;
    if (!isBlocked(player.position.x, player.position.z + dz)) player.position.z += dz;

    player.velocityY -= 10.8 * dt;
    player.position.y += player.velocityY * dt;
    if (player.position.y <= 1.13) {
      player.position.y = 1.13;
      player.velocityY = 0;
      player.grounded = true;
    }

    if (state.stage === 2 && player.position.z < -45.2) finishChapter();
  }

  function setClawExtension(paw, target) {
    paw.userData.claws.forEach((claw) => {
      claw.scale.y = THREE.MathUtils.lerp(claw.scale.y, target, 0.24);
    });
  }

  function updatePaws(time) {
    const walk = player.moving && player.grounded && state.playing ? Math.sin(player.step) : Math.sin(time * 1.5) * 0.12;
    const bob = player.moving && player.grounded ? Math.abs(Math.sin(player.step * 0.5)) * 0.028 : Math.sin(time * 1.4) * 0.006;
    const jumpLift = player.grounded ? 0 : 0.11;
    leftPaw.position.set(-0.24, -0.45 - bob + jumpLift + walk * 0.018, -0.67 + Math.max(0, walk) * 0.045);
    rightPaw.position.set(0.24, -0.45 - bob + jumpLift - walk * 0.018, -0.67 + Math.max(0, -walk) * 0.045);
    leftPaw.rotation.x = -0.03 + Math.max(0, walk) * 0.025;
    rightPaw.rotation.x = -0.03 + Math.max(0, -walk) * 0.025;
    leftPaw.rotation.y = -0.025;
    rightPaw.rotation.y = 0.025;
    leftPaw.rotation.z = -0.04 + walk * 0.035;
    rightPaw.rotation.z = 0.04 - walk * 0.035;

    const reachRemaining = state.pawReachUntil - performance.now();
    if (reachRemaining > 0) {
      const reach = Math.sin((1 - reachRemaining / 950) * Math.PI);
      rightPaw.position.x -= reach * 0.05;
      rightPaw.position.y += reach * 0.2;
      rightPaw.position.z += reach * 0.16;
      rightPaw.rotation.x += reach * 0.22;
      rightPaw.rotation.z -= reach * 0.12;
    }

    const scratching = state.holdingInteract && state.nearby === "cable" && state.stage === 1;
    if (scratching) {
      const stroke = (Math.sin(time * 29) + 1) * 0.5;
      rightPaw.position.set(0.17, -0.27 + stroke * 0.085, -0.5 - stroke * 0.07);
      rightPaw.rotation.x = 0.18 + stroke * 0.15;
      rightPaw.rotation.y = 0.09;
      rightPaw.rotation.z = -0.31 + stroke * 0.1;
      setClawExtension(rightPaw, 1.28);
      setClawExtension(leftPaw, 0.45);
    } else {
      setClawExtension(rightPaw, 0.46);
      setClawExtension(leftPaw, 0.46);
    }
  }

  function hasRobotLineOfSight(robotPosition, playerPosition) {
    tempVector.copy(playerPosition).sub(robotPosition);
    const distance = tempVector.length();
    tempVector.normalize();
    raycaster.set(robotPosition, tempVector);
    raycaster.far = distance;
    const hits = raycaster.intersectObjects(blockerMeshes, false);
    return !hits.length || hits[0].distance > distance;
  }

  function updateRobot(dt, time) {
    robot.position.x = Math.sin(time * 0.72) * 2.75;
    robot.position.z = -11.2 + Math.sin(time * 0.34) * 2.3;
    robot.rotation.y = Math.cos(time * 0.72) > 0 ? Math.PI / 2 : -Math.PI / 2;
    robot.children.forEach((child, index) => {
      if (child.userData.baseY !== undefined) child.position.y = child.userData.baseY + Math.sin(time * 6 + index) * 0.045;
    });

    const eyePosition = robotEye.getWorldPosition(tempVectorB);
    const distance = eyePosition.distanceTo(player.position);
    const visible = state.playing && !state.complete && state.stage >= 1 && state.stage < 3 && distance < 6.3 && hasRobotLineOfSight(eyePosition, player.position);
    state.alert = THREE.MathUtils.clamp(state.alert + (visible ? 42 : -30) * dt, 0, 100);
    alertEl.classList.toggle("visible", state.alert > 1);
    alertFill.style.width = `${state.alert}%`;
    const beamPositions = robotBeam.geometry.attributes.position;
    beamPositions.setXYZ(0, eyePosition.x, eyePosition.y, eyePosition.z);
    beamPositions.setXYZ(1, player.position.x, player.position.y, player.position.z);
    beamPositions.needsUpdate = true;
    robotBeam.material.opacity = visible ? 0.38 + Math.sin(time * 16) * 0.12 : 0;
    if (state.alert >= 99 && performance.now() - state.lastRobotHit > 1200) {
      state.lastRobotHit = performance.now();
      resetToCheckpoint("被巡逻机锁定，已返回最近检查点");
    }
  }

  function updateWorld(dt, time) {
    const memoryLife = updateParticleSystem(memoryBurst, dt, -0.18, 0.982);
    memoryBurst.material.opacity = memoryLife > 0 ? Math.min(0.95, memoryLife * 1.3) : 0;
    if (collar.visible) {
      collar.rotation.y += dt * 0.85;
      collar.position.y = 0.35 + Math.sin(time * 2.2) * 0.065;
    }
    interactiveLights.forEach((light, index) => light.intensity = 4.4 + Math.sin(time * 2.2 + index * 1.8) * 0.65);
    scentPrints.forEach((print, index) => {
      const opacity = state.scent ? 0.25 + Math.max(0, Math.sin(time * 3.2 - index * 0.32)) * 0.7 : 0;
      print.children.forEach(child => child.material.opacity = THREE.MathUtils.lerp(child.material.opacity, opacity, Math.min(1, dt * 7)));
    });
    cableStation.children.forEach((child, index) => {
      if (child.material?.emissiveIntensity !== undefined && child.material !== darkMetalMaterial) child.material.emissiveIntensity = 2.2 + Math.sin(time * 5 + index) * 0.8;
    });
    if (state.stage === 2) state.doorAmount = Math.min(1, state.doorAmount + dt * 0.46);
    doorLeft.position.x = -2.4 - state.doorAmount * 4.4;
    doorRight.position.x = 2.4 + state.doorAmount * 4.4;

    const scratching = state.holdingInteract && state.nearby === "cable" && state.stage === 1 && pauseScreen.hidden;
    if (scratching) {
      state.scratch = (performance.now() - state.scratchStartedAt) / 1000;
      progressEl.hidden = false;
      progressFill.style.width = `${Math.min(100, state.scratch / 1.45 * 100)}%`;
      spawnScratchParticles(Math.max(2, Math.ceil(dt * 145)));
      if (Math.random() < dt * 13) spawnScratchSmoke(1);
      scratchGlow.material.opacity = 0.42 + Math.random() * 0.26;
      const glowScale = 0.18 + Math.random() * 0.07;
      scratchGlow.scale.set(glowScale, glowScale, glowScale);
      scratchLight.intensity = 5 + Math.random() * 7;
      if (performance.now() - state.lastScratchTone > 86) {
        state.lastScratchTone = performance.now();
        tone(82 + Math.random() * 44, 0.075, "sawtooth", 0.011);
        if (Math.random() > 0.45) tone(890 + Math.random() * 430, 0.038, "triangle", 0.006);
      }
      if (state.scratch >= 1.45) finishCable();
    } else {
      scratchGlow.material.opacity = THREE.MathUtils.lerp(scratchGlow.material.opacity, 0, Math.min(1, dt * 12));
      scratchLight.intensity = THREE.MathUtils.lerp(scratchLight.intensity, 0, Math.min(1, dt * 14));
    }
    const sparkLife = updateParticleSystem(scratchSparks, dt, -6.2, 0.93);
    scratchSparks.material.opacity = sparkLife > 0 ? 0.9 : 0;
    const smokeLife = updateParticleSystem(scratchSmoke, dt, 0.2, 0.985);
    scratchSmoke.material.opacity = smokeLife > 0 ? Math.min(0.3, smokeLife * 0.24) : 0;
    updateRobot(dt, time);
  }

  function updateCamera(time) {
    const bob = player.moving && player.grounded ? Math.sin(player.step) * 0.025 : Math.sin(time * 1.4) * 0.006;
    const scratching = state.holdingInteract && state.nearby === "cable" && state.stage === 1;
    const shakeX = scratching ? Math.sin(time * 91) * 0.0045 : 0;
    const shakeY = scratching ? Math.cos(time * 83) * 0.003 : 0;
    camera.position.set(player.position.x + shakeX, player.position.y + bob + shakeY, player.position.z);
    camera.rotation.y = player.yaw + (scratching ? Math.sin(time * 77) * 0.0018 : 0);
    camera.rotation.x = player.pitch + (scratching ? Math.cos(time * 69) * 0.0012 : 0);
    camera.rotation.z = scratching ? Math.sin(time * 87) * 0.0022 : 0;
  }

  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(0.04, clock.getDelta());
    const time = clock.elapsedTime;
    if (state.active) {
      updateMovement(dt);
      updateNearby();
      updateWorld(dt, time);
      updatePaws(time);
      updateCamera(time);
    }
    renderer.render(scene, camera);
  }
  animate();

  function enterPlay() {
    clearMovementInput();
    ensureAudio();
    state.playing = true;
    gate.hidden = true;
    if (!isTouch && canvas.requestPointerLock) canvas.requestPointerLock();
  }

  function showResumeGate() {
    if (!state.active || state.complete || state.memoryOpen || !pauseScreen.hidden || isTouch) return;
    clearMovementInput();
    state.playing = false;
    gate.hidden = false;
    gate.querySelector("h2").textContent = "继续探索";
    enterButton.textContent = "返回场景";
  }

  function activateIfNeeded() {
    const active = gameScreen.classList.contains("is-active") && (window.__starTailActiveChapter || 1) === 1;
    if (active === state.active) return;
    state.active = active;
    root.hidden = !active;
    gameScreen.classList.toggle("chapter-one-active", active);
    document.body.classList.toggle("chapter-one-running", active);
    if (active) {
      resetChapter();
      state.playing = false;
      gate.hidden = false;
      gate.querySelector("h2").textContent = "失联舱段";
      enterButton.textContent = "进入场景";
    } else {
      clearMovementInput();
      bridgeVideo.pause();
      bridgeEl.hidden = true;
      bridgeLaunch.hidden = true;
      bridgeEl.classList.remove("is-finished");
      if (document.pointerLockElement === canvas) document.exitPointerLock();
    }
  }

  new MutationObserver(activateIfNeeded).observe(gameScreen, { attributes: true, attributeFilter: ["class"] });
  window.addEventListener("startail:chapter-select", activateIfNeeded);
  window.addEventListener("startail:chapter-enter", event => {
    if (event.detail?.chapter && event.detail.chapter !== 1) return;
    activateIfNeeded();
    if (state.active) enterPlay();
  });
  activateIfNeeded();

  enterButton.addEventListener("click", enterPlay);
  memoryContinueButton.addEventListener("click", hideCollarMemory);
  replayButton.addEventListener("click", () => {
    resetChapter();
    state.playing = true;
    if (!isTouch && canvas.requestPointerLock) canvas.requestPointerLock();
  });
  nextButton.addEventListener("click", showChapterBridge);
  bridgeVideo.addEventListener("timeupdate", updateBridgeProgress);
  bridgeVideo.addEventListener("ended", showBridgeLaunch);
  bridgeSkipButton.addEventListener("click", showBridgeLaunch);
  bridgeStartButton.addEventListener("click", enterSecondChapter);
  canvas.addEventListener("click", () => {
    if (state.active && state.playing && !isTouch && document.pointerLockElement !== canvas && pauseScreen.hidden) canvas.requestPointerLock();
  });

  document.addEventListener("pointerlockchange", () => {
    if (document.pointerLockElement !== canvas && state.playing) showResumeGate();
  });
  document.addEventListener("mousemove", event => {
    if (!state.active || document.pointerLockElement !== canvas || !state.playing) return;
    player.yaw -= event.movementX * 0.00215;
    player.pitch = THREE.MathUtils.clamp(player.pitch - event.movementY * 0.00185, -0.92, 0.78);
  });

  window.addEventListener("keydown", event => {
    if (!state.active) return;
    if (!bridgeEl.hidden) {
      if (["Escape", "Enter", "Space"].includes(event.code)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (event.code === "Escape" || bridgeLaunch.hidden) showBridgeLaunch();
        else enterSecondChapter();
      }
      return;
    }
    if (state.memoryOpen) {
      if (["Escape", "Enter", "Space", "KeyE"].includes(event.code)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        hideCollarMemory();
      }
      return;
    }
    const handled = ["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "Space", "KeyQ", "KeyE", "ShiftLeft", "ShiftRight", "Escape"].includes(event.code);
    if (handled) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    if (event.repeat && ["Space", "KeyQ"].includes(event.code)) return;
    if (event.code === "Escape") {
      clearMovementInput();
      if (document.pointerLockElement === canvas) document.exitPointerLock();
      if (pauseScreen.hidden) pauseButton.click(); else resumeButton.click();
      return;
    }
    if (!pauseScreen.hidden) return;
    if (["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ShiftLeft", "ShiftRight"].includes(event.code)) keys.add(event.code);
    if (event.code === "Space") jump();
    if (event.code === "KeyQ") toggleScent();
    if (event.code === "KeyE") startInteract();
  }, true);

  window.addEventListener("keyup", event => {
    if (!state.active) return;
    if (["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "Space", "KeyQ", "KeyE", "ShiftLeft", "ShiftRight"].includes(event.code)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    keys.delete(event.code);
    if (event.code === "KeyE") stopInteract();
  }, true);

  function clearMovementInput() {
    keys.clear();
    player.moving = false;
    state.holdingInteract = false;
    state.scratchStartedAt = 0;
    state.touchMove.x = 0;
    state.touchMove.y = 0;
    state.joystickPointer = null;
    joystickKnob.style.transform = "translate(0,0)";
  }

  window.addEventListener("blur", () => {
    if (!state.active) return;
    clearMovementInput();
    if (document.pointerLockElement === canvas) document.exitPointerLock();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state.active) clearMovementInput();
  });
  pauseButton?.addEventListener("click", clearMovementInput);

  resumeButton?.addEventListener("click", () => {
    clearMovementInput();
    state.playing = true;
    gate.hidden = true;
    if (!isTouch && canvas.requestPointerLock) canvas.requestPointerLock();
  });
  restartButton?.addEventListener("click", () => {
    resetChapter();
    clearMovementInput();
    state.playing = true;
    gate.hidden = true;
    if (!isTouch && canvas.requestPointerLock) canvas.requestPointerLock();
  });

  function updateJoystick(event) {
    const rect = joystick.getBoundingClientRect();
    let x = (event.clientX - (rect.left + rect.width / 2)) / (rect.width * 0.34);
    let y = (event.clientY - (rect.top + rect.height / 2)) / (rect.height * 0.34);
    const length = Math.hypot(x, y);
    if (length > 1) { x /= length; y /= length; }
    state.touchMove.x = x;
    state.touchMove.y = y;
    joystickKnob.style.transform = `translate(${x * 31}px,${y * 31}px)`;
  }
  joystick.addEventListener("pointerdown", event => {
    state.joystickPointer = event.pointerId;
    joystick.setPointerCapture(event.pointerId);
    updateJoystick(event);
  });
  joystick.addEventListener("pointermove", event => {
    if (event.pointerId === state.joystickPointer) updateJoystick(event);
  });
  const clearJoystick = event => {
    if (event.pointerId !== state.joystickPointer) return;
    state.joystickPointer = null;
    state.touchMove.x = state.touchMove.y = 0;
    joystickKnob.style.transform = "translate(0,0)";
  };
  joystick.addEventListener("pointerup", clearJoystick);
  joystick.addEventListener("pointercancel", clearJoystick);

  lookzone.addEventListener("pointerdown", event => {
    state.lookPointer = event.pointerId;
    state.lookLast.x = event.clientX;
    state.lookLast.y = event.clientY;
    lookzone.setPointerCapture(event.pointerId);
  });
  lookzone.addEventListener("pointermove", event => {
    if (event.pointerId !== state.lookPointer || !state.playing) return;
    const dx = event.clientX - state.lookLast.x;
    const dy = event.clientY - state.lookLast.y;
    state.lookLast.x = event.clientX;
    state.lookLast.y = event.clientY;
    player.yaw -= dx * 0.0062;
    player.pitch = THREE.MathUtils.clamp(player.pitch - dy * 0.0052, -0.92, 0.78);
  });
  const clearLook = event => { if (event.pointerId === state.lookPointer) state.lookPointer = null; };
  lookzone.addEventListener("pointerup", clearLook);
  lookzone.addEventListener("pointercancel", clearLook);

  touchSense.addEventListener("click", () => toggleScent());
  touchJump.addEventListener("click", jump);
  touchInteract.addEventListener("pointerdown", event => { event.preventDefault(); startInteract(); });
  ["pointerup", "pointercancel", "pointerleave"].forEach(type => touchInteract.addEventListener(type, stopInteract));

  Object.defineProperty(window, "__starTailChapter", {
    configurable: true,
    value: {
      snapshot: () => ({ stage: state.stage, scent: state.scent, alert: state.alert, complete: state.complete, nearby: state.nearby, holdingInteract: state.holdingInteract, scratch: state.scratch, paused: !pauseScreen.hidden, position: player.position.toArray() }),
      teleport: (x, z) => { player.position.x = x; player.position.z = z; updateNearby(); },
      collectCollar,
      finishCable,
      reset: resetChapter
    }
  });
})();
