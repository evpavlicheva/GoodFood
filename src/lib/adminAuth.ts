// Temporary PIN-based "admin auth" — replace with Supabase Auth
// (email/password or magic link) once the backend is wired up.

export const ADMIN_PIN = "1234";

const STORAGE_KEY = "goodfood:admin-auth";

export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    // Some mobile browsers (e.g. Safari with strict privacy settings) can
    // throw when accessing localStorage — fall back to "not logged in"
    // rather than crashing the whole page.
    return false;
  }
}

export function setAdminAuthenticated(value: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (value) {
      window.localStorage.setItem(STORAGE_KEY, "true");
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors (e.g. quota exceeded or blocked storage) —
    // login will simply need to be repeated next time.
  }
}
