import assert from 'node:assert/strict'
import { createPeriodRangeLogs, findPeriodRangeForDate } from '../src/logic/period-logging.js'

const existingLogs = [
  { date: '2026-08-03', status: 'yes' },
  { date: '2026-08-08', status: 'no' },
  { date: '2026-09-01', status: 'yes' },
  { date: '2026-09-04', status: 'no' },
]

const saved = createPeriodRangeLogs(existingLogs, '2026-09-02', '2026-09-06', {
  startDate: '2026-09-01',
  endDate: '2026-09-03',
})

assert.equal(saved.periodLength, 5, 'start/end dates are inclusive')
assert.equal(saved.stopDate, '2026-09-07', 'the stored stop marker is the day after the final bleeding day')
assert.deepEqual(saved.logs, [
  { date: '2026-08-03', status: 'yes' },
  { date: '2026-08-08', status: 'no' },
  { date: '2026-09-02', status: 'yes' },
  { date: '2026-09-07', status: 'no' },
])

assert.deepEqual(
  findPeriodRangeForDate('2026-09-05', saved.logs, 5),
  { startDate: '2026-09-02', endDate: '2026-09-06' },
  'a calendar date inside a saved period resolves to its full range'
)

assert.deepEqual(
  findPeriodRangeForDate('2026-09-20', saved.logs, 5),
  null,
  'a date outside a saved period has no range to edit'
)

assert.throws(() => createPeriodRangeLogs([], '2026-09-07', '2026-09-06'), /before/)
assert.throws(() => createPeriodRangeLogs([], '2026-09-01', '2026-09-16'), /14 days/)
assert.throws(() => createPeriodRangeLogs([], '2026-02-30', '2026-03-01'), /valid period dates/)

console.log('Period range logging tests passed: inclusive dates, replacement, editing, and validation.')
