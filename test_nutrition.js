
import { calculateTargets, GOALS } from './src/logic/nutrition.js';
import { PHASES } from './src/logic/cycle.js';

const testUsers = [
    {
        weight: 70, height: 170, age: 30, gender: 'female',
        trainingFrequency: 3, goal: GOALS.MAINTAIN, resultTempo: 'average',
        cycleStats: { learnedCycleLength: 28 }, bleedingLengthDays: 5
    },
    {
        weight: 60, height: 165, age: 25, gender: 'female',
        trainingFrequency: 5, goal: GOALS.LOSS, resultTempo: 'average',
        cycleStats: { learnedCycleLength: 28 }, bleedingLengthDays: 5
    },
    {
        weight: 80, height: 175, age: 35, gender: 'female',
        trainingFrequency: 0, goal: GOALS.GAIN, resultTempo: 'average',
        cycleStats: { learnedCycleLength: 28 }, bleedingLengthDays: 5
    }
];

testUsers.forEach((user, index) => {
    console.log(`\n--- User ${index + 1} ---`);
    console.log('Input:', JSON.stringify(user, null, 2));
    const result = calculateTargets(user, PHASES.FOLLICULAR);
    console.log('Result:', result);
});
