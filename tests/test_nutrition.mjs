import { calculateTargetRanges, GOAL_TYPES, LIFESTYLE_LEVELS, STEPS_RANGES } from '../src/logic/nutrition.js'

let passed = 0
let failed = 0

function assert(condition, message) {
    if (condition) {
        passed++
        console.log(`  ✓ ${message}`)
    } else {
        failed++
        console.error(`  ✗ ${message}`)
    }
}

console.log('\n🧪 Nutrition Logic Tests\n')

// Test 1: Basic BMR calculation (Mifflin-St Jeor for Women)
console.log('Test 1: BMR Calculation')
const profile1 = {
    weight_kg: 65,
    height_cm: 170,
    age: 30,
    lifestyle_level: LIFESTYLE_LEVELS.SEDENTARY,
    steps_range: STEPS_RANGES.LT4K,
    training_days_per_week: 0,
    goal: GOAL_TYPES.MAINTAIN,
    resultTempo: 'average'
}
const result1 = calculateTargetRanges(profile1)
// BMR = (10 * 65) + (6.25 * 170) - (5 * 30) - 161 = 650 + 1062.5 - 150 - 161 = 1401.5
// TDEE (sedentary, multiplier 1.2) = 1401.5 * 1.2 = 1681.8
assert(result1 !== null, 'Result should not be null')
assert(result1.tdee_estimate > 1600 && result1.tdee_estimate < 1800, `TDEE should be around 1682, got ${result1.tdee_estimate}`)
assert(result1.calorie_target > 0, 'Calorie target should be positive')
assert(result1.protein_g > 0, 'Protein should be positive')
assert(result1.fat_g > 0, 'Fat should be positive')
assert(result1.carbs_g >= 0, 'Carbs should be non-negative')

// Test 2: Different goals
console.log('\nTest 2: Goal Adjustments')
const profileLose = { ...profile1, goal: GOAL_TYPES.LOSE_FAT, resultTempo: 'average' }
const profileGain = { ...profile1, goal: GOAL_TYPES.GAIN, resultTempo: 'average' }
const resultLose = calculateTargetRanges(profileLose)
const resultGain = calculateTargetRanges(profileGain)
assert(resultLose.calorie_target < result1.calorie_target, 'Lose fat should have lower calories than maintain')
assert(resultGain.calorie_target > result1.calorie_target, 'Gain muscle should have higher calories than maintain')

// Test 3: Activity levels
console.log('\nTest 3: Activity Levels')
const profileActive = { ...profile1, lifestyle_level: LIFESTYLE_LEVELS.VERY_ACTIVE, steps_range: STEPS_RANGES.GT12K, training_days_per_week: 6 }
const resultActive = calculateTargetRanges(profileActive)
assert(resultActive.tdee_estimate > result1.tdee_estimate, 'Very active should have higher TDEE than sedentary')

// Test 4: Protein calculation
console.log('\nTest 4: Protein Calculation')
// For lose_fat goal, protein should be 2.0g per kg
const profileProtein = { ...profile1, weight_kg: 70, goal: GOAL_TYPES.LOSE_FAT }
const resultProtein = calculateTargetRanges(profileProtein)
assert(resultProtein.protein_g === 140, `Protein for 70kg lose_fat should be 140g, got ${resultProtein.protein_g}`)

// Test 5: Missing required fields
console.log('\nTest 5: Missing Fields')
const profileIncomplete = { weight_kg: 65, height_cm: 170 } // missing age
const resultIncomplete = calculateTargetRanges(profileIncomplete)
assert(resultIncomplete === null, 'Should return null for incomplete profile')

// Test 6: Calorie math consistency
console.log('\nTest 6: Calorie Math Consistency')
const profile6 = {
    weight_kg: 60,
    height_cm: 165,
    age: 25,
    lifestyle_level: LIFESTYLE_LEVELS.MODERATELY_ACTIVE,
    steps_range: STEPS_RANGES.K8_12K,
    training_days_per_week: 4,
    goal: GOAL_TYPES.RECOMP,
    resultTempo: 'slow'
}
const result6 = calculateTargetRanges(profile6)
const proteinCals = result6.protein_g * 4
const fatCals = result6.fat_g * 9
const carbCals = result6.carbs_g * 4
const totalCals = proteinCals + fatCals + carbCals
assert(Math.abs(totalCals - result6.calorie_target) < 10, `Macro calories (${totalCals}) should match target (${result6.calorie_target})`)

console.log(`\n✅ Results: ${passed} passed, ${failed} failed\n`)

if (failed > 0) {
    process.exit(1)
}
