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
 * "Yummy Time!" jingle — plays the uploaded MP3 ringtone.
 * Falls back to Web Audio tones if Audio isn't available.
 */
export function playYummyJingle(): number {
  if (typeof window !== "undefined") {
    try {
      const audio = new Audio("/sounds/yummy.mp3");
      audio.volume = 1;
      audio.play().catch(() => {
        // Autoplay blocked — fall through to Web Audio below
        playYummyJingleFallback();
      });
      return 3; // approximate mp3 duration
    } catch {
      // ignore, fall through
    }
  }
  return playYummyJingleFallback();
}

function playYummyJingleFallback(): number {
  const ctx = getAudioContext();
  if (!ctx) return 0;

  ctx.resume().catch(() => {});

  const now = ctx.currentTime;
  const TOTAL = 1.3;

  // Periodic resume guard — iOS suspends AudioContext mid-playback.
  const guard = setInterval(() => ctx.resume().catch(() => {}), 80);
  setTimeout(() => clearInterval(guard), TOTAL * 1000 + 200);

  // Silent keepalive oscillator.
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

  // — Melody —
  const notes: Note[] = [
    { freq: 523.25, start: 0.0,  duration: 0.07 },
    { freq: 659.25, start: 0.07, duration: 0.07 },
    { freq: 783.99, start: 0.14, duration: 0.07 },
    { freq: 1046.5, start: 0.21, duration: 0.07 },
    { freq: 1318.5, start: 0.28, duration: 0.20, gain: 0.30 },
    { freq: 1046.5, start: 0.28, duration: 0.20, gain: 0.20 },
    { freq: 659.25, start: 0.28, duration: 0.20, gain: 0.15, type: "sine" },
    { freq: 1568.0, start: 0.52, duration: 0.08, gain: 0.20 },
    { freq: 1760.0, start: 0.60, duration: 0.08, gain: 0.20 },
    { freq: 2093.0, start: 0.68, duration: 0.08, gain: 0.18 },
    { freq: 1046.5, start: 0.80, duration: 0.28, gain: 0.28 },
    { freq: 1318.5, start: 0.80, duration: 0.28, gain: 0.16, type: "sine" },
  ];
  for (const n of notes) scheduleNote(ctx, n, now);

  // — Voice via SpeechSynthesis (pre-warmed by useSpeechSynthesisPrimer) —
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    setTimeout(() => {
      try {
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance("Yummy Time!");
        utt.lang = "en-US";
        utt.rate = 0.95;
        utt.pitch = 1.7;
        utt.volume = 1;
        window.speechSynthesis.speak(utt);
      } catch { /* ignore */ }
    }, 350);
  }

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
