-- Owner review/application required AFTER the preceding three migrations.
begin;
alter table anansi_private.audio_uploads add column staging_cleaned_at timestamptz;
create function public.m10_expired_audio()
returns table(id uuid,path text) language sql security invoker set search_path='' as $$
 select id,user_id::text||'/'||id::text||'/upload' from anansi_private.audio_uploads
 where expires_at<now()-interval '10 minutes' and staging_cleaned_at is null order by expires_at,id limit 100;
$$;
create function public.m10_cleaned_audio(p_upload uuid)
returns void language sql security invoker set search_path='' as $$
 update anansi_private.audio_uploads set staging_cleaned_at=now() where id=p_upload and expires_at<now()-interval '10 minutes';
$$;
revoke all on function public.m10_expired_audio(),public.m10_cleaned_audio(uuid) from public,anon,authenticated;
grant execute on function public.m10_expired_audio(),public.m10_cleaned_audio(uuid) to service_role;
notify pgrst,'reload schema';
commit;
