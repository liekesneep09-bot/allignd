export const GOAL_TYPES = {
    LOSE_FAT: 'cut',
    RECOMP: 'recomp',
    MAINTAIN: 'maintain'
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

    // 3. Multiplier
    const base = 1.2;
    const trainingFactor = Math.min(trainingDays * 0.05, 0.25);

    let lifestyleFactor = 0.00;
    if (lifestyle === LIFESTYLE_LEVELS.MIXED) lifestyleFactor = 0.07;
    if (lifestyle === LIFESTYLE_LEVELS.ACTIVE) lifestyleFactor = 0.14;

    let stepsFactor = 0.00;
    if (steps === STEPS_RANGES.K4_7) stepsFactor = 0.05;
    if (steps === STEPS_RANGES.K7_10) stepsFactor = 0.10;
    if (steps === STEPS_RANGES.GT10K) stepsFactor = 0.15;

    const multiplier = base + trainingFactor + lifestyleFactor + stepsFactor;

    // 4. TDEE
    const tdee = Math.round(bmr * multiplier);

    // 5. Calorie Target Range
    let targetCals = tdee;
    if (goal === GOAL_TYPES.LOSE_FAT) targetCals = Math.round(tdee * 0.85);
    if (goal === GOAL_TYPES.RECOMP) targetCals = Math.round(tdee * 0.95);
    // Maintain = 1.0

    const calMin = targetCals - 150;
    const calMax = targetCals + 150;

    // 6. Protein Range
    let pMinFactor = 1.6;
    let pMaxFactor = 2.0;

    if (goal === GOAL_TYPES.LOSE_FAT || goal === GOAL_TYPES.RECOMP) {
        pMinFactor = 1.8;
        pMaxFactor = 2.2;
    }

    const pMin = Math.round(weight * pMinFactor);
    const pMax = Math.round(weight * pMaxFactor);

    // 7. Fat Range
    const fMin = Math.max(Math.round(0.8 * weight), 45);
    const fMax = fMin + 15;

    // 8. Carbs Range (Rest)
    // Formula: carbs_g = max(0, round((kcal_total - protein_g*4 - fat_g*9) / 4))

    // Min Carbs: conservative scenario (Low Cal, High P/F)
    const cMinRaw = (calMin - (pMax * 4) - (fMax * 9)) / 4;

    // Max Carbs: optimistic scenario (High Cal, Low P/F)
    const cMaxRaw = (calMax - (pMin * 4) - (fMin * 9)) / 4;

    const cMin = Math.max(0, Math.round(cMinRaw));
    const cMax = Math.max(0, Math.round(cMaxRaw));

    return {
        tdee_estimate: tdee,
        calorie_target_min: calMin,
        calorie_target_max: calMax,
        protein_g_min: pMin,
        protein_g_max: pMax,
        fat_g_min: fMin,
        fat_g_max: fMax,
        carbs_g_min: cMin,
        carbs_g_max: cMax
    };
}
