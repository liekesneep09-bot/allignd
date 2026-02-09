-- Add columns for storing calculated macro targets and onboarding timestamp
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS target_calories integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS target_protein integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS target_carbs integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS target_fat integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz DEFAULT NULL;

-- Index for quickly finding users who need migration (completed onboarding but no macros)
CREATE INDEX IF NOT EXISTS idx_profiles_needs_macro_calc ON profiles(is_onboarded) WHERE target_calories IS NULL;
