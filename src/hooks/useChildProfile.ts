"use client";

// Re-exported from ChildProfileContext so existing imports keep working.
// The profile now lives in a shared context (see ChildProfileContext.tsx)
// instead of a plain hook, so every page sees the same up-to-date value.
export { useChildProfile } from "@/context/ChildProfileContext";
export type { ChildProfile } from "@/lib/childProfile";
