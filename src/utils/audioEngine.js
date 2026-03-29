/**
 * AudioEngine — Minimalist Procedural Sound System.
 * Generates HUD blips, deep space drones, and mission effects 
 * without external asset dependencies.
 */

let audioCtx = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const resumeAudioContext = () => {
  const ctx = initAudio();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
};

/** Play a scientific 'Blip' for HUD interactions */
export const playHUDBlip = (freq = 880, type = 'sine', duration = 0.05) => {
  const ctx = initAudio();
  if (ctx.state === 'suspended') return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(freq / 2, ctx.currentTime + duration);

  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + duration);
};

/** Deep Space Drone (Procedural Brownian-like noise) */
let droneSource = null;
let droneGain = null;

export const startSpaceDrone = (intensity = 0.02) => {
  const ctx = initAudio();
  if (droneSource) return;

  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  // Create Brownian Noise
  let lastOut = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (lastOut + (0.02 * white)) / 1.02;
    lastOut = data[i];
    data[i] *= 3.5; // Gain boost
  }

  droneSource = ctx.createBufferSource();
  droneSource.buffer = buffer;
  droneSource.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 150;

  droneGain = ctx.createGain();
  droneGain.gain.value = 0;
  droneGain.gain.linearRampToValueAtTime(intensity, ctx.currentTime + 1.5);

  droneSource.connect(filter);
  filter.connect(droneGain);
  droneGain.connect(ctx.destination);

  droneSource.start();
};

export const stopSpaceDrone = () => {
  if (droneGain && audioCtx) {
    droneGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
    setTimeout(() => {
      if (droneSource) droneSource.stop();
      droneSource = null;
    }, 500);
  }
};

export const playRocketLaunch = () => {
  const ctx = initAudio();
  if (ctx.state === 'suspended') ctx.resume();
  
  const dur = 8; // Double the duration for a more epic rumble
  
  const bufferSize = ctx.sampleRate * dur;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(30, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + dur);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, ctx.currentTime);
  // Massively increased gain for the rocket rumble so it's impossible to miss!
  gain.gain.linearRampToValueAtTime(3.0, ctx.currentTime + 1.0);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  source.start();
};

/** Typewriter Ticking - Procedural variant */
export const playTick = () => {
  const ctx = initAudio();
  if (ctx.state === 'suspended') return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(150, ctx.currentTime);
  
  gain.gain.setValueAtTime(0.005, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.02);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.02);
};
