// Pure helpers for the "Voeding" (food) screen.
// No React, no dates: everything is passed in, so it is easy to test.

/**
 * Rank phase recipes against what the user still has left to eat today.
 * Recipes that fit the remaining calories come first, then protein-rich ones.
 *
 * @param {Array<{ macros: { kcal: number, p: number } }>} meals recipes with a `macros` object
 * @param {{ kcal: number, p: number }} remaining what is still left for today
 * @param {number} count maximum number of suggestions
 * @returns {Array<{ meal: object, fits: boolean, proteinRich: boolean }>}
 */
export function suggestMeals(meals, remaining, count = 4) {
    if (!Array.isArray(meals) || meals.length === 0) return []

    const hasBudget = remaining?.kcal != null && Number.isFinite(Number(remaining.kcal))
    const remainingKcal = hasBudget ? Number(remaining.kcal) : null

    return meals
        .filter(meal => meal && meal.macros)
        .map(meal => ({
            meal,
            fits: hasBudget ? meal.macros.kcal <= remainingKcal : true,
            proteinRich: meal.macros.p >= 20
        }))
        .sort((a, b) => {
            if (a.fits !== b.fits) return a.fits ? -1 : 1
            if (a.proteinRich !== b.proteinRich) return a.proteinRich ? -1 : 1
            return b.meal.macros.p - a.meal.macros.p || a.meal.macros.kcal - b.meal.macros.kcal
        })
        .slice(0, count)
}
