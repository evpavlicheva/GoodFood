import type { MascotId } from "@/components/mascot/mascotData";

export interface ChildProfile {
  name: string;
  mascotId: MascotId;
}

const STORAGE_KEY = "goodfood:child-profile";
const PROFILES_KEY = "goodfood:child-profiles";

/**
 * Local-storage backed profile for the child user. This is a temporary
 * stand-in for Supabase Auth + a `profiles` table — swap these functions
 * for Supabase calls once auth is wired up.
 *
 * Two things are stored:
 * - the *active* profile (who's currently using the app on this device)
 * - a list of *saved* profiles (every child who has ever set up on this
 *   device), so siblings sharing a tablet can switch back and forth
 *   without retyping their name and re-picking their buddy every time.
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

/**
 * Sets the active profile and remembers it in the saved-profiles list for
 * quick switching later.
 */
export function setChildProfile(profile: ChildProfile): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  saveProfileToList(profile);
}

/**
 * Clears the *active* profile only (e.g. when switching users) — the
 * saved-profiles list is left untouched so the child can be picked again
 * later.
 */
export function clearChildProfile(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

/** All profiles ever set up on this device, most recently used first. */
export function getSavedProfiles(): ChildProfile[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PROFILES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p): p is ChildProfile => typeof p?.name === "string" && typeof p?.mascotId === "string"
    );
  } catch {
    return [];
  }
}

/**
 * Adds/updates a profile in the saved-profiles list (matched by name,
 * case-insensitive) and moves it to the front so the most recently used
 * profile shows up first in the switcher.
 */
export function saveProfileToList(profile: ChildProfile): void {
  if (typeof window === "undefined") return;
  const existing = getSavedProfiles().filter(
    (p) => p.name.trim().toLowerCase() !== profile.name.trim().toLowerCase()
  );
  const next = [profile, ...existing];
  try {
    window.localStorage.setItem(PROFILES_KEY, JSON.stringify(next));
  } catch {
    // ignore storage errors (e.g. quota exceeded)
  }
}

/**
 * Removes a profile (matched by name, case-insensitive) from the
 * saved-profiles list — e.g. when a parent cleans up an old/unused child
 * profile from the switcher. Does not touch the *active* profile.
 */
export function removeSavedProfile(name: string): void {
  if (typeof window === "undefined") return;
  const next = getSavedProfiles().filter((p) => p.name.trim().toLowerCase() !== name.trim().toLowerCase());
  try {
    window.localStorage.setItem(PROFILES_KEY, JSON.stringify(next));
  } catch {
    // ignore storage errors (e.g. quota exceeded)
  }
}
