/**
 * storage.js
 * Handles persistent storage for daily logs using localStorage.
 * Key format: "allignd:daylog:<userId>:<YYYY-MM-DD>"
 */

const STORAGE_PREFIX = 'allignd:daylog:user'

// Helper: Ensure we don't write "undefined" into keys if userId is missing
const getSafeUserId = (userId) => {
    if (!userId) return 'guest'
    return userId
}

export const getDayLogKey = (dateStr, userId) => `${STORAGE_PREFIX}:${getSafeUserId(userId)}:${dateStr}`

/**
 * Helper to sanitize a log item
 */
const sanitizeLogItem = (item) => {
    // Required fields check
    if (!item || !item.id || !item.name) return null;

    // Sanitize stats (handle strings with commas)
    const cleanNum = (val) => {
        if (typeof val === 'number') return val
        if (!val) return 0
        const strVal = String(val).replace(',', '.')
        const n = parseFloat(strVal);
        return Number.isFinite(n) && n >= 0 ? n : 0;
    };

    return {
        ...item,
        amount: cleanNum(item.amount),
        kcal: cleanNum(item.kcal),
        protein: cleanNum(item.protein),
        carbs: cleanNum(item.carbs),
        fat: cleanNum(item.fat)
    };
};

/**
 * Loads a daily log from localStorage.
 * Returns default empty structure if not found.
 */
export const loadDayLog = (dateStr, userId) => {
    const key = getDayLogKey(dateStr, userId)
    const saved = localStorage.getItem(key)

    if (saved) {
        try {
            const data = JSON.parse(saved)
            // Validate & Clean Items
            const validItems = (data.items || [])
                .map(sanitizeLogItem)
                .filter(Boolean); // Remove nulls

            return {
                ...data,
                items: validItems
            }
        } catch (e) {
            console.error("Corrupt day log, resetting", e)
        }
    }

    // Default Empty Structure
    return {
        date: dateStr,
        items: [],
        movement: { status: null, updatedAt: null },
        menstruation: { status: null, updatedAt: null }
    }
}

/**
 * Saves a daily log to localStorage.
 */
export const saveDayLog = (dateStr, data, userId) => {
    const key = getDayLogKey(dateStr, userId)
    localStorage.setItem(key, JSON.stringify(data))
}

/**
 * Scans all daily logs to build index of movement and menstruation.
 * Useful for calendar population on app start.
 */
export const scanDayLogs = (userId) => {
    const movementLogs = []
    const foodLogs = []
    const menstruationLogs = []

    const safeUserId = getSafeUserId(userId)
    const userPrefix = `${STORAGE_PREFIX}:${safeUserId}:`

    // Iterate all keys in localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        // Check for our prefix AND user
        if (key.startsWith(userPrefix)) {
            const date = key.replace(userPrefix, '')
            try {
                const data = JSON.parse(localStorage.getItem(key))

                // Movement
                if (data.movement && data.movement.status) {
                    movementLogs.push({ date, status: data.movement.status })
                }

                // Menstruation
                if (data.menstruation && data.menstruation.status) {
                    menstruationLogs.push({ date, status: data.menstruation.status })
                }

                // Food
                if (data.items && Array.isArray(data.items)) {
                    data.items.forEach(item => {
                        const clean = sanitizeLogItem(item);
                        if (clean) {
                            // Map storage format back to internal format if needed
                            foodLogs.push({
                                id: clean.id,
                                date: date,
                                foodId: 'custom', // or unknown
                                name: clean.name,
                                grams: clean.amount,
                                kcal: clean.kcal,
                                p: clean.protein,
                                c: clean.carbs,
                                f: clean.fat
                            })
                        }
                    })
                }
            } catch (e) { console.warn("Skipping corrupt key", key) }
        }
    }

    return { movementLogs, foodLogs, menstruationLogs }
}


// --- PROFILE STORAGE ---
const PROFILE_KEY = 'allignd:profile:user'

export const getProfileKey = (userId) => `${PROFILE_KEY}:${getSafeUserId(userId)}`

export const loadUserProfile = (userId) => {
    try {
        const key = getProfileKey(userId)
        const raw = localStorage.getItem(key)
        if (raw) return JSON.parse(raw)
    } catch (e) { console.error("Failed to load profile", e) }
    return null
}

export const saveUserProfile = (profileData, userId) => {
    try {
        const key = getProfileKey(userId)
        localStorage.setItem(key, JSON.stringify(profileData))
    } catch (e) { console.error("Failed to save profile", e) }
}

// --- CUSTOM FOODS STORAGE ---
const FOODS_KEY = 'allignd:foods:user'

export const getFoodsKey = (userId) => `${FOODS_KEY}:${getSafeUserId(userId)}`

export const loadCustomFoods = (userId) => {
    try {
        const key = getFoodsKey(userId)
        const raw = localStorage.getItem(key)
        if (raw) return JSON.parse(raw)
    } catch (e) { console.error("Failed to load custom foods", e) }
    return []
}

export const saveCustomFoods = (foods, userId) => {
    try {
        const key = getFoodsKey(userId)
        localStorage.setItem(key, JSON.stringify(foods))
    } catch (e) { console.error("Failed to save custom foods", e) }
}
