-- ==========================================
-- SAFE UPDATE SCRIPT (Can run multiple times)
-- ==========================================

-- 1. PROFILES: Safe Column Additions
alter table profiles add column if not exists period_start_dates jsonb default '[]'::jsonb;
alter table profiles add column if not exists cycle_history jsonb default '[]'::jsonb;
alter table profiles add column if not exists cycle_stats jsonb default '{}'::jsonb;
alter table profiles add column if not exists is_onboarded boolean default false;

-- 2. PROFILES: Reset Policies (Prevents "Policy Exists" error)
drop policy if exists "Public profiles are viewable by everyone." on profiles;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);

drop policy if exists "Users can insert their own profile." on profiles;
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile." on profiles;
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- 3. DAILY LOGS: Create Table (Safe)
create table if not exists daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  date date not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default now(),
  unique(user_id, date)
);

-- 4. DAILY LOGS: Reset Policies
alter table daily_logs enable row level security;

drop policy if exists "Users can view their own logs." on daily_logs;
create policy "Users can view their own logs." on daily_logs for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own logs." on daily_logs;
create policy "Users can insert their own logs." on daily_logs for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own logs." on daily_logs;
create policy "Users can update their own logs." on daily_logs for update using (auth.uid() = user_id);
