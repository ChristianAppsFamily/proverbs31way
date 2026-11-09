-- Template: publish (or replace) a daily Sunday Journal edition.
-- 1. Edit the values below.
-- 2. Run in Supabase SQL editor (project: Proverbs 31 Way / gjwgxkfrixknjczmlsef).
-- 3. Leave posts empty — the Gathering fills from live members.

insert into public.editions (
  date_iso,
  day_label,
  reference,
  translation,
  verse_before,
  verse_em,
  verse_after,
  title_line_1,
  title_line_2,
  question,
  paras,
  more,
  archive_label,
  archive_title,
  published_at
) values (
  -- Use today's LA date, or a specific YYYY-MM-DD
  (timezone('America/Los_Angeles', now()))::date,
  to_char(timezone('America/Los_Angeles', now()), 'FMDay, FMMonth FMDD, YYYY'),
  'Psalm 46:10',
  'KJV · Excerpt',
  '',                                 -- text before the emphasized phrase
  'Be still,',                        -- emphasized phrase
  ' and know that I am God.',         -- text after
  'The courage',                      -- title line 1
  'to be still.',                     -- title line 2
  'What is one thing you can place in God''s hands today?',
  jsonb_build_array(
    'First paragraph of the devotion.',
    'Second paragraph of the devotion.'
  ),
  jsonb_build_array(
    'Optional “continue reading” paragraph.',
    'Another optional paragraph.'
  ),
  'Today · ' || to_char(timezone('America/Los_Angeles', now()), 'FMDay, FMMonth FMDD'),
  'Be still and know',                -- short archive title
  now()                               -- set null to keep draft / unpublished
)
on conflict (date_iso) do update set
  day_label = excluded.day_label,
  reference = excluded.reference,
  translation = excluded.translation,
  verse_before = excluded.verse_before,
  verse_em = excluded.verse_em,
  verse_after = excluded.verse_after,
  title_line_1 = excluded.title_line_1,
  title_line_2 = excluded.title_line_2,
  question = excluded.question,
  paras = excluded.paras,
  more = excluded.more,
  archive_label = excluded.archive_label,
  archive_title = excluded.archive_title,
  published_at = excluded.published_at;
