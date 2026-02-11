export const GOAL_TYPES = {
    LOSE_FAT: 'lose_fat',
    RECOMP: 'recomp',
    MAINTAIN: 'maintain',
    GAIN: 'gain_muscle'
};

export const LIFESTYLE_LEVELS = {
    SEDENTARY: 'sedentary',
    MIXED: 'mixed',
    ACTIVE: 'active'
};

export const STEPS_RANGES = {
    LT4K: 'lt4k',
    K4_7: 'k4_7',
    K7_10: 'k7_10',
    GT10K: 'gt10k'
};

/**
 * Calculates MVP Nutrition Targets with Ranges
 * Source: User Prompt Feb 2026
 */
export function calculateTargetRanges(profile) {
    // 1. Inputs
    const weight = Number(profile.weight_kg);
    const height = Number(profile.height_cm);
    const age = Number(profile.age);
    const trainingDays = Math.min(Number(profile.training_days_per_week || 0), 7);
    const lifestyle = profile.lifestyle_level || LIFESTYLE_LEVELS.SEDENTARY;
    const steps = profile.steps_range || STEPS_RANGES.LT4K;
    const goal = profile.goal || GOAL_TYPES.MAINTAIN;

    if (!weight || !height || !age) return null;

    // 2. BMR (Mifflin-St Jeor for Women)
    const bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;

    // 3. Activity Multiplier (Granular Composite Score)
    // We map inputs to a score (0-8) to determine standard activity levels.

    let activityScore = 0;

    // A. Lifestyle
    if (lifestyle === LIFESTYLE_LEVELS.MIXED) activityScore += 1;
    if (lifestyle === LIFESTYLE_LEVELS.ACTIVE) activityScore += 2;

    // B. Steps
    if (steps === STEPS_RANGES.K4_7) activityScore += 1;
    if (steps === STEPS_RANGES.K7_10) activityScore += 2;
    if (steps === STEPS_RANGES.GT10K) activityScore += 3;

    // C. Training (Weighted more heavily)
    if (trainingDays >= 1 && trainingDays <= 2) activityScore += 1;
    if (trainingDays >= 3 && trainingDays <= 4) activityScore += 2;
    if (trainingDays >= 5 && trainingDays <= 6) activityScore += 3;
    if (trainingDays >= 7) activityScore += 4; // High volume

    // D. Map Score to Multiplier (Standard PAL values)
    let multiplier = 1.2; // Sedentary (Score 0-1)

    // Adjusted Thresholds
    if (activityScore >= 2) multiplier = 1.375; // Lightly Active
    if (activityScore >= 4) multiplier = 1.55; // Moderately Active
    if (activityScore >= 7) multiplier = 1.725; // Very Active
    if (activityScore >= 10) multiplier = 1.9; // Extra Active

    // 4. TDEE
    const tdee = Math.round(bmr * multiplier);

    // 5. Goal Adjustment (Single Value)
    let targetCals = tdee;

    // Support 'cut' legacy value
    if (goal === GOAL_TYPES.LOSE_FAT || goal === GOAL_TYPES.RECOMP || goal === 'cut') {
        // Deficit based on Tempo
        let deficitFactor = 0.85; // Default Average (-15%)
        if (profile.resultTempo === 'slow') deficitFactor = 0.90; // -10%
        if (profile.resultTempo === 'fast') deficitFactor = 0.75; // -25%

        targetCals = Math.round(tdee * deficitFactor);
    } else if (goal === GOAL_TYPES.GAIN) {
        // Surplus based on Tempo
        let surplusFactor = 1.10; // Default Average (+10%)
        if (profile.resultTempo === 'slow') surplusFactor = 1.05; // +5% (Lean bulk)
        if (profile.resultTempo === 'fast') surplusFactor = 1.15; // +15% (Aggressive bulk)

        targetCals = Math.round(tdee * surplusFactor);
    }

    // 6. Macros (Fixed Grams per KG)
    // Protein: 1.8g (maintain/bulk) - 2.0g (cut)
    let proteinFactor = 1.8;
    if (goal === GOAL_TYPES.LOSE_FAT || goal === GOAL_TYPES.RECOMP || goal === 'cut') {
        proteinFactor = 2.0;
    }
    const protein = Math.round(weight * proteinFactor);

    // Fats: 0.9g per kg (Healthy baseline)
    const fat = Math.round(weight * 0.9);

    // Carbs: Remainder
    // 1g Protein = 4kcal, 1g Fat = 9kcal, 1g Carb = 4kcal
    const caloriesUsed = (protein * 4) + (fat * 9);
    const remainingCals = Math.max(0, targetCals - caloriesUsed);
    const carbs = Math.round(remainingCals / 4);

    return {
        tdee_estimate: tdee,
        calorie_target: targetCals, // Single Value
        protein_g: protein,
        fat_g: fat,
        carbs_g: carbs,
        // Legacy range fields (populated with single value for compatibility)
        calorie_target_min: targetCals,
        calorie_target_max: targetCals,
        protein_g_min: protein,
        protein_g_max: protein,
        fat_g_min: fat,
        fat_g_max: fat,
        carbs_g_min: carbs,
        carbs_g_max: carbs
    };
}
