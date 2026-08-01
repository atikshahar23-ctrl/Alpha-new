import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Shield, Cpu, Activity, Zap, Compass, RefreshCw, Eye, Sliders,
  Play, Square, Volume2, VolumeX, Trash2, TrendingUp,
  History as HistoryIcon, Settings as SettingsIcon, Radio, Clock,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as Tone from 'tone';

const STATES = {
  gamma: { label: 'GAMMA', freq: '40Hz', desc: 'מיקוד-על קוגניטיבי', hue: 285, hex: '#e879f9', icon: Zap, amplitude: 12, frequency: 0.08, note: 329.63 },
  alpha: { label: 'ALPHA', freq: '12Hz', desc: 'רגיעה מודעת וזרימה', hue: 158, hex: '#34d399', icon: Compass, amplitude: 6, frequency: 0.03, note: 220 },
  theta: { label: 'THETA', freq: '6Hz', desc: 'מדיטציה עמוקה וחלום', hue: 199, hex: '#22d3ee', icon: Activity, amplitude: 4, frequency: 0.015, note: 174.61 },
  delta: { label: 'DELTA', freq: '1.5Hz', desc: 'ריפוי תאי ושינה עמוקה', hue: 43, hex: '#fbbf24', icon: Shield, amplitude: 2, frequency: 0.005, note: 130.81 },
};

const NAV = [
  { key: 'console', label: 'קונסולה', icon: Cpu },
  { key: 'history', label: 'מפגשים', icon: HistoryIcon },
  { key: 'settings', label: 'הגדרות', icon: SettingsIcon },
];

// session history is real user data — persist it like every other app here
const HISTORY_KEY = 'neuro:sessions:v1';
const loadHistory = () => {
  try { const v = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); if (Array.isArray(v)) return v; } catch {}
  return [];
};

function fmtTime(totalSeconds) {
  const total = Math.max(0, Math.floor(totalSeconds || 0));
  const m = Math.floor(total / 60).toString().padStart(2, '0');
  const s = Math.floor(total % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
function fmtDate(ts) {
  return new Date(ts).toLocaleString('he-IL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function Gauge({ value, max, label, unit, hex }) {
  const r = 38;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, value / max));
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" className="text-slate-800" strokeWidth="6" />
          <circle
            cx="50" cy="50" r={r} fill="none" stroke={hex} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={c - pct * c}
            style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 6px ${hex}80)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono-eng text-lg font-bold tabular-nums" style={{ color: hex }}>{Math.round(value)}</span>
          <span className="font-mono-eng text-[9px] text-slate-500">{unit}</span>
        </div>
      </div>
      <span className="text-[10px] font-bold tracking-widest text-slate-500">{label}</span>
    </div>
  );
}

function Corner({ className }) {
  return (
    <svg className={`absolute w-5 h-5 text-slate-700 ${className}`} viewBox="0 0 20 20" fill="none">
      <path d="M1 1H10M1 1V10" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function StatCard({ icon: Icon, label, value, hex }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 flex flex-col gap-1.5">
      <Icon className="w-3.5 h-3.5 text-slate-500" />
      <span className="font-mono-eng text-lg font-bold tabular-nums" style={{ color: hex || '#e2e8f0' }}>{value}</span>
      <span className="text-[10px] text-slate-500">{label}</span>
    </div>
  );
}

export default function NeuroSomaticInterface() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [view, setView] = useState('console');
  const [brainState, setBrainState] = useState('theta');
  const [particleCount, setParticleCount] = useState(1500);
  const [flowIntensity, setFlowIntensity] = useState(0.5);
  const [metrics, setMetrics] = useState({ coherence: 88, entropy: 12, neuroplasticity: 94 });

  const [sessionActive, setSessionActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [sessionHistory, setSessionHistory] = useState(loadHistory);
  const [confirmClear, setConfirmClear] = useState(false);
  useEffect(() => {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(sessionHistory.slice(0, 200))); } catch {}
  }, [sessionHistory]);

  const [audioEnabled, setAudioEnabled] = useState(false);
  const [volume, setVolume] = useState(40);
  const [audioError, setAudioError] = useState(null);
  const synthRef = useRef(null);

  const stateRef = useRef({ brainState, particleCount, flowIntensity });
  useEffect(() => {
    stateRef.current = { brainState, particleCount, flowIntensity };
  }, [brainState, particleCount, flowIntensity]);

  const liveRef = useRef({ sessionActive: false });
  useEffect(() => {
    liveRef.current.sessionActive = sessionActive;
  }, [sessionActive]);

  const sessionAccumRef = useRef({ sum: { coherence: 0, entropy: 0, neuroplasticity: 0 }, count: 0 });
  const sessionStartRef = useRef(0);

  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, active: false });

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const m = mouseRef.current;
    m.targetX = e.clientX - rect.left;
    m.targetY = e.clientY - rect.top;
    m.active = true;
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current.active = false;
  }, []);

  // Particle field — only mounted while the Console tab is visible, so it
  // fully tears down (and stops costing CPU) on every other tab.
  useEffect(() => {
    if (view !== 'console') return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    let rafId;
    let time = 0;
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = container.clientWidth * dpr;
      canvas.height = container.clientHeight * dpr;
      canvas.style.width = container.clientWidth + 'px';
      canvas.style.height = container.clientHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const MAX_PARTICLES = 2500;
    const particles = [];
    for (let i = 0; i < MAX_PARTICLES; i++) {
      particles.push({
        x: Math.random() * container.clientWidth,
        y: Math.random() * container.clientHeight,
        vx: 0, vy: 0,
        age: Math.random() * 100,
        baseSpeed: Math.random() * 1 + 0.5,
        hueOffset: Math.random() * 40,
      });
    }

    const render = () => {
      const w = container.clientWidth, h = container.clientHeight;
      const { brainState: bs, particleCount: pc, flowIntensity: fi } = stateRef.current;
      const s = STATES[bs];
      const mouse = mouseRef.current;

      ctx.fillStyle = 'rgba(2, 6, 16, 0.09)';
      ctx.fillRect(0, 0, w, h);

      time += reduceMotion ? 0.0015 : 0.005;
      mouse.x += (mouse.targetX - mouse.x) * 0.1;
      mouse.y += (mouse.targetY - mouse.y) * 0.1;

      for (let i = 0; i < pc; i++) {
        const p = particles[i];
        const angle = (Math.sin(p.x * s.frequency + time) + Math.cos(p.y * s.frequency + time)) * Math.PI * fi * s.amplitude;
        p.vx += Math.cos(angle) * 0.1;
        p.vy += Math.sin(angle) * 0.1;
        p.x += p.vx * p.baseSpeed;
        p.y += p.vy * p.baseSpeed;
        p.vx *= 0.94;
        p.vy *= 0.94;

        if (mouse.active) {
          const dx = mouse.x - p.x, dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180 && dist > 0.01) {
            const force = (180 - dist) / 180;
            p.vx += (dx / dist) * force * 0.6;
            p.vy += (dy / dist) * force * 0.6;
          }
        }

        if (p.x < 0 || p.x > w || p.y < 0 || p.y > h || p.age > 200) {
          p.x = Math.random() * w;
          p.y = Math.random() * h;
          p.vx = 0; p.vy = 0; p.age = 0;
        }
        p.age += 0.5;

        const dynamicHue = (s.hue + p.hueOffset + Math.sin(time) * 20) % 360;
        ctx.fillStyle = `hsla(${dynamicHue}, 90%, 65%, ${Math.min(1, (200 - p.age) / 50)})`;
        ctx.fillRect(p.x, p.y, 1.5, 1.5);
      }

      if (mouse.active) {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 180, 0, 2 * Math.PI);
        ctx.strokeStyle = `hsla(${s.hue}, 80%, 60%, 0.15)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      rafId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [view]);

  // Simulated telemetry — runs regardless of active tab so a session keeps
  // accumulating data even while you're browsing History or Settings.
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => {
        const next = {
          coherence: Math.min(100, Math.max(70, prev.coherence + (Math.random() * 4 - 2))),
          entropy: Math.min(30, Math.max(5, prev.entropy + (Math.random() * 2 - 1))),
          neuroplasticity: Math.min(99, Math.max(85, prev.neuroplasticity + (Math.random() * 2 - 1))),
        };
        if (liveRef.current.sessionActive) {
          const acc = sessionAccumRef.current;
          acc.sum.coherence += next.coherence;
          acc.sum.entropy += next.entropy;
          acc.sum.neuroplasticity += next.neuroplasticity;
          acc.count += 1;
        }
        return next;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Session timer tick
  useEffect(() => {
    if (!sessionActive) return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - sessionStartRef.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [sessionActive]);

  const startSession = () => {
    sessionAccumRef.current = { sum: { coherence: 0, entropy: 0, neuroplasticity: 0 }, count: 0 };
    sessionStartRef.current = Date.now();
    setElapsed(0);
    setSessionActive(true);
  };

  const endSession = () => {
    const dur = Math.floor((Date.now() - sessionStartRef.current) / 1000);
    const { sum, count } = sessionAccumRef.current;
    const record = {
      id: Date.now(),
      date: Date.now(),
      state: brainState,
      duration: dur,
      avgCoherence: count ? sum.coherence / count : metrics.coherence,
      avgEntropy: count ? sum.entropy / count : metrics.entropy,
      avgPlasticity: count ? sum.neuroplasticity / count : metrics.neuroplasticity,
    };
    setSessionHistory((prev) => [record, ...prev]);
    setSessionActive(false);
  };

  // Ambient synthetic tone, mapped loosely to the active state
  const toggleAudio = async () => {
    setAudioError(null);
    if (!audioEnabled) {
      try {
        await Tone.start();
        if (!synthRef.current) {
          const filter = new Tone.Filter(900, 'lowpass').toDestination();
          const reverb = new Tone.Reverb({ decay: 5, wet: 0.35 }).connect(filter);
          const startDb = volume <= 0 ? -60 : Tone.gainToDb(volume / 100);
          const vol = new Tone.Volume(startDb).connect(reverb);
          const note = STATES[brainState].note;
          const osc1 = new Tone.Oscillator(note, 'sine').connect(vol);
          const osc2 = new Tone.Oscillator(note * 1.005, 'sine').connect(vol);
          osc1.start();
          osc2.start();
          synthRef.current = { filter, reverb, vol, osc1, osc2 };
        }
        setAudioEnabled(true);
      } catch (err) {
        setAudioError('לא ניתן להפעיל אודיו בדפדפן זה');
      }
    } else {
      if (synthRef.current) {
        try {
          synthRef.current.osc1.stop();
          synthRef.current.osc2.stop();
          synthRef.current.osc1.dispose();
          synthRef.current.osc2.dispose();
          synthRef.current.vol.dispose();
          synthRef.current.reverb.dispose();
          synthRef.current.filter.dispose();
        } catch (e) { /* already torn down */ }
        synthRef.current = null;
      }
      setAudioEnabled(false);
    }
  };

  useEffect(() => {
    if (audioEnabled && synthRef.current) {
      const note = STATES[brainState].note;
      synthRef.current.osc1.frequency.rampTo(note, 1.2);
      synthRef.current.osc2.frequency.rampTo(note * 1.005, 1.2);
    }
  }, [brainState, audioEnabled]);

  useEffect(() => {
    if (synthRef.current) {
      const db = volume <= 0 ? -60 : Tone.gainToDb(volume / 100);
      synthRef.current.vol.volume.rampTo(db, 0.1);
    }
  }, [volume]);

  useEffect(() => {
    return () => {
      if (synthRef.current) {
        try {
          synthRef.current.osc1.stop();
          synthRef.current.osc2.stop();
          synthRef.current.osc1.dispose();
          synthRef.current.osc2.dispose();
          synthRef.current.vol.dispose();
          synthRef.current.reverb.dispose();
          synthRef.current.filter.dispose();
        } catch (e) { /* noop */ }
      }
    };
  }, []);

  const resetDefaults = () => {
    setBrainState('theta');
    setParticleCount(1500);
    setFlowIntensity(0.5);
  };

  const active = STATES[brainState];
  const chartData = [...sessionHistory].reverse().map((r, i) => ({ idx: i + 1, coherence: Math.round(r.avgCoherence) }));
  const totalDuration = sessionHistory.reduce((a, r) => a + r.duration, 0);
  const avgCoherenceAll = sessionHistory.length
    ? Math.round(sessionHistory.reduce((a, r) => a + r.avgCoherence, 0) / sessionHistory.length)
    : 0;

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 select-none" style={{ fontFamily: "'Rubik', system-ui, sans-serif" }}>
      <style>{`
        .font-mono-eng { font-family: 'JetBrains Mono', ui-monospace, monospace; }
        @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
        .motion-safe-scan { animation: scanline 6s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .motion-safe-scan { animation: none; } }
        input[type=range] { -webkit-appearance: none; background: transparent; }
        input[type=range]::-webkit-slider-runnable-track { height: 3px; border-radius: 2px; background: linear-gradient(90deg, currentColor var(--fill,50%), rgb(30 41 59) var(--fill,50%)); }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; margin-top: -6px; width: 15px; height: 15px; border-radius: 999px; background: currentColor; box-shadow: 0 0 8px currentColor; cursor: pointer; }
      `}</style>

      <div className="relative border border-slate-800 rounded-2xl bg-slate-900/30 backdrop-blur-sm">
        <Corner className="top-2 right-2" />
        <Corner className="top-2 left-2 -scale-x-100" />
        <Corner className="bottom-2 right-2 -scale-y-100" />
        <Corner className="bottom-2 left-2 -scale-100" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl shadow-lg" style={{ background: `linear-gradient(135deg, ${active.hex}, #22d3ee)`, boxShadow: `0 0 20px ${active.hex}40` }}>
              <Cpu className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-black tracking-tight">
                <span style={{ background: `linear-gradient(90deg, ${active.hex}, #22d3ee)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  מנוע סומטי
                </span>
                <span className="font-mono-eng text-slate-500 text-xs align-middle mr-2">v5.0</span>
              </h1>
              <p className="text-[11px] text-slate-500 font-mono-eng tracking-wide hidden sm:block">QUANTUM CLOSED-LOOP NEURO-INTERFACE</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <nav className="flex items-center gap-1 bg-slate-950/60 border border-slate-800 rounded-full p-1">
              {NAV.map((n) => {
                const Icon = n.icon;
                const isActive = view === n.key;
                return (
                  <button
                    key={n.key}
                    onClick={() => setView(n.key)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-600"
                    style={{ backgroundColor: isActive ? `${active.hex}1a` : 'transparent', color: isActive ? active.hex : 'rgb(100 116 139)' }}
                  >
                    <Icon className="w-3.5 h-3.5" /> {n.label}
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              {sessionActive && (
                <span className="font-mono-eng text-xs flex items-center gap-1.5 tabular-nums" style={{ color: active.hex }}>
                  <span className="w-1.5 h-1.5 rounded-full motion-safe:animate-pulse" style={{ backgroundColor: active.hex }} />
                  {fmtTime(elapsed)}
                </span>
              )}
              <button
                onClick={sessionActive ? endSession : startSession}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all focus-visible:outline-none focus-visible:ring-2"
                style={
                  sessionActive
                    ? { borderColor: '#f43f5e', color: '#f43f5e', backgroundColor: 'rgba(244,63,94,0.1)' }
                    : { borderColor: active.hex, color: active.hex, backgroundColor: `${active.hex}1a` }
                }
              >
                {sessionActive ? (<><Square className="w-3 h-3" /> סיים מפגש</>) : (<><Play className="w-3 h-3" /> התחל מפגש</>)}
              </button>
            </div>
          </div>
        </div>

        {/* Console tab */}
        {view === 'console' && (
          <div className="flex flex-col lg:flex-row gap-4 p-4">
            <div className="w-full lg:w-96 flex flex-col gap-5">
              <div className="space-y-2">
                <label className="text-[11px] text-slate-500 font-bold tracking-wider uppercase block">בחר תדר נוירולוגי</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(STATES).map(([key, s]) => {
                    const Icon = s.icon;
                    const isActive = brainState === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setBrainState(key)}
                        className="p-3 rounded-xl border text-right transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                        style={{
                          borderColor: isActive ? active.hex : 'rgb(30 41 59)',
                          backgroundColor: isActive ? `${s.hex}1a` : 'rgba(2,6,23,0.4)',
                          color: isActive ? s.hex : 'rgb(148 163 184)',
                          boxShadow: isActive ? `0 0 16px ${s.hex}30` : 'none',
                          outlineColor: s.hex,
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Icon className="w-3.5 h-3.5" />
                          <p className="text-xs font-mono-eng font-bold">{s.label}</p>
                        </div>
                        <p className="text-[10px] font-mono-eng text-slate-500">{s.freq}</p>
                        <p className="text-[10px] mt-0.5">{s.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold tracking-wider uppercase">
                  <Sliders className="w-3.5 h-3.5" /> פרמטרים פיזיקליים
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-400">
                    <span>צפיפות חלקיקים</span>
                    <span className="font-mono-eng" style={{ color: active.hex }}>{particleCount}</span>
                  </div>
                  <input
                    type="range" min="200" max="2500" step="50" value={particleCount}
                    onChange={(e) => setParticleCount(Number(e.target.value))}
                    className="w-full cursor-pointer focus-visible:outline-none"
                    style={{ color: active.hex, '--fill': `${((particleCount - 200) / 2300) * 100}%` }}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-400">
                    <span>עוצמת שדה זרימה</span>
                    <span className="font-mono-eng" style={{ color: active.hex }}>{flowIntensity.toFixed(2)}</span>
                  </div>
                  <input
                    type="range" min="0.1" max="2" step="0.05" value={flowIntensity}
                    onChange={(e) => setFlowIntensity(Number(e.target.value))}
                    className="w-full cursor-pointer focus-visible:outline-none"
                    style={{ color: active.hex, '--fill': `${((flowIntensity - 0.1) / 1.9) * 100}%` }}
                  />
                </div>

                <button
                  onClick={resetDefaults}
                  className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-300 transition-colors font-mono-eng focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-600 rounded px-1"
                >
                  <RefreshCw className="w-3 h-3" /> איפוס לברירת מחדל
                </button>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <label className="text-[10px] text-slate-500 font-bold uppercase block tracking-widest mb-3">מדדי השתקפות מערכת עצבים</label>
                <div className="grid grid-cols-3 gap-1">
                  <Gauge value={metrics.coherence} max={100} label="COHERENCE" unit="%" hex={active.hex} />
                  <Gauge value={metrics.entropy} max={30} label="ENTROPY" unit="idx" hex={active.hex} />
                  <Gauge value={metrics.neuroplasticity} max={99} label="PLASTICITY" unit="%" hex={active.hex} />
                </div>
                <p className="text-[9px] text-slate-700 font-mono-eng mt-3 text-center tracking-widest">SIMULATED TELEMETRY</p>
              </div>
            </div>

            <div ref={containerRef} className="relative flex-1 min-h-[420px] lg:min-h-[560px] rounded-xl overflow-hidden border border-slate-800 bg-black">
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full cursor-crosshair"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              />
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="motion-safe-scan absolute left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${active.hex}80, transparent)` }} />
              </div>
              <Corner className="top-3 right-3" />
              <Corner className="top-3 left-3 -scale-x-100" />
              <Corner className="bottom-3 right-3 -scale-y-100" />
              <Corner className="bottom-3 left-3 -scale-100" />

              <div className="absolute top-3 right-9 flex items-center gap-1.5 font-mono-eng text-[10px] text-slate-500">
                <Eye className="w-3 h-3" /> תצוגה חיה
              </div>
              <div className="absolute bottom-3 left-9 font-mono-eng text-[10px] tracking-widest" style={{ color: active.hex }}>
                STATE: {active.label} · {active.freq}
              </div>
              <div className="absolute top-3 left-9 font-mono-eng text-[10px] text-slate-600 hidden sm:block">
                הזז את העכבר להשפיע על השדה
              </div>
            </div>
          </div>
        )}

        {/* History tab */}
        {view === 'history' && (
          <div className="p-5 space-y-6">
            {sessionHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-16 gap-3 text-slate-600">
                <Activity className="w-10 h-10" />
                <p className="text-sm font-bold text-slate-400">עדיין אין מפגשים מתועדים</p>
                <p className="text-xs max-w-xs">התחילו מפגש בקונסולה כדי לתעד קוהרנטיות, אנטרופיה ופלסטיות לאורך זמן.</p>
                <button
                  onClick={() => setView('console')}
                  className="mt-2 text-xs font-bold px-4 py-2 rounded-lg focus-visible:outline-none focus-visible:ring-2"
                  style={{ backgroundColor: `${active.hex}1a`, color: active.hex, border: `1px solid ${active.hex}` }}
                >
                  עבור לקונסולה
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <StatCard icon={HistoryIcon} label="סה״כ מפגשים" value={sessionHistory.length} />
                  <StatCard icon={Clock} label="זמן מצטבר" value={fmtTime(totalDuration)} />
                  <StatCard icon={TrendingUp} label="קוהרנטיות ממוצעת" value={`${avgCoherenceAll}%`} hex={active.hex} />
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold tracking-wider uppercase mb-3">
                    <TrendingUp className="w-3.5 h-3.5" /> מגמת קוהרנטיות
                  </div>
                  <div dir="ltr" className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="idx" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                        <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 11 }} labelStyle={{ color: '#94a3b8' }} />
                        <Line type="monotone" dataKey="coherence" stroke="#22d3ee" strokeWidth={2} dot={{ r: 3, fill: '#22d3ee' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-2">
                  {sessionHistory.map((r) => {
                    const s = STATES[r.state];
                    return (
                      <div key={r.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-900/30 flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.hex }} />
                          <div>
                            <p className="text-xs font-bold">{s.label} · {fmtTime(r.duration)}</p>
                            <p className="text-[10px] text-slate-500 font-mono-eng">{fmtDate(r.date)}</p>
                          </div>
                        </div>
                        <div className="flex gap-3 font-mono-eng text-[11px] text-slate-400">
                          <span>C {Math.round(r.avgCoherence)}</span>
                          <span>E {Math.round(r.avgEntropy)}</span>
                          <span>P {Math.round(r.avgPlasticity)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Settings tab */}
        {view === 'settings' && (
          <div className="p-5 space-y-8 max-w-xl">
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold tracking-wider uppercase">
                <Radio className="w-3.5 h-3.5" /> שדה אקוסטי (Ambient)
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/40">
                <div>
                  <p className="text-sm font-bold">גוון אמביינט סינתטי</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">מגוון לפי התדר הפעיל · {active.label}</p>
                </div>
                <button
                  onClick={toggleAudio}
                  className="p-2.5 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2"
                  style={{
                    borderColor: audioEnabled ? active.hex : 'rgb(51 65 85)',
                    color: audioEnabled ? active.hex : 'rgb(100 116 139)',
                    backgroundColor: audioEnabled ? `${active.hex}1a` : 'transparent',
                  }}
                >
                  {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>
              {audioError && <p className="text-[11px] text-rose-400">{audioError}</p>}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>עוצמת קול</span>
                  <span className="font-mono-eng" style={{ color: active.hex }}>{volume}%</span>
                </div>
                <input
                  type="range" min="0" max="100" value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  disabled={!audioEnabled}
                  className="w-full cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none"
                  style={{ color: active.hex, '--fill': `${volume}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-600 font-mono-eng">SIGNAL SOURCE: SYNTHETIC — לא נתוני חיישן אמיתיים</p>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold tracking-wider uppercase">
                <Trash2 className="w-3.5 h-3.5" /> נתוני מפגשים
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/40 flex-wrap gap-2">
                <div>
                  <p className="text-sm font-bold">{sessionHistory.length} מפגשים שמורים במכשיר</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">ההיסטוריה נשמרת גם אחרי רענון וסגירת הדפדפן</p>
                </div>
                <button
                  onClick={() => setConfirmClear(true)}
                  disabled={sessionHistory.length === 0}
                  className="text-[11px] font-bold text-rose-400 hover:text-rose-300 disabled:opacity-30 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg border border-rose-900/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                >
                  נקה הכל
                </button>
              </div>
              {confirmClear && (
                <div className="flex items-center justify-between p-3 rounded-lg border border-rose-900/50 bg-rose-950/20 text-xs flex-wrap gap-2">
                  <span>למחוק את כל היסטוריית המפגשים?</span>
                  <div className="flex gap-3">
                    <button onClick={() => { setSessionHistory([]); setConfirmClear(false); }} className="text-rose-400 font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded px-1">כן, מחק</button>
                    <button onClick={() => setConfirmClear(false)} className="text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-600 rounded px-1">ביטול</button>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
