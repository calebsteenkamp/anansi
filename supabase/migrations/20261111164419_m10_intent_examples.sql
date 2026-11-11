-- M10. OWNER REVIEW/APPLICATION REQUIRED. Additive; no provider calls or content resets.
begin;
alter table public.reviews add column reuse_for_translation boolean not null default false;
create table anansi_private.translation_contexts(
 translation_id uuid primary key references public.stories(id) on delete cascade,
 prompt_version text not null check(prompt_version in ('baseline-v1','intent-v1')),
 examples jsonb not null default '[]' check(jsonb_typeof(examples)='array' and jsonb_array_length(examples)<=3),
 frozen_at timestamptz not null default now()
);
revoke all on anansi_private.translation_contexts from public,anon,authenticated;
grant select,insert on anansi_private.translation_contexts to service_role;
-- Existing translations, including unfinished ones, retain baseline context permanently.
insert into anansi_private.translation_contexts(translation_id,prompt_version)
 select id,'baseline-v1' from public.stories where kind='translation';
create function public.m10_save_review(p_translation uuid,p_decision text,p_rating numeric,p_intent text,p_edits jsonb,p_reuse boolean)
returns uuid language plpgsql security definer set search_path='' as $$
declare rid uuid;
begin
 if auth.uid() is null then raise exception 'unauthenticated'; end if;
 if p_reuse is null then raise exception 'invalid_review'; end if;
 rid:=public.m7_save_review(p_translation,p_decision,p_rating,p_intent,p_edits);
 update public.reviews set reuse_for_translation=p_reuse where id=rid and reviewer_id=auth.uid();
 return rid;
end; $$;
revoke all on function public.m10_save_review(uuid,text,numeric,text,jsonb,boolean) from public,anon;
grant execute on function public.m10_save_review(uuid,text,numeric,text,jsonb,boolean) to authenticated;
create function public.m10_claim_translation(p_story uuid,p_actor uuid,p_consent boolean)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare claimed jsonb; linked public.stories%rowtype; context anansi_private.translation_contexts%rowtype; picked jsonb:='[]'; item record; used integer:=0; size integer;
begin
 -- M5's parent lock serializes both context initialization and all task claims.
 claimed:=public.m5_claim_translation(p_story,p_actor,p_consent);
 if (claimed->>'reused')::boolean then return claimed; end if;
 select * into strict linked from public.stories where parent_story_id=p_story and kind='translation' and language='en';
 select * into context from anansi_private.translation_contexts where translation_id=linked.id;
 if not found then
  if linked.ai_provider='openai' then
   for item in
    select candidate.* from (
     select r.id,r.translation_story_id,r.updated_at,r.intent_comment,e.source,e.corrected,
      row_number() over(partition by r.translation_story_id order by r.updated_at desc,r.id desc) as rank
     from public.reviews r
     join public.profiles p on p.id=r.reviewer_id
     join public.stories t on t.id=r.translation_story_id and t.kind='translation' and t.language='en' and t.status='awaiting_verification' and t.ai_provider='openai'
     join public.stories s on s.id=t.parent_story_id and s.kind='original' and s.language='xh' and s.status='published' and s.id<>p_story
     cross join lateral (
      select o.text as source,ed.corrected_text as corrected from public.review_edits ed
      join public.segments ts on ts.id=ed.segment_id and ts.story_id=t.id
      join public.segments o on o.id=ts.source_segment_id and o.story_id=s.id
      where ed.review_id=r.id and char_length(o.text) between 1 and 1000 and char_length(ed.corrected_text) between 1 and 1000
      order by o.position limit 1
     ) e
     where r.reuse_for_translation and r.decision='approve' and r.rating>=3 and char_length(btrim(r.intent_comment)) between 1 and 1000
      and p.spoken_languages @> array['xh','en']::text[]
      and (select avg(v.rating)>=3 and count(*) filter(where v.decision='reject')<=count(*) filter(where v.decision='approve') from public.reviews v where v.translation_story_id=t.id)
    ) candidate where rank=1 order by updated_at desc,id desc limit 100
   loop
    size:=char_length(item.source)+char_length(item.corrected)+char_length(item.intent_comment);
    if used+size>6000 then continue; end if;
    picked:=picked||jsonb_build_array(jsonb_build_object('reviewId',item.id,'source',item.source,'correctedEnglish',item.corrected,'intent',item.intent_comment));used:=used+size;
    exit when jsonb_array_length(picked)=3;
   end loop;
  end if;
  insert into anansi_private.translation_contexts(translation_id,prompt_version,examples)
   values(linked.id,case when jsonb_array_length(picked)>0 then 'intent-v1' else 'baseline-v1' end,picked) returning * into context;
 end if;
 return claimed||jsonb_build_object('examples',context.examples,'prompt_version',context.prompt_version);
end; $$;
revoke all on function public.m10_claim_translation(uuid,uuid,boolean) from public,anon,authenticated;
grant execute on function public.m10_claim_translation(uuid,uuid,boolean) to service_role;
create function public.m10_context_info(p_translation uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare c anansi_private.translation_contexts%rowtype;
begin
 if auth.uid() is null then raise exception 'unauthenticated'; end if;
 if not exists(select 1 from public.stories t join public.stories s on s.id=t.parent_story_id where t.id=p_translation and t.kind='translation' and (s.author_id=auth.uid() or (s.status='published' and t.status='awaiting_verification'))) then raise exception 'not_found'; end if;
 select * into c from anansi_private.translation_contexts where translation_id=p_translation;
 return jsonb_build_object('examplesUsed',coalesce(jsonb_array_length(c.examples),0),'promptVersion',coalesce(c.prompt_version,'not-started'));
end; $$;
revoke all on function public.m10_context_info(uuid) from public,anon;
grant execute on function public.m10_context_info(uuid) to authenticated;
notify pgrst,'reload schema';
commit;
