/**
 * AEROVERSE Web Audio Synthesizer
 * Fully procedural sound effects & engine synthesis:
 * - Jet turbine whine, combustion noise & afterburner rumble
 * - Helicopter rotor blade slap (whop-whop), turbine & tail rotor
 * - Car multi-harmonic engine revving, RPM curve, gear shifts, tire screech
 * - UI feedback, stall warnings, checkpoint chimes
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private initialized: boolean = false;

  // Master Gain Nodes
  private masterGain: GainNode | null = null;
  private engineGain: GainNode | null = null;
  private fxGain: GainNode | null = null;

  // Jet Nodes
  private jetTurbineOsc1: OscillatorNode | null = null;
  private jetTurbineOsc2: OscillatorNode | null = null;
  private jetNoiseNode: AudioBufferSourceNode | null = null;
  private jetNoiseFilter: BiquadFilterNode | null = null;
  private jetAfterburnerGain: GainNode | null = null;
  private jetAfterburnerOsc: OscillatorNode | null = null;
  private jetActive: boolean = false;

  // Helicopter Nodes
  private heliTurbineOsc: OscillatorNode | null = null;
  private heliRotorGain: GainNode | null = null;
  private heliRotorLfo: OscillatorNode | null = null;
  private heliRotorNoise: AudioBufferSourceNode | null = null;
  private heliActive: boolean = false;

  // Car Nodes
  private carOsc1: OscillatorNode | null = null;
  private carOsc2: OscillatorNode | null = null;
  private carSubOsc: OscillatorNode | null = null;
  private carFilter: BiquadFilterNode | null = null;
  private tireSkidGain: GainNode | null = null;
  private tireNoiseNode: AudioBufferSourceNode | null = null;
  private tireFilter: BiquadFilterNode | null = null;
  private carActive: boolean = false;

  // Noise Buffer
  private noiseBuffer: AudioBuffer | null = null;

  constructor() {
    // Lazy initialize on first interaction
  }

  public init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
      this.engineGain.connect(this.masterGain);

      this.fxGain = this.ctx.createGain();
      this.fxGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.fxGain.connect(this.masterGain);

      this.createNoiseBuffer();
      this.initialized = true;
    } catch (e) {
      console.warn('AudioContext not supported or blocked by browser', e);
    }
  }

  private resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private createNoiseBuffer() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
  }

  public setVolumes(master: number, engine: number, fx: number) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.masterGain) this.masterGain.gain.setTargetAtTime(master, now, 0.05);
    if (this.engineGain) this.engineGain.gain.setTargetAtTime(engine, now, 0.05);
    if (this.fxGain) this.fxGain.gain.setTargetAtTime(fx, now, 0.05);
  }

  // --- JET SOUNDS ---
  public startJet() {
    this.init();
    this.resume();
    if (!this.ctx || !this.engineGain || !this.noiseBuffer || this.jetActive) return;
    this.stopAllEngines();

    try {
      const now = this.ctx.currentTime;

      // Turbine whine (whistle)
      this.jetTurbineOsc1 = this.ctx.createOscillator();
      this.jetTurbineOsc1.type = 'sine';
      this.jetTurbineOsc1.frequency.setValueAtTime(450, now);

      this.jetTurbineOsc2 = this.ctx.createOscillator();
      this.jetTurbineOsc2.type = 'sawtooth';
      this.jetTurbineOsc2.frequency.setValueAtTime(220, now);

      const turbineGain = this.ctx.createGain();
      turbineGain.gain.setValueAtTime(0.12, now);
      this.jetTurbineOsc1.connect(turbineGain);
      this.jetTurbineOsc2.connect(turbineGain);
      turbineGain.connect(this.engineGain);

      // Jet exhaust airflow noise
      this.jetNoiseNode = this.ctx.createBufferSource();
      this.jetNoiseNode.buffer = this.noiseBuffer;
      this.jetNoiseNode.loop = true;

      this.jetNoiseFilter = this.ctx.createBiquadFilter();
      this.jetNoiseFilter.type = 'bandpass';
      this.jetNoiseFilter.frequency.setValueAtTime(800, now);
      this.jetNoiseFilter.Q.setValueAtTime(1.5, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.2, now);
      this.jetNoiseNode.connect(this.jetNoiseFilter);
      this.jetNoiseFilter.connect(noiseGain);
      noiseGain.connect(this.engineGain);

      // Afterburner roar (sub rumble)
      this.jetAfterburnerOsc = this.ctx.createOscillator();
      this.jetAfterburnerOsc.type = 'triangle';
      this.jetAfterburnerOsc.frequency.setValueAtTime(65, now);

      this.jetAfterburnerGain = this.ctx.createGain();
      this.jetAfterburnerGain.gain.setValueAtTime(0, now);
      this.jetAfterburnerOsc.connect(this.jetAfterburnerGain);
      this.jetAfterburnerGain.connect(this.engineGain);

      this.jetTurbineOsc1.start(now);
      this.jetTurbineOsc2.start(now);
      this.jetNoiseNode.start(now);
      this.jetAfterburnerOsc.start(now);

      this.jetActive = true;
    } catch (e) {
      console.warn('Failed to start jet sound', e);
    }
  }

  public updateJet(throttle: number, afterburner: boolean, speedKmh: number) {
    if (!this.ctx || !this.jetActive) return;
    const now = this.ctx.currentTime;
    const t = Math.max(0.05, Math.min(1, throttle));

    // Turbine pitch scales with throttle + airspeed
    const turbineFreq = 380 + t * 950 + (speedKmh / 2000) * 300;
    if (this.jetTurbineOsc1) this.jetTurbineOsc1.frequency.setTargetAtTime(turbineFreq, now, 0.1);
    if (this.jetTurbineOsc2) this.jetTurbineOsc2.frequency.setTargetAtTime(turbineFreq * 0.5, now, 0.1);

    // Filter bandwidth opens with speed and thrust
    if (this.jetNoiseFilter) {
      const filterFreq = 600 + t * 2400 + (speedKmh / 2000) * 800;
      this.jetNoiseFilter.frequency.setTargetAtTime(filterFreq, now, 0.1);
    }

    // Afterburner rumble
    if (this.jetAfterburnerGain) {
      const abTarget = afterburner ? 0.35 : 0;
      this.jetAfterburnerGain.gain.setTargetAtTime(abTarget, now, 0.08);
    }
  }

  // --- HELICOPTER SOUNDS ---
  public startHelicopter() {
    this.init();
    this.resume();
    if (!this.ctx || !this.engineGain || !this.noiseBuffer || this.heliActive) return;
    this.stopAllEngines();

    try {
      const now = this.ctx.currentTime;

      // Turboshaft hum
      this.heliTurbineOsc = this.ctx.createOscillator();
      this.heliTurbineOsc.type = 'sawtooth';
      this.heliTurbineOsc.frequency.setValueAtTime(140, now);
      const turbineGain = this.ctx.createGain();
      turbineGain.gain.setValueAtTime(0.08, now);
      this.heliTurbineOsc.connect(turbineGain);
      turbineGain.connect(this.engineGain);

      // Chopping blade slap: LFO amplitude-modulating noise
      this.heliRotorNoise = this.ctx.createBufferSource();
      this.heliRotorNoise.buffer = this.noiseBuffer;
      this.heliRotorNoise.loop = true;

      const rotorFilter = this.ctx.createBiquadFilter();
      rotorFilter.type = 'lowpass';
      rotorFilter.frequency.setValueAtTime(320, now);

      this.heliRotorGain = this.ctx.createGain();
      this.heliRotorGain.gain.setValueAtTime(0.3, now);

      this.heliRotorLfo = this.ctx.createOscillator();
      this.heliRotorLfo.type = 'sawtooth';
      this.heliRotorLfo.frequency.setValueAtTime(16, now); // 16 Hz blade chops

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(0.25, now);
      this.heliRotorLfo.connect(lfoGain);
      lfoGain.connect(this.heliRotorGain.gain);

      this.heliRotorNoise.connect(rotorFilter);
      rotorFilter.connect(this.heliRotorGain);
      this.heliRotorGain.connect(this.engineGain);

      this.heliTurbineOsc.start(now);
      this.heliRotorNoise.start(now);
      this.heliRotorLfo.start(now);

      this.heliActive = true;
    } catch (e) {
      console.warn('Failed to start helicopter sound', e);
    }
  }

  public updateHelicopter(collective: number, rotorRpmPercent: number) {
    if (!this.ctx || !this.heliActive) return;
    const now = this.ctx.currentTime;
    const rpm = Math.max(0.3, Math.min(1.2, rotorRpmPercent));

    if (this.heliRotorLfo) {
      // Blade chop frequency: 12 - 20 Hz
      this.heliRotorLfo.frequency.setTargetAtTime(12 + rpm * 8 + collective * 4, now, 0.1);
    }
    if (this.heliTurbineOsc) {
      this.heliTurbineOsc.frequency.setTargetAtTime(120 + rpm * 80, now, 0.1);
    }
    if (this.heliRotorGain) {
      const targetGain = 0.2 + collective * 0.25;
      this.heliRotorGain.gain.setTargetAtTime(targetGain, now, 0.1);
    }
  }

  // --- CAR SOUNDS ---
  public startCar() {
    this.init();
    this.resume();
    if (!this.ctx || !this.engineGain || !this.noiseBuffer || this.carActive) return;
    this.stopAllEngines();

    try {
      const now = this.ctx.currentTime;

      // Engine primary tone
      this.carOsc1 = this.ctx.createOscillator();
      this.carOsc1.type = 'sawtooth';
      this.carOsc1.frequency.setValueAtTime(55, now);

      // Engine secondary harmonic
      this.carOsc2 = this.ctx.createOscillator();
      this.carOsc2.type = 'triangle';
      this.carOsc2.frequency.setValueAtTime(110, now);

      // Deep exhaust bass
      this.carSubOsc = this.ctx.createOscillator();
      this.carSubOsc.type = 'sine';
      this.carSubOsc.frequency.setValueAtTime(45, now);

      this.carFilter = this.ctx.createBiquadFilter();
      this.carFilter.type = 'lowpass';
      this.carFilter.frequency.setValueAtTime(650, now);

      const carGain = this.ctx.createGain();
      carGain.gain.setValueAtTime(0.25, now);

      this.carOsc1.connect(this.carFilter);
      this.carOsc2.connect(this.carFilter);
      this.carSubOsc.connect(this.carFilter);
      this.carFilter.connect(carGain);
      carGain.connect(this.engineGain);

      // Tire screech synthesizer
      this.tireNoiseNode = this.ctx.createBufferSource();
      this.tireNoiseNode.buffer = this.noiseBuffer;
      this.tireNoiseNode.loop = true;

      this.tireFilter = this.ctx.createBiquadFilter();
      this.tireFilter.type = 'bandpass';
      this.tireFilter.frequency.setValueAtTime(1800, now);
      this.tireFilter.Q.setValueAtTime(3.5, now);

      this.tireSkidGain = this.ctx.createGain();
      this.tireSkidGain.gain.setValueAtTime(0, now);

      this.tireNoiseNode.connect(this.tireFilter);
      this.tireFilter.connect(this.tireSkidGain);
      this.tireSkidGain.connect(this.engineGain);

      this.carOsc1.start(now);
      this.carOsc2.start(now);
      this.carSubOsc.start(now);
      this.tireNoiseNode.start(now);

      this.carActive = true;
    } catch (e) {
      console.warn('Failed to start car sound', e);
    }
  }

  public updateCar(rpm: number, throttle: number, driftSlip: number) {
    if (!this.ctx || !this.carActive) return;
    const now = this.ctx.currentTime;
    const normRpm = Math.max(800, Math.min(8500, rpm));

    // Pitch proportional to engine RPM
    const baseFreq = (normRpm / 60) * 2.5; // ~40Hz at idle, ~350Hz at redline
    if (this.carOsc1) this.carOsc1.frequency.setTargetAtTime(baseFreq, now, 0.05);
    if (this.carOsc2) this.carOsc2.frequency.setTargetAtTime(baseFreq * 2.0, now, 0.05);
    if (this.carSubOsc) this.carSubOsc.frequency.setTargetAtTime(baseFreq * 0.75, now, 0.05);

    if (this.carFilter) {
      const openFreq = 400 + (normRpm / 8500) * 1600 + throttle * 600;
      this.carFilter.frequency.setTargetAtTime(openFreq, now, 0.06);
    }

    // Tire squeal if drifting or braking hard
    if (this.tireSkidGain) {
      const skidIntensity = Math.min(1, Math.max(0, (driftSlip - 0.25) * 2.5));
      this.tireSkidGain.gain.setTargetAtTime(skidIntensity * 0.35, now, 0.05);
    }
  }

  public stopAllEngines() {
    if (!this.ctx) return;
    try {
      if (this.jetTurbineOsc1) { this.jetTurbineOsc1.stop(); this.jetTurbineOsc1.disconnect(); }
      if (this.jetTurbineOsc2) { this.jetTurbineOsc2.stop(); this.jetTurbineOsc2.disconnect(); }
      if (this.jetNoiseNode) { this.jetNoiseNode.stop(); this.jetNoiseNode.disconnect(); }
      if (this.jetAfterburnerOsc) { this.jetAfterburnerOsc.stop(); this.jetAfterburnerOsc.disconnect(); }

      if (this.heliTurbineOsc) { this.heliTurbineOsc.stop(); this.heliTurbineOsc.disconnect(); }
      if (this.heliRotorNoise) { this.heliRotorNoise.stop(); this.heliRotorNoise.disconnect(); }
      if (this.heliRotorLfo) { this.heliRotorLfo.stop(); this.heliRotorLfo.disconnect(); }

      if (this.carOsc1) { this.carOsc1.stop(); this.carOsc1.disconnect(); }
      if (this.carOsc2) { this.carOsc2.stop(); this.carOsc2.disconnect(); }
      if (this.carSubOsc) { this.carSubOsc.stop(); this.carSubOsc.disconnect(); }
      if (this.tireNoiseNode) { this.tireNoiseNode.stop(); this.tireNoiseNode.disconnect(); }
    } catch (e) {
      // Ignored
    }

    this.jetActive = false;
    this.heliActive = false;
    this.carActive = false;
  }

  // --- UI SOUND EFFECTS ---
  public playClick() {
    this.init();
    this.resume();
    if (!this.ctx || !this.fxGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(this.fxGain);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) { /* ignore */ }
  }

  public playCheckpointDing() {
    this.init();
    this.resume();
    if (!this.ctx || !this.fxGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.1); // A5
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain);
      gain.connect(this.fxGain);
      osc.start(now);
      osc.stop(now + 0.6);
    } catch (e) { /* ignore */ }
  }

  public playMissionComplete() {
    this.init();
    this.resume();
    if (!this.ctx || !this.fxGain) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 fanfare
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const noteStart = now + idx * 0.12;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);
        gain.gain.setValueAtTime(0.35, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.5);
        osc.connect(gain);
        gain.connect(this.fxGain!);
        osc.start(noteStart);
        osc.stop(noteStart + 0.5);
      });
    } catch (e) { /* ignore */ }
  }

  public playStallWarning() {
    this.init();
    this.resume();
    if (!this.ctx || !this.fxGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.connect(gain);
      gain.connect(this.fxGain);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) { /* ignore */ }
  }

  public playCrash() {
    this.init();
    this.resume();
    if (!this.ctx || !this.fxGain || !this.noiseBuffer) return;
    try {
      const now = this.ctx.currentTime;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, now);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.fxGain);
      noise.start(now);
      noise.stop(now + 0.8);
    } catch (e) { /* ignore */ }
  }
}

export const soundSystem = new SoundSystem();
