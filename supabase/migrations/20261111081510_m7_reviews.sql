-- M7 owner review/application required. No reset or original/AI text updates.
begin;
create function public.m7_save_review(p_translation uuid,p_decision text,p_rating numeric,p_intent text,p_edits jsonb)
returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); target public.stories%rowtype; languages text[]; rid uuid; item jsonb;
begin
 if actor is null then raise exception 'unauthenticated'; end if;
 select spoken_languages into languages from public.profiles where id=actor for share;
 if languages is null or not (languages @> array['xh','en']::text[]) then raise exception 'ineligible'; end if;
 select * into target from public.stories where id=p_translation and kind='translation' and status='awaiting_verification' for share;
 if not found or not exists(select 1 from public.stories where id=target.parent_story_id and kind='original' and status='published') then raise exception 'not_found'; end if;
 if p_decision is null or p_decision not in ('approve','reject') or p_rating is null or p_rating<>trunc(p_rating) or p_rating not between 1 and 5 or p_intent is null or char_length(p_intent)>5000 or jsonb_typeof(p_edits) is distinct from 'array' then raise exception 'invalid_review'; end if;
 if jsonb_array_length(p_edits)>500 or (select coalesce(sum(char_length(value->>'text')),0) from jsonb_array_elements(p_edits))>50000 then raise exception 'invalid_review'; end if;
 for item in select value from jsonb_array_elements(p_edits) loop
  if jsonb_typeof(item->'segment_id') is distinct from 'string' or jsonb_typeof(item->'text') is distinct from 'string' or char_length(btrim(item->>'text'))=0 then raise exception 'invalid_review'; end if;
  if not exists(select 1 from public.segments where id=(item->>'segment_id')::uuid and story_id=p_translation) then raise exception 'invalid_review'; end if;
 end loop;
 if (select count(distinct value->>'segment_id') from jsonb_array_elements(p_edits))<>jsonb_array_length(p_edits) then raise exception 'invalid_review'; end if;
 insert into public.reviews(translation_story_id,reviewer_id,story_author_id,decision,rating,intent_comment)
 values(p_translation,actor,target.author_id,p_decision,p_rating::integer,p_intent)
 on conflict(translation_story_id,reviewer_id) do update set decision=excluded.decision,rating=excluded.rating,intent_comment=excluded.intent_comment,updated_at=clock_timestamp()
 returning id into rid;
 delete from public.review_edits where review_id=rid;
 insert into public.review_edits(review_id,segment_id,translation_story_id,corrected_text)
 select rid,(value->>'segment_id')::uuid,p_translation,btrim(value->>'text') from jsonb_array_elements(p_edits);
 return rid;
end; $$;
revoke all on function public.m7_save_review(uuid,text,numeric,text,jsonb) from public,anon;
grant execute on function public.m7_save_review(uuid,text,numeric,text,jsonb) to authenticated;
notify pgrst,'reload schema';
commit;
