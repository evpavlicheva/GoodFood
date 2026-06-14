import type { DishAnalysis } from "@/data/dishes";

/** Full result of analyzing a dish photo with AI: nutrition + suggested copy. */
export interface DishPhotoAnalysis extends DishAnalysis {
  /** Suggested dish name in English (empty string if the AI didn't return one) */
  name: string;
  /** Suggested dish name in Russian */
  nameRu: string;
  /** Suggested mascot description in English */
  mascotTip: string;
  /** Suggested mascot description in Russian */
  mascotTipRu: string;
}

/**
 * Analyzes a dish photo using Claude Vision (via the `/api/analyze-dish`
 * server route, so the API key never reaches the browser).
 *
 * Returns nutrition estimates (calories/protein/fat/carbs), a fun fact, and
 * suggested EN/RU copy for the dish name and mascot description. If the AI
 * call fails for any reason (missing API key, network error, etc.), falls
 * back to a small local simulation so the form still works.
 */
export async function analyzeDishPhoto(
  imageDataUrl: string,
  dishName?: string
): Promise<DishPhotoAnalysis> {
  try {
    const response = await fetch("/api/analyze-dish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageDataUrl }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        name: typeof data.name === "string" ? data.name : "",
        nameRu: typeof data.nameRu === "string" ? data.nameRu : "",
        mascotTip: typeof data.mascotTip === "string" ? data.mascotTip : "",
        mascotTipRu: typeof data.mascotTipRu === "string" ? data.mascotTipRu : "",
        calories: Number(data.calories) || 0,
        protein: Number(data.protein) || 0,
        fat: Number(data.fat) || 0,
        carbs: Number(data.carbs) || 0,
        funFact: typeof data.funFact === "string" ? data.funFact : "",
      };
    }

    console.warn("AI photo analysis failed, using placeholder values:", await response.text());
  } catch (err) {
    console.warn("AI photo analysis failed, using placeholder values:", err);
  }

  return simulateAnalysis(dishName);
}

/** Local fallback used if the real AI call isn't available (no API key, offline, etc.). */
function simulateAnalysis(dishName?: string): DishPhotoAnalysis {
  const seed = (dishName?.length ?? 5) * 7 + Math.floor(Math.random() * 40);

  const calories = 150 + (seed % 35) * 10; // ~150-490 kcal
  const protein = 3 + (seed % 15); // 3-17 g
  const fat = 2 + (seed % 12); // 2-13 g
  const carbs = 15 + (seed % 40); // 15-54 g

  const funFacts = [
    "Did you know? Eating colorful foods helps your brain stay sharp! 🧠",
    "Fun fact: Food is fuel — just like a car needs gas, your body needs yummy meals! 🚗",
    "Protein helps your muscles grow strong, just like a superhero! 💪",
    "Carbs give you quick energy for running, jumping, and playing! ⚡",
    "Healthy fats help your brain and body work their best! 🧩",
    "Drinking water with your meal helps your body use food's energy! 💧",
  ];

  return {
    name: "",
    nameRu: "",
    mascotTip: "",
    mascotTipRu: "",
    calories,
    protein,
    fat,
    carbs,
    funFact: funFacts[Math.floor(Math.random() * funFacts.length)],
  };
}
