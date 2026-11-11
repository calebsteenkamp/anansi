-- M5: owner review/application required. Additive; no provider calls or data reset.
begin;
alter table public.stories add column translation_consent_at timestamptz;
create unique index segments_translation_source_unique on public.segments(story_id,source_segment_id) where source_segment_id is not null;
alter table public.translation_tasks add constraint m5_error_codes check(sanitized_error is null or sanitized_error in ('configuration','unsupported','invalid_input','credentials','quota','timeout','network','provider','malformed'));

-- All processing capabilities are server-only invoker functions. Parent row serializes claims.
create function public.m5_claim_translation(p_story uuid,p_actor uuid,p_consent boolean)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare linked public.stories%rowtype; task public.translation_tasks%rowtype; source public.segments%rowtype; token uuid;
begin
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

create function public.m5_finish_translation(p_story uuid,p_actor uuid,p_task uuid,p_token uuid,p_text text,p_error text)
returns void language plpgsql security invoker set search_path='' as $$
declare linked public.stories%rowtype; task public.translation_tasks%rowtype; source public.segments%rowtype;
begin
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

create function public.m5_retry_translation(p_story uuid,p_actor uuid)
returns void language plpgsql security invoker set search_path='' as $$
declare linked uuid;
begin
 select t.id into linked from public.stories t join public.stories s on s.id=t.parent_story_id
 where s.id=p_story and s.author_id=p_actor and s.kind='original' and s.status='published' and t.kind='translation' for update of t;
 if not found then raise exception 'not_found'; end if;
 if exists(select 1 from public.translation_tasks where translation_story_id=linked and state='processing' and claim_expires_at>now()) then raise exception 'processing'; end if;
 update public.translation_tasks set state='pending',claim_token=null,claim_expires_at=null,sanitized_error=null,updated_at=now()
 where translation_story_id=linked and (state='failed' or (state='processing' and claim_expires_at<=now()));
 if exists(select 1 from public.translation_tasks where translation_story_id=linked and state<>'complete') then update public.stories set status='pending' where id=linked; end if;
end; $$;
revoke all on function public.m5_claim_translation(uuid,uuid,boolean) from public,anon,authenticated;
revoke all on function public.m5_finish_translation(uuid,uuid,uuid,uuid,text,text) from public,anon,authenticated;
revoke all on function public.m5_retry_translation(uuid,uuid) from public,anon,authenticated;
grant execute on function public.m5_claim_translation(uuid,uuid,boolean) to service_role;
grant execute on function public.m5_finish_translation(uuid,uuid,uuid,uuid,text,text) to service_role;
grant execute on function public.m5_retry_translation(uuid,uuid) to service_role;
-- Existing RLS keeps unfinished translations author-private; completed stories are signed-in readable.
-- No direct task/result grants are added to ordinary users.
notify pgrst,'reload schema';
commit;
