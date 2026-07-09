// ── Command Video Wall — CCTV + live-data twin screens ─────────────────────
//
// A freestanding two-screen command monitor planted in the main walkway so the
// owner actually sees it (the existing side-wall security/data screens sit on a
// wall you rarely face). Left screen = a CCTV montage of "the place's cameras"
// (a 2×2 security grid that auto-upgrades tile 1 to your REAL device camera the
// moment the phone's camera tab hands us a stream via liveRef.cctvStream);
// right screen = live markets + Heavy-Guard business KPIs off liveRef. Both are
// plain canvas/video textures — cheap, mobile-safe, no per-frame render target.
export function createCommandVideoWall(ctx) {
  const { THREE, scene, markDynamic, helpers, liveRef, obstacles } = ctx;
  const SPOT = { x: -9, z: 7 };
  const group = new THREE.Group();
  group.position.set(SPOT.x, 0, SPOT.z);
  group.rotation.y = 0.62; // angle the twin screens toward the deck walkway
  scene.add(group); markDynamic(group);
  obstacles.push({ x: SPOT.x, z: SPOT.z, r: 1.6 });

  // Stand: a dark pedestal + twin bezel frame.
  const stand = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.0, 0.5), new THREE.MeshStandardMaterial({ color: 0x10141c, metalness: 0.6, roughness: 0.4 }));
  stand.position.y = 1.0; group.add(stand);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.18, 0.3), new THREE.MeshStandardMaterial({ color: 0x161b26, metalness: 0.6, roughness: 0.4 }));
  bar.position.y = 2.0; group.add(bar);

  const makeScreen = (w, h, x) => {
    const cvs = document.createElement("canvas"); cvs.width = 512; cvs.height = 320;
    const tex = new THREE.CanvasTexture(cvs); tex.colorSpace = THREE.SRGBColorSpace;
    const bezel = new THREE.Mesh(new THREE.PlaneGeometry(w + 0.14, h + 0.14), new THREE.MeshBasicMaterial({ color: 0x04060c }));
    bezel.position.set(x, 3.15, 0); group.add(bezel);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
    scr.position.set(x, 3.15, 0.02); group.add(scr);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(w + 0.3, h + 0.3), new THREE.MeshBasicMaterial({ color: 0x2ee6ff, transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.position.set(x, 3.15, -0.02); group.add(glow);
    return { cvs, g: cvs.getContext("2d"), tex, scr };
  };
  const cam = makeScreen(3.1, 1.95, -1.72);
  const data = makeScreen(3.1, 1.95, 1.72);
  const sign = helpers.buildNeonSign("COMMAND MONITORS · פיקוד", 0x2ee6ff, 3.4, 0.5); sign.position.set(0, 4.35, 0); group.add(sign);

  // Optional real device-camera feed for CCTV tile 1.
  const vid = document.createElement("video");
  vid.muted = true; vid.playsInline = true; vid.autoplay = true;
  let vidTex = null, boundStream = null;

  const CAMS = ["CAM 01 · כניסה", "CAM 02 · חניון", "CAM 03 · קומת מסחר", "CAM 04 · מחסן"];
  const drawCctv = (t) => {
    const g = cam.g; g.fillStyle = "#05070d"; g.fillRect(0, 0, 512, 320);
    const tw = 256, th = 160;
    for (let i = 0; i < 4; i++) {
      const cx = (i % 2) * tw, cy = ((i / 2) | 0) * th;
      // real device cam in tile 0 if a stream is live, else procedural view
      if (i === 0 && vidTex && vid.readyState >= 2) {
        try { cam.g.drawImage(vid, cx + 2, cy + 2, tw - 4, th - 22); } catch { /* not ready */ }
      } else {
        const grd = g.createLinearGradient(cx, cy, cx, cy + th);
        grd.addColorStop(0, "#0b1420"); grd.addColorStop(1, "#050a12"); g.fillStyle = grd; g.fillRect(cx + 2, cy + 2, tw - 4, th - 22);
        // sweeping scan + faux motion blobs
        g.strokeStyle = "rgba(63,215,154,0.14)"; g.lineWidth = 1;
        for (let y = 0; y < th; y += 8) { g.beginPath(); g.moveTo(cx + 2, cy + y); g.lineTo(cx + tw - 2, cy + y); g.stroke(); }
        const by = cy + 20 + ((t * 40 + i * 37) % (th - 60));
        g.fillStyle = "rgba(143,224,255,0.10)"; g.fillRect(cx + 2, by, tw - 4, 10);
        g.fillStyle = "rgba(120,160,120,0.5)"; const px = cx + 30 + (Math.sin(t * 0.7 + i) * 0.5 + 0.5) * (tw - 80);
        g.beginPath(); g.ellipse(px, cy + th * 0.6, 10, 20, 0, 0, 7); g.fill();
      }
      // frame + label + REC
      g.strokeStyle = "rgba(46,230,255,0.35)"; g.lineWidth = 2; g.strokeRect(cx + 2, cy + 2, tw - 4, th - 4);
      g.fillStyle = "rgba(3,6,12,0.8)"; g.fillRect(cx + 2, cy + th - 20, tw - 4, 18);
      g.fillStyle = "#8fe0c0"; g.font = "600 13px system-ui"; g.textAlign = "right"; g.fillText(CAMS[i], cx + tw - 8, cy + th - 6);
      if (((t * 2) | 0) % 2) { g.fillStyle = "#ff5f6d"; g.beginPath(); g.arc(cx + 14, cy + th - 11, 4, 0, 7); g.fill(); }
      g.fillStyle = "#cfe0f5"; g.font = "600 11px ui-monospace,monospace"; g.textAlign = "left";
      g.fillText(new Date().toLocaleTimeString("he-IL"), cx + 8, cy + 14);
    }
    cam.tex.needsUpdate = true;
  };

  const drawData = () => {
    const g = data.g; g.fillStyle = "#060a14"; g.fillRect(0, 0, 512, 320);
    g.strokeStyle = "rgba(46,230,255,0.4)"; g.lineWidth = 3; g.strokeRect(4, 4, 504, 312);
    g.textAlign = "right"; g.fillStyle = "#2ee6ff"; g.font = "800 22px system-ui"; g.fillText("📊 שווקים חיים", 496, 34);
    const rows = liveRef.current.marketRows || [];
    let y = 66;
    rows.slice(0, 7).forEach((r) => {
      const chg = r.chg || 0; const up = chg >= 0;
      g.textAlign = "right"; g.fillStyle = "#e6eefc"; g.font = "600 18px system-ui";
      g.fillText((r.sym || r.name || r.id || "—").toString().slice(0, 14), 250, y);
      g.textAlign = "left"; g.fillStyle = up ? "#3FD79A" : "#ff5f6d"; g.font = "700 18px ui-monospace,monospace";
      g.fillText((up ? "▲ +" : "▼ ") + chg.toFixed(2) + "%", 270, y);
      y += 27;
    });
    if (!rows.length) { g.textAlign = "center"; g.fillStyle = "#5f7a9a"; g.font = "600 16px system-ui"; g.fillText("טוען נתוני שוק…", 256, 150); }
    // Heavy-Guard business KPIs strip
    const biz = liveRef.current.bizData || {};
    g.fillStyle = "#0b1220"; g.fillRect(12, 250, 488, 58); g.strokeStyle = "rgba(228,188,99,0.4)"; g.lineWidth = 2; g.strokeRect(12, 250, 488, 58);
    g.textAlign = "right"; g.fillStyle = "#E4BC63"; g.font = "700 15px system-ui"; g.fillText("🛡 HEAVY GUARD", 492, 272);
    const kpi = (label, val, x) => { g.textAlign = "center"; g.fillStyle = "#8ea6c8"; g.font = "600 12px system-ui"; g.fillText(label, x, 288); g.fillStyle = "#fff"; g.font = "800 18px system-ui"; g.fillText(val, x, 304); };
    kpi("הכנסה", (biz.revenue ? "₪" + Math.round(biz.revenue / 1000) + "K" : "—"), 110);
    kpi("פרויקטים", (biz.projects != null ? String(biz.projects) : "—"), 250);
    kpi("צי", (biz.fleet != null ? String(biz.fleet) : (biz.trucks != null ? String(biz.trucks) : "—")), 390);
    data.tex.needsUpdate = true;
  };

  let t = 0, dataT = 99;
  return {
    update(dt) {
      t += dt;
      // hot-attach the device camera feed if the phone's camera tab exposes one
      const stream = liveRef.current.cctvStream;
      if (stream && stream !== boundStream) {
        boundStream = stream; try { vid.srcObject = stream; vid.play().catch(() => {}); vidTex = true; } catch { vidTex = null; }
      } else if (!stream && boundStream) { boundStream = null; vidTex = null; try { vid.srcObject = null; } catch {} }
      drawCctv(t);
      dataT += dt; if (dataT > 1.5) { dataT = 0; drawData(); }
    },
    dispose() {
      try { vid.srcObject = null; } catch {}
      scene.remove(group);
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); } });
    },
  };
}
