import * as Tone from 'tone';

/**
 * NEURO-SOMATIC AUDIO ENGINE
 * =========================================================================
 * The previous engine was two oscillators panned hard left and right. That
 * is a correct binaural beat and nothing else — no other entrainment method,
 * no noise bed, no protocol, no safety, and every parameter change was a
 * step rather than a ramp (which you hear as a click).
 *
 * This engine is built around three facts about entrainment audio:
 *
 *   1. BINAURAL beats only exist inside the listener's head — each ear gets
 *      a different frequency and the brain manufactures the difference. They
 *      require headphones and they fail completely on speakers.
 *   2. MONAURAL beats are the two tones summed BEFORE the ear, so the
 *      amplitude beating is physically present in the air. They work on
 *      speakers and are perceptually stronger for many people.
 *   3. ISOCHRONIC tones are a single carrier gated on and off at the beat
 *      rate. The sharpest stimulus of the three, also the most fatiguing.
 *
 * All three are implemented here as real signal paths, not presets of the
 * same path. Everything is ramped, everything is disposed, and a limiter
 * sits at the end so no combination of settings can produce a spike.
 */

const RAMP = 0.9;                 // seconds — every audible parameter change
const FADE = 1.6;                 // seconds — start/stop fade, no clicks ever

export const MODES = [
  { id: 'binaural',   label: 'בינאורלי',  need: 'חובה אוזניות',
    desc: 'תדר שונה בכל אוזן — המוח מייצר את ההפרש בעצמו. העדין והעמוק מבין השלושה.' },
  { id: 'monaural',   label: 'מונאורלי',  need: 'עובד גם ברמקולים',
    desc: 'שני התדרים מתערבבים לפני האוזן — הפעימה קיימת פיזית באוויר, ולכן חזקה יותר.' },
  { id: 'isochronic', label: 'איזוכרוני', need: 'עובד גם ברמקולים',
    desc: 'צליל אחד שנדלק ונכבה בקצב המבוקש. הגירוי החד ביותר — ולכן גם המתיש ביותר.' },
];

export const NOISE_BEDS = [
  { id: 'off',   label: 'ללא' },
  { id: 'pink',  label: 'רעש ורוד',  type: 'pink',  cut: 2200, desc: 'אנרגיה שווה לכל אוקטבה — הרקע הכי טבעי לאוזן' },
  { id: 'brown', label: 'רעש חום',   type: 'brown', cut: 900,  desc: 'כבד ונמוך, כמו מפל רחוק — מסכה מצוינת לרעשי סביבה' },
  { id: 'white', label: 'רעש לבן',   type: 'white', cut: 6000, desc: 'כל התדרים באותה עוצמה — החד והממסך ביותר' },
  { id: 'ocean', label: 'גלי ים',    type: 'brown', cut: 700,  surf: true, desc: 'רעש חום עם גאות ושפל איטית — נשימה של ים' },
];

/**
 * Real entrainment protocols. Each stage names a beat frequency and how long
 * to spend getting there — the RAMP between stages is the whole point: the
 * brain follows a moving target far better than it follows a step change.
 */
export const PROTOCOLS = [
  { id: 'none', label: 'ללא פרוטוקול', desc: 'התדר נשאר קבוע על מה שבחרת', stages: null },
  { id: 'descent', label: 'ירידה לשינה', desc: '12Hz → 6Hz → 2Hz לאורך 25 דקות — מלווה את המוח מערנות לשינה',
    stages: [ { hz: 12, min: 4 }, { hz: 8, min: 6 }, { hz: 5, min: 7 }, { hz: 2.5, min: 5 }, { hz: 1.5, min: 3 } ] },
  { id: 'focus', label: 'עליית מיקוד', desc: '8Hz → 18Hz לאורך 20 דקות — מכניס לעבודה בלי קפיצה חדה',
    stages: [ { hz: 8, min: 3 }, { hz: 12, min: 5 }, { hz: 16, min: 7 }, { hz: 18, min: 5 } ] },
  { id: 'meditate', label: 'מדיטציה עמוקה', desc: '10Hz → 6Hz ומחזיק — הורדה עדינה למישור התטא',
    stages: [ { hz: 10, min: 4 }, { hz: 7, min: 6 }, { hz: 6, min: 12 } ] },
  { id: 'creative', label: 'גל יצירתיות', desc: 'נע בין 7Hz ל-10Hz — האזור שבו רעיונות מתחברים',
    stages: [ { hz: 10, min: 4 }, { hz: 7.5, min: 5 }, { hz: 9.5, min: 5 }, { hz: 7, min: 6 } ] },
  { id: 'recovery', label: 'התאוששות', desc: '4Hz יציב עם ירידה לדלתא — לשימוש אחרי מאמץ',
    stages: [ { hz: 6, min: 5 }, { hz: 4, min: 10 }, { hz: 2, min: 10 } ] },
];

export class SomaticAudioEngine {
  constructor() {
    this.ready = false;
    this.nodes = null;
    this.params = { mode: 'binaural', carrier: 174.61, beat: 6, drone: true, noise: 'off', noiseLevel: 0.25, volume: 0.5 };
    this.protocol = null;
    this.protoStart = 0;
  }

  /** Build the whole graph once. Every later change is a ramp on it. */
  async start(params = {}) {
    await Tone.start();
    Object.assign(this.params, params);
    if (this.ready) { this.apply(this.params); return; }
    const p = this.params;

    // ── master chain: everything meets here ──────────────────────────────
    // A limiter last is not decoration: a drone layer plus a noise bed plus
    // an isochronic gate can constructively sum, and this is audio going
    // into someone's head at low volume for half an hour.
    const limiter = new Tone.Limiter(-3).toDestination();
    const analyser = new Tone.Analyser({ type: 'waveform', size: 512 });
    const fft = new Tone.Analyser({ type: 'fft', size: 64 });
    const master = new Tone.Gain(0).connect(limiter);
    master.connect(analyser);
    master.connect(fft);
    const eq = new Tone.EQ3({ low: 1, mid: -1, high: -3 }).connect(master);
    const reverb = new Tone.Reverb({ decay: 6, wet: 0.28 }).connect(eq);
    const tone = new Tone.Gain(1).connect(reverb);       // the entrainment path
    const bedGain = new Tone.Gain(0).connect(eq);        // the noise bed path

    // ── entrainment paths ────────────────────────────────────────────────
    // All three are constructed; only the active one is unmuted, so mode
    // switching is a cross-fade rather than a rebuild (no gap in the sound).
    const panL = new Tone.Panner(-1).connect(tone);
    const panR = new Tone.Panner(1).connect(tone);
    const oscL = new Tone.Oscillator(p.carrier, 'sine').connect(panL);
    const oscR = new Tone.Oscillator(p.carrier + p.beat, 'sine').connect(panR);

    // monaural: both tones summed into one centred signal
    const monoGain = new Tone.Gain(0).connect(tone);
    const monoA = new Tone.Oscillator(p.carrier, 'sine').connect(monoGain);
    const monoB = new Tone.Oscillator(p.carrier + p.beat, 'sine').connect(monoGain);

    // isochronic: one carrier through an amplitude gate at the beat rate.
    // A sine LFO shaped to stay positive gives a soft-edged pulse instead of
    // the hard square that makes long sessions unpleasant.
    const isoGate = new Tone.Gain(0).connect(tone);
    const isoOsc = new Tone.Oscillator(p.carrier, 'sine').connect(isoGate);
    const isoLfo = new Tone.LFO({ frequency: p.beat, min: 0, max: 1, type: 'sine' });
    isoLfo.connect(isoGate.gain);

    // ── harmonic drone: a fifth and an octave below, detuned and slowly
    // moving. This is what makes it sound like an instrument rather than a
    // hearing test — and it carries no beat of its own, so it never fights
    // the entrainment frequency.
    const droneGain = new Tone.Gain(0).connect(reverb);
    const drone1 = new Tone.Oscillator(p.carrier * 0.5, 'sine').connect(droneGain);
    const drone2 = new Tone.Oscillator(p.carrier * 0.75, 'triangle').connect(droneGain);
    drone2.volume.value = -12;
    const droneLfo = new Tone.LFO({ frequency: 0.05, min: -6, max: 6, type: 'sine' });
    droneLfo.connect(drone1.detune);

    // ── noise bed ────────────────────────────────────────────────────────
    const bedFilter = new Tone.Filter(2200, 'lowpass').connect(bedGain);
    const noise = new Tone.Noise('pink').connect(bedFilter);
    const surfLfo = new Tone.LFO({ frequency: 0.08, min: 0.25, max: 1, type: 'sine' });

    [oscL, oscR, monoA, monoB, isoOsc, drone1, drone2].forEach((o) => o.start());
    noise.start();
    isoLfo.start(); droneLfo.start(); surfLfo.start();

    this.nodes = { limiter, analyser, fft, master, eq, reverb, tone, bedGain, panL, panR,
      oscL, oscR, monoGain, monoA, monoB,
      isoGate, isoOsc, isoLfo, droneGain, drone1, drone2, droneLfo,
      bedFilter, noise, surfLfo };
    this.ready = true;
    this.apply(this.params);
    // fade the master up rather than snapping — the first second of a
    // session sets whether the whole thing feels calming or startling
    master.gain.cancelScheduledValues(Tone.now());
    master.gain.setValueAtTime(0.0001, Tone.now());
    master.gain.rampTo(this.params.volume, FADE);
  }

  /** Push the full parameter set onto the running graph, all ramped. */
  apply(params = {}) {
    Object.assign(this.params, params);
    if (!this.ready) return;
    const n = this.nodes, p = this.params;
    const hi = p.carrier + p.beat;
    n.oscL.frequency.rampTo(p.carrier, RAMP);
    n.oscR.frequency.rampTo(hi, RAMP);
    n.monoA.frequency.rampTo(p.carrier, RAMP);
    n.monoB.frequency.rampTo(hi, RAMP);
    n.isoOsc.frequency.rampTo(p.carrier, RAMP);
    n.isoLfo.frequency.rampTo(Math.max(0.2, p.beat), RAMP);
    n.drone1.frequency.rampTo(p.carrier * 0.5, RAMP);
    n.drone2.frequency.rampTo(p.carrier * 0.75, RAMP);
    // cross-fade the three methods
    n.panL.pan.rampTo(p.mode === 'binaural' ? -1 : 0, RAMP);
    n.panR.pan.rampTo(p.mode === 'binaural' ? 1 : 0, RAMP);
    n.tone.gain.rampTo(0.9, RAMP);
    const on = (m) => (p.mode === m ? 1 : 0);
    n.oscL.volume.rampTo(p.mode === 'binaural' ? -6 : -80, RAMP);
    n.oscR.volume.rampTo(p.mode === 'binaural' ? -6 : -80, RAMP);
    n.monoGain.gain.rampTo(on('monaural') * 0.5, RAMP);
    n.isoGate.gain.value = 0;                       // driven by the LFO
    n.isoOsc.volume.rampTo(on('isochronic') ? -4 : -80, RAMP);
    n.droneGain.gain.rampTo(p.drone ? 0.16 : 0, RAMP);
    // noise bed
    const bed = NOISE_BEDS.find((b) => b.id === p.noise) || NOISE_BEDS[0];
    if (bed.id === 'off') {
      n.bedGain.gain.rampTo(0, RAMP);
      try { n.surfLfo.disconnect(); } catch {}
    } else {
      if (n.noise.type !== bed.type) n.noise.type = bed.type;
      n.bedFilter.frequency.rampTo(bed.cut, RAMP);
      n.bedGain.gain.rampTo(p.noiseLevel * 0.5, RAMP);
      try { n.surfLfo.disconnect(); } catch {}
      if (bed.surf) { try { n.surfLfo.connect(n.bedGain.gain); } catch {} }
    }
    n.master.gain.rampTo(p.volume, 0.25);
  }

  setVolume(v) {
    this.params.volume = v;
    if (this.ready) this.nodes.master.gain.rampTo(v, 0.25);
  }

  /** Start a timed protocol; returns immediately, advance() drives it. */
  runProtocol(id) {
    const proto = PROTOCOLS.find((x) => x.id === id);
    this.protocol = proto && proto.stages ? proto : null;
    this.protoStart = Date.now();
    return this.protocol;
  }
  stopProtocol() { this.protocol = null; }

  /**
   * Called on a timer by the UI. Returns the protocol's current position so
   * the interface can show it, and ramps the beat frequency toward the
   * stage's target — the ramp IS the protocol, not a side effect of it.
   */
  advance() {
    if (!this.protocol || !this.ready) return null;
    const elapsedMin = (Date.now() - this.protoStart) / 60000;
    let acc = 0, stage = null, idx = 0;
    for (let i = 0; i < this.protocol.stages.length; i++) {
      const s = this.protocol.stages[i];
      if (elapsedMin < acc + s.min) { stage = s; idx = i; break; }
      acc += s.min;
    }
    const totalMin = this.protocol.stages.reduce((a, s) => a + s.min, 0);
    if (!stage) {           // protocol finished — hold the last frequency
      const last = this.protocol.stages[this.protocol.stages.length - 1];
      return { done: true, hz: last.hz, idx: this.protocol.stages.length - 1,
        total: this.protocol.stages.length, elapsedMin, totalMin };
    }
    // glide toward the stage target across the stage, never a step
    const prevHz = idx === 0 ? this.params.beat : this.protocol.stages[idx - 1].hz;
    const into = (elapsedMin - acc) / stage.min;
    const hz = prevHz + (stage.hz - prevHz) * Math.min(1, into);
    if (Math.abs(hz - this.params.beat) > 0.02) this.apply({ beat: hz });
    return { done: false, hz, idx, total: this.protocol.stages.length, elapsedMin, totalMin };
  }

  /** Headphone / channel check — a word in each ear, in order. */
  async channelTest() {
    await Tone.start();
    const mk = (pan) => {
      const pn = new Tone.Panner(pan).toDestination();
      const o = new Tone.Oscillator(pan < 0 ? 440 : 660, 'sine').connect(pn);
      o.volume.value = -16;
      return { o, pn };
    };
    const L = mk(-1);
    L.o.start(); L.o.stop('+0.7');
    setTimeout(() => {
      try { L.o.dispose(); L.pn.dispose(); } catch {}
      const R = mk(1);
      R.o.start(); R.o.stop('+0.7');
      setTimeout(() => { try { R.o.dispose(); R.pn.dispose(); } catch {} }, 1100);
    }, 900);
  }

  /** Waveform data for the live scope, or null when silent. */
  waveform() { return this.ready ? this.nodes.analyser.getValue() : null; }
  spectrum() { return this.ready ? this.nodes.fft.getValue() : null; }

  /** Fade out, then tear the whole graph down. */
  async stop() {
    if (!this.ready) return;
    const n = this.nodes;
    this.protocol = null;
    try { n.master.gain.rampTo(0.0001, 0.6); } catch {}
    await new Promise((r) => setTimeout(r, 700));
    const all = Object.values(n);
    for (const node of all) {
      try { if (node && node.stop) node.stop(); } catch {}
      try { if (node && node.dispose) node.dispose(); } catch {}
    }
    this.nodes = null;
    this.ready = false;
  }
}
