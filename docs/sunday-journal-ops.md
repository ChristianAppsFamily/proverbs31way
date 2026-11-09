# Sunday Journal — production ops checklist

The room at `/#/today` reads from Supabase (same project as the waitlist). Schema and a starter edition for today are already applied to **Proverbs 31 Way** (`gjwgxkfrixknjczmlsef`).

## You need to do

1. **Auth → Email**
   - Supabase Dashboard → Authentication → Providers → Email enabled.
   - Prefer magic link (OTP email). Disable password signup if you want email-only.

2. **Auth → URL configuration**
   - Site URL: your production origin (e.g. `https://proverbs31way.com`).
   - Redirect URLs allowlist:
     - `https://proverbs31way.com/`
     - `https://proverbs31way.com/**`
     - `http://localhost:5173/` (local Vite)
   - Magic links redirect to the site origin (PKCE). The app then opens `/#/today`.

3. **Auth email delivery**
   - Default Supabase mail works for testing only.
   - For production: Authentication → Email Templates / SMTP, or custom SMTP via Resend. Verify your from-domain.

4. **Vercel env**
   - `VITE_SUPABASE_URL=https://gjwgxkfrixknjczmlsef.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=<anon key>`
   - Redeploy after setting.

5. **Daily content**
   - Edit and run [`supabase/seed_edition_template.sql`](../supabase/seed_edition_template.sql) in the SQL editor for each new day (or upsert over an existing `date_iso`).
   - Unpublished drafts: set `published_at` to `null`.

6. **Founding Sisters**
   - On first magic-link login, if the email is already on `waitlist`, `profiles.is_founder` is set true automatically.

7. **Reports**
   - Rows land in `public.reports`. Review in Table Editor until a moderation UI ships.

## Already done in code / project

- Tables: `profiles`, `editions`, `posts`, `post_replies`, `post_reactions`, `reports` + RLS
- Waitlist → founder on signup trigger
- Live `/today` + `/readings/:date` UI (no sample sisters, no design preview)
- Auto-approve posts/replies; past days blocked by RLS
- Starter published edition for the current LA calendar day (no dummy posts)

## Later (not this pass)

- Pending approval queue / admin tools
- Hide/delete reported posts
- CMS instead of SQL for editions
- Stripe
