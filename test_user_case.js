
import { calculateTargets, GOALS } from './src/logic/nutrition.js';
import { PHASES } from './src/logic/cycle.js';

const userCase = {
    weight: 61,
    height: 165,
    age: 30, // Assumed
    gender: 'female',
    trainingFrequency: 3,
    goal: GOALS.RECOMP, // "Afvallen maar ook spier groeien"
    resultTempo: 'average', // "gemiddeld snel"
    trainingType: 'strength', // "krachttraining"
    experienceLevel: 'intermediate', // Assumed
    cycleStats: { learnedCycleLength: 28 },
    bleedingLengthDays: 5
};

console.log('--- User Report Case ---');
console.log('Input:', JSON.stringify(userCase, null, 2));
const result = calculateTargets(userCase, PHASES.FOLLICULAR);
console.log('Result:', result);
console.log('Protein Factor:', result.p / userCase.weight);
console.log('TDEE Estimate (~):', result.calories / (1 - 0.075)); // Reverse engineer deficit
