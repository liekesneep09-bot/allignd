import { calculateTargetRanges } from './src/logic/nutrition.js';

const testProfiles = [
    { weight_kg: 65, height_cm: 170, age: 30, goal: 'lose_fat', resultTempo: 'average', training_days_per_week: 3 },
    { weight_kg: 80, height_cm: 180, age: 25, goal: 'gain_muscle', resultTempo: 'fast', training_days_per_week: 5 },
    { weight_kg: 55, height_cm: 160, age: 40, goal: 'maintain', training_days_per_week: 1 }
];

testProfiles.forEach((p, idx) => {
    const targets = calculateTargetRanges(p);
    const calculatedKcal = (targets.protein_g * 4) + (targets.carbs_g * 4) + (targets.fat_g * 9);
    const statedKcal = targets.calorie_target_min; // or max, they are the same here

    console.log(`Profile ${idx + 1}:`);
    console.log(`  Stated Kcal: ${statedKcal}`);
    console.log(`  Target Macros: ${targets.protein_g}g P, ${targets.carbs_g}g C, ${targets.fat_g}g F`);
    console.log(`  Math sum: ${calculatedKcal}`);
    console.log(`  Difference: ${statedKcal - calculatedKcal}`);
    console.log('---');
});
