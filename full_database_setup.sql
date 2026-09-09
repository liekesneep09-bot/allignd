-- ==========================================
-- 1. PROFILES (User Details & Settings)
-- ==========================================
create table if not exists profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone default now(),
  
  -- Profile Data
  name text,
  email text,
  
  -- Onboarding Data
  cycle_start date,
  cycle_length int default 28,
  period_length int default 5,
  bleeding_length_days int default 5,
  
  age int,
  height numeric,
  weight numeric,
  target_weight numeric,
  
  goal text,
  activity_level numeric default 1.55,
  training_frequency int default 3,
  experience_level text,
  result_tempo text,
  
  -- Cycle Learning Data (JSONB for flexibility)
  period_start_dates jsonb default '[]'::jsonb,
  cycle_history jsonb default '[]'::jsonb,
  cycle_stats jsonb default '{}'::jsonb,
  
  -- App State
  is_onboarded boolean default false,
  is_admin boolean not null default false
);

-- RLS for Profiles
alter table profiles enable row level security;

create policy "Users can view own profile." on profiles
  for select using (auth.uid() = id);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Prevent clients from granting themselves admin privileges.
create or replace function public.prevent_profile_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT' and coalesce(new.is_admin, false))
     or (tg_op = 'UPDATE' and new.is_admin is distinct from old.is_admin) then
    if coalesce(auth.role(), '') <> 'service_role' then
      raise exception 'is_admin can only be changed by a trusted server';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_profile_privilege_escalation on profiles;
create trigger prevent_profile_privilege_escalation
  before insert or update on profiles
  for each row execute function public.prevent_profile_privilege_escalation();


-- ==========================================
-- 2. DAILY LOGS (Food, Movement, Cycle)
-- ==========================================
create table if not exists daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  date date not null,
  data jsonb not null default '{}'::jsonb, -- Stores the entire day's log structure
  updated_at timestamp with time zone default now(),
  
  unique(user_id, date) -- One log per day per user
);

-- RLS for Daily Logs
alter table daily_logs enable row level security;

create policy "Users can view their own logs." on daily_logs
  for select using (auth.uid() = user_id);

create policy "Users can insert their own logs." on daily_logs
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own logs." on daily_logs
  for update using (auth.uid() = user_id);
