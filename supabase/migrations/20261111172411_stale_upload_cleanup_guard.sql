-- Owner review/application required. Function-only correction; no story deletion.
begin;
-- Confirm the claim transition before any failed-upload cleanup. A stale worker must not remove staging.
create or replace function public.m10_fail_audio(p_upload uuid,p_actor uuid,p_token uuid)
returns void language plpgsql security invoker set search_path='' as $$
begin
 if not anansi_private.demo_actor_allowed(p_actor) then raise exception 'account_not_allowed'; end if;
 update anansi_private.audio_uploads set state='failed',claim_token=null,claim_expires_at=null
 where id=p_upload and user_id=p_actor and ((state='processing' and claim_token=p_token and claim_expires_at>now()) or (state='pending' and p_token is null));
 if not found then raise exception 'stale_claim'; end if;
end; $$;

notify pgrst,'reload schema';
commit;
