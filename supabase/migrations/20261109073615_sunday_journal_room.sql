-- Sunday Journal production schema
-- Applied to project gjwgxkfrixknjczmlsef (Proverbs 31 Way)

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  initials text not null,
  is_founder boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_public"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create table if not exists public.editions (
  id uuid primary key default gen_random_uuid(),
  date_iso date not null unique,
  day_label text not null,
  reference text not null,
  translation text not null default 'KJV · Excerpt',
  verse_before text not null default '',
  verse_em text not null,
  verse_after text not null default '',
  title_line_1 text not null,
  title_line_2 text not null,
  question text not null,
  paras jsonb not null default '[]'::jsonb,
  more jsonb not null default '[]'::jsonb,
  archive_label text not null,
  archive_title text not null,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists editions_published_date_idx
  on public.editions (date_iso desc)
  where published_at is not null;

alter table public.editions enable row level security;

create policy "editions_select_published"
  on public.editions for select
  to anon, authenticated
  using (published_at is not null);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  edition_id uuid not null references public.editions (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('reflection', 'prayer')),
  body text not null check (char_length(body) > 0 and char_length(body) <= 240),
  created_at timestamptz not null default now()
);

create index if not exists posts_edition_created_idx
  on public.posts (edition_id, created_at desc);

alter table public.posts enable row level security;

create policy "posts_select_public"
  on public.posts for select
  to anon, authenticated
  using (true);

create policy "posts_insert_own_today"
  on public.posts for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and exists (
      select 1
      from public.editions e
      where e.id = edition_id
        and e.published_at is not null
        and e.date_iso = (timezone('America/Los_Angeles', now()))::date
    )
  );

create table if not exists public.post_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) > 0 and char_length(body) <= 240),
  created_at timestamptz not null default now()
);

create index if not exists post_replies_post_created_idx
  on public.post_replies (post_id, created_at asc);

alter table public.post_replies enable row level security;

create policy "post_replies_select_public"
  on public.post_replies for select
  to anon, authenticated
  using (true);

create policy "post_replies_insert_own_today"
  on public.post_replies for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and exists (
      select 1
      from public.posts p
      join public.editions e on e.id = p.edition_id
      where p.id = post_id
        and e.published_at is not null
        and e.date_iso = (timezone('America/Los_Angeles', now()))::date
    )
  );

create table if not exists public.post_reactions (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.post_reactions enable row level security;

create policy "post_reactions_select_public"
  on public.post_reactions for select
  to anon, authenticated
  using (true);

create policy "post_reactions_insert_own"
  on public.post_reactions for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "post_reactions_delete_own"
  on public.post_reactions for delete
  to authenticated
  using (user_id = auth.uid());

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts (id) on delete cascade,
  reply_id uuid references public.post_replies (id) on delete cascade,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null,
  created_at timestamptz not null default now(),
  constraint reports_target_chk check (
    (post_id is not null and reply_id is null)
    or (post_id is null and reply_id is not null)
  )
);

alter table public.reports enable row level security;

create policy "reports_insert_own"
  on public.reports for insert
  to authenticated
  with check (reporter_id = auth.uid());

create or replace function public.make_initials(raw text)
returns text
language plpgsql
immutable
as $$
declare
  cleaned text := trim(both from coalesce(raw, ''));
  parts text[];
begin
  if cleaned = '' then
    return 'TW';
  end if;
  parts := regexp_split_to_array(cleaned, '\s+');
  if array_length(parts, 1) >= 2 then
    return upper(left(parts[1], 1) || left(parts[array_length(parts, 1)], 1));
  end if;
  return upper(left(cleaned, 2));
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  email_lower text := lower(coalesce(new.email, ''));
  chosen_name text;
  founder boolean := false;
begin
  chosen_name := coalesce(
    nullif(trim(both from new.raw_user_meta_data->>'display_name'), ''),
    nullif(split_part(email_lower, '@', 1), ''),
    'Sister'
  );

  select exists (
    select 1 from public.waitlist w where lower(w.email) = email_lower
  ) into founder;

  insert into public.profiles (id, display_name, initials, is_founder)
  values (
    new.id,
    chosen_name,
    public.make_initials(chosen_name),
    founder
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.ensure_profile()
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  email_lower text;
  chosen_name text;
  founder boolean := false;
  result public.profiles;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  select * into result from public.profiles where id = uid;
  if found then
    return result;
  end if;

  select lower(u.email) into email_lower from auth.users u where u.id = uid;
  chosen_name := coalesce(nullif(split_part(coalesce(email_lower, ''), '@', 1), ''), 'Sister');
  select exists (
    select 1 from public.waitlist w where lower(w.email) = email_lower
  ) into founder;

  insert into public.profiles (id, display_name, initials, is_founder)
  values (uid, chosen_name, public.make_initials(chosen_name), founder)
  on conflict (id) do update set display_name = excluded.display_name
  returning * into result;

  return result;
end;
$$;

grant execute on function public.ensure_profile() to authenticated;
