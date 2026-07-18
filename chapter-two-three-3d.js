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
    <section id="later3dGate" class="later3d-gate">
      <div><small id="later3dGateKicker"></small><h2 id="later3dGateTitle"></h2><p id="later3dGateHint">鼠标控制视角 · W A S D 移动 · 空格跳跃 · Q 感知 · E 互动</p><button id="later3dEnter" type="button">进入场景</button></div>
    </section>
    <section id="later3dComplete" class="later3d-complete" hidden>
      <div><small id="later3dCompleteKicker"></small><h2 id="later3dCompleteTitle"></h2><p id="later3dCompleteText"></p><button id="later3dNext" type="button"></button><button id="later3dReplay" class="later3d-replay" type="button">重新游玩本章</button></div>
    </section>
    <div class="later3d-touch" aria-label="触屏游戏控制"><div id="later3dStick" class="later3d-stick"><i></i></div><div class="later3d-actions"><button id="later3dSense" type="button">感知</button><button id="later3dJump" type="button">跳</button><button id="later3dInteract" type="button">互动</button></div></div>
    <div id="later3dLookzone" class="later3d-lookzone" aria-hidden="true"></div>
    <div class="later3d-rotate"><span>请旋转设备至横屏游玩</span></div>
    <div class="later3d-damage" aria-hidden="true"></div>
  `;
  gameScreen.prepend(root);

  const $ = (selector) => root.querySelector(selector);
  const canvas = $(".later3d-canvas");
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
  const enterButton = $("#later3dEnter");
  const gateKicker = $("#later3dGateKicker");
  const gateTitle = $("#later3dGateTitle");
  const completeEl = $("#later3dComplete");
  const completeKicker = $("#later3dCompleteKicker");
  const completeTitle = $("#later3dCompleteTitle");
  const completeText = $("#later3dCompleteText");
  const nextButton = $("#later3dNext");
  const replayButton = $("#later3dReplay");
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
  let audioContext = null;
  let activeTarget = null;
  let waterLines = [];
  let solarMirror = null;
  let gardenVines = [];
  let targetLight = null;

  const player = {
    position: new THREE.Vector3(0, 1.13, 14), checkpoint: new THREE.Vector3(0, 1.13, 14), yaw: 0, pitch: 0,
    velocityY: 0, grounded: true, moving: false, step: 0
  };
  const state = {
    active: false, playing: false, chapter: 0, complete: false, memoryOpen: false, stage: 0, puzzleTurns: 0,
    scent: false, nearby: null, alert: 0, touchMove: { x: 0, y: 0 }, stickPointer: null, lookPointer: null,
    lookLast: { x: 0, y: 0 }, lastAlertReset: 0, pawReachUntil: 0
  };

  const COLOR = { ink: 0x06101d, steel: 0x2d4252, trim: 0x607482, cyan: 0x20e5d4, pink: 0xff3f92, amber: 0xffc34b, orange: 0xd96a27, leaf: 0x7abf68, greenGlow: 0x9be968, danger: 0xff3155 };
  const material = (color, metalness = .5, roughness = .55, emissive = 0x000000, intensity = 0) => new THREE.MeshStandardMaterial({ color, metalness, roughness, emissive, emissiveIntensity: intensity });
  const metal = material(COLOR.steel, .82, .42);
  const dark = material(COLOR.ink, .88, .35);
  const trim = material(COLOR.trim, .68, .42);
  const cyan = material(0x8cfff1, .18, .25, COLOR.cyan, 3.2);
  const pink = material(0xff81bd, .2, .28, COLOR.pink, 3.1);
  const amber = material(0xffd17a, .18, .28, COLOR.amber, 3.5);
  const leaf = material(0x8bbf6b, .08, .78, 0x3c6f34, .25);
  const vineMaterial = material(0x466c3b, .08, .82, 0x1b3e2b, .18);

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

  function clearWorld() { while(world.children.length) world.remove(world.children[0]); colliders.length=0;platforms.length=0;scanners.length=0;guides.length=0;scentMarks.length=0;animated.length=0;waterLines=[];gardenVines=[];solarMirror=null;activeTarget=null;targetLight=null; }
  function addBackground(stars = 600, tint = 0x243f70) { scene.background=new THREE.Color(0x020813);scene.fog=new THREE.FogExp2(tint,.022);const sky=new THREE.BufferGeometry();const pos=[];for(let i=0;i<stars;i++)pos.push((Math.random()-.5)*80,Math.random()*34-3,-48-Math.random()*100);sky.setAttribute("position",new THREE.Float32BufferAttribute(pos,3));world.add(new THREE.Points(sky,new THREE.PointsMaterial({color:0xbfeaff,size:.07,transparent:true,opacity:.86,depthWrite:false})));const hemi=new THREE.HemisphereLight(0x9ccfff,0x080410,2.25);world.add(hemi);const fill=new THREE.AmbientLight(0x7090a2,.75);world.add(fill);const lamp=new THREE.PointLight(0xa9dfff,15,12,2);camera.add(lamp); }
  function loadProp(url, position, height, rotationY = 0) { loader.load(url, gltf=>{ if(!state.active)return;const model=gltf.scene;model.traverse(node=>{if(!node.isMesh)return;node.material=Array.isArray(node.material)?node.material.map(mat=>mat.clone()):node.material.clone();node.material.metalness=Math.min(.85,node.material.metalness??.6);node.material.roughness=Math.max(.35,node.material.roughness??.5);if(node.material.map)node.material.map.colorSpace=THREE.SRGBColorSpace;});const box=new THREE.Box3().setFromObject(model), size=box.getSize(new THREE.Vector3()), center=box.getCenter(new THREE.Vector3());model.position.set(-center.x,-box.min.y,-center.z);const holder=new THREE.Group();holder.position.set(...position);holder.rotation.y=rotationY;holder.scale.setScalar(height/Math.max(.01,size.y));holder.add(model);world.add(holder);},undefined,()=>{}); }
  function makeCargoCrate(x,z,w,d,h,color=metal,platform=false) { const group=new THREE.Group();group.position.set(x,0,z);world.add(group);addBox([w,h,d],[0,h/2,0],color,group);addBox([w+.04,.12,d+.04],[0,h*.67,0],dark,group);for(const px of [-1,1])for(const pz of [-1,1]){const pin=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,h*.72,8),trim);pin.position.set(px*(w*.39),h*.5,pz*(d*.39));group.add(pin);} if(platform)addPlatform(x,z,w,d,h);else addCollider(x,z,w+.15,d+.15);return group; }
  function makeDrone(position, color = COLOR.pink) { const drone=new THREE.Group();drone.position.set(...position);world.add(drone);const core=new THREE.Mesh(new THREE.SphereGeometry(.38,22,16),dark);core.scale.set(1.2,.7,1);drone.add(core);const eye=new THREE.Mesh(new THREE.SphereGeometry(.11,16,12),material(0xff8abf,.15,.25,color,4));eye.position.z=.37;drone.add(eye);for(let i=0;i<4;i++){const arm=new THREE.Mesh(new THREE.BoxGeometry(.6,.06,.1),trim);arm.rotation.y=i*Math.PI/2;drone.add(arm);const pod=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,.16,10),metal);pod.position.set(Math.cos(i*Math.PI/2)*.34,-.06,Math.sin(i*Math.PI/2)*.34);drone.add(pod);}const light=new THREE.PointLight(color,20,5,2);eye.add(light);const beam=new THREE.Mesh(new THREE.ConeGeometry(.86,7,20,1,true),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.08,depthWrite:false,side:THREE.DoubleSide}));beam.rotation.x=Math.PI/2;beam.position.z=3.5;drone.add(beam);scanners.push({drone,beam,origin:new THREE.Vector3(...position),phase:Math.random()*6.28});return drone; }
  function makeFeather(position) { const group=new THREE.Group();group.position.set(...position);group.userData.baseY=position[1];const quill=new THREE.Mesh(new THREE.CylinderGeometry(.028,.018,.82,10),amber);quill.rotation.z=-.55;group.add(quill);const vaneMat=new THREE.MeshBasicMaterial({color:0xff72b6,transparent:true,opacity:.94,side:THREE.DoubleSide});for(const side of [-1,1]){const vane=new THREE.Mesh(new THREE.PlaneGeometry(.38,.72),vaneMat);vane.position.set(side*.105,.18,0);vane.rotation.z=side*.52;group.add(vane);}const glow=addGlow(position,0xffbf54,1.55);group.userData.glow=glow;world.add(group);animated.push({type:"feather",group});return group; }
  function makeRootMark(x,z,color=COLOR.greenGlow) { const ring=new THREE.Mesh(new THREE.TorusGeometry(.34,.02,8,32),new THREE.MeshBasicMaterial({color,transparent:true,opacity:0,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.set(x,.02,z);world.add(ring);scentMarks.push(ring); }

  function buildPort() {
    root.dataset.chapter="2";addBackground(720,0x14243d);world.add(new THREE.Mesh(new THREE.PlaneGeometry(25,78),new THREE.MeshStandardMaterial({color:0x273c50,metalness:.8,roughness:.42})));world.children[world.children.length-1].rotation.x=-Math.PI/2;world.children[world.children.length-1].position.z=-20;
    const ceiling=addBox([25,.16,78],[0,8,-20],dark);
    for(let z=15;z>-58;z-=6){ addBox([.22,6,5.7],[-12.2,3,z],z%12?metal:trim);addBox([.22,6,5.7],[12.2,3,z],z%12?metal:trim);addBox([25,.13,.14],[0,5.85,z-2.82],trim);const lampColor=z%12?COLOR.cyan:COLOR.pink;addBox([.12,.08,2.4],[-11.96,3.9,z],material(0xffffff,.1,.3,lampColor,3));addBox([.12,.08,2.4],[11.96,3.9,z],material(0xffffff,.1,.3,lampColor,3)); }
    for(const x of [-10.8,10.8])for(const y of [4.7,5.05]){const tube=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,73,10),dark);tube.rotation.x=Math.PI/2;tube.position.set(x,y,-20);world.add(tube);}
    [[-5,5,2.4,2.5,1.2,false],[5.6,1,2.8,2.4,1.4,false],[-7,-7,3.4,2.5,1.35,true],[3.2,-12,3,2.8,1.55,true],[-3.5,-22,4,3,1.6,false],[6,-29,3.1,2.4,2.25,true],[-5,-37,3.3,3.3,1.2,true],[2,-44,3.4,3,1.6,true]].forEach(data=>makeCargoCrate(...data));
    const crane=new THREE.Group();crane.position.set(0,0,-19);world.add(crane);addBox([.32,6,.32],[0,3,0],trim,crane);addBox([12,.24,.34],[0,5.6,0],metal,crane);addBox([.12,3,.12],[5.1,4.1,0],dark,crane);const hook=new THREE.Mesh(new THREE.TorusGeometry(.24,.07,10,18,Math.PI),amber);hook.position.set(5.1,2.45,0);crane.add(hook);animated.push({type:"crane",group:crane});
    addSign("百目港 · 漂浮货运层",[-11.92,3.1,10],4.6,"#20e5d4",Math.PI/2);addSign("扫描区",[11.92,3.1,-25],3.2,"#ff3f92",-Math.PI/2);
    [[-5.9,3,.2],[7.2,-15.7,1.75],[-2.2,-42.2,2.85]].forEach((p,index)=>guides.push(makeFeather(p)));
    guides.forEach((guide,index)=>guide.visible=index===0);activeTarget=guides[0];targetLight=addArcLight(activeTarget.position.toArray(),COLOR.amber,56,7);
    makeDrone([4.5,2.7,-9],COLOR.pink);makeDrone([-5.2,2.6,-31],COLOR.cyan);makeDrone([2.8,3.2,-47],COLOR.pink);
    for(let z=5;z>-46;z-=4)makeRootMark(Math.sin(z)*2.4,z,COLOR.amber);
    [[-8,2.3,7],[8,2.4,-10],[-8,2.8,-28],[8,2.7,-46]].forEach((p,i)=>addArcLight(p,i%2?COLOR.pink:COLOR.cyan,42,10));
  }
  function makePlant(position, scale=1, hue=0) { const plant=new THREE.Group();plant.position.set(...position);world.add(plant);const stalk=new THREE.Mesh(new THREE.CylinderGeometry(.055,.08,1.2*scale,10),vineMaterial);stalk.position.y=.6*scale;plant.add(stalk);for(let i=0;i<7;i++){const leafMesh=new THREE.Mesh(new THREE.SphereGeometry(.18*scale,18,12),leaf);leafMesh.scale.set(1.35,.28,.68);leafMesh.position.set(Math.sin(i*2.4)*.18*scale,.42*scale+i*.11*scale,Math.cos(i*2.4)*.18*scale);leafMesh.rotation.z=Math.sin(i*2.4)*.7;leafMesh.rotation.y=i*1.8;plant.add(leafMesh);}plant.userData.base=plant.scale.clone();gardenVines.push(plant);return plant; }
  function makeConsole(x,z,color,label) { const group=new THREE.Group();group.position.set(x,0,z);world.add(group);addBox([1.2,1.4,.7],[0,.7,0],dark,group);addBox([.8,.56,.08],[0,1.02,.39],material(0xffffff,.1,.25,color,3),group);for(let i=0;i<4;i++){const dot=new THREE.Mesh(new THREE.SphereGeometry(.045,10,8),material(0xffffff,.1,.2,color,3));dot.position.set(-.25+i*.17,.93,.45);group.add(dot);}const sign=addSign(label,[x,1.85,z],1.6,"#fff7df",0);sign.rotation.x=0;return group; }
  function buildGarden() {
    root.dataset.chapter="3";addBackground(520,0x15372f);scene.fog=new THREE.FogExp2(0x102d27,.018);const floor=new THREE.Mesh(new THREE.CircleGeometry(17,80),new THREE.MeshStandardMaterial({color:0x1e3b3b,metalness:.55,roughness:.55}));floor.rotation.x=-Math.PI/2;floor.scale.set(1,2.8,1);floor.position.z=-20;world.add(floor);
    for(let z=16;z>-58;z-=6){const ring=new THREE.Mesh(new THREE.TorusGeometry(12.4,.12,12,46),trim);ring.rotation.x=Math.PI/2;ring.position.z=z;world.add(ring);const upper=new THREE.Mesh(new THREE.TorusGeometry(12.4,.09,12,46),dark);upper.rotation.x=Math.PI/2;upper.position.set(0,7,z);world.add(upper);for(const x of [-12,12])addBox([.18,7,.18],[x,3.5,z],metal);}
    for(let i=0;i<26;i++){const angle=i*2.399;const radius=4+(i%4)*1.7;makePlant([Math.cos(angle)*radius,0,8-i*2.5+Math.sin(angle)*2],.65+(i%3)*.22);}
    for(const z of [10,-5,-21,-38,-53]){const lamp=addArcLight([0,5.6,z],COLOR.greenGlow,55,12);animated.push({type:"gardenLight",light:lamp,phase:z});}
    const podRing=new THREE.Group();podRing.position.set(-7,0,-28);world.add(podRing);for(let i=0;i<4;i++){const pod=new THREE.Mesh(new THREE.CylinderGeometry(.8,.95,2.8,16),new THREE.MeshPhysicalMaterial({color:0x4e7163,metalness:.28,roughness:.36,transparent:true,opacity:.72,transmission:.12}));pod.position.set(Math.cos(i*Math.PI/2)*2,1.45,Math.sin(i*Math.PI/2)*2);podRing.add(pod);makePlant([podRing.position.x+Math.cos(i*Math.PI/2)*2,pod.position.y-.85,podRing.position.z+Math.sin(i*Math.PI/2)*2],.52);}
    const water=makeConsole(-6,4,COLOR.cyan,"水循环");const mirror=makeConsole(6,-17,COLOR.amber,"折光镜");const vent=makeConsole(0,-39,COLOR.greenGlow,"气流阀");
    water.userData.kind="water";mirror.userData.kind="mirror";vent.userData.kind="vent";guides.push(water,mirror,vent);
    solarMirror=new THREE.Group();solarMirror.position.set(6,2.25,-17);world.add(solarMirror);const disc=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.1,.08,32),new THREE.MeshPhysicalMaterial({color:0xa4c5ca,metalness:.9,roughness:.15,clearcoat:.65}));disc.rotation.x=Math.PI/2;solarMirror.add(disc);const rim=new THREE.Mesh(new THREE.TorusGeometry(1.12,.08,12,32),amber);rim.rotation.x=Math.PI/2;solarMirror.add(rim);const beam=new THREE.Mesh(new THREE.CylinderGeometry(.11,.38,10,12,true),new THREE.MeshBasicMaterial({color:COLOR.amber,transparent:true,opacity:.05,depthWrite:false}));beam.position.set(-2.4,.2,-4.5);beam.rotation.x=Math.PI/2;solarMirror.add(beam);solarMirror.userData.beam=beam;
    [[-6,4,0,0,-9,0],[0,-9,0,6,-17,0],[6,-17,0,0,-28,0],[0,-28,0,0,-39,0]].forEach(points=>{const line=addTube([[points[0],.14,points[1]],[points[2],.14,points[3]],[points[4],.14,points[5]]],.085,material(0x31514e,.3,.5,COLOR.cyan,0));waterLines.push(line);});
    for(let z=7;z>-43;z-=3.5)makeRootMark(Math.sin(z*.4)*3,z,COLOR.greenGlow);
    loadProp(ecologyPodUrl,[-9,0,-45],3.1,.28);loadProp(energyCoreUrl,[1.2,.15,-39],.8,.4);loadProp(bulbRobotUrl,[2.7,.05,-48],1.35,-.5);
  }

  function buildChapter(chapter) {
    clearWorld(); state.chapter=chapter;state.stage=0;state.puzzleTurns=0;state.complete=false;state.memoryOpen=false;state.scent=false;state.nearby=null;state.alert=0;player.position.set(0,1.13,14);player.checkpoint.copy(player.position);player.yaw=0;player.pitch=0;player.velocityY=0;player.grounded=true;
    if(chapter===2)buildPort();else buildGarden();
    updateCopy();updateWorldState();
  }
  function chapterConfig() { return state.chapter===2 ? { kicker:"第二章 · 百目港", gateKicker:"第二章 · 记忆锚点：逗猫棒", gateTitle:"霓虹漂流港", objective:["追逐逗猫棒留下的光羽","穿过货箱与升降机，继续追踪","避开扫描眼，到达顶层货台"], memory:{k:"逗猫棒记忆 · 02",t:"一束追不上的光",p:"彩色羽毛在走廊尽头晃了一下。你扑过去，主人总会在最后一刻把它抬高，又在你快要失望时把它放回爪边。那时你只记得追逐和笑声。现在，逗猫棒的铃铛重新响起：原来那个一直陪你玩的人，从来没有离开过你的记忆。"}, complete:{k:"第二章完成",t:"追逐没有终点",p:"逗猫棒留下的铃声穿过港口噪音，点亮了下一处异常坐标。更温暖的气味，正从星环温室的方向传来。",next:"前往第三章"} } : { kicker:"第三章 · 眠海花园", gateKicker:"第三章 · 记忆锚点：猫条", gateTitle:"星环生态温室", objective:["开启感知，定位失效的水循环","校准三次折光镜，让阳光抵达温室","释放气流，唤醒沉睡的生态舱"], memory:{k:"猫条记忆 · 03",t:"家的味道",p:"熟悉的包装声轻轻响起。有人蹲在你面前，把猫条挤在指尖，耐心等你靠近；窗外再陌生，掌心的温度都像一个可以回去的地方。你终于明白，家并不只是一个坐标，而是有人愿意一次次等你靠近。"}, complete:{k:"第三章完成",t:"温室重新呼吸",p:"水、光与气流重新流过眠海花园。生命信号汇入航图，米粒找到了通往零点塔的下一段坐标。",next:"返回标题"} };
  }
  function updateCopy() { const data=chapterConfig();kickerEl.textContent=data.kicker;gateKicker.textContent=data.gateKicker;gateTitle.textContent=data.gateTitle;completeKicker.textContent=data.complete.k;completeTitle.textContent=data.complete.t;completeText.textContent=data.complete.p;nextButton.textContent=data.complete.next; }
  function updateObjective() { const data=chapterConfig();let text=data.objective[Math.min(state.stage,2)];if(state.chapter===3&&state.stage===1)text=`校准折光镜 ${state.puzzleTurns} / 3`;
    objectiveEl.textContent=text;[...stepsEl.children].forEach((dot,index)=>{dot.classList.toggle("done",index<state.stage);dot.classList.toggle("active",index===Math.min(state.stage,2));}); }
  function updateWorldState() { updateObjective();root.classList.toggle("scent-on",state.scent);modeEl.textContent=state.chapter===2?"追踪模式":state.scent?"感知模式 · 根系可见":"感知模式 · 关闭";if(state.chapter===3){waterLines.forEach((line,index)=>{const active=index<state.stage;line.material.emissiveIntensity=active?2.8:.08;line.material.color.setHex(active?0x9afff2:0x31514e);});gardenVines.forEach((plant,index)=>plant.scale.copy(plant.userData.base).multiplyScalar(1+(state.stage*.08)+(index%3===0?state.stage*.04:0)));if(solarMirror){solarMirror.rotation.y=state.puzzleTurns*Math.PI/6;solarMirror.userData.beam.material.opacity=state.puzzleTurns===3?.25:.05;}} }
  function showToast(text,duration=2800){clearTimeout(toastTimer);toastEl.textContent=text;toastEl.classList.add("visible");toastTimer=setTimeout(()=>toastEl.classList.remove("visible"),duration);}
  function ensureAudio(){if(!audioContext)audioContext=new (window.AudioContext||window.webkitAudioContext)();if(audioContext.state==="suspended")audioContext.resume();}
  function tone(freq,duration=.12,type="sine",gain=.035){try{ensureAudio();const o=audioContext.createOscillator(),g=audioContext.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(gain,audioContext.currentTime);g.gain.exponentialRampToValueAtTime(.0001,audioContext.currentTime+duration);o.connect(g).connect(audioContext.destination);o.start();o.stop(audioContext.currentTime+duration);}catch(_){}}
  function setScent(force){if(!state.playing||state.complete)return;state.scent=typeof force==="boolean"?force:!state.scent;updateWorldState();tone(state.scent?550:210,.18,"sine",.025);if(state.chapter===3&&state.scent)showToast("气味感知展开：发光根系会连接到失效设施。",2200);}
  function showMemory(){const data=chapterConfig().memory;state.memoryOpen=true;state.playing=false;clearInput();memoryKicker.textContent=data.k;memoryTitle.textContent=data.t;memoryText.textContent=data.p;memoryEl.hidden=false;if(document.pointerLockElement===canvas)document.exitPointerLock();memoryContinue.focus();}
  function hideMemory(){if(memoryEl.hidden)return;memoryEl.hidden=true;state.memoryOpen=false;finishChapter();}
  function captureFeather(){const previous=activeTarget;previous.visible=false;previous.userData.glow.visible=false;state.pawReachUntil=performance.now()+720;tone(650,.15,"triangle",.05);setTimeout(()=>tone(880,.28,"sine",.04),90);if(state.stage<2){state.stage++;activeTarget=guides[state.stage];activeTarget.visible=true;activeTarget.userData.glow.visible=true;targetLight.position.copy(activeTarget.position);player.checkpoint.copy(player.position);updateObjective();showToast(state.stage===1?"光羽跃上了集装箱高台。跟上它。":"铃铛声穿过扫描区，光羽又飞远了。",2600);}else{state.stage=3;updateObjective();showMemory();}}
  function solveGarden(){if(!state.scent){showToast("先按 Q 展开感知，跟随发光根系确认设施位置。",2200);return;}state.pawReachUntil=performance.now()+620;if(state.stage===0){state.stage=1;player.checkpoint.copy(player.position);showToast("水循环已恢复。折光镜正在等待校准。",2600);tone(450,.18,"sine",.05);}else if(state.stage===1){state.puzzleTurns++;tone(360+state.puzzleTurns*120,.16,"triangle",.04);if(state.puzzleTurns===3){state.stage=2;player.checkpoint.copy(player.position);showToast("光束抵达培养区。去打开最后的气流阀。",2800);}else showToast(`折光镜已转动 ${state.puzzleTurns} / 3`,1300);}else if(state.stage===2){state.stage=3;tone(520,.18,"sine",.05);setTimeout(()=>tone(740,.32,"sine",.045),120);showMemory();}updateWorldState();}
  function interact(){if(!state.playing||!state.nearby)return;if(state.chapter===2)captureFeather();else solveGarden();}
  function finishChapter(){state.complete=true;state.playing=false;completeEl.hidden=false;if(document.pointerLockElement===canvas)document.exitPointerLock();tone(430,.22,"sine",.05);setTimeout(()=>tone(660,.42,"triangle",.04),160);}
  function updateNearby(){state.nearby=null;let text="";if(state.chapter===2&&activeTarget&&player.position.distanceTo(activeTarget.position)<2.1){state.nearby="feather";text="接住逗猫棒光羽";} if(state.chapter===3){const targets=[new THREE.Vector3(-6,1.1,4),new THREE.Vector3(6,1.1,-17),new THREE.Vector3(0,1.1,-39)];const target=targets[Math.min(state.stage,2)];if(state.stage<3&&player.position.distanceTo(target)<2.25){state.nearby="garden";text=!state.scent?"开启感知定位设施":state.stage===1?`转动折光镜 · ${state.puzzleTurns} / 3`:state.stage===0?"激活水循环":"释放温室气流";}}promptEl.hidden=!state.nearby;if(state.nearby){promptEl.querySelector("span").textContent=text;touchInteract.classList.add("ready");}else touchInteract.classList.remove("ready");}
  function isBlocked(x,z){const r=.31;if(x<-11.72+r||x>11.72-r||z>17||z<-58)return true;for(const box of colliders){const cx=Math.max(box.minX,Math.min(x,box.maxX)),cz=Math.max(box.minZ,Math.min(z,box.maxZ));if((x-cx)**2+(z-cz)**2<r*r)return true;}return false;}
  function groundAt(x,z){let height=0;for(const platform of platforms)if(x>platform.minX&&x<platform.maxX&&z>platform.minZ&&z<platform.maxZ)height=Math.max(height,platform.height);return height;}
  function resetCheckpoint(message){player.position.copy(player.checkpoint);player.velocityY=0;player.grounded=true;state.alert=0;root.classList.add("hit");setTimeout(()=>root.classList.remove("hit"),500);showToast(message);tone(90,.35,"sawtooth",.045);}
  function jump(){if(!state.playing||!player.grounded||!pauseScreen.hidden)return;player.velocityY=4.5;player.grounded=false;tone(175,.1,"triangle",.024);}
  function updateMovement(dt){if(!state.playing||state.complete||!pauseScreen.hidden){player.moving=false;return;}const f=(keys.has("KeyW")||keys.has("ArrowUp")?1:0)-(keys.has("KeyS")||keys.has("ArrowDown")?1:0)-state.touchMove.y;const s=(keys.has("KeyD")?1:0)-(keys.has("KeyA")?1:0)+state.touchMove.x;const length=Math.hypot(f,s);if(length>.08){const forward=f/Math.max(1,length),side=s/Math.max(1,length),speed=keys.has("ShiftLeft")||keys.has("ShiftRight")?6:4.1;const dx=(Math.sin(player.yaw)*forward+Math.cos(player.yaw)*side)*speed*dt,dz=(-Math.cos(player.yaw)*forward+Math.sin(player.yaw)*side)*speed*dt;if(!isBlocked(player.position.x+dx,player.position.z))player.position.x+=dx;if(!isBlocked(player.position.x,player.position.z+dz))player.position.z+=dz;player.moving=true;player.step+=dt*speed*2.4;}else player.moving=false;player.velocityY-=10.8*dt;player.position.y+=player.velocityY*dt;const terrain=groundAt(player.position.x,player.position.z);if(player.position.y<=terrain+1.13){player.position.y=terrain+1.13;player.velocityY=0;player.grounded=true;}else player.grounded=false;if(player.position.y<-2)resetCheckpoint("跌回了下层货道，已返回最近检查点。");}
  function updateScanners(dt,time){if(state.chapter!==2||!state.playing)return;let detected=false;for(const scanner of scanners){scanner.drone.position.x=scanner.origin.x+Math.sin(time*.72+scanner.phase)*4.3;scanner.drone.position.y=scanner.origin.y+Math.sin(time*2+scanner.phase)*.16;scanner.drone.rotation.y=Math.sin(time*.72+scanner.phase)>0?Math.PI:0;scanner.beam.material.opacity=.045+Math.abs(Math.sin(time*2+scanner.phase))*.07;const dist=scanner.drone.position.distanceTo(player.position);if(dist<5.4&&player.position.y<scanner.drone.position.y+.8)detected=true;}state.alert=THREE.MathUtils.clamp(state.alert+(detected?32:-22)*dt,0,100);alertEl.style.width=`${state.alert}%`;alertEl.parentElement.classList.toggle("visible",state.alert>2);if(state.alert>99&&performance.now()-state.lastAlertReset>1200){state.lastAlertReset=performance.now();resetCheckpoint("扫描眼锁定了米粒，已返回最近的安全货台。");}}
  function updateWorld(dt,time){if(state.chapter===2){guides.forEach((guide,index)=>{guide.rotation.y+=dt*(1.2+index*.1);if(index===state.stage)guide.position.y=guide.userData.baseY+Math.sin(time*3+index)*.12;if(guide.userData.glow){guide.userData.glow.position.copy(guide.position);guide.userData.glow.scale.setScalar(1.2+Math.sin(time*4+index)*.16);}});if(targetLight&&activeTarget){targetLight.position.copy(activeTarget.position);targetLight.intensity=50+Math.sin(time*5)*10;}}
    if(state.chapter===3){scentMarks.forEach((mark,index)=>mark.material.opacity=THREE.MathUtils.lerp(mark.material.opacity,state.scent?(.3+Math.max(0,Math.sin(time*3-index*.45))*.58):0,Math.min(1,dt*7)));gardenVines.forEach((plant,index)=>plant.rotation.y=Math.sin(time*.6+index)*.04);}
    animated.forEach(item=>{if(item.type==="crane")item.group.position.y=Math.sin(time*.7)*.08;if(item.type==="gardenLight")item.light.intensity=45+Math.sin(time*1.5+item.phase)*10;});updateScanners(dt,time);
  }
  function updatePaws(time){const walk=player.moving&&player.grounded&&state.playing?Math.sin(player.step):Math.sin(time*1.4)*.1;const bob=player.moving&&player.grounded?Math.abs(Math.sin(player.step*.5))*.026:0;leftPaw.position.set(-.24,-.45-bob+Math.max(0,walk)*.014,-.67+Math.max(0,walk)*.045);rightPaw.position.set(.24,-.45-bob-Math.min(0,walk)*.014,-.67+Math.max(0,-walk)*.045);leftPaw.rotation.z=-.04+walk*.035;rightPaw.rotation.z=.04-walk*.035;const reach=state.pawReachUntil-performance.now();if(reach>0){const amount=Math.sin((1-reach/720)*Math.PI);rightPaw.position.x-=amount*.05;rightPaw.position.y+=amount*.18;rightPaw.position.z+=amount*.15;rightPaw.rotation.x=amount*.2;}else rightPaw.rotation.x=-.03;}
  function updateCamera(){camera.position.copy(player.position);camera.rotation.y=player.yaw;camera.rotation.x=player.pitch;camera.rotation.z=0;}
  function animate(){requestAnimationFrame(animate);const dt=Math.min(.04,clock.getDelta()),time=clock.elapsedTime;if(state.active){updateMovement(dt);updateNearby();updateWorld(dt,time);updatePaws(time);updateCamera();}renderer.render(scene,camera);}animate();
  function setSize(){const width=Math.max(1,root.clientWidth),height=Math.max(1,root.clientHeight);renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();}new ResizeObserver(setSize).observe(root);setSize();
  function clearInput(){keys.clear();state.touchMove.x=state.touchMove.y=0;state.stickPointer=null;stickKnob.style.transform="translate(0,0)";player.moving=false;}
  function resetChapter(){buildChapter(state.chapter);memoryEl.hidden=true;completeEl.hidden=true;progressEl.hidden=true;showToast(state.chapter===2?"港口的霓虹里，有一束熟悉的光正在移动。":"空气里混着植物与熟悉食物的气味。",3800);}
  function enterPlay(){clearInput();ensureAudio();state.playing=true;gate.hidden=true;if(!isTouch&&canvas.requestPointerLock)canvas.requestPointerLock();}
  function showResume(){if(!state.active||state.complete||state.memoryOpen||!pauseScreen.hidden||isTouch)return;clearInput();state.playing=false;gate.hidden=false;gateTitle.textContent="继续探索";enterButton.textContent="返回场景";}
  function selectChapter(chapter){const shouldActive=gameScreen.classList.contains("is-active")&&chapter>=2;if(!shouldActive){if(state.active){state.active=false;root.hidden=true;gameScreen.classList.remove("later-chapter-active");}document.body.classList.remove("later-chapter-running");return;}const changed=state.chapter!==chapter;if(!state.active||changed){state.active=true;root.hidden=false;gameScreen.classList.add("later-chapter-active");document.body.classList.add("later-chapter-running");buildChapter(chapter);state.playing=false;gate.hidden=false;enterButton.textContent="进入场景";} }
  function syncActive(){const chapter=window.__starTailActiveChapter||1;if(chapter>=2)selectChapter(chapter);else selectChapter(0);}

  window.addEventListener("startail:chapter-select",event=>selectChapter(event.detail?.chapter||window.__starTailActiveChapter||1));
  new MutationObserver(syncActive).observe(gameScreen,{attributes:true,attributeFilter:["class"]});
  enterButton.addEventListener("click",enterPlay);memoryContinue.addEventListener("click",hideMemory);replayButton.addEventListener("click",()=>{resetChapter();state.playing=true;if(!isTouch&&canvas.requestPointerLock)canvas.requestPointerLock();});
  nextButton.addEventListener("click",()=>{if(state.chapter===2){window.__starTailActiveChapter=3;window.dispatchEvent(new CustomEvent("startail:chapter-select",{detail:{chapter:3}}));}else{window.__starTailActiveChapter=1;document.querySelector("#returnTitleButton")?.click();}});
  canvas.addEventListener("click",()=>{if(state.active&&state.playing&&!isTouch&&document.pointerLockElement!==canvas&&pauseScreen.hidden)canvas.requestPointerLock();});
  document.addEventListener("pointerlockchange",()=>{if(state.active&&document.pointerLockElement!==canvas&&state.playing)showResume();});
  document.addEventListener("mousemove",event=>{if(!state.active||document.pointerLockElement!==canvas||!state.playing)return;player.yaw-=event.movementX*.00215;player.pitch=THREE.MathUtils.clamp(player.pitch-event.movementY*.00185,-.92,.78);});
  window.addEventListener("keydown",event=>{if(!state.active)return;if(state.memoryOpen){if(["Escape","Enter","Space","KeyE"].includes(event.code)){event.preventDefault();event.stopImmediatePropagation();hideMemory();}return;}const handled=["KeyW","KeyA","KeyS","KeyD","ArrowUp","ArrowDown","Space","KeyQ","KeyE","ShiftLeft","ShiftRight","Escape"].includes(event.code);if(handled){event.preventDefault();event.stopImmediatePropagation();}if(event.repeat&&["Space","KeyQ"].includes(event.code))return;if(event.code==="Escape"){clearInput();if(document.pointerLockElement===canvas)document.exitPointerLock();if(pauseScreen.hidden)pauseButton.click();else resumeButton.click();return;}if(!pauseScreen.hidden)return;if(["KeyW","KeyA","KeyS","KeyD","ArrowUp","ArrowDown","ShiftLeft","ShiftRight"].includes(event.code))keys.add(event.code);if(event.code==="Space")jump();if(event.code==="KeyQ")setScent();if(event.code==="KeyE")interact();},true);
  window.addEventListener("keyup",event=>{if(!state.active)return;if(["KeyW","KeyA","KeyS","KeyD","ArrowUp","ArrowDown","Space","KeyQ","KeyE","ShiftLeft","ShiftRight"].includes(event.code)){event.preventDefault();event.stopImmediatePropagation();}keys.delete(event.code);},true);
  window.addEventListener("blur",()=>{if(state.active){clearInput();if(document.pointerLockElement===canvas)document.exitPointerLock();}});document.addEventListener("visibilitychange",()=>{if(document.hidden&&state.active)clearInput();});pauseButton?.addEventListener("click",()=>{if(state.active)clearInput();});resumeButton?.addEventListener("click",()=>{if(!state.active||state.complete)return;clearInput();state.playing=true;gate.hidden=true;if(!isTouch&&canvas.requestPointerLock)canvas.requestPointerLock();});restartButton?.addEventListener("click",()=>{if(!state.active)return;resetChapter();state.playing=true;gate.hidden=true;if(!isTouch&&canvas.requestPointerLock)canvas.requestPointerLock();});
  function updateStick(event){const rect=stick.getBoundingClientRect();let x=(event.clientX-(rect.left+rect.width/2))/(rect.width*.34),y=(event.clientY-(rect.top+rect.height/2))/(rect.height*.34);const len=Math.hypot(x,y);if(len>1){x/=len;y/=len;}state.touchMove.x=x;state.touchMove.y=y;stickKnob.style.transform=`translate(${x*31}px,${y*31}px)`;}
  stick.addEventListener("pointerdown",event=>{state.stickPointer=event.pointerId;stick.setPointerCapture(event.pointerId);updateStick(event);});stick.addEventListener("pointermove",event=>{if(event.pointerId===state.stickPointer)updateStick(event);});const stopStick=event=>{if(event.pointerId!==state.stickPointer)return;state.stickPointer=null;state.touchMove.x=state.touchMove.y=0;stickKnob.style.transform="translate(0,0)";};stick.addEventListener("pointerup",stopStick);stick.addEventListener("pointercancel",stopStick);
  lookzone.addEventListener("pointerdown",event=>{state.lookPointer=event.pointerId;state.lookLast.x=event.clientX;state.lookLast.y=event.clientY;lookzone.setPointerCapture(event.pointerId);});lookzone.addEventListener("pointermove",event=>{if(event.pointerId!==state.lookPointer||!state.playing)return;const dx=event.clientX-state.lookLast.x,dy=event.clientY-state.lookLast.y;state.lookLast.x=event.clientX;state.lookLast.y=event.clientY;player.yaw-=dx*.0062;player.pitch=THREE.MathUtils.clamp(player.pitch-dy*.0052,-.92,.78);});["pointerup","pointercancel"].forEach(type=>lookzone.addEventListener(type,event=>{if(event.pointerId===state.lookPointer)state.lookPointer=null;}));touchSense.addEventListener("click",()=>setScent());touchJump.addEventListener("click",jump);touchInteract.addEventListener("click",interact);
  window.__starTailLaterChapters={select:chapter=>{window.__starTailActiveChapter=chapter;selectChapter(chapter);},snapshot:()=>({chapter:state.chapter,stage:state.stage,complete:state.complete,position:player.position.toArray(),scent:state.scent})};syncActive();
})();
