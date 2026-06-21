const SCALE = {
  D4: 293.66, E4: 329.63, G4: 392, A4: 440, B4: 493.88,
  D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, B5: 987.77,
};

export type AmbientPreset = 'pad' | 'rain' | 'ocean' | 'wind' | 'cafe' | 'fireplace' | 'night' | 'stream' | 'off';

export const AMBIENT_PRESETS: { id: AmbientPreset; label: string; labelHe: string }[] = [
  { id: 'pad', label: 'Soft Pad', labelHe: 'רקע רך' },
  { id: 'rain', label: 'Rain', labelHe: 'גשם' },
  { id: 'ocean', label: 'Ocean Waves', labelHe: 'גלי ים' },
  { id: 'wind', label: 'Gentle Wind', labelHe: 'רוח' },
  { id: 'cafe', label: 'Café', labelHe: 'בית קפה' },
  { id: 'fireplace', label: 'Fireplace', labelHe: 'אח' },
  { id: 'night', label: 'Night Crickets', labelHe: 'צרצרים' },
  { id: 'stream', label: 'Forest Stream', labelHe: 'נחל ביער' },
  { id: 'off', label: 'Off', labelHe: 'כבוי' },
];

export class AudioEngine {
  private ac: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private ambGain: GainNode | null = null;
  private ambNodes: (OscillatorNode | AudioBufferSourceNode)[] = [];
  muted = false;
  sfxOn = true;
  ambLevel = 0.4;
  ambPreset: AmbientPreset = 'pad';
  private ambPrev = 0.4;

  ensure() {
    if (this.ac) return;
    try {
      this.ac = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.master = this.ac.createGain();
      this.master.gain.value = this.muted ? 0 : 1;
      this.master.connect(this.ac.destination);
      this.sfxBus = this.ac.createGain();
      this.sfxBus.gain.value = 1;
      this.sfxBus.connect(this.master);
      const delay = this.ac.createDelay();
      delay.delayTime.value = 0.24;
      const fb = this.ac.createGain(); fb.gain.value = 0.22;
      const wet = this.ac.createGain(); wet.gain.value = 0.18;
      this.sfxBus.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(this.master);
      this.startAmbient(this.ambPreset);
      this.boot();
    } catch {}
  }

  private note(freq: number, dur = 1.4, vol = 0.1, when = 0) {
    if (!this.ac || !this.sfxBus) return;
    const t0 = this.ac.currentTime + when;
    const o = this.ac.createOscillator(), o2 = this.ac.createOscillator();
    const g = this.ac.createGain(), g2 = this.ac.createGain();
    o.type = 'sine'; o2.type = 'sine';
    o.frequency.value = freq; o2.frequency.value = freq * 2.004;
    g2.gain.value = 0.28;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.014);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(this.sfxBus);
    o.start(t0); o2.start(t0); o.stop(t0 + dur + 0.05); o2.stop(t0 + dur + 0.05);
  }

  boot() { if (this.sfxOn) [[SCALE.D5,0,.13],[SCALE.E5,.13,.13],[SCALE.G5,.26,.13],[SCALE.A5,.40,.14]].forEach(([f,t,v]) => this.note(f,1.8,v,t)); }
  send() { if (this.sfxOn) this.note(SCALE.G5, 1.1, 0.12); }
  receive() { if (this.sfxOn) { this.note(SCALE.E5, 1.2, 0.12); this.note(SCALE.A5, 1.4, 0.11, 0.12); } }
  micOn() { if (this.sfxOn) { this.note(SCALE.A4, 1.0, 0.12); this.note(SCALE.E5, 1.2, 0.11, 0.1); } }
  micOff() { if (this.sfxOn) { this.note(SCALE.E5, 1.0, 0.11); this.note(SCALE.A4, 1.2, 0.1, 0.1); } }
  open() { if (this.sfxOn) { this.note(SCALE.D5, 1.4, 0.1); this.note(SCALE.A5, 1.6, 0.09, 0.06); } }
  test() { this.note(SCALE.G5, 1.3, 0.14); this.note(SCALE.B5, 1.5, 0.1, 0.1); }

  private stopAmbientNodes() {
    for (const n of this.ambNodes) { try { n.stop(); } catch {} try { n.disconnect(); } catch {} }
    this.ambNodes = [];
  }

  private noise(dur: number): AudioBuffer {
    const ac = this.ac!;
    const len = ac.sampleRate * dur;
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  private loopNoise(filter: BiquadFilterType, freq: number, gain: number, q = 1) {
    const ac = this.ac!;
    const src = ac.createBufferSource();
    src.buffer = this.noise(4);
    src.loop = true;
    const f = ac.createBiquadFilter();
    f.type = filter;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ac.createGain();
    g.gain.value = gain;
    src.connect(f);
    f.connect(g);
    g.connect(this.ambGain!);
    src.start();
    this.ambNodes.push(src);
    return { src, filter: f, gain: g };
  }

  startAmbient(preset: AmbientPreset) {
    if (!this.ac || !this.master) return;
    this.stopAmbientNodes();
    this.ambPreset = preset;

    if (!this.ambGain) {
      this.ambGain = this.ac.createGain();
      this.ambGain.gain.value = 0;
      this.ambGain.connect(this.master);
    }

    if (preset === 'off') {
      this.ambGain.gain.linearRampToValueAtTime(0, this.ac.currentTime + 0.5);
      return;
    }

    const vol = this.ambLevel * 0.06;

    switch (preset) {
      case 'pad':
        this.buildPad();
        break;
      case 'rain':
        this.buildRain();
        break;
      case 'ocean':
        this.buildOcean();
        break;
      case 'wind':
        this.buildWind();
        break;
      case 'cafe':
        this.buildCafe();
        break;
      case 'fireplace':
        this.buildFireplace();
        break;
      case 'night':
        this.buildNight();
        break;
      case 'stream':
        this.buildStream();
        break;
    }

    this.ambGain.gain.linearRampToValueAtTime(vol, this.ac.currentTime + 2.0);
  }

  private buildPad() {
    const ac = this.ac!;
    const f = ac.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 240;
    f.connect(this.ambGain!);
    [55, 82.5, 110].forEach((fr, i) => {
      const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = fr; o.detune.value = i * 4;
      o.connect(f); o.start();
      this.ambNodes.push(o);
    });
    const lfo = ac.createOscillator(); lfo.frequency.value = 0.06;
    const lg = ac.createGain(); lg.gain.value = 0.01;
    lfo.connect(lg); lg.connect(this.ambGain!.gain); lfo.start();
    this.ambNodes.push(lfo);
  }

  private buildRain() {
    this.loopNoise('bandpass', 800, 0.7, 0.8);
    this.loopNoise('highpass', 2000, 0.2, 0.5);
    this.loopNoise('bandpass', 400, 0.3, 0.6);

    const ac = this.ac!;
    const lfo = ac.createOscillator(); lfo.frequency.value = 0.08;
    const lg = ac.createGain(); lg.gain.value = 0.15;
    lfo.connect(lg); lg.connect(this.ambGain!.gain); lfo.start();
    this.ambNodes.push(lfo);
  }

  private buildOcean() {
    this.loopNoise('lowpass', 300, 0.6, 0.4);
    this.loopNoise('bandpass', 150, 0.35, 0.3);

    const ac = this.ac!;
    const lfo = ac.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.12;
    const lg = ac.createGain(); lg.gain.value = 0.4;
    lfo.connect(lg); lg.connect(this.ambGain!.gain); lfo.start();
    this.ambNodes.push(lfo);

    const lfo2 = ac.createOscillator(); lfo2.type = 'sine'; lfo2.frequency.value = 0.04;
    const lg2 = ac.createGain(); lg2.gain.value = 0.2;
    lfo2.connect(lg2); lg2.connect(this.ambGain!.gain); lfo2.start();
    this.ambNodes.push(lfo2);
  }

  private buildWind() {
    this.loopNoise('bandpass', 500, 0.5, 0.3);
    this.loopNoise('bandpass', 1200, 0.15, 0.4);

    const ac = this.ac!;
    const lfo = ac.createOscillator(); lfo.frequency.value = 0.05;
    const lg = ac.createGain(); lg.gain.value = 0.3;
    lfo.connect(lg); lg.connect(this.ambGain!.gain); lfo.start();
    this.ambNodes.push(lfo);
  }

  private buildCafe() {
    this.loopNoise('bandpass', 600, 0.3, 0.5);
    this.loopNoise('bandpass', 1500, 0.1, 0.8);
    this.loopNoise('lowpass', 250, 0.2, 0.3);

    const ac = this.ac!;
    const lfo = ac.createOscillator(); lfo.frequency.value = 0.03;
    const lg = ac.createGain(); lg.gain.value = 0.08;
    lfo.connect(lg); lg.connect(this.ambGain!.gain); lfo.start();
    this.ambNodes.push(lfo);

    const schedClink = () => {
      if (!this.ac || this.ambPreset !== 'cafe') return;
      const delay = 3 + Math.random() * 8;
      setTimeout(() => {
        if (!this.ac || this.ambPreset !== 'cafe') return;
        const freq = 2000 + Math.random() * 3000;
        const o = this.ac.createOscillator(); o.type = 'sine'; o.frequency.value = freq;
        const g = this.ac.createGain();
        const t = this.ac.currentTime;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.03, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
        o.connect(g); g.connect(this.ambGain!);
        o.start(t); o.stop(t + 0.5);
        schedClink();
      }, delay * 1000);
    };
    schedClink();
  }

  private buildFireplace() {
    this.loopNoise('bandpass', 200, 0.5, 0.3);
    this.loopNoise('bandpass', 80, 0.3, 0.5);
    this.loopNoise('highpass', 3000, 0.08, 0.4);

    const ac = this.ac!;
    const lfo = ac.createOscillator(); lfo.frequency.value = 0.15;
    const lg = ac.createGain(); lg.gain.value = 0.25;
    lfo.connect(lg); lg.connect(this.ambGain!.gain); lfo.start();
    this.ambNodes.push(lfo);

    const schedCrackle = () => {
      if (!this.ac || this.ambPreset !== 'fireplace') return;
      const delay = 0.5 + Math.random() * 2;
      setTimeout(() => {
        if (!this.ac || this.ambPreset !== 'fireplace') return;
        const src = this.ac.createBufferSource();
        src.buffer = this.noise(0.08);
        const f = this.ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1000 + Math.random() * 3000; f.Q.value = 2;
        const g = this.ac.createGain();
        const t = this.ac.currentTime;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.06 * Math.random(), t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
        src.connect(f); f.connect(g); g.connect(this.ambGain!);
        src.start(t); src.stop(t + 0.1);
        schedCrackle();
      }, delay * 1000);
    };
    schedCrackle();
  }

  private buildNight() {
    this.loopNoise('bandpass', 3500, 0.08, 2);
    this.loopNoise('lowpass', 200, 0.15, 0.3);

    const schedChirp = () => {
      if (!this.ac || this.ambPreset !== 'night') return;
      const delay = 0.3 + Math.random() * 1.5;
      setTimeout(() => {
        if (!this.ac || this.ambPreset !== 'night') return;
        const baseFreq = 3800 + Math.random() * 1200;
        const t = this.ac.currentTime;
        for (let i = 0; i < 3; i++) {
          const o = this.ac.createOscillator(); o.type = 'sine';
          o.frequency.value = baseFreq + Math.random() * 200;
          const g = this.ac.createGain();
          const onset = t + i * 0.06;
          g.gain.setValueAtTime(0, onset);
          g.gain.linearRampToValueAtTime(0.012, onset + 0.008);
          g.gain.exponentialRampToValueAtTime(0.0001, onset + 0.04);
          o.connect(g); g.connect(this.ambGain!);
          o.start(onset); o.stop(onset + 0.05);
        }
        schedChirp();
      }, delay * 1000);
    };
    schedChirp();
  }

  private buildStream() {
    this.loopNoise('bandpass', 1200, 0.35, 0.5);
    this.loopNoise('bandpass', 600, 0.4, 0.4);
    this.loopNoise('highpass', 3000, 0.08, 0.3);

    const ac = this.ac!;
    const lfo = ac.createOscillator(); lfo.frequency.value = 0.07;
    const lg = ac.createGain(); lg.gain.value = 0.15;
    lfo.connect(lg); lg.connect(this.ambGain!.gain); lfo.start();
    this.ambNodes.push(lfo);

    const lfo2 = ac.createOscillator(); lfo2.frequency.value = 0.2;
    const lg2 = ac.createGain(); lg2.gain.value = 0.08;
    lfo2.connect(lg2); lg2.connect(this.ambGain!.gain); lfo2.start();
    this.ambNodes.push(lfo2);
  }

  setAmbient(v: number) {
    this.ambLevel = Math.max(0, Math.min(1, v));
    if (v > 0) this.ambPrev = v;
    if (this.ambGain && this.ac) this.ambGain.gain.linearRampToValueAtTime(this.ambLevel * 0.06, this.ac.currentTime + 0.3);
  }

  setPreset(preset: AmbientPreset) {
    if (preset === this.ambPreset) return;
    this.startAmbient(preset);
  }

  toggleAmbient() { this.setAmbient(this.ambLevel > 0 ? 0 : this.ambPrev || 0.4); }
  toggleMute() { this.muted = !this.muted; if (this.master) this.master.gain.value = this.muted ? 0 : 1; }
}
