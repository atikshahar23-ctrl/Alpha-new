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
  // Android Chrome delivers ONLY interim results in a continuous session —
  // the "final" often never arrives until the session is stopped. Desktop
  // finals flow into speechBuffer; this keeps the freshest interim so the
  // silence endpoint can send SOMETHING on mobile instead of flushing an
  // empty buffer and leaving the mic stuck "recording forever".
  private lastInterim = '';
  private lastFinalIndex = 0;   // guards against Chrome re-delivering final results
  private voices: SpeechSynthesisVoice[] = [];
  private chosenVoice: SpeechSynthesisVoice | null = null;
  private state: AppState;
  private onTranscript: (text: string) => void;
  private onStateChange: (s: 'armed' | 'listening' | 'thinking' | 'speaking' | '') => void;
  // Optional live-transcript sink — fired with the growing text WHILE the user
  // is still speaking (interim results), so the UI can show what was heard
  // instantly instead of only after the endpoint silence flush. Set by app.ts.
  onInterim: ((text: string) => void) | null = null;
  // Fired when recognition dies for a reason the user must act on (mic
  // permission denied). Before this, a blocked mic silently flipped wake off
  // with zero feedback — "the assistant just doesn't listen". Set by app.ts.
  onMicBlocked: (() => void) | null = null;
  // Fired after several consecutive recognition errors with zero results —
  // the "mic looks on but hears nothing" state (network-blocked speech
  // service, mic contention). Gives the user a visible diagnosis instead of
  // an infinite silent retry loop. Set by app.ts.
  onMicIssue: ((err: string) => void) | null = null;
  private errStreak = 0;
  // Android Chrome quirks: continuous sessions go dead after the first
  // utterance, and a parallel getUserMedia stream (our noise-suppression/
  // level-meter tap) can starve the recognizer of audio entirely. On Android
  // we run single-utterance sessions with auto-restart and skip the parallel
  // mic stream altogether.
  private isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent || '');
  private recRetries = 0;
  // Recognition liveness watchdog. Browsers (mobile Safari/Chrome especially)
  // sometimes kill a recognition session WITHOUT firing onend/onerror — after
  // a TTS handoff, a tab background, or an engine hang. From JS the session
  // still "looks" running (recRunning true), so startRec() no-ops forever and
  // the assistant sits on "מאזין" hearing nothing — the recurring
  // stuck-listening report. Every recognizer event stamps lastRecEvent; a
  // periodic check force-recycles the recognizer when it goes silent for too
  // long or died without telling us.
  private lastRecEvent = 0;
  private watchdogTimer = 0;
  private noiseStream: MediaStream | null = null;
  private noiseCtx: AudioContext | null = null;
  // Live mic level meter — a real AnalyserNode tap off the same mic stream,
  // read per-frame by the orb so the plasma core ripples to the user's actual
  // voice while listening. See preWarmMicNoise for why the analyser is safe.
  private micAnalyser: AnalyserNode | null = null;
  private micData: Uint8Array | null = null;
  private micLevel = 0;
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
      this.rec.continuous = !this.isAndroid; // Android: one utterance per session, auto-restarted in onend
      this.rec.interimResults = true;
      this.rec.maxAlternatives = 1;
      this.rec.onstart = () => { this.recRunning = true; this.lastRecEvent = Date.now(); };
      this.rec.onaudiostart = () => { this.lastRecEvent = Date.now(); };
      this.rec.onspeechstart = () => { this.lastRecEvent = Date.now(); };
      this.rec.onresult = (e: any) => {
        this.lastRecEvent = Date.now();
        if (this.suppress) return;
        this.errStreak = 0; // real audio is flowing
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
        if (interim && this.commandMode) { this.onStateChange('listening'); this.lastInterim = interim.trim(); }
        // Surface the live transcript (finalized-so-far + current interim) the
        // instant it's heard, so the user sees their words appear in real time
        // rather than waiting for the endpoint-silence flush.
        if (this.commandMode && this.onInterim) {
          const live = (this.speechBuffer + ' ' + interim).trim();
          if (live) this.onInterim(this.dedupe(live));
        }
        // Android wake-word: with finals possibly never arriving, "אלפא" must
        // also be caught in the interim stream, or armed mode never triggers.
        if (!this.commandMode && interim && this.hasWake(interim)) {
          this.enterCommandMode();
          this.lastInterim = interim.trim();
        }
        if (interim) this.resetSilenceTimer();
      };
      this.rec.onend = () => {
        this.lastRecEvent = Date.now();
        this.recRunning = false;
        this.recRetries = 0;
        if (this.commandMode && (this.speechBuffer.trim() || this.lastInterim)) {
          this.flushBuffer();
        }
        if (this.wakeOn && !this.suppress) {
          setTimeout(() => this.startRec(), 250);
        }
      };
      this.rec.onerror = (ev: any) => {
        this.lastRecEvent = Date.now();
        this.recRunning = false;
        if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
          this.wakeOn = false;
          this.onStateChange('');
          this.onMicBlocked?.();
        } else if (this.wakeOn && !this.suppress) {
          // Keep retrying on no-speech / audio-capture / network errors.
          // Cap the back-off at 3 s so the mic stays responsive.
          // 'no-speech' is normal silence, not a fault — everything else that
          // repeats with no result in between means the recognizer isn't
          // actually hearing/working: say so instead of spinning silently.
          if (ev.error !== 'no-speech' && ++this.errStreak === 3) this.onMicIssue?.(String(ev.error || 'unknown'));
          this.recRetries++;
          const delay = Math.min(500 * this.recRetries, 3000);
          setTimeout(() => this.startRec(), delay);
        }
      };
    }
    this.loadVoices();
    if ('speechSynthesis' in window) {
      speechSynthesis.onvoiceschanged = () => this.loadVoices();
    }
    // Mobile browsers kill recognition when the tab backgrounds, often with
    // no onend. Coming back to the foreground, restart immediately instead
    // of waiting for the watchdog tick.
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.wakeOn && !this.suppress && !this.recRunning) {
        this.startRec();
      }
    });
  }

  get supported() {
    return !!this.rec;
  }

  private startRec() {
    if (!this.rec || this.recRunning || !this.wakeOn) return;
    this.lastFinalIndex = 0;   // results list is per-session — reset the guard
    try {
      this.rec.start();
      this.recRunning = true;
      this.lastRecEvent = Date.now();
    } catch {
      // Usually InvalidStateError: a previous session is still (half-)alive
      // after a stop() whose onend never fired. Abort it hard and try once
      // more — otherwise the mic stays dead until a reload.
      try { this.rec.abort(); } catch {}
      this.recRunning = false;
      window.setTimeout(() => {
        if (!this.wakeOn || this.recRunning) return;
        try { this.rec.start(); this.recRunning = true; this.lastRecEvent = Date.now(); } catch {}
      }, 350);
    }
  }

  // Force-recycle a recognizer that died without firing onend/onerror (TTS
  // handoffs and tab backgrounding do this, mobile browsers especially) —
  // the "stuck on מאזין and hears nothing" failure. abort() is the only call
  // that reliably tears down a zombie session.
  private recycleRec() {
    try { this.rec.abort(); } catch {}
    this.recRunning = false;
    window.setTimeout(() => this.startRec(), 300);
  }

  private startWatchdog() {
    clearInterval(this.watchdogTimer);
    this.lastRecEvent = Date.now();
    this.watchdogTimer = window.setInterval(() => {
      if (!this.wakeOn || this.suppress) return;
      const silentFor = Date.now() - this.lastRecEvent;
      if (!this.recRunning && silentFor > 4000) {
        // Died and nothing rescheduled it (missed onend, swallowed start()).
        this.recycleRec();
      } else if (this.recRunning && silentFor > 25000) {
        // "Running" but the engine has produced zero events for 25s — even a
        // healthy idle session emits onend/no-speech cycles well within that.
        // Treat as a zombie and recycle; if a command was pending with no
        // speech captured, fall back to armed so the UI stops claiming to
        // listen through a dead mic.
        this.recycleRec();
        if (this.commandMode && !this.speechBuffer.trim() && !this.lastInterim) {
          this.commandMode = false;
          this.onStateChange('armed');
        }
      }
    }, 5000);
  }
  private stopRec() {
    if (!this.rec) return;
    try { this.rec.stop(); } catch {}
  }

  // Open the microphone with maximum noise-suppression constraints.
  // Chrome's APM applies these at the OS level so SpeechRecognition, which
  // opens the same hardware mic, inherits the cleaned-up signal.
  // We DO create an AudioContext here now, but ONLY for a terminal AnalyserNode
  // tap (mic source → analyser, and nothing after it). The hum/feedback trap is
  // routing the mic to the context's DESTINATION (even at gain=0) — an analyser
  // that isn't connected onward to destination produces no speaker output at
  // all, so it's safe. This is the standard VU-meter pattern.
  private async preWarmMicNoise() {
    if (this.noiseStream) return;
    if (!navigator.mediaDevices?.getUserMedia) return;
    try {
      this.noiseStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: { ideal: true },
          noiseSuppression: { ideal: true },
          autoGainControl: { ideal: true },
          channelCount: { ideal: 1 },
          sampleRate: { ideal: 16000 },
        }
      });
    } catch {}
    // Attach the level-meter analyser (best-effort — a failure here must never
    // break recognition, which is the mic's primary consumer).
    try {
      const AC = (window.AudioContext || (window as any).webkitAudioContext);
      if (AC && this.noiseStream && !this.micAnalyser) {
        this.noiseCtx = new AC();
        const src = this.noiseCtx.createMediaStreamSource(this.noiseStream);
        this.micAnalyser = this.noiseCtx.createAnalyser();
        this.micAnalyser.fftSize = 256;
        this.micAnalyser.smoothingTimeConstant = 0.6;
        this.micData = new Uint8Array(this.micAnalyser.frequencyBinCount);
        src.connect(this.micAnalyser); // terminal tap — NOT wired to destination
      }
    } catch {}
  }

  // 0..1 smoothed mic loudness for the orb's voice-reactive plasma core.
  // Returns 0 whenever the meter isn't live (not listening), so the orb falls
  // back to its own state-machine energy.
  getMicLevel(): number {
    if (!this.micAnalyser || !this.micData) return 0;
    try {
      this.micAnalyser.getByteFrequencyData(this.micData as Uint8Array<ArrayBuffer>);
      let sum = 0;
      for (let i = 0; i < this.micData.length; i++) sum += this.micData[i];
      const avg = sum / this.micData.length / 255;         // 0..1 average bin
      const lvl = Math.min(1, Math.max(0, (avg - 0.04) * 2.4)); // gate room noise, lift speech
      this.micLevel += (lvl - this.micLevel) * 0.5;          // extra visual smoothing
      return this.micLevel;
    } catch { return 0; }
  }

  private stopNoiseStream() {
    try { this.noiseStream?.getTracks().forEach(t => t.stop()); } catch {}
    this.noiseStream = null;
    try { this.noiseCtx?.close(); } catch {}
    this.noiseCtx = null;
    this.micAnalyser = null;
    this.micData = null;
    this.micLevel = 0;
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
        // Always clear the label — leaving it as-is kept a dead "מאזין" on
        // screen forever when wake was off (or the recognizer had died).
        this.onStateChange(this.wakeOn ? 'armed' : '');
      }
    }, 20000);
  }

  private resetSilenceTimer() {
    clearTimeout(this.silenceTimer);
    if (this.commandMode) {
      // Endpoint silence: how long to wait after the user stops before firing
      // the command. Was 2000ms, which added a full ~2s of dead air before the
      // transcript showed and the request even started — snappier at 900ms
      // while still tolerating a natural mid-sentence breath.
      this.silenceTimer = window.setTimeout(() => {
        if (this.speechBuffer.trim() || this.lastInterim) {
          this.flushBuffer();
        }
      }, 900);
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
    // Finals first; when Android never delivered one, the freshest interim IS
    // the user's sentence — send it rather than dropping their speech.
    let text = this.dedupe(this.speechBuffer.trim() || this.lastInterim);
    // An interim captured from armed mode still carries the wake word itself
    // ("אלפא מה השעה") — strip it so the command reads clean.
    if (text && this.hasWake(text)) text = this.stripWake(text) || text;
    this.speechBuffer = '';
    this.lastInterim = '';
    this.commandMode = false;
    clearTimeout(this.cmdTimer);
    clearTimeout(this.silenceTimer);
    if (text) {
      // Restart the session: interim-only engines (Android) deliver nothing
      // more on the old session anyway, and a fresh one re-arms cleanly via
      // onend → startRec.
      this.stopRec();
      this.onTranscript(text);
    } else if (this.wakeOn) {
      this.onStateChange('armed');
      this.stopRec(); // self-heal a stale session instead of "recording forever"
    } else {
      this.onStateChange('');
    }
  }

  private hasWake(t: string) {
    const s = t.toLowerCase();
    return (
      s.includes('alpha') || s.includes('alfa') || s.includes('elpha') ||
      s.includes('system') ||
      s.includes('אלפא') || s.includes('אלפה') || s.includes('סיסטם')
    );
  }
  private stripWake(raw: string) {
    return raw
      .replace(/(hey|hi|hello|ok|okay)?\s*(alpha|alfa|elpha|system)\b[\s,.:!?-]*/i, '')
      .replace(/(היי|הי|הליי|אלו)?\s*(אלפא|אלפה|סיסטם)[\s,.:!?-]*/, '')
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
      // Android: do NOT open a parallel getUserMedia stream — on many devices
      // it starves SpeechRecognition of audio entirely (mic looks on, hears
      // nothing). The orb's mic-level meter simply reads 0 there and falls
      // back to its state-machine energy.
      if (!this.isAndroid) this.preWarmMicNoise(); // engage noise suppression before recognition starts
      this.errStreak = 0;
      this.startRec();
      this.enterCommandMode();
      this.startWatchdog();
    } else {
      this.commandMode = false;
      this.speechBuffer = '';
      clearTimeout(this.cmdTimer);
      clearTimeout(this.silenceTimer);
      clearInterval(this.watchdogTimer);
      this.onStateChange('');
      this.stopRec();
      this.stopNoiseStream();
    }
  }

  private isFemaleVoice(name: string): boolean {
    const n = name.toLowerCase();
    return /female|woman|aria|jenny|jane|michelle|sonia|libby|samantha|zira|eva|joanna|amy|emma|salli|carmit|hila|lucia|elena|conchita|lupe|penelope|paulina|monica|tessa|karen|moira|fiona|veena|ioana|sara|laura|alice|amelie|anna|catarina|damayanti|kanya|kyoko|mei-jia|melina|milena|nora|o-ren|sin-ji|tian-tian|ting-ting|yuna|zosia/.test(n);
  }
  private isMaleVoice(name: string): boolean {
    const n = name.toLowerCase();
    return /\bmale\b|david|mark|guy|james|ryan|daniel|thomas|oliver|jorge|diego|enrique|rishi|alex|fred|junior|liam|avri|asaf/.test(n);
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
      // "Jarvis" lean: when gender isn't pinned to female, favor a deep,
      // composed British-English male voice — the closest an OS/browser
      // voice list gets to that assistant archetype without attempting to
      // clone anyone's actual voice (not possible via speechSynthesis, and
      // not something to do with a copyrighted character even if it were).
      if (gender !== 'female' && /daniel|george|arthur|ryan|oliver/.test(n)) s += 9;
      if (gender !== 'female' && v.lang === 'en-GB' && this.isMaleVoice(n)) s += 5;
    }
    if (L === 'he' && /carmit|hebrew/.test(n)) s += 4;
    // Avri/Hila are the free Microsoft Azure neural voices for Hebrew that
    // ship with Windows/Edge — noticeably more natural than the default
    // espeak-style fallback voices, so they're worth ranking above generic
    // "Hebrew" matches even without the premium/neural keywords in their name.
    if (L === 'he' && /avri|hila/.test(n)) s += 10;
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

  // Barge-in: cut off any in-progress speech immediately so the assistant stops
  // talking the moment the user acts (sends a message / turns on the mic).
  stopSpeaking() {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    this.suppress = false;
  }

  // TTS reads Markdown glyphs OUT LOUD — an LLM reply like "**חשוב**" gets
  // spoken as "כוכבית כוכבית חשוב". Strip everything that isn't meant for the
  // ear: markdown symbols, code fences, link syntax (keep the link text), and
  // emoji (engines read them by name — "פרצוף מחייך" mid-sentence).
  private cleanForSpeech(text: string): string {
    return text
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/`([^`]*)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/[*_~#>|•●▪◦]+/g, ' ')
      .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  // Build a configured utterance with the user's voice/rate/pitch/volume plus
  // the calm-professional prosody bias. Shared by speak() and beginSpeak().
  private makeUtterance(text: string): SpeechSynthesisUtterance {
    const u = new SpeechSynthesisUtterance(this.cleanForSpeech(text) || text);
    if (this.chosenVoice) { u.voice = this.chosenVoice; u.lang = this.chosenVoice.lang; }
    else u.lang = this.state.replyLang === 'he' ? 'he-IL' : this.state.replyLang === 'es' ? 'es-ES' : 'en-US';
    const cv = this.charVoice;
    // A small "calm, professional" prosody bias — a touch slower and a touch
    // lower-pitched reads as more authoritative and less synthesized (the
    // "Jarvis" cadence), layered on top of the user's own rate/pitch sliders
    // (and any character-voice override), never replacing them.
    const calmBias = this.state.replyLang === 'he' ? { rate: 0.95, pitch: 0.95 } : { rate: 0.97, pitch: 0.94 };
    u.rate = (this.state.voiceSpeed || 1.0) * (cv?.rate ?? 1) * calmBias.rate;
    u.pitch = Math.max(0, Math.min(2, (this.state.voicePitch != null ? this.state.voicePitch : 1.0) * (cv?.pitch ?? 1) * calmBias.pitch));
    u.volume = this.state.voiceVolume != null ? this.state.voiceVolume : 1.0;
    return u;
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
    const u = this.makeUtterance(text);
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

  // Streaming TTS: speak the reply sentence-by-sentence AS it's generated, so
  // the assistant is heard starting from its first sentence instead of only
  // after the whole response finishes. push() queues a chunk (native
  // SpeechSynthesis queuing plays them back-to-back); end() marks the reply
  // complete so the mic re-arms once the last chunk finishes. Mirrors speak()'s
  // suppress/stopRec/re-arm lifecycle exactly, just spread across N utterances.
  beginSpeak(): { push: (text: string) => void; end: () => void } {
    if (!this.state.voiceOn || !this.state.autoSpeak || !('speechSynthesis' in window)) {
      return { push: () => {}, end: () => { if (this.wakeOn) this.enterCommandMode(); else this.onStateChange(''); } };
    }
    speechSynthesis.cancel();
    if (!this.chosenVoice && this.voices.length === 0) this.loadVoices();
    let started = false, ended = false, pending = 0, spokenAny = false, finishedOnce = false;
    let guard = 0;
    const finish = () => {
      if (finishedOnce || !ended || pending > 0) return;
      finishedOnce = true;
      clearTimeout(guard);
      this.suppress = false;
      if (this.wakeOn) { setTimeout(() => this.startRec(), 250); this.enterCommandMode(); }
      else this.onStateChange('');
    };
    // Safety: never strand the mic suppressed if the engine drops an end event.
    guard = window.setTimeout(() => { ended = true; pending = 0; finish(); }, 45000);
    return {
      push: (text: string) => {
        const tx = (text || '').trim();
        if (!tx || finishedOnce) return;
        spokenAny = true; pending++;
        const u = this.makeUtterance(tx);
        u.onstart = () => { if (!started) { started = true; this.suppress = true; this.stopRec(); this.onStateChange('speaking'); } };
        u.onend = () => { pending--; finish(); };
        u.onerror = () => { pending--; finish(); };
        speechSynthesis.speak(u);
      },
      end: () => {
        ended = true;
        if (!spokenAny) { clearTimeout(guard); if (this.wakeOn) this.enterCommandMode(); else this.onStateChange(''); }
        else finish();
      },
    };
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
    // Match the same Hebrew calm-bias applied in speak() so a Voice Studio
    // preview sounds like what will actually play, not a different mix.
    const calmBias = this.state.replyLang === 'he' ? { rate: 0.95, pitch: 0.97 } : { rate: 1, pitch: 1 };
    u.rate = (opts?.rate != null ? opts.rate : (this.state.voiceSpeed || 1.0)) * calmBias.rate;
    u.pitch = (opts?.pitch != null ? opts.pitch : (this.state.voicePitch != null ? this.state.voicePitch : 1.0)) * calmBias.pitch;
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
