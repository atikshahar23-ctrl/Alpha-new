// ── Module 22 · Live CCTV Uplink (The Heavy Guard Eye) ──────────────────────
//
// A "Surveillance Matrix" terminal: a 2×2 bank of screens fed by dynamic
// per-frame canvas textures standing in for live RTSP DVR feeds (real RTSP
// can't decode in a browser, so each screen simulates one — patrol dot,
// timestamp, LIVE/REC tag). A glitch ShaderMaterial adds scanlines, rolling
// noise and RGB tear so they read as encrypted interstellar transmissions.
export function createCctvMatrix(ctx) {
  const { THREE, scene, markDynamic, helpers, obstacles } = ctx;
  const SPOT = { x: -33, z: -18 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  group.rotation.y = Math.PI / 2; // face into the deck (east)
  scene.add(group); markDynamic(group);
  obstacles.push({ x: SPOT.x, z: SPOT.z, r: 1.2 });

  const frame = new THREE.Mesh(new THREE.BoxGeometry(4.7, 3.4, 0.2), new THREE.MeshStandardMaterial({ color: 0x0c1018, metalness: 0.6, roughness: 0.4, emissive: 0x0a1f14, emissiveIntensity: 0.4 }));
  frame.position.set(0, 2.4, 0); group.add(frame);

  const glitchVert = "varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }";
  const glitchFrag = `
    uniform sampler2D tFeed; uniform float uTime; varying vec2 vUv;
    float rand(vec2 c){ return fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453); }
    void main(){
      vec2 uv = vUv;
      float glitch = step(0.985, rand(vec2(floor(uTime*12.0), floor(uv.y*18.0))));
      uv.x += glitch * (rand(vec2(uTime, uv.y))-0.5) * 0.15;
      float r = texture2D(tFeed, uv + vec2(0.004,0.0)).r;
      float g = texture2D(tFeed, uv).g;
      float b = texture2D(tFeed, uv - vec2(0.004,0.0)).b;
      vec3 col = vec3(r,g,b);
      col *= 0.82 + 0.18*sin(uv.y*260.0);                 // scanlines
      col += (rand(uv*uTime)-0.5)*0.10;                    // noise
      col *= vec3(0.75,1.05,0.9) * 1.5;                    // interstellar green cast + gain
      gl_FragColor = vec4(col, 1.0);
    }`;

  const feeds = [];
  const LABELS = ["CAM 01 · חזית", "CAM 02 · חצר", "CAM 03 · מחסן", "CAM 04 · כניסה"];
  for (let i = 0; i < 4; i++) {
    const cvs = document.createElement("canvas"); cvs.width = 256; cvs.height = 192;
    const tex = new THREE.CanvasTexture(cvs);
    const mat = new THREE.ShaderMaterial({ uniforms: { tFeed: { value: tex }, uTime: { value: 0 } }, vertexShader: glitchVert, fragmentShader: glitchFrag });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.15, 1.55), mat);
    screen.position.set((i % 2 ? 1.14 : -1.14), 2.4 + (i < 2 ? 0.82 : -0.82), 0.12);
    group.add(screen);
    feeds.push({ cvs, tex, mat, label: LABELS[i], seed: Math.random() * 100, patrol: Math.random() });
  }
  const light = new THREE.PointLight(0x6fe6b0, 0.4, 8); light.position.set(0, 2.4, 1.0); group.add(light);
  const sign = helpers.buildNeonSign("SURVEILLANCE MATRIX", 0x6fe6b0, 2.6, 0.42);
  sign.position.set(0, 4.2, 0); group.add(sign);

  const drawFeed = (f, t) => {
    const g = f.cvs.getContext("2d");
    g.fillStyle = "#0a140e"; g.fillRect(0, 0, 256, 192);
    // faux room + a patrolling figure
    g.strokeStyle = "rgba(90,200,140,0.35)"; g.lineWidth = 1;
    for (let y = 20; y < 192; y += 24) { g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke(); }
    f.patrol = (f.patrol + 0.0008 * (1 + (f.seed % 3))) % 1;
    const px = 20 + f.patrol * 216, py = 120 + Math.sin(t * 1.3 + f.seed) * 20;
    g.fillStyle = "rgba(140,255,180,0.9)"; g.beginPath(); g.ellipse(px, py, 6, 14, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(140,255,180,0.6)"; g.beginPath(); g.arc(px, py - 18, 5, 0, Math.PI * 2); g.fill();
    // HUD
    g.fillStyle = "#8fffcf"; g.font = "700 15px monospace"; g.textAlign = "left"; g.fillText(f.label, 8, 20);
    g.textAlign = "right"; g.fillStyle = (Math.floor(t * 2) % 2 ? "#ff5c50" : "#661") ; g.fillText("● REC", 248, 20);
    const d = new Date();
    g.fillStyle = "#8fffcf"; g.font = "13px monospace"; g.textAlign = "right";
    g.fillText(d.toLocaleTimeString(), 248, 184);
    f.tex.needsUpdate = true;
  };

  let t = 0, redrawT = 0;
  return {
    update(dt) {
      t += dt; redrawT += dt;
      const redraw = redrawT > 0.12; if (redraw) redrawT = 0;
      for (const f of feeds) { f.mat.uniforms.uTime.value = t; if (redraw) drawFeed(f, t); }
      light.intensity = 0.35 + 0.1 * Math.sin(t * 3);
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { if (m.uniforms && m.uniforms.tFeed) m.uniforms.tFeed.value.dispose(); m.dispose(); }); });
    },
  };
}
