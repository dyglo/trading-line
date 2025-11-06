# Supabase Resources

- `schema.sql` — creates profiles, preferences, onboarding tables, shared triggers, and Row Level Security policies.
- `seed_onboarding.sql` — populates the onboarding questions/options used by the onboarding wizard (safe to re-run).

**Usage**

1. Open your Supabase project's SQL editor.
2. Run `schema.sql` once to provision tables and policies.
3. Run `seed_onboarding.sql` to hydrate the onboarding catalog.
4. Ensure email/password auth is enabled. New signups should insert into `profiles` automatically on first login.
