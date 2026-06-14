// Temporary PIN-based "admin auth" — replace with Supabase Auth
// (email/password or magic link) once the backend is wired up.

export const ADMIN_PIN = "1234";

const STORAGE_KEY = "goodfood:admin-auth";

export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "true";
}

export function setAdminAuthenticated(value: boolean): void {
  if (typeof window === "undefined") return;
  if (value) {
    window.localStorage.setItem(STORAGE_KEY, "true");
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}
