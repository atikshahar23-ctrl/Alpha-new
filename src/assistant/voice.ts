import type { AppState } from './state';

type SpeechRecognitionCtor = any;

export class VoiceEngine {
  private rec: any = null;
  private recRunning = false;
  private suppress = false;
  private commandMode = false;
  private cmdTimer: number | undefined;
  private finalBuffer = '';
  private sendTimer: number | undefined;
  private voices: SpeechSynthesisVoice[] = [];
  private chosenVoice: SpeechSynthesisVoice | null = null;
  private state: AppState;
  private onTranscript: (text: string) => void;
  private onStateChange: (s: 'armed' | 'listening' | 'thinking' | 'speaking' | '') => void;
  wakeOn = false;

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
      this.rec.lang = state.micLang === 'he' ? 'he-IL' : 'en-US';
      this.rec.continuous = true;
      this.rec.interimResults = true;
      this.rec.maxAlternatives = 1;
      this.rec.onresult = (e: any) => {
        if (this.suppress) return;
        let final = '';
        let interim = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) final += e.results[i][0].transcript + ' ';
          else interim += e.results[i][0].transcript;
        }
        if (interim && this.commandMode) this.onStateChange('listening');
        if (final) this.handleSpeech(final);
      };
      this.rec.onend = () => {
        this.recRunning = false;
        if (this.wakeOn && !this.suppress) {
          setTimeout(() => this.startRec(), 250);
        }
      };
      this.rec.onerror = (ev: any) => {
        this.recRunning = false;
        if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
          this.wakeOn = false;
          this.onStateChange('');
        } else if (this.wakeOn && !this.suppress) {
          setTimeout(() => this.startRec(), 500);
        }
      };
    }
    this.loadVoices();
    speechSynthesis.onvoiceschanged = () => this.loadVoices();
  }

  get supported() {
    return !!this.rec;
  }

  private startRec() {
    if (!this.rec || this.recRunning || !this.wakeOn) return;
    try { this.rec.start(); this.recRunning = true; } catch {}
  }
  private stopRec() {
    if (!this.rec) return;
    try { this.rec.stop(); } catch {}
  }
  private listenNow() {
    this.commandMode = true;
    this.onStateChange('listening');
    clearTimeout(this.cmdTimer);
    this.cmdTimer = window.setTimeout(() => {
      this.commandMode = false;
      if (this.wakeOn) this.onStateChange('armed');
    }, 15000);
  }
  private hasWake(t: string) {
    const s = t.toLowerCase();
    return (
      s.includes('alpha') || s.includes('alfa') || s.includes('elpha') ||
      t.includes('אלפא') || t.includes('אלפה')
    );
  }
  private stripWake(raw: string) {
    return raw
      .replace(/(hey|hi|hello|ok|okay)?\s*(alpha|alfa|elpha)\b[\s,.:!?-]*/i, '')
      .replace(/(היי|הי|הליי|אלו)?\s*(אלפא|אלפה)[\s,.:!?-]*/, '')
      .replace(/^[\s,.:!?-]+/, '')
      .trim();
  }
  private flushBuffer() {
    const text = this.finalBuffer.trim();
    this.finalBuffer = '';
    clearTimeout(this.sendTimer);
    if (!text) return;
    this.commandMode = false;
    clearTimeout(this.cmdTimer);
    this.onTranscript(text);
  }

  private handleSpeech(final: string) {
    const raw = final.trim();
    if (!raw) return;
    if (this.commandMode) {
      this.finalBuffer += ' ' + raw;
      clearTimeout(this.sendTimer);
      clearTimeout(this.cmdTimer);
      this.cmdTimer = window.setTimeout(() => {
        this.commandMode = false;
        if (this.wakeOn) this.onStateChange('armed');
      }, 15000);
      this.sendTimer = window.setTimeout(() => this.flushBuffer(), 1500);
      return;
    }
    if (this.hasWake(raw)) {
      const cmd = this.stripWake(raw);
      if (cmd.length > 1) {
        this.finalBuffer = cmd;
        clearTimeout(this.sendTimer);
        this.sendTimer = window.setTimeout(() => this.flushBuffer(), 1500);
      } else {
        this.listenNow();
      }
    }
  }

  setWake(on: boolean) {
    if (on && !this.rec) return;
    this.wakeOn = on;
    this.state.wakeOn = on;
    if (on) { this.startRec(); this.listenNow(); }
    else { this.commandMode = false; clearTimeout(this.cmdTimer); this.onStateChange(''); this.stopRec(); }
  }

  private scoreVoice(v: SpeechSynthesisVoice) {
    let s = 0;
    const n = v.name.toLowerCase();
    const L = this.state.replyLang;
    if (!v.lang.toLowerCase().startsWith(L)) return -1;
    if (/natural|neural|online|enhanced|premium/.test(n)) s += 6;
    if (L === 'en' && /aria|jenny|jane|michelle|sonia|libby|samantha|female|zira|eva|joanna|amy|emma|salli/.test(n)) s += 5;
    if (L === 'he' && /carmit|hebrew|female/.test(n)) s += 5;
    if (/male|david|mark|guy|james|ryan/.test(n)) s -= 4;
    if (L === 'en') { if (v.lang === 'en-US') s += 2; else if (v.lang === 'en-GB') s += 1; }
    if (/google/.test(n)) s += 1;
    return s;
  }
  private langVoices() {
    return this.voices
      .filter(v => v.lang.toLowerCase().startsWith(this.state.replyLang))
      .sort((a, b) => this.scoreVoice(b) - this.scoreVoice(a));
  }
  loadVoices() {
    this.voices = speechSynthesis.getVoices();
    const saved = localStorage.getItem('alpha_voice_' + this.state.replyLang);
    const list = this.langVoices();
    this.chosenVoice = (saved && this.voices.find(v => v.name === saved)) || list[0] || this.voices[0] || null;
  }
  availableVoices() {
    return this.langVoices();
  }
  setVoice(name: string) {
    localStorage.setItem('alpha_voice_' + this.state.replyLang, name);
    this.chosenVoice = this.voices.find(v => v.name === name) || this.chosenVoice;
  }

  speak(text: string) {
    if (!this.state.voiceOn || !('speechSynthesis' in window)) {
      this.onStateChange(this.wakeOn ? 'armed' : '');
      return;
    }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (this.chosenVoice) { u.voice = this.chosenVoice; u.lang = this.chosenVoice.lang; }
    else u.lang = this.state.replyLang === 'he' ? 'he-IL' : 'en-US';
    u.rate = this.state.replyLang === 'he' ? 0.98 : 0.97;
    u.pitch = 1.05;
    u.onstart = () => { this.suppress = true; this.stopRec(); this.onStateChange('speaking'); };
    const done = () => {
      this.suppress = false;
      if (this.wakeOn) { this.onStateChange('armed'); setTimeout(() => this.startRec(), 250); }
      else this.onStateChange('');
    };
    u.onend = done;
    u.onerror = done;
    speechSynthesis.speak(u);
  }

  setMicLang(lang: 'he' | 'en') {
    if (this.rec) this.rec.lang = lang === 'he' ? 'he-IL' : 'en-US';
  }
}
