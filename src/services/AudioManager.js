class AudioManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  setEnabled(value) {
    this.enabled = Boolean(value);
  }

  _getContext() {
    if (!this.enabled || typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  _tone(freq, duration, { type = 'sine', gain = 0.14, delay = 0, endFreq = null } = {}) {
    const ctx = this._getContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), now + duration);
    }

    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.exponentialRampToValueAtTime(gain, now + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(amp);
    amp.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playClick() {
    this._tone(520, 0.055, { type: 'triangle', gain: 0.1, endFreq: 660 });
  }

  playCorrect() {
    this._tone(523.25, 0.09, { type: 'sine', gain: 0.14, delay: 0 });
    this._tone(659.25, 0.14, { type: 'sine', gain: 0.15, delay: 0.065 });
  }

  playWrong() {
    this._tone(210, 0.12, { type: 'sawtooth', gain: 0.09, delay: 0, endFreq: 155 });
    this._tone(160, 0.16, { type: 'triangle', gain: 0.11, delay: 0.08, endFreq: 115 });
  }

  playHint() {
    this._tone(783.99, 0.09, { type: 'sine', gain: 0.12, delay: 0 });
    this._tone(1174.66, 0.18, { type: 'triangle', gain: 0.13, delay: 0.07 });
  }

  playCombo(streak = 5) {
    const boost = streak >= 10 ? 1.12 : 1;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this._tone(n * boost, 0.14, {
        type: 'triangle',
        gain: 0.13,
        delay: idx * 0.06,
      });
    });
  }

  playStageClear() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this._tone(n, 0.18, {
        type: 'sine',
        gain: 0.14,
        delay: idx * 0.075,
      });
    });
  }

  playWin() {
    const notes = [
      { f: 523.25, d: 0.12, t: 0 },
      { f: 659.25, d: 0.12, t: 0.1 },
      { f: 783.99, d: 0.12, t: 0.2 },
      { f: 1046.5, d: 0.35, t: 0.32 },
      { f: 783.99, d: 0.12, t: 0.48 },
      { f: 1046.5, d: 0.45, t: 0.6 },
    ];
    notes.forEach((n) => {
      this._tone(n.f, n.d, { type: 'triangle', gain: 0.15, delay: n.t });
    });
  }

  playGameOver() {
    this._tone(349.23, 0.18, { type: 'triangle', gain: 0.13, delay: 0 });
    this._tone(311.13, 0.18, { type: 'triangle', gain: 0.13, delay: 0.17 });
    this._tone(261.63, 0.34, { type: 'sine', gain: 0.14, delay: 0.34 });
  }
}

export const audioManager = new AudioManager();
export default audioManager;
