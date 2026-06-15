import { DEFAULT_UNLOCKED_MASCOTS, type MascotId } from "@/components/mascot/mascotData";

export interface ChildProfile {
  name: string;
  mascotId: MascotId;
  /** Coins earned from healthy meals, spendable on snacks and mascot buddies. */
  coins: number;
  /** Mascot buddies this child has unlocked (broccoli is free for everyone). */
  unlockedMascots: MascotId[];
}

const STORAGE_KEY = "goodfood:child-profile";
const PROFILES_KEY = "goodfood:child-profiles";
const ADD_NEW_FLAG_KEY = "goodfood:setup-add-new";

/**
 * Fills in defaults for fields added after a profile was first saved, so
 * profiles created before the coins feature still load correctly.
 */
function normalizeProfile(p: {
  name: string;
  mascotId: MascotId;
  coins?: number;
  unlockedMascots?: MascotId[];
}): ChildProfile {
  const unlocked = new Set<MascotId>(p.unlockedMascots ?? DEFAULT_UNLOCKED_MASCOTS);
  // Whichever buddy the child is currently playing as counts as unlocked.
  unlocked.add(p.mascotId);
  for (const id of DEFAULT_UNLOCKED_MASCOTS) unlocked.add(id);
  return {
    name: p.name,
    mascotId: p.mascotId,
    coins: typeof p.coins === "number" && p.coins >= 0 ? p.coins : 0,
    unlockedMascots: Array.from(unlocked),
  };
}

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
      return normalizeProfile(parsed);
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
    return parsed
      .filter((p): p is ChildProfile => typeof p?.name === "string" && typeof p?.mascotId === "string")
      .map(normalizeProfile);
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

/**
 * Marks that the next visit to /setup should go straight to the "add a new
 * player" name/mascot form, even if saved profiles exist (used by the
 * profile switcher's "Add a child" button — without this, /setup would
 * just show the "Who is here?" picker again).
 */
export function requestNewProfileSetup(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(ADD_NEW_FLAG_KEY, "1");
  } catch {
    // ignore storage errors
  }
}

/** Reads and clears the "add new player" flag set by `requestNewProfileSetup`. */
export function consumeNewProfileSetupFlag(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const flag = window.sessionStorage.getItem(ADD_NEW_FLAG_KEY);
    if (flag) window.sessionStorage.removeItem(ADD_NEW_FLAG_KEY);
    return !!flag;
  } catch {
    return false;
  }
}

/**
 * Adjusts a child's coin balance by `delta` (positive to award, negative to
 * spend/refund-back), matched by name (case-insensitive). Updates both the
 * saved-profiles list and the active profile (if it's the same child) so the
 * change is reflected immediately if that profile is currently in use.
 *
 * Used e.g. when a parent cancels an order containing snacks — the coins
 * spent on those snacks are refunded back to the child.
 */
export function adjustProfileCoins(name: string, delta: number): void {
  if (typeof window === "undefined" || !delta) return;
  const target = name.trim().toLowerCase();

  const saved = getSavedProfiles();
  let found = false;
  const nextSaved = saved.map((p) => {
    if (p.name.trim().toLowerCase() !== target) return p;
    found = true;
    return { ...p, coins: Math.max(0, p.coins + delta) };
  });
  if (found) {
    try {
      window.localStorage.setItem(PROFILES_KEY, JSON.stringify(nextSaved));
    } catch {
      // ignore storage errors
    }
  }

  const active = getChildProfile();
  if (active && active.name.trim().toLowerCase() === target) {
    const updated = { ...active, coins: Math.max(0, active.coins + delta) };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage errors
    }
  }
}
