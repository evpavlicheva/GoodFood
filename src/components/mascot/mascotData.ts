// Mascot definitions and emotion configs for the GoodFood mascot system.
// Visuals are emoji placeholders for now — swap `emoji` for real
// illustrations/sprites in `public/mascots/` once they're ready.

export type MascotId = "broccoli" | "carrot" | "apple" | "banana" | "strawberry";

export interface MascotConfig {
  id: MascotId;
  name: string;
  /** Placeholder visual — replace with <Image src="/mascots/..."> later */
  emoji: string;
  /** Soft background behind the mascot */
  bgClass: string;
  /** Color used for the chunky drop-shadow */
  shadowClass: string;
}

export const MASCOTS: MascotConfig[] = [
  {
    id: "broccoli",
    name: "Brocco",
    emoji: "🥦",
    bgClass: "bg-feather-100",
    shadowClass: "shadow-feather-600",
  },
  {
    id: "carrot",
    name: "Carrie",
    emoji: "🥕",
    bgClass: "bg-orange-100",
    shadowClass: "shadow-fox-600",
  },
  {
    id: "apple",
    name: "Appy",
    emoji: "🍎",
    bgClass: "bg-cardinal-50",
    shadowClass: "shadow-cardinal-600",
  },
  {
    id: "banana",
    name: "Bananin",
    emoji: "🍌",
    bgClass: "bg-bee-50",
    shadowClass: "shadow-bee-600",
  },
  {
    id: "strawberry",
    name: "Berry",
    emoji: "🍓",
    bgClass: "bg-beetle-50",
    shadowClass: "shadow-beetle-600",
  },
];

export function getMascot(id: MascotId): MascotConfig {
  return MASCOTS.find((m) => m.id === id) ?? MASCOTS[0];
}

export type MascotEmotion =
  | "idle"
  | "happy"
  | "excited"
  | "surprised"
  | "thinking"
  | "cheering";

interface EmotionConfig {
  /** Small badge emoji shown on the mascot for this emotion (empty = none) */
  badge: string;
  /** Default speech-bubble phrases for this emotion (English) */
  phrases: string[];
  /** Default speech-bubble phrases for this emotion (Russian) */
  phrasesRu: string[];
}

export const EMOTION_CONFIG: Record<MascotEmotion, EmotionConfig> = {
  idle: {
    badge: "",
    phrases: [],
    phrasesRu: [],
  },
  happy: {
    badge: "😊",
    phrases: ["Yay!", "Nice one!", "Super!"],
    phrasesRu: ["Ура!", "Отлично!", "Супер!"],
  },
  excited: {
    badge: "🤩",
    phrases: ["Wooow!", "Let's go!", "Awesome!!"],
    phrasesRu: ["Вааау!", "Поехали!", "Круто!!"],
  },
  surprised: {
    badge: "😲",
    phrases: ["Whoa!", "Really?!", "No way!"],
    phrasesRu: ["Ого!", "Правда?!", "Не может быть!"],
  },
  thinking: {
    badge: "🤔",
    phrases: ["Hmm...", "Let me think...", "One sec..."],
    phrasesRu: ["Хм...", "Дай подумать...", "Секундочку..."],
  },
  cheering: {
    badge: "🎉",
    phrases: ["Ypssss!", "You did it!", "Hooray!"],
    phrasesRu: ["Йессс!", "Ты молодец!", "Ура!"],
  },
};

/** Get the localized speech-bubble phrases for an emotion. */
export function getEmotionPhrases(emotion: MascotEmotion, lang: "en" | "ru"): string[] {
  const config = EMOTION_CONFIG[emotion];
  return lang === "ru" ? config.phrasesRu : config.phrases;
}
