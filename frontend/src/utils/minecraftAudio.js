// Web Audio API Synthesizer for Minecraft & MediCraft Sound FX (Procedural, Zero External MP3s)

let audioCtx = null;
let _isAudioMuted = false;

export function toggleAudioMute() {
  _isAudioMuted = !_isAudioMuted;
  return _isAudioMuted;
}

export function getAudioMuted() {
  return _isAudioMuted;
}

export function isAudioMuted() {
  return _isAudioMuted;
}

function getAudioContext() {
  if (_isAudioMuted) return null;

  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// 1. Food Bite / Crunch Sound (Procedural filtered noise burst)
export function playBiteSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800 + Math.random() * 600;
    filter.Q.value = 3.0;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
  } catch (err) {
    console.debug('Audio error', err);
  }
}

// 2. Potion Drink / Glug Sound
export function playDrinkSound(pitchMult = 1.0) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const startFreq = (300 + Math.random() * 80) * pitchMult;
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 1.8, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.14);
  } catch (err) {
    console.debug('Audio error', err);
  }
}

// 3. Burp / Completion Sound
export function playBurpSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(95, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(65, ctx.currentTime + 0.35);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 320;

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.38);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.38);
  } catch (err) {
    console.debug('Audio error', err);
  }
}

// 4. Low Heartbeat Thud
export function playHeartbeatSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(55, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(28, ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.45, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  } catch (err) {
    console.debug('Audio error', err);
  }
}

// 5. Totem / Resuscitation Chime
export function playTotemSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C E G C
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = f;

      gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.8);
    });
  } catch (err) {
    console.debug('Audio error', err);
  }
}

// 6. Scanner Charge / Power Up Sound (Sci-Fi sweep)
export function playScannerPowerUpSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.6);

    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.65);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.65);
  } catch (err) {
    console.debug('Audio error', err);
  }
}

// 7. Scanner Complete / Telemetry Lock Sound
export function playScannerCompleteSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    [659.25, 880, 1318.5].forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.value = f;

      gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.06);
      osc.stop(ctx.currentTime + idx * 0.06 + 0.35);
    });
  } catch (err) {
    console.debug('Audio error', err);
  }
}

// 8. Minecraft Experience Orb Pickup Sound (Classic high pitch sparkle)
export function playXpGainSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const freqs = [800, 1000, 1200];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = f;

      gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.05 + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.05);
      osc.stop(ctx.currentTime + idx * 0.05 + 0.18);
    });
  } catch (err) {
    console.debug('Audio error', err);
  }
}

// 9. Inventory Open / Wooden Click Sound
export function playInventoryOpenSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (err) {
    console.debug('Audio error', err);
  }
}

// Aliases
export const playXpSound = playXpGainSound;
export const playInventoryClickSound = playInventoryOpenSound;

