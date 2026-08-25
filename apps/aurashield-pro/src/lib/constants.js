// ─── AURASHIELD PRO — shared constants ────────────────────────────────
// Single source of truth for palette, audio config, and the copy deck.

export const PALETTE = {
  void: '#000000',
  phosphor: '#39ff14',
  phosphorDim: '#1f8c0c',
  violetDeep: '#4c0f7a',
  violetGlow: '#a855f7',
  amber: '#ffb000',
  blood: '#ff2d55',
  ash: '#4a5548',
};

// Real oscillator frequencies. These tones are genuinely synthesised
// by the Web Audio API — the pitch is exactly what the label says.
export const FREQUENCIES = [
  {
    id: 'f528',
    hz: 528,
    name: 'MI · 528',
    subtitle: 'Transformation band',
    color: PALETTE.phosphor,
  },
  {
    id: 'f432',
    hz: 432,
    name: 'OM · 432',
    subtitle: 'Harmonic anchor',
    color: PALETTE.violetGlow,
  },
  {
    id: 'f396',
    hz: 396,
    name: 'UT · 396',
    subtitle: 'Ground clearance',
    color: PALETTE.amber,
  },
];

export const WAVEFORMS = ['sine', 'triangle', 'square', 'sawtooth'];

// Kirlian filter presets. Each is a real CSS filter chain applied to a
// live <video> element — no image processing, just compositing.
export const AURA_MODES = [
  {
    id: 'thermal',
    label: 'Thermal',
    caption: 'Infrared emulation · false-colour ramp',
    base: 'invert(1) hue-rotate(180deg) saturate(4) contrast(1.7) brightness(1.05)',
    bloom: 'blur(14px) saturate(6) brightness(1.5) hue-rotate(200deg)',
    blend: 'screen',
  },
  {
    id: 'kirlian',
    label: 'Kirlian',
    caption: 'Corona discharge · high-voltage emulation',
    base: 'saturate(6) contrast(2.1) hue-rotate(75deg) brightness(1.1)',
    bloom: 'blur(18px) saturate(9) brightness(1.8) hue-rotate(90deg)',
    blend: 'screen',
  },
  {
    id: 'spectral',
    label: 'Spectral',
    caption: 'Violet band pass · low-luminance gain',
    base: 'hue-rotate(255deg) saturate(5) contrast(1.9) brightness(0.95) invert(0.12)',
    bloom: 'blur(22px) saturate(7) brightness(1.6) hue-rotate(270deg)',
    blend: 'color-dodge',
  },
  {
    id: 'raw',
    label: 'Raw',
    caption: 'Unfiltered sensor feed · no compositing',
    base: 'none',
    bloom: 'none',
    blend: 'normal',
  },
];

// ─── Copy deck ────────────────────────────────────────────────────────
// Kept out of components so the voice stays consistent and editable.

export const ANOMALY_CLASSES = [
  { code: 'TX-1', label: 'Torsion eddy', threat: 'low' },
  { code: 'TX-2', label: 'Scalar backwash', threat: 'low' },
  { code: 'LH-3', label: 'Loosh siphon', threat: 'high' },
  { code: 'LH-4', label: 'Attachment node', threat: 'high' },
  { code: 'GM-5', label: 'Geomantic fault', threat: 'mid' },
  { code: 'GM-6', label: 'Ley intersection', threat: 'mid' },
  { code: 'EM-7', label: 'Harmonic bleed', threat: 'low' },
  { code: 'EM-8', label: 'Phase-locked emitter', threat: 'mid' },
];

export const DRAIN_ALERTS = [
  'Parasitic energy drain detected in immediate vicinity.',
  'Coherence siphon active — field integrity falling.',
  'Non-local attachment signature on the perimeter.',
  'Biofield leakage across the third gate.',
  'Entrainment attempt intercepted — source unresolved.',
  'Torsion inversion detected inside the shield radius.',
];

export const RECOVERY_LINES = [
  'Field re-integrated. Coherence nominal.',
  'Siphon lost lock. Perimeter stable.',
  'Harmonic baseline restored.',
  'Attachment signature decayed below threshold.',
];

export const BOOT_SEQUENCE = [
  'AURASHIELD PRO  ·  FIELD TERMINAL  v4.2.1',
  'clearance ......................... LEVEL 7',
  'loading torsion lattice ................ ok',
  'calibrating scalar interferometer ...... ok',
  'mounting biofield telemetry bus ........ ok',
  'harmonic tables 396/432/528 ............ ok',
  'sensor array ................... STANDBY',
  '',
  'AUTHORISATION REQUIRED',
];

// Alert thresholds for the coherence monitor (percent).
export const COHERENCE = {
  NOMINAL: 82,
  DEGRADED: 68,
  CRITICAL: 52,
};
