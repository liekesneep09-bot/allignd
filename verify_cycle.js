import { getPhaseForDay, calculateStartDateFromPhase, PHASES } from './src/logic/cycle.js'

function test(description, result, expected) {
    if (result === expected) {
        console.log(`✅ ${description}: Passed (${result})`)
    } else {
        console.error(`❌ ${description}: Failed. Expected ${expected}, got ${result}`)
    }
}

console.log("=== Verifying Cycle Logic ===")

// Test 1: Standard 28 day cycle, 5 day period
console.log("\nStandard 28 Day Cycle:")
test("Day 1 (Period)", getPhaseForDay(1, 28, 5), PHASES.MENSTRUAL)
test("Day 5 (Period)", getPhaseForDay(5, 28, 5), PHASES.MENSTRUAL)
test("Day 6 (Follicular)", getPhaseForDay(6, 28, 5), PHASES.FOLLICULAR)
test("Day 10 (Follicular/FertileStart=9)", getPhaseForDay(10, 28, 5), PHASES.OVULATORY)
// Wait, 28-14-5 = 9. So Day 9 is fertile start.
test("Day 9 (First Fertile)", getPhaseForDay(9, 28, 5), PHASES.OVULATORY)
test("Day 14 (Ovulation)", getPhaseForDay(14, 28, 5), PHASES.OVULATORY)
test("Day 15 (Post Ov)", getPhaseForDay(15, 28, 5), PHASES.OVULATORY)
test("Day 16 (Luteal)", getPhaseForDay(16, 28, 5), PHASES.LUTEAL)
test("Day 28 (Luteal)", getPhaseForDay(28, 28, 5), PHASES.LUTEAL)

// Test 2: Short 21 day cycle, 5 day period
console.log("\nShort 21 Day Cycle:")
test("Day 5 (Period > Ovulatory)", getPhaseForDay(5, 21, 5), PHASES.MENSTRUAL)
test("Day 6 (Ovulatory)", getPhaseForDay(6, 21, 5), PHASES.OVULATORY)
test("Day 8 (Last Fertile)", getPhaseForDay(8, 21, 5), PHASES.OVULATORY)
test("Day 9 (Luteal)", getPhaseForDay(9, 21, 5), PHASES.LUTEAL)

// Test 3: Long 35 day cycle
console.log("\nLong 35 Day Cycle:")
// Ovulation = 35-14 = 21. Fertile = 16-22.
test("Day 15 (Follicular)", getPhaseForDay(15, 35, 5), PHASES.FOLLICULAR)
test("Day 16 (Ovulatory)", getPhaseForDay(16, 35, 5), PHASES.OVULATORY)
test("Day 22 (Ovulatory)", getPhaseForDay(22, 35, 5), PHASES.OVULATORY)
test("Day 23 (Luteal)", getPhaseForDay(23, 35, 5), PHASES.LUTEAL)

// Test 4: Reverse Calculation
console.log("\nReverse Calculation (Today is Phase X):")
// Assume today is Day 100 (irrelevant absolute date).
// If "I am Menstruating" -> Day 1. StartDate = Today.
const today = new Date()
today.setHours(0, 0, 0, 0)
const startForMenstrual = calculateStartDateFromPhase(PHASES.MENSTRUAL, 28, 5)
const diffM = Math.round((today - startForMenstrual) / (1000 * 60 * 60 * 24))
test("Reverse Menstrual (Day 0 difference)", diffM, 0)

// If "I am Ovulating" (28 day cycle) -> Day 14. StartDate = Today - 13 days.
const startForOv = calculateStartDateFromPhase(PHASES.OVULATORY, 28, 5)
const diffO = Math.round((today - startForOv) / (1000 * 60 * 60 * 24))
test("Reverse Ovulatory (Day 13 difference)", diffO, 13)

console.log("\nDone.")
