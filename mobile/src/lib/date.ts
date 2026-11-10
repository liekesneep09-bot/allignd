const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const DUTCH_MONTHS = [
  'januari',
  'februari',
  'maart',
  'april',
  'mei',
  'juni',
  'juli',
  'augustus',
  'september',
  'oktober',
  'november',
  'december',
] as const;

type DateParts = {
  year: number;
  month: number;
  day: number;
};

function createLocalDate(year: number, monthIndex: number, day: number): Date {
  // setFullYear avoids Date's special handling of years 0 through 99.
  const date = new Date(0);
  date.setFullYear(year, monthIndex, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

function readDateParts(dateString: string): DateParts | null {
  if (typeof dateString !== 'string') return null;

  const match = DATE_PATTERN.exec(dateString);
  if (!match) return null;

  const parts = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
  const date = createLocalDate(parts.year, parts.month - 1, parts.day);

  return date.getFullYear() === parts.year
    && date.getMonth() === parts.month - 1
    && date.getDate() === parts.day
    ? parts
    : null;
}

/** Parse a strict YYYY-MM-DD value as local midnight, without a UTC conversion. */
export function parseDate(dateString: string): Date | null {
  const parts = readDateParts(dateString);
  return parts ? createLocalDate(parts.year, parts.month - 1, parts.day) : null;
}

/** Format a Date using its local calendar day. */
export function formatDate(date: Date): string {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new RangeError('Invalid date.');
  }

  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayString(now: Date = new Date()): string {
  return formatDate(now);
}

export function addDays(dateString: string, days: number): string {
  const date = parseDate(dateString);
  if (!date) throw new RangeError('Invalid date. Expected YYYY-MM-DD.');
  if (!Number.isInteger(days)) throw new RangeError('Days must be an integer.');

  date.setDate(date.getDate() + days);
  return formatDate(date);
}

/** Return end - start in calendar days, including across DST transitions. */
export function daysBetween(startDate: string, endDate: string): number {
  const start = readDateParts(startDate);
  const end = readDateParts(endDate);
  if (!start || !end) throw new RangeError('Invalid date. Expected YYYY-MM-DD.');

  // UTC is used only as a calendar-day serial number; no local instant is shifted.
  const toSerial = ({ year, month, day }: DateParts): number => {
    const date = new Date(0);
    date.setUTCFullYear(year, month - 1, day);
    date.setUTCHours(0, 0, 0, 0);
    return date.getTime();
  };

  return Math.round((toSerial(end) - toSerial(start)) / DAY_IN_MS);
}

/** Seven consecutive dates ending on the reference date (today by default). */
export function getRecentDates(referenceDate: string | Date = new Date()): string[] {
  const endDate = typeof referenceDate === 'string' ? referenceDate : formatDate(referenceDate);
  if (!parseDate(endDate)) throw new RangeError('Invalid date. Expected YYYY-MM-DD.');

  return Array.from({ length: 7 }, (_, index) => addDays(endDate, index - 6));
}

/**
 * Build a Monday-first month grid. `month` is zero-based, like Date.getMonth().
 * Nulls pad both ends so the returned array always contains complete weeks.
 */
export function getMonthGrid(year: number, month: number): Array<string | null> {
  if (!Number.isInteger(year) || year < 0 || year > 9999 || !Number.isInteger(month) || month < 0 || month > 11) {
    throw new RangeError('Invalid year or zero-based month.');
  }

  const firstDate = createLocalDate(year, month, 1);
  const leadingNulls = (firstDate.getDay() + 6) % 7;
  const daysInMonth = createLocalDate(year, month + 1, 0).getDate();
  const dates = Array.from({ length: daysInMonth }, (_, index) => (
    formatDate(createLocalDate(year, month, index + 1))
  ));
  const grid: Array<string | null> = [
    ...Array.from({ length: leadingNulls }, () => null),
    ...dates,
  ];

  while (grid.length % 7 !== 0) grid.push(null);
  return grid;
}

/** Dutch month and year label, with a zero-based month. */
export function getMonthLabel(year: number, month: number): string {
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 0 || month > 11) {
    throw new RangeError('Invalid year or zero-based month.');
  }
  return `${DUTCH_MONTHS[month]} ${year}`;
}

/** Dutch Today-screen date label, for example "26 oktober". */
export function getDateLabel(dateString: string): string {
  const parts = readDateParts(dateString);
  if (!parts) throw new RangeError('Invalid date. Expected YYYY-MM-DD.');
  return `${parts.day} ${DUTCH_MONTHS[parts.month - 1]}`;
}
