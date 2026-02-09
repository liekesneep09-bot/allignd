/**
 * Cycle Learning System
 * Personalizes cycle length based on period start date logs
 */

/**
 * Adds a period start date and returns updated data
 * @param {string} date - YYYY-MM-DD format
 * @param {string[]} existingStarts - Array of existing period start dates
 * @returns {{ periodStartDates: string[], newCycleLength: number|null }}
 */
export function addPeriodStart(date, existingStarts = []) {
    // Avoid duplicates
    if (existingStarts.includes(date)) {
        return { periodStartDates: existingStarts, newCycleLength: null }
    }

    // Add and sort chronologically
    const updated = [...existingStarts, date].sort()

    // Calculate cycle length if we have at least 2 starts
    let newCycleLength = null
    if (updated.length >= 2) {
        const lastTwo = updated.slice(-2)
        newCycleLength = daysBetween(lastTwo[0], lastTwo[1])
    }

    return { periodStartDates: updated, newCycleLength }
}

/**
 * Calculates days between two dates
 * @param {string} date1 - YYYY-MM-DD
 * @param {string} date2 - YYYY-MM-DD
 * @returns {number}
 */
export function daysBetween(date1, date2) {
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    d1.setHours(0, 0, 0, 0)
    d2.setHours(0, 0, 0, 0)
    return Math.round((d2 - d1) / (1000 * 60 * 60 * 24))
}

/**
 * Calculates cycle lengths from period start dates
 * @param {string[]} starts - Array of period start dates (sorted)
 * @returns {{ length: number, startDate: string, isOutlier: boolean }[]}
 */
export function calculateCycleLengths(starts) {
    if (starts.length < 2) return []

    const lengths = []
    for (let i = 1; i < starts.length; i++) {
        const length = daysBetween(starts[i - 1], starts[i])
        lengths.push({
            length,
            startDate: starts[i],
            isOutlier: false // Will be set by markOutliers
        })
    }

    return markOutliers(lengths)
}

/**
 * Marks outliers in cycle length history
 * Outliers: <21 days, >45 days, or >10 days from median
 * @param {{ length: number, startDate: string, isOutlier: boolean }[]} lengths
 * @returns {{ length: number, startDate: string, isOutlier: boolean }[]}
 */
export function markOutliers(lengths) {
    if (lengths.length === 0) return lengths

    // Calculate median
    const median = getMedian(lengths.map(l => l.length))

    return lengths.map(item => ({
        ...item,
        isOutlier: item.length < 21 || item.length > 45 || Math.abs(item.length - median) > 10
    }))
}

/**
 * Calculates median of an array of numbers
 * @param {number[]} arr
 * @returns {number}
 */
export function getMedian(arr) {
    if (arr.length === 0) return 0
    const sorted = [...arr].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

/**
 * Gets learned cycle length from history
 * Uses median of last 3-6 non-outlier cycles
 * @param {{ length: number, isOutlier: boolean }[]} history
 * @param {number} fallbackLength - Default cycle length from onboarding
 * @returns {number}
 */
export function getLearnedCycleLength(history, fallbackLength = 28) {
    const validCycles = history.filter(c => !c.isOutlier)

    if (validCycles.length < 1) return fallbackLength

    // Take last 3-6 valid cycles
    const recent = validCycles.slice(-6)
    return Math.round(getMedian(recent.map(c => c.length)))
}

/**
 * Calculates variability (standard deviation) of recent cycles
 * @param {{ length: number, isOutlier: boolean }[]} history
 * @returns {number}
 */
export function calculateVariability(history) {
    const validCycles = history.filter(c => !c.isOutlier)
    if (validCycles.length < 2) return 0

    const recent = validCycles.slice(-6)
    const lengths = recent.map(c => c.length)
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length
    const squaredDiffs = lengths.map(l => Math.pow(l - mean, 2))
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / lengths.length

    return Math.round(Math.sqrt(variance) * 10) / 10 // Round to 1 decimal
}

/**
 * Determines confidence level based on cycle count and variability
 * @param {number} validCycleCount - Number of non-outlier cycles
 * @param {number} variability - Standard deviation
 * @returns {'low' | 'medium' | 'high'}
 */
export function getConfidence(validCycleCount, variability) {
    if (validCycleCount < 2) return 'low'
    if (validCycleCount >= 4 && variability <= 3) return 'high'
    if (validCycleCount >= 2 && variability <= 5) return 'medium'
    return 'low'
}

/**
 * Calculates complete cycle stats from period start dates
 * @param {string[]} periodStartDates - Array of period start dates
 * @param {number} onboardingCycleLength - Fallback from onboarding
 * @returns {{ 
 *   cycleLengthHistory: { length: number, startDate: string, isOutlier: boolean }[],
 *   learnedCycleLength: number,
 *   variability: number,
 *   confidence: 'low' | 'medium' | 'high'
 * }}
 */
export function calculateCycleStats(periodStartDates, onboardingCycleLength = 28) {
    const cycleLengthHistory = calculateCycleLengths(periodStartDates)
    const validCycles = cycleLengthHistory.filter(c => !c.isOutlier)
    const learnedCycleLength = getLearnedCycleLength(cycleLengthHistory, onboardingCycleLength)
    const variability = calculateVariability(cycleLengthHistory)
    const confidence = getConfidence(validCycles.length, variability)

    return {
        cycleLengthHistory,
        learnedCycleLength,
        variability,
        confidence
    }
}

/**
 * Predicts next period start date
 * @param {string[]} periodStartDates - Array of period start dates
 * @param {number} cycleLength - Current cycle length to use
 * @returns {string|null} - YYYY-MM-DD or null if no data
 */
export function predictNextPeriodStart(periodStartDates, cycleLength) {
    if (periodStartDates.length === 0) return null

    const lastStart = periodStartDates[periodStartDates.length - 1]
    const lastDate = new Date(lastStart)
    lastDate.setDate(lastDate.getDate() + cycleLength)

    return lastDate.toISOString().split('T')[0]
}

/**
 * Calculates ovulation window estimate
 * @param {string} nextPeriodStart - YYYY-MM-DD
 * @param {number} lutealLength - Default 14 days
 * @returns {{ start: string, end: string, center: string }}
 */
export function getOvulationWindow(nextPeriodStart, lutealLength = 14) {
    const nextDate = new Date(nextPeriodStart)

    // Ovulation center = next period - luteal length
    const center = new Date(nextDate)
    center.setDate(center.getDate() - lutealLength)

    // Window: center +/- 1 day (3 day window)
    const start = new Date(center)
    start.setDate(start.getDate() - 1)

    const end = new Date(center)
    end.setDate(end.getDate() + 1)

    return {
        start: start.toISOString().split('T')[0],
        center: center.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
    }
}

/**
 * Gets prediction window for next menstruation
 * @param {string[]} periodStartDates - Array of period start dates
 * @param {number} cycleLength - Learned or onboarding cycle length
 * @param {'low' | 'medium' | 'high'} confidence - Prediction confidence
 * @returns {{ start: string, end: string, center: string, windowSize: number } | null}
 */
export function getPredictionWindow(periodStartDates, cycleLength, confidence = 'low') {
    // Need at least cycleStart (from onboarding) or period logs to predict
    if (!cycleLength) return null

    // Get predicted center date
    let centerDate
    if (periodStartDates && periodStartDates.length > 0) {
        const lastStart = periodStartDates[periodStartDates.length - 1]
        centerDate = new Date(lastStart)
        centerDate.setDate(centerDate.getDate() + cycleLength)
    } else {
        return null // No data to predict from
    }

    // Window size based on confidence (5 days = +/- 2, 7 days = +/- 3)
    const halfWindow = confidence === 'low' ? 3 : 2

    const start = new Date(centerDate)
    start.setDate(start.getDate() - halfWindow)

    const end = new Date(centerDate)
    end.setDate(end.getDate() + halfWindow)

    return {
        start: start.toISOString().split('T')[0],
        center: centerDate.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
        windowSize: halfWindow * 2 + 1
    }
}
