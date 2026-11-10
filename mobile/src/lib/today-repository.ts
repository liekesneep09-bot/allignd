import { FOOD_DATABASE } from '../../../src/data/foods';
import { getSupabase } from '@/lib/supabase';
import type { DailyTopic, Food, FoodLog, MealCategory, TodayData } from '@/types/today';

function number(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function mapFoodLog(log: Record<string, unknown>): FoodLog {
  return {
    id: String(log.id),
    date: String(log.date),
    foodId: log.food_id == null ? null : String(log.food_id),
    name: String(log.name ?? 'Voeding'),
    grams: log.grams == null ? null : number(log.grams),
    quantity: log.quantity == null ? null : number(log.quantity),
    unitName: log.unit_name == null ? null : String(log.unit_name),
    kcal: number(log.kcal),
    protein: number(log.protein),
    carbs: number(log.carbs),
    fat: number(log.fat),
    fiber: number(log.fiber),
    mealCategory: (log.meal_category ?? null) as MealCategory,
  };
}

export async function loadTodayData(userId: string): Promise<TodayData> {
  const db = getSupabase();
  const [profileResult, targetsResult, customFoodsResult, foodsResult, weightsResult,
    waterResult, stepsResult, symptomsResult, movementResult, topicResult] = await Promise.all([
    db.from('profiles').select('*').eq('id', userId).maybeSingle(),
    db.from('computed_targets').select('*').eq('user_id', userId).maybeSingle(),
    db.from('custom_foods').select('*').eq('user_id', userId),
    db.from('food_logs').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
    db.from('weight_logs').select('id, weight, date').eq('user_id', userId).order('date', { ascending: true }),
    db.from('water_logs').select('date, amount_ml').eq('user_id', userId),
    db.from('step_logs').select('date, steps').eq('user_id', userId),
    db.from('symptom_logs').select('date, symptoms').eq('user_id', userId),
    db.from('movement_logs').select('date, status').eq('user_id', userId),
    db.from('community_topics').select('id, question, date').order('date', { ascending: false }).limit(5),
  ]);

  const results = [profileResult, targetsResult, customFoodsResult, foodsResult, weightsResult,
    waterResult, stepsResult, symptomsResult, movementResult];
  const failedResult = results.find((result) => result.error);
  if (failedResult?.error) throw new Error(failedResult.error.message);

  const profile = profileResult.data;
  const targets = targetsResult.data;
  const customFoods: Food[] = (customFoodsResult.data ?? []).map((food) => ({
    id: String(food.id),
    name_nl: String(food.name_nl),
    kcal_100: number(food.kcal_100),
    protein_100: number(food.protein_100),
    carbs_100: number(food.carbs_100),
    fat_100: number(food.fat_100),
    fiber_100: number(food.fiber_100),
    unit_type: food.unit_type ?? 'per_100g',
    unit_name: food.unit_name,
    unit_weight: food.unit_weight == null ? null : number(food.unit_weight),
    isCustom: true,
  }));

  const today = new Date();
  const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const dailyTopic = (topicResult.data ?? []).find((topic) => topic.date <= localToday) as DailyTopic | undefined;

  return {
    profile: {
      id: userId,
      name: profile?.name ?? '',
      cycleStart: profile?.cycle_start ?? null,
      cycleLength: number(profile?.cycle_length, 28),
      periodLength: number(profile?.period_length, 5),
      bleedingLengthDays: number(profile?.bleeding_length_days ?? profile?.period_length, 5),
      periodStartDates: profile?.period_start_dates ?? [],
      menstruationLogs: profile?.menstruation_logs ?? [],
      cycleStats: {
        learnedCycleLength: profile?.cycle_stats?.learnedCycleLength ?? null,
        variability: number(profile?.cycle_stats?.variability),
        confidence: profile?.cycle_stats?.confidence ?? 'low',
      },
      weight: profile?.weight == null ? null : number(profile.weight),
      tracking: profile?.tracking ?? 'now',
      userLanguage: profile?.user_language ?? 'nl',
      dietaryPreference: profile?.dietary_preference ?? 'everything',
    },
    targets: targets ? {
      calories: number(targets.calorie_target_min),
      proteinMin: number(targets.protein_g_min),
      fatMin: number(targets.fat_g_min),
      carbsMin: number(targets.carbs_g_min),
    } : null,
    foods: [...(FOOD_DATABASE as Food[]), ...customFoods],
    foodLogs: (foodsResult.data ?? []).map(mapFoodLog),
    weightLogs: (weightsResult.data ?? []).map((log) => ({ date: log.date, weight: number(log.weight) })),
    waterLogs: (waterResult.data ?? []).map((log) => ({ date: log.date, amountMl: number(log.amount_ml) })),
    stepLogs: (stepsResult.data ?? []).map((log) => ({ date: log.date, steps: number(log.steps) })),
    symptomLogs: (symptomsResult.data ?? []).map((log) => ({ date: log.date, symptoms: log.symptoms ?? [] })),
    movementLogs: (movementResult.data ?? []).map((log) => ({ date: log.date, status: log.status })),
    dailyTopic: dailyTopic ?? null,
  };
}
