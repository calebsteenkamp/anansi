-- Hosted audio. OWNER REVIEW/APPLICATION REQUIRED. Private staging; no ordinary write grants.
begin;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('story-audio-staging','story-audio-staging',false,25000000,array['audio/mpeg','audio/mp4','audio/webm','audio/wav']);
create table anansi_private.audio_uploads(
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 media_hint text not null check(media_hint in ('audio/mpeg','audio/mp4','audio/webm','audio/wav')),
 expected_bytes integer not null check(expected_bytes between 1 and 25000000),
 consent_at timestamptz not null default now(), expires_at timestamptz not null default now()+interval '2 hours',
 state text not null default 'pending' check(state in ('pending','processing','complete','failed')),
 claim_token uuid,claim_expires_at timestamptz, final_path text,
 created_at timestamptz not null default now()
);
revoke all on anansi_private.audio_uploads from public,anon,authenticated;
grant select,insert,update on anansi_private.audio_uploads to service_role;
create index audio_uploads_user_pending on anansi_private.audio_uploads(user_id,state,expires_at);
create function public.m10_reserve_audio(p_actor uuid,p_media text,p_bytes integer)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare item anansi_private.audio_uploads%rowtype;
begin
 -- Serialize per-user reservations without locking or modifying the Auth account.
 perform pg_advisory_xact_lock(hashtextextended('audio-upload:'||p_actor::text,0));
 if (select count(*) from anansi_private.audio_uploads where user_id=p_actor and state in ('pending','processing') and expires_at>now())>=2 then raise exception 'upload_limit'; end if;
 insert into anansi_private.audio_uploads(user_id,media_hint,expected_bytes) values(p_actor,p_media,p_bytes) returning * into item;
 return jsonb_build_object('id',item.id,'path',p_actor::text||'/'||item.id::text||'/upload','media',item.media_hint);
end; $$;
create function public.m10_claim_audio(p_upload uuid,p_actor uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare item anansi_private.audio_uploads%rowtype; token uuid;
begin
 select * into item from anansi_private.audio_uploads where id=p_upload and user_id=p_actor for update;
 if not found then raise exception 'not_found'; end if;
 if item.state='complete' then return jsonb_build_object('reused',true,'id',item.id); end if;
 if item.state='failed' or item.expires_at<=now() then raise exception 'upload_expired'; end if;
 if item.state='processing' and item.claim_expires_at>now() then raise exception 'processing'; end if;
 token:=gen_random_uuid();update anansi_private.audio_uploads set state='processing',claim_token=token,claim_expires_at=now()+interval '5 minutes' where id=item.id;
 return jsonb_build_object('reused',false,'id',item.id,'token',token,'path',p_actor::text||'/'||item.id::text||'/upload','expectedBytes',item.expected_bytes,'consentAt',item.consent_at);
end; $$;
create function public.m10_finish_audio(p_upload uuid,p_actor uuid,p_token uuid,p_media text,p_extension text,p_bytes integer,p_duration integer)
returns uuid language plpgsql security invoker set search_path='' as $$
declare item anansi_private.audio_uploads%rowtype; path text;
begin
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
create function public.m10_fail_audio(p_upload uuid,p_actor uuid,p_token uuid)
returns void language plpgsql security invoker set search_path='' as $$
begin
 update anansi_private.audio_uploads set state='failed',claim_token=null,claim_expires_at=null
 where id=p_upload and user_id=p_actor and ((state='processing' and claim_token=p_token) or (state='pending' and p_token is null));
end; $$;
revoke all on function public.m10_reserve_audio(uuid,text,integer),public.m10_claim_audio(uuid,uuid),public.m10_finish_audio(uuid,uuid,uuid,text,text,integer,integer),public.m10_fail_audio(uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function public.m10_reserve_audio(uuid,text,integer),public.m10_claim_audio(uuid,uuid),public.m10_finish_audio(uuid,uuid,uuid,text,text,integer,integer),public.m10_fail_audio(uuid,uuid,uuid) to service_role;
notify pgrst,'reload schema';
commit;
