// ─────────────────────────────────────────────────────────────────────────────
// Synthesized horror sound effects (Web Audio API — no audio files needed).
// Everything is generated from oscillators/noise buffers at call time, so it
// works offline and adds zero bytes to the page. Call unlock() once from a
// user gesture (click) before anything else — browsers block audio otherwise.
// ─────────────────────────────────────────────────────────────────────────────

let ctx = null;
let ambienceHandle = null;

function getCtx() {
  if (!ctx && typeof window !== 'undefined') {
    const AC = window.AudioContext || window['webkitAudioContext'];
    ctx = new AC();
  }
  return ctx;
}

export function unlock() {
  const c = getCtx();
  if (c && c.state === 'suspended') c.resume();
  return c;
}

function noiseBuffer(c, duration) {
  const size = Math.max(1, Math.floor(c.sampleRate * duration));
  const buffer = c.createBuffer(1, size, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function envGain(gainNode, peak, attack, decay, startAt) {
  const t = startAt;
  gainNode.gain.setValueAtTime(0.0001, t);
  gainNode.gain.exponentialRampToValueAtTime(peak, t + attack);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
}

// ── One-shot: footstep ──────────────────────────────────────────────────────
export function playFootstep(volume = 0.18) {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, 0.12);
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 220 + Math.random() * 80;
  const gain = c.createGain();
  envGain(gain, volume, 0.005, 0.09, t);
  src.connect(filter).connect(gain).connect(c.destination);
  src.start(t);
  src.stop(t + 0.15);
}

// ── One-shot: glass break (vase) ────────────────────────────────────────────
export function playGlassBreak() {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;

  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, 0.4);
  const filter = c.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 1800;
  const gain = c.createGain();
  envGain(gain, 0.5, 0.002, 0.35, t);
  src.connect(filter).connect(gain).connect(c.destination);
  src.start(t);
  src.stop(t + 0.4);

  for (let i = 0; i < 5; i++) {
    const delay = i * 0.02 + Math.random() * 0.03;
    const osc = c.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = 1800 + Math.random() * 2400;
    const g = c.createGain();
    envGain(g, 0.12, 0.001, 0.12, t + delay);
    osc.connect(g).connect(c.destination);
    osc.start(t + delay);
    osc.stop(t + delay + 0.15);
  }
}

// ── One-shot: wood creak (chest) ────────────────────────────────────────────
export function playWoodCreak() {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  const osc = c.createOscillator();
  osc.type = 'sawtooth';
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 500;
  const gain = c.createGain();
  osc.frequency.setValueAtTime(90, t);
  osc.frequency.linearRampToValueAtTime(140, t + 0.5);
  osc.frequency.linearRampToValueAtTime(70, t + 0.9);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(0.16, t + 0.15);
  gain.gain.linearRampToValueAtTime(0.0001, t + 0.9);
  osc.connect(filter).connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.95);
}

// ── One-shot: water drip + echo (well) ──────────────────────────────────────
export function playDrip() {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  const delayNode = c.createDelay();
  delayNode.delayTime.value = 0.24;
  const feedback = c.createGain();
  feedback.gain.value = 0.35;
  delayNode.connect(feedback).connect(delayNode);

  for (let i = 0; i < 2; i++) {
    const start = t + i * 0.5;
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, start);
    osc.frequency.exponentialRampToValueAtTime(300, start + 0.2);
    const g = c.createGain();
    envGain(g, 0.22, 0.005, 0.2, start);
    osc.connect(g);
    g.connect(c.destination);
    g.connect(delayNode);
    delayNode.connect(c.destination);
    osc.start(start);
    osc.stop(start + 0.25);
  }
}

// ── One-shot: page flutter (bookshelf) ──────────────────────────────────────
export function playPageFlutter() {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  for (let i = 0; i < 6; i++) {
    const start = t + i * 0.07;
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(c, 0.06);
    const filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2500 + Math.random() * 1500;
    const g = c.createGain();
    envGain(g, 0.1, 0.002, 0.05, start);
    src.connect(filter).connect(g).connect(c.destination);
    src.start(start);
    src.stop(start + 0.07);
  }
}

// ── One-shot: mirror crack ──────────────────────────────────────────────────
export function playMirrorCrack() {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, 0.15);
  const filter = c.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 3000;
  filter.Q.value = 8;
  const gain = c.createGain();
  envGain(gain, 0.4, 0.001, 0.12, t);
  src.connect(filter).connect(gain).connect(c.destination);
  src.start(t);
  src.stop(t + 0.15);

  const osc = c.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(2200, t);
  osc.frequency.exponentialRampToValueAtTime(600, t + 0.3);
  const g2 = c.createGain();
  envGain(g2, 0.1, 0.001, 0.3, t);
  osc.connect(g2).connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.32);
}

// ── One-shot: deep rumble (altar reveal) ────────────────────────────────────
export function playRumble() {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  const osc = c.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(50, t);
  osc.frequency.linearRampToValueAtTime(34, t + 1.4);
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(0.28, t + 0.25);
  gain.gain.linearRampToValueAtTime(0.0001, t + 1.6);
  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + 1.6);

  const shimmer = c.createOscillator();
  shimmer.type = 'sine';
  shimmer.frequency.value = 880;
  const sg = c.createGain();
  envGain(sg, 0.05, 0.4, 1.0, t + 0.2);
  shimmer.connect(sg).connect(c.destination);
  shimmer.start(t + 0.2);
  shimmer.stop(t + 1.6);
}

const SOUND_BY_PROP = {
  vase: playGlassBreak,
  chest: playWoodCreak,
  well: playDrip,
  bookshelf: playPageFlutter,
  mirror: playMirrorCrack,
  altar: playRumble,
};

export function playPropSound(propType) {
  const fn = SOUND_BY_PROP[propType];
  if (fn) fn();
}

// ── Looping ambience: low detuned drone + random distant whispers/creaks ────
export function startAmbience() {
  const c = getCtx();
  if (!c || ambienceHandle) return;

  const master = c.createGain();
  master.gain.value = 0.05;
  master.connect(c.destination);

  const osc1 = c.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.value = 55;
  const osc2 = c.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.value = 58;
  osc1.connect(master);
  osc2.connect(master);
  osc1.start();
  osc2.start();

  const randomEvents = [playWoodCreak, playDrip, playPageFlutter];
  let timeoutId = setRandomTimer();

  function setRandomTimer() {
    const delay = 6000 + Math.random() * 12000;
    return setTimeout(() => {
      const fn = randomEvents[Math.floor(Math.random() * randomEvents.length)];
      fn();
      timeoutId = setRandomTimer();
    }, delay);
  }

  ambienceHandle = { osc1, osc2, master, stop: () => clearTimeout(timeoutId) };
}

export function stopAmbience() {
  if (!ambienceHandle) return;
  const { osc1, osc2, master, stop } = ambienceHandle;
  stop();
  const c = getCtx();
  const t = c.currentTime;
  master.gain.linearRampToValueAtTime(0.0001, t + 0.6);
  osc1.stop(t + 0.65);
  osc2.stop(t + 0.65);
  ambienceHandle = null;
}
