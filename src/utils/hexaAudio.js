// ─────────────────────────────────────────────────────────────────────────────
// Synthesized sound effects for The Hexa Maze (Web Audio API — no audio files).
// Call unlock() once from a user gesture before anything else plays.
// ─────────────────────────────────────────────────────────────────────────────

let ctx = null;

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
  gainNode.gain.setValueAtTime(0.0001, startAt);
  gainNode.gain.exponentialRampToValueAtTime(peak, startAt + attack);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + attack + decay);
}

function noiseHit(c, t, { duration = 0.15, filterType = 'lowpass', freq = 800, q, peak = 0.3, attack = 0.004, decay = 0.14 }) {
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, duration);
  const filter = c.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.value = freq;
  if (q) filter.Q.value = q;
  const gain = c.createGain();
  envGain(gain, peak, attack, decay, t);
  src.connect(filter).connect(gain).connect(c.destination);
  src.start(t);
  src.stop(t + duration + 0.05);
}

function tone(c, t, { type = 'sine', freq = 440, freqEnd, duration = 0.2, peak = 0.2, attack = 0.005, decay }) {
  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, t + duration);
  const gain = c.createGain();
  envGain(gain, peak, attack, decay ?? duration, t);
  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

// ── Named one-shots ─────────────────────────────────────────────────────────

export function playPageRustle() {
  const c = getCtx(); if (!c) return; const t = c.currentTime;
  for (let i = 0; i < 4; i++) noiseHit(c, t + i * 0.08, { duration: 0.07, filterType: 'bandpass', freq: 2200 + Math.random() * 1200, peak: 0.14, decay: 0.06 });
}

export function playWallCreak() {
  const c = getCtx(); if (!c) return; const t = c.currentTime;
  const osc = c.createOscillator(); osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(80, t);
  osc.frequency.linearRampToValueAtTime(120, t + 0.4);
  const filter = c.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 400;
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(0.14, t + 0.1);
  gain.gain.linearRampToValueAtTime(0.0001, t + 0.7);
  osc.connect(filter).connect(gain).connect(c.destination);
  osc.start(t); osc.stop(t + 0.75);
}

export function playWaterPour() {
  const c = getCtx(); if (!c) return; const t = c.currentTime;
  noiseHit(c, t, { duration: 0.9, filterType: 'lowpass', freq: 1200, peak: 0.18, attack: 0.05, decay: 0.8 });
  for (let i = 0; i < 5; i++) tone(c, t + 0.15 + i * 0.15, { type: 'sine', freq: 700 - i * 60, freqEnd: 300, duration: 0.12, peak: 0.08 });
}

export function playPlantOpen() {
  const c = getCtx(); if (!c) return; const t = c.currentTime;
  noiseHit(c, t, { duration: 0.35, filterType: 'lowpass', freq: 350, peak: 0.3, decay: 0.32 });
  tone(c, t, { type: 'sawtooth', freq: 90, freqEnd: 45, duration: 0.4, peak: 0.15 });
}

export function playLadderDrag() {
  const c = getCtx(); if (!c) return; const t = c.currentTime;
  noiseHit(c, t, { duration: 0.6, filterType: 'highpass', freq: 900, peak: 0.16, attack: 0.05, decay: 0.55 });
}

export function playChime() {
  const c = getCtx(); if (!c) return; const t = c.currentTime;
  [880, 1320, 1760].forEach((f, i) => tone(c, t + i * 0.06, { type: 'sine', freq: f, duration: 0.5, peak: 0.12, decay: 0.45 }));
}

export function playChalkTap() {
  const c = getCtx(); if (!c) return; const t = c.currentTime;
  noiseHit(c, t, { duration: 0.05, filterType: 'highpass', freq: 3500, peak: 0.14, decay: 0.05 });
  noiseHit(c, t + 0.12, { duration: 0.05, filterType: 'highpass', freq: 3200, peak: 0.12, decay: 0.05 });
}

export function playLockClick() {
  const c = getCtx(); if (!c) return; const t = c.currentTime;
  for (let i = 0; i < 3; i++) noiseHit(c, t + i * 0.14, { duration: 0.04, filterType: 'bandpass', freq: 1800 + i * 300, q: 6, peak: 0.22, decay: 0.05 });
}

export function playMetalClank() {
  const c = getCtx(); if (!c) return; const t = c.currentTime;
  tone(c, t, { type: 'triangle', freq: 520, freqEnd: 180, duration: 0.22, peak: 0.2 });
  noiseHit(c, t, { duration: 0.08, filterType: 'highpass', freq: 2000, peak: 0.15, decay: 0.07 });
}

export function playGlassRise() {
  const c = getCtx(); if (!c) return; const t = c.currentTime;
  tone(c, t, { type: 'sine', freq: 220, freqEnd: 660, duration: 1.1, peak: 0.14, attack: 0.3, decay: 1.0 });
}

export function playMusicBoxMelody(duration = 3.4) {
  const c = getCtx(); if (!c) return; const t = c.currentTime;
  const notes = [784, 880, 988, 1175, 988, 880, 784, 659];
  const step = duration / notes.length;
  notes.forEach((f, i) => tone(c, t + i * step, { type: 'triangle', freq: f, duration: step * 0.9, peak: 0.1, attack: 0.01, decay: step * 0.85 }));
}

export function playZipper() {
  const c = getCtx(); if (!c) return; const t = c.currentTime;
  for (let i = 0; i < 10; i++) noiseHit(c, t + i * 0.035, { duration: 0.03, filterType: 'highpass', freq: 3000 + Math.random() * 1500, peak: 0.08, decay: 0.03 });
}

export function playPaperUnfold() {
  const c = getCtx(); if (!c) return; const t = c.currentTime;
  noiseHit(c, t, { duration: 0.5, filterType: 'bandpass', freq: 1500, q: 0.6, peak: 0.12, attack: 0.08, decay: 0.4 });
}

export function playMechClick() {
  const c = getCtx(); if (!c) return; const t = c.currentTime;
  noiseHit(c, t, { duration: 0.05, filterType: 'bandpass', freq: 2500, q: 4, peak: 0.2, decay: 0.05 });
  tone(c, t + 0.06, { type: 'sine', freq: 300, freqEnd: 500, duration: 0.15, peak: 0.08 });
}

export function playCrankTurn() {
  const c = getCtx(); if (!c) return; const t = c.currentTime;
  for (let i = 0; i < 5; i++) noiseHit(c, t + i * 0.16, { duration: 0.05, filterType: 'bandpass', freq: 900 + i * 80, q: 5, peak: 0.16, decay: 0.05 });
}

export function playRugDrag() {
  const c = getCtx(); if (!c) return; const t = c.currentTime;
  noiseHit(c, t, { duration: 0.7, filterType: 'lowpass', freq: 700, peak: 0.15, attack: 0.08, decay: 0.6 });
}

export function playTileLift() {
  const c = getCtx(); if (!c) return; const t = c.currentTime;
  noiseHit(c, t, { duration: 0.2, filterType: 'lowpass', freq: 300, peak: 0.22, decay: 0.18 });
  tone(c, t + 0.15, { type: 'sine', freq: 110, duration: 0.2, peak: 0.12 });
}

export function playMirrorTurn() {
  const c = getCtx(); if (!c) return; const t = c.currentTime;
  tone(c, t, { type: 'sine', freq: 400, freqEnd: 460, duration: 0.5, peak: 0.06, attack: 0.1, decay: 0.4 });
  noiseHit(c, t + 0.45, { duration: 0.04, filterType: 'highpass', freq: 3000, peak: 0.1, decay: 0.04 });
}

export function playLaserDown() {
  const c = getCtx(); if (!c) return; const t = c.currentTime;
  tone(c, t, { type: 'sawtooth', freq: 900, freqEnd: 60, duration: 0.6, peak: 0.12, decay: 0.55 });
}

export function playDoorUnlock() {
  const c = getCtx(); if (!c) return; const t = c.currentTime;
  [523, 659, 784].forEach((f, i) => tone(c, t + i * 0.1, { type: 'triangle', freq: f, duration: 0.4, peak: 0.16, decay: 0.35 }));
}

let footstepToggle = false;

export function playFootstep() {
  const c = getCtx(); if (!c) return; const t = c.currentTime;
  footstepToggle = !footstepToggle;
  const freq = footstepToggle ? 190 : 235; // alternate L/R pitch so steps don't sound mechanical
  noiseHit(c, t, { duration: 0.12, filterType: 'lowpass', freq, peak: 0.24, attack: 0.002, decay: 0.1 });
  noiseHit(c, t + 0.02, { duration: 0.05, filterType: 'highpass', freq: 1800, peak: 0.05, decay: 0.04 });
}

export function playFinaleBlast() {
  const c = getCtx(); if (!c) return; const t = c.currentTime;
  noiseHit(c, t, { duration: 1.8, filterType: 'lowpass', freq: 4000, peak: 0.3, attack: 0.4, decay: 1.6 });
  [220, 330, 440, 660].forEach((f) => tone(c, t, { type: 'sine', freq: f, duration: 2.2, peak: 0.08, attack: 0.5, decay: 2 }));
}

const SOUND_MAP = {
  pageRustle: playPageRustle,
  wallCreak: playWallCreak,
  waterPour: playWaterPour,
  plantOpen: playPlantOpen,
  ladderDrag: playLadderDrag,
  chime: playChime,
  chalkTap: playChalkTap,
  lockClick: playLockClick,
  metalClank: playMetalClank,
  glassRise: playGlassRise,
  zipper: playZipper,
  paperUnfold: playPaperUnfold,
  mechClick: playMechClick,
  crankTurn: playCrankTurn,
  rugDrag: playRugDrag,
  tileLift: playTileLift,
  mirrorTurn: playMirrorTurn,
  laserDown: playLaserDown,
};

export function playSound(name) {
  if (name === 'musicBox') return playMusicBoxMelody();
  const fn = SOUND_MAP[name];
  if (fn) fn();
}

