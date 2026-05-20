import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Proverbs 31 Way (linked Supabase project) — public URL + anon key.
 * Safe to ship: anon is scoped by RLS. Override with VITE_* or NEXT_PUBLIC_* on Vercel / .env.local.
 */
const DEFAULT_SUPABASE_URL = "https://gjwgxkfrixknjczmlsef.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdqd2d4a2ZyaXhrbmpjem1sc2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNzA1MDgsImV4cCI6MjA5NDc0NjUwOH0.KXYXCZhNNmV5YINwUuxs1X7UvjbiGyIck-2J8ws_6Ww";

const url =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  DEFAULT_SUPABASE_URL;

const anonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  DEFAULT_SUPABASE_ANON_KEY;

/** Browser client for Edge Functions (waitlist) and public reads. */
export const supabaseBrowser: SupabaseClient = createClient(url, anonKey);
