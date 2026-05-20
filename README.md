# proverbs31way

[Proverbs31Way.com](https://proverbs31way.com) — a faith-based women's community platform serving the daughters of God.

## Stack

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- Supabase (auth, database, edge functions)
- Resend, Stripe, Vercel

## Development

```bash
npm install
npm run dev
```

### Waitlist (Vite landing)

The marketing site calls `join-waitlist` using the browser Supabase client. Set in **`.env.local`** (and in **Vercel → Environment Variables** for production builds):

- `VITE_SUPABASE_URL` — e.g. `https://<project-ref>.supabase.co`
- `VITE_SUPABASE_ANON_KEY` — Dashboard → Settings → API → **anon public** key

Vite only exposes variables prefixed with `VITE_` by default; this repo also exposes `NEXT_PUBLIC_*` so the same Vercel vars as Next.js work. The browser client falls back to the linked production Supabase project URL and **public anon** key when env is unset (so static builds still work); override with env for forks or staging.

Redeploy on Vercel after adding or changing these.
