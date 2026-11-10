// Node's type-stripping test runner requires the explicit extension; app config stays unchanged.
// @ts-ignore -- allowImportingTsExtensions is not enabled in the shared Expo tsconfig.
import { addDays, daysBetween, formatDate, parseDate, todayString } from './date.ts';
import type { CycleStats, Phase, Profile } from '../types/today';

export type { CycleStats, PeriodLog, Phase } from '../types/today';

export type CycleProfile = Pick<
  Profile,
  | 'cycleStart'
  | 'cycleLength'
  | 'periodLength'
  | 'bleedingLengthDays'
  | 'menstruationLogs'
  | 'periodStartDates'
  | 'cycleStats'
> & {
  /** Legacy same-day override; normal bleeding state comes from period logs. */
  isMenstruatingNow?: boolean;
};

export type PhaseForDate = {
  phase: Phase;
  day: number;
  linearDay: number;
  overdueDays: number;
  confidence: CycleStats['confidence'];
};

export type PhaseTransition = {
  isTransition: true;
  nextPhase: Phase;
  daysLeft: number;
};

export type CycleLengthHistoryItem = {
  length: number;
  startDate: string;
  isOutlier: boolean;
};

export type CycleStatsResult = CycleStats & {
  cycleLengthHistory: CycleLengthHistoryItem[];
};

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function toLocalDateString(value: string | Date): string | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : formatDate(value);
  }
  if (typeof value !== 'string') return null;
  if (parseDate(value)) return value;

  // Older profiles can contain an ISO timestamp instead of a date-only value.
  if (DATE_ONLY_PATTERN.test(value) || !value.includes('T')) return null;
  const timestamp = new Date(value);
  return Number.isNaN(timestamp.getTime()) ? null : formatDate(timestamp);
}

function requireDateString(value: string | Date): string {
  const dateString = toLocalDateString(value);
  if (!dateString) throw new RangeError('Invalid date.');
  return dateString;
}

function getEffectiveCycleLength(profile: CycleProfile): number {
  return profile.cycleStats?.learnedCycleLength || profile.cycleLength || 28;
}

function getEffectivePeriodLength(profile: CycleProfile): number {
  return profile.bleedingLengthDays || profile.periodLength || 5;
}

/** One-based linear cycle day. It deliberately does not wrap when overdue. */
export function calculateCycleDay(
  startDate: string | Date | null | undefined,
  _cycleLength = 28,
  targetDate: string | Date = todayString(),
): number {
  if (!startDate) return 1;

  const start = toLocalDateString(startDate);
  if (!start) return 1;
  const target = requireDateString(targetDate);
  const difference = daysBetween(start, target);

  return difference < 0 ? 1 : difference + 1;
}

/**
 * Resolve logged bleeding before calendar phases. A log with status "no" is the
 * first non-bleeding day, matching the existing period-range representation.
 */
export function isDateInPeriod(
  profile: CycleProfile,
  date: string,
  today: string = todayString(),
): boolean {
  if (!parseDate(date) || !parseDate(today)) {
    throw new RangeError('Invalid date. Expected YYYY-MM-DD.');
  }

  const logs = (profile.menstruationLogs || []).filter((log) => parseDate(log.date));
  const explicitLog = logs.find((log) => log.date === date);
  if (explicitLog) return explicitLog.status === 'yes';

  const pastYesLogs = logs
    .filter((log) => log.status === 'yes' && log.date <= date)
    .sort((a, b) => b.date.localeCompare(a.date));
  if (pastYesLogs.length === 0) return false;

  // Older data can contain a yes log for every day. Find the cluster's start.
  let clusterStartDate = pastYesLogs[0].date;
  for (let index = 1; index < pastYesLogs.length; index += 1) {
    const previousDate = pastYesLogs[index].date;
    const difference = daysBetween(previousDate, clusterStartDate);
    if (difference === 1) {
      clusterStartDate = previousDate;
    } else if (difference !== 0) {
      break;
    }
  }

  const stopDate = logs
    .filter((log) => log.status === 'no' && log.date > clusterStartDate)
    .map((log) => log.date)
    .sort()[0];

  if (stopDate) return date >= clusterStartDate && date < stopDate;

  const expectedLength = getEffectivePeriodLength(profile);
  const expectedEndDate = addDays(clusterStartDate, expectedLength - 1);
  const maxEndDate = addDays(clusterStartDate, 13);

  if (date > today) {
    return date >= clusterStartDate && date <= expectedEndDate && date <= maxEndDate;
  }

  // Until the user logs a stop, past/present days remain active up to 14 days.
  return date >= clusterStartDate && date <= maxEndDate;
}

function getPhaseForDay(
  day: number,
  cycleLength: number,
  isMenstruatingNow: boolean,
  hasValidStartDate: boolean,
): Phase {
  if (isMenstruatingNow) return 'menstrual';
  if (!hasValidStartDate) return 'luteal';
  if (!day || day < 1) return 'follicular';
  if (day > cycleLength) return 'luteal';

  const ovulatoryCenter = cycleLength - 14;
  const ovulatoryStart = ovulatoryCenter - 2;
  const ovulatoryEnd = ovulatoryCenter + 2;

  if (day >= ovulatoryStart && day <= ovulatoryEnd) return 'ovulatory';
  if (day > ovulatoryEnd) return 'luteal';

  // Menstruation is driven by logs above, rather than assumed from cycle day.
  return 'follicular';
}

export function getPhaseForDate(
  profile: CycleProfile,
  date: string,
  today: string = todayString(),
): PhaseForDate {
  if (!parseDate(date) || !parseDate(today)) {
    throw new RangeError('Invalid date. Expected YYYY-MM-DD.');
  }

  const cycleLength = getEffectiveCycleLength(profile);
  const normalizedStart = profile.cycleStart ? toLocalDateString(profile.cycleStart) : null;
  const day = calculateCycleDay(normalizedStart, cycleLength, date);
  const overdueDays = Math.max(0, day - cycleLength);

  if (isDateInPeriod(profile, date, today)) {
    return {
      phase: 'menstrual',
      day,
      linearDay: day,
      overdueDays: 0,
      confidence: 'high',
    };
  }

  const isMenstruating = date === today && Boolean(profile.isMenstruatingNow);
  return {
    phase: getPhaseForDay(day, cycleLength, isMenstruating, Boolean(normalizedStart)),
    day,
    linearDay: day,
    overdueDays,
    confidence: profile.cycleStats?.confidence || 'low',
  };
}

export function getPhaseTransition(
  day: number,
  cycleLength = 28,
  periodLength = 5,
  currentPhase?: Phase,
): PhaseTransition | null {
  if (!day || day < 1 || day > cycleLength) return null;

  const ovulatoryCenter = cycleLength - 14;
  const ovulatoryStart = ovulatoryCenter - 2;
  const ovulatoryEnd = ovulatoryCenter + 2;

  if (currentPhase === 'menstrual') {
    const effectivePeriod = periodLength || 5;
    if (day >= effectivePeriod - 1 && day <= effectivePeriod) {
      return { isTransition: true, nextPhase: 'follicular', daysLeft: effectivePeriod - day };
    }
  } else if (currentPhase === 'follicular') {
    if (day >= ovulatoryStart - 2 && day < ovulatoryStart) {
      return { isTransition: true, nextPhase: 'ovulatory', daysLeft: ovulatoryStart - day };
    }
  } else if (currentPhase === 'ovulatory') {
    if (day === ovulatoryEnd) {
      return { isTransition: true, nextPhase: 'luteal', daysLeft: 0 };
    }
  } else if (currentPhase === 'luteal') {
    if (day >= cycleLength - 2 && day <= cycleLength) {
      return { isTransition: true, nextPhase: 'menstrual', daysLeft: cycleLength - day };
    }
  }

  return null;
}

function getMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

function getCycleLengthHistory(periodStartDates: readonly string[]): CycleLengthHistoryItem[] {
  const history = periodStartDates.slice(1).map((startDate, index) => ({
    length: daysBetween(periodStartDates[index], startDate),
    startDate,
    isOutlier: false,
  }));
  if (history.length === 0) return history;

  const median = getMedian(history.map((item) => item.length));
  return history.map((item) => ({
    ...item,
    isOutlier: item.length < 21 || item.length > 45 || Math.abs(item.length - median) > 10,
  }));
}

function getLearnedCycleLength(history: CycleLengthHistoryItem[], fallbackLength: number): number {
  const validCycles = history.filter((item) => !item.isOutlier);
  if (validCycles.length === 0) return fallbackLength;

  const recent = validCycles.slice(-6);
  if (recent.length < 3) return Math.round(getMedian(recent.map((item) => item.length)));

  let totalWeight = 0;
  let weightedSum = 0;
  recent.forEach((item, index) => {
    const weight = 1 + index / (recent.length - 1);
    weightedSum += item.length * weight;
    totalWeight += weight;
  });
  return Math.round(weightedSum / totalWeight);
}

function getVariability(history: CycleLengthHistoryItem[]): number {
  const recent = history.filter((item) => !item.isOutlier).slice(-6);
  if (recent.length < 2) return 0;

  const mean = recent.reduce((sum, item) => sum + item.length, 0) / recent.length;
  const variance = recent.reduce((sum, item) => sum + (item.length - mean) ** 2, 0) / recent.length;
  return Math.round(Math.sqrt(variance) * 10) / 10;
}

export function getCycleStats(
  periodStartDates: readonly string[],
  onboardingCycleLength = 28,
): CycleStatsResult {
  const cycleLengthHistory = getCycleLengthHistory(periodStartDates);
  const validCycleCount = cycleLengthHistory.filter((item) => !item.isOutlier).length;
  const learnedCycleLength = getLearnedCycleLength(cycleLengthHistory, onboardingCycleLength);
  const variability = getVariability(cycleLengthHistory);

  let confidence: CycleStats['confidence'] = 'low';
  if (validCycleCount >= 4 && variability <= 3) confidence = 'high';
  else if (validCycleCount >= 2 && variability <= 5) confidence = 'medium';

  return { cycleLengthHistory, learnedCycleLength, variability, confidence };
}

export function predictNextPeriodDate(
  periodStartDates: readonly string[],
  cycleLength: number,
): string | null {
  if (periodStartDates.length === 0) return null;
  return addDays(periodStartDates[periodStartDates.length - 1], cycleLength);
}
