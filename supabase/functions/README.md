# Privileged Edge Function authorization

These functions use `SUPABASE_SERVICE_ROLE_KEY`, so authorization is enforced in function code before privileged database access:

- `list-memories`, `search-memories`, `store-memory`, `manage-memory`
  - caller: trusted project admin/agent only
  - required header: `Authorization: Bearer $PROJECT_MEMORY_ADMIN_TOKEN`
- `streak-reminder`
  - caller: trusted scheduler only
  - method: `POST` only
  - required header: `Authorization: Bearer $STREAK_REMINDER_CRON_SECRET`

The corresponding `supabase/config.toml` entries use `verify_jwt = false` deliberately because these server-only bearer values are not Supabase user JWTs. That setting does **not** make the functions public: requests fail closed in `_shared/privileged-auth.ts` when a secret is missing or does not match.

Deployment requirements:

1. Set `PROJECT_MEMORY_ADMIN_TOKEN` for any deployment that enables the project-memory functions.
2. Set `STREAK_REMINDER_CRON_SECRET` and configure the scheduler to send it as the Bearer token.
3. Keep `SUPABASE_SERVICE_ROLE_KEY`, VAPID keys, and both authorization secrets server-only.
4. Do not configure browser clients or ordinary learner sessions with either privileged secret.
5. Deploy the checked-in function configuration together with the function source; do not rely on a dashboard-only `verify_jwt` assumption.
