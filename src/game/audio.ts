/**
 * Super Mario Bros Web Audio Chiptune Synthesizer
 * Authentic multi-channel NES synthesis: Pulse Lead + Triangle Bass + Noise Percussion.
 * Ultra-precise hardware clock scheduling (no tempo drift).
 */

// Note Frequencies (Hz)
const n = {
  // Octave 2 & 3 (Bass)
  C2: 65.41,
  D2: 73.42,
  Ds2: 77.78,
  Eb2: 77.78,
  E2: 82.41,
  F2: 87.31,
  Fs2: 92.5,
  G2: 98.0,
  Ab2: 103.83,
  A2: 110.0,
  Bb2: 116.54,
  B2: 123.47,

  C3: 130.81,
  Cs3: 138.59,
  D3: 146.83,
  Ds3: 155.56,
  Eb3: 155.56,
  E3: 164.81,
  F3: 174.61,
  Fs3: 185.0,
  G3: 196.0,
  Ab3: 207.65,
  A3: 220.0,
  Bb3: 233.08,
  B3: 246.94,

  // Octave 4 & 5 (Lead & Harmony)
  C4: 261.63,
  Cs4: 277.18,
  D4: 293.66,
  Ds4: 311.13,
  E4: 329.63,
  F4: 349.23,
  Fs4: 369.99,
  G4: 392.0,
  Gs4: 415.3,
  A4: 440.0,
  Bb4: 466.16,
  B4: 493.88,

  C5: 523.25,
  Cs5: 554.37,
  D5: 587.33,
  Ds5: 622.25,
  E5: 659.25,
  F5: 698.46,
  Fs5: 739.99,
  G5: 783.99,
  Gs5: 830.61,
  A5: 880.0,
  Bb5: 932.33,
  B5: 987.77,

  C6: 1046.5,
  D6: 1174.66,
  E6: 1318.51,
  G6: 1567.98,
  _: 0, // Rest
};

interface NoteStep {
  lead: number; // Frequency in Hz (0 = rest)
  bass: number; // Frequency in Hz (0 = rest)
  hat?: boolean; // Subtle 8-bit noise tick
  snare?: boolean; // 8-bit noise snare
}

// 1. THE COMPLETE AUTHENTIC SUPER MARIO BROS OVERWORLD THEME
// Measured in sixteenth notes (16th note steps @ 100 BPM = 0.075s per step)
const OVERWORLD_STEPS: NoteStep[] = [
  // --- INTRO (Bars 1-2) ---
  { lead: n.E5, bass: n.D3, hat: true },
  { lead: n.E5, bass: n.D3 },
  { lead: n._, bass: n._ },
  { lead: n.E5, bass: n.D3, hat: true },
  { lead: n._, bass: n._ },
  { lead: n.C5, bass: n.D3 },
  { lead: n.E5, bass: n.D3, hat: true },
  { lead: n._, bass: n._ },

  { lead: n.G5, bass: n.G3, snare: true },
  { lead: n._, bass: n._ },
  { lead: n._, bass: n._ },
  { lead: n._, bass: n._ },
  { lead: n.G4, bass: n.G2, snare: true },
  { lead: n._, bass: n._ },
  { lead: n._, bass: n._ },
  { lead: n._, bass: n._ },

  // --- SECTION A (Bars 3-6) ---
  { lead: n.C5, bass: n.G3, hat: true },
  { lead: n._, bass: n._ },
  { lead: n._, bass: n.C3 },
  { lead: n.G4, bass: n._, snare: true },
  { lead: n._, bass: n._ },
  { lead: n._, bass: n.E3 },
  { lead: n.E4, bass: n._, hat: true },
  { lead: n._, bass: n._ },

  { lead: n._, bass: n.G3 },
  { lead: n.A4, bass: n._, snare: true },
  { lead: n._, bass: n.C3 },
  { lead: n.B4, bass: n._ },
  { lead: n._, bass: n.E3, hat: true },
  { lead: n.Bb4, bass: n.A2 },
  { lead: n.A4, bass: n._, snare: true },
  { lead: n._, bass: n._ },

  { lead: n.G4, bass: n.G3, hat: true },
  { lead: n.E5, bass: n.C3 },
  { lead: n._, bass: n._ },
  { lead: n.G5, bass: n.E3, snare: true },
  { lead: n.A5, bass: n.F3 },
  { lead: n._, bass: n.C3 },
  { lead: n.F5, bass: n.F3, hat: true },
  { lead: n.G5, bass: n._ },

  { lead: n._, bass: n.E3, snare: true },
  { lead: n.E5, bass: n._ },
  { lead: n._, bass: n.C3 },
  { lead: n.C5, bass: n.G3, hat: true },
  { lead: n.D5, bass: n.D3 },
  { lead: n.B4, bass: n.G2, snare: true },
  { lead: n._, bass: n._ },
  { lead: n._, bass: n._ },

  // --- REPEAT SECTION A (Bars 7-10) ---
  { lead: n.C5, bass: n.G3, hat: true },
  { lead: n._, bass: n._ },
  { lead: n._, bass: n.C3 },
  { lead: n.G4, bass: n._, snare: true },
  { lead: n._, bass: n._ },
  { lead: n._, bass: n.E3 },
  { lead: n.E4, bass: n._, hat: true },
  { lead: n._, bass: n._ },

  { lead: n._, bass: n.G3 },
  { lead: n.A4, bass: n._, snare: true },
  { lead: n._, bass: n.C3 },
  { lead: n.B4, bass: n._ },
  { lead: n._, bass: n.E3, hat: true },
  { lead: n.Bb4, bass: n.A2 },
  { lead: n.A4, bass: n._, snare: true },
  { lead: n._, bass: n._ },

  { lead: n.G4, bass: n.G3, hat: true },
  { lead: n.E5, bass: n.C3 },
  { lead: n._, bass: n._ },
  { lead: n.G5, bass: n.E3, snare: true },
  { lead: n.A5, bass: n.F3 },
  { lead: n._, bass: n.C3 },
  { lead: n.F5, bass: n.F3, hat: true },
  { lead: n.G5, bass: n._ },

  { lead: n._, bass: n.E3, snare: true },
  { lead: n.E5, bass: n._ },
  { lead: n._, bass: n.C3 },
  { lead: n.C5, bass: n.G3, hat: true },
  { lead: n.D5, bass: n.D3 },
  { lead: n.B4, bass: n.G2, snare: true },
  { lead: n._, bass: n._ },
  { lead: n._, bass: n._ },

  // --- SECTION B (The iconic descending run, Bars 11-14) ---
  { lead: n._, bass: n.C3, hat: true },
  { lead: n._, bass: n.G3 },
  { lead: n.G5, bass: n._ },
  { lead: n.Fs5, bass: n.C4, snare: true },
  { lead: n.F5, bass: n._ },
  { lead: n.Ds5, bass: n.A3 },
  { lead: n._, bass: n._, hat: true },
  { lead: n.E5, bass: n.E3 },

  { lead: n._, bass: n._, snare: true },
  { lead: n.Gs4, bass: n.Ab3 },
  { lead: n.A4, bass: n.A3 },
  { lead: n.C5, bass: n._ },
  { lead: n._, bass: n.C4, hat: true },
  { lead: n.A4, bass: n.D3 },
  { lead: n.C5, bass: n.F3, snare: true },
  { lead: n.D5, bass: n.A3 },

  { lead: n._, bass: n.C3, hat: true },
  { lead: n._, bass: n.G3 },
  { lead: n.G5, bass: n._ },
  { lead: n.Fs5, bass: n.C4, snare: true },
  { lead: n.F5, bass: n._ },
  { lead: n.Ds5, bass: n.A3 },
  { lead: n._, bass: n._, hat: true },
  { lead: n.E5, bass: n.E3 },

  { lead: n._, bass: n.G3, snare: true },
  { lead: n.C6, bass: n.C4 },
  { lead: n._, bass: n._ },
  { lead: n.C6, bass: n.G3 },
  { lead: n.C6, bass: n.C3, hat: true },
  { lead: n._, bass: n._, snare: true },
  { lead: n._, bass: n._ },
  { lead: n._, bass: n._ },

  // --- REPEAT SECTION B VARIANT (Bars 15-18) ---
  { lead: n._, bass: n.C3, hat: true },
  { lead: n._, bass: n.G3 },
  { lead: n.G5, bass: n._ },
  { lead: n.Fs5, bass: n.C4, snare: true },
  { lead: n.F5, bass: n._ },
  { lead: n.Ds5, bass: n.A3 },
  { lead: n._, bass: n._, hat: true },
  { lead: n.E5, bass: n.E3 },

  { lead: n._, bass: n._, snare: true },
  { lead: n.Gs4, bass: n.Ab3 },
  { lead: n.A4, bass: n.A3 },
  { lead: n.C5, bass: n._ },
  { lead: n._, bass: n.C4, hat: true },
  { lead: n.A4, bass: n.D3 },
  { lead: n.C5, bass: n.F3, snare: true },
  { lead: n.D5, bass: n.A3 },

  { lead: n._, bass: n.C3, hat: true },
  { lead: n._, bass: n.Ab3 },
  { lead: n.Ds5, bass: n.Eb3 },
  { lead: n._, bass: n._, snare: true },
  { lead: n._, bass: n.Bb3 },
  { lead: n.D5, bass: n.D3 },
  { lead: n._, bass: n._, hat: true },
  { lead: n._, bass: n.G3 },

  { lead: n.C5, bass: n.C3, snare: true },
  { lead: n._, bass: n.G3 },
  { lead: n._, bass: n.C3 },
  { lead: n._, bass: n.E3 },
  { lead: n._, bass: n.G3, hat: true },
  { lead: n._, bass: n.C4, snare: true },
  { lead: n._, bass: n._ },
  { lead: n._, bass: n._ },

  // --- SECTION C (Celebratory Bridge, Bars 19-22) ---
  { lead: n.C5, bass: n.Ab3, hat: true },
  { lead: n.C5, bass: n._ },
  { lead: n._, bass: n.Eb3 },
  { lead: n.C5, bass: n.Ab3, snare: true },
  { lead: n._, bass: n._ },
  { lead: n.C5, bass: n.Eb3 },
  { lead: n.D5, bass: n.Ab3, hat: true },
  { lead: n._, bass: n._ },

  { lead: n.E5, bass: n.C3, snare: true },
  { lead: n.C5, bass: n.G3 },
  { lead: n._, bass: n.E3 },
  { lead: n.A4, bass: n.C4 },
  { lead: n.G4, bass: n.G3, hat: true },
  { lead: n._, bass: n._, snare: true },
  { lead: n._, bass: n._ },
  { lead: n._, bass: n._ },

  { lead: n.C5, bass: n.Ab3, hat: true },
  { lead: n.C5, bass: n._ },
  { lead: n._, bass: n.Eb3 },
  { lead: n.C5, bass: n.Ab3, snare: true },
  { lead: n._, bass: n._ },
  { lead: n.C5, bass: n.Eb3 },
  { lead: n.D5, bass: n.Ab3, hat: true },
  { lead: n.E5, bass: n._ },

  { lead: n._, bass: n.G3, snare: true },
  { lead: n._, bass: n.D3 },
  { lead: n._, bass: n.G2 },
  { lead: n._, bass: n.B2 },
  { lead: n._, bass: n.D3, hat: true },
  { lead: n._, bass: n.F3, snare: true },
  { lead: n._, bass: n._ },
  { lead: n._, bass: n._ },

  // --- FINALE OF SECTION C (Bars 23-26) ---
  { lead: n.C5, bass: n.Ab3, hat: true },
  { lead: n.C5, bass: n._ },
  { lead: n._, bass: n.Eb3 },
  { lead: n.C5, bass: n.Ab3, snare: true },
  { lead: n._, bass: n._ },
  { lead: n.C5, bass: n.Eb3 },
  { lead: n.D5, bass: n.Ab3, hat: true },
  { lead: n._, bass: n._ },

  { lead: n.E5, bass: n.C3, snare: true },
  { lead: n.C5, bass: n.G3 },
  { lead: n._, bass: n.E3 },
  { lead: n.A4, bass: n.C4 },
  { lead: n.G4, bass: n.G3, hat: true },
  { lead: n._, bass: n._, snare: true },
  { lead: n._, bass: n._ },
  { lead: n._, bass: n._ },

  { lead: n.E5, bass: n.D3, hat: true },
  { lead: n.E5, bass: n.D3 },
  { lead: n._, bass: n._ },
  { lead: n.E5, bass: n.D3, hat: true },
  { lead: n._, bass: n._ },
  { lead: n.C5, bass: n.D3 },
  { lead: n.E5, bass: n.D3, hat: true },
  { lead: n._, bass: n._ },

  { lead: n.G5, bass: n.G3, snare: true },
  { lead: n._, bass: n._ },
  { lead: n._, bass: n._ },
  { lead: n._, bass: n._ },
  { lead: n.G4, bass: n.G2, snare: true },
  { lead: n._, bass: n._ },
  { lead: n._, bass: n._ },
  { lead: n._, bass: n._ },
];

// 2. THE UNDERGROUND THEME (Mundo 1-2)
const UNDERGROUND_STEPS: NoteStep[] = [
  { lead: n.C4, bass: n.C3 },
  { lead: n.C5, bass: n.C4 },
  { lead: n.A3, bass: n.A2 },
  { lead: n.A4, bass: n.A3 },
  { lead: n.Bb3, bass: n.Bb2 },
  { lead: n.Bb4, bass: n.Bb3 },
  { lead: n._, bass: n._ },
  { lead: n._, bass: n._ },

  { lead: n.C4, bass: n.C3 },
  { lead: n.C5, bass: n.C4 },
  { lead: n.A3, bass: n.A2 },
  { lead: n.A4, bass: n.A3 },
  { lead: n.Bb3, bass: n.Bb2 },
  { lead: n.Bb4, bass: n.Bb3 },
  { lead: n._, bass: n._ },
  { lead: n._, bass: n._ },

  { lead: n.F3, bass: n.F2 },
  { lead: n.F4, bass: n.F3 },
  { lead: n.D3, bass: n.D2 },
  { lead: n.D4, bass: n.D3 },
  { lead: n.Ds3, bass: n.Ds2 },
  { lead: n.Ds4, bass: n.Ds3 },
  { lead: n._, bass: n._ },
  { lead: n._, bass: n._ },

  { lead: n.F3, bass: n.F2 },
  { lead: n.F4, bass: n.F3 },
  { lead: n.D3, bass: n.D2 },
  { lead: n.D4, bass: n.D3 },
  { lead: n.Ds3, bass: n.Ds2 },
  { lead: n.Ds4, bass: n.Ds3 },
  { lead: n._, bass: n._ },
  { lead: n._, bass: n._ },
];

// 3. THE STARMAN / INVINCIBLE THEME
const STAR_STEPS: NoteStep[] = [
  { lead: n.C5, bass: n.C3, hat: true },
  { lead: n.C5, bass: n.G3 },
  { lead: n.C5, bass: n.C3, snare: true },
  { lead: n._, bass: n.G3 },
  { lead: n.C5, bass: n.C3, hat: true },
  { lead: n.C5, bass: n.G3 },
  { lead: n.C5, bass: n.C3, snare: true },
  { lead: n._, bass: n.G3 },

  { lead: n.D5, bass: n.D3, hat: true },
  { lead: n.D5, bass: n.A3 },
  { lead: n.D5, bass: n.D3, snare: true },
  { lead: n._, bass: n.A3 },
  { lead: n.D5, bass: n.D3, hat: true },
  { lead: n.D5, bass: n.A3 },
  { lead: n.D5, bass: n.D3, snare: true },
  { lead: n._, bass: n.A3 },

  { lead: n.E5, bass: n.E3, hat: true },
  { lead: n.E5, bass: n.B3 },
  { lead: n.E5, bass: n.E3, snare: true },
  { lead: n._, bass: n.B3 },
  { lead: n.E5, bass: n.E3, hat: true },
  { lead: n.E5, bass: n.B3 },
  { lead: n.E5, bass: n.E3, snare: true },
  { lead: n._, bass: n.B3 },

  { lead: n.F5, bass: n.F3, hat: true },
  { lead: n.F5, bass: n.C4 },
  { lead: n.F5, bass: n.F3, snare: true },
  { lead: n._, bass: n.C4 },
  { lead: n.G5, bass: n.G3, hat: true },
  { lead: n.G5, bass: n.D4 },
  { lead: n.G5, bass: n.G3, snare: true },
  { lead: n._, bass: n.D4 },
];

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;

  // Clock scheduling engine for zero-jitter, continuous chiptune playback
  private activeTrack: 'overworld' | 'underground' | 'star' | null = null;
  private schedulerInterval: number | null = null;
  private currentStepIndex: number = 0;
  private nextStepTime: number = 0;
  private readonly stepDuration = 0.08; // Sixteenth note duration in seconds (~100 BPM)

  constructor() {
    // Audio context will be lazy-initialized upon user gesture
  }

  public initContext() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.28;
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.20;
      this.musicGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public unlockAudio() {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.28, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public toggleMusic(): boolean {
    this.musicMuted = !this.musicMuted;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicMuted ? 0 : 0.20, this.ctx.currentTime);
    }
    return this.musicMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getIsMusicMuted(): boolean {
    return this.musicMuted;
  }

  // --- Sound Effects ---

  public playJumpSmall() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(380, t + 0.12);

    gain.gain.setValueAtTime(0.24, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  public playJumpSuper() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(190, t);
    osc.frequency.exponentialRampToValueAtTime(560, t + 0.18);

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(t);
    osc.stop(t + 0.19);
  }

  public playCoin() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'square';
    osc2.type = 'square';

    osc1.frequency.setValueAtTime(987.77, t); // B5
    osc1.frequency.setValueAtTime(1318.51, t + 0.08); // E6

    osc2.frequency.setValueAtTime(1975.53, t); // B6
    osc2.frequency.setValueAtTime(2637.02, t + 0.08); // E7

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.setValueAtTime(0.22, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain!);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.36);
    osc2.stop(t + 0.36);
  }

  public playPowerUpAppear() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const notes = [330, 392, 659, 523, 587, 784];
    const step = 0.06;

    notes.forEach((freq, i) => {
      osc.frequency.setValueAtTime(freq, t + i * step);
    });

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + notes.length * step);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(t);
    osc.stop(t + notes.length * step + 0.01);
  }

  public playPowerUp() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const notes = [
      330, 392, 659, 523, 587, 784, 659, 784, 987, 784, 987, 1318,
    ];
    const step = 0.045;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    notes.forEach((freq, i) => {
      osc.frequency.setValueAtTime(freq, t + i * step);
    });

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + notes.length * step);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(t);
    osc.stop(t + notes.length * step + 0.02);
  }

  public playPowerDown() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const notes = [784, 740, 698, 659, 622, 587, 554, 523, 494, 466, 440];
    const step = 0.04;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    notes.forEach((freq, i) => {
      osc.frequency.setValueAtTime(freq, t + i * step);
    });

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + notes.length * step);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(t);
    osc.stop(t + notes.length * step + 0.01);
  }

  public playStomp() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.1);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(t);
    osc.stop(t + 0.11);
  }

  public playKick() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.12);

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  public playBump() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.07);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.07);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  public playBreakBlock() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.14);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, t);
    filter.frequency.exponentialRampToValueAtTime(100, t + 0.14);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    whiteNoise.start(t);
  }

  public playPipe() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const freqs = [180, 140, 110, 90];
    const step = 0.08;
    freqs.forEach((f, i) => {
      osc.frequency.setValueAtTime(f, t + i * step);
    });

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + freqs.length * step);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(t);
    osc.stop(t + freqs.length * step + 0.02);
  }

  public playFireball() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.09);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  public playFlagpole() {
    this.stopMusic();
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.linearRampToValueAtTime(200, t + 1.2);

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.setValueAtTime(0.28, t + 1.1);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 1.25);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(t);
    osc.stop(t + 1.26);
  }

  public playStageClear() {
    this.stopMusic();
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const notes = [
      { f: 523.25, d: 0.12 }, // C5
      { f: 659.25, d: 0.12 }, // E5
      { f: 783.99, d: 0.12 }, // G5
      { f: 1046.5, d: 0.16 }, // C6
      { f: 783.99, d: 0.12 }, // G5
      { f: 1046.5, d: 0.35 }, // C6
    ];

    let t = this.ctx.currentTime + 0.1;
    notes.forEach((nItem) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(nItem.f, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + nItem.d);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(t);
      osc.stop(t + nItem.d);
      t += nItem.d + 0.04;
    });
  }

  public playDie() {
    this.stopMusic();
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const notes = [
      { f: 659.25, d: 0.14 }, // E5
      { f: 587.33, d: 0.14 }, // D5
      { f: 523.25, d: 0.14 }, // C5
      { f: 392.0, d: 0.2 }, // G4
      { f: 329.63, d: 0.2 }, // E4
      { f: 261.63, d: 0.4 }, // C4
    ];

    let t = this.ctx.currentTime;
    notes.forEach((nItem) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(nItem.f, t);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + nItem.d);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(t);
      osc.stop(t + nItem.d);
      t += nItem.d + 0.03;
    });
  }

  // --- Multi-Channel NES Background Music Sequencer ---

  public playMusic(track: 'overworld' | 'underground' | 'star') {
    if (this.activeTrack === track && this.schedulerInterval !== null) {
      return;
    }

    this.stopMusic();
    this.initContext();

    this.activeTrack = track;
    this.currentStepIndex = 0;
    this.nextStepTime = this.ctx ? this.ctx.currentTime + 0.05 : 0;

    const getScore = () => {
      switch (this.activeTrack) {
        case 'underground':
          return UNDERGROUND_STEPS;
        case 'star':
          return STAR_STEPS;
        default:
          return OVERWORLD_STEPS;
      }
    };

    // The Scheduler runs every 25ms and schedules notes up to 150ms in the future
    // using the Web Audio hardware clock (0% jitter, perfect rhythm).
    this.schedulerInterval = window.setInterval(() => {
      if (!this.ctx || !this.activeTrack) return;

      const score = getScore();
      const lookahead = 0.15; // 150ms ahead

      while (this.nextStepTime < this.ctx.currentTime + lookahead) {
        const step = score[this.currentStepIndex % score.length];
        this.scheduleStep(step, this.nextStepTime);

        this.nextStepTime += this.stepDuration;
        this.currentStepIndex++;
      }
    }, 25);
  }

  private scheduleStep(step: NoteStep, time: number) {
    if (!this.ctx || !this.musicGain || this.musicMuted || this.isMuted) {
      return;
    }

    // 1. Channel 1: Pulse/Square Wave Lead (Melody)
    if (step.lead > 0) {
      const leadOsc = this.ctx.createOscillator();
      const leadGain = this.ctx.createGain();

      leadOsc.type = 'square';
      leadOsc.frequency.setValueAtTime(step.lead, time);

      // Staccato envelope like real NES pulse wave
      const dur = this.stepDuration * 0.88;
      leadGain.gain.setValueAtTime(0.14, time);
      leadGain.gain.exponentialRampToValueAtTime(0.001, time + dur);

      leadOsc.connect(leadGain);
      leadGain.connect(this.musicGain);

      leadOsc.start(time);
      leadOsc.stop(time + dur + 0.01);
    }

    // 2. Channel 2: Triangle Wave Bassline (Bouncy Walking Bass)
    if (step.bass > 0) {
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();

      bassOsc.type = 'triangle';
      bassOsc.frequency.setValueAtTime(step.bass, time);

      const dur = this.stepDuration * 0.92;
      bassGain.gain.setValueAtTime(0.18, time);
      bassGain.gain.exponentialRampToValueAtTime(0.001, time + dur);

      bassOsc.connect(bassGain);
      bassGain.connect(this.musicGain);

      bassOsc.start(time);
      bassOsc.stop(time + dur + 0.01);
    }

    // 3. Channel 3: NES Noise Percussion (Hi-Hat / Snare)
    if (step.snare || step.hat) {
      const bufferSize = Math.floor(this.ctx.sampleRate * (step.snare ? 0.05 : 0.02));
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = step.snare ? 'lowpass' : 'highpass';
      filter.frequency.setValueAtTime(step.snare ? 1200 : 7000, time);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(step.snare ? 0.08 : 0.035, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, time + (step.snare ? 0.045 : 0.018));

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.musicGain);

      noise.start(time);
      noise.stop(time + (step.snare ? 0.05 : 0.02));
    }
  }

  public stopMusic() {
    this.activeTrack = null;
    if (this.schedulerInterval !== null) {
      window.clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }
  }
}

export const sound = new SoundEngine();
