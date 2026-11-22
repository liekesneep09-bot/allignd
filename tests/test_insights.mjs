/**
 * Unit tests for the Insights helpers (src/logic/insights.js)
 */
import assert from 'node:assert/strict'
import {
  getPhaseSegments,
  phaseForCycleDay,
  daysBetween,
  getCycleStarts,
  getCycleLengths,
  phaseForDate,
  foodByPhase,
  symptomsByPhase,
  symptomsInPhaseOfCycle
} from '../src/logic/insights.js'

// Segments for a 28-day cycle with a 5-day period
assert.deepEqual(getPhaseSegments(28, 5).map(s => [s.phase, s.start, s.end]), [
  ['menstrual', 0, 5], ['follicular', 5, 11], ['ovulatory', 11, 16], ['luteal', 16, 28]
])
assert.equal(phaseForCycleDay(0, 28, 5), 'menstrual')
assert.equal(phaseForCycleDay(8, 28, 5), 'follicular')
assert.equal(phaseForCycleDay(13, 28, 5), 'ovulatory')
assert.equal(phaseForCycleDay(21, 28, 5), 'luteal')
assert.equal(phaseForCycleDay(30, 28, 5), 'luteal')

assert.equal(daysBetween('2026-02-27', '2026-03-01'), 2)
assert.equal(daysBetween('2026-03-28', '2026-03-30'), 2) // across DST

const starts = getCycleStarts(['2026-03-01', '2026-01-04', '2026-02-01'], '2026-03-01')
assert.deepEqual(starts, ['2026-01-04', '2026-02-01', '2026-03-01'])
assert.deepEqual(getCycleLengths(starts).map(c => c.length), [28, 28])

assert.equal(phaseForDate('2026-01-01', starts), null)
assert.equal(phaseForDate('2026-02-01', starts), 'menstrual')
assert.equal(phaseForDate('2026-02-10', starts), 'follicular')
assert.equal(phaseForDate('2026-02-25', starts), 'luteal')

const food = foodByPhase([
  { date: '2026-02-02', kcal: 1000, p: 50 },
  { date: '2026-02-02', kcal: 700, p: 30 },
  { date: '2026-02-25', kcal: 2000, p: 100 },
  { date: '2026-02-26', kcal: 2200, p: 110 }
], starts)
const byPhase = Object.fromEntries(food.map(f => [f.phase, f]))
assert.equal(byPhase.menstrual.avgKcal, 1700)
assert.equal(byPhase.menstrual.avgProtein, 80)
assert.equal(byPhase.luteal.avgKcal, 2100)
assert.equal(byPhase.luteal.days, 2)
assert.equal(byPhase.follicular.avgKcal, null)

const symptoms = symptomsByPhase([
  { date: '2026-02-25', symptoms: ['cravings_sweet', 'bloated'] },
  { date: '2026-02-26', symptoms: ['cravings_sweet'] },
  { date: '2026-02-02', symptoms: ['cramps'] }
], starts)
assert.equal(symptoms.daysPerPhase.luteal, 2)
assert.equal(symptoms.rows[0].id, 'cravings_sweet')
assert.equal(symptoms.rows[0].perPhase.luteal, 2)

const inPhase = symptomsInPhaseOfCycle([
  { date: '2026-02-25', symptoms: ['cravings_sweet'] },
  { date: '2026-02-26', symptoms: ['cravings_sweet', 'fatigue'] },
  { date: '2026-03-02', symptoms: ['cramps'] }
], '2026-02-01', '2026-03-01', 'luteal', 28, 5)
assert.deepEqual(inPhase, [{ id: 'cravings_sweet', days: 2 }, { id: 'fatigue', days: 1 }])

console.log('Insights tests passed: phases, cycle lengths, food and symptoms per phase.')
