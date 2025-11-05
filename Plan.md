# Auth Implementation Plan

- [x] Phase 0 - Discovery: reviewed the current Vite + React codebase, routing, and UI entry points for future auth integration.
- [x] Phase 1 - Backend & Prisma bootstrap: introduce a dedicated `server/` workspace (Express or similar), configure environment loading, install `prisma`/`@prisma/client`, initialize Prisma schema, and wire up the Render Postgres connection.
- [x] Phase 2 - Data modeling & migrations: design Prisma models for `User`, `Session`, `OnboardingQuestion`, `OnboardingOption`, `UserOnboardingResponse`, and `UserPreference`; seed the onboarding catalog (five+ prompts) and create repeatable migration scripts.
- [x] Phase 3 - Authentication & profile API: implement register/login/logout endpoints with bcrypt password hashing and JWT tokens in HTTP-only cookies, guard protected routes, and expose handlers for profile updates, balance reset, and onboarding submission.
- [x] Phase 4 - Frontend auth foundation: add an auth provider with React Query hooks, configure a credential-aware API client, protect dashboard/profile routes, and enforce onboarding completion before dashboard access.
- [x] Phase 5 - UI implementation: craft polished login & registration pages, build the post-login onboarding wizard (progress UI plus dropdown/select inputs), and create the user profile/preferences page (username/email placeholders, demo balance reset, trading preferences).
- [ ] Phase 6 - QA & documentation: add backend handler tests as feasible, verify Prisma migrations against Render, document setup/run steps (env vars, scripts, question catalog) in the README, and outline follow-up enhancements.

## Draft Onboarding Questions

1. How many years have you been trading? (options: <1 year, 1-3 years, 3-5 years, 5+ years)
2. Which markets do you focus on? (options: Forex, Stocks, Crypto, Indices, Commodities)
3. What is your typical trade timeframe? (options: Scalping/Day trades, Swing trades, Position trades, Long-term investing)
4. What best describes your trading style? (options: Technical analyst, Fundamental investor, Quantitative/systematic, Copy/social trader)
5. How would you rate your risk tolerance? (options: Conservative, Balanced, Aggressive, Willing to experiment)
6. What is your primary goal on T-Line? (options: Learn fundamentals, Practice new strategies, Prepare for funded account, Grow consistent profits)

## Phase 1 Notes

- Backend workspace lives in `server/` with TypeScript, Express, Helmet, and Prisma client bootstrap.
- Environment loader (`src/env.ts`) reads `.env` in `server/` or falls back to the project root; `DATABASE_URL` is required.
- Health endpoint (`GET /healthz`) verifies Prisma connectivity against the Render Postgres instance.
- Install dependencies and generate the Prisma client with:
  - `cd server`
  - `npm install`
  - `npm run prisma:generate`
  - `npm run dev` (starts the API on port 4000 by default)

## Phase 2 Notes

- `schema.prisma` now captures the core auth data model (users, sessions, onboarding catalog, responses, and preferences) with referential integrity and helpful indexes.
- Applied migrations (`20251105124022_init_auth` and `20251105130500_add_onboarding_constraints`) against Render via `npx prisma migrate deploy`.
- Seed script (`prisma/seed.ts`) preloads six onboarding questions with dropdown options; run it with `npm run prisma:seed`.
- Regenerate Prisma Client after schema edits using `npm run prisma:generate` to sync types with the new models.

## Phase 3 Notes

- Auth routes (`/api/auth`) expose register, login, refresh, logout, and `me` endpoints with JWT access/refresh tokens stored in HTTP-only cookies.
- Session lifecycle persists hashed refresh tokens in the `Session` table and rotates them during refresh; `requireAuth` middleware guards protected routes.
- Profile APIs deliver `/api/profile` and `/api/profile/preferences` updates, including balance reset support; onboarding submissions live at `/api/onboarding/submit`.
- New environment variables: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `ACCESS_TOKEN_EXPIRES_IN`, `REFRESH_TOKEN_EXPIRES_IN`, `CORS_ORIGIN`, and optional `COOKIE_SECURE`/`COOKIE_DOMAIN`.

## Phase 4 Notes

- Central `api` helper wraps `fetch` with credentials, JSON parsing, and unified `ApiError`.
- `AuthProvider` (React Query + context) manages user state, auth mutations, onboarding submission, and profile/preference actions.
- Route guards (`ProtectedRoute`, `GuestRoute`, `OnboardingRoute`) enforce per-page access while showing branded loading states.
- Vite dev server proxies `/api` traffic to `http://localhost:4000`, enabling cookie-based sessions during local development.

## Phase 5 Notes

- Crafted animated login and register experiences with shadcn/ui, framer-motion, and marketing panels.
- Built a multi-step onboarding wizard that supports single-select dropdowns, multi-select checklists, free-text prompts, and real-time progress tracking.
- Added a profile/preferences hub with balance controls, toggles, and reset flows, mirroring backend APIs.
- Header adapts to auth state (CTA swaps, dashboard access, logout) across desktop and mobile layouts.
