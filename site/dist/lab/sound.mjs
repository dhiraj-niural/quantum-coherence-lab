/** Original procedural interface sounds. Outcome tones encode parity, not state identity. */
export class LabSound {
  constructor() {
    this.muted = false;
    this._context = null;
    this._master = null;
    this._ambient = [];
    this._voices = new Set();
    this._starting = null;
    this._disposed = false;
    this._lastOutcome = -Infinity;
    this._lastCue = -Infinity;
  }

  /** Call from a user gesture. Unsupported or blocked audio leaves the lab silent. */
  async start() {
    if (this._disposed) return false;
    if (this._starting) return this._starting;
    this._starting = this._start();
    try {
      return await this._starting;
    } finally {
      this._starting = null;
    }
  }

  async _start() {
    try {
      if (!this._context) {
        const Context = globalThis.AudioContext || globalThis.webkitAudioContext;
        if (!Context) return false;
        const context = new Context();
        this._context = context;
        this._master = context.createGain();
        this._master.gain.value = 0;
        this._master.connect(context.destination);

        // A restrained room hum. These are fictional ambience, not quantum signals.
        for (const [frequency, level] of [[55, 0.012], [82.4, 0.007]]) {
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          oscillator.type = 'sine';
          oscillator.frequency.value = frequency;
          gain.gain.value = level;
          oscillator.connect(gain).connect(this._master);
          oscillator.start();
          this._ambient.push({ oscillator, gain });
        }
      }
      const context = this._context;
      if (context.state === 'suspended') await context.resume();
      if (this._disposed || context.state !== 'running') return false;
      this._setLevel(this.muted ? 0 : 0.22, 0.35);
      return true;
    } catch {
      // Keep the visual experiment usable when browser audio is unavailable.
      return false;
    }
  }

  _setLevel(level, duration) {
    if (!this._master || !this._context || this._context.state === 'closed') return;
    const parameter = this._master.gain;
    const now = this._context.currentTime;
    parameter.cancelScheduledValues(now);
    parameter.setValueAtTime(parameter.value, now);
    parameter.linearRampToValueAtTime(level, now + duration);
  }

  setMuted(muted) {
    this.muted = Boolean(muted);
    this._setLevel(this.muted ? 0 : 0.22, 0.06);
    if (this.muted) {
      // End transient tones so restoring sound cannot replay an old action.
      const now = this._context?.currentTime ?? 0;
      for (const voice of this._voices) {
        voice.gain.gain.cancelScheduledValues(now);
        voice.gain.gain.setValueAtTime(voice.gain.gain.value, now);
        voice.gain.gain.linearRampToValueAtTime(0, now + 0.025);
        try { voice.oscillator.stop(now + 0.03); } catch { /* Already ended. */ }
      }
    }
  }

  _canPlay() {
    return !this._disposed && !this.muted && this._context?.state === 'running';
  }

  _tone(frequency, endFrequency, duration, level = 0.07) {
    if (!this._canPlay() || this._voices.size >= 6) return;
    const context = this._context;
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const voice = { oscillator, gain };
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, now + duration);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(level, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    gain.gain.linearRampToValueAtTime(0, now + duration + 0.015);
    oscillator.connect(gain).connect(this._master);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
      this._voices.delete(voice);
    };
    this._voices.add(voice);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  }

  cue(kind) {
    if (!this._canPlay() || !['open', 'measure', 'reveal'].includes(kind)) return;
    const now = this._context.currentTime;
    if (now - this._lastCue < 0.09) return;
    this._lastCue = now;
    if (kind === 'open') this._tone(320, 440, 0.16, 0.07);
    if (kind === 'measure') this._tone(640, 480, 0.09, 0.06);
    if (kind === 'reveal') {
      for (const frequency of [330, 440, 550]) {
        this._tone(frequency, frequency, 0.42, 0.035);
      }
    }
  }

  /** 0 = even, 1 = odd; one mapping for every preparation and measurement setting. */
  outcome(parity) {
    if (!this._canPlay() || (parity !== 0 && parity !== 1)) return;
    const now = this._context.currentTime;
    // Fast batches stay visual; never queue hundreds of tones after a measurement.
    if (now - this._lastOutcome < 0.055) return;
    this._lastOutcome = now;
    const frequency = parity === 0 ? 440 : 660;
    this._tone(frequency, frequency, 0.095, 0.065);
  }

  dispose() {
    if (this._disposed) return Promise.resolve();
    this._disposed = true;
    for (const voice of this._voices) {
      try { voice.oscillator.stop(); } catch { /* Already ended. */ }
      voice.oscillator.disconnect();
      voice.gain.disconnect();
    }
    this._voices.clear();
    for (const voice of this._ambient) {
      try { voice.oscillator.stop(); } catch { /* Already ended. */ }
      voice.oscillator.disconnect();
      voice.gain.disconnect();
    }
    this._ambient = [];
    this._master?.disconnect();
    const context = this._context;
    if (context && context.state !== 'closed') return context.close().catch(() => {});
    return Promise.resolve();
  }
}
