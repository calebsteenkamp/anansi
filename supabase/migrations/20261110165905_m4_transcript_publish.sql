-- M4: OWNER REVIEW/APPLICATION REQUIRED. Additive; no reset or provider calls.
begin;
alter table public.stories
 add column transcript_origin text check(transcript_origin in ('manual','provider','provider_edited')),
 add column transcript_revision integer not null default 0 check(transcript_revision>=0),
 add column transcription_claim uuid,
 add column transcription_claim_expires_at timestamptz,
 add column transcription_error text check(transcription_error in ('configuration','unsupported','invalid_input','credentials','quota','timeout','network','provider','malformed','storage','persistence'));
alter table public.stories add constraint transcription_claim_pair check((transcription_claim is null)=(transcription_claim_expires_at is null));

-- Internal transactional writer. Ordinary callers cannot invoke it.
create function anansi_private.m4_write_segments(p_story uuid,p_segments jsonb,p_duration integer,p_trusted boolean)
returns void language plpgsql security invoker set search_path='' as $$
declare item jsonb; n integer; total integer; weight integer; used_weight integer:=0; pos integer:=0;
 sid uuid; body text; a integer; b integer; previous_end integer:=0; source text;
begin
 if p_duration is null or p_duration<1 or jsonb_typeof(p_segments) is distinct from 'array' then raise exception 'invalid_transcript'; end if;
 n:=jsonb_array_length(p_segments);
 if n<1 or n>500 or n>p_duration then raise exception 'invalid_transcript'; end if;
 select sum(char_length(btrim(value->>'text'))) into total from jsonb_array_elements(p_segments);
 if total is null or total>50000 then raise exception 'invalid_transcript'; end if;
 for item in select value from jsonb_array_elements(p_segments) loop
  if jsonb_typeof(item->'text') is distinct from 'string' or char_length(btrim(item->>'text'))=0 or
     jsonb_typeof(item->'id') is distinct from 'string' then raise exception 'invalid_transcript'; end if;
  sid:=(item->>'id')::uuid;
  if exists(select 1 from public.segments where id=sid and story_id<>p_story) then raise exception 'invalid_transcript'; end if;
 end loop;
 if (select count(distinct value->>'id') from jsonb_array_elements(p_segments))<>n then raise exception 'invalid_transcript'; end if;
 delete from public.segments where story_id=p_story;
 for item in select value from jsonb_array_elements(p_segments) loop
  body:=btrim(item->>'text'); weight:=char_length(body); sid:=(item->>'id')::uuid;
  if p_trusted then
   a:=(item->>'start_ms')::integer; b:=(item->>'end_ms')::integer; source:=item->>'timing_source';
   if a is null or b is null or a<previous_end or b<=a or b>p_duration or source is null or source not in ('provider','estimated') then raise exception 'invalid_timings'; end if;
  else
   a:=previous_end;
   -- Reserve one ms per segment; distribute remaining duration proportionally.
   b:=pos+1+floor((p_duration-n)::numeric*(used_weight+weight)/total)::integer;
   source:='estimated';
  end if;
  insert into public.segments(id,story_id,position,text,start_ms,end_ms,timing_source)
   values(sid,p_story,pos,body,a,b,source);
  previous_end:=b; used_weight:=used_weight+weight; pos:=pos+1;
 end loop;
end; $$;
revoke all on function anansi_private.m4_write_segments(uuid,jsonb,integer,boolean) from public,anon,authenticated;

grant usage on schema anansi_private to service_role;
grant execute on function anansi_private.m4_write_segments(uuid,jsonb,integer,boolean) to service_role;

-- Sole authenticated transcript write capability; fixed search_path and identity/ownership/state/revision guards.
create function public.m4_save_transcript(p_story uuid,p_revision integer,p_title text,p_segments jsonb)
returns integer language plpgsql security definer set search_path='' as $$
declare s public.stories%rowtype;
begin
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
revoke all on function public.m4_save_transcript(uuid,integer,text,jsonb) from public,anon;
grant execute on function public.m4_save_transcript(uuid,integer,text,jsonb) to authenticated;

-- Privileged provider boundaries: no authenticated execute; actor comes only from verified server session.
create function public.m4_claim_transcription(p_story uuid,p_actor uuid,p_provider text,p_model text,p_retry boolean)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare s public.stories%rowtype; token uuid;
begin
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
revoke all on function public.m4_claim_transcription(uuid,uuid,text,text,boolean) from public,anon,authenticated;
grant execute on function public.m4_claim_transcription(uuid,uuid,text,text,boolean) to service_role;

create function public.m4_finish_transcription(p_story uuid,p_actor uuid,p_token uuid,p_segments jsonb,p_error text)
returns void language plpgsql security invoker set search_path='' as $$
declare s public.stories%rowtype;
begin
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
revoke all on function public.m4_finish_transcription(uuid,uuid,uuid,jsonb,text) from public,anon,authenticated;
grant execute on function public.m4_finish_transcription(uuid,uuid,uuid,jsonb,text) to service_role;

-- Server-only publish keeps provider/model/task metadata out of caller control.
create function public.m4_publish(p_story uuid,p_actor uuid,p_revision integer,p_provider text,p_model text)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare s public.stories%rowtype; linked uuid;
begin
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
revoke all on function public.m4_publish(uuid,uuid,integer,text,text) from public,anon,authenticated;
grant execute on function public.m4_publish(uuid,uuid,integer,text,text) to service_role;

-- Author may inspect pending linked story metadata, but still cannot write results or task states.
drop policy stories_read on public.stories;
create policy stories_read on public.stories for select to authenticated using(
 (kind='original' and (status='published' or author_id=(select auth.uid()))) or
 (kind='translation' and (status='awaiting_verification' or author_id=(select auth.uid())))
);
notify pgrst,'reload schema';
commit;
