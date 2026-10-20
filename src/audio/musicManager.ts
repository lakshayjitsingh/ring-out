// High quality procedural Web Audio synthesizer for background music (Lobby & Battle)
// 100% zero-dependency, instant load, no network lag or CORS issues.

export type MusicTrack = 'lobby' | 'battle' | 'none';

class MusicManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public volume: number = 0.5;

  private currentTrack: MusicTrack = 'none';
  private masterGain: GainNode | null = null;
  private isRunning: boolean = false;
  private schedulerTimer: number | null = null;

  // Step sequencer state
  private nextNoteTime: number = 0;
  private currentStep: number = 0;
  private noiseBuffer: AudioBuffer | null = null;

  // Track configs
  private readonly LOBBY_BPM = 120;
  private readonly BATTLE_BPM = 138;

  constructor() {
    try {
      const savedEnabled = localStorage.getItem('ringout_music_enabled');
      if (savedEnabled !== null) {
        this.enabled = savedEnabled === 'true';
      }
      const savedVol = localStorage.getItem('ringout_music_volume');
      if (savedVol !== null) {
        const v = parseFloat(savedVol);
        if (!isNaN(v)) this.volume = Math.max(0, Math.min(1, v));
      }
    } catch {}

    // Auto-resume audio on first user gesture
    const unlock = () => {
      this.initCtx();
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('keydown', unlock);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('click', unlock, { once: true });
      window.addEventListener('touchstart', unlock, { once: true });
      window.addEventListener('keydown', unlock, { once: true });
    }
  }

  private initCtx() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.enabled ? this.volume : 0, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        // Create reusable 1-sec noise buffer for percussion (hi-hats, snares)
        const bufferSize = this.ctx.sampleRate;
        this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = this.noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
      }

      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch {}
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    try {
      localStorage.setItem('ringout_music_enabled', String(enabled));
    } catch {}

    if (this.masterGain && this.ctx) {
      const targetGain = enabled ? this.volume : 0;
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.1);
    }

    if (enabled && this.currentTrack !== 'none' && !this.isRunning) {
      this.play(this.currentTrack);
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('ringout_music_volume', String(this.volume));
    } catch {}

    if (this.masterGain && this.ctx && this.enabled) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 0.05);
    }
  }

  public play(track: MusicTrack) {
    try {
      if (this.currentTrack === track && this.isRunning) return;

      this.currentTrack = track;
      if (track === 'none') {
        this.stop();
        return;
      }

      this.initCtx();
      if (!this.ctx) return;

      this.currentStep = 0;
      this.nextNoteTime = this.ctx.currentTime + 0.05;
      this.isRunning = true;

      if (this.schedulerTimer !== null) {
        window.clearInterval(this.schedulerTimer);
      }

      // Schedule music steps in small batches ahead of time (every 40ms)
      this.schedulerTimer = window.setInterval(() => {
        try {
          this.scheduler();
        } catch {}
      }, 40);
    } catch {}
  }

  public stop() {
    this.isRunning = false;
    this.currentTrack = 'none';
    if (this.schedulerTimer !== null) {
      window.clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
  }

  private scheduler() {
    if (!this.ctx || !this.isRunning || !this.masterGain) return;
    if (this.ctx.state === 'suspended') return;

    // Prevent spiral catch-up if tab was unfocused or timer delayed
    if (this.nextNoteTime < this.ctx.currentTime) {
      this.nextNoteTime = this.ctx.currentTime + 0.02;
    }

    let safetyCount = 0;
    // Schedule up to 200ms ahead, max 8 steps per 40ms tick
    while (this.nextNoteTime < this.ctx.currentTime + 0.20 && safetyCount < 8) {
      safetyCount++;
      if (this.currentTrack === 'lobby') {
        this.scheduleLobbyStep(this.currentStep, this.nextNoteTime);
        const secondsPerStep = 60 / this.LOBBY_BPM / 4; // 16th note
        this.nextNoteTime += secondsPerStep;
        this.currentStep = (this.currentStep + 1) % 64; // 4-bar loop
      } else if (this.currentTrack === 'battle') {
        this.scheduleBattleStep(this.currentStep, this.nextNoteTime);
        const secondsPerStep = 60 / this.BATTLE_BPM / 4; // 16th note
        this.nextNoteTime += secondsPerStep;
        this.currentStep = (this.currentStep + 1) % 64; // 4-bar loop
      } else {
        break;
      }
    }
  }

  // Helper note synthesizer with low-pass warmth filter & envelope
  private playSynthNote(
    freq: number,
    time: number,
    duration: number,
    type: OscillatorType = 'triangle',
    gainAmount: number = 0.25,
    filterCutoff: number = 2400
  ) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterCutoff, time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(gainAmount, time + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration + 0.05);
  }

  // Crisp procedural percussion
  private playKick(time: number, power: number = 0.6) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.12);

    gain.gain.setValueAtTime(power, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.15);
  }

  private playSnare(time: number, power: number = 0.3) {
    if (!this.ctx || !this.masterGain || !this.noiseBuffer) return;

    // White noise snappy burst
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = this.noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(900, time);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(power, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noiseSource.start(time);
    noiseSource.stop(time + 0.2);

    // Body tone
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(60, time + 0.08);

    oscGain.gain.setValueAtTime(power * 0.7, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.12);
  }

  private playHiHat(time: number, open: boolean = false, volume: number = 0.15) {
    if (!this.ctx || !this.masterGain || !this.noiseBuffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time);

    const gain = this.ctx.createGain();
    const duration = open ? 0.16 : 0.04;

    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    source.start(time);
    source.stop(time + duration + 0.02);
  }

  // ==========================================
  // TRACK 1: LOBBY (Tropical Island Arcade Theme)
  // Bouncy, uplifting, tropical marimba vibes
  // Key: C Major / A Minor • 120 BPM
  // ==========================================
  private scheduleLobbyStep(step: number, time: number) {
    // 1. Drum Rhythm (Bouncy tropical break)
    // Kick on 0, 8, 14, 24, 32, 40, 46, 56
    if (step % 16 === 0 || step % 16 === 10) {
      this.playKick(time, 0.45);
    }
    // Snare / Rimshot on step 4 and 12
    if (step % 8 === 4) {
      this.playSnare(time, 0.22);
    }
    // Continuous Shaker / Hi-Hat
    if (step % 2 === 0) {
      const isAccent = step % 4 === 2;
      this.playHiHat(time, false, isAccent ? 0.12 : 0.06);
    }

    // 2. Tropical Marimba Lead & Harmony (Pentatonic C, D, E, G, A, C)
    const melodyMap: Record<number, number> = {
      0: 523.25,  // C5
      2: 587.33,  // D5
      4: 659.25,  // E5
      7: 783.99,  // G5
      8: 880.00,  // A5
      10: 783.99, // G5
      12: 659.25, // E5
      14: 587.33, // D5

      16: 523.25, // C5
      18: 659.25, // E5
      20: 783.99, // G5
      22: 1046.50,// C6
      24: 880.00, // A5
      28: 783.99, // G5

      32: 659.25, // E5
      34: 587.33, // D5
      36: 523.25, // C5
      38: 440.00, // A4
      40: 523.25, // C5
      44: 587.33, // D5
      46: 659.25, // E5

      48: 783.99, // G5
      50: 880.00, // A5
      52: 1046.50,// C6
      56: 880.00, // A5
      60: 783.99, // G5
      62: 659.25, // E5
    };

    if (melodyMap[step]) {
      this.playSynthNote(melodyMap[step], time, 0.22, 'sine', 0.22, 3200);
      // Soft sub harmonic for acoustic mallet feel
      this.playSynthNote(melodyMap[step] * 0.5, time, 0.15, 'triangle', 0.12, 1600);
    }

    // 3. Warm Electric Bassline
    const bassMap: Record<number, number> = {
      0: 130.81,  // C3
      3: 130.81,  // C3
      6: 196.00,  // G3
      8: 164.81,  // E3
      11: 174.61, // F3
      14: 196.00, // G3

      16: 110.00, // A2
      19: 110.00, // A2
      22: 164.81, // E3
      24: 174.61, // F3
      27: 196.00, // G3
      30: 220.00, // A3

      32: 87.31,  // F2
      35: 87.31,  // F2
      38: 130.81, // C3
      40: 146.83, // D3
      43: 164.81, // E3
      46: 174.61, // F3

      48: 98.00,  // G2
      51: 98.00,  // G2
      54: 146.83, // D3
      56: 196.00, // G3
      59: 220.00, // A3
      62: 246.94, // B3
    };

    if (bassMap[step]) {
      this.playSynthNote(bassMap[step], time, 0.28, 'triangle', 0.35, 900);
      this.playSynthNote(bassMap[step] * 0.5, time, 0.22, 'sine', 0.28, 400);
    }

    // 4. Lush Background Chord Pads (every 16 steps)
    if (step % 16 === 0) {
      const chords: number[][] = [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [220.00, 261.63, 329.63, 392.00], // Am7
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [196.00, 246.94, 293.66, 349.23], // G7
      ];
      const currentChord = chords[Math.floor(step / 16) % 4];
      currentChord.forEach((note) => {
        this.playSynthNote(note, time, 1.8, 'sine', 0.06, 1800);
      });
    }
  }

  // ==========================================
  // TRACK 2: BATTLE (Cyber Ring Combat Theme)
  // Fast, intense, driving synthwave & techno energy
  // Key: D Minor • 138 BPM
  // ==========================================
  private scheduleBattleStep(step: number, time: number) {
    // 1. Four-on-the-floor Cyber Kick Drum
    if (step % 4 === 0) {
      this.playKick(time, 0.65);
    }

    // 2. Snappy Claps / Snares on beats 2 and 4
    if (step % 8 === 4) {
      this.playSnare(time, 0.4);
    }

    // 3. Fast 16th-note Driving Hi-Hats
    const isOffbeat = step % 4 === 2;
    this.playHiHat(time, isOffbeat, isOffbeat ? 0.22 : 0.08);

    // 4. Rolling 16th-note Synthwave Bass (D1/D2 groove)
    const baseRoot = step < 32 ? 73.42 : step < 48 ? 58.27 : 65.41; // D2 -> Bb1 -> C2
    const bassOctave = (step % 2 === 0) ? baseRoot : baseRoot * 2;
    this.playSynthNote(bassOctave, time, 0.12, 'sawtooth', 0.38, 1200 + (step % 16) * 80);

    // 5. High-Energy Combat Arpeggio (D Minor: D, F, A, C, D)
    const arpNotes = [
      293.66, 349.23, 440.00, 523.25, 587.33, 698.46, 880.00, 1046.50
    ];
    // Dynamic arpeggiator pattern
    const pattern = [0, 2, 4, 2, 5, 4, 2, 1, 0, 3, 5, 3, 7, 5, 4, 2];
    const noteIdx = pattern[step % 16];
    const arpFreq = arpNotes[noteIdx % arpNotes.length];

    if (step % 2 === 0) {
      this.playSynthNote(arpFreq, time, 0.15, 'square', 0.14, 2600);
      this.playSynthNote(arpFreq * 0.5, time, 0.12, 'sawtooth', 0.12, 1800);
    }

    // 6. Dramatic Chord Power Stabs on Beat 1 and 3.5
    if (step % 16 === 0 || step % 16 === 10) {
      const battleChords: number[][] = [
        [293.66, 349.23, 440.00], // Dm
        [233.08, 293.66, 349.23], // Bb
        [261.63, 329.63, 392.00], // C
        [220.00, 261.63, 329.63], // Am
      ];
      const chord = battleChords[Math.floor(step / 16) % 4];
      chord.forEach((freq) => {
        this.playSynthNote(freq, time, 0.45, 'sawtooth', 0.22, 2800);
        this.playSynthNote(freq * 2, time, 0.35, 'square', 0.12, 3500);
      });
    }
  }
}

export const music = new MusicManager();
