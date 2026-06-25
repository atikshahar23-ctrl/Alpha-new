// ──────────────────────────────────────────────────────────────────────────
//  Pokeball FX — renders the user's real 3D Pokéball model over the orb during
//  a character swap. Transparent WebGL overlay so the scene behind shows
//  through. Animation: fly in from below → spin + wobble → red-laser burst as
//  it "opens" (onOpen fires here to load the new character) → fade out.
// ──────────────────────────────────────────────────────────────────────────
import * as THREE from 'three';

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let ball: THREE.Object3D | null = null;
let ballLoading: Promise<THREE.Object3D | null> | null = null;
let raf = 0;
let container: HTMLElement | null = null;

function ensureRenderer(host: HTMLElement) {
  if (renderer) return;
  container = host;
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setClearColor(0x000000, 0);
  const cvs = renderer.domElement;
  cvs.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:6;';
  host.appendChild(cvs);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, 6);

  scene.add(new THREE.AmbientLight(0xffffff, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(2, 3, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(0xff5533, 0.8); rim.position.set(-3, -1, 2); scene.add(rim);
  resize();
}

function resize() {
  if (!renderer || !camera || !container) return;
  const r = container.getBoundingClientRect();
  const w = Math.max(1, r.width), h = Math.max(1, r.height);
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

async function loadBall(): Promise<THREE.Object3D | null> {
  if (ball) return ball;
  if (ballLoading) return ballLoading;
  ballLoading = (async () => {
    const base = (import.meta as any).env.BASE_URL || '/';
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
    const tex = await new Promise<THREE.Texture>((res) => {
      new THREE.TextureLoader().load(base + 'ar-models/pokeball-tex.jpg', (t) => {
        t.colorSpace = THREE.SRGBColorSpace; t.flipY = false; res(t);
      }, undefined, () => res(null as any));
    });
    const gltf: any = await new Promise((res, rej) =>
      new GLTFLoader().load(base + 'ar-models/pokeball.glb', res, undefined, rej)).catch(() => null);
    if (!gltf) return null;
    const model: THREE.Object3D = gltf.scene;
    const mat = new THREE.MeshStandardMaterial({ map: tex || null, color: tex ? 0xffffff : 0xdddddd, roughness: 0.35, metalness: 0.1 });
    model.traverse((o: any) => { if (o.isMesh) { o.material = mat; o.geometry.computeVertexNormals(); } });
    // Normalise to ~2 units.
    const bb = new THREE.Box3().setFromObject(model);
    const size = bb.getSize(new THREE.Vector3());
    const center = bb.getCenter(new THREE.Vector3());
    const s = 2.0 / Math.max(size.x, size.y, size.z);
    const wrap = new THREE.Group();
    model.scale.setScalar(s);
    model.position.set(-center.x * s, -center.y * s, -center.z * s);
    wrap.add(model);
    ball = wrap;
    return ball;
  })();
  return ballLoading;
}

// Pre-warm renderer + model so the first throw is instant.
export function initPokeballFx(host: HTMLElement) {
  ensureRenderer(host);
  loadBall();
}

export interface ThrowOpts { onOpen?: () => void; onDone?: () => void; }

export function throwPokeball(host: HTMLElement, opts: ThrowOpts = {}) {
  ensureRenderer(host);
  resize();
  loadBall().then((b) => {
    if (!b || !scene || !renderer || !camera) { opts.onOpen?.(); opts.onDone?.(); return; }
    if (!b.parent) scene.add(b);
    b.visible = true;
    cancelAnimationFrame(raf);
    const start = performance.now();
    let opened = false;
    // flash sprite
    const flashMat = new THREE.SpriteMaterial({ color: 0xff5522, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const flash = new THREE.Sprite(flashMat); flash.scale.setScalar(0.1); scene.add(flash);

    function frame(now: number) {
      const t = (now - start) / 1000;
      // Fly in (0–0.45): from below, scaling up, spinning fast
      if (t < 0.45) {
        const p = t / 0.45, e = 1 - Math.pow(1 - p, 3);
        b!.position.y = -3 + 3 * e;
        b!.scale.setScalar(0.4 + 0.6 * e);
        b!.rotation.y = t * 14;
        b!.rotation.x = 0.3;
      }
      // Wobble (0.45–0.95)
      else if (t < 0.95) {
        b!.position.y = 0;
        b!.scale.setScalar(1);
        const w = Math.sin((t - 0.45) * 22) * 0.35 * Math.max(0, 1 - (t - 0.45) / 0.5);
        b!.rotation.z = w; b!.rotation.y += 0.02;
      }
      // Open burst (0.95–1.5): flash + ball spins away/shrinks
      else if (t < 1.5) {
        if (!opened) { opened = true; opts.onOpen?.(); }
        const p = (t - 0.95) / 0.55;
        flashMat.opacity = Math.max(0, 0.9 - p);
        flash.scale.setScalar(0.5 + p * 6);
        b!.scale.setScalar(Math.max(0, 1 - p));
        b!.rotation.y += 0.25;
      }
      else {
        flashMat.opacity = 0;
        b!.visible = false;
        renderer!.render(scene!, camera!);
        scene!.remove(flash); flashMat.dispose();
        opts.onDone?.();
        return; // stop loop
      }
      renderer!.render(scene!, camera!);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
  });
}

export function disposePokeballFx() {
  cancelAnimationFrame(raf);
  if (renderer) { renderer.domElement.remove(); renderer.dispose(); renderer = null; }
  scene = null; camera = null; ball = null; ballLoading = null;
}
