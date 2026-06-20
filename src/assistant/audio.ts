// Soft Japanese koto-style sound engine: gentle pentatonic (Yo scale) notes
// with a faint bell-like delay tail, plus an optional very low ambient pad.

const SCALE = {
  D4: 293.66, E4: 329.63, G4: 392, A4: 440, B4: 493.88,
  D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, B5: 987.77,
};

export class AudioEngine {
  private ac: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private ambGain: GainNode | null = null;
  muted = false;
  sfxOn = true;
  ambLevel = 0.4;
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
      this.startAmbient();
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

  private startAmbient() {
    if (!this.ac || !this.master) return;
    this.ambGain = this.ac.createGain();
    this.ambGain.gain.value = 0;
    this.ambGain.connect(this.master);
    const f = this.ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 240; f.connect(this.ambGain);
    [55, 82.5, 110].forEach((fr, i) => {
      const o = this.ac!.createOscillator(); o.type = 'sine'; o.frequency.value = fr; o.detune.value = i * 4;
      o.connect(f); o.start();
    });
    const lfo = this.ac.createOscillator(); lfo.frequency.value = 0.06;
    const lg = this.ac.createGain(); lg.gain.value = 0.01;
    lfo.connect(lg); lg.connect(this.ambGain.gain); lfo.start();
    this.ambGain.gain.linearRampToValueAtTime(this.ambLevel * 0.06, this.ac.currentTime + 3.5);
  }

  setAmbient(v: number) {
    this.ambLevel = Math.max(0, Math.min(1, v));
    if (v > 0) this.ambPrev = v;
    if (this.ambGain && this.ac) this.ambGain.gain.linearRampToValueAtTime(this.ambLevel * 0.06, this.ac.currentTime + 0.3);
  }
  toggleAmbient() { this.setAmbient(this.ambLevel > 0 ? 0 : this.ambPrev || 0.4); }
  toggleMute() { this.muted = !this.muted; if (this.master) this.master.gain.value = this.muted ? 0 : 1; }
}
