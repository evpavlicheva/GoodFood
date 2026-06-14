import { supabase } from "./client";

const BUCKET = "dish-images";

/**
 * Uploads a `data:` URL (e.g. a resized dish photo) to the Supabase Storage
 * `dish-images` bucket and returns its public URL.
 *
 * If Supabase isn't configured or the upload fails, returns the original
 * `data:` URL so the app still works (just without cross-device sync for
 * that image).
 */
export async function uploadDishImage(dataUrl: string): Promise<string> {
  if (!supabase) return dataUrl;

  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const ext = blob.type.split("/")[1]?.split("+")[0] || "jpg";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
      contentType: blob.type || "image/jpeg",
      cacheControl: "3600",
    });

    if (error) {
      console.warn("Couldn't upload dish image to Supabase Storage:", error);
      return dataUrl;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl || dataUrl;
  } catch (err) {
    console.warn("Couldn't upload dish image to Supabase Storage:", err);
    return dataUrl;
  }
}
