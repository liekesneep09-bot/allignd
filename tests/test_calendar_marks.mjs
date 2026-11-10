/**
 * Unit Tests for Shared Calendar Marking Logic (calendar-marks.js)
 */
import {
  getOvulatoryPhaseRange,
  getCalendarCycleInfo,
  getPhaseForDayNumber,
  getNextPeriodMilestone,
  PHASE_COLORS,
  withAlpha
} from '../src/logic/calendar-marks.js'
import { PHASES } from '../src/logic/cycle.js'

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

function testTrue(desc, actual) {
  if (actual) {
    console.log(`  ✅ ${desc}`)
    passed++
  } else {
    console.error(`  ❌ ${desc}: expected truthy, got ${actual}`)
    failed++
  }
}

function testNull(desc, actual) {
  if (actual === null || actual === undefined) {
    console.log(`  ✅ ${desc}`)
    passed++
  } else {
    console.error(`  ❌ ${desc}: expected null, got ${JSON.stringify(actual)}`)
    failed++
  }
}

console.log('\n📅 calendar-marks.js\n')

// ── Estimated phase bounds (not fertility dates) ─────────────────────────────
test('28-day cycle: estimated phase starts on day 12', getOvulatoryPhaseRange(28).start, 12)
test('28-day cycle: estimated phase ends on day 16', getOvulatoryPhaseRange(28).end, 16)
test('24-day cycle: estimated phase starts on day 8', getOvulatoryPhaseRange(24).start, 8)
testTrue('phase range exposes no fertile-day dates', !('fertileStart' in getOvulatoryPhaseRange(28)) && !('fertileEnd' in getOvulatoryPhaseRange(28)))

// ── getPhaseForDayNumber — a few days ovulatory phase (ovulationDay -2..+2) ─
test('day 1 = menstrual', getPhaseForDayNumber(1, 28, 5), PHASES.MENSTRUAL)
test('day 5 = menstrual (last period day)', getPhaseForDayNumber(5, 28, 5), PHASES.MENSTRUAL)
test('day 6 = follicular', getPhaseForDayNumber(6, 28, 5), PHASES.FOLLICULAR)
test('day 11 = follicular (day before ovulatory phase)', getPhaseForDayNumber(11, 28, 5), PHASES.FOLLICULAR)
test('day 12 = ovulatory (phase start)', getPhaseForDayNumber(12, 28, 5), PHASES.OVULATORY)
test('day 14 = ovulatory (phase midpoint)', getPhaseForDayNumber(14, 28, 5), PHASES.OVULATORY)
test('day 16 = ovulatory (phase end)', getPhaseForDayNumber(16, 28, 5), PHASES.OVULATORY)
test('day 17 = luteal (day after ovulatory phase)', getPhaseForDayNumber(17, 28, 5), PHASES.LUTEAL)
test('day 28 = luteal', getPhaseForDayNumber(28, 28, 5), PHASES.LUTEAL)

// ── getCalendarCycleInfo ────────────────────────────────────────────────────
// cycleStart 2026-09-01, 28-day cycle, 5-day period
test('current cycle day: cycleStart itself = day 1', getCalendarCycleInfo('2026-09-01', '2026-09-01', 28, 5).day, 1)
test('current cycle phase day 1', getCalendarCycleInfo('2026-09-01', '2026-09-01', 28, 5).phase, PHASES.MENSTRUAL)
test('day 14 phase', getCalendarCycleInfo('2026-09-14', '2026-09-01', 28, 5).phase, PHASES.OVULATORY)
test('future cycle wraps: day 30 (Oct 1) → day 3 of new cycle', getCalendarCycleInfo('2026-10-01', '2026-09-01', 28, 5).day, 3)
test('future cycle wraps: Sep 30 → day 2 (menstrual)', getCalendarCycleInfo('2026-09-30', '2026-09-01', 28, 5).day, 2)
test('future cycle wraps: next cycle ovulation (Oct 12) → ovulatory', getCalendarCycleInfo('2026-10-12', '2026-09-01', 28, 5).phase, PHASES.OVULATORY)
test('future cycle wraps: day 15 of next cycle → ovulatory (still in phase)', getCalendarCycleInfo('2026-10-13', '2026-09-01', 28, 5).phase, PHASES.OVULATORY)
test('future cycle wraps: day 17 of next cycle → luteal', getCalendarCycleInfo('2026-10-15', '2026-09-01', 28, 5).phase, PHASES.LUTEAL)
testNull('before cycleStart → null (no tinting of past)', getCalendarCycleInfo('2026-08-31', '2026-09-01', 28, 5))
testNull('no cycleStart → null', getCalendarCycleInfo('2026-09-01', null, 28, 5))

// ── getNextPeriodMilestone ──────────────────────────────────────────────────
{
  const m = getNextPeriodMilestone('2026-09-01', 28, '2026-09-20')
  test('next period = cycleStart + 28', m.nextPeriod, '2026-09-29')
  testTrue('period milestone contains no ovulation date', !('ovulation' in m))

  const m2 = getNextPeriodMilestone('2026-09-01', 28, '2026-09-05')
  test('next period = cycleStart + 28', m2.nextPeriod, '2026-09-29')
}

// ── withAlpha / PHASE_COLORS ─────────────────────────────────────────────────
test('withAlpha converts hex to rgba', withAlpha('#4ECDC4', 0.12), 'rgba(78, 205, 196, 0.12)')
test('withAlpha tints a phase CSS variable', withAlpha('var(--phase-menstrual)', 0.12), 'color-mix(in srgb, var(--phase-menstrual) 12%, transparent)')
test('PHASE_COLORS has all four phases', Object.keys(PHASE_COLORS).length, 4)

console.log(`\n${passed} passed, ${failed} failed\n`)
if (failed > 0) process.exit(1)
