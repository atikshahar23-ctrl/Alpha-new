// ── Module 52 · Time-Dilation Cryo-Pod ─────────────────────────────────────
//
// After a long idle (default 5 min; liveRef.afkSeconds to tune) the deck slips
// into cryo: a frost/ice shader creeps in over the screen from the edges, the
// world blue-shifts and slows, until ANY input — key, pointer, joystick, or a
// gamepad axis/button — thaws it instantly. Implemented as a camera-child
// full-frame quad so it always covers the view without touching post-processing.
export function createCryoPod(ctx) {
  const { THREE, camera, liveRef } = ctx;

  const uniforms = { uAmt: { value: 0 }, uTime: { value: 0 } };
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthTest: false, depthWrite: false,
    vertexShader: "varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }",
    fragmentShader: `
      varying vec2 vUv; uniform float uAmt; uniform float uTime;
      // cheap value-noise
      float h(vec2 p){ return fract(sin(dot(p,vec2(41.3,289.1)))*43758.5); }
      float n(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f);
        return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y); }
      void main(){
        vec2 c = vUv-0.5;
        float edge = smoothstep(0.15, 0.7, length(c)*1.3);      // frost from the rim inward
        float frost = n(vUv*9.0+uTime*0.05)*0.5 + n(vUv*22.0)*0.5;
        float ice = clamp(edge*uAmt*1.4 + frost*uAmt*0.5, 0.0, 1.0);
        vec3 col = mix(vec3(0.55,0.8,1.0), vec3(0.85,0.95,1.0), frost);
        float a = ice*0.82*uAmt;
        // crystalline sparkle
        a += step(0.985, n(vUv*60.0+uTime*0.2))*uAmt*0.5;
        gl_FragColor = vec4(col, a);
      }`,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  quad.frustumCulled = false; quad.renderOrder = 998; quad.position.z = -0.5;
  camera.add(quad);
  // ensure the camera itself is in the graph (it is, as the deck's render camera)

  let idle = 0, amt = 0;
  const wake = () => { idle = 0; };
  const onKey = wake, onMove = wake, onDown = wake, onWheel = wake;
  window.addEventListener("keydown", onKey);
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerdown", onDown);
  window.addEventListener("wheel", onWheel, { passive: true });

  let lastJoy = 0;
  return {
    update(dt) {
      uniforms.uTime.value += dt;
      // joystick / gamepad activity also counts as input
      const lr = liveRef.current;
      const jv = lr.joyVec, tv = lr.turnVec;
      const mag = (jv ? Math.abs(jv.x || 0) + Math.abs(jv.y || 0) : 0) + (tv ? Math.abs(tv.x || 0) + Math.abs(tv.y || 0) : 0);
      if (mag > 0.05) idle = 0;
      try { const pads = navigator.getGamepads ? navigator.getGamepads() : []; for (const g of pads) { if (!g) continue; let s = 0; for (const a of g.axes) s += Math.abs(a); for (const b of g.buttons) s += b.value; if (Math.abs(s - lastJoy) > 0.08) { idle = 0; } lastJoy = s; } } catch { /* ignore */ }

      idle += dt;
      const threshold = typeof lr.afkSeconds === "number" ? lr.afkSeconds : 300;
      const target = idle > threshold ? 1 : 0;
      amt += (target - amt) * Math.min(1, dt * (target ? 0.5 : 4)); // slow freeze, fast thaw
      uniforms.uAmt.value = amt;
      lr.cryoActive = amt > 0.5;
    },
    dispose() {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("wheel", onWheel);
      if (quad.parent) quad.parent.remove(quad);
      quad.geometry.dispose(); mat.dispose();
      liveRef.current.cryoActive = false;
    },
  };
}
