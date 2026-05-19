import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Browser client — use in Client Components */
export const supabase = createClientComponentClient({
  supabaseUrl,
  supabaseKey,
});

/** Server client — use in Server Components and Next.js edge routes */
export const supabaseServer = createServerComponentClient({
  cookies,
  supabaseUrl,
  supabaseKey,
});
