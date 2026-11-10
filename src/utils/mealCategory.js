const CATEGORY_MAP = {
    breakfast: 'breakfast',
    ontbijt: 'breakfast',
    lunch: 'lunch',
    dinner: 'dinner',
    diner: 'dinner',
    snack: 'snack'
};

/** Return the canonical English meal category used by food log views. */
export function normalizeMealCategory(value) {
    if (!value) return null;
    return CATEGORY_MAP[String(value).trim().toLowerCase()] || null;
}
