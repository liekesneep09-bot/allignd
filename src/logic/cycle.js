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

/** Days until the next expected cycle start, including the transition day. */
export function calculateDaysUntilPeriod(currentDay, cycleLength = 28) {
    return Math.max(0, cycleLength - currentDay + 1)
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

    let transitionTo = null;
    const lutealLength = 14;
    const estimatedOvulatoryPhaseCenter = cycleLength - lutealLength;
    const ovulatoryPhaseStart = estimatedOvulatoryPhaseCenter - 2;
    const ovulatoryPhaseEnd = estimatedOvulatoryPhaseCenter + 2;

    // A. Explicit Override or Linear Period
    if (isMenstruatingNow || linearDay <= periodLength) {
        phase = PHASES.MENSTRUAL
        if (linearDay >= periodLength - 1 && !isMenstruatingNow) {
            transitionTo = PHASES.FOLLICULAR;
        }
    }
    // B. Overdue -> Always Luteal (Late)
    else if (overdueDays > 0) {
        phase = PHASES.LUTEAL
        transitionTo = PHASES.MENSTRUAL;
    }
    // C. Normal Cycle Logic (Day 1 to cycleLength)
    else {
        if (linearDay >= ovulatoryPhaseStart && linearDay <= ovulatoryPhaseEnd) {
            phase = PHASES.OVULATORY
            if (linearDay >= ovulatoryPhaseEnd - 1) {
                transitionTo = PHASES.LUTEAL;
            }
        } else if (linearDay > ovulatoryPhaseEnd) {
            phase = PHASES.LUTEAL
            if (linearDay >= cycleLength - 2) {
                transitionTo = PHASES.MENSTRUAL;
            }
        } else {
            phase = PHASES.FOLLICULAR
            if (linearDay >= ovulatoryPhaseStart - 2) {
                transitionTo = PHASES.OVULATORY;
            }
        }
    }

    return {
        phase,
        transitionTo,
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

    // 3. Late Cycle Logic / Overdue
    // If day > cycleLength, we are in "Late Luteal".
    // We do NOT wrap around to Menstruation until user logs it.
    if (day > cycleLength) {
        return PHASES.LUTEAL
    }

    // 5. Normal Phase Logic (within cycleLength)
    // Estimate the ovulatory phase from cycle length. This is a phase label only,
    // not a prediction of ovulation or fertility.
    const lutealLength = 14 // Standard average, can be personalized later
    const estimatedOvulatoryPhaseCenter = cycleLength - lutealLength

    const ovulatoryPhaseStart = estimatedOvulatoryPhaseCenter - 2
    const ovulatoryPhaseEnd = estimatedOvulatoryPhaseCenter + 2

    // Phase Determination
    if (day >= ovulatoryPhaseStart && day <= ovulatoryPhaseEnd) {
        return PHASES.OVULATORY
    }

    if (day > ovulatoryPhaseEnd) {
        return PHASES.LUTEAL
    }

    // Remaining days between menstruation and the ovulatory phase are follicular.
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
            {
                // Mid-point between period end and the estimated ovulatory phase.
                const ovulatoryPhaseStart = cycleLength - 14 - 2
                estimatedDay = Math.floor((periodLength + 1 + ovulatoryPhaseStart) / 2)
            }
            break
        case PHASES.OVULATORY:
            // Center of the estimated ovulatory phase.
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

/**
 * Determines if the current day is in a transition period (last 1-2 days of a phase)
 * @param {number} day 
 * @param {number} cycleLength 
 * @param {number} periodLength 
 * @param {string} currentPhase 
 * @returns {Object|null} { isTransition, nextPhase, daysLeft }
 */
export function getPhaseTransition(day, cycleLength = 28, periodLength = 5, currentPhase) {
    if (!day || day < 1 || day > cycleLength) return null

    const lutealLength = 14
    const estimatedOvulatoryPhaseCenter = cycleLength - lutealLength
    const ovulatoryPhaseStart = estimatedOvulatoryPhaseCenter - 2
    const ovulatoryPhaseEnd = estimatedOvulatoryPhaseCenter + 2

    if (currentPhase === PHASES.MENSTRUAL) {
        const effectivePeriod = periodLength || 5
        if (day >= effectivePeriod - 1 && day <= effectivePeriod) {
            return { isTransition: true, nextPhase: PHASES.FOLLICULAR, daysLeft: effectivePeriod - day }
        }
    } else if (currentPhase === PHASES.FOLLICULAR) {
        if (day >= ovulatoryPhaseStart - 2 && day < ovulatoryPhaseStart) {
            return { isTransition: true, nextPhase: PHASES.OVULATORY, daysLeft: ovulatoryPhaseStart - day }
        }
    } else if (currentPhase === PHASES.OVULATORY) {
        if (day === ovulatoryPhaseEnd) {
            return { isTransition: true, nextPhase: PHASES.LUTEAL, daysLeft: 0 }
        }
    } else if (currentPhase === PHASES.LUTEAL) {
        if (day >= cycleLength - 2 && day <= cycleLength) {
            return { isTransition: true, nextPhase: PHASES.MENSTRUAL, daysLeft: cycleLength - day }
        }
    }

    return null
}
