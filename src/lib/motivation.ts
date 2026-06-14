import { DISHES, type DishCategory } from "@/data/dishes";
import type { CartItem } from "@/context/CartContext";
import type { Lang } from "@/lib/i18n/translations";

/**
 * Placeholder "AI" motivational message generator.
 *
 * This produces a fun, mascot-voiced message based on what's in the cart.
 * Swap this for a real call to `src/lib/ai/` (e.g. an LLM prompt) once the
 * AI integration is wired up — the function signature can stay the same.
 */

const GENERIC_PHRASES: Record<Lang, string[]> = {
  en: [
    "You're going to feel like a superhero after this meal! 🦸",
    "Great choices make great days! 🌟",
    "Your tummy is going to be SO happy! 😋",
    "Eating well = playing well! ⚡",
    "Yum yum yum — this is going to be delicious! 🎈",
  ],
  ru: [
    "После этой еды ты почувствуешь себя супергероем! 🦸",
    "Хорошие выборы делают хорошие дни! 🌟",
    "Твой животик будет ТАК счастлив! 😋",
    "Хорошо есть = хорошо играть! ⚡",
    "Ням-ням-ням — это будет очень вкусно! 🎈",
  ],
};

const CATEGORY_PHRASES: Record<Lang, Partial<Record<DishCategory, string[]>>> = {
  en: {
    Fruits: ["Fruits are nature's candy AND full of vitamins! 🍓"],
    Drinks: ["Stay splashy and hydrated, champion! 💧"],
    Breakfast: ["Best breakfast ever — fuel up for a fun day! ☀️"],
    Main: ["A hearty meal for a hearty adventure! 🚀"],
    Sides: ["Crunchy sidekicks make every meal more fun! 🥕"],
    Desserts: ["A little sweetness for being so awesome! 🍨"],
  },
  ru: {
    Fruits: ["Фрукты — это конфеты от природы, да ещё и с витаминами! 🍓"],
    Drinks: ["Оставайся бодрым и не забывай пить воду, чемпион! 💧"],
    Breakfast: ["Лучший завтрак — заряжайся на весёлый день! ☀️"],
    Main: ["Сытная еда для больших приключений! 🚀"],
    Sides: ["Хрустящие помощники делают еду веселее! 🥕"],
    Desserts: ["Немного сладкого за то, что ты такой молодец! 🍨"],
  },
};

const EMPTY_CART_PHRASE: Record<Lang, string> = {
  en: "Pick something yummy and let's get started! 🍽️",
  ru: "Выбери что-нибудь вкусное, и начнём! 🍽️",
};

export function generateMotivationalMessage(
  items: CartItem[],
  childName?: string,
  lang: Lang = "en"
): string {
  if (items.length === 0) {
    return EMPTY_CART_PHRASE[lang];
  }

  const categories = new Set<DishCategory>();
  items.forEach((item) => {
    const dish = DISHES.find((d) => d.id === item.dishId);
    if (dish) categories.add(dish.category);
  });

  const pool = [...GENERIC_PHRASES[lang]];
  categories.forEach((category) => {
    const phrases = CATEGORY_PHRASES[lang][category];
    if (phrases) pool.push(...phrases);
  });

  const phrase = pool[Math.floor(Math.random() * pool.length)];
  return childName ? `${childName}, ${phrase}` : phrase;
}
