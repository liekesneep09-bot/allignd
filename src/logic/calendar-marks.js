/** Shared cycle-phase calculations used by the app's calendar views. */
import { PHASES } from './cycle.js'
import { getLocalDateStr } from '../utils/date.js'

// Phase colors use the shared CSS design tokens in src/index.css.
export const PHASE_COLORS = {
  [PHASES.MENSTRUAL]: 'var(--phase-menstrual)',
  [PHASES.FOLLICULAR]: 'var(--phase-follicular)',
  [PHASES.OVULATORY]: 'var(--phase-ovulatory)',
  [PHASES.LUTEAL]: 'var(--phase-luteal)'
}

export const PHASE_CSS_VARS = PHASE_COLORS

export const PHASE_TEXT_COLORS = {
  [PHASES.MENSTRUAL]: 'var(--phase-menstrual-text)',
  [PHASES.FOLLICULAR]: 'var(--phase-follicular-text)',
  [PHASES.OVULATORY]: 'var(--phase-ovulatory-text)',
  [PHASES.LUTEAL]: 'var(--phase-luteal-text)'
}

export const PHASE_SOFT_COLORS = {
  [PHASES.MENSTRUAL]: 'var(--phase-menstrual-soft)',
  [PHASES.FOLLICULAR]: 'var(--phase-follicular-soft)',
  [PHASES.OVULATORY]: 'var(--phase-ovulatory-soft)',
  [PHASES.LUTEAL]: 'var(--phase-luteal-soft)'
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

export function phaseTextColor(phase) {
  return PHASE_TEXT_COLORS[phase] || 'var(--color-primary)'
}

/**
 * Applies alpha to a hex color or CSS custom property.
 * @param {string} color - '#RRGGBB' or 'var(--token)'
 * @param {number} alpha - 0..1
 */
export function withAlpha(color, alpha) {
  if (typeof color !== 'string') return color
  const m = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  if (!m) {
    if (color.startsWith('var(')) {
      return `color-mix(in srgb, ${color} ${Math.round(alpha * 100)}%, transparent)`
    }
    return color
  }
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
 * Returns the estimated day-number span used to label the ovulatory phase.
 * This calculation is only used to categorize cycle phases; it does not
 * calculate or display fertile days or a predicted ovulation date.
 * @param {number} cycleLength
 * @returns {{ start: number, end: number }}
 */
export function getOvulatoryPhaseRange(cycleLength) {
  const estimatedOvulationDay = cycleLength - 14
  return {
    start: estimatedOvulationDay - 2,
    end: estimatedOvulationDay + 2
  }
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
 * Phase for a 1-based day number within a cycle. The ovulatory phase is an
 * approximate phase label based on cycle length, not a fertility indicator.
 * @param {number} dayNumber
 * @param {number} cycleLength
 * @param {number} periodLength
 */
export function getPhaseForDayNumber(dayNumber, cycleLength, periodLength = 5) {
  const { start: ovulatoryStart, end: ovulatoryEnd } = getOvulatoryPhaseRange(cycleLength)
  if (dayNumber <= periodLength) return PHASES.MENSTRUAL
  if (dayNumber >= ovulatoryStart && dayNumber <= ovulatoryEnd) return PHASES.OVULATORY
  if (dayNumber > ovulatoryEnd) return PHASES.LUTEAL
  return PHASES.FOLLICULAR
}

/**
 * Next estimated period start. Always returns a date today or later.
 * @param {string|Date} cycleStart
 * @param {number} cycleLength
 * @param {string} todayStr - YYYY-MM-DD
 * @returns {{ nextPeriod: string|null }|null}
 */
export function getNextPeriodMilestone(cycleStart, cycleLength, todayStr) {
  if (!cycleStart || !cycleLength) return null

  const base = new Date(cycleStart)
  base.setHours(0, 0, 0, 0)
  const today = new Date(todayStr)
  today.setHours(0, 0, 0, 0)

  const nextPeriod = new Date(base)
  nextPeriod.setDate(base.getDate() + cycleLength)
  while (nextPeriod < today) nextPeriod.setDate(nextPeriod.getDate() + cycleLength)

  return {
    nextPeriod: getLocalDateStr(nextPeriod)
  }
}

/**
 * Formats a YYYY-MM-DD string as a Date for locales
 */
export function parseDateStr(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}
