/**
 * Food Configuration with Variants
 * 
 * Each food item has:
 * - id: unique identifier
 * - name_nl: display name
 * - baseMacros: base nutritional values
 * - baseUnit: what the baseMacros represent (e.g., "per 1 medium wrap", "per 100g")
 * - variants: optional modifiers (type, size, preparation)
 * 
 * Modifiers use multipliers:
 * - macroMultiplier: applies to all macros
 * - specific multipliers: kcalMultiplier, proteinMultiplier, carbsMultiplier, fatMultiplier, fiberMultiplier
 */

export const FOOD_CONFIG = [
    // --- WRAPS ---
    {
        id: 'wrap',
        name_nl: 'Wrap',
        baseMacros: {
            kcal: 160,
            protein: 5,
            carbs: 25,
            fat: 4,
            fiber: 3
        },
        baseUnit: '1 medium wrap',
        variants: {
            type: {
                label: 'Soort',
                options: [
                    { id: 'naturel', label: 'Naturel', modifiers: {} },
                    { id: 'volkoren', label: 'Volkoren', modifiers: { fiberMultiplier: 1.2, carbsMultiplier: 0.95 } },
                    { id: 'wortel', label: 'Wortel', modifiers: { carbsMultiplier: 1.1, fiberMultiplier: 0.9 } },
                    { id: 'spinazie', label: 'Spinazie', modifiers: { fiberMultiplier: 1.1 } },
                    { id: 'mais', label: 'Maïs', modifiers: { carbsMultiplier: 1.05 } }
                ],
                default: 'naturel'
            },
            size: {
                label: 'Formaat',
                options: [
                    { id: 'klein', label: 'Klein', modifiers: { macroMultiplier: 0.7 } },
                    { id: 'medium', label: 'Medium', modifiers: {} },
                    { id: 'groot', label: 'Groot', modifiers: { macroMultiplier: 1.3 } }
                ],
                default: 'medium'
            }
        }
    },

    // --- GROENTEN (Generic with preparation) ---
    {
        id: 'groenten_algemeen',
        name_nl: 'Groenten (algemeen)',
        baseMacros: {
            kcal: 25,
            protein: 2,
            carbs: 4,
            fat: 0,
            fiber: 2
        },
        baseUnit: '100g',
        variants: {
            preparation: {
                label: 'Bereiding',
                options: [
                    { id: 'rauw', label: 'Rauw', modifiers: {} },
                    { id: 'gekookt', label: 'Gekookt', modifiers: { fiberMultiplier: 0.9 } },
                    { id: 'gebakken', label: 'Gebakken (met olie)', modifiers: { kcalMultiplier: 1.3, fatMultiplier: 3 } },
                    { id: 'geroosterd', label: 'Geroosterd', modifiers: { kcalMultiplier: 1.15, fatMultiplier: 1.5 } }
                ],
                default: 'rauw'
            }
        }
    },

    // --- EI ---
    {
        id: 'ei',
        name_nl: 'Ei',
        baseMacros: {
            kcal: 78,
            protein: 6.5,
            carbs: 0.6,
            fat: 5.5,
            fiber: 0
        },
        baseUnit: '1 ei (medium)',
        variants: {
            size: {
                label: 'Formaat',
                options: [
                    { id: 'klein', label: 'Klein (S)', modifiers: { macroMultiplier: 0.8 } },
                    { id: 'medium', label: 'Medium (M)', modifiers: {} },
                    { id: 'groot', label: 'Groot (L)', modifiers: { macroMultiplier: 1.15 } },
                    { id: 'xl', label: 'Extra Groot (XL)', modifiers: { macroMultiplier: 1.3 } }
                ],
                default: 'medium'
            },
            preparation: {
                label: 'Bereiding',
                options: [
                    { id: 'gekookt', label: 'Gekookt', modifiers: {} },
                    { id: 'gebakken', label: 'Gebakken (met boter)', modifiers: { kcalMultiplier: 1.25, fatMultiplier: 1.5 } },
                    { id: 'roerei', label: 'Roerei', modifiers: { kcalMultiplier: 1.2, fatMultiplier: 1.4 } },
                    { id: 'omelet', label: 'Omelet', modifiers: { kcalMultiplier: 1.15, fatMultiplier: 1.3 } }
                ],
                default: 'gekookt'
            }
        }
    },

    // --- RIJST ---
    {
        id: 'rijst',
        name_nl: 'Rijst (bereid)',
        baseMacros: {
            kcal: 130,
            protein: 2.7,
            carbs: 28,
            fat: 0.3,
            fiber: 0.4
        },
        baseUnit: '100g (bereid)',
        variants: {
            type: {
                label: 'Soort',
                options: [
                    { id: 'wit', label: 'Wit', modifiers: {} },
                    { id: 'zilvervlies', label: 'Zilvervlies', modifiers: { kcalMultiplier: 0.86, fiberMultiplier: 3, carbsMultiplier: 0.82 } },
                    { id: 'basmati', label: 'Basmati', modifiers: { carbsMultiplier: 0.95 } },
                    { id: 'jasmine', label: 'Jasmine', modifiers: {} }
                ],
                default: 'wit'
            }
        }
    },

    // --- KIP ---
    {
        id: 'kipfilet',
        name_nl: 'Kipfilet',
        baseMacros: {
            kcal: 110,
            protein: 23,
            carbs: 0,
            fat: 2,
            fiber: 0
        },
        baseUnit: '100g (rauw)',
        variants: {
            preparation: {
                label: 'Bereiding',
                options: [
                    { id: 'rauw', label: 'Rauw', modifiers: {} },
                    { id: 'gekookt', label: 'Gekookt', modifiers: { kcalMultiplier: 1.1, proteinMultiplier: 1.15 } },
                    { id: 'gebakken', label: 'Gebakken', modifiers: { kcalMultiplier: 1.5, fatMultiplier: 2, proteinMultiplier: 1.35 } },
                    { id: 'gegrild', label: 'Gegrild', modifiers: { kcalMultiplier: 1.2, proteinMultiplier: 1.25 } }
                ],
                default: 'gebakken'
            }
        }
    },

    // --- PASTA ---
    {
        id: 'pasta',
        name_nl: 'Pasta (bereid)',
        baseMacros: {
            kcal: 158,
            protein: 5.8,
            carbs: 31,
            fat: 0.9,
            fiber: 1.8
        },
        baseUnit: '100g (bereid)',
        variants: {
            type: {
                label: 'Soort',
                options: [
                    { id: 'wit', label: 'Wit', modifiers: {} },
                    { id: 'volkoren', label: 'Volkoren', modifiers: { kcalMultiplier: 0.78, fiberMultiplier: 2.5, carbsMultiplier: 0.8 } },
                    { id: 'linzen', label: 'Linzenpasta', modifiers: { proteinMultiplier: 1.8, fiberMultiplier: 3, carbsMultiplier: 0.65 } }
                ],
                default: 'wit'
            }
        }
    },

    // --- BROOD ---
    {
        id: 'brood',
        name_nl: 'Brood',
        baseMacros: {
            kcal: 75,
            protein: 3,
            carbs: 13,
            fat: 1,
            fiber: 1
        },
        baseUnit: '1 snee',
        variants: {
            type: {
                label: 'Soort',
                options: [
                    { id: 'wit', label: 'Wit', modifiers: {} },
                    { id: 'volkoren', label: 'Volkoren', modifiers: { fiberMultiplier: 3, proteinMultiplier: 1.2 } },
                    { id: 'spelt', label: 'Spelt', modifiers: { fiberMultiplier: 2.5, proteinMultiplier: 1.1 } },
                    { id: 'rogge', label: 'Rogge', modifiers: { fiberMultiplier: 3.5, carbsMultiplier: 0.9 } }
                ],
                default: 'volkoren'
            },
            thickness: {
                label: 'Dikte',
                options: [
                    { id: 'dun', label: 'Dun gesneden', modifiers: { macroMultiplier: 0.75 } },
                    { id: 'normaal', label: 'Normaal', modifiers: {} },
                    { id: 'dik', label: 'Dik gesneden', modifiers: { macroMultiplier: 1.25 } }
                ],
                default: 'normaal'
            }
        }
    }
]

/**
 * Calculate final macros based on selected variants
 */
export function calculateMacros(foodId, selectedVariants = {}) {
    const food = FOOD_CONFIG.find(f => f.id === foodId)
    if (!food) return null

    // Start with base macros (copy)
    const result = { ...food.baseMacros }

    // Apply variant modifiers in order
    if (food.variants) {
        for (const [variantType, variantConfig] of Object.entries(food.variants)) {
            const selectedId = selectedVariants[variantType] || variantConfig.default
            const selectedOption = variantConfig.options.find(o => o.id === selectedId)

            if (selectedOption?.modifiers) {
                const mods = selectedOption.modifiers

                // Apply global multiplier first
                if (mods.macroMultiplier) {
                    result.kcal *= mods.macroMultiplier
                    result.protein *= mods.macroMultiplier
                    result.carbs *= mods.macroMultiplier
                    result.fat *= mods.macroMultiplier
                    result.fiber *= mods.macroMultiplier
                }

                // Apply specific multipliers
                if (mods.kcalMultiplier) result.kcal *= mods.kcalMultiplier
                if (mods.proteinMultiplier) result.protein *= mods.proteinMultiplier
                if (mods.carbsMultiplier) result.carbs *= mods.carbsMultiplier
                if (mods.fatMultiplier) result.fat *= mods.fatMultiplier
                if (mods.fiberMultiplier) result.fiber *= mods.fiberMultiplier
            }
        }
    }

    // Round to sensible values
    return {
        kcal: Math.round(result.kcal),
        protein: Math.round(result.protein * 10) / 10,
        carbs: Math.round(result.carbs * 10) / 10,
        fat: Math.round(result.fat * 10) / 10,
        fiber: Math.round(result.fiber * 10) / 10
    }
}

/**
 * Build a description string from selected variants
 */
export function buildFoodDescription(foodId, selectedVariants = {}) {
    const food = FOOD_CONFIG.find(f => f.id === foodId)
    if (!food) return ''

    const parts = []

    if (food.variants) {
        // Add size/thickness first if present
        if (selectedVariants.size) {
            const sizeOpt = food.variants.size?.options.find(o => o.id === selectedVariants.size)
            if (sizeOpt && sizeOpt.id !== food.variants.size?.default) {
                parts.push(sizeOpt.label.toLowerCase())
            }
        }
        if (selectedVariants.thickness) {
            const thicknessOpt = food.variants.thickness?.options.find(o => o.id === selectedVariants.thickness)
            if (thicknessOpt && thicknessOpt.id !== food.variants.thickness?.default) {
                parts.push(thicknessOpt.label.toLowerCase())
            }
        }

        // Add type
        if (selectedVariants.type) {
            const typeOpt = food.variants.type?.options.find(o => o.id === selectedVariants.type)
            if (typeOpt) {
                parts.push(typeOpt.label.toLowerCase())
            }
        }
    }

    // Add food name
    parts.push(food.name_nl.toLowerCase())

    // Add preparation last
    if (selectedVariants.preparation) {
        const prepOpt = food.variants?.preparation?.options.find(o => o.id === selectedVariants.preparation)
        if (prepOpt && prepOpt.id !== food.variants?.preparation?.default) {
            parts.push(`(${prepOpt.label.toLowerCase()})`)
        }
    }

    // Capitalize first letter
    const result = parts.join(' ')
    return result.charAt(0).toUpperCase() + result.slice(1)
}
