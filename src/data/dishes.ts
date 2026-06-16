export type DishCategory =
  | "Breakfast"
  | "Main"
  | "Sides"
  | "Desserts"
  | "Drinks"
  | "Fruits"
  | "Snacks";

/** Simulated AI (Claude Vision) photo analysis results */
export interface DishAnalysis {
  calories: number;
  /** grams of protein */
  protein: number;
  /** grams of fat */
  fat: number;
  /** grams of carbohydrates */
  carbs: number;
  funFact: string;
}

export interface Dish {
  id: string;
  name: string;
  category: DishCategory;
  /** Path under /public, or a data: URL for admin-uploaded photos */
  image: string;
  /** Emoji shown if the photo isn't available yet */
  emoji: string;
  /** Short, fun, mascot-voiced description */
  mascotTip: string;
  /** Preparation time in minutes */
  prepTime: number;
  /** Filled in once a photo has been analyzed by AI */
  analysis?: DishAnalysis;
  /** Russian translation of `name` (falls back to `name` if missing) */
  nameRu?: string;
  /** Russian translation of `mascotTip` (falls back to `mascotTip` if missing) */
  mascotTipRu?: string;
  /** When false, the dish is shown greyed-out and can't be added to the cart. Defaults to true. */
  available?: boolean;
  /**
   * Coin value of this dish.
   * - For healthy categories (everything except Snacks): how many coins the
   *   child *earns* per portion when an order containing this dish is placed.
   *   Sensible default is 1-3, set by `DEFAULT_COIN_VALUE` below; editable by
   *   the parent in the dish form.
   * - For the Snacks category: how many coins the dish *costs* to add to the
   *   cart (1-20), set by the parent.
   */
  coinValue?: number;
  /** List of ingredients (populated by AI photo analysis, editable by parent). */
  ingredients?: string[];
}

export const CATEGORIES: DishCategory[] = [
  "Breakfast",
  "Main",
  "Sides",
  "Desserts",
  "Drinks",
  "Fruits",
  "Snacks",
];

export const CATEGORY_EMOJI: Record<"All" | DishCategory, string> = {
  All: "🌈",
  Breakfast: "🍳",
  Main: "🍽️",
  Sides: "🥕",
  Desserts: "🍨",
  Drinks: "🥤",
  Fruits: "🍎",
  Snacks: "🍬",
};

/** Sensible default coin value per category — used when a dish has no `coinValue` set. */
export const DEFAULT_COIN_VALUE: Record<DishCategory, number> = {
  Breakfast: 2,
  Main: 3,
  Sides: 2,
  Desserts: 1,
  Drinks: 1,
  Fruits: 1,
  Snacks: 5,
};

/** Whether this dish belongs to the "treats" category (costs coins instead of earning them). */
export function isSnack(dish: Dish): boolean {
  return dish.category === "Snacks";
}

/** Resolved coin value for a dish, falling back to the category default. */
export function getCoinValue(dish: Dish): number {
  return dish.coinValue ?? DEFAULT_COIN_VALUE[dish.category];
}

/** Localized dish name — falls back to the English name if no translation exists. */
export function getDishName(dish: Dish, lang: "en" | "ru"): string {
  return lang === "ru" && dish.nameRu ? dish.nameRu : dish.name;
}

/** Localized mascot tip — falls back to the English tip if no translation exists. */
export function getDishTip(dish: Dish, lang: "en" | "ru"): string {
  return lang === "ru" && dish.mascotTipRu ? dish.mascotTipRu : dish.mascotTip;
}

export const DISHES: Dish[] = [
  // Breakfast
  {
    id: "pancake-condensed-milk",
    name: "Pancakes with Condensed Milk",
    nameRu: "Блинчики со сгущёнкой",
    category: "Breakfast",
    image: "/dishes/pancake with condition milk.jpg",
    emoji: "🥞",
    mascotTip: "Sweet, fluffy and ready to make your morning shine! ☀️",
    mascotTipRu: "Сладкие, пышные блинчики — твоё утро заиграет! ☀️",
    prepTime: 10,
  },
  {
    id: "pancake-honey",
    name: "Pancakes with Honey",
    nameRu: "Блинчики с мёдом",
    category: "Breakfast",
    image: "/dishes/pancake with honey.jpg",
    emoji: "🥞",
    mascotTip: "A golden drizzle of honey on fluffy pancakes — yum! 🍯",
    mascotTipRu: "Золотистый мёд на пышных блинчиках — ммм! 🍯",
    prepTime: 10,
  },
  {
    id: "pancake-nutella",
    name: "Pancakes with Nutella",
    nameRu: "Блинчики с Нутеллой",
    category: "Breakfast",
    image: "/dishes/pancake with nutella.jpg",
    emoji: "🥞",
    mascotTip: "Chocolatey goodness to start your day with a smile! 🍫",
    mascotTipRu: "Шоколадная радость для улыбки с самого утра! 🍫",
    prepTime: 10,
    coinValue: 1,
  },
  {
    id: "pancake-strawberry-jam",
    name: "Pancakes with Strawberry Jam",
    nameRu: "Блинчики с клубничным джемом",
    category: "Breakfast",
    image: "/dishes/pancake with strawberry jam.jpg",
    emoji: "🥞",
    mascotTip: "Berry sweet pancakes for a berry good morning! 🍓",
    mascotTipRu: "Ягодно-сладкие блинчики для ягодно-доброго утра! 🍓",
    prepTime: 10,
  },

  // Main
  {
    id: "veggie-pasta",
    name: "Veggie Power Pasta",
    nameRu: "Овощная паста-силач",
    category: "Main",
    image: "/dishes/veggie-pasta.jpg",
    emoji: "🍝",
    mascotTip: "Brocco says: noodles + veggies = super energy! 💪",
    mascotTipRu: "Брокко говорит: паста + овощи = супер-энергия! 💪",
    prepTime: 15,
  },
  {
    id: "chicken-wrap",
    name: "Sunshine Chicken Wrap",
    nameRu: "Солнечный ролл с курицей",
    category: "Main",
    image: "/dishes/chicken-wrap.jpg",
    emoji: "🌯",
    mascotTip: "Protein power wrapped up for your big day! ☀️",
    mascotTipRu: "Белковая сила, завёрнутая для большого дня! ☀️",
    prepTime: 10,
  },
  {
    id: "veggie-pizza",
    name: "Cheesy Veggie Pizza",
    nameRu: "Сырная овощная пицца",
    category: "Main",
    image: "/dishes/veggie-pizza.jpg",
    emoji: "🍕",
    mascotTip: "Pizza night, but make it veggie-tastic! 🧀",
    mascotTipRu: "Вечер пиццы, но по-овощному вкусно! 🧀",
    prepTime: 20,
  },
  {
    id: "rice-bowl",
    name: "Golden Rice Bowl",
    nameRu: "Золотая рисовая тарелка",
    category: "Main",
    image: "/dishes/rice-bowl.jpg",
    emoji: "🍚",
    mascotTip: "A cozy bowl of goodness to fuel your fun! ✨",
    mascotTipRu: "Уютная тарелка добра для весёлых приключений! ✨",
    prepTime: 12,
  },

  // Sides
  {
    id: "veggie-sticks",
    name: "Crispy Veggie Sticks",
    nameRu: "Хрустящие овощные палочки",
    category: "Sides",
    image: "/dishes/veggie-sticks.jpg",
    emoji: "🥕",
    mascotTip: "Crunchy, munchy, super healthy! 🥒",
    mascotTipRu: "Хрустяшки-вкусняшки, супер полезно! 🥒",
    prepTime: 5,
  },

  // Desserts
  {
    id: "yogurt-cup",
    name: "Fruit Yogurt Cup",
    nameRu: "Фруктовый йогурт",
    category: "Desserts",
    image: "/dishes/yogurt-cup.jpg",
    emoji: "🍨",
    mascotTip: "Creamy, fruity, and oh-so-tasty! 🍓",
    mascotTipRu: "Кремовый, фруктовый и очень вкусный! 🍓",
    prepTime: 5,
  },

  // Drinks
  {
    id: "berry-smoothie",
    name: "Berry Blast Smoothie",
    nameRu: "Ягодный смузи-взрыв",
    category: "Drinks",
    image: "/dishes/berry-smoothie.jpg",
    emoji: "🥤",
    mascotTip: "Sip sip hooray — bursting with berries! 🍓",
    mascotTipRu: "Глоток за глотком — взрыв ягодного вкуса! 🍓",
    prepTime: 3,
  },
  {
    id: "apple-juice",
    name: "Fresh Apple Juice",
    nameRu: "Свежий яблочный сок",
    category: "Drinks",
    image: "/dishes/apple-juice.jpg",
    emoji: "🧃",
    mascotTip: "Squeezed fresh just for you! 🍏",
    mascotTipRu: "Свежевыжатый специально для тебя! 🍏",
    prepTime: 3,
  },

  // Fruits
  {
    id: "fruit-salad",
    name: "Rainbow Fruit Salad",
    nameRu: "Радужный фруктовый салат",
    category: "Fruits",
    image: "/dishes/fruit-salad.jpg",
    emoji: "🥗",
    mascotTip: "So many colors, so many vitamins! 🌈",
    mascotTipRu: "Столько цветов, столько витаминов! 🌈",
    prepTime: 5,
  },
  {
    id: "banana-bites",
    name: "Banana Bites",
    nameRu: "Бананчики-кусочки",
    category: "Fruits",
    image: "/dishes/banana-bites.jpg",
    emoji: "🍌",
    mascotTip: "Sweet little bites of banana sunshine! 🍌",
    mascotTipRu: "Сладкие кусочки бананового солнышка! 🍌",
    prepTime: 2,
  },

  // Snacks — treats the child can buy with coins earned from healthy meals
  {
    id: "snack-chips",
    name: "Crunchy Chips",
    nameRu: "Хрустящие чипсы",
    category: "Snacks",
    image: "/dishes/snack-chips.jpg",
    emoji: "🍟",
    mascotTip: "A crunchy treat — earned with your coins! 🪙",
    mascotTipRu: "Хрустящая вкусняшка — на заработанные монетки! 🪙",
    prepTime: 1,
    coinValue: 6,
  },
  {
    id: "snack-cookie",
    name: "Choco Chip Cookie",
    nameRu: "Печенье с шоколадом",
    category: "Snacks",
    image: "/dishes/snack-cookie.jpg",
    emoji: "🍪",
    mascotTip: "Sweet, chewy, and worth every coin! 🪙",
    mascotTipRu: "Сладкое, мягкое и стоит каждой монетки! 🪙",
    prepTime: 1,
    coinValue: 4,
  },
  {
    id: "snack-candy",
    name: "Fruity Candy",
    nameRu: "Фруктовые конфеты",
    category: "Snacks",
    image: "/dishes/snack-candy.jpg",
    emoji: "🍬",
    mascotTip: "A tiny treat for your sweet tooth! 🪙",
    mascotTipRu: "Маленькая радость для сладкоежки! 🪙",
    prepTime: 1,
    coinValue: 3,
  },
];
