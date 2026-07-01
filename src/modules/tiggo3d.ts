// ── The owner's actual car: Chery Tiggo 7 Plug-in 2025 "Noble" ──────────
// A small procedural three.js turntable model for the main screen's fleet
// card, built from the owner's own photos (in white, per his request, as
// the HeavyGuard work vehicle): pearl-white body, black roof + glass,
// silver window/sill trim and roof rails, the diamond-studded grille,
// C-shaped LED headlights, the full-width red rear light bar, the two-tone
// 5-double-spoke wheels, his real ANH-7852 plate — and the Heavy Guard
// logo on the fuel-door.
// Loaded lazily (dynamic import) so three.js stays out of the main bundle,
// and rendered into a small transparent canvas (DPR-capped) so it costs
// almost nothing next to everything else on the HUD.
import * as THREE from 'three';

const BODY = 0xe9ebed;        // pearl white body
const BODY_DARK = 0xd6d9dd;   // mirrors / darker body accents
const BLACK_TRIM = 0x0c0d11;  // roof / glass / cladding
const SILVER = 0xc9ced6;      // trim, rails, sills
const TIRE = 0x141519;
const RIM_SILVER = 0xd4d8de;

function plateTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 32;
  const x = c.getContext('2d')!;
  x.fillStyle = '#f4f6f2'; x.fillRect(0, 0, 128, 32);
  x.fillStyle = '#1a3fae'; x.fillRect(0, 0, 14, 32);
  x.fillStyle = '#111'; x.font = '700 20px system-ui, sans-serif';
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText('ANH·7852', 71, 17);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// The Noble trim's signature: a dark mesh studded with bright diamond dots.
function grilleTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 160; c.height = 72;
  const x = c.getContext('2d')!;
  x.fillStyle = '#0a0b0e'; x.fillRect(0, 0, 160, 72);
  x.fillStyle = '#e8ecf2';
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 13; col++) {
      const px = 10 + col * 11 + (row % 2 ? 5.5 : 0);
      const py = 8 + row * 11;
      const s = 1.6 + ((row * 13 + col) % 3) * 0.7; // varied stud sizes like the real mesh
      x.save(); x.translate(px, py); x.rotate(Math.PI / 4);
      x.fillRect(-s / 2, -s / 2, s, s);
      x.restore();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Heavy Guard decal for the fuel-door — the shield + wordmark, small and
// round like a real fleet sticker.
function hgLogoTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 96;
  const x = c.getContext('2d')!;
  x.fillStyle = '#111318';
  x.beginPath(); x.arc(48, 48, 46, 0, Math.PI * 2); x.fill();
  x.strokeStyle = '#E4BC63'; x.lineWidth = 3;
  x.beginPath(); x.arc(48, 48, 43, 0, Math.PI * 2); x.stroke();
  // shield
  x.fillStyle = '#E4BC63';
  x.beginPath();
  x.moveTo(48, 18); x.lineTo(68, 27) ; x.lineTo(68, 48);
  x.quadraticCurveTo(68, 66, 48, 76);
  x.quadraticCurveTo(28, 66, 28, 48);
  x.lineTo(28, 27); x.closePath(); x.fill();
  x.fillStyle = '#111318';
  x.font = '900 26px system-ui, sans-serif';
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText('HG', 48, 46);
  x.fillStyle = '#E4BC63';
  x.font = '700 9px system-ui, sans-serif';
  x.fillText('HEAVY GUARD', 48, 88);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function shadowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const x = c.getContext('2d')!;
  const g = x.createRadialGradient(64, 64, 8, 64, 64, 62);
  g.addColorStop(0, 'rgba(0,0,0,.42)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

// Side-silhouette extrusions (profile in the y/z plane, extruded across x)
// give clean SUV lines with a fraction of the vertices of a real mesh.
function extrudeProfile(pts: [number, number][], width: number, mat: THREE.Material): THREE.Mesh {
  const shape = new THREE.Shape();
  shape.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) shape.lineTo(pts[i][0], pts[i][1]);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: width, bevelEnabled: true, bevelThickness: 0.045, bevelSize: 0.045, bevelSegments: 2 });
  // shape was drawn in (z, y); rotate so profile runs along the car's length.
  // Pre-translate the extrusion spans [-(width+bevel), +bevel] on x, so its
  // midpoint is at -width/2 — shifting by +width/2 centres it on the origin.
  geo.rotateY(-Math.PI / 2);
  geo.translate(width / 2, 0, 0);
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = false; m.receiveShadow = false;
  return m;
}

function buildWheel(): THREE.Group {
  const g = new THREE.Group();
  const tire = new THREE.Mesh(
    new THREE.CylinderGeometry(0.37, 0.37, 0.245, 28),
    new THREE.MeshStandardMaterial({ color: TIRE, roughness: 0.92 })
  );
  tire.rotation.z = Math.PI / 2;
  g.add(tire);
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.235, 0.235, 0.25, 24),
    new THREE.MeshStandardMaterial({ color: RIM_SILVER, metalness: 0.85, roughness: 0.28 })
  );
  disc.rotation.z = Math.PI / 2;
  g.add(disc);
  // the two-tone look: dark pockets between the silver double-spokes
  const pocketMat = new THREE.MeshStandardMaterial({ color: 0x191b20, roughness: 0.6 });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.1, 0.1), pocketMat);
    pocket.position.set(0.128, Math.sin(a) * 0.15, Math.cos(a) * 0.15);
    pocket.rotation.x = -a;
    g.add(pocket);
  }
  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, 0.26, 12),
    new THREE.MeshStandardMaterial({ color: 0x33363c, metalness: 0.9, roughness: 0.3 })
  );
  hub.rotation.z = Math.PI / 2;
  g.add(hub);
  return g;
}

export function buildTiggo7(): THREE.Group {
  const car = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ color: BODY, metalness: 0.55, roughness: 0.3 });
  const darkMat = new THREE.MeshStandardMaterial({ color: BLACK_TRIM, metalness: 0.4, roughness: 0.5 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x11141c, metalness: 0.9, roughness: 0.12 });
  const silverMat = new THREE.MeshStandardMaterial({ color: SILVER, metalness: 0.9, roughness: 0.25 });

  // Main body — bumper-to-bumper up to the beltline. +z is the nose.
  car.add(extrudeProfile([
    [2.28, 0.42], [2.36, 0.62], [2.34, 0.88], [2.18, 0.98],   // nose / hood lip
    [0.95, 1.1],                                              // hood → A-pillar base
    [-1.7, 1.12], [-2.2, 1.06],                               // belt line → tail
    [-2.32, 0.82], [-2.26, 0.44],                             // tailgate / rear bumper
  ].concat([[-2.26, 0.42], [2.28, 0.42]] as [number, number][]) as [number, number][], 1.62, bodyMat));

  // Cabin — windshield, black roof, rear glass (the car's two-tone top).
  car.add(extrudeProfile([
    [0.9, 1.08], [0.28, 1.62], [-1.28, 1.63], [-1.95, 1.1],
  ].concat([[0.9, 1.08]] as [number, number][]) as [number, number][], 1.44, glassMat));

  // Black lower cladding all around (the SUV skirt) + silver sill strips.
  const clad = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.2, 4.44), darkMat);
  clad.position.y = 0.36;
  car.add(clad);
  ([-1, 1] as const).forEach((s) => {
    const sill = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.045, 2.5), silverMat);
    sill.position.set(s * 0.855, 0.47, -0.1);
    car.add(sill);
  });

  // Silver roof rails.
  ([-1, 1] as const).forEach((s) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 1.9), silverMat);
    rail.position.set(s * 0.62, 1.68, -0.52);
    car.add(rail);
  });

  // Diamond-studded grille + silver frame.
  const grille = new THREE.Mesh(
    new THREE.PlaneGeometry(1.0, 0.44),
    new THREE.MeshBasicMaterial({ map: grilleTexture() })
  );
  grille.position.set(0, 0.72, 2.375);
  car.add(grille);
  const gFrame = new THREE.Mesh(new THREE.PlaneGeometry(1.08, 0.52), silverMat);
  gFrame.position.set(0, 0.72, 2.37);
  car.add(gFrame);

  // C-shaped LED headlights (emissive white strips at the hood line).
  const led = new THREE.MeshBasicMaterial({ color: 0xf2f6ff });
  ([-1, 1] as const).forEach((s) => {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.05, 0.03), led);
    strip.position.set(s * 0.62, 0.99, 2.32);
    strip.rotation.y = s * -0.28;
    car.add(strip);
    const tick = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, 0.03), led);
    tick.position.set(s * 0.44, 0.93, 2.33);
    car.add(tick);
  });

  // Full-width red rear light bar + the vertical red corner blades.
  const redBar = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.055, 0.03), new THREE.MeshBasicMaterial({ color: 0xff2418 }));
  redBar.position.set(0, 1.02, -2.345);
  car.add(redBar);
  ([-1, 1] as const).forEach((s) => {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.34, 0.03), new THREE.MeshBasicMaterial({ color: 0xd91d12 }));
    blade.position.set(s * 0.72, 0.7, -2.335);
    car.add(blade);
  });

  // The owner's actual plates, front and rear.
  const plateTex = plateTexture();
  const front = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.125), new THREE.MeshBasicMaterial({ map: plateTex }));
  front.position.set(0, 0.62, 2.385);
  car.add(front);
  const rear = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.125), new THREE.MeshBasicMaterial({ map: plateTex }));
  rear.position.set(0, 0.85, -2.35);
  rear.rotation.y = Math.PI;
  car.add(rear);

  // Mirrors.
  const mirrorMat = new THREE.MeshStandardMaterial({ color: BODY_DARK, metalness: 0.7, roughness: 0.35 });
  ([-1, 1] as const).forEach((s) => {
    const mir = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.09, 0.12), mirrorMat);
    mir.position.set(s * 0.92, 1.16, 0.78);
    car.add(mir);
  });

  // Heavy Guard decal on the fuel-door (rear-right fender, like the real
  // filler flap position on the Tiggo 7).
  const hgDecal = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, 0.3),
    new THREE.MeshBasicMaterial({ map: hgLogoTexture(), transparent: true })
  );
  hgDecal.position.set(0.86, 0.9, -1.55);
  hgDecal.rotation.y = Math.PI / 2;
  car.add(hgDecal);

  // Wheels.
  const wheelPos: [number, number][] = [[0.8, 1.42], [-0.8, 1.42], [0.8, -1.35], [-0.8, -1.35]];
  wheelPos.forEach(([x, z]) => {
    const w = buildWheel();
    w.position.set(x, 0.37, z);
    car.add(w);
  });

  // Soft ground shadow.
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(5.6, 2.6),
    new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.005;
  car.add(shadow);

  return car;
}

// The owner's real Israeli plate, front and rear: yellow EU-style plate,
// blue country band, 396-04-704.
function israeliPlateTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 64;
  const x = c.getContext('2d')!;
  x.fillStyle = '#111'; x.fillRect(0, 0, 256, 64);
  x.fillStyle = '#ffb700';
  x.beginPath(); (x as any).roundRect(2, 2, 252, 60, 7); x.fill();
  x.fillStyle = '#1a3fae';
  x.beginPath(); (x as any).roundRect(2, 2, 34, 60, 7); x.fill();
  x.fillRect(20, 2, 16, 60);
  x.fillStyle = '#fff'; x.font = '700 13px system-ui, sans-serif';
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText('IL', 19, 50);
  x.fillText('✡', 19, 22);
  x.fillStyle = '#111'; x.font = '900 36px system-ui, sans-serif';
  x.fillText('396-04-704', 146, 35);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function mountTiggo3D(container: HTMLElement): () => void {
  const W = container.clientWidth || 240;
  const H = container.clientHeight || 150;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(W, H);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, W / H, 0.1, 50);
  camera.position.set(4.4, 2.1, 5.6);
  camera.lookAt(0, 0.62, 0);

  scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x2a2216, 0.95));
  const key = new THREE.DirectionalLight(0xfff1dd, 1.5);
  key.position.set(4, 6, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fc0ff, 0.7);
  rim.position.set(-5, 3, -4);
  scene.add(rim);

  // The turntable group — the real GLB (the owner's uploaded Tiggo 7 model,
  // re-materialed white with all its trim) swaps in when it finishes
  // loading; the procedural stand-in shows instantly and is the permanent
  // fallback if the download fails.
  let car: THREE.Object3D = buildTiggo7();
  scene.add(car);
  (async () => {
    try {
      const [{ GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
        import('three/examples/jsm/loaders/GLTFLoader.js'),
        import('three/examples/jsm/libs/meshopt_decoder.module.js'),
      ]);
      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);
      const base = (import.meta as any).env?.BASE_URL || '/';
      loader.load(base + 'office-models/tiggo7.glb', (g) => {
        const real = g.scene;
        // Model is in mm with the front toward -x; normalise to the same
        // world the stand-in used: ~4.6 units long, grounded at y=0,
        // centred, nose toward +z.
        const box = new THREE.Box3().setFromObject(real);
        const size = box.getSize(new THREE.Vector3());
        const ctr = box.getCenter(new THREE.Vector3());
        const s = 4.6 / Math.max(size.x, size.z);
        const wrap = new THREE.Group();
        real.position.set(-ctr.x, -box.min.y, -ctr.z);
        wrap.add(real);
        wrap.scale.setScalar(s);
        wrap.rotation.y = -Math.PI / 2; // front (-x in model space) → +z

        // Children added to `real` live in raw model space (mm, z-centre at
        // ~1800) — the recentering shift on `real.position` moves them along
        // with the body, so positions here use the raw bbox coordinates.
        const plateTex = israeliPlateTexture();
        const plateMat = new THREE.MeshBasicMaterial({ map: plateTex });
        const front = new THREE.Mesh(new THREE.PlaneGeometry(520, 130), plateMat);
        front.position.set(box.min.x - 8, 620, ctr.z);
        front.rotation.y = -Math.PI / 2;
        real.add(front);
        const rear = new THREE.Mesh(new THREE.PlaneGeometry(520, 130), plateMat);
        rear.position.set(box.max.x + 8, 980, ctr.z);
        rear.rotation.y = Math.PI / 2;
        real.add(rear);

        // Heavy Guard decal on the fuel-door (rear-right fender).
        const decal = new THREE.Mesh(
          new THREE.PlaneGeometry(240, 240),
          new THREE.MeshBasicMaterial({ map: hgLogoTexture(), transparent: true })
        );
        decal.position.set(box.max.x - 1050, 1010, box.max.z + 6);
        real.add(decal);

        // Ground shadow under the real car too (length runs along model x).
        const shadow = new THREE.Mesh(
          new THREE.PlaneGeometry(5.6 / s, 2.6 / s),
          new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false })
        );
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.set(ctr.x, box.min.y + 2, ctr.z);
        real.add(shadow);

        const spin = car.rotation.y;
        scene.remove(car);
        car = wrap;
        car.rotation.y = spin;
        scene.add(car);
      }, undefined, () => { /* keep the procedural fallback */ });
    } catch { /* dynamic import failed — fallback stays */ }
  })();

  // Drag to spin the car yourself; the slow showroom turntable resumes a
  // couple of seconds after you let go.
  let dragging = false, lastX = 0, lastDragAt = 0;
  const el = renderer.domElement;
  el.style.touchAction = 'none';
  el.style.cursor = 'grab';
  const onDown = (e: PointerEvent) => { dragging = true; lastX = e.clientX; el.setPointerCapture(e.pointerId); el.style.cursor = 'grabbing'; };
  const onMove = (e: PointerEvent) => {
    if (!dragging) return;
    car.rotation.y += (e.clientX - lastX) * 0.012;
    lastX = e.clientX;
    lastDragAt = performance.now();
  };
  const onUp = (e: PointerEvent) => { dragging = false; lastDragAt = performance.now(); try { el.releasePointerCapture(e.pointerId); } catch {} el.style.cursor = 'grab'; };
  el.addEventListener('pointerdown', onDown);
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerup', onUp);
  el.addEventListener('pointercancel', onUp);

  let raf = 0;
  const clock = new THREE.Clock();
  const tick = () => {
    raf = requestAnimationFrame(tick);
    const dt = clock.getDelta();
    if (document.hidden) return;
    if (!dragging && performance.now() - lastDragAt > 2500) car.rotation.y += dt * 0.45;
    renderer.render(scene, camera);
  };
  tick();

  const onResize = () => {
    const w = container.clientWidth || W, h = container.clientHeight || H;
    camera.aspect = w / h; camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', onResize);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', onResize);
    el.removeEventListener('pointerdown', onDown);
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerup', onUp);
    el.removeEventListener('pointercancel', onUp);
    scene.traverse((o: any) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) { const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach((m: any) => { if (m.map) m.map.dispose(); m.dispose(); }); }
    });
    renderer.dispose();
    if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
  };
}
