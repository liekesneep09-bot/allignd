-- Migration: Deterministic Nutrition Refactor

-- 1. Ensure profiles has the correct columns for the new logic
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS goal_weight numeric,
ADD COLUMN IF NOT EXISTS goal_type text CHECK (goal_type IN ('lose_fat', 'recomp', 'maintain', 'gain')),
ADD COLUMN IF NOT EXISTS strength_sessions_per_week int DEFAULT 3,
ADD COLUMN IF NOT EXISTS pace text CHECK (pace IN ('slow', 'average', 'fast'));

-- 2. Create nutrition_targets table
CREATE TABLE IF NOT EXISTS nutrition_targets (
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
    cal_target int NOT NULL,
    protein_g int NOT NULL,
    carbs_g int NOT NULL,
    fat_g int NOT NULL,
    
    -- Debug fields
    tdee int,
    bmr int,
    activity_factor numeric,
    
    computed_at timestamp with time zone DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE nutrition_targets ENABLE ROW LEVEL SECURITY;

-- 4. Policies
CREATE POLICY "Users can view own targets" ON nutrition_targets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert/update own targets" ON nutrition_targets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own targets" ON nutrition_targets
    FOR UPDATE USING (auth.uid() = user_id);
