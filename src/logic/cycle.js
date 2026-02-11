/**
 * Constants for cycle phases
 * Based on a standard 28-day cycle for MVP
 */
export const PHASES = {
    MENSTRUAL: 'menstrual',
    FOLLICULAR: 'follicular',
    OVULATORY: 'ovulatory',
    LUTEAL: 'luteal',
}

/**
 * Determines the current phase and display analytics
 * @returns {Object} { phase, linearDay, displayDay, overdueDays }
 */
export function getCycleDisplayData(startDate, cycleLength = 28, periodLength = 5, isMenstruatingNow = false, targetDate = new Date()) {
    // 1. Calculate Linear Day
    const linearDay = calculateCycleDay(startDate, cycleLength, targetDate)

    // 2. Calculate Overdue
    const overdueDays = Math.max(0, linearDay - cycleLength)

    // 3. Calculate Display Day (Modulo logic for UI, 1-based)
    // If linearDay = 32, cycle = 28. (31 % 28) + 1 = 4.
    const displayDay = ((linearDay - 1) % cycleLength) + 1

    // 4. Determine Phase (Strict Rules)
    let phase = PHASES.FOLLICULAR // Default fallthrough

    // A. Explicit Override or Linear Period
    if (isMenstruatingNow || linearDay <= periodLength) {
        phase = PHASES.MENSTRUAL
    }
    // B. Overdue -> Always Luteal (Late)
    else if (overdueDays > 0) {
        phase = PHASES.LUTEAL
    }
    // C. Normal Cycle Logic (Day 1 to cycleLength)
    else {
        // Calculate Ovulation Day
        const lutealLength = 14
        const ovulationDay = cycleLength - lutealLength
        const fertileStart = ovulationDay - 5
        const fertileEnd = ovulationDay + 1

        if (linearDay >= fertileStart && linearDay <= fertileEnd) {
            phase = PHASES.OVULATORY
        } else if (linearDay > fertileEnd) {
            phase = PHASES.LUTEAL
        } else {
            phase = PHASES.FOLLICULAR
        }
    }

    return {
        phase,
        linearDay,
        displayDay,
        overdueDays
    }
}

/**
 * Calculates the current day of the cycle (1-based, no auto-reset)
 * @param {Date|string} startDate - The start date of the last period
 * @param {number} cycleLength - Length of cycle in days (default 28) - unused for day count, but kept for signature
 * @param {Date|string} targetDate - Optional date to calculate for (default: today)
 * @returns {number} Current day of cycle (Linear count from start date)
 */
export function calculateCycleDay(startDate, cycleLength = 28, targetDate = new Date()) {
    if (!startDate) return 1

    const start = new Date(startDate)
    const target = new Date(targetDate)

    // Reset hours to compare dates only
    start.setHours(0, 0, 0, 0)
    target.setHours(0, 0, 0, 0)

    const diffTime = target - start
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    // If future date, return 1 (or 0?) - let's stick to 1 for safety
    if (diffDays < 0) return 1

    // STRICT LINEAR COUNT (No Modulo)
    // Day 1 = Start Date.
    // Day 35 = Start Date + 34 days.
    return diffDays + 1
}

/**
 * Determines the current phase based on the cycle day and variable length
 * Uses Luteal Phase Back-calculation (Luteal is approx fixed 14 days, Follicular varies)
 * @param {number} day - Current day of cycle (Linear count)
 * @param {number} cycleLength - Total length of cycle (default 28)
 * @param {number} periodLength - Length of menstruation (default 5)
 * @param {boolean} isMenstruatingNow - User override: currently bleeding
 * @param {boolean} hasValidStartDate - If false, we default to Luteal (pre-menstrual)
 * @returns {string} Phase ID
 */
export function getPhaseForDay(day, cycleLength = 28, periodLength = 5, isMenstruatingNow = false, hasValidStartDate = true) {
    // 0. Priority: User explicitly says they are menstruating
    if (isMenstruatingNow) return PHASES.MENSTRUAL

    // 1. Missing Data Safety: If no start date, assume Luteal (Pre-menstrual / Unknown)
    if (!hasValidStartDate) return PHASES.LUTEAL

    // 2. Standard Logic based on Day
    if (!day || day < 1) return PHASES.FOLLICULAR // Fallback

    // 3. Menstruation Logic (Strict Manual)
    // REMOVED: if (day <= periodLength) return PHASES.MENSTRUAL
    // Rationale: User explicitly requested NO auto-switch to Menstrual.
    // The phase should only be menstrual if isMenstruatingNow is TRUE (handled in step 0).

    // However, if we are in Day 1-5 but NOT menstruating (e.g. just stopped early), 
    // we should be Follicular.

    // So we just skip this check.

    // 4. Late Cycle Logic / Overdue
    // If day > cycleLength, we are in "Late Luteal".
    // We do NOT wrap around to Menstruation until user logs it.
    if (day > cycleLength) {
        return PHASES.LUTEAL
    }

    // 5. Normal Phase Logic (within cycleLength)
    // Calculate Ovulation Day (Estimated)
    // Scientific method: Ovulation is typically 14 days before the END of the cycle.
    const lutealLength = 14 // Standard average, can be personalized later
    const ovulationDay = cycleLength - lutealLength

    // Define Fertile Window (Bio-definition: 5 days before + ovulation day)
    const fertileStart = ovulationDay - 5
    const fertileEnd = ovulationDay + 1 // Ovulation day + 12-24h

    // Phase Determination
    if (day >= fertileStart && day <= fertileEnd) {
        return PHASES.OVULATORY
    }

    if (day > fertileEnd) {
        return PHASES.LUTEAL
    }

    // If not Menstrual (<= periodLength), not Ovulatory, not Luteal...
    // Then it is Follicular (The gap between Period End and Fertile Window)
    return PHASES.FOLLICULAR
}

/**
 * Calculates the predicted next period start date and phase margin
 * @param {Date|string} currentCycleStart 
 * @param {number} cycleLength 
 * @returns {Object} { date: Date, marginIndex: number (days +/-) }
 */
export function getCyclePrediction(currentCycleStart, cycleLength = 28) {
    if (!currentCycleStart) return null

    const start = new Date(currentCycleStart)
    const predicted = new Date(start)
    predicted.setDate(start.getDate() + cycleLength)

    return {
        date: predicted,
        margin: 3 // +/- 3 days margin
    }
}

/**
 * Helper to reverse-calculate the start date if a user says "I am in X phase today"
 * @param {string} targetPhase - The phase the user claims to be in
 * @param {number} cycleLength 
 * @param {number} periodLength 
 * @returns {Date} Estimated start date of the current cycle
 */
export function calculateStartDateFromPhase(targetPhase, cycleLength = 28, periodLength = 5) {
    const today = new Date()
    let estimatedDay = 1

    switch (targetPhase) {
        case PHASES.MENSTRUAL:
            estimatedDay = 1 // Assume first day of period for simplicity
            break
        case PHASES.FOLLICULAR:
            // Mid-point between period end and fertile window
            // If Cycle=28, Period=5. FertileStart=9. Mid = 7.
            const fertileStart = cycleLength - 14 - 5
            estimatedDay = Math.floor((periodLength + 1 + fertileStart) / 2)
            break
        case PHASES.OVULATORY:
            // Day of ovulation (CycleLength - 14)
            estimatedDay = cycleLength - 14
            break
        case PHASES.LUTEAL:
            // Mid-point of Luteal
            // Start=CycleLength-12. End=CycleLength.
            estimatedDay = cycleLength - 6
            break
        default:
            estimatedDay = 1
    }

    // safe guard
    estimatedDay = Math.max(1, Math.min(cycleLength, estimatedDay))

    // If today is Day X, then Start Date was (Today - (X-1) days)
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - (estimatedDay - 1))
    startDate.setHours(0, 0, 0, 0) // normalized

    return startDate
}
