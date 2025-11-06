# Setup Instructions

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root with the following variables:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Start Development Servers

Run the dev server:

```bash
npm run dev
```

The app will be available on `http://localhost:8080`.

### 4. Verify Setup

1. App should be accessible at `http://localhost:8080`
2. Register or sign in with a Supabase auth user
3. Complete the onboarding flow to verify database connectivity

## Supabase Schema & Policies

1. Open the Supabase SQL editor and run the statements in `supabase/schema.sql`
2. Seed the onboarding catalog with `supabase/seed_onboarding.sql` (you can re-run to update copy)
3. Confirm Row Level Security policies exist for every table before inviting collaborators

## Troubleshooting

### Supabase auth issues

- Ensure the Supabase project has email/password signups enabled
- Check the policy on the `profiles` table so new users can insert their row (`auth.uid() = id`)

### Missing onboarding questions

- Seed the `onboarding_questions` and `onboarding_options` tables in Supabase
- Confirm RLS policies allow authenticated users to select rows

## Production Deployment (Vercel)

### Required Environment Variables in Vercel:

1. `VITE_SUPABASE_URL` - Supabase project URL
2. `VITE_SUPABASE_ANON_KEY` - Supabase anon key

### Optional Environment Variables:

- Analytics, feature flags, or logging tokens you configure separately

## Notes

- Never commit your `.env` file to version control
- Supabase hosts both authentication and database storage—ensure RLS policies cover every table
- For local dev, you can use the Supabase Dashboard SQL editor to seed data quickly
