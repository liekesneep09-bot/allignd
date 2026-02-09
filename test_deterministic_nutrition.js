
import { calculateTargets, GOAL_TYPES, PACES } from './src/logic/nutrition.js';

const testCases = [
    {
        name: "User Specific Case (Recomp/Average/3x)",
        profile: {
            weight_kg: 61,
            height_cm: 165,
            age: 28, // Assumed
            strength_sessions_per_week: 3,
            goal_type: GOAL_TYPES.RECOMP,
            pace: PACES.AVERAGE
        },
        expected: {
            minProtein: 61 * 2.0, // 122
            maxCalories: 2000 // Should be well below this
        }
    },
    {
        name: "User Specific Case (Fast Pace)",
        profile: {
            weight_kg: 61,
            height_cm: 165,
            age: 28,
            strength_sessions_per_week: 3,
            goal_type: GOAL_TYPES.RECOMP,
            pace: PACES.FAST
        },
        expected: {
            minProtein: 61 * 2.2 // 134.2
        }
    },
    {
        name: "Low Weight / Carb Clamp Trigger",
        profile: {
            weight_kg: 45,
            height_cm: 155,
            age: 25,
            strength_sessions_per_week: 0,
            goal_type: GOAL_TYPES.LOSE_FAT,
            pace: PACES.FAST
        }
    }
];

console.log("=== DETERMINISTIC NUTRITION TEST ===\n");

testCases.forEach(test => {
    console.log(`--- ${test.name} ---`);
    const result = calculateTargets(test.profile);
    console.log("Input:", JSON.stringify(test.profile));
    console.log("Result:", result);

    if (test.expected) {
        if (test.expected.minProtein && result.protein_g < test.expected.minProtein) {
            console.error(`FAIL: Protein ${result.protein_g} < Expect ${test.expected.minProtein}`);
        }
        if (test.expected.maxCalories && result.cal_target > test.expected.maxCalories) {
            console.error(`FAIL: Calories ${result.cal_target} > Expect ${test.expected.maxCalories}`);
        }
    }
    console.log("\n");
});
