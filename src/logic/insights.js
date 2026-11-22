// Pure helpers for the Insights screen (Inzichten). No React, so they can be unit-tested.

export const PHASE_ORDER = ['menstrual', 'follicular', 'ovulatory', 'luteal']

// Phase ranges as day offsets within one cycle (0-based, end exclusive).
// Same model as the cycle ring on Today: a 14-day luteal phase and a 5-day ovulatory window.
export function getPhaseSegments(cycleLength, periodLength) {
  const lutealLength = 14
  const ovulationCenter = cycleLength - lutealLength
  const ovulatoryStart = ovulationCenter - 2
  const ovulatoryEnd = ovulationCenter + 2
  return [
    { phase: 'menstrual', start: 0, end: periodLength },
    { phase: 'follicular', start: periodLength, end: ovulatoryStart - 1 },
    { phase: 'ovulatory', start: ovulatoryStart - 1, end: ovulatoryEnd },
    { phase: 'luteal', start: ovulatoryEnd, end: cycleLength }
  ]
}

// Phase for a 0-based day offset within a cycle. Days past the cycle length count as luteal.
export function phaseForCycleDay(dayIndex, cycleLength, periodLength) {
  if (dayIndex >= cycleLength) return 'luteal'
  const seg = getPhaseSegments(cycleLength, periodLength).find(s => dayIndex >= s.start && dayIndex < s.end)
  return seg ? seg.phase : 'luteal'
}

function toUtcDay(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return Date.UTC(y, m - 1, d) / 86400000
}

export function daysBetween(fromStr, toStr) {
  return Math.round(toUtcDay(toStr) - toUtcDay(fromStr))
}

// Sorted, unique period start dates (YYYY-MM-DD), including the current cycle start
export function getCycleStarts(periodStartDates = [], cycleStart = null) {
  const all = [...(periodStartDates || [])]
  if (cycleStart) all.push(cycleStart)
  return [...new Set(all.filter(Boolean))].sort()
}

// Lengths of completed cycles, oldest first: [{ start, length }]
export function getCycleLengths(starts) {
  const lengths = []
  for (let i = 1; i < starts.length; i++) {
    lengths.push({ start: starts[i - 1], length: daysBetween(starts[i - 1], starts[i]) })
  }
  return lengths
}

// Phase of any date, based on the cycle it falls in. Returns null before the first known start.
export function phaseForDate(dateStr, starts, defaultCycleLength = 28, periodLength = 5) {
  let idx = -1
  for (let i = 0; i < starts.length; i++) {
    if (starts[i] <= dateStr) idx = i
  }
  if (idx === -1) return null
  const start = starts[idx]
  const next = starts[idx + 1]
  const cycleLength = next ? daysBetween(start, next) : defaultCycleLength
  return phaseForCycleDay(daysBetween(start, dateStr), cycleLength, periodLength)
}

// Average daily kcal and protein per phase, over days that have at least one food log
export function foodByPhase(foodLogs = [], starts, defaultCycleLength = 28, periodLength = 5) {
  const perDay = new Map()
  for (const log of foodLogs) {
    if (!log?.date) continue
    const day = perDay.get(log.date) || { kcal: 0, protein: 0 }
    day.kcal += Number(log.kcal) || 0
    day.protein += Number(log.p ?? log.protein) || 0
    perDay.set(log.date, day)
  }
  const sums = Object.fromEntries(PHASE_ORDER.map(p => [p, { kcal: 0, protein: 0, days: 0 }]))
  for (const [date, day] of perDay) {
    const phase = phaseForDate(date, starts, defaultCycleLength, periodLength)
    if (!phase) continue
    sums[phase].kcal += day.kcal
    sums[phase].protein += day.protein
    sums[phase].days += 1
  }
  return PHASE_ORDER.map(phase => {
    const s = sums[phase]
    return {
      phase,
      days: s.days,
      avgKcal: s.days ? Math.round(s.kcal / s.days) : null,
      avgProtein: s.days ? Math.round(s.protein / s.days) : null
    }
  })
}

// How often each symptom was logged per phase.
// Returns { daysPerPhase, rows: [{ id, total, perPhase: { phase: count } }] } sorted by total.
export function symptomsByPhase(symptomLogs = [], starts, defaultCycleLength = 28, periodLength = 5) {
  const daysPerPhase = Object.fromEntries(PHASE_ORDER.map(p => [p, 0]))
  const counts = new Map()
  for (const log of symptomLogs) {
    if (!log?.date || !log.symptoms?.length) continue
    const phase = phaseForDate(log.date, starts, defaultCycleLength, periodLength)
    if (!phase) continue
    daysPerPhase[phase] += 1
    for (const id of new Set(log.symptoms)) {
      const row = counts.get(id) || { id, total: 0, perPhase: Object.fromEntries(PHASE_ORDER.map(p => [p, 0])) }
      row.total += 1
      row.perPhase[phase] += 1
      counts.set(id, row)
    }
  }
  return { daysPerPhase, rows: [...counts.values()].sort((a, b) => b.total - a.total) }
}

// Symptoms logged in one phase of one cycle: [{ id, days }] sorted by days
export function symptomsInPhaseOfCycle(symptomLogs = [], cycleStartDate, nextStartDate, phase, cycleLength, periodLength) {
  const counts = new Map()
  for (const log of symptomLogs) {
    if (!log?.date || log.date < cycleStartDate) continue
    if (nextStartDate && log.date >= nextStartDate) continue
    if (phaseForCycleDay(daysBetween(cycleStartDate, log.date), cycleLength, periodLength) !== phase) continue
    for (const id of new Set(log.symptoms || [])) counts.set(id, (counts.get(id) || 0) + 1)
  }
  return [...counts.entries()].map(([id, days]) => ({ id, days })).sort((a, b) => b.days - a.days)
}
