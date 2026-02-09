-- Create a table for public profiles (linked to auth.users)
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  
  -- Profile Data
  name text,
  email text, -- Optional: sometimes good to have here too
  
  -- Onboarding Data
  cycle_start date,
  cycle_length int default 28,
  period_length int default 5,
  bleeding_length_days int default 5,
  
  age int,
  height numeric, -- in cm
  weight numeric, -- in kg
  target_weight numeric, -- optional
  
  goal text, -- 'loss', 'gain', 'maintain', 'recomp'
  activity_level numeric default 1.55,
  training_frequency int default 3,
  training_type text, -- 'strength', 'cardio', 'combination'
  experience_level text, -- 'beginner', 'intermediate', 'advanced'
  result_tempo text, -- 'slow', 'average', 'fast'
  
  -- App State
  is_onboarded boolean default false,
  
  constraint username_length check (char_length(name) >= 3)
);

-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security for more details.
alter table profiles enable row level_security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- This triggers a profile creation when a user signs up via Supabase Auth.
-- You can run this in the SQL editor if you want automatic empty profile creation.
-- For now, we will handle insertion manually in the app to keep it simple.
