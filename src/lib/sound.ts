/**
 * Tiny Web Audio API jingle generator — no audio files needed.
 *
 * `playYummyJingle()` plays a cheerful little "Yummy Yummy!" style melody,
 * used by the reminder overlay when the child gets a "time to order" push.
 */

let sharedContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!sharedContext) sharedContext = new Ctor();
  if (sharedContext.state === "suspended") sharedContext.resume().catch(() => {});
  return sharedContext;
}

interface Note {
  /** Frequency in Hz. */
  freq: number;
  /** Start time offset in seconds from the jingle's start. */
  start: number;
  /** Duration in seconds. */
  duration: number;
}

// A short, bouncy "Yummy Yummy!" melody — two playful two-note "calls"
// followed by a bright little flourish.
const JINGLE_NOTES: Note[] = [
  { freq: 783.99, start: 0.0, duration: 0.14 }, // G5
  { freq: 659.25, start: 0.16, duration: 0.16 }, // E5
  { freq: 783.99, start: 0.36, duration: 0.14 }, // G5
  { freq: 659.25, start: 0.52, duration: 0.16 }, // E5
  { freq: 880.0, start: 0.74, duration: 0.14 }, // A5
  { freq: 1046.5, start: 0.9, duration: 0.28 }, // C6
];

/**
 * Plays the "Yummy Yummy!" jingle using simple sine-wave oscillators.
 * Safe to call repeatedly; each call uses its own oscillators so overlapping
 * calls just layer (and naturally fade out).
 *
 * Returns the total duration in seconds, or 0 if Web Audio isn't available
 * (e.g. during SSR).
 */
export function playYummyJingle(): number {
  const ctx = getAudioContext();
  if (!ctx) return 0;

  const now = ctx.currentTime;

  for (const note of JINGLE_NOTES) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = note.freq;

    const noteStart = now + note.start;
    const noteEnd = noteStart + note.duration;

    // Quick attack, gentle release — keeps it bright and "boingy" without clicks.
    gain.gain.setValueAtTime(0.0001, noteStart);
    gain.gain.exponentialRampToValueAtTime(0.3, noteStart + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteStart);
    osc.stop(noteEnd + 0.02);
  }

  const last = JINGLE_NOTES[JINGLE_NOTES.length - 1];
  return last.start + last.duration;
}

/**
 * Plays a short, single "ding" — used for the parent's "new order placed"
 * notification sound.
 */
export function playOrderPlacedChime(): number {
  const ctx = getAudioContext();
  if (!ctx) return 0;

  const now = ctx.currentTime;
  const notes: Note[] = [
    { freq: 523.25, start: 0, duration: 0.16 }, // C5
    { freq: 783.99, start: 0.1, duration: 0.3 }, // G5
  ];

  for (const note of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = note.freq;

    const noteStart = now + note.start;
    const noteEnd = noteStart + note.duration;

    gain.gain.setValueAtTime(0.0001, noteStart);
    gain.gain.exponentialRampToValueAtTime(0.25, noteStart + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteStart);
    osc.stop(noteEnd + 0.02);
  }

  const last = notes[notes.length - 1];
  return last.start + last.duration;
}
