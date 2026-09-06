export const GOAL_TYPES = {
    LOSE_FAT: 'lose_fat',
    RECOMP: 'recomp',
    MAINTAIN: 'maintain',
    GAIN: 'gain_muscle'
};

export const LIFESTYLE_LEVELS = {
    SEDENTARY: 'sedentary',
    LIGHTLY_ACTIVE: 'lightly_active',
    MODERATELY_ACTIVE: 'moderately_active',
    VERY_ACTIVE: 'very_active'
};

export const STEPS_RANGES = {
    LT4K: 'lt4k',
    K4_8: '4k_8k',
    K8_12: '8k_12k',
    GT12K: 'gt12k'
};

/**
 * Goal × Tempo Adjustment Matrix
 *
 * | Goal           | Rustig (slow) | Gemiddeld (average) | Snel (fast) |
 * |----------------|---------------|---------------------|-------------|
 * | Vet verliezen  | -15%          | -20%                | -25%        |
 * | Recomp         | -5%           | -10%                | -15%        |
 * | Behouden       | 0%            | 0%                  | 0%          |
 * | Spier opbouwen | +5%           | +10%                | +15%        |
 */
const GOAL_ADJUSTMENTS = {
    [GOAL_TYPES.LOSE_FAT]: { slow: 0.85, average: 0.80, fast: 0.75 },
    [GOAL_TYPES.RECOMP]: { slow: 0.95, average: 0.90, fast: 0.85 },
    [GOAL_TYPES.MAINTAIN]: { slow: 1.00, average: 1.00, fast: 1.00 },
    [GOAL_TYPES.GAIN]: { slow: 1.05, average: 1.10, fast: 1.15 },
};

/**
 * Protein factor per goal (g per kg bodyweight)
 * Higher protein during deficit to preserve muscle
 */
const PROTEIN_FACTORS = {
    [GOAL_TYPES.LOSE_FAT]: 2.0,
    [GOAL_TYPES.RECOMP]: 2.0,
    [GOAL_TYPES.MAINTAIN]: 1.8,
    [GOAL_TYPES.GAIN]: 1.8,
};

/**
 * Calculates MVP Nutrition Targets
 * All input values from Profile/Onboarding are properly factored in:
 * - weight, height, age → BMR (Mifflin-St Jeor for Women)
 * - lifestyle_level, steps_range, training_days → Activity Multiplier → TDEE
 * - goal + resultTempo → Calorie adjustment (deficit/surplus)
 * - goal → Protein factor
 * - Remaining calories → Carbs
 */
export function calculateTargetRanges(profile) {
    // 1. Inputs (with safe defaults)
    const weight = Number(profile.weight_kg);
    const height = Number(profile.height_cm);
    const age = Number(profile.age);
    const trainingDays = Math.min(Number(profile.training_days_per_week || 0), 7);
    const lifestyle = profile.lifestyle_level || LIFESTYLE_LEVELS.SEDENTARY;
    const steps = profile.steps_range || STEPS_RANGES.LT4K;
    const goal = profile.goal || GOAL_TYPES.MAINTAIN;
    const tempo = profile.resultTempo || 'average';

    if (!weight || !height || !age) return null;

    // 2. BMR (Mifflin-St Jeor for Women)
    const bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;

    // 3. Activity Multiplier (Composite Score → PAL)
    let activityScore = 0;

    // A. Lifestyle (0-3)
    if (lifestyle === LIFESTYLE_LEVELS.LIGHTLY_ACTIVE) activityScore += 1;
    if (lifestyle === LIFESTYLE_LEVELS.MODERATELY_ACTIVE) activityScore += 2;
    if (lifestyle === LIFESTYLE_LEVELS.VERY_ACTIVE) activityScore += 3;

    // B. Steps (0-3)
    if (steps === STEPS_RANGES.K4_8) activityScore += 1;
    if (steps === STEPS_RANGES.K8_12) activityScore += 2;
    if (steps === STEPS_RANGES.GT12K) activityScore += 3;

    // C. Training days (0-4, weighted more heavily)
    if (trainingDays >= 1 && trainingDays <= 2) activityScore += 1;
    if (trainingDays >= 3 && trainingDays <= 4) activityScore += 2;
    if (trainingDays >= 5 && trainingDays <= 6) activityScore += 3;
    if (trainingDays >= 7) activityScore += 4;

    // D. Map Score to PAL Multiplier
    // Max possible score: 3 + 3 + 4 = 10
    let multiplier = 1.2; // Sedentary (score 0-1)
    if (activityScore >= 2) multiplier = 1.375; // Lightly Active
    if (activityScore >= 4) multiplier = 1.55;  // Moderately Active
    if (activityScore >= 7) multiplier = 1.725; // Very Active
    if (activityScore >= 10) multiplier = 1.9;  // Extra Active

    // 4. TDEE
    const tdee = Math.round(bmr * multiplier);

    // 5. Goal + Tempo → Calorie Target
    const goalAdj = GOAL_ADJUSTMENTS[goal] || GOAL_ADJUSTMENTS[GOAL_TYPES.MAINTAIN];
    const factor = goalAdj[tempo] || goalAdj['average'];
    const targetCals = Math.round(tdee * factor);

    // 6. Macros
    // Protein (g/kg based on goal)
    const proteinFactor = PROTEIN_FACTORS[goal] || 1.8;
    const protein = Math.round(weight * proteinFactor);

    // Fat: 0.9g per kg (healthy baseline for hormonal balance)
    const fat = Math.round(weight * 0.9);

    // Carbs: fill remainder from target calories
    // 1g protein = 4kcal, 1g fat = 9kcal, 1g carb = 4kcal
    const proteinCals = protein * 4;
    const fatCals = fat * 9;
    const carbCals = Math.max(0, targetCals - proteinCals - fatCals);
    const carbs = Math.round(carbCals / 4);

    // 7. Exact kcal from macros (ensures UI consistency)
    const exactTargetKcal = proteinCals + (carbs * 4) + fatCals;

    // 8. Range calculation (daily fluctuation buffer)
    const calorieBuffer = Math.round(exactTargetKcal * 0.05);
    const proteinBuffer = Math.round(protein * 0.1);
    const fatBuffer = Math.round(fat * 0.1);
    const carbBuffer = Math.round(carbs * 0.1);

    return {
        tdee_estimate: tdee,
        calorie_target: exactTargetKcal,
        protein_g: protein,
        fat_g: fat,
        carbs_g: carbs,
        calorie_target_min: exactTargetKcal,
        calorie_target_max: exactTargetKcal + calorieBuffer,
        protein_g_min: protein,
        protein_g_max: protein + proteinBuffer,
        fat_g_min: fat,
        fat_g_max: fat + fatBuffer,
        carbs_g_min: carbs,
        carbs_g_max: carbs + carbBuffer
    };
}
