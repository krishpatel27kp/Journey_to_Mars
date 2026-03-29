/**
 * AudioEngine — Cinematic Procedural Sound System.
 * Generates HUD blips, deep space drones, mission music, and astronaut voice-over
 * without external asset dependencies using the Web Audio API.
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
  if (!ctx || ctx.state === 'suspended') return;

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
  if (droneSource || !ctx) return;

  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  let lastOut = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (lastOut + (0.02 * white)) / 1.02;
    lastOut = data[i];
    data[i] *= 3.5;
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

/** Procedural Musical Chords for 'Cinematic' moments */
export const playCinematicPad = (notes = [220, 330, 440], duration = 4, intensity = 0.1) => {
  const ctx = initAudio();
  if (!ctx || ctx.state === 'suspended') return;

  notes.forEach(freq => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + duration/2);
    filter.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + duration);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(intensity, ctx.currentTime + 1);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  });
};

/** Synthetic 'Astronaut Voice' effect via Speech Synthesis with distortion */
export const speakMissionControl = (text) => {
    if (!('speechSynthesis' in window)) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 0.7;
    // Astronaut radio static effect
    const playStatic = () => {
        const ctx = initAudio();
        const bufferSize = ctx.sampleRate * 0.1;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const gain = ctx.createGain();
        gain.gain.value = 0.05;
        source.connect(gain);
        gain.connect(ctx.destination);
        source.start();
    };

    utterance.onstart = playStatic;
    utterance.onend = playStatic;
    
    window.speechSynthesis.speak(utterance);
};

export const playRocketLaunch = () => {
  const ctx = initAudio();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();
  
  const dur = 8;
  const bufferSize = ctx.sampleRate * dur;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(30, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + dur);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 1.0);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  // Play epic "Ascent Music" alongside rumble
  playCinematicPad([110, 164, 220], 8, 0.05);
  
  source.start();
};

export const playLandingSuccess = () => {
    playCinematicPad([329.63, 493.88, 659.25], 6, 0.1); // E Major cinematic chords
    setTimeout(() => {
        speakMissionControl("Touchdown confirmed. Welcome to the Red Planet.");
    }, 1000);
};

export const playIntroSequence = () => {
    playCinematicPad([146.83, 220, 293.66], 5, 0.05); // D Minor deep chords
    setTimeout(() => {
        speakMissionControl("Ares Mission online. System check complete.");
    }, 500);
};

export const playTick = () => {
  const ctx = initAudio();
  if (!ctx || ctx.state === 'suspended') return;

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

