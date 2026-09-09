import { getLocalDateStr } from '../utils/date.js'

function collectActiveDates(user) {
  const dates = new Set()
  const add = (logs) => {
    for (const l of logs || []) {
      if (l && l.date) dates.add(l.date)
    }
  }
  add(user.foodLogs)
  add(user.movementLogs)
  add(user.weightLogs)
  add(user.waterLogs)
  add(user.stepLogs)
  add(user.symptomLogs)
  add(user.menstruationLogs)
  return dates
}

export function getStreak(user, today = new Date()) {
  if (!user) return 0
  const activeDates = collectActiveDates(user)
  if (activeDates.size === 0) return 0

  const cursor = new Date(today)
  cursor.setHours(0, 0, 0, 0)

  if (!activeDates.has(getLocalDateStr(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
  }

  let streak = 0
  while (activeDates.has(getLocalDateStr(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function hasLoggedToday(user, today = new Date()) {
  if (!user) return false
  const todayStr = getLocalDateStr(today)
  const activeDates = collectActiveDates(user)
  return activeDates.has(todayStr)
}