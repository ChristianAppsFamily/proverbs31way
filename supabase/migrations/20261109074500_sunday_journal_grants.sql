-- Table privileges for Sunday Journal (RLS still enforces row access)

grant usage on schema public to anon, authenticated;

grant select on public.editions to anon, authenticated;

grant select on public.profiles to anon, authenticated;
grant update on public.profiles to authenticated;

grant select on public.posts to anon, authenticated;
grant insert on public.posts to authenticated;

grant select on public.post_replies to anon, authenticated;
grant insert on public.post_replies to authenticated;

grant select on public.post_reactions to anon, authenticated;
grant insert, delete on public.post_reactions to authenticated;

grant insert on public.reports to authenticated;
