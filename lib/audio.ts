// Web Audio API Synthesizer for 0-dependency mystical soundscapes and ASMR sound effects
let audioCtx: AudioContext | null = null;
let ambientSource: { oscillators: OscillatorNode[]; gainNode: GainNode; filter: BiquadFilterNode } | null = null;
let crackleInterval: NodeJS.Timeout | null = null;
let fireGain: GainNode | null = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    // @ts-ignore
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

// 1. Tiếng lướt bài (Paper shush/rustle)
export function playCardRustle() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  const bufferSize = ctx.sampleRate * 0.35; // 350ms
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  // Fill with white noise
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1000, ctx.currentTime);
  filter.Q.setValueAtTime(1.5, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.3);

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

  noise.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  noise.start();
}

// 2. Tiếng lật bài (Wood/stone thick tap)
export function playCardFlip() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  // Primary tone
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(180, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.12);

  // High tick for contact
  const tickOsc = ctx.createOscillator();
  tickOsc.type = 'sine';
  tickOsc.frequency.setValueAtTime(1200, ctx.currentTime);
  tickOsc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.02);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

  const tickGain = ctx.createGain();
  tickGain.gain.setValueAtTime(0.12, ctx.currentTime);
  tickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.setValueAtTime(600, ctx.currentTime);

  osc.connect(lowpass);
  lowpass.connect(gain);
  gain.connect(ctx.destination);

  tickOsc.connect(tickGain);
  tickGain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.16);

  tickOsc.start();
  tickOsc.stop(ctx.currentTime + 0.03);
}

// 3. Tiếng đốt lửa lá thông xèo xèo (ASMR Crackling Flame)
export function startFireCrackling() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();
  if (crackleInterval) return;

  fireGain = ctx.createGain();
  fireGain.gain.setValueAtTime(0.08, ctx.currentTime);
  fireGain.connect(ctx.destination);

  // A soft continuous hiss
  const bufferSize = ctx.sampleRate * 2.0; // 2s loopable
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(2500, ctx.currentTime);
  filter.Q.setValueAtTime(0.8, ctx.currentTime);

  noise.connect(filter);
  filter.connect(fireGain);
  noise.start();

  // Random crackles / snaps
  crackleInterval = setInterval(() => {
    if (!ctx || !fireGain) return;
    
    // Play a single snap
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(Math.random() * 3000 + 1000, ctx.currentTime);
    
    const snapGain = ctx.createGain();
    snapGain.gain.setValueAtTime(Math.random() * 0.15 + 0.05, ctx.currentTime);
    snapGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.015);
    
    osc.connect(snapGain);
    snapGain.connect(fireGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.02);
  }, 40);

  // Keep reference to stop it
  // @ts-ignore
  ambientSource_fire = noise;
}

// Global reference for stopping fire
let ambientSource_fire: AudioBufferSourceNode | null = null;

export function stopFireCrackling() {
  if (crackleInterval) {
    clearInterval(crackleInterval);
    crackleInterval = null;
  }
  if (ambientSource_fire) {
    try {
      ambientSource_fire.stop();
    } catch {}
    ambientSource_fire = null;
  }
  if (fireGain) {
    try {
      fireGain.disconnect();
    } catch {}
    fireGain = null;
  }
}

// 4. Nhạc nền Ambient Pad (Gothic / Mystic Drone)
export function startAmbientPad() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();
  if (ambientSource) return;

  const oscs: OscillatorNode[] = [];
  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  // Fade in ambient pad slowly
  gainNode.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 2.0);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(400, ctx.currentTime);

  // Play a mystical A minor / C major detuned drone chord (A2, E3, A3, C4)
  const notes = [110.0, 164.81, 220.0, 261.63];
  notes.forEach((freq) => {
    // Detuned double oscillators for chorus effect
    for (let i = 0; i < 2; i++) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq + (i === 0 ? 0.4 : -0.4), ctx.currentTime);
      
      osc.connect(filter);
      oscs.push(osc);
      osc.start();
    }
  });

  // Slow LFO modulating filter cutoff to make it alive
  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(0.15, ctx.currentTime); // 0.15 Hz (very slow)
  
  const lfoGain = ctx.createGain();
  lfoGain.gain.setValueAtTime(150, ctx.currentTime); // swing 150hz up/down

  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start();

  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  // @ts-ignore
  ambientSource = { oscillators: [...oscs, lfo], gainNode, filter };
}

export function stopAmbientPad() {
  if (!ambientSource) return;
  const ctx = getAudioContext();
  if (ctx) {
    const currentGain = ambientSource.gainNode.gain.value;
    ambientSource.gainNode.gain.setValueAtTime(currentGain, ctx.currentTime);
    ambientSource.gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
  }
  
  const oscs = ambientSource.oscillators;
  setTimeout(() => {
    oscs.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
  }, 1600);
  
  ambientSource = null;
}
