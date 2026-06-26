import type { AppState } from './state';

type SpeechRecognitionCtor = any;

export class VoiceEngine {
  private rec: any = null;
  private recRunning = false;
  private suppress = false;
  private commandMode = false;
  private cmdTimer: number | undefined;
  private silenceTimer: number | undefined;
  private speechBuffer = '';
  private lastFinalIndex = 0;   // guards against Chrome re-delivering final results
  private voices: SpeechSynthesisVoice[] = [];
  private chosenVoice: SpeechSynthesisVoice | null = null;
  private state: AppState;
  private onTranscript: (text: string) => void;
  private onStateChange: (s: 'armed' | 'listening' | 'thinking' | 'speaking' | '') => void;
  private recRetries = 0;
  wakeOn = false;
  // Per-character voice modifier — when a non-default main character is the
  // assistant's avatar, its voice colours the spoken replies (e.g. Meowth =
  // deep raspy). Multiplies the user's base pitch/rate. null = normal voice.
  charVoice: { pitch?: number; rate?: number } | null = null;

  constructor(
    state: AppState,
    onTranscript: (text: string) => void,
    onStateChange: (s: 'armed' | 'listening' | 'thinking' | 'speaking' | '') => void
  ) {
    this.state = state;
    this.onTranscript = onTranscript;
    this.onStateChange = onStateChange;
    const SR: SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      this.rec = new SR();
      this.rec.lang = state.micLang === 'he' ? 'he-IL' : state.micLang === 'es' ? 'es-ES' : 'en-US';
      this.rec.continuous = true;
      this.rec.interimResults = true;
      this.rec.maxAlternatives = 1;
      this.rec.onresult = (e: any) => {
        if (this.suppress) return;
        let interim = '';
        // Process each final result EXACTLY once. Chrome (continuous mode) can
        // re-fire onresult and re-report results already marked final, which is
        // what caused the same phrase to be appended several times. Tracking the
        // highest consumed index stops the duplication.
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const res = e.results[i];
          if (res.isFinal) {
            if (i >= this.lastFinalIndex) {
              this.lastFinalIndex = i + 1;
              this.handleSpeech(res[0].transcript);
            }
          } else {
            interim += res[0].transcript;
          }
        }
        if (interim && this.commandMode) this.onStateChange('listening');
        if (interim) this.resetSilenceTimer();
      };
      this.rec.onend = () => {
        this.recRunning = false;
        this.recRetries = 0;
        if (this.commandMode && this.speechBuffer.trim()) {
          this.flushBuffer();
        }
        if (this.wakeOn && !this.suppress) {
          setTimeout(() => this.startRec(), 250);
        }
      };
      this.rec.onerror = (ev: any) => {
        this.recRunning = false;
        if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
          this.wakeOn = false;
          this.onStateChange('');
        } else if (this.wakeOn && !this.suppress && this.recRetries < 5) {
          this.recRetries++;
          setTimeout(() => this.startRec(), 500 * this.recRetries);
        }
      };
    }
    this.loadVoices();
    if ('speechSynthesis' in window) {
      speechSynthesis.onvoiceschanged = () => this.loadVoices();
    }
  }

  get supported() {
    return !!this.rec;
  }

  private startRec() {
    if (!this.rec || this.recRunning || !this.wakeOn) return;
    this.lastFinalIndex = 0;   // results list is per-session — reset the guard
    try { this.rec.start(); this.recRunning = true; } catch {}
  }
  private stopRec() {
    if (!this.rec) return;
    try { this.rec.stop(); } catch {}
  }

  private enterCommandMode() {
    this.commandMode = true;
    this.speechBuffer = '';
    this.onStateChange('listening');
    clearTimeout(this.cmdTimer);
    this.cmdTimer = window.setTimeout(() => {
      if (this.speechBuffer.trim()) {
        this.flushBuffer();
      } else {
        this.commandMode = false;
        if (this.wakeOn) this.onStateChange('armed');
      }
    }, 20000);
  }

  private resetSilenceTimer() {
    clearTimeout(this.silenceTimer);
    if (this.commandMode) {
      this.silenceTimer = window.setTimeout(() => {
        if (this.speechBuffer.trim()) {
          this.flushBuffer();
        }
      }, 2000);
    }
  }

  // Collapse repeated words and a wholly-duplicated phrase, e.g. the engine
  // returning "מה השעה מה השעה" → "מה השעה".
  private dedupe(text: string): string {
    const words = text.split(/\s+/).filter(Boolean);
    const out: string[] = [];
    for (const w of words) {
      if (out.length && out[out.length - 1].toLowerCase() === w.toLowerCase()) continue;
      out.push(w);
    }
    // Collapse a whole phrase repeated k times ("מה השעה מה השעה מה השעה" → "מה השעה").
    for (let unit = 1; unit <= Math.floor(out.length / 2); unit++) {
      if (out.length % unit !== 0) continue;
      const k = out.length / unit;
      const base = out.slice(0, unit).join(' ').toLowerCase();
      let allMatch = true;
      for (let r = 1; r < k; r++) {
        if (out.slice(r * unit, (r + 1) * unit).join(' ').toLowerCase() !== base) { allMatch = false; break; }
      }
      if (allMatch) return out.slice(0, unit).join(' ').trim();
    }
    return out.join(' ').trim();
  }

  private flushBuffer() {
    const text = this.dedupe(this.speechBuffer.trim());
    this.speechBuffer = '';
    this.commandMode = false;
    clearTimeout(this.cmdTimer);
    clearTimeout(this.silenceTimer);
    if (text) this.onTranscript(text);
  }

  private hasWake(t: string) {
    const s = t.toLowerCase();
    return (
      s.includes('alpha') || s.includes('alfa') || s.includes('elpha') ||
      s.includes('אלפא') || s.includes('אלפה')
    );
  }
  private stripWake(raw: string) {
    return raw
      .replace(/(hey|hi|hello|ok|okay)?\s*(alpha|alfa|elpha)\b[\s,.:!?-]*/i, '')
      .replace(/(היי|הי|הליי|אלו)?\s*(אלפא|אלפה)[\s,.:!?-]*/, '')
      .replace(/^[\s,.:!?-]+/, '')
      .trim();
  }

  private handleSpeech(final: string) {
    const raw = final.trim();
    if (!raw) return;

    if (this.commandMode) {
      // Skip a final that merely repeats what we just appended (engine echo).
      const tail = this.speechBuffer.trim().slice(-raw.length).toLowerCase();
      if (tail !== raw.toLowerCase()) this.speechBuffer += ' ' + raw;
      this.resetSilenceTimer();
      return;
    }

    if (this.hasWake(raw)) {
      const cmd = this.stripWake(raw);
      this.enterCommandMode();
      if (cmd.length > 1) {
        this.speechBuffer = cmd;
        this.resetSilenceTimer();
      }
    }
  }

  setWake(on: boolean) {
    if (on && !this.rec) return;
    this.wakeOn = on;
    this.state.wakeOn = on;
    if (on) {
      this.startRec();
      this.enterCommandMode();
    } else {
      this.commandMode = false;
      this.speechBuffer = '';
      clearTimeout(this.cmdTimer);
      clearTimeout(this.silenceTimer);
      this.onStateChange('');
      this.stopRec();
    }
  }

  private isFemaleVoice(name: string): boolean {
    const n = name.toLowerCase();
    return /female|woman|aria|jenny|jane|michelle|sonia|libby|samantha|zira|eva|joanna|amy|emma|salli|carmit|lucia|elena|conchita|lupe|penelope|paulina|monica|tessa|karen|moira|fiona|veena|ioana|sara|laura|alice|amelie|anna|catarina|damayanti|kanya|kyoko|mei-jia|melina|milena|nora|o-ren|sin-ji|tian-tian|ting-ting|yuna|zosia/.test(n);
  }
  private isMaleVoice(name: string): boolean {
    const n = name.toLowerCase();
    return /\bmale\b|david|mark|guy|james|ryan|daniel|thomas|oliver|jorge|diego|enrique|rishi|alex|fred|junior|liam/.test(n);
  }
  private scoreVoice(v: SpeechSynthesisVoice) {
    let s = 0;
    const n = v.name.toLowerCase();
    const L = this.state.replyLang;
    if (!v.lang.toLowerCase().startsWith(L)) return -100;

    if (/premium|studio/.test(n)) s += 20;
    if (/natural|neural/.test(n)) s += 15;
    if (/enhanced|online|wavenet/.test(n)) s += 12;
    if (/compact|espeak/.test(n)) s -= 10;
    if (/google/.test(n)) s += 5;
    if (/microsoft/.test(n)) s += 4;
    if (/apple/.test(n)) s += 3;

    const gender = this.state.voiceGender;
    if (gender === 'female') {
      if (this.isFemaleVoice(n)) s += 8;
      if (this.isMaleVoice(n)) s -= 8;
    } else if (gender === 'male') {
      if (this.isMaleVoice(n)) s += 8;
      if (this.isFemaleVoice(n)) s -= 8;
    }

    if (L === 'en') {
      if (/aria|jenny|michelle/.test(n)) s += 4;
      if (/david|mark|ryan/.test(n)) s += 4;
      if (v.lang === 'en-US') s += 2; else if (v.lang === 'en-GB') s += 1;
    }
    if (L === 'he' && /carmit|hebrew/.test(n)) s += 4;
    if (L === 'es' && /lucia|elena|jorge|paulina|monica/.test(n)) s += 4;

    return s;
  }
  private langVoices() {
    return this.voices
      .filter(v => v.lang.toLowerCase().startsWith(this.state.replyLang))
      .sort((a, b) => this.scoreVoice(b) - this.scoreVoice(a));
  }
  loadVoices() {
    this.voices = speechSynthesis.getVoices();
    const genderKey = this.state.voiceGender || 'auto';
    const saved = localStorage.getItem('alpha_voice_' + this.state.replyLang + '_' + genderKey);
    const list = this.langVoices();
    this.chosenVoice = (saved && list.find(v => v.name === saved)) || list[0] || this.voices[0] || null;
  }
  availableVoices() {
    return this.langVoices();
  }
  voiceGenderLabel(v: SpeechSynthesisVoice): string {
    if (this.isFemaleVoice(v.name)) return 'F';
    if (this.isMaleVoice(v.name)) return 'M';
    return '?';
  }
  setVoice(name: string) {
    const genderKey = this.state.voiceGender || 'auto';
    localStorage.setItem('alpha_voice_' + this.state.replyLang + '_' + genderKey, name);
    this.chosenVoice = this.voices.find(v => v.name === name) || this.chosenVoice;
  }

  speak(text: string) {
    if (!this.state.voiceOn || !this.state.autoSpeak || !('speechSynthesis' in window)) {
      if (this.wakeOn) this.enterCommandMode();
      else this.onStateChange('');
      return;
    }
    speechSynthesis.cancel();
    if (!this.chosenVoice && this.voices.length === 0) {
      this.loadVoices();
    }
    const u = new SpeechSynthesisUtterance(text);
    if (this.chosenVoice) { u.voice = this.chosenVoice; u.lang = this.chosenVoice.lang; }
    else u.lang = this.state.replyLang === 'he' ? 'he-IL' : this.state.replyLang === 'es' ? 'es-ES' : 'en-US';
    const cv = this.charVoice;
    u.rate = (this.state.voiceSpeed || 1.0) * (cv?.rate ?? 1);
    u.pitch = Math.max(0, Math.min(2, (this.state.voicePitch != null ? this.state.voicePitch : 1.0) * (cv?.pitch ?? 1)));
    u.volume = this.state.voiceVolume != null ? this.state.voiceVolume : 1.0;
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      this.suppress = false;
      if (this.wakeOn) {
        setTimeout(() => this.startRec(), 250);
        this.enterCommandMode();
      } else {
        this.onStateChange('');
      }
    };
    u.onstart = () => { this.suppress = true; this.stopRec(); this.onStateChange('speaking'); };
    u.onend = done;
    u.onerror = () => done();
    speechSynthesis.speak(u);
    setTimeout(() => { if (!finished) { speechSynthesis.cancel(); done(); } }, 30000);
  }

  // Speak a sample immediately for previewing voice settings — bypasses the
  // voiceOn/autoSpeak gates and accepts explicit rate/pitch/volume overrides so
  // the Voice Studio can audition presets before they're saved.
  preview(text: string, opts?: { rate?: number; pitch?: number; volume?: number; voiceName?: string }) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    if (!this.chosenVoice && this.voices.length === 0) this.loadVoices();
    const u = new SpeechSynthesisUtterance(text);
    let v = this.chosenVoice;
    if (opts?.voiceName) v = this.voices.find(x => x.name === opts.voiceName) || v;
    if (v) { u.voice = v; u.lang = v.lang; }
    else u.lang = this.state.replyLang === 'he' ? 'he-IL' : this.state.replyLang === 'es' ? 'es-ES' : 'en-US';
    u.rate = opts?.rate != null ? opts.rate : (this.state.voiceSpeed || 1.0);
    u.pitch = opts?.pitch != null ? opts.pitch : (this.state.voicePitch != null ? this.state.voicePitch : 1.0);
    u.volume = opts?.volume != null ? opts.volume : (this.state.voiceVolume != null ? this.state.voiceVolume : 1.0);
    const wasSuppressed = this.suppress;
    this.suppress = true;
    this.stopRec();
    u.onstart = () => { this.onStateChange('speaking'); };
    const done = () => {
      this.suppress = wasSuppressed;
      if (this.wakeOn) { setTimeout(() => this.startRec(), 250); this.onStateChange('armed'); }
      else this.onStateChange('');
    };
    u.onend = done;
    u.onerror = () => done();
    speechSynthesis.speak(u);
  }

  setMicLang(lang: 'he' | 'en' | 'es') {
    if (this.rec) this.rec.lang = lang === 'he' ? 'he-IL' : lang === 'es' ? 'es-ES' : 'en-US';
  }
}
