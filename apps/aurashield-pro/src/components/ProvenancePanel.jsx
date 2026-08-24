import { useEffect } from 'react';

/**
 * Data provenance.
 *
 * Reads as classification metadata — which is exactly what a real
 * intelligence tool would surface — while stating plainly which numbers
 * come off hardware and which are generated. The aesthetic and the
 * honesty are doing the same job here.
 */

const ROWS = [
  {
    instrument: 'Quantum EMF Scanner',
    signal: 'Azimuth / pitch / roll',
    source: 'sensor',
    note: 'Live DeviceOrientation output. Real values from the accelerometer and magnetometer.',
  },
  {
    instrument: 'Quantum EMF Scanner',
    signal: 'Contacts and bearings',
    source: 'generated',
    note: 'Pseudo-random. Each contact is assigned a fixed bearing so it holds position as you turn — the frame of reference is real, the contact is not.',
  },
  {
    instrument: 'Loosh Drain Detector',
    signal: 'Quantum coherence %',
    source: 'generated',
    note: 'Mean-reverting random walk. No biometric hardware is read. Nothing about your body is being measured.',
  },
  {
    instrument: 'Loosh Drain Detector',
    signal: 'Drain alerts',
    source: 'generated',
    note: 'Fired on a probability roll, roughly once or twice a minute. Alerts do not correspond to any external event.',
  },
  {
    instrument: 'Scalar Frequency Jammer',
    signal: '396 / 432 / 528 Hz output',
    source: 'sensor',
    note: 'Genuine Web Audio oscillators at exactly those pitches. The oscilloscope draws the real waveform off an AnalyserNode.',
  },
  {
    instrument: 'Kirlian Aura Filter',
    signal: 'Video feed',
    source: 'sensor',
    note: 'Live camera, processed on-device only. Never uploaded, never recorded.',
  },
  {
    instrument: 'Kirlian Aura Filter',
    signal: 'Corona / aura layer',
    source: 'generated',
    note: 'CSS filter compositing — hue rotation, saturation, and a blurred screen-blended copy. A colour effect on ordinary video, not a reading of anything around the subject.',
  },
];

const TONE = {
  sensor: { label: 'HARDWARE', cls: 'text-phosphor border-phosphor/50' },
  generated: { label: 'GENERATED', cls: 'text-amber-alert border-amber-alert/50' },
};

export default function ProvenancePanel({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/90 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Data provenance"
    >
      <div
        className="bay clip-corner my-auto w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center gap-3 border-b border-phosphor/20 px-4 py-3">
          <span className="label text-violet-glow/70">DOC-00</span>
          <h2 className="font-display text-[13px] font-600 uppercase tracking-[0.18em] text-phosphor">
            Data provenance
          </h2>
          <button onClick={onClose} className="btn-hud ml-auto !px-2 !py-1">
            Close
          </button>
        </header>

        <div className="border-b border-phosphor/15 px-4 py-3">
          <p className="font-mono text-[10.5px] leading-relaxed text-phosphor-dim">
            AuraShield Pro is a simulation — an interface built for the look and
            feel of a field instrument. Some of what you see is real sensor data.
            The detections are not. Every readout is classified below.
          </p>
        </div>

        <ul>
          {ROWS.map((r, i) => (
            <li key={i} className="border-b border-phosphor/[0.08] px-4 py-2.5">
              <div className="flex items-center gap-2.5">
                <span
                  className={`shrink-0 border px-1.5 py-0.5 font-mono text-[8px] tracking-[0.12em] ${TONE[r.source].cls}`}
                >
                  {TONE[r.source].label}
                </span>
                <span className="font-mono text-[10.5px] text-phosphor/90">{r.signal}</span>
                <span className="ml-auto hidden shrink-0 font-mono text-[9px] text-ash sm:inline">
                  {r.instrument}
                </span>
              </div>
              <p className="mt-1 font-mono text-[9.5px] leading-relaxed text-ash">{r.note}</p>
            </li>
          ))}
        </ul>

        <div className="px-4 py-3">
          <p className="font-mono text-[9.5px] leading-relaxed text-ash">
            No claim is made that anything detected here exists. If the alerts
            start feeling less like a toy and more like confirmation of something
            you're worried about, that's the point to close the tab and talk to
            someone you trust.
          </p>
        </div>
      </div>
    </div>
  );
}
