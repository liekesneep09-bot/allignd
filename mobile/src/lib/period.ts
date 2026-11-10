// Node's type-stripping test runner requires the explicit extension; app config stays unchanged.
// @ts-ignore -- allowImportingTsExtensions is not enabled in the shared Expo tsconfig.
import { addDays, daysBetween, parseDate } from './date.ts';
import type { PeriodLog, PeriodRange } from '../types/today';

export type { PeriodLog, PeriodRange } from '../types/today';

export type PeriodRangeValues = Pick<PeriodRange, 'startDate' | 'endDate'>;

export type PeriodRangeErrorCode = 'invalid-date' | 'end-before-start' | 'period-too-long';

export class PeriodRangeError extends RangeError {
  readonly code: PeriodRangeErrorCode;

  constructor(code: PeriodRangeErrorCode, message: string) {
    super(message);
    this.name = 'PeriodRangeError';
    this.code = code;
  }
}

export type PeriodRangeLogsResult = {
  logs: PeriodLog[];
  periodLength: number;
  stopDate: string;
};

export type AddPeriodStartResult = {
  periodStartDates: string[];
  newCycleLength: number | null;
};

/**
 * Store an inclusive bleeding range as one yes marker and a no marker on the
 * following day. Existing logs covered by the old/new ranges are replaced.
 */
export function createPeriodRangeLogs(
  existingLogs: readonly PeriodLog[] | null | undefined,
  startDate: string,
  endDate: string,
  replaceRange: PeriodRangeValues | null = null,
): PeriodRangeLogsResult {
  if (!parseDate(startDate) || !parseDate(endDate)) {
    throw new PeriodRangeError('invalid-date', 'Enter valid period dates.');
  }

  const periodLength = daysBetween(startDate, endDate) + 1;
  if (periodLength < 1) {
    throw new PeriodRangeError('end-before-start', 'The last day cannot be before the first day.');
  }
  if (periodLength > 14) {
    throw new PeriodRangeError('period-too-long', 'A period cannot be longer than 14 days.');
  }

  const stopDate = addDays(endDate, 1);
  let clearFrom = startDate;
  let clearThrough = stopDate;

  if (replaceRange) {
    const { startDate: oldStart, endDate: oldEnd } = replaceRange;
    if (parseDate(oldStart) && parseDate(oldEnd)) {
      clearFrom = [clearFrom, oldStart].sort()[0];
      clearThrough = [clearThrough, addDays(oldEnd, 1)].sort().at(-1)!;
    }
  }

  const logs = (existingLogs || []).filter((log) => (
    log.date < clearFrom || log.date > clearThrough
  ));
  logs.push(
    { date: startDate, status: 'yes' },
    { date: stopDate, status: 'no' },
  );
  logs.sort((a, b) => a.date.localeCompare(b.date));

  return { logs, periodLength, stopDate };
}

/** Resolve an explicitly or implicitly logged day to its inclusive period range. */
export function findPeriodRangeForDate(
  dateString: string,
  logs: readonly PeriodLog[] = [],
  fallbackLength = 5,
): PeriodRangeValues | null {
  if (!parseDate(dateString)) return null;

  const starts = [...new Set(
    logs
      .filter((log) => log.status === 'yes' && log.date <= dateString)
      .map((log) => log.date),
  )].sort();
  if (starts.length === 0) return null;

  let startDate = starts.at(-1)!;
  for (const previousStart of starts.slice(0, -1).reverse()) {
    if (addDays(previousStart, 1) !== startDate) break;
    startDate = previousStart;
  }

  const stopDate = logs
    .filter((log) => log.status === 'no' && log.date > startDate)
    .map((log) => log.date)
    .sort()[0];
  const endDate = stopDate
    ? addDays(stopDate, -1)
    : addDays(startDate, Math.max(1, Math.min(fallbackLength || 5, 14)) - 1);

  return dateString >= startDate && dateString <= endDate
    ? { startDate, endDate }
    : null;
}

/** Add a unique period start chronologically and measure the latest cycle. */
export function addPeriodStart(
  date: string,
  existingStarts: readonly string[] = [],
): AddPeriodStartResult {
  if (!parseDate(date)) {
    throw new PeriodRangeError('invalid-date', 'Enter a valid period start date.');
  }
  if (existingStarts.includes(date)) {
    return { periodStartDates: [...existingStarts], newCycleLength: null };
  }

  const periodStartDates = [...existingStarts, date].sort();
  const newCycleLength = periodStartDates.length >= 2
    ? daysBetween(
      periodStartDates[periodStartDates.length - 2],
      periodStartDates[periodStartDates.length - 1],
    )
    : null;

  return { periodStartDates, newCycleLength };
}
