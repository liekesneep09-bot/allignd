-- ============================================================
-- PRE-LAUNCH SECURITY FIXES
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ------------------------------------------------------------
-- 1. SECURE THE PROFILES TABLE
-- ------------------------------------------------------------
-- Currently, profiles can be read by anyone (public). We need to restrict this.
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- ------------------------------------------------------------
-- 2. CREATE AND SECURE "computed_targets"
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS computed_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tdee_estimate NUMERIC,
    calorie_target_min NUMERIC,
    calorie_target_max NUMERIC,
    protein_g_min NUMERIC,
    protein_g_max NUMERIC,
    fat_g_min NUMERIC,
    fat_g_max NUMERIC,
    carbs_g_min NUMERIC,
    carbs_g_max NUMERIC,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

ALTER TABLE computed_targets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own computed targets" ON computed_targets;
CREATE POLICY "Users can manage own computed targets" ON computed_targets
  FOR ALL USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 3. CREATE AND SECURE "movement_logs"
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS movement_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

ALTER TABLE movement_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own movement logs" ON movement_logs;
CREATE POLICY "Users can manage own movement logs" ON movement_logs
  FOR ALL USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 4. FIX "food_logs" TABLE (Add missing column and DELETE policy)
-- ------------------------------------------------------------
-- The code references 'fiber' but the migration script only had protein/carbs/fat
ALTER TABLE food_logs ADD COLUMN IF NOT EXISTS fiber NUMERIC DEFAULT 0;

-- Ensure users can delete their own logs
DROP POLICY IF EXISTS "Users can delete their own food logs" ON food_logs;
CREATE POLICY "Users can delete their own food logs" ON food_logs
  FOR DELETE USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 5. ENSURE DELETE POLICIES EXIST ON OTHER LOG TABLES
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Users can delete own water logs" ON water_logs;
CREATE POLICY "Users can delete own water logs" ON water_logs
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own symptom logs" ON symptom_logs;
CREATE POLICY "Users can delete own symptom logs" ON symptom_logs
  FOR DELETE USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 6. ENSURE "nutrition_targets" CAN ONLY BE ACCESSED BY OWNER
-- ------------------------------------------------------------
ALTER TABLE nutrition_targets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own nutrition targets" ON nutrition_targets;
CREATE POLICY "Users can manage own nutrition targets" ON nutrition_targets
  FOR ALL USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- SUMMARY OF CHANGES:
-- - Profiles are no longer publicly readable
-- - computed_targets table created with full RLS
-- - movement_logs table created with full RLS
-- - Missing 'fiber' column added to food_logs
-- - Missing DELETE policies added to food, water, and symptom logs
-- - nutrition_targets fully secured
-- ============================================================
