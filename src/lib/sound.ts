/**
 * Tiny Web Audio API jingle generator — no audio files needed.
 *
 * `playYummyJingle()` plays a bright fanfare + "Yummy Time!" voice via
 * SpeechSynthesis, used by the reminder overlay.
 */

let sharedContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!sharedContext) sharedContext = new Ctor();
  if (sharedContext.state === "suspended") sharedContext.resume().catch(() => {});
  return sharedContext;
}

interface Note {
  freq: number;
  start: number;
  duration: number;
  gain?: number;
  type?: OscillatorType;
}

/** Schedules a single oscillator note on the given AudioContext. */
function scheduleNote(ctx: AudioContext, note: Note, baseTime: number) {
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.type = note.type ?? "triangle";
  osc.frequency.value = note.freq;

  const t0 = baseTime + note.start;
  const t1 = t0 + note.duration;
  const peak = note.gain ?? 0.28;

  gainNode.gain.setValueAtTime(0.0001, t0);
  gainNode.gain.exponentialRampToValueAtTime(peak, t0 + 0.015);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, t1);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t1 + 0.02);
}

/**
 * Schedules a "sung" syllable using a sawtooth oscillator through two
 * bandpass filters — gives a rough vocal/singing timbre without any audio
 * files or SpeechSynthesis (which is blocked on mobile without a user tap).
 */
function scheduleSung(
  ctx: AudioContext,
  freqStart: number,
  freqEnd: number,
  t0: number,
  duration: number,
  peakGain = 0.18,
) {
  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(freqStart, t0);
  osc.frequency.exponentialRampToValueAtTime(freqEnd, t0 + duration * 0.8);

  // Two bandpass filters approximate the first two vocal formants.
  const f1 = ctx.createBiquadFilter();
  f1.type = "bandpass";
  f1.frequency.value = 800;
  f1.Q.value = 2.5;

  const f2 = ctx.createBiquadFilter();
  f2.type = "bandpass";
  f2.frequency.value = 1400;
  f2.Q.value = 3;

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0.0001, t0);
  gainNode.gain.exponentialRampToValueAtTime(peakGain, t0 + 0.025);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  osc.connect(f1); osc.connect(f2);
  f1.connect(gainNode); f2.connect(gainNode);
  gainNode.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

/**
 * "Yummy Time!" jingle — bright fanfare then a "sung" Yum-my-Time melody
 * using Web Audio formant synthesis (works on mobile without user gesture).
 */
export function playYummyJingle(): number {
  const ctx = getAudioContext();
  if (!ctx) return 0;

  ctx.resume().catch(() => {});

  const now = ctx.currentTime;
  const TOTAL = 1.6;

  // Periodic resume guard — iOS loves to suspend the context mid-playback.
  const guard = setInterval(() => ctx.resume().catch(() => {}), 80);
  setTimeout(() => clearInterval(guard), TOTAL * 1000 + 200);

  // — Silent keepalive —
  const keepalive = ctx.createOscillator();
  const keepGain = ctx.createGain();
  keepGain.gain.value = 0;
  keepalive.connect(keepGain);
  keepGain.connect(ctx.destination);
  keepalive.start(now);
  keepalive.stop(now + TOTAL + 0.1);

  // — Kick drum —
  const kick = ctx.createOscillator();
  const kickGain = ctx.createGain();
  kick.type = "sine";
  kick.frequency.setValueAtTime(200, now);
  kick.frequency.exponentialRampToValueAtTime(40, now + 0.18);
  kickGain.gain.setValueAtTime(0.5, now);
  kickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
  kick.connect(kickGain); kickGain.connect(ctx.destination);
  kick.start(now); kick.stop(now + 0.2);

  // — Fanfare melody (C5 → E5 → G5 → C6 run, then chord) —
  const fanfare: Note[] = [
    { freq: 523.25, start: 0.0,  duration: 0.07 },
    { freq: 659.25, start: 0.07, duration: 0.07 },
    { freq: 783.99, start: 0.14, duration: 0.07 },
    { freq: 1046.5, start: 0.21, duration: 0.07 },
    // Chord hit
    { freq: 1318.5, start: 0.28, duration: 0.20, gain: 0.30 },
    { freq: 1046.5, start: 0.28, duration: 0.20, gain: 0.20 },
    { freq: 659.25, start: 0.28, duration: 0.20, gain: 0.15, type: "sine" },
  ];
  for (const n of fanfare) scheduleNote(ctx, n, now);

  // — Sung "Yum-my Time!" (sawtooth + formant filters) —
  // "Yum"  E4→G4
  scheduleSung(ctx, 329.63, 392.00, now + 0.55, 0.22, 0.22);
  // "my"   G4→A4
  scheduleSung(ctx, 392.00, 440.00, now + 0.80, 0.18, 0.20);
  // "Time!" A4→C5 (rising exclamation)
  scheduleSung(ctx, 440.00, 523.25, now + 1.01, 0.28, 0.24);

  // — Sparkle over the voice —
  const sparkle: Note[] = [
    { freq: 2093.0, start: 0.56, duration: 0.07, gain: 0.16 }, // C7
    { freq: 1760.0, start: 0.82, duration: 0.07, gain: 0.14 }, // A6
    { freq: 2093.0, start: 1.02, duration: 0.10, gain: 0.16 }, // C7
  ];
  for (const n of sparkle) scheduleNote(ctx, n, now);

  return TOTAL;
}

/**
 * Short "ding" for the parent's "new order placed" notification.
 */
export function playOrderPlacedChime(): number {
  const ctx = getAudioContext();
  if (!ctx) return 0;

  const now = ctx.currentTime;

  const notes: Note[] = [
    { freq: 523.25, start: 0.0,  duration: 0.14, type: "sine" }, // C5
    { freq: 783.99, start: 0.12, duration: 0.14, type: "sine" }, // G5
    { freq: 1046.5, start: 0.26, duration: 0.30, type: "sine", gain: 0.22 }, // C6
  ];

  for (const note of notes) {
    scheduleNote(ctx, note, now);
  }

  return 0.56;
}
