import test from 'node:test';
import assert from 'node:assert/strict';

import {
  addDays,
  daysBetween,
  formatDate,
  getDateLabel,
  getMonthGrid,
  getMonthLabel,
  getRecentDates,
  parseDate,
  todayString,
} from '../src/lib/date.ts';
import {
  calculateCycleDay,
  getCycleStats,
  getPhaseForDate,
  getPhaseTransition,
  isDateInPeriod,
  predictNextPeriodDate,
} from '../src/lib/cycle.ts';
import {
  addPeriodStart,
  createPeriodRangeLogs,
  findPeriodRangeForDate,
} from '../src/lib/period.ts';

process.env.TZ = 'Europe/Amsterdam';

const TODAY = '2026-10-26';

function makeProfile(overrides = {}) {
  return {
    cycleStart: '2026-10-01',
    cycleLength: 28,
    periodLength: 5,
    bleedingLengthDays: 5,
    menstruationLogs: [],
    periodStartDates: ['2026-10-01'],
    cycleStats: { learnedCycleLength: null, variability: 0, confidence: 'medium' },
    ...overrides,
  };
}

function errorCode(code) {
  return (error) => {
    assert.equal(error.code, code);
    return true;
  };
}

test('date-only parsing and formatting stay on the local calendar day', () => {
  const date = parseDate('2024-02-29');
  assert.ok(date);
  assert.equal(date.getFullYear(), 2024);
  assert.equal(date.getMonth(), 1);
  assert.equal(date.getDate(), 29);
  assert.equal(formatDate(date), '2024-02-29');
  assert.equal(todayString(new Date(2026, 9, 26, 23, 30)), TODAY);
  assert.equal(parseDate('2023-02-29'), null);
  assert.equal(parseDate('2026-2-09'), null);
});

test('date arithmetic handles month boundaries and DST without timezone drift', () => {
  assert.equal(addDays('2024-02-28', 1), '2024-02-29');
  assert.equal(addDays('2026-01-01', -1), '2025-12-31');
  assert.equal(daysBetween('2026-03-28', '2026-03-30'), 2);
  assert.equal(daysBetween('2026-10-24', '2026-10-26'), 2);
  assert.equal(daysBetween('2026-10-26', '2026-10-20'), -6);
  assert.throws(() => addDays('2026-02-29', 1), RangeError);
  assert.throws(() => daysBetween('not-a-date', TODAY), RangeError);
});

test('recent dates form a seven-day strip ending on the reference date', () => {
  assert.deepEqual(getRecentDates(TODAY), [
    '2026-10-20',
    '2026-10-21',
    '2026-10-22',
    '2026-10-23',
    '2026-10-24',
    '2026-10-25',
    '2026-10-26',
  ]);
});

test('month grids are Monday-first, null-padded, and use Dutch labels', () => {
  const grid = getMonthGrid(2026, 9);
  assert.equal(grid.length, 35);
  assert.deepEqual(grid.slice(0, 4), [null, null, null, '2026-10-01']);
  assert.equal(grid[33], '2026-10-31');
  assert.equal(grid[34], null);
  assert.equal(grid.filter(Boolean).length, 31);
  assert.equal(getMonthLabel(2026, 9), 'oktober 2026');
  assert.equal(getDateLabel(TODAY), '26 oktober');
});

test('cycle days are one-based, linear, and safe before the start', () => {
  assert.equal(calculateCycleDay('2026-10-01', 28, '2026-10-01'), 1);
  assert.equal(calculateCycleDay('2026-10-01', 28, '2026-10-30'), 30);
  assert.equal(calculateCycleDay('2026-10-02', 28, '2026-10-01'), 1);
  assert.equal(calculateCycleDay(null, 28, TODAY), 1);
});

test('unlogged dates use the web phase boundaries', () => {
  const profile = makeProfile();
  assert.equal(getPhaseForDate(profile, '2026-10-01', TODAY).phase, 'follicular');
  assert.equal(getPhaseForDate(profile, '2026-10-11', TODAY).phase, 'follicular');
  assert.equal(getPhaseForDate(profile, '2026-10-12', TODAY).phase, 'ovulatory');
  assert.equal(getPhaseForDate(profile, '2026-10-16', TODAY).phase, 'ovulatory');
  assert.equal(getPhaseForDate(profile, '2026-10-17', TODAY).phase, 'luteal');
  assert.equal(getPhaseForDate(makeProfile({ cycleStart: null }), TODAY, TODAY).phase, 'luteal');
});

test('overdue cycles stay luteal and retain their linear day', () => {
  const result = getPhaseForDate(makeProfile(), '2026-10-30', TODAY);
  assert.equal(result.phase, 'luteal');
  assert.equal(result.day, 30);
  assert.equal(result.linearDay, 30);
  assert.equal(result.overdueDays, 2);
  assert.equal(result.confidence, 'medium');
});

test('period logs override phases and a no marker is the first stopped day', () => {
  const profile = makeProfile({
    menstruationLogs: [
      { date: '2026-10-01', status: 'yes' },
      { date: '2026-10-05', status: 'no' },
    ],
  });

  assert.equal(isDateInPeriod(profile, '2026-10-01', TODAY), true);
  assert.equal(isDateInPeriod(profile, '2026-10-04', TODAY), true);
  assert.equal(isDateInPeriod(profile, '2026-10-05', TODAY), false);
  const menstrual = getPhaseForDate(profile, '2026-10-03', TODAY);
  assert.equal(menstrual.phase, 'menstrual');
  assert.equal(menstrual.overdueDays, 0);
  assert.equal(menstrual.confidence, 'high');
});

test('the legacy same-day menstruation override only applies to today', () => {
  const profile = makeProfile({ isMenstruatingNow: true });
  assert.equal(getPhaseForDate(profile, TODAY, TODAY).phase, 'menstrual');
  assert.equal(getPhaseForDate(profile, '2026-10-25', TODAY).phase, 'luteal');
});

test('an unstopped period fills past days to 14 but only predicts expected future days', () => {
  const profile = makeProfile({
    menstruationLogs: [{ date: '2026-10-05', status: 'yes' }],
  });

  assert.equal(isDateInPeriod(profile, '2026-10-18', TODAY), true);
  assert.equal(isDateInPeriod(profile, '2026-10-19', TODAY), false);
  assert.equal(isDateInPeriod(profile, '2026-10-09', '2026-10-05'), true);
  assert.equal(isDateInPeriod(profile, '2026-10-10', '2026-10-05'), false);
});

test('consecutive legacy yes logs resolve to the true cluster start', () => {
  const profile = makeProfile({
    menstruationLogs: [
      { date: '2026-10-01', status: 'yes' },
      { date: '2026-10-02', status: 'yes' },
      { date: '2026-10-03', status: 'yes' },
      { date: '2026-10-06', status: 'no' },
    ],
  });

  assert.equal(isDateInPeriod(profile, '2026-10-05', TODAY), true);
  assert.deepEqual(findPeriodRangeForDate('2026-10-05', profile.menstruationLogs), {
    startDate: '2026-10-01',
    endDate: '2026-10-05',
  });
});

test('phase transitions preserve days left and return null when overdue', () => {
  assert.deepEqual(getPhaseTransition(4, 28, 5, 'menstrual'), {
    isTransition: true,
    nextPhase: 'follicular',
    daysLeft: 1,
  });
  assert.deepEqual(getPhaseTransition(16, 28, 5, 'ovulatory'), {
    isTransition: true,
    nextPhase: 'luteal',
    daysLeft: 0,
  });
  assert.equal(getPhaseTransition(29, 28, 5, 'luteal'), null);
});

test('cycle stats learn regular history and mark insufficient data low confidence', () => {
  const regular = getCycleStats(['2026-01-01', '2026-01-29', '2026-02-26'], 30);
  assert.equal(regular.learnedCycleLength, 28);
  assert.equal(regular.variability, 0);
  assert.equal(regular.confidence, 'medium');
  assert.deepEqual(regular.cycleLengthHistory.map((item) => item.length), [28, 28]);

  const empty = getCycleStats([], 30);
  assert.equal(empty.learnedCycleLength, 30);
  assert.equal(empty.confidence, 'low');
  assert.equal(getCycleStats(['2026-01-01', '2026-01-15'], 30).learnedCycleLength, 30);
});

test('next period prediction uses the latest stored start and local date arithmetic', () => {
  assert.equal(predictNextPeriodDate(['2024-02-01'], 28), '2024-02-29');
  assert.equal(predictNextPeriodDate(['2026-01-01', '2026-01-29'], 28), '2026-02-26');
  assert.equal(predictNextPeriodDate([], 28), null);
});

test('range logging stores inclusive end semantics with a following no marker', () => {
  const result = createPeriodRangeLogs([], '2026-10-05', '2026-10-08');
  assert.equal(result.periodLength, 4);
  assert.equal(result.stopDate, '2026-10-09');
  assert.deepEqual(result.logs, [
    { date: '2026-10-05', status: 'yes' },
    { date: '2026-10-09', status: 'no' },
  ]);

  const profile = makeProfile({ menstruationLogs: result.logs });
  assert.equal(isDateInPeriod(profile, '2026-10-08', TODAY), true);
  assert.equal(isDateInPeriod(profile, '2026-10-09', TODAY), false);
});

test('editing a range clears the old and new spans without removing outside logs', () => {
  const existing = [
    { date: '2026-09-30', status: 'no' },
    { date: '2026-10-01', status: 'yes' },
    { date: '2026-10-04', status: 'no' },
    { date: '2026-10-20', status: 'yes' },
  ];
  const result = createPeriodRangeLogs(existing, '2026-10-05', '2026-10-06', {
    startDate: '2026-10-01',
    endDate: '2026-10-03',
  });

  assert.deepEqual(result.logs, [
    { date: '2026-09-30', status: 'no' },
    { date: '2026-10-05', status: 'yes' },
    { date: '2026-10-07', status: 'no' },
    { date: '2026-10-20', status: 'yes' },
  ]);
});

test('period range lookup handles fallback lengths and rejects unrelated dates', () => {
  const logs = [{ date: '2026-10-05', status: 'yes' }];
  assert.deepEqual(findPeriodRangeForDate('2026-10-07', logs, 5), {
    startDate: '2026-10-05',
    endDate: '2026-10-09',
  });
  assert.equal(findPeriodRangeForDate('2026-10-10', logs, 5), null);
  assert.equal(findPeriodRangeForDate('invalid', logs), null);
});

test('range validation rejects impossible dates, reversed ranges, and more than 14 days', () => {
  assert.throws(
    () => createPeriodRangeLogs([], '2026-02-29', '2026-03-01'),
    errorCode('invalid-date'),
  );
  assert.throws(
    () => createPeriodRangeLogs([], '2026-10-05', '2026-10-04'),
    errorCode('end-before-start'),
  );
  assert.throws(
    () => createPeriodRangeLogs([], '2026-10-01', '2026-10-15'),
    errorCode('period-too-long'),
  );
  assert.equal(createPeriodRangeLogs([], '2026-10-01', '2026-10-14').periodLength, 14);
});

test('adding period starts sorts, deduplicates, and calculates the latest cycle', () => {
  assert.deepEqual(addPeriodStart('2026-01-01', ['2026-01-29']), {
    periodStartDates: ['2026-01-01', '2026-01-29'],
    newCycleLength: 28,
  });
  assert.deepEqual(addPeriodStart('2026-01-29', ['2026-01-01', '2026-01-29']), {
    periodStartDates: ['2026-01-01', '2026-01-29'],
    newCycleLength: null,
  });
  assert.throws(() => addPeriodStart('2026-02-30'), errorCode('invalid-date'));
});
