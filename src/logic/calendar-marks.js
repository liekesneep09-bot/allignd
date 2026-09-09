/**
 * Shared calendar marking logic
 * Single source of truth for how a calendar day is marked across all calendars
 * in the app (PhaseGuide calendar + PeriodCalendar modal), so they never drift
 * apart in behaviour or visual language.
 *
 * Fateful wording choice: the ovulation day is always an estimate based on the
 * user's average cycle + the standard 14-day luteal assumption. We deliberately
 * never hide it (the user wants to see the ovulatory phase), and we deliberately
 * never present it as fact. Callers must surface the "geschat / estimate" label
 * wherever the marker is used.
 */
import { PHASES } from './cycle.js'
import { getLocalDateStr } from '../utils/date.js'

// Phase colors — keep in sync with :root vars in src/index.css
export const PHASE_COLORS = {
  [PHASES.MENSTRUAL]: '#E85D75',
  [PHASES.FOLLICULAR]: '#4ECDC4',
  [PHASES.OVULATORY]: '#FFB84D',
  [PHASES.LUTEAL]: '#95C9A6'
}

export const PHASE_CSS_VARS = {
  [PHASES.MENSTRUAL]: 'var(--phase-menstrual)',
  [PHASES.FOLLICULAR]: 'var(--phase-follicular)',
  [PHASES.OVULATORY]: 'var(--phase-ovulatory)',
  [PHASES.LUTEAL]: 'var(--phase-luteal)'
}

export const PHASE_ORDER = [
  PHASES.MENSTRUAL,
  PHASES.FOLLICULAR,
  PHASES.OVULATORY,
  PHASES.LUTEAL
]

export function phaseColor(phase) {
  return PHASE_COLORS[phase] || 'var(--color-primary)'
}

export function phaseCssVar(phase) {
  return PHASE_CSS_VARS[phase] || 'var(--color-primary)'
}

/**
 * Converts a hex color to an rgba() string
 * @param {string} hex - '#RRGGBB'
 * @param {number} alpha - 0..1
 */
export function withAlpha(hex, alpha) {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  if (!m) return hex
  const r = parseInt(m[1], 16)
  const g = parseInt(m[2], 16)
  const b = parseInt(m[3], 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Phase-tinted background for a calendar day
 * @param {string|null} phase
 * @param {number} alpha
 */
export function phaseTint(phase, alpha = 0.12) {
  if (!phase) return 'transparent'
  return withAlpha(PHASE_COLORS[phase], alpha)
}

/**
 * Same anchor math as cycle.js (luteal ~ fixed 14 days, ovulation back-calculated)
 * The "ovulatory phase" is a few days around the estimated ovulation day
 * (day -2 .. day +2), matching the Today screen's own window. Day is 1-based.
 * @param {number} cycleLength
 * @returns {{ ovulationDay: number, fertileStart: number, fertileEnd: number }}
 */
export function getFertileRange(cycleLength) {
  const ovulationDay = cycleLength - 14
  return {
    ovulationDay,
    fertileStart: ovulationDay - 2,
    fertileEnd: ovulationDay + 2
  }
}

/**
 * Predicted cycle start dates: the current cycle plus `numFutureCycles` ahead
 * @param {string|Date} cycleStart
 * @param {number} cycleLength
 * @param {number} numFutureCycles
 * @returns {string[]} YYYY-MM-DD
 */
export function getPredictedCycleStarts(cycleStart, cycleLength, numFutureCycles = 4) {
  if (!cycleStart || !cycleLength) return []
  const base = new Date(cycleStart)
  base.setHours(0, 0, 0, 0)
  const starts = []
  for (let i = 0; i <= numFutureCycles; i++) {
    const d = new Date(base)
    d.setDate(base.getDate() + cycleLength * i)
    starts.push(getLocalDateStr(d))
  }
  return starts
}

/**
 * Phase for an arbitrary date, cycle-aware (wraps within each predicted cycle).
 * Returns null for dates before the current cycleStart: past is reality (period
 * logs), not an estimate — we deliberately don't tint it.
 * @param {string} dateStr - YYYY-MM-DD
 * @param {string|Date} cycleStart
 * @param {number} cycleLength
 * @param {number} periodLength
 * @returns {{ day: number, phase: string }|null}
 */
export function getCalendarCycleInfo(dateStr, cycleStart, cycleLength, periodLength = 5) {
  if (!cycleStart || !cycleLength) return null
  const base = new Date(cycleStart)
  base.setHours(0, 0, 0, 0)
  const date = new Date(dateStr)
  date.setHours(0, 0, 0, 0)
  if (date < base) return null

  const diffDays = Math.round((date - base) / 86400000)
  const day = (diffDays % cycleLength) + 1

  return { day, phase: getPhaseForDayNumber(day, cycleLength, periodLength) }
}

/**
 * Phase for a 1-based day number within a cycle.
 * One clear tint per day: bleeding days are MENSTRUAL, the stretch before the
 * ovulatory phase is FOLLICULAR, the ovulatory phase is a few days around the
 * (estimated) ovulation day, everything after is LUTEAL.
 * @param {number} dayNumber
 * @param {number} cycleLength
 * @param {number} periodLength
 */
export function getPhaseForDayNumber(dayNumber, cycleLength, periodLength = 5) {
  const { fertileStart, fertileEnd } = getFertileRange(cycleLength)
  if (dayNumber <= periodLength) return PHASES.MENSTRUAL
  if (dayNumber >= fertileStart && dayNumber <= fertileEnd) return PHASES.OVULATORY
  if (dayNumber > fertileEnd) return PHASES.LUTEAL
  return PHASES.FOLLICULAR
}

/**
 * Map of ovulation markers for the current + future cycles: a dot on every day
 * of the (few-days) ovulatory phase, so it reads as a span, not a single point.
 * @param {string|Date} cycleStart
 * @param {number} cycleLength
 * @param {number} numFutureCycles
 * @returns {Object<string, { isOvulation: boolean }>}
 */
export function getFertileMarkers(cycleStart, cycleLength, numFutureCycles = 4) {
  const markers = {}
  if (!cycleStart || !cycleLength) return markers

  const { fertileStart, fertileEnd } = getFertileRange(cycleLength)
  const starts = getPredictedCycleStarts(cycleStart, cycleLength, numFutureCycles)

  for (const startStr of starts) {
    const base = new Date(startStr)
    base.setHours(0, 0, 0, 0)
    for (let offset = fertileStart; offset <= fertileEnd; offset++) {
      const d = new Date(base)
      d.setDate(base.getDate() + (offset - 1))
      markers[getLocalDateStr(d)] = { isOvulation: true }
    }
  }
  return markers
}

/**
 * Upcoming milestones for the milestone strip: next period start + next
 * ovulation date (both estimates). Always returns dates today or later.
 * @param {string|Date} cycleStart
 * @param {number} cycleLength
 * @param {string} todayStr - YYYY-MM-DD
 * @returns {{ nextPeriod: string|null, ovulation: string|null }|null}
 */
export function getNextMilestones(cycleStart, cycleLength, todayStr) {
  if (!cycleStart || !cycleLength) return null

  const base = new Date(cycleStart)
  base.setHours(0, 0, 0, 0)
  const today = new Date(todayStr)
  today.setHours(0, 0, 0, 0)

  const { ovulationDay } = getFertileRange(cycleLength)

  const nextPeriod = new Date(base)
  nextPeriod.setDate(base.getDate() + cycleLength)
  while (nextPeriod < today) nextPeriod.setDate(nextPeriod.getDate() + cycleLength)

  const ovulation = new Date(base)
  ovulation.setDate(base.getDate() + (ovulationDay - 1))
  if (ovulation < today) ovulation.setDate(ovulation.getDate() + cycleLength)

  return {
    nextPeriod: getLocalDateStr(nextPeriod),
    ovulation: getLocalDateStr(ovulation)
  }
}

/**
 * Formats a YYYY-MM-DD string as a Date for locales
 */
export function parseDateStr(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}