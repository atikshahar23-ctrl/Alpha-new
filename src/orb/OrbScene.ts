import * as THREE from 'three';

export interface OrbHandle {
  setEnergy(v: number): void;
  dispose(): void;
  startBodyDetection(): void;
  stopBodyDetection(): void;
}

export function mountOrb(container: HTMLElement): OrbHandle {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 1.8, 6.0);
  camera.lookAt(0, 1.5, 0);

  function resize() {
    const w = container.clientWidth || 240;
    const h = container.clientHeight || w;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  function makeGlow(r: number, g: number, b: number) {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const ctx = c.getContext('2d')!;
    const grd = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, `rgba(${r},${g},${b},1)`);
    grd.addColorStop(0.25, `rgba(${r},${g},${b},.7)`);
    grd.addColorStop(0.5, `rgba(${r},${g},${b},.2)`);
    grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }
  const glowCyan = makeGlow(95, 230, 255);
  const glowGold = makeGlow(255, 194, 77);
  const glowWhite = makeGlow(255, 250, 240);

  const group = new THREE.Group();
  scene.add(group);

  const S = 2.5;
  const BY = -1.8;

  // --- HIGH-DETAIL HUMANOID ---
  const bodyPts: number[] = [];
  const skelPts: number[] = [];

  function addSphere(cx: number, cy: number, cz: number, r: number, n: number) {
    for (let i = 0; i < n; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const sr = r * (0.85 + Math.random() * 0.15);
      bodyPts.push(
        cx + sr * Math.sin(phi) * Math.cos(theta),
        cy + sr * Math.cos(phi),
        cz + sr * Math.sin(phi) * Math.sin(theta)
      );
    }
  }

  function addCylinder(x: number, y1: number, y2: number, z: number, r1: number, r2: number, n: number) {
    for (let i = 0; i < n; i++) {
      const t = Math.random();
      const y = y1 + (y2 - y1) * t;
      const r = r1 + (r2 - r1) * t;
      const a = Math.random() * Math.PI * 2;
      const rr = r * (0.9 + Math.random() * 0.1);
      bodyPts.push(x + rr * Math.cos(a), y, z + rr * Math.sin(a));
    }
  }

  function addLine(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, n: number) {
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      skelPts.push(
        x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, z1 + (z2 - z1) * t
      );
    }
  }

  // Head
  addSphere(0, BY + 2.15 * S, 0, 0.2 * S, 1200);
  // Eyes (bright spots)
  const eyeY = BY + 2.18 * S;
  const eyeZ = 0.15 * S;
  addSphere(-0.07 * S, eyeY, eyeZ, 0.025 * S, 80);
  addSphere(0.07 * S, eyeY, eyeZ, 0.025 * S, 80);

  // Neck
  addCylinder(0, BY + 1.92 * S, BY + 2.0 * S, 0, 0.07 * S, 0.09 * S, 200);

  // Torso (chest wider, waist narrower)
  addCylinder(0, BY + 1.4 * S, BY + 1.92 * S, 0, 0.2 * S, 0.32 * S, 2500);

  // Chest definition (pectoral area)
  addSphere(-0.12 * S, BY + 1.78 * S, 0.08 * S, 0.1 * S, 300);
  addSphere(0.12 * S, BY + 1.78 * S, 0.08 * S, 0.1 * S, 300);

  // Shoulders & Arms
  for (let side = -1; side <= 1; side += 2) {
    // Shoulder sphere
    addSphere(side * 0.38 * S, BY + 1.85 * S, 0, 0.1 * S, 400);
    // Upper arm
    addCylinder(side * 0.5 * S, BY + 1.55 * S, BY + 1.85 * S, 0, 0.055 * S, 0.07 * S, 500);
    // Elbow
    addSphere(side * 0.55 * S, BY + 1.5 * S, 0.05 * S, 0.06 * S, 200);
    // Forearm (reaching outward and slightly up)
    for (let i = 0; i < 500; i++) {
      const t = Math.random();
      const x = side * (0.55 + t * 0.55) * S;
      const y = BY + (1.5 - t * 0.15 + t * t * 0.35) * S;
      const z = (0.05 + t * 0.2) * S;
      const a = Math.random() * Math.PI * 2;
      const r = (0.045 - t * 0.015) * S;
      bodyPts.push(x + r * Math.cos(a), y, z + r * Math.sin(a));
    }
    // Hand (open, welcoming)
    addSphere(side * 1.1 * S, BY + 1.7 * S, 0.25 * S, 0.05 * S, 200);
    // Fingers
    for (let f = 0; f < 5; f++) {
      for (let i = 0; i < 40; i++) {
        const t = Math.random() * 0.12 * S;
        const fa = ((f - 2) / 5) * 0.8;
        bodyPts.push(
          side * (1.15 * S + t * Math.cos(fa) * side),
          BY + (1.72 + f * 0.015) * S + t * Math.sin(fa),
          0.28 * S + t * 0.08
        );
      }
    }

    // Skeleton lines: shoulder → elbow → hand
    addLine(side * 0.38 * S, BY + 1.85 * S, 0, side * 0.55 * S, BY + 1.5 * S, 0.05 * S, 20);
    addLine(side * 0.55 * S, BY + 1.5 * S, 0.05 * S, side * 1.1 * S, BY + 1.7 * S, 0.25 * S, 25);
  }

  // Skeleton lines: spine
  addLine(0, BY + 1.4 * S, 0, 0, BY + 2.15 * S, 0, 30);
  // Collarbone
  addLine(-0.38 * S, BY + 1.85 * S, 0, 0.38 * S, BY + 1.85 * S, 0, 20);

  // --- BODY PARTICLES ---
  const bodyGeo = new THREE.BufferGeometry();
  bodyGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(bodyPts), 3));
  const bodyMat = new THREE.PointsMaterial({
    size: 0.022, map: glowCyan, color: 0x55ddff,
    transparent: true, opacity: 0.85,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  });
  const body = new THREE.Points(bodyGeo, bodyMat);
  group.add(body);

  // --- SKELETON WIREFRAME ---
  const skelGeo = new THREE.BufferGeometry();
  skelGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(skelPts), 3));
  const skelMat = new THREE.PointsMaterial({
    size: 0.015, map: glowWhite, color: 0xaaeeff,
    transparent: true, opacity: 0.5,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  });
  const skeleton = new THREE.Points(skelGeo, skelMat);
  group.add(skeleton);

  // --- GOLD HIGHLIGHTS ---
  const goldPts: number[] = [];
  for (let i = 0; i < 800; i++) {
    const idx = Math.floor(Math.random() * (bodyPts.length / 3)) * 3;
    goldPts.push(
      bodyPts[idx] + (Math.random() - 0.5) * 0.03,
      bodyPts[idx + 1] + (Math.random() - 0.5) * 0.03,
      bodyPts[idx + 2] + (Math.random() - 0.5) * 0.03
    );
  }
  const goldGeo = new THREE.BufferGeometry();
  goldGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(goldPts), 3));
  const goldMat = new THREE.PointsMaterial({
    size: 0.035, map: glowGold, color: 0xffc24d,
    transparent: true, opacity: 0.6,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  });
  const goldParticles = new THREE.Points(goldGeo, goldMat);
  group.add(goldParticles);

  // --- EYE GLOW ---
  function makeEye(x: number) {
    const m = new THREE.SpriteMaterial({
      map: glowCyan, color: 0x88ffff, transparent: true, opacity: 0.7,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const s = new THREE.Sprite(m);
    s.scale.setScalar(0.12 * S);
    s.position.set(x, eyeY, eyeZ + 0.02 * S);
    group.add(s);
    return m;
  }
  const eyeL = makeEye(-0.07 * S);
  const eyeR = makeEye(0.07 * S);

  // --- HEART CORE (chest glow) ---
  const heartGeo = new THREE.IcosahedronGeometry(0.12 * S, 2);
  const heartMat = new THREE.MeshBasicMaterial({
    color: 0x66eeff, transparent: true, opacity: 0.4,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const heart = new THREE.Mesh(heartGeo, heartMat);
  heart.position.set(0, BY + 1.7 * S, 0.05 * S);
  group.add(heart);

  const heartWireGeo = new THREE.IcosahedronGeometry(0.15 * S, 1);
  const heartWireMat = new THREE.MeshBasicMaterial({
    color: 0x44aacc, wireframe: true, transparent: true, opacity: 0.25,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const heartWire = new THREE.Mesh(heartWireGeo, heartWireMat);
  heartWire.position.copy(heart.position);
  group.add(heartWire);

  // --- HEAD HALO ---
  const haloMat = new THREE.SpriteMaterial({
    map: glowCyan, color: 0x66eeff, transparent: true, opacity: 0.18,
    blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false,
  });
  const halo = new THREE.Sprite(haloMat);
  halo.scale.setScalar(3 * S);
  halo.position.set(0, BY + 2.15 * S, -0.4);
  group.add(halo);

  // --- ENERGY RIBBONS ---
  const ribbonCount = 6;
  const ribbonSegs = 60;
  const ribbons: { geo: THREE.BufferGeometry; baseX: number[]; baseY: number[]; baseZ: number[]; mat: THREE.LineBasicMaterial }[] = [];
  const rColors = [0x44ddff, 0xffc24d, 0x44ddff, 0xffc24d, 0x88bbff, 0xffa844];

  for (let r = 0; r < ribbonCount; r++) {
    const pts: number[] = [];
    const bx: number[] = [], by: number[] = [], bz: number[] = [];
    const side = r % 2 === 0 ? -1 : 1;
    const yOff = (r % 3) * 0.2;

    for (let i = 0; i <= ribbonSegs; i++) {
      const t = i / ribbonSegs;
      const x = (side * (0.2 + t * 1.5) + Math.sin(t * 5 + r) * 0.12) * S;
      const y = BY + (1.8 - yOff - t * 0.6 + Math.sin(t * 4 + r * 0.7) * 0.15) * S;
      const z = Math.sin(t * 6 + r * 1.2) * 0.2 * S;
      pts.push(x, y, z);
      bx.push(x); by.push(y); bz.push(z);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
    const mat = new THREE.LineBasicMaterial({
      color: rColors[r], transparent: true, opacity: 0.35,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const line = new THREE.Line(geo, mat);
    group.add(line);
    ribbons.push({ geo, baseX: bx, baseY: by, baseZ: bz, mat });
  }

  // --- SCAN LINES (horizontal holographic effect) ---
  const scanCount = 12;
  const scans: { geo: THREE.BufferGeometry; y: number }[] = [];
  for (let i = 0; i < scanCount; i++) {
    const y = BY + (0.8 + i * 0.13) * S;
    const pts = [];
    for (let j = 0; j <= 40; j++) {
      const t = j / 40;
      pts.push((t - 0.5) * 1.2 * S, y, 0);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
    const mat = new THREE.LineBasicMaterial({
      color: 0x44ddff, transparent: true, opacity: 0.06,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    group.add(new THREE.Line(geo, mat));
    scans.push({ geo, y });
  }

  // --- BASE RINGS ---
  const baseRings: THREE.Mesh[] = [];
  const ringR = [0.7, 1.0, 1.3, 1.6, 1.9];
  const ringC = [0x44ddff, 0xffc24d, 0x44ddff, 0xffc24d, 0x44ddff];
  for (let i = 0; i < ringR.length; i++) {
    const rGeo = new THREE.TorusGeometry(ringR[i] * S, 0.01, 8, 120);
    const rMat = new THREE.MeshBasicMaterial({
      color: ringC[i], transparent: true, opacity: 0.4 - i * 0.06,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const ring = new THREE.Mesh(rGeo, rMat);
    ring.rotation.x = Math.PI * 0.5;
    ring.position.y = BY + 0.8 * S;
    group.add(ring);
    baseRings.push(ring);
  }

  // Base glow
  const baseGlowMat = new THREE.SpriteMaterial({
    map: glowCyan, color: 0x44ddff, transparent: true, opacity: 0.2,
    blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false,
  });
  const baseGlow = new THREE.Sprite(baseGlowMat);
  baseGlow.scale.set(5 * S, 1.2 * S, 1);
  baseGlow.position.y = BY + 0.8 * S;
  group.add(baseGlow);

  // --- 6 ORBITING DOTS ---
  const ORBIT_DOTS = 6;
  const dotColors = [0x5fe6ff, 0xffc24d, 0xff5d73, 0xb06aff, 0x4dff91, 0xff9f43];
  const dotMeshes: THREE.Mesh[] = [];
  const dotGlows: THREE.Sprite[] = [];
  const dotOrbits: { angle: number; radius: number; speed: number; tilt: number; phase: number }[] = [];

  for (let i = 0; i < ORBIT_DOTS; i++) {
    const dGeo = new THREE.SphereGeometry(0.05, 12, 12);
    const dMat = new THREE.MeshBasicMaterial({ color: dotColors[i] });
    const dot = new THREE.Mesh(dGeo, dMat);
    group.add(dot); dotMeshes.push(dot);

    const isGold = i === 1 || i === 5;
    const spMat = new THREE.SpriteMaterial({
      map: isGold ? glowGold : glowCyan, color: dotColors[i],
      transparent: true, opacity: 0.55,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const sp = new THREE.Sprite(spMat);
    sp.scale.setScalar(0.4);
    group.add(sp); dotGlows.push(sp);

    dotOrbits.push({
      angle: (i / ORBIT_DOTS) * Math.PI * 2,
      radius: (1.8 + (i % 2) * 0.3) * S,
      speed: 0.35 + i * 0.06,
      tilt: (Math.PI / 5) * (i % 3 - 1),
      phase: i * 1.1,
    });
  }

  // --- FLOATING DATA PARTICLES ---
  const dataN = 40;
  const dataArr = new Float32Array(dataN * 3);
  const dataVel = new Float32Array(dataN);
  for (let i = 0; i < dataN; i++) {
    dataArr[i * 3] = (Math.random() - 0.5) * 3 * S;
    dataArr[i * 3 + 1] = BY + (0.5 + Math.random() * 2) * S;
    dataArr[i * 3 + 2] = (Math.random() - 0.5) * 2 * S;
    dataVel[i] = 0.002 + Math.random() * 0.005;
  }
  const dataGeo = new THREE.BufferGeometry();
  dataGeo.setAttribute('position', new THREE.BufferAttribute(dataArr, 3));
  const dataMat = new THREE.PointsMaterial({
    size: 0.03, map: glowGold, color: 0xffd080, transparent: true, opacity: 0.4,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  });
  const dataParticles = new THREE.Points(dataGeo, dataMat);
  group.add(dataParticles);

  let amp = 0.06, ampTarget = 0.06;
  let time = 0;
  let raf = 0;

  // --- SPATIAL DRIFT: figure moves organically in 3D space ---
  const drift = {
    x: 0, y: 0, z: 0,
    tx: 0, ty: 0, tz: 0,
    timer: 0,
    interval: 3 + Math.random() * 2,
  };

  function pickDriftTarget() {
    drift.tx = (Math.random() - 0.5) * 1.8;
    drift.ty = (Math.random() - 0.5) * 0.6;
    drift.tz = (Math.random() - 0.5) * 1.2;
    drift.interval = 3 + Math.random() * 4;
    drift.timer = 0;
  }

  // --- BODY DETECTION (MediaPipe Holistic) ---
  let holisticActive = false;
  let holisticVideo: HTMLVideoElement | null = null;
  let holisticCanvas: HTMLCanvasElement | null = null;
  let holisticCtx: CanvasRenderingContext2D | null = null;
  let holisticInstance: any = null;
  let holisticCamera: any = null;
  let holisticOverlay: HTMLDivElement | null = null;

  function createHolisticOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'holisticOverlay';
    overlay.style.cssText = `
      position:fixed; inset:0; z-index:3;
      display:flex; align-items:center; justify-content:center;
      pointer-events:none;
    `;

    const cvs = document.createElement('canvas');
    cvs.style.cssText = `
      width:60%; height:70%;
      max-width:640px; max-height:480px;
      border-radius:16px;
      border:1px solid rgba(95,230,255,.2);
      box-shadow:0 0 40px rgba(95,230,255,.1);
      background:transparent;
    `;
    overlay.appendChild(cvs);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
      position:absolute; top:20px; right:20px;
      width:36px; height:36px; border-radius:10px;
      background:rgba(8,12,24,.7); border:1px solid rgba(255,194,77,.2);
      color:#ffc24d; font-size:16px; cursor:pointer;
      pointer-events:all; z-index:10;
      backdrop-filter:blur(10px);
    `;
    closeBtn.onclick = () => stopBodyDetection();
    overlay.appendChild(closeBtn);

    const label = document.createElement('div');
    label.style.cssText = `
      position:absolute; top:20px; left:50%; transform:translateX(-50%);
      font-family:"Space Grotesk",sans-serif; font-size:10px;
      letter-spacing:4px; text-transform:uppercase;
      color:#5fe6ff; opacity:.7;
      background:rgba(8,12,24,.6); padding:6px 16px;
      border-radius:8px; border:1px solid rgba(95,230,255,.15);
      backdrop-filter:blur(10px);
    `;
    label.textContent = 'BODY DETECTION';
    overlay.appendChild(label);

    const status = document.createElement('div');
    status.id = 'holisticStatus';
    status.style.cssText = `
      position:absolute; bottom:20px; left:50%; transform:translateX(-50%);
      font-family:"Space Grotesk",sans-serif; font-size:9px;
      letter-spacing:3px; text-transform:uppercase;
      color:#ffc24d; opacity:.6;
      background:rgba(8,12,24,.6); padding:5px 14px;
      border-radius:8px; border:1px solid rgba(255,194,77,.15);
      backdrop-filter:blur(10px);
    `;
    status.textContent = 'INITIALIZING...';
    overlay.appendChild(status);

    document.body.appendChild(overlay);
    holisticOverlay = overlay;
    holisticCanvas = cvs;
    holisticCtx = cvs.getContext('2d');
    return { cvs, status };
  }

  async function loadHolisticScripts(): Promise<boolean> {
    const scripts = [
      'https://cdn.jsdelivr.net/npm/@mediapipe/holistic/holistic.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
    ];
    for (const src of scripts) {
      if (document.querySelector(`script[src="${src}"]`)) continue;
      await new Promise<void>((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.crossOrigin = 'anonymous';
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('Failed to load: ' + src));
        document.head.appendChild(s);
      });
    }
    return true;
  }

  async function startBodyDetection() {
    if (holisticActive) return;
    holisticActive = true;

    const { cvs, status } = createHolisticOverlay();

    try {
      await loadHolisticScripts();
      status.textContent = 'LOADING MODEL...';

      const W = window as any;
      const vid = document.createElement('video');
      vid.style.display = 'none';
      document.body.appendChild(vid);
      holisticVideo = vid;

      const holistic = new W.Holistic({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
      });
      holisticInstance = holistic;

      holistic.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        refineFaceLandmarks: true,
      });

      holistic.onResults((results: any) => {
        if (!holisticCtx || !holisticCanvas) return;
        const cw = cvs.width = cvs.clientWidth * (window.devicePixelRatio || 1);
        const ch = cvs.height = cvs.clientHeight * (window.devicePixelRatio || 1);
        const ctx = holisticCtx;
        ctx.clearRect(0, 0, cw, ch);

        ctx.save();
        ctx.globalAlpha = 0.15;
        if (results.image) {
          ctx.drawImage(results.image, 0, 0, cw, ch);
        }
        ctx.restore();

        if (results.poseLandmarks) {
          W.drawConnectors(ctx, results.poseLandmarks, W.POSE_CONNECTIONS, {
            color: '#5fe6ff', lineWidth: 2,
          });
          W.drawLandmarks(ctx, results.poseLandmarks, {
            color: '#ffc24d', fillColor: '#ffc24d', lineWidth: 1, radius: 3,
          });
        }
        if (results.faceLandmarks) {
          W.drawConnectors(ctx, results.faceLandmarks, W.FACEMESH_TESSELATION, {
            color: 'rgba(95,230,255,0.3)', lineWidth: 0.5,
          });
        }
        if (results.leftHandLandmarks) {
          W.drawConnectors(ctx, results.leftHandLandmarks, W.HAND_CONNECTIONS, {
            color: '#b06aff', lineWidth: 1.5,
          });
        }
        if (results.rightHandLandmarks) {
          W.drawConnectors(ctx, results.rightHandLandmarks, W.HAND_CONNECTIONS, {
            color: '#ff7a2e', lineWidth: 1.5,
          });
        }

        status.textContent = 'TRACKING ACTIVE';
        status.style.color = '#39e75f';
      });

      const cam = new W.Camera(vid, {
        onFrame: async () => { await holistic.send({ image: vid }); },
        width: 640,
        height: 480,
      });
      holisticCamera = cam;
      await cam.start();
      status.textContent = 'CAMERA READY';
    } catch (err: any) {
      status.textContent = 'ERROR: ' + (err.message || 'Camera failed');
      status.style.color = '#ff5d73';
    }
  }

  function stopBodyDetection() {
    holisticActive = false;
    if (holisticCamera) { try { holisticCamera.stop(); } catch {} holisticCamera = null; }
    if (holisticInstance) { try { holisticInstance.close(); } catch {} holisticInstance = null; }
    if (holisticVideo) { holisticVideo.remove(); holisticVideo = null; }
    if (holisticOverlay) { holisticOverlay.remove(); holisticOverlay = null; }
    holisticCanvas = null;
    holisticCtx = null;
  }

  function frame() {
    raf = requestAnimationFrame(frame);
    time += 0.016;
    amp += (ampTarget - amp) * 0.08;

    // --- SPATIAL DRIFT ---
    drift.timer += 0.016;
    if (drift.timer >= drift.interval) pickDriftTarget();
    const driftEase = 0.012;
    drift.x += (drift.tx - drift.x) * driftEase;
    drift.y += (drift.ty - drift.y) * driftEase;
    drift.z += (drift.tz - drift.z) * driftEase;
    group.position.x = drift.x + Math.sin(time * 0.15) * 0.3;
    group.position.y = drift.y + Math.sin(time * 0.22) * 0.15;
    group.position.z = drift.z + Math.sin(time * 0.18) * 0.2;

    // Breathing
    const breathe = 1 + Math.sin(time * 1.0) * 0.006 + amp * 0.015;
    body.scale.set(breathe, breathe, breathe);
    goldParticles.scale.set(breathe, breathe, breathe);
    skeleton.scale.set(breathe, breathe, breathe);

    // Heart pulse
    const hp = 1 + Math.sin(time * 2.5) * 0.12 + amp * 0.35;
    heart.scale.setScalar(hp);
    heartWire.scale.setScalar(hp * 1.15);
    heartMat.opacity = 0.3 + amp * 0.5 + Math.sin(time * 3) * 0.08;
    heartWireMat.opacity = 0.15 + amp * 0.3;
    heart.rotation.y = time * 0.7;
    heartWire.rotation.y = -time * 0.4;

    // Eyes
    const eyeGlow = 0.5 + amp * 0.4 + Math.sin(time * 2) * 0.1;
    eyeL.opacity = eyeGlow;
    eyeR.opacity = eyeGlow;

    // Scan lines animate upward
    for (const sc of scans) {
      const pos = sc.geo.attributes.position as THREE.BufferAttribute;
      const newY = BY + ((sc.y - BY + time * 0.3 * S) % (2.0 * S));
      for (let j = 0; j <= 40; j++) pos.setY(j, newY);
      pos.needsUpdate = true;
    }

    // Ribbons
    for (const rb of ribbons) {
      const pos = rb.geo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i <= ribbonSegs; i++) {
        const t = i / ribbonSegs;
        pos.setX(i, rb.baseX[i] + Math.sin(time * 1.8 + t * 5) * 0.08 * S * (1 + amp * 2));
        pos.setY(i, rb.baseY[i] + Math.sin(time * 1.3 + t * 4) * 0.05 * S * (1 + amp));
        pos.setZ(i, rb.baseZ[i] + Math.cos(time * 1.5 + t * 5) * 0.06 * S * (1 + amp));
      }
      pos.needsUpdate = true;
      rb.mat.opacity = 0.25 + amp * 0.4;
    }

    // Base rings
    for (let i = 0; i < baseRings.length; i++) {
      baseRings[i].rotation.z = time * (0.06 + i * 0.03) * (i % 2 === 0 ? 1 : -1);
      (baseRings[i].material as THREE.MeshBasicMaterial).opacity = (0.35 - i * 0.05) + amp * 0.2;
    }

    // Halo
    haloMat.opacity = 0.12 + amp * 0.2 + Math.sin(time * 1.2) * 0.02;
    halo.scale.setScalar((2.5 + amp * 0.6) * S);

    // Shimmer
    bodyMat.opacity = 0.75 + amp * 0.2 + Math.sin(time * 1.8) * 0.03;
    goldMat.opacity = 0.45 + amp * 0.3 + Math.sin(time * 1.5) * 0.05;
    skelMat.opacity = 0.35 + amp * 0.25;

    // Orbiting dots
    const speedMult = 1 + amp * 4;
    for (let i = 0; i < ORBIT_DOTS; i++) {
      const d = dotOrbits[i];
      d.angle += d.speed * 0.016 * speedMult;
      const r = d.radius + Math.sin(time * 0.4 + d.phase) * 0.1 + amp * 0.35 * Math.sin(time * 2 + d.phase);
      const x = Math.cos(d.angle) * r;
      const z = Math.sin(d.angle) * r;
      const y = BY + 1.5 * S + Math.sin(d.angle + d.tilt) * 0.6 * S + Math.sin(time * 0.3 + d.phase) * 0.1;
      dotMeshes[i].position.set(x, y, z);
      dotGlows[i].position.set(x, y, z);
      dotGlows[i].scale.setScalar(0.35 + amp * 0.15 + Math.sin(time * 1.2 + d.phase) * 0.05);
    }

    // Floating data particles rise
    for (let i = 0; i < dataN; i++) {
      dataArr[i * 3 + 1] += dataVel[i] * S;
      if (dataArr[i * 3 + 1] > BY + 2.8 * S) {
        dataArr[i * 3 + 1] = BY + 0.5 * S;
        dataArr[i * 3] = (Math.random() - 0.5) * 3 * S;
        dataArr[i * 3 + 2] = (Math.random() - 0.5) * 2 * S;
      }
    }
    dataGeo.attributes.position.needsUpdate = true;
    dataMat.opacity = 0.3 + amp * 0.3;

    // Slow sway + gentle rotation
    group.rotation.y = Math.sin(time * 0.12) * 0.12 + time * 0.02;

    renderer.render(scene, camera);
  }
  frame();

  return {
    setEnergy(v: number) { ampTarget = Math.max(0, Math.min(1, v)); },
    dispose() {
      cancelAnimationFrame(raf);
      stopBodyDetection();
      window.removeEventListener('resize', resize);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    },
    startBodyDetection,
    stopBodyDetection,
  };
}
