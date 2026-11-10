import assert from 'node:assert/strict'
import { calculateTargetRanges, GOAL_TYPES, LIFESTYLE_LEVELS, STEPS_RANGES } from '../src/logic/nutrition.js'

// Expected values below are independent, fixed Decimal calculations (half-up
// rounding), not outputs captured from calculateTargetRanges. Tuple order:
// TDEE, exact macro kcal, protein, fat, carbs, max kcal, max protein, max fat,
// max carbs. Minimum kcal/macros always equal the corresponding base value.
const BASE_PROFILE = {
    weight_kg: 65,
    height_cm: 170,
    age: 30,
    lifestyle_level: LIFESTYLE_LEVELS.SEDENTARY,
    steps_range: STEPS_RANGES.LT4K,
    training_days_per_week: 0,
    goal: GOAL_TYPES.MAINTAIN,
    resultTempo: 'average'
}

// BMR = 10(65) + 6.25(170) - 5(30) - 161 = 1401.5 kcal.
// Full 4 lifestyles x 4 step ranges x 8 training-day boundaries = 128 cases.
const ACTIVITY_EXPECTED = {
    sedentary: {
        lt4k: [
            [1682, 1683, 117, 59, 171, 1767, 129, 65, 188], // 0 days: score 0, PAL 1.2
            [1682, 1683, 117, 59, 171, 1767, 129, 65, 188], // 1 day: score 1, PAL 1.2
            [1682, 1683, 117, 59, 171, 1767, 129, 65, 188], // 2 days: score 1, PAL 1.2
            [1927, 1927, 117, 59, 232, 2023, 129, 65, 255], // 3 days: score 2, PAL 1.375
            [1927, 1927, 117, 59, 232, 2023, 129, 65, 255],
            [1927, 1927, 117, 59, 232, 2023, 129, 65, 255],
            [1927, 1927, 117, 59, 232, 2023, 129, 65, 255],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322], // 7 days: score 4, PAL 1.55
        ],
        '4k_8k': [
            [1682, 1683, 117, 59, 171, 1767, 129, 65, 188],
            [1927, 1927, 117, 59, 232, 2023, 129, 65, 255],
            [1927, 1927, 117, 59, 232, 2023, 129, 65, 255],
            [1927, 1927, 117, 59, 232, 2023, 129, 65, 255],
            [1927, 1927, 117, 59, 232, 2023, 129, 65, 255],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
        ],
        '8k_12k': [
            [1927, 1927, 117, 59, 232, 2023, 129, 65, 255],
            [1927, 1927, 117, 59, 232, 2023, 129, 65, 255],
            [1927, 1927, 117, 59, 232, 2023, 129, 65, 255],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
        ],
        gt12k: [
            [1927, 1927, 117, 59, 232, 2023, 129, 65, 255],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2418, 2419, 117, 59, 355, 2540, 129, 65, 391],
        ],
    },
    lightly_active: {
        lt4k: [
            [1682, 1683, 117, 59, 171, 1767, 129, 65, 188],
            [1927, 1927, 117, 59, 232, 2023, 129, 65, 255],
            [1927, 1927, 117, 59, 232, 2023, 129, 65, 255],
            [1927, 1927, 117, 59, 232, 2023, 129, 65, 255],
            [1927, 1927, 117, 59, 232, 2023, 129, 65, 255],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
        ],
        '4k_8k': [
            [1927, 1927, 117, 59, 232, 2023, 129, 65, 255],
            [1927, 1927, 117, 59, 232, 2023, 129, 65, 255],
            [1927, 1927, 117, 59, 232, 2023, 129, 65, 255],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
        ],
        '8k_12k': [
            [1927, 1927, 117, 59, 232, 2023, 129, 65, 255],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2418, 2419, 117, 59, 355, 2540, 129, 65, 391],
        ],
        gt12k: [
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2418, 2419, 117, 59, 355, 2540, 129, 65, 391],
            [2418, 2419, 117, 59, 355, 2540, 129, 65, 391],
            [2418, 2419, 117, 59, 355, 2540, 129, 65, 391],
        ],
    },
    moderately_active: {
        lt4k: [
            [1927, 1927, 117, 59, 232, 2023, 129, 65, 255],
            [1927, 1927, 117, 59, 232, 2023, 129, 65, 255],
            [1927, 1927, 117, 59, 232, 2023, 129, 65, 255],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
        ],
        '4k_8k': [
            [1927, 1927, 117, 59, 232, 2023, 129, 65, 255],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2418, 2419, 117, 59, 355, 2540, 129, 65, 391],
        ],
        '8k_12k': [
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2418, 2419, 117, 59, 355, 2540, 129, 65, 391],
            [2418, 2419, 117, 59, 355, 2540, 129, 65, 391],
            [2418, 2419, 117, 59, 355, 2540, 129, 65, 391],
        ],
        gt12k: [
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2418, 2419, 117, 59, 355, 2540, 129, 65, 391],
            [2418, 2419, 117, 59, 355, 2540, 129, 65, 391],
            [2418, 2419, 117, 59, 355, 2540, 129, 65, 391],
            [2418, 2419, 117, 59, 355, 2540, 129, 65, 391],
            [2418, 2419, 117, 59, 355, 2540, 129, 65, 391],
        ],
    },
    very_active: {
        lt4k: [
            [1927, 1927, 117, 59, 232, 2023, 129, 65, 255],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2418, 2419, 117, 59, 355, 2540, 129, 65, 391],
        ],
        '4k_8k': [
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2418, 2419, 117, 59, 355, 2540, 129, 65, 391],
            [2418, 2419, 117, 59, 355, 2540, 129, 65, 391],
            [2418, 2419, 117, 59, 355, 2540, 129, 65, 391],
        ],
        '8k_12k': [
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2418, 2419, 117, 59, 355, 2540, 129, 65, 391],
            [2418, 2419, 117, 59, 355, 2540, 129, 65, 391],
            [2418, 2419, 117, 59, 355, 2540, 129, 65, 391],
            [2418, 2419, 117, 59, 355, 2540, 129, 65, 391],
            [2418, 2419, 117, 59, 355, 2540, 129, 65, 391],
        ],
        gt12k: [
            [2172, 2171, 117, 59, 293, 2280, 129, 65, 322],
            [2418, 2419, 117, 59, 355, 2540, 129, 65, 391],
            [2418, 2419, 117, 59, 355, 2540, 129, 65, 391],
            [2418, 2419, 117, 59, 355, 2540, 129, 65, 391],
            [2418, 2419, 117, 59, 355, 2540, 129, 65, 391],
            [2418, 2419, 117, 59, 355, 2540, 129, 65, 391],
            [2418, 2419, 117, 59, 355, 2540, 129, 65, 391],
            [2663, 2663, 117, 59, 416, 2796, 129, 65, 458], // score 10, PAL 1.9
        ],
    },
}

// All 12 goal/tempo pairs at the baseline activity level.
// Example lose_fat/average: round(1682 x .80) = 1346 raw kcal;
// 130p + 59f leaves 295 kcal, round(295 / 4) = 74g carbs, so exact kcal = 1347.
const GOAL_TEMPO_EXPECTED = {
    lose_fat: {
        slow: [1682, 1431, 130, 59, 95, 1503, 143, 65, 105],
        average: [1682, 1347, 130, 59, 74, 1414, 143, 65, 81],
        fast: [1682, 1263, 130, 59, 53, 1326, 143, 65, 58],
    },
    recomp: {
        slow: [1682, 1599, 130, 59, 137, 1679, 143, 65, 151],
        average: [1682, 1515, 130, 59, 116, 1591, 143, 65, 128],
        fast: [1682, 1431, 130, 59, 95, 1503, 143, 65, 105],
    },
    maintain: {
        slow: [1682, 1683, 117, 59, 171, 1767, 129, 65, 188],
        average: [1682, 1683, 117, 59, 171, 1767, 129, 65, 188],
        fast: [1682, 1683, 117, 59, 171, 1767, 129, 65, 188],
    },
    gain_muscle: {
        slow: [1682, 1767, 117, 59, 192, 1855, 129, 65, 211],
        average: [1682, 1851, 117, 59, 213, 1944, 129, 65, 234],
        fast: [1682, 1935, 117, 59, 234, 2032, 129, 65, 257],
    },
}

const BODY_CASES = [
    // BMR 1114; activity score 3 -> PAL 1.375 -> TDEE 1532.
    ['50 kg / 160 cm / age 45; recomp average', {
        weight_kg: 50, height_cm: 160, age: 45,
        lifestyle_level: 'lightly_active', steps_range: '4k_8k', training_days_per_week: 2,
        goal: 'recomp', resultTempo: 'average'
    }, [1532, 1381, 100, 45, 144, 1450, 110, 50, 158]],
    // BMR 1516.5; activity score 6 -> PAL 1.55 -> TDEE 2351.
    ['80 kg / 182 cm / age 52; lose fast', {
        weight_kg: 80, height_cm: 182, age: 52,
        lifestyle_level: 'moderately_active', steps_range: '8k_12k', training_days_per_week: 4,
        goal: 'lose_fat', resultTempo: 'fast'
    }, [2351, 1764, 160, 72, 119, 1852, 176, 79, 131]],
    // Decimal inputs: BMR 1432.125; 72.5 kg gives rounded 131p / 65f.
    ['72.5 kg / 168.5 cm / age 37; gain slow', {
        weight_kg: 72.5, height_cm: 168.5, age: 37,
        lifestyle_level: 'very_active', steps_range: 'lt4k', training_days_per_week: 5,
        goal: 'gain_muscle', resultTempo: 'slow'
    }, [2220, 2333, 131, 65, 306, 2450, 144, 72, 337]],
    // BMR 1258.8125; score 4 -> PAL 1.55; tempo does not change maintenance.
    ['58.2 kg / 157.25 cm / age 29; maintain fast', {
        weight_kg: 58.2, height_cm: 157.25, age: 29,
        lifestyle_level: 'sedentary', steps_range: 'gt12k', training_days_per_week: 1,
        goal: 'maintain', resultTempo: 'fast'
    }, [1951, 1952, 105, 52, 266, 2050, 116, 57, 293]],
    // BMR 1542.75; score 3 -> PAL 1.375; 95 kg gives rounded 190p / 86f.
    ['95 kg / 175 cm / age 68; recomp slow', {
        weight_kg: 95, height_cm: 175, age: 68,
        lifestyle_level: 'lightly_active', steps_range: '8k_12k', training_days_per_week: 0,
        goal: 'recomp', resultTempo: 'slow'
    }, [2121, 2014, 190, 86, 120, 2115, 209, 95, 132]],
    // BMR 664, TDEE 797, raw target 598. Protein+fat alone are 644 kcal,
    // so carbs clamp to 0 and exact macro calories remain 644.
    ['40 kg / 140 cm / age 90; low-calorie zero-carb floor', {
        weight_kg: 40, height_cm: 140, age: 90,
        lifestyle_level: 'sedentary', steps_range: 'lt4k', training_days_per_week: 0,
        goal: 'lose_fat', resultTempo: 'fast'
    }, [797, 644, 80, 36, 0, 676, 88, 40, 0]],
    // BMR 1926.5; maximum activity score 10 -> PAL 1.9 -> TDEE 3660.
    ['100 kg / 190 cm / age 20; maximum activity and gain fast', {
        weight_kg: 100, height_cm: 190, age: 20,
        lifestyle_level: 'very_active', steps_range: 'gt12k', training_days_per_week: 7,
        goal: 'gain_muscle', resultTempo: 'fast'
    }, [3660, 4210, 180, 90, 670, 4421, 198, 99, 737]],
    // BMR 1401.5; activity score 5 -> PAL 1.55.
    ['65 kg / 170 cm / age 30; mid-range activity', {
        weight_kg: 65, height_cm: 170, age: 30,
        lifestyle_level: 'moderately_active', steps_range: '4k_8k', training_days_per_week: 3,
        goal: 'maintain', resultTempo: 'average'
    }, [2172, 2171, 117, 59, 293, 2280, 129, 65, 322]],
]

let passed = 0
let failed = 0
const validResults = []
let validCaseCount = 0

function check(name, callback) {
    try {
        callback()
        passed++
    } catch (error) {
        failed++
        console.error(`  ✗ ${name}\n    ${error.message}`)
    }
}

function group(name, callback) {
    const passedBefore = passed
    const failedBefore = failed
    console.log(`\n${name}`)
    callback()
    console.log(`  ${passed - passedBefore} passed, ${failed - failedBefore} failed`)
}

function expectedObject(tuple) {
    const [tdee, calories, protein, fat, carbs, calorieMax, proteinMax, fatMax, carbMax] = tuple
    return {
        tdee_estimate: tdee,
        calorie_target: calories,
        protein_g: protein,
        fat_g: fat,
        carbs_g: carbs,
        calorie_target_min: calories,
        calorie_target_max: calorieMax,
        protein_g_min: protein,
        protein_g_max: proteinMax,
        fat_g_min: fat,
        fat_g_max: fatMax,
        carbs_g_min: carbs,
        carbs_g_max: carbMax,
    }
}

function expectResult(name, profile, expected) {
    validCaseCount++
    check(name, () => {
        const actual = calculateTargetRanges(profile)
        validResults.push({ name, actual })
        assert.deepStrictEqual(actual, expectedObject(expected))
    })
}

function expectNull(name, profile) {
    check(name, () => {
        assert.strictEqual(calculateTargetRanges(profile), null)
    })
}

console.log('\n🧪 Independent Nutrition Matrix Tests')

group('Activity matrix (all 128 lifestyle / steps / training-day combinations)', () => {
    for (const [lifestyle, stepRanges] of Object.entries(ACTIVITY_EXPECTED)) {
        for (const [steps, trainingCases] of Object.entries(stepRanges)) {
            trainingCases.forEach((expected, days) => {
                expectResult(`${lifestyle} / ${steps} / ${days} training days`, {
                    ...BASE_PROFILE,
                    lifestyle_level: lifestyle,
                    steps_range: steps,
                    training_days_per_week: days,
                }, expected)
            })
        }
    }
})

group('Goal and tempo matrix (all 12 pairs)', () => {
    for (const [goal, tempos] of Object.entries(GOAL_TEMPO_EXPECTED)) {
        for (const [tempo, expected] of Object.entries(tempos)) {
            expectResult(`${goal} / ${tempo}`, { ...BASE_PROFILE, goal, resultTempo: tempo }, expected)
        }
    }
})

group('Independent ages, heights, weights, rounding, and calorie floor', () => {
    for (const [name, profile, expected] of BODY_CASES) {
        expectResult(name, profile, expected)
    }
})

group('Onboarding coercion, defaults, and upper training cap', () => {
    const baseline = ACTIVITY_EXPECTED.sedentary.lt4k[0]
    expectResult('omitted optional fields use sedentary / <4k / 0 days / maintain / average', {
        weight_kg: 65, height_cm: 170, age: 30
    }, baseline)
    expectResult('numeric strings from form-like input are coerced', {
        ...BASE_PROFILE,
        weight_kg: '65', height_cm: '170', age: '30', training_days_per_week: '0'
    }, baseline)
    expectResult('unknown optional enum values use documented safe fallbacks', {
        ...BASE_PROFILE,
        lifestyle_level: 'unknown', steps_range: 'unknown', goal: 'unknown', resultTempo: 'unknown'
    }, baseline)
    expectResult('8 training days is capped to the known 7-day result', {
        ...BASE_PROFILE, training_days_per_week: 8
    }, ACTIVITY_EXPECTED.sedentary.lt4k[7])
})

group('Invalid required profile handling', () => {
    expectNull('undefined profile returns null rather than throwing', undefined)
    expectNull('null profile returns null rather than throwing', null)
    for (const field of ['weight_kg', 'height_cm', 'age']) {
        expectNull(`missing ${field} returns null`, { ...BASE_PROFILE, [field]: undefined })
        expectNull(`zero ${field} returns null`, { ...BASE_PROFILE, [field]: 0 })
        expectNull(`non-numeric ${field} returns null`, { ...BASE_PROFILE, [field]: 'not-a-number' })
        expectNull(`negative ${field} is rejected`, { ...BASE_PROFILE, [field]: -1 })
        expectNull(`infinite ${field} is rejected`, { ...BASE_PROFILE, [field]: Infinity })
    }
})

group('Cross-case invariants', () => {
    check('every valid result has integer fields, exact 4/4/9 kcal, and matching minima', () => {
        assert.strictEqual(validResults.length, validCaseCount)
        for (const { name, actual } of validResults) {
            assert.ok(actual, `${name}: missing result`)
            for (const [field, value] of Object.entries(actual)) {
                assert.ok(Number.isInteger(value), `${name}: ${field} is not an integer (${value})`)
            }
            assert.strictEqual(
                actual.calorie_target,
                actual.protein_g * 4 + actual.fat_g * 9 + actual.carbs_g * 4,
                `${name}: macro calories differ from calorie target`
            )
            assert.strictEqual(actual.calorie_target_min, actual.calorie_target, `${name}: calorie minimum`)
            assert.strictEqual(actual.protein_g_min, actual.protein_g, `${name}: protein minimum`)
            assert.strictEqual(actual.fat_g_min, actual.fat_g, `${name}: fat minimum`)
            assert.strictEqual(actual.carbs_g_min, actual.carbs_g, `${name}: carb minimum`)
        }
    })
})

console.log(`\n${failed === 0 ? '✅' : '❌'} Results: ${passed} passed, ${failed} failed (${passed + failed} tests)\n`)
if (failed > 0) process.exitCode = 1
