import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isConfigured =
  !!supabaseUrl &&
  !!supabaseAnonKey &&
  !supabaseUrl.includes("your-project-url") &&
  !supabaseAnonKey.includes("your-anon-key");

/**
 * Shared Supabase client for the browser (and client components).
 *
 * `null` if `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
 * aren't configured — contexts fall back to local seed data / in-memory
 * state in that case so the app still runs without a backend.
 */
export const supabase: SupabaseClient | null = isConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;
