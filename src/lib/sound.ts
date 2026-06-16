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
 * "Yummy Time!" jingle — bright ascending fanfare + chord hit + bounce,
 * followed by a synthesised voice saying "Yummy Time!".
 */
export function playYummyJingle(): number {
  const ctx = getAudioContext();
  if (!ctx) return 0;

  const now = ctx.currentTime;

  // — Kick drum (pitch-swept sine) —
  const kick = ctx.createOscillator();
  const kickGain = ctx.createGain();
  kick.type = "sine";
  kick.frequency.setValueAtTime(220, now);
  kick.frequency.exponentialRampToValueAtTime(40, now + 0.18);
  kickGain.gain.setValueAtTime(0.55, now);
  kickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
  kick.connect(kickGain);
  kickGain.connect(ctx.destination);
  kick.start(now);
  kick.stop(now + 0.2);

  // — Melody: quick ascending run → chord hit → sparkle bounce —
  const notes: Note[] = [
    // Ascending run (C5 E5 G5 C6)
    { freq: 523.25, start: 0.0,  duration: 0.07 },
    { freq: 659.25, start: 0.07, duration: 0.07 },
    { freq: 783.99, start: 0.14, duration: 0.07 },
    { freq: 1046.5, start: 0.21, duration: 0.07 },

    // Big chord hit — C major in three octaves
    { freq: 1318.5, start: 0.28, duration: 0.22, gain: 0.32 },  // E6
    { freq: 1046.5, start: 0.28, duration: 0.22, gain: 0.22 },  // C6
    { freq: 659.25, start: 0.28, duration: 0.22, gain: 0.18, type: "sine" }, // E5

    // Sparkle bounce
    { freq: 1568.0, start: 0.52, duration: 0.09, gain: 0.22 },  // G6
    { freq: 1760.0, start: 0.61, duration: 0.09, gain: 0.22 },  // A6
    { freq: 2093.0, start: 0.70, duration: 0.09, gain: 0.20 },  // C7

    // Resolve
    { freq: 1046.5, start: 0.82, duration: 0.28, gain: 0.30 },  // C6
    { freq: 1318.5, start: 0.82, duration: 0.28, gain: 0.18, type: "sine" }, // E6 harmony
  ];

  for (const note of notes) {
    scheduleNote(ctx, note, now);
  }

  // — Voice: "Yummy Time!" via SpeechSynthesis —
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    const say = () => {
      const utt = new SpeechSynthesisUtterance("Yummy Time!");
      utt.lang = "en-US";
      utt.rate = 1.05;
      utt.pitch = 1.6;
      utt.volume = 1;
      window.speechSynthesis.cancel(); // clear any queued speech
      window.speechSynthesis.speak(utt);
    };
    // Let the musical fanfare start first, then the voice kicks in
    setTimeout(say, 320);
  }

  return 1.1; // total musical duration in seconds
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
