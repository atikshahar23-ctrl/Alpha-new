import { useEffect, useState } from 'react';
import { formatClock } from '../lib/utils';

function Chip({ label, ok, warn }) {
  const tone = ok
    ? 'border-phosphor/50 text-phosphor'
    : warn
      ? 'border-amber-alert/50 text-amber-alert'
      : 'border-ash/40 text-ash';
  return (
    <span className={`border px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.14em] ${tone}`}>
      {label}
    </span>
  );
}

export default function StatusBar({ orientation, camera, audio, shielded, onProvenance }) {
  const [clock, setClock] = useState(formatClock());

  useEffect(() => {
    const id = window.setInterval(() => setClock(formatClock()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-phosphor/20 bg-black/92 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-2">
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="animate-flicker font-display text-[13px] font-700 uppercase tracking-[0.22em] text-phosphor glow-text">
            AuraShield
          </span>
          <span className="hidden font-mono text-[9px] uppercase tracking-[0.2em] text-violet-glow/70 sm:inline">
            Pro · v4.2.1
          </span>
        </div>

        <span className="hidden h-3 w-px bg-phosphor/25 sm:block" />

        <div className="hidden items-center gap-1.5 sm:flex">
          <Chip label="mot" ok={orientation.permission === 'granted'} warn={orientation.permission === 'denied'} />
          <Chip label="opt" ok={camera.status === 'live'} warn={camera.status === 'denied'} />
          <Chip label="aud" ok={audio.engaged} />
          <Chip label="shd" ok={shielded} />
        </div>

        <div className="ml-auto flex items-center gap-2.5">
          <button
            onClick={onProvenance}
            className="border border-violet-glow/50 px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.14em] text-violet-glow transition-colors hover:bg-violet-glow/15"
            title="Data provenance"
          >
            sim
          </button>
          <span className="font-mono text-[10px] tabular-nums text-phosphor-dim">
            {clock}
            <span className="ml-1 text-ash">UTC</span>
          </span>
        </div>
      </div>
    </header>
  );
}
