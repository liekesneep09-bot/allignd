// Node's type-stripping test runner requires the explicit extension.
// @ts-ignore -- allowImportingTsExtensions is not enabled in the shared Expo tsconfig.
import { addDays, daysBetween, parseDate } from './date.ts';
import type { Phase } from '../types/today';

export type CalendarCycleInfo = {
  day: number;
  phase: Phase;
};

function requirePositiveInteger(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 1) throw new RangeError(`${name} must be a positive integer.`);
}

/**
 * Phase category for a day within a cycle. This does not indicate fertility or
 * an exact ovulation date; the early days are the estimated menstrual window.
 */
export function getPhaseForDayNumber(dayNumber: number, cycleLength: number, periodLength = 5): Phase {
  requirePositiveInteger(dayNumber, 'Day number');
  requirePositiveInteger(cycleLength, 'Cycle length');
  requirePositiveInteger(periodLength, 'Period length');

  const ovulatoryCenter = cycleLength - 14;
  const ovulatoryStart = ovulatoryCenter - 2;
  const ovulatoryEnd = ovulatoryCenter + 2;
  if (dayNumber <= periodLength) return 'menstrual';
  if (dayNumber >= ovulatoryStart && dayNumber <= ovulatoryEnd) return 'ovulatory';
  if (dayNumber > ovulatoryEnd) return 'luteal';
  return 'follicular';
}

/** Cycle-aware calendar tinting. Dates before the current cycle are not estimated. */
export function getCalendarCycleInfo(
  dateString: string,
  cycleStart: string | null,
  cycleLength: number,
  periodLength = 5,
): CalendarCycleInfo | null {
  if (!cycleStart) return null;
  if (!parseDate(dateString) || !parseDate(cycleStart)) {
    throw new RangeError('Invalid date. Expected YYYY-MM-DD.');
  }
  requirePositiveInteger(cycleLength, 'Cycle length');
  requirePositiveInteger(periodLength, 'Period length');

  const difference = daysBetween(cycleStart, dateString);
  if (difference < 0) return null;
  const day = (difference % cycleLength) + 1;
  return { day, phase: getPhaseForDayNumber(day, cycleLength, periodLength) };
}

/** Expected future bleeding windows, with a smaller buffer for regular histories. */
export function getFuturePeriodWindows(
  periodStartDates: readonly string[] = [],
  cycleLength = 28,
  periodLength = 5,
  variability = 0,
  numberOfCycles = 4,
): Set<string> {
  requirePositiveInteger(cycleLength, 'Cycle length');
  requirePositiveInteger(periodLength, 'Period length');
  requirePositiveInteger(numberOfCycles, 'Number of cycles');
  if (periodStartDates.length === 0) return new Set();

  const lastStart = [...periodStartDates].sort().at(-1)!;
  if (!parseDate(lastStart)) throw new RangeError('Invalid date. Expected YYYY-MM-DD.');
  const buffer = periodStartDates.length - 1 >= 4 && variability <= 3 ? 0 : 1;
  const predictions = new Set<string>();

  for (let cycle = 1; cycle <= numberOfCycles; cycle += 1) {
    const expectedStart = addDays(lastStart, cycleLength * cycle);
    const start = addDays(expectedStart, -buffer);
    const end = addDays(expectedStart, periodLength - 1 + buffer);
    const days = daysBetween(start, end);
    for (let offset = 0; offset <= days; offset += 1) predictions.add(addDays(start, offset));
  }

  return predictions;
}

/** Next estimated menstrual start, rolled forward to today or a future date. */
export function getNextPeriodMilestone(
  cycleStart: string | null,
  cycleLength: number,
  today: string,
): string | null {
  if (!cycleStart) return null;
  if (!parseDate(cycleStart) || !parseDate(today)) {
    throw new RangeError('Invalid date. Expected YYYY-MM-DD.');
  }
  requirePositiveInteger(cycleLength, 'Cycle length');

  const elapsedCycles = Math.ceil(daysBetween(cycleStart, today) / cycleLength);
  return addDays(cycleStart, Math.max(1, elapsedCycles) * cycleLength);
}
