/**
 * numbers.js
 * Helper functions for safe number handling and formatting.
 */

/**
 * Converts any input to a valid number.
 * - Accepts numbers or strings
 * - Replaces comma with dot
 * - Returns 0 if value is undefined, null, empty, NaN, or not finite
 */
export const toNum = (value) => {
    if (value === null || value === undefined || value === '') return 0

    // Handle string inputs with commas
    const normalized = String(value).replace(',', '.')
    const n = Number(normalized)

    return Number.isFinite(n) ? n : 0
}

/**
 * Calculates progress percentage safely.
 * - Never divides by 0 or undefined goals
 * - If goal <= 0, progress = 0
 * - Clamps progress between 0 and 1
 */
export const calculateProgress = (current, goal) => {
    const c = toNum(current)
    const g = toNum(goal)

    if (g <= 0) return 0

    // Calculate ratio and clamp
    return Math.max(0, Math.min(1, c / g))
}

/**
 * Formats a number for display.
 * - Returns "0" if 0 or invalid
 * - Optional decimals
 */
export const formatNum = (value, decimals = 0) => {
    const n = toNum(value)
    return n.toFixed(decimals)
}
