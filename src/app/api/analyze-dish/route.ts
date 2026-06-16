import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-haiku-4-5-20251001";

interface AnalyzeDishResult {
  name: string;
  nameRu: string;
  mascotTip: string;
  mascotTipRu: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  funFact: string;
  ingredients: string[];
}

const PROMPT = `You are a friendly nutrition assistant for "GoodFood", a Duolingo-style meal app for kids (roughly ages 6-15) and their parents.

Look at the attached photo of a dish and respond with ONLY a single JSON object (no markdown fences, no extra text) with this exact shape:

{
  "name": "Short, fun dish name in English (e.g. 'Veggie Power Pasta')",
  "nameRu": "The same dish name translated/adapted into natural Russian",
  "mascotTip": "One short, upbeat sentence (max ~15 words) a cartoon mascot would say about this dish, in English, with one relevant emoji",
  "mascotTipRu": "The same mascot line in natural Russian, with one relevant emoji",
  "calories": <number, estimated kcal for a typical kid-sized portion>,
  "protein": <number, grams>,
  "fat": <number, grams>,
  "carbs": <number, grams>,
  "funFact": "One short, fun, kid-friendly nutrition fact related to this dish, in English, with an emoji",
  "ingredients": ["ingredient1", "ingredient2", "..."]
}

For "ingredients": list the main ingredients visible or implied by the dish (e.g. ["potato", "chicken", "cheese", "tomato"]). Use simple, lowercase singular nouns in English (3-10 ingredients). Be realistic based on what's visible in the photo.
Be realistic but approachable with the nutrition estimates - they're for a child's portion. Keep all text playful and age-appropriate. Respond with raw JSON only.`;

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  let imageDataUrl: unknown;
  try {
    const body = await request.json();
    imageDataUrl = body?.imageDataUrl;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof imageDataUrl !== "string" || !imageDataUrl.startsWith("data:")) {
    return NextResponse.json(
      { error: "imageDataUrl must be a data: URL string." },
      { status: 400 }
    );
  }

  const match = imageDataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    return NextResponse.json({ error: "Couldn't parse the image data URL." }, { status: 400 });
  }
  const [, mediaType, base64Data] = match;

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mediaType, data: base64Data },
              },
              { type: "text", text: PROMPT },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `Anthropic API error (${response.status}): ${errText}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const textBlock = (data?.content ?? []).find(
      (block: { type: string }) => block.type === "text"
    );
    const text: string = textBlock?.text ?? "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "The AI response didn't contain valid JSON." },
        { status: 502 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]) as Partial<AnalyzeDishResult>;

    const rawIngredients = Array.isArray(parsed.ingredients) ? parsed.ingredients : [];
    const result: AnalyzeDishResult = {
      name: String(parsed.name ?? "").trim(),
      nameRu: String(parsed.nameRu ?? "").trim(),
      mascotTip: String(parsed.mascotTip ?? "").trim(),
      mascotTipRu: String(parsed.mascotTipRu ?? "").trim(),
      calories: Math.round(Number(parsed.calories) || 0),
      protein: Math.round(Number(parsed.protein) || 0),
      fat: Math.round(Number(parsed.fat) || 0),
      carbs: Math.round(Number(parsed.carbs) || 0),
      funFact: String(parsed.funFact ?? "").trim(),
      ingredients: rawIngredients.map((i) => String(i).trim().toLowerCase()).filter(Boolean),
    };

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to analyze the photo: ${(err as Error).message}` },
      { status: 500 }
    );
  }
}
