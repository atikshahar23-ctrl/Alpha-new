import React, { useEffect, useRef, useState } from "react";
import { Radio, Play, Pause, Volume2, VolumeX } from "lucide-react";

/* ── Ambient office audio (Web Audio, no external assets) ─────────────────
   A quiet, looping "server room" bed: filtered pink noise for the AC hum,
   plus a soft randomized click pattern standing in for distant keyboard
   typing. Runs at a low, subtle level under whatever the user picks on the
   radio — this is atmosphere, not foreground sound. */
function useAmbientOffice(enabled, volume) {
  const ctxRef = useRef(null);
  const nodesRef = useRef(null);
  const typingTimerRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    // Ease in rather than snapping to volume — avoids a click on start.
    master.gain.linearRampToValueAtTime(Math.max(0.001, volume), ctx.currentTime + 1.2);

    // AC hum: 4s of pink-ish noise (averaged white noise), looped, run
    // through a low-pass so it reads as a low mechanical hum, not hiss.
    const humLen = ctx.sampleRate * 4;
    const humBuf = ctx.createBuffer(1, humLen, ctx.sampleRate);
    const humData = humBuf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < humLen; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + white * 0.0990460;
      b1 = 0.96300 * b1 + white * 0.2965164;
      b2 = 0.57000 * b2 + white * 1.0526913;
      humData[i] = (b0 + b1 + b2 + white * 0.1848) * 0.06;
    }
    const humSrc = ctx.createBufferSource();
    humSrc.buffer = humBuf; humSrc.loop = true;
    const humFilter = ctx.createBiquadFilter();
    humFilter.type = "lowpass"; humFilter.frequency.value = 220;
    const humGain = ctx.createGain(); humGain.gain.value = 0.7;
    humSrc.connect(humFilter); humFilter.connect(humGain); humGain.connect(master);
    humSrc.start();

    // Distant keyboard typing: short filtered clicks at randomized, bursty
    // intervals (a little run of keystrokes, then a pause — like a person
    // actually typing rather than a metronome).
    const playClick = () => {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = "square"; osc.frequency.value = 1400 + Math.random() * 800;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.035 + Math.random() * 0.02, t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
      const filt = ctx.createBiquadFilter();
      filt.type = "highpass"; filt.frequency.value = 800;
      osc.connect(filt); filt.connect(g); g.connect(master);
      osc.start(t); osc.stop(t + 0.04);
    };
    const scheduleTyping = () => {
      const burst = 2 + Math.floor(Math.random() * 5);
      let delay = 0;
      for (let i = 0; i < burst; i++) {
        delay += 60 + Math.random() * 140;
        setTimeout(playClick, delay);
      }
      typingTimerRef.current = setTimeout(scheduleTyping, delay + 1500 + Math.random() * 4000);
    };
    typingTimerRef.current = setTimeout(scheduleTyping, 1000);

    nodesRef.current = { master, humSrc };
    return () => {
      clearTimeout(typingTimerRef.current);
      try { humSrc.stop(); } catch {}
      ctx.close();
      ctxRef.current = null;
      nodesRef.current = null;
    };
  }, [enabled]);

  useEffect(() => {
    const master = nodesRef.current?.master;
    const ctx = ctxRef.current;
    if (master && ctx) master.gain.linearRampToValueAtTime(Math.max(0.0001, volume), ctx.currentTime + 0.3);
  }, [volume]);
}

// Public live streams — Israeli terrestrial stations occasionally rotate
// CDN endpoints; if a station won't play, its URL likely needs updating.
const STATIONS = [
  { id: "glz", name: "גלגלצ", url: "https://glzwizzlv.bynetcdn.com/glglz_mp3", color: "#2ee6ff" },
  { id: "eco99", name: "אקו 99", url: "https://stream.eco99fm.co.il/eco99fm", color: "#3FD79A" },
  { id: "kan88", name: "כאן 88", url: "https://kanmusic-live.kan.org.il/Kan88", color: "#E4BC63" },
];

export default function RadioController({ compact = false }) {
  const [ambientOn, setAmbientOn] = useState(true);
  const [ambientVol, setAmbientVol] = useState(0.12);
  useAmbientOffice(ambientOn, ambientVol);

  const [stationIdx, setStationIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [radioVol, setRadioVol] = useState(0.5);
  const [status, setStatus] = useState("idle"); // idle | loading | playing | error
  const audioRef = useRef(null);

  useEffect(() => {
    const a = audioRef.current;
    if (a) a.volume = radioVol;
  }, [radioVol]);

  const station = STATIONS[stationIdx];

  const play = () => {
    const a = audioRef.current;
    if (!a) return;
    setStatus("loading");
    a.src = station.url;
    a.volume = radioVol;
    a.play().then(() => { setPlaying(true); setStatus("playing"); }).catch(() => setStatus("error"));
  };
  const stop = () => {
    const a = audioRef.current;
    if (a) { a.pause(); a.removeAttribute("src"); a.load(); }
    setPlaying(false); setStatus("idle");
  };
  const toggle = () => (playing ? stop() : play());
  const switchStation = (idx) => {
    setStationIdx(idx);
    if (playing) {
      setStatus("loading");
      const a = audioRef.current;
      a.src = STATIONS[idx].url;
      a.play().then(() => setStatus("playing")).catch(() => setStatus("error"));
    }
  };

  return (
    <div className={"radio-ctl" + (compact ? " compact" : "")}>
      <audio
        ref={audioRef}
        onError={() => setStatus("error")}
        onWaiting={() => setStatus("loading")}
        onPlaying={() => setStatus("playing")}
      />
      <div className="radio-ctl-head">
        <Radio size={15} />
        <span>רדיו ישראלי</span>
        <b className={"radio-ctl-dot " + status}>{status === "playing" ? "משדר" : status === "loading" ? "מתחבר…" : status === "error" ? "שגיאת חיבור" : "כבוי"}</b>
      </div>
      <div className="radio-ctl-stations">
        {STATIONS.map((s, i) => (
          <button
            key={s.id}
            className={"radio-ctl-station" + (i === stationIdx ? " on" : "")}
            style={{ "--c": s.color }}
            onClick={() => switchStation(i)}
          >
            {s.name}
          </button>
        ))}
      </div>
      <div className="radio-ctl-row">
        <button className="radio-ctl-play" onClick={toggle} title={playing ? "עצור" : "נגן"}>
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <Volume2 size={13} />
        <input type="range" min="0" max="1" step="0.05" value={radioVol} onChange={(e) => setRadioVol(parseFloat(e.target.value))} />
      </div>
      <div className="radio-ctl-row ambient">
        <button className={"radio-ctl-amb" + (ambientOn ? " on" : "")} onClick={() => setAmbientOn((v) => !v)} title="רחשי משרד (מיזוג + הקלדה)">
          {ambientOn ? <Volume2 size={13} /> : <VolumeX size={13} />} רחשי משרד
        </button>
        <input type="range" min="0" max="0.4" step="0.02" value={ambientVol} onChange={(e) => setAmbientVol(parseFloat(e.target.value))} disabled={!ambientOn} />
      </div>
    </div>
  );
}
