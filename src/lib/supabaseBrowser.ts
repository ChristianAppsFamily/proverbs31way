import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Browser client for Edge Functions (waitlist). Null if env is missing. */
export const supabaseBrowser: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;
