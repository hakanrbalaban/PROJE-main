/* ============================================================
   NEON BRICK — Ses Sistemi (Web Audio API)
   Sentezlenmiş ses efektleri + basit arka plan ritmi
   ============================================================ */

'use strict';

class AudioManager {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.muted = Utils.storageGet('neonbrick_muted', false);
    this.musicOn = false;
    this._musicTimer = null;
    this._nextBeat = 0;
    this._beatIndex = 0;
  }

  /** AudioContext'i başlat (kullanıcı etkileşimi gerekli) */
  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }

    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;

    this.ctx = new AC();

    // Ana çıkış
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 1;
    this.master.connect(this.ctx.destination);

    // Müzik ve efekt ayrı kanallar
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.35;
    this.musicGain.connect(this.master);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.9;
    this.sfxGain.connect(this.master);
  }

  /** Sesi aç/kapat */
  toggleMute() {
    this.muted = !this.muted;
    Utils.storageSet('neonbrick_muted', this.muted);
    if (this.master) {
      this.master.gain.setTargetAtTime(this.muted ? 0 : 1, this.ctx.currentTime, 0.02);
    }
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  /* ==========================================================
     Temel ses üretim yardımcıları
     ========================================================== */

  /** Basit osilatör tonu */
  _tone(freq, duration, type = 'sine', volume = 0.5, slideTo = null, delay = 0) {
    if (!this.ctx || this.muted) return;

    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + duration);
    }

    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(volume, t0 + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  /** Gürültü patlaması (kırılma / patlama) */
  _noise(duration, volume = 0.4, filterFreq = 2000, delay = 0) {
    if (!this.ctx || this.muted) return;

    const t0 = this.ctx.currentTime + delay;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const src = this.ctx.createBufferSource();
    src.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    src.start(t0);
  }

  /* ==========================================================
     Oyun ses efektleri
     ========================================================== */

  /** Top raketle sekti */
  paddleHit() {
    this._tone(320, 0.08, 'square', 0.25, 420);
  }

  /** Top duvara sekti */
  wallHit() {
    this._tone(220, 0.05, 'triangle', 0.15, 180);
  }

  /** Tuğla kırıldı (dayanıklılığa göre farklı ton) */
  brickHit(hp) {
    const base = 500 + (3 - hp) * 120;
    this._tone(base, 0.1, 'square', 0.3, base * 1.4);
    this._noise(0.06, 0.2, 3000);
  }

  /** Tuğla tamamen kırıldı */
  brickBreak(hp) {
    const base = 400 + (3 - hp) * 150;
    this._tone(base, 0.15, 'sawtooth', 0.35, base * 1.8);
    this._noise(0.12, 0.35, 2500);
  }

  /** Can kaybı */
  lifeLost() {
    this._tone(300, 0.4, 'sawtooth', 0.4, 80);
    this._noise(0.3, 0.3, 800);
  }

  /** Güçlendirme toplandı */
  powerUp() {
    this._tone(523, 0.12, 'sine', 0.35);
    this._tone(659, 0.12, 'sine', 0.35, null, 0.08);
    this._tone(784, 0.2, 'sine', 0.35, null, 0.16);
  }

  /** Seviye tamamlandı */
  levelComplete() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((f, i) => {
      this._tone(f, 0.18, 'triangle', 0.4, null, i * 0.12);
    });
  }

  /** Oyun bitti */
  gameOver() {
    const notes = [392, 330, 262, 196];
    notes.forEach((f, i) => {
      this._tone(f, 0.3, 'sawtooth', 0.3, f * 0.8, i * 0.18);
    });
  }

  /** Kombo artışı */
  combo(level) {
    const f = 600 + level * 80;
    this._tone(f, 0.08, 'square', 0.2, f * 1.3);
  }

  /** Top fırlatma */
  launch() {
    this._tone(200, 0.15, 'sine', 0.3, 500);
  }

  /* ==========================================================
     Arka plan müziği (basit synthwave ritmi)
     ========================================================== */

  startMusic() {
    if (!this.ctx || this.musicOn) return;
    this.musicOn = true;
    this._beatIndex = 0;
    this._nextBeat = this.ctx.currentTime + 0.1;
    this._scheduleLoop();
  }

  stopMusic() {
    this.musicOn = false;
    if (this._musicTimer) {
      clearTimeout(this._musicTimer);
      this._musicTimer = null;
    }
  }

  _scheduleLoop() {
    if (!this.musicOn || !this.ctx) return;

    const bpm = 112;
    const beatDur = 60 / bpm;
    const lookahead = 0.2;

    while (this._nextBeat < this.ctx.currentTime + lookahead) {
      this._playBeat(this._beatIndex, this._nextBeat);
      this._beatIndex = (this._beatIndex + 1) % 16;
      this._nextBeat += beatDur;
    }

    this._musicTimer = setTimeout(() => this._scheduleLoop(), 50);
  }

  _playBeat(index, time) {
    if (!this.ctx || this.muted) return;

    // Bas davul (her 4'lük)
    if (index % 4 === 0) {
      this._musicKick(time);
    }

    // Hi-hat (her 8'lik)
    if (index % 2 === 0) {
      this._musicHat(time);
    }

    // Bas çizgisi (A minor arpej)
    const bassNotes = [55, 55, 65.4, 55, 49, 49, 65.4, 49, 55, 55, 65.4, 55, 73.4, 73.4, 65.4, 49];
    const freq = bassNotes[index];
    this._musicBass(freq, time);
  }

  _musicKick(time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.12);

    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + 0.2);
  }

  _musicHat(time) {
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.04);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const src = this.ctx.createBufferSource();
    src.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 6000;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    src.start(time);
  }

  _musicBass(freq, time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.value = freq;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.18, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + 0.45);
  }
}

// Global erişim
window.AudioManager = AudioManager;