-- Owner-reviewed follow-up: keep automatic RLS event trigger, remove public RPC permissions.
-- Does not drop/change the function or event trigger, or alter application data.
begin;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
commit;
