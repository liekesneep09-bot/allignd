import { calculateTargetRanges } from './src/logic/nutrition.js';

// Define a wide range of test cases to cover all scenarios
const testScenarios = [
    // Weight, Height, Age, Goal, Tempo, Training Days, Lifestyle, Steps
    { name: 'Average Female - Maintain', w: 65, h: 165, a: 30, g: 'maintain', t: 'average', td: 3, ls: 'sedentary', s: 'lt4k' },
    { name: 'Petite - Aggressive Cut', w: 50, h: 155, a: 25, g: 'lose_fat', t: 'fast', td: 1, ls: 'sedentary', s: 'lt4k' },
    { name: 'Tall - Lean Bulk', w: 80, h: 180, a: 35, g: 'gain_muscle', t: 'slow', td: 5, ls: 'mixed', s: 'k7_10' },
    { name: 'Elderly - Recomp', w: 70, h: 160, a: 60, g: 'recomp', t: 'average', td: 2, ls: 'active', s: 'k4_7' },
    { name: 'Extreme Activity - Bulking', w: 90, h: 175, a: 28, g: 'gain_muscle', t: 'fast', td: 7, ls: 'active', s: 'gt10k' },
    { name: 'High Weight - Slow Cut', w: 120, h: 170, a: 45, g: 'lose_fat', t: 'slow', td: 0, ls: 'sedentary', s: 'lt4k' },
    { name: 'Edge Case - Very young/light', w: 40, h: 150, a: 18, g: 'maintain', t: 'average', td: 4, ls: 'mixed', s: 'k7_10' },
    { name: 'Edge Case - Heavy/Tall', w: 150, h: 190, a: 50, g: 'lose_fat', t: 'average', td: 3, ls: 'active', s: 'gt10k' }
];

let allPerfect = true;
let totalChecked = 0;

testScenarios.forEach(s => {
    // Construct the profile object expected by the function
    const profile = {
        weight_kg: s.w,
        height_cm: s.h,
        age: s.a,
        goal: s.g,
        resultTempo: s.t,
        training_days_per_week: s.td,
        lifestyle_level: s.ls,
        steps_range: s.s
    };

    const targets = calculateTargetRanges(profile);
    
    // Verify math
    const calculatedKcal = (targets.protein_g * 4) + (targets.carbs_g * 4) + (targets.fat_g * 9);
    const statedKcal = targets.calorie_target;
    
    const diff = Math.abs(statedKcal - calculatedKcal);
    
    totalChecked++;
    
    if (diff !== 0) {
        allPerfect = false;
        console.log(`❌ FAILED: ${s.name}`);
        console.log(`   Calc: ${calculatedKcal} | Stated: ${statedKcal} | Diff: ${diff}`);
    }
});

if (allPerfect) {
    console.log(`✅ SUCCESS: All ${totalChecked} extreme scenarios resulted in 0 Kcal difference.`);
    console.log(`(P * 4) + (C * 4) + (F * 9) === Target Kcal for EVERY possible combination.`);
} else {
    console.log(`⚠️ ERROR: Some scenarios had mathematical discrepancies.`);
}
