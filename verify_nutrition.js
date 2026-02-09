import { calculateTargets, GOALS, ACTIVITY_LEVELS } from './src/logic/nutrition.js';
import { PHASES } from './src/logic/cycle.js';

const testCases = [
    {
        name: "Standard Maintenance (Follicular)",
        user: { weight: 70, height: 170, age: 30, goal: GOALS.MAINTAIN, activity: ACTIVITY_LEVELS.MODERATE },
        phase: PHASES.FOLLICULAR,
        expectedP: 70 * 1.7,
        expectedF: 70 * 0.85
    },
    {
        name: "Loss + Luteal",
        user: { weight: 70, height: 170, age: 30, goal: GOALS.LOSS, activity: ACTIVITY_LEVELS.MODERATE },
        phase: PHASES.LUTEAL,
        expectedP: 70 * 1.9,
        expectedF: 70 * 1.0
    },
    {
        name: "Recomp + Menstrual",
        user: { weight: 65, height: 165, age: 25, goal: GOALS.RECOMP, activity: ACTIVITY_LEVELS.ACTIVE },
        phase: PHASES.MENSTRUAL,
        expectedP: 65 * 2.1,
        expectedF: 65 * 0.9
    },
    {
        name: "Gain + Ovulatory",
        user: { weight: 60, height: 160, age: 25, goal: GOALS.GAIN, activity: ACTIVITY_LEVELS.LIGHT },
        phase: PHASES.OVULATORY,
        expectedP: 60 * 2.1,
        expectedF: 60 * 0.85
    }
];

console.log("Running Nutrition Logic Verification...\n");

testCases.forEach(test => {
    const result = calculateTargets(test.user, test.phase);
    console.log(`Test: ${test.name}`);
    console.log(`  Weight: ${test.user.weight}kg, Goal: ${test.user.goal}, Phase: ${test.phase}`);
    console.log(`  Expected P: ${Math.round(test.expectedP)}g, Got: ${result.p}g`);
    console.log(`  Expected F: ${Math.round(test.expectedF)}g, Got: ${result.f}g`);
    console.log(`  Calories: ${result.calories}`);
    console.log(`  Macros: P${result.p} C${result.c} F${result.f}`);

    const pDiff = Math.abs(result.p - Math.round(test.expectedP));
    const fDiff = Math.abs(result.f - Math.round(test.expectedF));

    if (pDiff <= 1 && fDiff <= 1) {
        console.log("  ✅ PASS");
    } else {
        console.log("  ❌ FAIL");
    }
    console.log("------------------------------------------------");
});
