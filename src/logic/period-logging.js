const DAY_IN_MS = 24 * 60 * 60 * 1000

function parseIsoDate(dateStr) {
    if (typeof dateStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null

    const date = new Date(`${dateStr}T00:00:00.000Z`)
    return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== dateStr
        ? null
        : date
}

function formatIsoDate(date) {
    return date.toISOString().slice(0, 10)
}

function addDays(dateStr, days) {
    const date = parseIsoDate(dateStr)
    if (!date) return null
    date.setUTCDate(date.getUTCDate() + days)
    return formatIsoDate(date)
}

function throwRangeError(code, message) {
    const error = new RangeError(message)
    error.code = code
    throw error
}

/**
 * Store a user-entered period with an inclusive last bleeding day. The `no`
 * marker is kept on the following day because period lookup treats that date
 * as the first non-bleeding day.
 */
export function createPeriodRangeLogs(existingLogs, startDate, endDate, replaceRange = null) {
    const start = parseIsoDate(startDate)
    const end = parseIsoDate(endDate)
    if (!start || !end) {
        throwRangeError('invalid-date', 'Enter valid period dates.')
    }

    const periodLength = Math.round((end - start) / DAY_IN_MS) + 1
    if (periodLength < 1) {
        throwRangeError('end-before-start', 'The last day cannot be before the first day.')
    }
    if (periodLength > 14) {
        throwRangeError('period-too-long', 'A period cannot be longer than 14 days.')
    }

    const stopDate = addDays(endDate, 1)
    let clearFrom = startDate
    let clearThrough = stopDate

    if (replaceRange) {
        const oldStart = parseIsoDate(replaceRange.startDate)
        const oldEnd = parseIsoDate(replaceRange.endDate)
        if (oldStart && oldEnd) {
            clearFrom = [clearFrom, replaceRange.startDate].sort()[0]
            clearThrough = [clearThrough, addDays(replaceRange.endDate, 1)].sort().at(-1)
        }
    }

    const logs = (existingLogs || []).filter(log => log.date < clearFrom || log.date > clearThrough)
    logs.push(
        { date: startDate, status: 'yes' },
        { date: stopDate, status: 'no' }
    )
    logs.sort((a, b) => a.date.localeCompare(b.date))

    return { logs, periodLength, stopDate }
}

/** Resolve an existing log to an editable inclusive start/end range. */
export function findPeriodRangeForDate(dateStr, logs = [], fallbackLength = 5) {
    if (!parseIsoDate(dateStr)) return null

    const starts = [...new Set(
        logs.filter(log => log.status === 'yes' && log.date <= dateStr).map(log => log.date)
    )].sort()
    if (starts.length === 0) return null

    let startDate = starts.at(-1)
    const precedingStarts = starts.slice(0, -1).reverse()
    for (const previousStart of precedingStarts) {
        if (addDays(previousStart, 1) !== startDate) break
        startDate = previousStart
    }

    const stopDate = logs
        .filter(log => log.status === 'no' && log.date > startDate)
        .map(log => log.date)
        .sort()[0]
    const endDate = stopDate
        ? addDays(stopDate, -1)
        : addDays(startDate, Math.max(1, Math.min(fallbackLength || 5, 14)) - 1)

    return dateStr >= startDate && dateStr <= endDate
        ? { startDate, endDate }
        : null
}
