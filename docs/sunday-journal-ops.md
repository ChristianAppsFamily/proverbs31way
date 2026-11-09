# Sunday Journal — production ops checklist

The room at `/#/today` reads from Supabase (same project as the waitlist). Schema is applied on **Proverbs 31 Way** (`gjwgxkfrixknjczmlsef`).

## Status (verified 2026-11-09)

| Item | Status |
|------|--------|
| Email Auth provider enabled | Done (`external.email: true`) |
| Signup allowed | Done (`disable_signup: false`) |
| OTP send + verify + post | Smoke-tested end-to-end |
| Published edition for today (LA) | Done (`2026-11-09`) |
| Production `/#/today` loads Word/Devotional | Done |
| Auth Site URL / redirect allowlist | **You still need this** (currently `http://localhost:3000`) |
| Resend SMTP for Auth emails | **Recommended** (run config script) |
| Vercel `VITE_SUPABASE_*` env | **Recommended** (anon fallback already in code) |

Sign-in UX uses **email + 6-digit code** (works even before Site URL is fixed). Magic-link clicks still need Site URL → `https://proverbs31way.com`.

## You — finish Auth URLs + SMTP (5 minutes)

1. Create a personal access token: https://supabase.com/dashboard/account/tokens  
2. From the repo root:

```bash
SUPABASE_ACCESS_TOKEN=sbp_... node scripts/configure-auth-golive.mjs
```

This sets:
- Site URL `https://proverbs31way.com`
- Redirect allowlist for production + local Vite
- Email provider on
- Resend SMTP when `RESEND_API_KEY` is in `.env.local`

3. Confirm Resend domain `proverbs31way.com` (or your from-domain) is verified so Auth mail does not spam-folder.

## You — Vercel env (recommended)

```bash
npx vercel login
npx vercel link   # if not linked
node scripts/set-vercel-supabase-env.mjs
```

Then **Redeploy Production** (Vite bakes env at build time).

Manual fallback: Vercel → Settings → Environment Variables:
- `VITE_SUPABASE_URL=https://gjwgxkfrixknjczmlsef.supabase.co`
- `VITE_SUPABASE_ANON_KEY=<anon public key>`

## Daily content

Edit/run [`supabase/seed_edition_template.sql`](../supabase/seed_edition_template.sql) for each new America/Los_Angeles day, or upsert in Table Editor. Keep `published_at` set for live days.

## Founding Sisters

On first login, if the email is already on `waitlist`, `profiles.is_founder` is set true.

## Reports

Rows land in `public.reports`. Review in Table Editor until a moderation UI ships.

## Member flow (production)

1. Open `https://proverbs31way.com/#/today`
2. Join → enter email → enter 6-digit code from email
3. Post / reply / Amen
4. Avatar → sign out; same email + new code to return

## Already done in code / project

- Tables: `profiles`, `editions`, `posts`, `post_replies`, `post_reactions`, `reports` + RLS
- Waitlist → founder on signup
- Live `/today` + `/readings/:date`
- Email OTP sign-in UI
- Auto-approve posts; past days blocked by RLS
