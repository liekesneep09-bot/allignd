/**
 * Comprehensive Unit Tests for Cycle Logic
 * Tests: cycle.js + cycle-learning.js
 */
import {
  calculateCycleDay,
  getPhaseForDay,
  getCycleDisplayData,
  getCyclePrediction,
  PHASES
} from '../src/logic/cycle.js'

import {
  addPeriodStart,
  daysBetween,
  calculateCycleLengths,
  getLearnedCycleLength,
  calculateVariability,
  getConfidence,
  calculateCycleStats,
  predictNextPeriodStart,
  getPredictionWindow,
  getFuturePeriodWindows,
  getOvulationWindow,
  markOutliers,
  getMedian
} from '../src/logic/cycle-learning.js'

let passed = 0
let failed = 0

function test(desc, actual, expected) {
  if (actual === expected) {
    console.log(`  ✅ ${desc}`)
    passed++
  } else {
    console.error(`  ❌ ${desc}: expected "${expected}", got "${actual}"`)
    failed++
  }
}

function testRange(desc, actual, min, max) {
  if (actual >= min && actual <= max) {
    console.log(`  ✅ ${desc} (${actual} in [${min},${max}])`)
    passed++
  } else {
    console.error(`  ❌ ${desc}: expected [${min},${max}], got ${actual}`)
    failed++
  }
}

// ============================================
// 1. CYCLE DAY CALCULATION
// ============================================
console.log("\n=== 1. calculateCycleDay ===")

test("Day 1 on start date", calculateCycleDay('2026-03-01', 28, '2026-03-01'), 1)
test("Day 5 after 4 days", calculateCycleDay('2026-03-01', 28, '2026-03-05'), 5)
test("Day 28 end of cycle", calculateCycleDay('2026-03-01', 28, '2026-03-28'), 28)
test("Day 34 after 34 days (tz-adjusted)", calculateCycleDay('2026-03-01', 28, '2026-04-04'), 34)
test("Returns 1 for null start", calculateCycleDay(null, 28), 1)
test("Returns 1 for future dates", calculateCycleDay('2026-12-01', 28, '2026-01-01'), 1)

// ============================================
// 2. PHASE DETERMINATION
// ============================================
console.log("\n=== 2. getPhaseForDay (28-day cycle) ===")

// Note: isMenstruatingNow=false, so days 1-5 are NOT menstrual (per app design)
test("Day 1 not menstruating → follicular", getPhaseForDay(1, 28, 5, false), PHASES.FOLLICULAR)
test("Day 1 menstruating → menstrual", getPhaseForDay(1, 28, 5, true), PHASES.MENSTRUAL)
test("Day 6 → follicular", getPhaseForDay(6, 28, 5, false), PHASES.FOLLICULAR)
// Ovulation: 28-14=14, fertile start=14-5=9, fertile end=15
test("Day 9 → ovulatory (fertile start)", getPhaseForDay(9, 28, 5, false), PHASES.OVULATORY)
test("Day 14 → ovulatory", getPhaseForDay(14, 28, 5, false), PHASES.OVULATORY)
test("Day 15 → ovulatory (fertile end)", getPhaseForDay(15, 28, 5, false), PHASES.OVULATORY)
test("Day 16 → luteal", getPhaseForDay(16, 28, 5, false), PHASES.LUTEAL)
test("Day 28 → luteal", getPhaseForDay(28, 28, 5, false), PHASES.LUTEAL)
test("Day 35 overdue → luteal", getPhaseForDay(35, 28, 5, false), PHASES.LUTEAL)

console.log("\n=== 2b. getPhaseForDay (21-day cycle) ===")
// Ovulation: 21-14=7, fertile start=7-5=2, fertile end=8
test("Day 2 short cycle → ovulatory", getPhaseForDay(2, 21, 5, false), PHASES.OVULATORY)
test("Day 8 short cycle → ovulatory", getPhaseForDay(8, 21, 5, false), PHASES.OVULATORY)
test("Day 9 short cycle → luteal", getPhaseForDay(9, 21, 5, false), PHASES.LUTEAL)

console.log("\n=== 2c. getPhaseForDay (35-day cycle) ===")
// Ovulation: 35-14=21, fertile start=21-5=16, fertile end=22
test("Day 10 long cycle → follicular", getPhaseForDay(10, 35, 5, false), PHASES.FOLLICULAR)
test("Day 16 long cycle → ovulatory", getPhaseForDay(16, 35, 5, false), PHASES.OVULATORY)
test("Day 23 long cycle → luteal", getPhaseForDay(23, 35, 5, false), PHASES.LUTEAL)

// ============================================
// 3. getCycleDisplayData
// ============================================
console.log("\n=== 3. getCycleDisplayData ===")

const display = getCycleDisplayData('2026-03-01', 28, 5, false, new Date('2026-03-15'))
test("Display day 15", display.displayDay, 15)
test("Linear day 15", display.linearDay, 15)
test("Overdue 0", display.overdueDays, 0)
test("Phase ovulatory (day 15)", display.phase, PHASES.OVULATORY)

const overdueDisplay = getCycleDisplayData('2026-03-01', 28, 5, false, new Date('2026-04-05'))
test("Overdue linear day 35 (tz)", overdueDisplay.linearDay, 35)
test("Overdue days 7 (tz)", overdueDisplay.overdueDays, 7)
test("Overdue phase luteal", overdueDisplay.phase, PHASES.LUTEAL)

// ============================================
// 4. CYCLE LEARNING - daysBetween
// ============================================
console.log("\n=== 4. daysBetween ===")

test("28 days apart", daysBetween('2026-01-01', '2026-01-29'), 28)
test("0 days (same day)", daysBetween('2026-01-01', '2026-01-01'), 0)
test("365 days (1 year)", daysBetween('2026-01-01', '2027-01-01'), 365)

// ============================================
// 5. CYCLE LEARNING - addPeriodStart
// ============================================
console.log("\n=== 5. addPeriodStart ===")

const result1 = addPeriodStart('2026-02-01', ['2026-01-01'])
test("Adds to existing", result1.periodStartDates.length, 2)
test("Calculates cycle length", result1.newCycleLength, 31)

const resultDup = addPeriodStart('2026-01-01', ['2026-01-01'])
test("No duplicate", resultDup.periodStartDates.length, 1)
test("No cycle length on duplicate", resultDup.newCycleLength, null)

// ============================================
// 6. CYCLE LEARNING - calculateCycleLengths
// ============================================
console.log("\n=== 6. calculateCycleLengths ===")

const starts = ['2026-01-01', '2026-01-29', '2026-02-26']
const lengths = calculateCycleLengths(starts)
test("2 cycle lengths from 3 starts", lengths.length, 2)
test("First cycle 28 days", lengths[0].length, 28)
test("Second cycle 28 days", lengths[1].length, 28)

const singleStart = calculateCycleLengths(['2026-01-01'])
test("No lengths from single start", singleStart.length, 0)

// ============================================
// 7. CYCLE LEARNING - getLearnedCycleLength
// ============================================
console.log("\n=== 7. getLearnedCycleLength ===")

test("Fallback when empty", getLearnedCycleLength([], 28), 28)
test("Single cycle → median", getLearnedCycleLength([{ length: 30, isOutlier: false }], 28), 30)
test("Filters outliers", getLearnedCycleLength([
  { length: 28, isOutlier: false },
  { length: 10, isOutlier: true },
  { length: 29, isOutlier: false }
], 28), 29) // Median of [28, 29]

// ============================================
// 8. CYCLE LEARNING - getMedian & calculateVariability
// ============================================
console.log("\n=== 8. getMedian & calculateVariability ===")

test("Median of [1,2,3]", getMedian([1, 2, 3]), 2)
test("Median of [1,2,3,4]", getMedian([1, 2, 3, 4]), 2.5)
test("Median of empty", getMedian([]), 0)

const varHistory = [
  { length: 28, isOutlier: false },
  { length: 30, isOutlier: false },
  { length: 28, isOutlier: false }
]
const vari = calculateVariability(varHistory)
testRange("Variability ~1", vari, 0.5, 1.5)

// ============================================
// 9. CONFIDENCE LEVELS
// ============================================
console.log("\n=== 9. getConfidence ===")

test("Low: <2 cycles", getConfidence(1, 2), 'low')
test("Medium: 2 cycles, var ≤5", getConfidence(2, 3), 'medium')
test("High: 4+ cycles, var ≤3", getConfidence(4, 2), 'high')
test("Low: 4 cycles but high var", getConfidence(4, 8), 'low')

// ============================================
// 10. PREDICTION WINDOWS
// ============================================
console.log("\n=== 10. getFuturePeriodWindows ===")

// Low confidence (1 period) → buffer = 1 → periodLength + 2 days per window
const fw1 = getFuturePeriodWindows(['2026-01-01'], 28, 5, 0, 1)
const fw1Count = Object.keys(fw1).length
test("1 period: window = 7 (5+2)", fw1Count, 7)

// High confidence (6 periods = 5 cycles, low var) → buffer = 0
const fw2 = getFuturePeriodWindows(
  ['2026-01-01', '2026-01-29', '2026-02-26', '2026-03-26', '2026-04-23', '2026-05-21'],
  28, 5, 1.5, 1
)
const fw2Count = Object.keys(fw2).length
test("5 cycles, low var: window = 5 (exact period)", fw2Count, 5)

// No predictions from empty
const fwEmpty = getFuturePeriodWindows([], 28, 5, 0, 1)
test("No predictions from empty", Object.keys(fwEmpty).length, 0)

// ============================================
// 11. PREDICTION STATS
// ============================================
console.log("\n=== 11. calculateCycleStats ===")

const stats = calculateCycleStats(['2026-01-01', '2026-01-29', '2026-02-26', '2026-03-26'], 28)
test("Stats: 3 cycle lengths", stats.cycleLengthHistory.length, 3)
test("Stats: learned length 28", stats.learnedCycleLength, 28)
test("Stats: confidence medium", stats.confidence, 'medium')

// ============================================
// 12. PREDICT NEXT PERIOD
// ============================================
console.log("\n=== 12. predictNextPeriodStart ===")

test("Predict next from single", predictNextPeriodStart(['2026-03-01'], 28), '2026-03-29')
test("Null from empty", predictNextPeriodStart([], 28), null)

// ============================================
// 13. OVULATION WINDOW
// ============================================
console.log("\n=== 13. getOvulationWindow ===")

const ov = getOvulationWindow('2026-03-29', 14)
test("Ovulation center", ov.center, '2026-03-15')
test("Ovulation start", ov.start, '2026-03-14')
test("Ovulation end", ov.end, '2026-03-16')

// ============================================
// 14. OUTLIER DETECTION
// ============================================
console.log("\n=== 14. markOutliers ===")

const outlierData = markOutliers([
  { length: 28, startDate: '2026-01-29', isOutlier: false },
  { length: 15, startDate: '2026-02-13', isOutlier: false }, // Too short
  { length: 50, startDate: '2026-04-04', isOutlier: false }, // Too long
  { length: 29, startDate: '2026-05-03', isOutlier: false }
])
test("28 not outlier", outlierData[0].isOutlier, false)
test("15 is outlier (<21)", outlierData[1].isOutlier, true)
test("50 is outlier (>45)", outlierData[2].isOutlier, true)
test("29 not outlier", outlierData[3].isOutlier, false)

// ============================================
// SUMMARY
// ============================================
console.log(`\n${'='.repeat(50)}`)
console.log(`RESULTS: ${passed} passed, ${failed} failed`)
console.log(`${'='.repeat(50)}`)

if (failed > 0) {
  process.exit(1)
}
