-- Four permanent demo members. OWNER REVIEW/APPLICATION REQUIRED.
-- Starts unrestricted for owner setup; activate explicitly only after all four accounts exist.
begin;
create table anansi_private.demo_settings(singleton boolean primary key default true check(singleton),enabled boolean not null default false);
insert into anansi_private.demo_settings values(true,false);
create table anansi_private.demo_members(user_id uuid primary key references auth.users(id) on delete cascade,expires_at timestamptz);
revoke all on anansi_private.demo_settings,anansi_private.demo_members from public,anon,authenticated;
create function anansi_private.demo_actor_allowed(actor uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select actor is not null and (exists(select 1 from anansi_private.demo_settings where singleton and not enabled) or exists(select 1 from anansi_private.demo_members where user_id=actor and (expires_at is null or expires_at>now())));
$$;
revoke all on function anansi_private.demo_actor_allowed(uuid) from public,anon,authenticated;
grant execute on function anansi_private.demo_actor_allowed(uuid) to service_role;
create function public.m10_demo_access()
returns boolean language sql stable security definer set search_path='' as $$ select anansi_private.demo_actor_allowed(auth.uid()); $$;
revoke all on function public.m10_demo_access() from public,anon;
grant execute on function public.m10_demo_access() to authenticated;
create function public.m10_demo_mode()
returns boolean language sql stable security definer set search_path='' as $$ select coalesce((select enabled from anansi_private.demo_settings where singleton),true); $$;
revoke all on function public.m10_demo_mode() from public;
grant execute on function public.m10_demo_mode() to anon,authenticated,service_role;
-- Owner-only SQL setup. No public RPC, automatic selection, account deletion or banning.
create function anansi_private.activate_demo(members uuid[])
returns void language plpgsql security definer set search_path='' as $$
begin
 if cardinality(members)<>4 or (select count(distinct x) from unnest(members) x)<>4 or (select count(*) from auth.users where id=any(members))<>4 then raise exception 'exactly_four_existing_accounts_required'; end if;
 if exists(select 1 from anansi_private.demo_members where expires_at is null and not(user_id=any(members))) then raise exception 'existing_membership_mismatch'; end if;
 insert into anansi_private.demo_members(user_id) select unnest(members) on conflict(user_id) do update set expires_at=null;
 update anansi_private.demo_settings set enabled=true where singleton;
end; $$;
revoke all on function anansi_private.activate_demo(uuid[]) from public,anon,authenticated,service_role;
-- Test administration only: exact tagged disposable users, two-hour membership, no permanent grant.
create function public.m10_test_member(p_user uuid)
returns void language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from auth.users where id=p_user and email ~ '^anansi-(t2|e2e)-[0-9a-f-]+@example[.]com$' and created_at>now()-interval '1 day') then raise exception 'not_test_fixture'; end if;
 insert into anansi_private.demo_members(user_id,expires_at) values(p_user,now()+interval '2 hours')
 on conflict(user_id) do update set expires_at=excluded.expires_at where anansi_private.demo_members.expires_at is not null;
end; $$;
revoke all on function public.m10_test_member(uuid) from public,anon,authenticated;
grant execute on function public.m10_test_member(uuid) to service_role;
-- Restrictive policies combine with every existing ownership/content policy, not replace them.
create policy m10_demo_member on public.profiles as restrictive for all to authenticated using((select public.m10_demo_access())) with check((select public.m10_demo_access()));
create policy m10_demo_member on public.stories as restrictive for all to authenticated using((select public.m10_demo_access())) with check((select public.m10_demo_access()));
create policy m10_demo_member on public.segments as restrictive for all to authenticated using((select public.m10_demo_access())) with check((select public.m10_demo_access()));
create policy m10_demo_member on public.reviews as restrictive for all to authenticated using((select public.m10_demo_access())) with check((select public.m10_demo_access()));
create policy m10_demo_member on public.review_edits as restrictive for all to authenticated using((select public.m10_demo_access())) with check((select public.m10_demo_access()));
create policy m10_demo_member on public.follows as restrictive for all to authenticated using((select public.m10_demo_access())) with check((select public.m10_demo_access()));
create policy m10_demo_member on public.shares as restrictive for all to authenticated using((select public.m10_demo_access())) with check((select public.m10_demo_access()));
create policy m10_demo_member on public.translation_tasks as restrictive for all to authenticated using((select public.m10_demo_access())) with check((select public.m10_demo_access()));
create policy m10_demo_audio on storage.objects as restrictive for all to authenticated using(bucket_id not in ('story-audio','story-audio-staging') or (select public.m10_demo_access())) with check(bucket_id not in ('story-audio','story-audio-staging') or (select public.m10_demo_access()));
-- Definer operations keep auth.uid(): a trigger prevents a nonmember writing through older capabilities.
create function anansi_private.demo_write_guard()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if session_user not in ('postgres','supabase_admin','supabase_auth_admin') and coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb->>'role' is distinct from 'service_role' and not anansi_private.demo_actor_allowed(auth.uid()) then raise exception 'account_not_allowed'; end if;
 if TG_OP='DELETE' then return OLD; end if;return NEW;
end; $$;
revoke all on function anansi_private.demo_write_guard() from public,anon,authenticated;
create trigger m10_demo_write before insert or update or delete on public.profiles for each row execute function anansi_private.demo_write_guard();
create trigger m10_demo_write before insert or update or delete on public.stories for each row execute function anansi_private.demo_write_guard();
create trigger m10_demo_write before insert or update or delete on public.segments for each row execute function anansi_private.demo_write_guard();
create trigger m10_demo_write before insert or update or delete on public.reviews for each row execute function anansi_private.demo_write_guard();
create trigger m10_demo_write before insert or update or delete on public.review_edits for each row execute function anansi_private.demo_write_guard();
create trigger m10_demo_write before insert or update or delete on public.follows for each row execute function anansi_private.demo_write_guard();
create trigger m10_demo_write before insert or update or delete on public.shares for each row execute function anansi_private.demo_write_guard();
create trigger m10_demo_write before insert or update or delete on public.translation_tasks for each row execute function anansi_private.demo_write_guard();

create or replace function public.m4_save_transcript(p_story uuid,p_revision integer,p_title text,p_segments jsonb)
returns integer language plpgsql security definer set search_path='' as $$
declare s public.stories%rowtype;
begin
 if auth.uid() is not null and not anansi_private.demo_actor_allowed(auth.uid()) then raise exception 'account_not_allowed'; end if;
 if auth.uid() is null then raise exception 'unauthenticated'; end if;
 select * into s from public.stories where id=p_story and author_id=auth.uid() and kind='original' for update;
 if not found then raise exception 'not_found'; end if;
 if s.status='published' then raise exception 'published_immutable'; end if;
 if s.transcript_revision is distinct from p_revision then raise exception 'revision_conflict'; end if;
 if s.status='transcribing' and s.transcription_claim_expires_at>now() then raise exception 'processing'; end if;
 if p_title is null or char_length(btrim(p_title)) not between 1 and 200 or s.audio_path is null then raise exception 'invalid_transcript'; end if;
 perform anansi_private.m4_write_segments(p_story,p_segments,s.audio_duration_ms,false);
 update public.stories set transcript_origin=case when s.transcript_origin in ('provider','provider_edited') then 'provider_edited' else 'manual' end,title=btrim(p_title),status='transcript_ready',transcript_revision=transcript_revision+1,
  transcription_claim=null,transcription_claim_expires_at=null,transcription_error=null where id=p_story;
 return s.transcript_revision+1;
end; $$;

create or replace function public.m4_claim_transcription(p_story uuid,p_actor uuid,p_provider text,p_model text,p_retry boolean)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare s public.stories%rowtype; token uuid;
begin
 if not anansi_private.demo_actor_allowed(p_actor) then raise exception 'account_not_allowed'; end if;
 select * into s from public.stories where id=p_story and author_id=p_actor and kind='original' for update;
 if not found then raise exception 'not_found'; end if;
 if s.audio_path is null or s.audio_duration_ms is null then raise exception 'invalid_transcript'; end if;
 if s.status in ('transcript_ready','published') or exists(select 1 from public.segments where story_id=p_story)
  then return jsonb_build_object('reused',true); end if;
 if s.status='transcribing' and s.transcription_claim_expires_at>now() then raise exception 'processing'; end if;
 if s.status in ('transcription_failed','transcribing') and p_retry is distinct from true then raise exception 'retry_required'; end if;
 if p_provider is null or p_provider not in ('openai','mock') or p_model is null or length(btrim(p_model))=0 then raise exception 'configuration'; end if;
 token:=gen_random_uuid();
 update public.stories set status='transcribing',transcription_claim=token,transcription_claim_expires_at=now()+interval '5 minutes',
  transcription_error=null,ai_provider=p_provider,ai_model=p_model where id=p_story;
 return jsonb_build_object('reused',false,'token',token,'audio_path',s.audio_path,'audio_duration_ms',s.audio_duration_ms,'audio_media_type',s.audio_media_type);
end; $$;

create or replace function public.m4_finish_transcription(p_story uuid,p_actor uuid,p_token uuid,p_segments jsonb,p_error text)
returns void language plpgsql security invoker set search_path='' as $$
declare s public.stories%rowtype;
begin
 if not anansi_private.demo_actor_allowed(p_actor) then raise exception 'account_not_allowed'; end if;
 select * into s from public.stories where id=p_story and author_id=p_actor and kind='original' for update;
 if not found then raise exception 'not_found'; end if;
 if p_token is null or s.status<>'transcribing' or s.transcription_claim is distinct from p_token or s.transcription_claim_expires_at<=now() then raise exception 'stale_claim'; end if;
 if p_error is not null then
  update public.stories set status='transcription_failed',transcription_error=p_error,transcription_claim=null,transcription_claim_expires_at=null where id=p_story;
 else
  perform anansi_private.m4_write_segments(p_story,p_segments,s.audio_duration_ms,true);
  update public.stories set transcript_origin='provider',status='transcript_ready',transcript_revision=transcript_revision+1,transcription_error=null,
   transcription_claim=null,transcription_claim_expires_at=null where id=p_story;
 end if;
end; $$;

create or replace function public.m4_publish(p_story uuid,p_actor uuid,p_revision integer,p_provider text,p_model text)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare s public.stories%rowtype; linked uuid;
begin
 if not anansi_private.demo_actor_allowed(p_actor) then raise exception 'account_not_allowed'; end if;
 select * into s from public.stories where id=p_story and author_id=p_actor and kind='original' for update;
 if not found then raise exception 'not_found'; end if;
 if s.status='published' then
  select id into linked from public.stories where parent_story_id=p_story and language='en';
  return jsonb_build_object('id',p_story,'translation_id',linked,'already_published',true);
 end if;
 if s.transcript_revision is distinct from p_revision then raise exception 'revision_conflict'; end if;
 if s.status<>'transcript_ready' or s.audio_path is null or not exists(select 1 from public.segments where story_id=p_story) then raise exception 'invalid_transcript'; end if;
 if p_provider is null or p_provider not in ('openai','vulavula','mock') or p_model is null or length(btrim(p_model)) not between 1 and 200 then raise exception 'configuration'; end if;
 -- Reject malformed rows even if inserted administratively outside the normal save path.
 if exists(select 1 from public.segments where story_id=p_story and
  (start_ms is null or end_ms is null or end_ms>s.audio_duration_ms or timing_source is null)) then raise exception 'invalid_timings'; end if;
 if exists(select 1 from (select position,start_ms,lag(end_ms,1,0) over(order by position) as previous_end,row_number() over(order by position)-1 as expected_position from public.segments where story_id=p_story) ordered where position<>expected_position or start_ms<previous_end) then raise exception 'invalid_timings'; end if;
 insert into public.stories(author_id,kind,language,parent_story_id,title,status,ai_provider,ai_model)
  values(p_actor,'translation','en',p_story,left(s.title,190)||' (English)','pending',p_provider,p_model) returning id into linked;
 insert into public.translation_tasks(translation_story_id,source_segment_id,source_story_id,source_fingerprint,provider,model)
  select linked,id,p_story,encode(sha256(convert_to(jsonb_build_array(id,text,'xh','en',p_provider,p_model)::text,'UTF8')),'hex'),p_provider,p_model
  from public.segments where story_id=p_story order by position;
 update public.stories set status='published',transcript_revision=transcript_revision+1 where id=p_story;
 return jsonb_build_object('id',p_story,'translation_id',linked,'already_published',false);
end; $$;

create or replace function public.m5_claim_translation(p_story uuid,p_actor uuid,p_consent boolean)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare linked public.stories%rowtype; task public.translation_tasks%rowtype; source public.segments%rowtype; token uuid;
begin
 if not anansi_private.demo_actor_allowed(p_actor) then raise exception 'account_not_allowed'; end if;
 select t.* into linked from public.stories t join public.stories s on s.id=t.parent_story_id
 where s.id=p_story and s.author_id=p_actor and s.kind='original' and s.status='published' and t.kind='translation' and t.language='en' for update of t;
 if not found then raise exception 'not_found'; end if;
 if not exists(select 1 from public.translation_tasks where translation_story_id=linked.id) then raise exception 'configuration'; end if;
 if not exists(select 1 from public.translation_tasks where translation_story_id=linked.id and state<>'complete') then return jsonb_build_object('reused',true); end if;
 if exists(select 1 from public.translation_tasks where translation_story_id=linked.id and state='processing' and claim_expires_at>now()) then raise exception 'processing'; end if;
 if exists(select 1 from public.translation_tasks where translation_story_id=linked.id and state in ('failed','processing')) then raise exception 'retry_required'; end if;
 if p_consent is distinct from true then raise exception 'consent_required'; end if;
 select q.* into task from public.translation_tasks q join public.segments s on s.id=q.source_segment_id
 where q.translation_story_id=linked.id and q.state='pending' order by s.position limit 1 for update of q;
 if not found then raise exception 'configuration'; end if;
 select * into source from public.segments where id=task.source_segment_id and story_id=p_story;
 if not found or task.provider is distinct from linked.ai_provider or task.model is distinct from linked.ai_model or
 task.source_fingerprint is distinct from encode(sha256(convert_to(jsonb_build_array(source.id,source.text,'xh','en',task.provider,task.model)::text,'UTF8')),'hex') then raise exception 'source_changed'; end if;
 token:=gen_random_uuid();
 update public.translation_tasks set state='processing',claim_token=token,claim_expires_at=now()+interval '5 minutes',attempts=attempts+1,sanitized_error=null,updated_at=now() where id=task.id;
 update public.stories set status='translating',translation_consent_at=coalesce(translation_consent_at,now()) where id=linked.id;
 return jsonb_build_object('reused',false,'task_id',task.id,'token',token,'text',source.text,'provider',task.provider,'model',task.model);
end; $$;

create or replace function public.m5_finish_translation(p_story uuid,p_actor uuid,p_task uuid,p_token uuid,p_text text,p_error text)
returns void language plpgsql security invoker set search_path='' as $$
declare linked public.stories%rowtype; task public.translation_tasks%rowtype; source public.segments%rowtype;
begin
 if not anansi_private.demo_actor_allowed(p_actor) then raise exception 'account_not_allowed'; end if;
 select t.* into linked from public.stories t join public.stories s on s.id=t.parent_story_id
 where s.id=p_story and s.author_id=p_actor and s.kind='original' and s.status='published' and t.kind='translation' for update of t;
 if not found then raise exception 'not_found'; end if;
 select * into task from public.translation_tasks where id=p_task and translation_story_id=linked.id for update;
 if not found or p_token is null or task.claim_token is distinct from p_token then raise exception 'stale_claim'; end if;
 -- Repeating a persisted successful completion is harmless; it never changes AI text.
 if task.state='complete' then return; end if;
 if task.state<>'processing' or task.claim_expires_at<=now() then raise exception 'stale_claim'; end if;
 select * into source from public.segments where id=task.source_segment_id and story_id=p_story;
 if not found or task.provider is distinct from linked.ai_provider or task.model is distinct from linked.ai_model or
 task.source_fingerprint is distinct from encode(sha256(convert_to(jsonb_build_array(source.id,source.text,'xh','en',task.provider,task.model)::text,'UTF8')),'hex') then raise exception 'source_changed'; end if;
 if p_error is null then
  if p_text is null or char_length(btrim(p_text)) not between 1 and 50000 then raise exception 'invalid_translation'; end if;
  insert into public.segments(story_id,position,text,start_ms,end_ms,timing_source,source_segment_id,source_story_id)
   values(linked.id,source.position,btrim(p_text),source.start_ms,source.end_ms,source.timing_source,source.id,p_story);
  update public.translation_tasks set state='complete',claim_expires_at=null,sanitized_error=null,updated_at=now() where id=p_task;
 else
  if p_error not in ('configuration','unsupported','invalid_input','credentials','quota','timeout','network','provider','malformed') then raise exception 'invalid_translation'; end if;
  update public.translation_tasks set state='failed',claim_token=null,claim_expires_at=null,sanitized_error=p_error,updated_at=now() where id=p_task;
 end if;
 update public.stories set status=case
  when not exists(select 1 from public.translation_tasks where translation_story_id=linked.id and state<>'complete') then 'awaiting_verification'
  when exists(select 1 from public.translation_tasks where translation_story_id=linked.id and state='failed') then 'translation_failed'
  else 'translating' end where id=linked.id;
end; $$;

create or replace function public.m5_retry_translation(p_story uuid,p_actor uuid)
returns void language plpgsql security invoker set search_path='' as $$
declare linked uuid;
begin
 if not anansi_private.demo_actor_allowed(p_actor) then raise exception 'account_not_allowed'; end if;
 select t.id into linked from public.stories t join public.stories s on s.id=t.parent_story_id
 where s.id=p_story and s.author_id=p_actor and s.kind='original' and s.status='published' and t.kind='translation' for update of t;
 if not found then raise exception 'not_found'; end if;
 if exists(select 1 from public.translation_tasks where translation_story_id=linked and state='processing' and claim_expires_at>now()) then raise exception 'processing'; end if;
 update public.translation_tasks set state='pending',claim_token=null,claim_expires_at=null,sanitized_error=null,updated_at=now()
 where translation_story_id=linked and (state='failed' or (state='processing' and claim_expires_at<=now()));
 if exists(select 1 from public.translation_tasks where translation_story_id=linked and state<>'complete') then update public.stories set status='pending' where id=linked; end if;
end; $$;

create or replace function public.m7_save_review(p_translation uuid,p_decision text,p_rating numeric,p_intent text,p_edits jsonb)
returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); target public.stories%rowtype; languages text[]; rid uuid; item jsonb;
begin
 if auth.uid() is not null and not anansi_private.demo_actor_allowed(auth.uid()) then raise exception 'account_not_allowed'; end if;
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

create or replace function public.m8_relationship(p_kind text,p_target uuid,p_enabled boolean)
returns void language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();
begin
 if auth.uid() is not null and not anansi_private.demo_actor_allowed(auth.uid()) then raise exception 'account_not_allowed'; end if;
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

create or replace function public.m10_save_review(p_translation uuid,p_decision text,p_rating numeric,p_intent text,p_edits jsonb,p_reuse boolean)
returns uuid language plpgsql security definer set search_path='' as $$
declare rid uuid;
begin
 if auth.uid() is not null and not anansi_private.demo_actor_allowed(auth.uid()) then raise exception 'account_not_allowed'; end if;
 if auth.uid() is null then raise exception 'unauthenticated'; end if;
 if p_reuse is null then raise exception 'invalid_review'; end if;
 rid:=public.m7_save_review(p_translation,p_decision,p_rating,p_intent,p_edits);
 update public.reviews set reuse_for_translation=p_reuse where id=rid and reviewer_id=auth.uid();
 return rid;
end; $$;

create or replace function public.m10_claim_translation(p_story uuid,p_actor uuid,p_consent boolean)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare claimed jsonb; linked public.stories%rowtype; context anansi_private.translation_contexts%rowtype; picked jsonb:='[]'; item record; used integer:=0; size integer;
begin
 if not anansi_private.demo_actor_allowed(p_actor) then raise exception 'account_not_allowed'; end if;
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

create or replace function public.m10_context_info(p_translation uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare c anansi_private.translation_contexts%rowtype;
begin
 if auth.uid() is not null and not anansi_private.demo_actor_allowed(auth.uid()) then raise exception 'account_not_allowed'; end if;
 if auth.uid() is null then raise exception 'unauthenticated'; end if;
 if not exists(select 1 from public.stories t join public.stories s on s.id=t.parent_story_id where t.id=p_translation and t.kind='translation' and (s.author_id=auth.uid() or (s.status='published' and t.status='awaiting_verification'))) then raise exception 'not_found'; end if;
 select * into c from anansi_private.translation_contexts where translation_id=p_translation;
 return jsonb_build_object('examplesUsed',coalesce(jsonb_array_length(c.examples),0),'promptVersion',coalesce(c.prompt_version,'not-started'));
end; $$;

create or replace function public.m10_reserve_audio(p_actor uuid,p_media text,p_bytes integer)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare item anansi_private.audio_uploads%rowtype;
begin
 if not anansi_private.demo_actor_allowed(p_actor) then raise exception 'account_not_allowed'; end if;
 -- Serialize per-user reservations without locking or modifying the Auth account.
 perform pg_advisory_xact_lock(hashtextextended('audio-upload:'||p_actor::text,0));
 if (select count(*) from anansi_private.audio_uploads where user_id=p_actor and state in ('pending','processing') and expires_at>now())>=2 then raise exception 'upload_limit'; end if;
 insert into anansi_private.audio_uploads(user_id,media_hint,expected_bytes) values(p_actor,p_media,p_bytes) returning * into item;
 return jsonb_build_object('id',item.id,'path',p_actor::text||'/'||item.id::text||'/upload','media',item.media_hint);
end; $$;

create or replace function public.m10_claim_audio(p_upload uuid,p_actor uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare item anansi_private.audio_uploads%rowtype; token uuid;
begin
 if not anansi_private.demo_actor_allowed(p_actor) then raise exception 'account_not_allowed'; end if;
 select * into item from anansi_private.audio_uploads where id=p_upload and user_id=p_actor for update;
 if not found then raise exception 'not_found'; end if;
 if item.state='complete' then return jsonb_build_object('reused',true,'id',item.id); end if;
 if item.state='failed' or item.expires_at<=now() then raise exception 'upload_expired'; end if;
 if item.state='processing' and item.claim_expires_at>now() then raise exception 'processing'; end if;
 token:=gen_random_uuid();update anansi_private.audio_uploads set state='processing',claim_token=token,claim_expires_at=now()+interval '5 minutes' where id=item.id;
 return jsonb_build_object('reused',false,'id',item.id,'token',token,'path',p_actor::text||'/'||item.id::text||'/upload','expectedBytes',item.expected_bytes,'consentAt',item.consent_at);
end; $$;

create or replace function public.m10_finish_audio(p_upload uuid,p_actor uuid,p_token uuid,p_media text,p_extension text,p_bytes integer,p_duration integer)
returns uuid language plpgsql security invoker set search_path='' as $$
declare item anansi_private.audio_uploads%rowtype; path text;
begin
 if not anansi_private.demo_actor_allowed(p_actor) then raise exception 'account_not_allowed'; end if;
 select * into item from anansi_private.audio_uploads where id=p_upload and user_id=p_actor for update;
 if not found then raise exception 'not_found'; end if;
 if item.state='complete' then return item.id; end if;
 if item.state<>'processing' or item.claim_token is distinct from p_token or item.claim_expires_at<=now() then raise exception 'stale_claim'; end if;
 if p_media not in ('audio/mpeg','audio/mp4','audio/webm','audio/wav') or p_extension is distinct from (case p_media when 'audio/mpeg' then 'mp3' when 'audio/mp4' then 'm4a' when 'audio/webm' then 'webm' else 'wav' end) or p_bytes is distinct from item.expected_bytes or p_duration is null or p_duration not between 1 and 180000 then raise exception 'invalid_audio'; end if;
 path:=p_actor::text||'/'||item.id::text||'/original.'||p_extension;
 insert into public.stories(id,author_id,kind,language,title,status,audio_path,audio_duration_ms,audio_consent_at,audio_media_type,audio_size_bytes)
  values(item.id,p_actor,'original','xh','Untitled story','draft',path,p_duration,item.consent_at,p_media,p_bytes);
 update anansi_private.audio_uploads set state='complete',final_path=path,claim_token=null,claim_expires_at=null where id=item.id;
 return item.id;
end; $$;

create or replace function public.m10_fail_audio(p_upload uuid,p_actor uuid,p_token uuid)
returns void language plpgsql security invoker set search_path='' as $$
begin
 if not anansi_private.demo_actor_allowed(p_actor) then raise exception 'account_not_allowed'; end if;
 update anansi_private.audio_uploads set state='failed',claim_token=null,claim_expires_at=null
 where id=p_upload and user_id=p_actor and ((state='processing' and claim_token=p_token) or (state='pending' and p_token is null));
end; $$;
notify pgrst,'reload schema';
commit;
