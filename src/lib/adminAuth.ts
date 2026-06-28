// Temporary PIN-based "admin auth" — replace with Supabase Auth
// (email/password or magic link) once the backend is wired up.

export const ADMIN_PIN = "1234";

const STORAGE_KEY = "goodfood:admin-auth";

/**
 * Module-level in-memory flag — survives client-side navigation within the
 * same browser session even when localStorage is blocked (e.g. iOS Safari
 * in Private Browsing mode or with strict privacy settings).
 */
let _memAuth = false;

export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  // Memory flag is the source of truth — set on login/logout in this session.
  if (_memAuth) return true;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function setAdminAuthenticated(value: boolean): void {
  _memAuth = value;
  if (typeof window === "undefined") return;
  try {
    if (value) {
      window.localStorage.setItem(STORAGE_KEY, "true");
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors — memory flag still keeps the session alive.
  }
}
