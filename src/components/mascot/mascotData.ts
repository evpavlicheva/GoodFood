// Mascot definitions and emotion configs for the GoodFood mascot system.
// Each mascot has a real illustration in `public/mascots/` (rendered via
// next/image) plus an `emoji` fallback used in tiny UI spots (nav badges,
// demo page) where a full image would be overkill.

export type MascotId = "broccoli" | "carrot" | "apple" | "banana" | "strawberry";

export interface MascotConfig {
  id: MascotId;
  name: string;
  /** Small emoji fallback for compact UI (nav links, badges, etc.) */
  emoji: string;
  /** Illustration shown by the <Mascot> component */
  image: string;
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
    image: "/mascots/broccoli.png",
    bgClass: "bg-feather-100",
    shadowClass: "shadow-feather-600",
  },
  {
    id: "carrot",
    name: "Carrie",
    emoji: "🥕",
    image: "/mascots/carrot.png",
    bgClass: "bg-orange-100",
    shadowClass: "shadow-fox-600",
  },
  {
    id: "apple",
    name: "Appy",
    emoji: "🍎",
    image: "/mascots/apple.png",
    bgClass: "bg-cardinal-50",
    shadowClass: "shadow-cardinal-600",
  },
  {
    id: "banana",
    name: "Blubby",
    emoji: "🫐",
    image: "/mascots/blueberry.png",
    bgClass: "bg-macaw-50",
    shadowClass: "shadow-macaw-600",
  },
  {
    id: "strawberry",
    name: "Berry",
    emoji: "🍓",
    image: "/mascots/strawberry.png",
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
