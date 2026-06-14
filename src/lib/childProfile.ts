import type { MascotId } from "@/components/mascot/mascotData";

export interface ChildProfile {
  name: string;
  mascotId: MascotId;
}

const STORAGE_KEY = "goodfood:child-profile";

/**
 * Local-storage backed profile for the child user. This is a temporary
 * stand-in for Supabase Auth + a `profiles` table — swap these functions
 * for Supabase calls once auth is wired up.
 */
export function getChildProfile(): ChildProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.name === "string" && typeof parsed?.mascotId === "string") {
      return parsed as ChildProfile;
    }
    return null;
  } catch {
    return null;
  }
}

export function setChildProfile(profile: ChildProfile): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function clearChildProfile(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
