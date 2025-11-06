-- Profiles table stores human-readable account data linked to Supabase auth.users.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  email text not null unique,
  onboarding_complete boolean not null default false,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Preferences hold demo-account settings for each profile.
create table if not exists public.preferences (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles (id) on delete cascade,
  starting_balance numeric(14, 2) not null default 10000,
  current_balance numeric(14, 2) not null default 10000,
  base_currency text not null default 'USD',
  auto_reset_on_stop_out boolean not null default false,
  notifications_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Onboarding catalog replicates the original Prisma models.
create table if not exists public.onboarding_questions (
  id uuid primary key default gen_random_uuid(),
  prompt text not null unique,
  description text,
  type text not null check (type in ('SINGLE_SELECT', 'MULTI_SELECT', 'FREE_TEXT')),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.onboarding_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.onboarding_questions (id) on delete cascade,
  label text not null,
  value text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint onboarding_options_question_value unique (question_id, value)
);

create table if not exists public.onboarding_responses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  question_id uuid not null references public.onboarding_questions (id) on delete cascade,
  option_id uuid references public.onboarding_options (id) on delete set null,
  free_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists onboarding_responses_profile_question_idx on public.onboarding_responses (profile_id, question_id);
create index if not exists onboarding_responses_option_idx on public.onboarding_responses (option_id);

-- Enable Row Level Security.
alter table public.profiles enable row level security;
alter table public.preferences enable row level security;
alter table public.onboarding_questions enable row level security;
alter table public.onboarding_options enable row level security;
alter table public.onboarding_responses enable row level security;

-- Profiles: each user can manage their own record.
create policy if not exists "Profiles select own row" on public.profiles
  for select using (auth.uid() = id);

create policy if not exists "Profiles insert self" on public.profiles
  for insert with check (auth.uid() = id);

create policy if not exists "Profiles update self" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Preferences: 1:1 with profile.
create policy if not exists "Preferences select own" on public.preferences
  for select using (auth.uid() = profile_id);

create policy if not exists "Preferences upsert own" on public.preferences
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- Onboarding catalog is readable by authenticated users only.
create policy if not exists "Onboarding questions readable" on public.onboarding_questions
  for select using (auth.role() = 'authenticated');

create policy if not exists "Onboarding options readable" on public.onboarding_options
  for select using (auth.role() = 'authenticated');

-- Onboarding responses belong to each profile.
create policy if not exists "Onboarding responses select own" on public.onboarding_responses
  for select using (auth.uid() = profile_id);

create policy if not exists "Onboarding responses insert own" on public.onboarding_responses
  for insert with check (auth.uid() = profile_id);

create policy if not exists "Onboarding responses delete own" on public.onboarding_responses
  for delete using (auth.uid() = profile_id);

-- Helpful trigger to keep updated_at fresh.
create or replace function public.touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'profiles_touch_updated_at'
  ) then
    create trigger profiles_touch_updated_at
      before update on public.profiles
      for each row execute procedure public.touch_updated_at();
  end if;

  if not exists (
    select 1
    from pg_trigger
    where tgname = 'preferences_touch_updated_at'
  ) then
    create trigger preferences_touch_updated_at
      before update on public.preferences
      for each row execute procedure public.touch_updated_at();
  end if;

  if not exists (
    select 1
    from pg_trigger
    where tgname = 'onboarding_questions_touch_updated_at'
  ) then
    create trigger onboarding_questions_touch_updated_at
      before update on public.onboarding_questions
      for each row execute procedure public.touch_updated_at();
  end if;

  if not exists (
    select 1
    from pg_trigger
    where tgname = 'onboarding_options_touch_updated_at'
  ) then
    create trigger onboarding_options_touch_updated_at
      before update on public.onboarding_options
      for each row execute procedure public.touch_updated_at();
  end if;

  if not exists (
    select 1
    from pg_trigger
    where tgname = 'onboarding_responses_touch_updated_at'
  ) then
    create trigger onboarding_responses_touch_updated_at
      before update on public.onboarding_responses
      for each row execute procedure public.touch_updated_at();
  end if;
end;
$$;
