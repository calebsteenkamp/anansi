-- M3. OWNER REVIEW/APPLICATION REQUIRED. Additive; no resets or write grants.
begin;
alter table public.stories
 add column audio_consent_at timestamptz,
 add column audio_media_type text,
 add column audio_size_bytes integer;
alter table public.stories add constraint stories_audio_capture_metadata check (
 (audio_consent_at is null and audio_media_type is null and audio_size_bytes is null) or
 (audio_consent_at is not null and audio_media_type is not null and audio_size_bytes is not null and audio_media_type in ('audio/mpeg','audio/mp4','audio/webm','audio/wav')
  and audio_size_bytes between 1 and 25000000 and audio_path is not null and audio_duration_ms is not null)
);
-- Existing M2 fixtures may have no capture metadata. New M3 server writes require it.
-- Keep private, reject oversized/non-audio uploads even for the server upload path.
update storage.buckets set file_size_limit=25000000,
 allowed_mime_types=array['audio/mpeg','audio/mp4','audio/webm','audio/wav']
 where id='story-audio' and public=false;
-- No client INSERT/UPDATE/DELETE grants/policies added. M3 writes are narrowly guarded server operations.
notify pgrst, 'reload schema';
commit;
