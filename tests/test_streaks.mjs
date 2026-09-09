/**
 * Unit Tests for Streak Logic (streaks.js)
 */
import { getStreak, hasLoggedToday } from '../src/logic/streaks.js'
import { getLocalDateStr } from '../src/utils/date.js'

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
    console.error(`  ❌ ${desc}: expected true, got ${JSON.stringify(actual)}`)
    failed++
  }
}

function testFalse(desc, actual) {
  if (!actual) {
    console.log(`  ✅ ${desc}`)
    passed++
  } else {
    console.error(`  ❌ ${desc}: expected false, got ${JSON.stringify(actual)}`)
    failed++
  }
}

const day = (offset) => {
  const d = new Date('2026-09-09T12:00:00')
  d.setDate(d.getDate() + offset)
  return getLocalDateStr(d)
}

// Given: today (offset 0) is logged via food; streak counts down from today.
const baseUser = {
  foodLogs: [],
  movementLogs: [],
  weightLogs: [],
  waterLogs: [],
  stepLogs: [],
  symptomLogs: [],
  menstruationLogs: []
}

console.log('Streak: no data')
test(' null user -> 0', getStreak(null), 0)
test(' empty logs -> 0', getStreak({ ...baseUser }), 0)
testFalse(' empty logs -> not logged today', hasLoggedToday({ ...baseUser }))

console.log('Streak: consecutive days ending today')
{
  const u = {
    ...baseUser,
    foodLogs: [{ date: day(0) }, { date: day(-1) }, { date: day(-2) }],
    weightLogs: [{ date: day(-3) }, { date: day(-4) }]
  }
  test(' 5 consecutive (food 0..-2, weight -3..-4) -> 5', getStreak(u), 5)
  testTrue(' logged today', hasLoggedToday(u))
}

console.log('Streak: streak continues from yesterday when today not logged yet')
{
  const u = {
    ...baseUser,
    waterLogs: [{ date: day(-1) }, { date: day(-2) }, { date: day(-3) }]
  }
  test(' 3 consecutive ending yesterday -> 3', getStreak(u), 3)
  testFalse(' not logged today', hasLoggedToday(u))
}

console.log('Streak: broken streak stops at the gap')
{
  const u = {
    ...baseUser,
    foodLogs: [{ date: day(0) }, { date: day(-1) }, { date: day(-3) }, { date: day(-4) }]
  }
  test(' gap after -1 -> 2', getStreak(u), 2)
}

console.log('Streak: single day')
{
  const u = { ...baseUser, symptomLogs: [{ date: day(-1) }] }
  test(' single yesterday -> 1', getStreak(u), 1)
}
{
  const u = { ...baseUser, stepLogs: [{ date: day(0) }] }
  test(' single today -> 1', getStreak(u), 1)
}

console.log('Streak: menstruation logs count as active days')
{
  const u = { ...baseUser, menstruationLogs: [{ date: day(0), status: 'yes' }] }
  testTrue(" menstruation 'yes' today counts", hasLoggedToday(u))
}

console.log(`\nResults: ${passed} passed, ${failed} failed`)
process.exit(failed > 0 ? 1 : 0)