/**
 * SANITY TEST FOR DETERMINISTIC NUTRITION LOGIC
 * 
 * Test Case from Spec:
 * height_cm=165, weight_kg=61, age=28
 * goal_type='recomp', strength_sessions_per_week=3, pace='average'
 * 
 * Expected Results:
 * - BMR: ~1340
 * - Activity Factor: 1.50
 * - TDEE: ~2010
 * - Calories: ~1710 (15% deficit)
 * - Protein: >= 122g (2.0 * 61)
 * - Carbs: >= 80g
 * - Fat: >= 48.8g (0.8 * 61)
 */

import { calculateTargets, GOAL_TYPES, PACES } from './src/logic/nutrition.js';

console.log('🧪 SANITY TEST: Deterministic Nutrition Logic\n');

const testProfile = {
    weight_kg: 61,
    height_cm: 165,
    age: 28,
    goal_type: GOAL_TYPES.RECOMP,
    strength_sessions_per_week: 3,
    pace: PACES.AVERAGE
};

console.log('📋 Test Profile:');
console.log(JSON.stringify(testProfile, null, 2));
console.log('');

const result = calculateTargets(testProfile);

console.log('📊 Calculated Results:');
console.log(JSON.stringify(result, null, 2));
console.log('');

// Assertions
console.log('✅ Assertions:');

const assertions = [
    {
        name: 'BMR is approximately 1340',
        actual: result.bmr,
        expected: 1340,
        tolerance: 5,
        pass: Math.abs(result.bmr - 1340) <= 5
    },
    {
        name: 'Activity Factor is 1.50',
        actual: result.activity_factor,
        expected: 1.50,
        tolerance: 0.01,
        pass: Math.abs(result.activity_factor - 1.50) < 0.01
    },
    {
        name: 'TDEE is approximately 2010',
        actual: result.tdee,
        expected: 2010,
        tolerance: 10,
        pass: Math.abs(result.tdee - 2010) <= 10
    },
    {
        name: 'Calories are approximately 1710 (15% deficit)',
        actual: result.cal_target,
        expected: 1710,
        tolerance: 50,
        pass: Math.abs(result.cal_target - 1710) <= 50
    },
    {
        name: 'Protein >= 122g (2.0 * 61kg)',
        actual: result.protein_g,
        expected: 122,
        tolerance: 0,
        pass: result.protein_g >= 122
    },
    {
        name: 'Carbs >= 80g',
        actual: result.carbs_g,
        expected: 80,
        tolerance: 0,
        pass: result.carbs_g >= 80
    },
    {
        name: 'Fat >= 48.8g (0.8 * 61kg)',
        actual: result.fat_g,
        expected: 48.8,
        tolerance: 0,
        pass: result.fat_g >= 48.8
    },
    {
        name: 'Calories < TDEE (deficit goal)',
        actual: result.cal_target,
        expected: result.tdee,
        tolerance: 0,
        pass: result.cal_target < result.tdee
    },
    {
        name: 'Macros sum to calories (within 50 kcal)',
        actual: (result.protein_g * 4) + (result.carbs_g * 4) + (result.fat_g * 9),
        expected: result.cal_target,
        tolerance: 50,
        pass: Math.abs(((result.protein_g * 4) + (result.carbs_g * 4) + (result.fat_g * 9)) - result.cal_target) <= 50
    }
];

let allPassed = true;

assertions.forEach((assertion, index) => {
    const status = assertion.pass ? '✅' : '❌';
    console.log(`${status} ${index + 1}. ${assertion.name}`);
    console.log(`   Expected: ${assertion.expected}, Actual: ${assertion.actual}`);

    if (!assertion.pass) {
        allPassed = false;
        console.log(`   ⚠️  FAILED!`);
    }
    console.log('');
});

console.log('═══════════════════════════════════════════════════');
if (allPassed) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('The deterministic nutrition logic is working correctly.');
} else {
    console.log('❌ SOME TESTS FAILED!');
    console.log('Please review the formula in src/logic/nutrition.js');
    process.exit(1);
}
console.log('═══════════════════════════════════════════════════');
