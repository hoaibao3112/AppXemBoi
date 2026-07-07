// Web Audio API Synthesizer for 0-dependency mystical soundscapes and ASMR sound effects
let audioCtx: AudioContext | null = null;
let ambientSource: { oscillators: OscillatorNode[]; gainNode: GainNode; filter: BiquadFilterNode } | null = null;
let crackleInterval: NodeJS.Timeout | null = null;
let fireGain: GainNode | null = null;
let ambientSource_fire: AudioBufferSourceNode | null = null;

export function getVolume(key: string, defaultVal: number): number {
  if (typeof window === 'undefined') return defaultVal / 100;
  const val = localStorage.getItem(`settings_${key}`);
  return val !== null ? Number(val) / 100 : defaultVal / 100;
}

export function isHapticEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const val = localStorage.getItem("settings_hapticEnabled");
  return val !== null ? val === "true" : true;
}

export function triggerHaptic(pattern: number | number[]) {
  if (typeof window === 'undefined' || !isHapticEnabled()) return;
  try {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  } catch (e) {
    console.warn("Haptic feedback error:", e);
  }
}

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
  const vol = getVolume("soundVolume", 45);
  gainNode.gain.setValueAtTime(0.08 * vol, ctx.currentTime);
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
  const vol = getVolume("soundVolume", 45);
  gain.gain.setValueAtTime(0.3 * vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

  const tickGain = ctx.createGain();
  tickGain.gain.setValueAtTime(0.12 * vol, ctx.currentTime);
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
  const vol = getVolume("soundVolume", 45);
  fireGain.gain.setValueAtTime(0.08 * vol, ctx.currentTime);
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
export function startAmbientPad(clan?: string) {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();
  if (ambientSource) return;

  const oscs: OscillatorNode[] = [];
  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  // Fade in ambient pad slowly
  const vol = getVolume("ambientVolume", 65);
  gainNode.gain.linearRampToValueAtTime(0.06 * vol, ctx.currentTime + 2.0);

  let notes = [110.0, 164.81, 220.0, 261.63]; // Default (VoThuong)
  let oscType: 'sine' | 'triangle' | 'sawtooth' | 'square' = 'sawtooth';
  let filterCutoff = 400;

  if (clan === 'DiemHoa') {
    notes = [130.81, 196.00, 261.63, 329.63, 493.88]; // C3 Major 7th
    oscType = 'sawtooth';
    filterCutoff = 500;
  } else if (clan === 'ThuyNguyet') {
    notes = [87.31, 130.81, 174.61, 220.00, 261.63]; // F2 Major
    oscType = 'triangle';
    filterCutoff = 350;
  } else if (clan === 'PhongKiem') {
    notes = [164.81, 246.94, 329.63, 415.30, 493.88]; // E3 Major
    oscType = 'sine';
    filterCutoff = 600;
  } else if (clan === 'ThoKim') {
    notes = [55.00, 82.41, 110.00, 130.81]; // A1 Minor
    oscType = 'triangle';
    filterCutoff = 250;
  }

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(filterCutoff, ctx.currentTime);

  notes.forEach((freq) => {
    // Detuned double oscillators for chorus effect
    for (let i = 0; i < 2; i++) {
      const osc = ctx.createOscillator();
      osc.type = oscType;
      // wider detuning for DiemHoa (heat)
      const detuneAmt = clan === 'DiemHoa' ? 0.8 : 0.4;
      osc.frequency.setValueAtTime(freq + (i === 0 ? detuneAmt : -detuneAmt), ctx.currentTime);
      
      osc.connect(filter);
      oscs.push(osc);
      osc.start();
    }
  });

  // PhongKiem: Add white noise wind simulation
  if (clan === 'PhongKiem') {
    try {
      const bufferSize = ctx.sampleRate * 2.0;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const windSource = ctx.createBufferSource();
      windSource.buffer = buffer;
      windSource.loop = true;

      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.setValueAtTime(800, ctx.currentTime);
      windFilter.Q.setValueAtTime(3.0, ctx.currentTime);

      const windLfo = ctx.createOscillator();
      windLfo.type = 'sine';
      windLfo.frequency.setValueAtTime(0.1, ctx.currentTime);
      const windLfoGain = ctx.createGain();
      windLfoGain.gain.setValueAtTime(300, ctx.currentTime);

      windLfo.connect(windLfoGain);
      windLfoGain.connect(windFilter.frequency);
      windLfo.start();

      const windGain = ctx.createGain();
      windGain.gain.setValueAtTime(0.015 * vol, ctx.currentTime);

      windSource.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(ctx.destination);
      windSource.start();

      oscs.push(windLfo as any);
      oscs.push(windSource as any);
    } catch (e) {
      console.warn("Wind synth failed:", e);
    }
  }

  // Slow LFO modulating filter cutoff to make it alive
  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  // slower modulation for ThuyNguyet (waves)
  const lfoFreq = clan === 'ThuyNguyet' ? 0.08 : 0.15;
  lfo.frequency.setValueAtTime(lfoFreq, ctx.currentTime);
  
  const lfoGain = ctx.createGain();
  // more filter sweep for ThuyNguyet (waves effect)
  const sweepAmt = clan === 'ThuyNguyet' ? 220 : 150;
  lfoGain.gain.setValueAtTime(sweepAmt, ctx.currentTime);

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

export function updateAmbientVolume(volPercent: number) {
  const ctx = getAudioContext();
  if (ambientSource && ctx) {
    ambientSource.gainNode.gain.setValueAtTime(0.06 * (volPercent / 100), ctx.currentTime);
  }
}

export function updateFireVolume(volPercent: number) {
  const ctx = getAudioContext();
  if (fireGain && ctx) {
    fireGain.gain.setValueAtTime(0.08 * (volPercent / 100), ctx.currentTime);
  }
}

// 5. Tiếng lướt bài đều đặn khi rải (White noise sweep)
export function playCardSlide() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  const bufferSize = ctx.sampleRate * 0.15;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(600, ctx.currentTime);
  filter.Q.setValueAtTime(1.0, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.12);

  const gainNode = ctx.createGain();
  const vol = getVolume("soundVolume", 45);
  gainNode.gain.setValueAtTime(0.04 * vol, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

  noise.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  noise.start();
}
