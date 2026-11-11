-- M8: owner review/application required. No resets/provider calls.
begin;
create function public.m8_relationship(p_kind text,p_target uuid,p_enabled boolean)
returns void language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();
begin
 if actor is null then raise exception 'unauthenticated'; end if;
 if p_enabled is null then raise exception 'invalid_relationship'; end if;
 if p_kind='follow' then
  if p_target=actor then raise exception 'self_follow'; end if;
  if not exists(select 1 from public.profiles where id=p_target) then raise exception 'not_found'; end if;
  if p_enabled then insert into public.follows(follower_id,following_id) values(actor,p_target) on conflict do nothing;
  else delete from public.follows where follower_id=actor and following_id=p_target; end if;
 elsif p_kind='share' then
  if not exists(select 1 from public.stories s where s.id=p_target and ((s.kind='original' and s.status='published') or (s.kind='translation' and s.status='awaiting_verification' and exists(select 1 from public.stories o where o.id=s.parent_story_id and o.status='published')))) then raise exception 'not_found'; end if;
  if p_enabled then insert into public.shares(user_id,story_id) values(actor,p_target) on conflict do nothing;
  else delete from public.shares where user_id=actor and story_id=p_target; end if;
 else raise exception 'invalid_relationship'; end if;
end; $$;
revoke all on function public.m8_relationship(text,uuid,boolean) from public,anon;
grant execute on function public.m8_relationship(text,uuid,boolean) to authenticated;

-- Caller permissions and RLS apply to every feed read; no definer privilege.
create function public.m8_feed(p_feed text,p_language text,p_query text)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare actor uuid:=auth.uid(); result jsonb;
begin
 if actor is null then raise exception 'unauthenticated'; end if;
 if p_feed is null or p_feed not in ('all','following') or p_language is null or p_language not in ('all','xh','en') or p_query is null or char_length(p_query)>100 then raise exception 'invalid_feed'; end if;
 select coalesce(jsonb_agg(to_jsonb(card) order by card.created_at desc,card.id desc),'[]'::jsonb) into result from (
  select s.id,s.parent_story_id,s.author_id,s.title,s.language,s.created_at,p.display_name as author_name,
   exists(select 1 from public.follows f where f.follower_id=actor and f.following_id=s.author_id) as following_author,
   exists(select 1 from public.shares sh where sh.user_id=actor and sh.story_id=s.id) as shared,
   coalesce((select jsonb_agg(jsonb_build_object('id',rp.id,'name',rp.display_name,'following',exists(select 1 from public.follows f where f.follower_id=actor and f.following_id=rp.id)) order by rp.id) from public.shares sh join public.profiles rp on rp.id=sh.user_id where sh.story_id=s.id),'[]'::jsonb) as reposted_by
  from public.stories s join public.profiles p on p.id=s.author_id
  where ((s.kind='original' and s.status='published') or (s.kind='translation' and s.status='awaiting_verification' and exists(select 1 from public.stories o where o.id=s.parent_story_id and o.status='published')))
   and (p_language='all' or s.language=p_language)
   and position(lower(btrim(p_query)) in lower(s.title))>0
   and (p_feed='all' or exists(select 1 from public.follows f where f.follower_id=actor and f.following_id=s.author_id)
     or exists(select 1 from public.shares sh join public.follows f on f.following_id=sh.user_id where sh.story_id=s.id and f.follower_id=actor))
  order by s.created_at desc,s.id desc limit 50
 ) card;
 return result;
end; $$;
revoke all on function public.m8_feed(text,text,text) from public,anon;
grant execute on function public.m8_feed(text,text,text) to authenticated;
notify pgrst,'reload schema';
commit;
