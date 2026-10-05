-- zero_path_session_accessible leaked EXECUTE to `anonymous` (the real Data
-- API role) via default privileges — the first migration only revoked from
-- public/anon/authenticated. As a direct callable it would be a boolean
-- oracle for (session_id, secret) pairs. Only the owner/service path and
-- the definer functions themselves need it.

revoke all on function public.zero_path_session_accessible(uuid, text)
  from public, anon, anonymous, authenticated;
grant execute on function public.zero_path_session_accessible(uuid, text)
  to service_role;
