// ── Module 49 · Live Microphone Laser Cannon ───────────────────────────────
//
// A colossal cannon mounted on the ship's bow. It reacts to vocal amplitude:
// speaking/rapping charges the barrel and fires a massive laser out the front
// of the ship, its thickness + reach scaling with loudness. Amplitude is read
// from the deck's existing mic pipeline (liveRef.micLevel / voiceLevel /
// audioAnalyser) rather than opening a second getUserMedia stream — that would
// prompt again and fight the always-listening speech recognition for the mic.
export function createMicLaserCannon(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef } = ctx;
  const group = new THREE.Group();
  group.position.set(0, 2.4, 40); // bow of the ship, firing outward (+z)
  scene.add(group); markDynamic(group);

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.9, 0.8, 12), new THREE.MeshStandardMaterial({ color: 0x1a1f28, metalness: 0.8, roughness: 0.3 }));
  group.add(base);
  const yoke = new THREE.Group(); yoke.position.y = 0.5; group.add(yoke);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.42, 3.4, 16), new THREE.MeshStandardMaterial({ color: 0x2a3240, metalness: 0.85, roughness: 0.25, emissive: 0x102030, emissiveIntensity: 0.3 }));
  barrel.rotation.x = Math.PI / 2; barrel.position.z = 1.4; yoke.add(barrel);
  const emitter = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.07, 8, 24), new THREE.MeshBasicMaterial({ color: 0xff3355, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, toneMapped: false }));
  emitter.position.z = 3.1; yoke.add(emitter);
  const sign = helpers.buildNeonSign("VOICE CANNON", 0xff3355, 2.2, 0.42); sign.position.set(0, 2.0, 0); group.add(sign);

  // The beam — a long cylinder that grows from the emitter.
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.5, 1, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xff3355, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  beam.rotation.x = Math.PI / 2; yoke.add(beam);
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.14, 1, 8, 1, true), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  core.rotation.x = Math.PI / 2; yoke.add(core);
  const muzzle = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xffd0d8, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); muzzle.position.z = 3.1; yoke.add(muzzle);

  const freq = { arr: null };
  const getAmp = () => {
    const lr = liveRef.current;
    if (typeof lr.micLevel === "number") return Math.max(0, Math.min(1, lr.micLevel));
    if (typeof lr.voiceLevel === "number") return Math.max(0, Math.min(1, lr.voiceLevel));
    const an = lr.audioAnalyser;
    if (an && an.frequencyBinCount) {
      try { if (!freq.arr || freq.arr.length !== an.frequencyBinCount) freq.arr = new Uint8Array(an.frequencyBinCount); an.getByteFrequencyData(freq.arr); let s = 0; for (let i = 0; i < freq.arr.length; i++) s += freq.arr[i]; return (s / freq.arr.length) / 255; } catch { /* ignore */ }
    }
    return -1;
  };

  let t = 0, amp = 0;
  return {
    update(dt) {
      t += dt;
      let a = getAmp();
      if (a < 0) a = liveRef.current.radioPlaying ? (0.2 + 0.35 * Math.abs(Math.sin(t * 5) * Math.sin(t * 1.3))) : 0.04 + 0.03 * Math.sin(t * 2);
      amp += (a - amp) * Math.min(1, dt * 10);
      // aim: gently track toward the camera's horizontal bearing so it "fires where you look"
      yoke.rotation.y = Math.sin(t * 0.3) * 0.25;
      const len = 6 + amp * 40;
      beam.scale.set(0.4 + amp * 1.6, len, 0.4 + amp * 1.6); beam.position.z = 3.1 + len / 2;
      core.scale.set(0.5 + amp, len, 0.5 + amp); core.position.z = 3.1 + len / 2;
      beam.material.opacity = Math.min(0.85, amp * 1.4);
      core.material.opacity = Math.min(1, amp * 1.8);
      emitter.scale.setScalar(1 + amp * 0.8); emitter.material.opacity = 0.6 + amp * 0.4;
      barrel.material.emissiveIntensity = 0.3 + amp * 1.2;
      muzzle.material.opacity = Math.min(1, amp * 2); muzzle.scale.setScalar(0.6 + amp * 2.4);
    },
    dispose() {
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    },
  };
}
