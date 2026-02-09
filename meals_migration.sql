-- ===========================================
-- GERECHTEN (MEALS) FEATURE - SUPABASE MIGRATION
-- ===========================================
-- Run this in Supabase SQL Editor

-- 1. MEALS TABLE: User-owned meal templates
CREATE TABLE IF NOT EXISTS meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  created_at timestamptz DEFAULT now()
);

-- 2. MEAL_ITEMS TABLE: Ingredients in a meal
CREATE TABLE IF NOT EXISTS meal_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id uuid NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  product_name text NOT NULL,
  quantity numeric NOT NULL,
  unit text NOT NULL CHECK (unit IN ('g','ml','stuk','portie')),
  kcal_100 numeric NOT NULL,
  protein_100 numeric NOT NULL,
  carbs_100 numeric NOT NULL,
  fat_100 numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 3. FOOD_LOGS TABLE: Logged food entries (products OR meals)
CREATE TABLE IF NOT EXISTS food_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_type text NOT NULL CHECK (source_type IN ('product','meal')),
  source_id text NOT NULL,
  name_snapshot text NOT NULL,
  totals_kcal numeric NOT NULL,
  totals_protein numeric NOT NULL,
  totals_carbs numeric NOT NULL,
  totals_fat numeric NOT NULL,
  date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 4. INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_meals_user ON meals(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_items_meal ON meal_items(meal_id);
CREATE INDEX IF NOT EXISTS idx_food_logs_user_date ON food_logs(user_id, date);

-- 5. ROW LEVEL SECURITY
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (safe re-run)
DROP POLICY IF EXISTS meals_owner ON meals;
DROP POLICY IF EXISTS meal_items_via_meal ON meal_items;
DROP POLICY IF EXISTS food_logs_owner ON food_logs;

-- MEALS: Users can only access their own meals
CREATE POLICY meals_owner ON meals
  FOR ALL USING (user_id = auth.uid());

-- MEAL_ITEMS: Accessible only via meals owned by user
CREATE POLICY meal_items_via_meal ON meal_items
  FOR ALL USING (
    meal_id IN (SELECT id FROM meals WHERE user_id = auth.uid())
  );

-- FOOD_LOGS: Users can only access their own logs
CREATE POLICY food_logs_owner ON food_logs
  FOR ALL USING (user_id = auth.uid());
