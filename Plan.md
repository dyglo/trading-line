# Supabase Frontend Plan

- [x] Replace the Express/Prisma backend with a Supabase-only data layer accessed from the React app.
- [x] Create a dedicated `src/supabase/` module that encapsulates auth, profile, preference, and onboarding operations.
- [x] Update the React Query `AuthProvider` to consume Supabase sessions, handle sign in/up/out, and refresh profile state.
- [x] Rewire onboarding and profile flows to call Supabase directly, including balance resets and onboarding submissions.
- [x] Simplify environment management to the Supabase URL + anon key and remove all Prisma/Postgres scripts.
- [x] Provide SQL helpers in `/supabase` for recreating tables, policies, and onboarding seed data.
- [x] Define RLS policies and SQL seed scripts in Supabase to ensure new users can insert/update their own records.
- [ ] Add automated smoke tests (Cypress or Playwright) for register/login/onboarding once Supabase tables are finalised.
