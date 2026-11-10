import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getCalendarCycleInfo,
  getFuturePeriodWindows,
  getNextPeriodMilestone,
  getPhaseForDayNumber,
} from '../src/lib/calendar.ts';

process.env.TZ = 'Europe/Amsterdam';

test('calendar phase categories retain the web phase boundaries', () => {
  assert.equal(getPhaseForDayNumber(1, 28, 5), 'menstrual');
  assert.equal(getPhaseForDayNumber(5, 28, 5), 'menstrual');
  assert.equal(getPhaseForDayNumber(6, 28, 5), 'follicular');
  assert.equal(getPhaseForDayNumber(12, 28, 5), 'ovulatory');
  assert.equal(getPhaseForDayNumber(16, 28, 5), 'ovulatory');
  assert.equal(getPhaseForDayNumber(17, 28, 5), 'luteal');
});

test('calendar phases wrap into later cycles and do not estimate earlier dates', () => {
  assert.deepEqual(getCalendarCycleInfo('2026-10-29', '2026-10-01', 28, 5), {
    day: 1,
    phase: 'menstrual',
  });
  assert.deepEqual(getCalendarCycleInfo('2026-11-09', '2026-10-01', 28, 5), {
    day: 12,
    phase: 'ovulatory',
  });
  assert.equal(getCalendarCycleInfo('2026-09-30', '2026-10-01', 28, 5), null);
  assert.equal(getCalendarCycleInfo('2026-10-01', null, 28, 5), null);
});

test('future menstrual windows use one uncertainty day for limited history', () => {
  const dates = getFuturePeriodWindows(['2026-10-01'], 28, 5, 0, 1);
  assert.equal(dates.size, 7);
  assert.equal(dates.has('2026-10-28'), true);
  assert.equal(dates.has('2026-10-29'), true);
  assert.equal(dates.has('2026-11-03'), true);
  assert.equal(dates.has('2026-11-04'), false);
});

test('regular history removes the uncertainty buffer', () => {
  const starts = ['2026-05-07', '2026-06-04', '2026-07-02', '2026-07-30', '2026-08-27'];
  const dates = getFuturePeriodWindows(starts, 28, 5, 0, 1);
  assert.equal(dates.size, 5);
  assert.equal(dates.has('2026-09-23'), false);
  assert.equal(dates.has('2026-09-24'), true);
  assert.equal(dates.has('2026-09-28'), true);
  assert.equal(dates.has('2026-09-29'), false);
});

test('future windows use local date arithmetic across DST and cover later cycles', () => {
  const dates = getFuturePeriodWindows(['2026-10-01'], 28, 5, 0, 2);
  assert.equal(dates.has('2026-11-25'), true);
  assert.equal(dates.has('2026-12-01'), true);
  assert.equal(dates.size, 14);
});

test('next menstrual milestone rolls forward without returning a past estimate', () => {
  assert.equal(getNextPeriodMilestone('2026-09-03', 28, '2026-10-26'), '2026-10-29');
  assert.equal(getNextPeriodMilestone('2026-09-03', 28, '2026-10-29'), '2026-10-29');
  assert.equal(getNextPeriodMilestone('2026-10-01', 28, '2026-10-26'), '2026-10-29');
  assert.equal(getNextPeriodMilestone(null, 28, '2026-10-26'), null);
});

test('empty prediction history and invalid calendar input fail safely', () => {
  assert.equal(getFuturePeriodWindows([], 28, 5).size, 0);
  assert.throws(() => getCalendarCycleInfo('not-a-date', '2026-10-01', 28), RangeError);
  assert.throws(() => getNextPeriodMilestone('2026-10-01', 0, '2026-10-26'), RangeError);
});
