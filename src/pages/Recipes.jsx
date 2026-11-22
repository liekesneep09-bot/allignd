import React, { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useUser } from '../context/UserContext'
import { useLanguage } from '../context/LanguageContext'
import { getRecipeContent } from '../data/recipeContent'
import { getPhaseContent } from '../data/phases'
import { suggestMeals } from '../logic/foodSuggestions'
import { toNum, calculateProgress } from '../utils/numbers'
import FoodModal from '../components/FoodModal'
import { IconPlus } from '../components/Icons'
import { getLocalDateStr } from '../utils/date'

// Same ring as the food card on Vandaag (kept in sync by hand)
function CircularProgress({ current, target, size, strokeWidth, color = 'var(--color-calories)', trackColor = 'var(--color-border)', showText = false }) {
    const safeCurrent = toNum(current)
    const safeTarget = toNum(target)
    const radius = size / 2
    const normalizedRadius = (size - strokeWidth) / 2
    const circumference = normalizedRadius * 2 * Math.PI
    const progressFn = calculateProgress(safeCurrent, safeTarget)
    const percentage = Math.round(progressFn * 100)
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
        <div style={{ position: 'relative', width: size, height: size }}>
            <svg height={size} width={size}>
                <circle stroke={trackColor} strokeWidth={strokeWidth} fill="transparent" r={normalizedRadius} cx={radius} cy={radius} />
                <circle
                    className="progress-ring-circle"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    transform={`rotate(-90 ${radius} ${radius})`}
                    style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                />
            </svg>
            {showText && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--font-size-base)', fontWeight: '700', color: 'var(--color-text)' }}>
                    {percentage}%
                </div>
            )}
        </div>
    )
}

// Same macro row as on Vandaag (kept in sync by hand)
function MacroListItem({ label, current, target, color }) {
    const safeCurrent = toNum(current)
    const safeTarget = toNum(target)
    const progressFn = calculateProgress(safeCurrent, safeTarget)
    const percentage = Math.round(progressFn * 100)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{label}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-text)' }}>
                    {Math.round(safeCurrent)} / {target} g
                </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text)', minWidth: '35px' }}>
                    {percentage}%
                </span>
                <div style={{ flex: 1, height: '6px', background: 'var(--color-bg)', borderRadius: 'var(--radius-xs)', overflow: 'hidden' }}>
                    <div style={{ width: `${percentage}%`, height: '100%', background: color, borderRadius: 'var(--radius-xs)', transition: 'width 0.3s ease-out' }} />
                </div>
            </div>
        </div>
    )
}

// Nutrient icons in the same stroke style as the check-in icons, keyed by nutrient.icon
const NUTRIENT_ICONS = {
    Fe: 'M12 3C9 7 7 10 7 13a5 5 0 0 0 10 0c0-3-2-6-5-10z', // ijzer: druppel
    C: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 12V3 M12 12l7.8 4.5 M12 12l-7.8 4.5', // vitamine C: citrus
    Mg: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z', // magnesium: maan (rust)
    O3: 'M3 12c3-4 9-4 12 0-3 4-9 4-12 0z M15 12l4-3v6z M6.5 11h.01', // omega-3: vis
    B: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M12 2v2 M12 20v2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M2 12h2 M20 12h2 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4', // B-vitamines: zon (energie)
    Zn: 'M12 3l7 3v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6z', // zink: schild (weerstand)
    P: 'M12 3c3 0 6 4.5 6 9a6 6 0 0 1-12 0c0-4.5 3-9 6-9z', // eiwitten: ei
    AO: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z', // antioxidanten: sterretje
    VZ: 'M12 3v18 M12 8c-2.5 0-4-1.8-4-4 2.5 0 4 1.8 4 4z M12 8c2.5 0 4-1.8 4-4-2.5 0-4 1.8-4 4z M12 14c-2.5 0-4-1.8-4-4 2.5 0 4 1.8 4 4z M12 14c2.5 0 4-1.8 4-4-2.5 0-4 1.8-4 4z', // vezels: graan
    B6: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M8.5 14s1.3 2 3.5 2 3.5-2 3.5-2 M9 9.5h.01 M15 9.5h.01', // vitamine B6: lach (stemming)
    KH: 'M6 8a6 3.5 0 0 1 12 0c0 1-.5 1.8-1 2.4V18a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 18v-7.6C6.5 9.8 6 9 6 8z' // complexe koolhydraten: brood
}

function NutrientIcon({ iconKey, color, size = 22 }) {
    const path = NUTRIENT_ICONS[iconKey]
    if (!path) return <span style={{ fontSize: '0.72rem', fontWeight: '700', color, textTransform: 'uppercase' }}>{iconKey}</span>
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={path} />
        </svg>
    )
}

// Meal-category icons in the same stroke style as the check-in icons
const CATEGORY_ICONS = {
    ontbijt: 'M4 12h16c0 4.4-3.6 8-8 8s-8-3.6-8-8z M9 3.5v3 M13 3.5v3',
    lunch: 'M5 7.5h14 M4 12h16 M5 16.5h14',
    diner: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z',
    snack: 'M12 8c-3-3-8-1-8 4 0 4.5 3.5 8 5.5 8 1 0 1.5-.5 2.5-.5s1.5.5 2.5.5c2 0 5.5-3.5 5.5-8 0-5-5-7-8-4z M12 8c0-2.5 1-4 3-4.5'
}

function CategoryIcon({ category, size = 22 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#333333" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={CATEGORY_ICONS[category] || CATEGORY_ICONS.diner} />
        </svg>
    )
}

const categoryMap = {
    ontbijt: 'breakfast',
    lunch: 'lunch',
    diner: 'dinner',
    snack: 'snack'
}

export default function Recipes() {
    const { user, currentPhase, logFood, getStatsForDate } = useUser()
    const { language, t } = useLanguage()
    const [selectedRecipe, setSelectedRecipe] = useState(null) // { ...meal, category }
    const [selectedCategory, setSelectedCategory] = useState('ontbijt')
    const [isConfirming, setIsConfirming] = useState(false)
    const [addedSuccess, setAddedSuccess] = useState(false)
    const [showFoodModal, setShowFoodModal] = useState(false)

    const todayStr = getLocalDateStr(new Date())
    const recipeContent = useMemo(() => getRecipeContent(language, user?.dietary_preference), [language, user?.dietary_preference])
    const phaseRecipes = recipeContent[currentPhase] || recipeContent.luteal
    const phaseInfo = getPhaseContent(language, currentPhase, user?.dietary_preference)
    const phaseName = phaseInfo?.name || ''
    const nutrients = phaseInfo?.nutrients || []
    const phaseAccent = `var(--phase-${currentPhase}-text, var(--color-primary))`
    const phaseSoft = `rgba(var(--phase-${currentPhase}-rgb, 255,92,138), 0.10)`

    const categories = [
        { id: 'ontbijt', label: t('meal_editor.breakfast') },
        { id: 'lunch', label: t('meal_editor.lunch') },
        { id: 'diner', label: t('meal_editor.dinner') },
        { id: 'snack', label: t('meal_editor.snack') }
    ]

    const targets = user.macroTargets || null
    const stats = getStatsForDate ? getStatsForDate(todayStr) : { kcal: 0, p: 0, c: 0, f: 0, fiber: 0 }
    const remainingKcal = targets ? Math.max(0, Math.round(toNum(targets.calories) - toNum(stats.kcal))) : null
    const remainingProtein = targets ? Math.max(0, Math.round(toNum(targets.proteinMin) - toNum(stats.p))) : null

    const allMeals = useMemo(() => {
        if (!phaseRecipes?.meals) return []
        return ['ontbijt', 'lunch', 'diner', 'snack'].flatMap(catId =>
            (phaseRecipes.meals[catId] || []).map(meal => ({ ...meal, category: catId }))
        )
    }, [phaseRecipes])
    const suggestions = useMemo(
        () => suggestMeals(allMeals, { kcal: remainingKcal, p: remainingProtein }, 4),
        [allMeals, remainingKcal, remainingProtein]
    )

    const handleLogRecipe = async (recipe) => {
        try {
            await logFood(`recipe-${recipe.title}`, null, {
                foodName: recipe.title,
                configId: `recipe-${recipe.title}`,
                quantity: 1,
                selectedVariants: null,
                meal_category: categoryMap[recipe.category] || null,
                calculatedMacros: {
                    kcal: recipe.macros.kcal,
                    protein: recipe.macros.p,
                    carbs: recipe.macros.c,
                    fat: recipe.macros.f,
                    fiber: recipe.macros.fiber || 0
                }
            })
            setAddedSuccess(true)
            setTimeout(() => {
                setAddedSuccess(false)
                setIsConfirming(false)
                setSelectedRecipe(null)
                window.scrollTo(0, 0)
            }, 2000)
        } catch (error) {
            console.error('Error logging recipe:', error)
        }
    }

    const openRecipe = (meal, category) => {
        setSelectedRecipe({ ...meal, category })
        window.scrollTo(0, 0)
    }

    const mealRow = (meal, category, idx, reason) => (
        <div
            key={`${meal.title}-${idx}`}
            onClick={() => openRecipe(meal, category)}
            style={{
                padding: '0.8rem 1rem',
                borderTop: idx === 0 ? 'none' : '1px solid var(--color-border-light)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                cursor: 'pointer'
            }}
        >
            <span style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-full)',
                background: '#FDEBF0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
            }}>
                <CategoryIcon category={category} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: '500', fontSize: '0.9rem', color: 'var(--color-text)' }}>{meal.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    {meal.macros.kcal} kcal · {meal.macros.p} g {t('recipes.protein').toLowerCase()}
                    {reason && <span style={{ color: 'var(--color-primary)', fontWeight: '600' }}> · {reason}</span>}
                </div>
            </div>
            <div style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}>›</div>
        </div>
    )

    // --- RECIPE DETAIL ---
    if (selectedRecipe) {
        const macroTiles = [
            { label: 'kcal', value: selectedRecipe.macros.kcal, unit: '' },
            { label: t('recipes.protein'), value: selectedRecipe.macros.p, unit: 'g' },
            { label: t('recipes.carbs'), value: selectedRecipe.macros.c, unit: 'g' },
            { label: t('recipes.fat'), value: selectedRecipe.macros.f, unit: 'g' }
        ]

        return (
            <div className="container" style={{ paddingBottom: '100px' }}>
                <header style={{ marginBottom: '1.25rem' }}>
                    <button
                        onClick={() => { setSelectedRecipe(null); window.scrollTo(0, 0) }}
                        style={{ background: 'none', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', fontSize: '0.9rem', padding: 0, marginBottom: '1rem' }}
                    >
                        ← {t('fitness.back_to_overview')}
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <span style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: 'var(--radius-full)',
                            background: '#FDEBF0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <CategoryIcon category={selectedRecipe.category} size={26} />
                        </span>
                        <h1 style={{ fontSize: '1.3rem', fontWeight: '700', margin: 0, lineHeight: 1.25 }}>{selectedRecipe.title}</h1>
                    </div>
                </header>

                <div className="card" style={{ marginBottom: '1.25rem', borderLeft: `3px solid ${phaseAccent}` }}>
                    <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--color-text)', lineHeight: 1.55 }}>
                        {selectedRecipe.explanation}
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem', marginBottom: '0.4rem' }}>
                    {macroTiles.map(tile => (
                        <div key={tile.label} className="card" style={{ padding: '0.7rem 0.9rem', margin: 0 }}>
                            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '0.15rem' }}>{tile.label}</div>
                            <div style={{ fontWeight: '700', color: 'var(--color-text)', fontSize: '1.05rem' }}>{tile.value}{tile.unit}</div>
                        </div>
                    ))}
                </div>
                <p style={{ margin: '0 0 1.5rem 0.2rem', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    {t('recipes.fiber')}: {selectedRecipe.macros.fiber} g
                </p>

                <section style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.6rem' }}>{t('recipes.ingredients')}</h2>
                    <div className="card" style={{ margin: 0 }}>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                            {selectedRecipe.ingredients.map((ing, i) => (
                                <li key={i} style={{ fontSize: '0.92rem', lineHeight: 1.45 }}>{ing}</li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.6rem' }}>{t('recipes.instructions')}</h2>
                    <div className="card" style={{ margin: 0 }}>
                        <ol style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                            {selectedRecipe.instructions.map((step, i) => (
                                <li key={i} style={{ fontSize: '0.92rem', lineHeight: 1.55 }}>{step}</li>
                            ))}
                        </ol>
                    </div>
                </section>

                <button
                    onClick={() => setIsConfirming(true)}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                    <IconPlus size={20} />
                    {t('recipes.add_to_daily_goal')} ({selectedRecipe.macros.kcal} kcal)
                </button>

                {isConfirming && createPortal(
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', zIndex: 2000 }}>
                        <div className="card" style={{ width: '100%', maxWidth: '400px', margin: 0, textAlign: 'center' }}>
                            {addedSuccess ? (
                                <div style={{ padding: '2rem 0' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>&#10003;</div>
                                    <h2 style={{ margin: 0 }}>{t('recipes.added_success')}</h2>
                                </div>
                            ) : (
                                <>
                                    <h2 style={{ marginTop: 0 }}>{t('recipes.confirm_title')}</h2>
                                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                                        {t('recipes.confirm_desc').replace('{title}', selectedRecipe.title)}
                                    </p>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button onClick={() => setIsConfirming(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--color-surface-hover)', border: '1px solid var(--color-border)' }}>
                                            {t('recipes.cancel')}
                                        </button>
                                        <button onClick={() => handleLogRecipe(selectedRecipe)} className="btn btn-primary" style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                                            {t('recipes.confirm_add')}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        )
    }

    // --- OVERVIEW ---
    return (
        <div className="container" style={{ paddingBottom: '100px', paddingTop: '1rem' }}>
            <header style={{ marginBottom: '1.25rem' }}>
                <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, margin: '0 0 0.35rem' }}>{t('recipes.title')}</h1>
                <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                    {t('recipes.subtitle')}
                </p>
            </header>

            {/* Same daily-goal card as Vandaag */}
            {targets && (
                <section className="card" style={{ marginBottom: '1rem', padding: 'var(--space-5)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                        <div>
                            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)' }}>
                                {t('today.daily_goal')}
                            </div>
                            <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: '800', color: 'var(--color-text)', lineHeight: 1 }}>
                                {Math.round(toNum(stats.kcal))} <span style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)', fontWeight: '500' }}>/ {toNum(targets.calories)} kcal</span>
                            </div>
                            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-calories)', marginTop: 'var(--space-1)' }}>
                                {remainingKcal} kcal {t('today.remaining')}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowFoodModal(true)}
                            aria-label={t('today.add_food')}
                            style={{ position: 'relative', flexShrink: 0, width: '100px', height: '100px', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                        >
                            <CircularProgress current={toNum(stats.kcal)} target={toNum(targets.calories)} size={100} strokeWidth={8} color="var(--color-calories)" trackColor="rgba(0,0,0,0.05)" showText={true} />
                            <span
                                aria-hidden="true"
                                style={{
                                    position: 'absolute',
                                    bottom: '-2px',
                                    right: '-2px',
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: 'var(--radius-full)',
                                    backgroundColor: 'var(--color-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 2px 6px rgba(255, 174, 185, 0.4)',
                                    border: '2px solid #ffffff',
                                    color: '#ffffff',
                                    fontSize: '1.15rem',
                                    fontWeight: '700',
                                    lineHeight: 1
                                }}
                            >
                                +
                            </span>
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                        <MacroListItem label={t('today.proteins')} current={toNum(stats.p)} target={toNum(targets.proteinMin)} color="var(--color-text-secondary)" />
                        <MacroListItem label={t('today.carbs')} current={toNum(stats.c)} target={toNum(targets.carbsMin)} color="var(--color-text-secondary)" />
                        <MacroListItem label={t('today.fats')} current={toNum(stats.f)} target={toNum(targets.fatMin)} color="var(--color-text-secondary)" />
                        <MacroListItem label={t('today.fiber')} current={toNum(stats.fiber)} target={25} color="var(--color-text-secondary)" />
                    </div>
                </section>
            )}

            {/* Phase card — what helps now */}
            {nutrients.length > 0 && (
                <section className="card" style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.3rem' }}>
                        <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', background: phaseAccent }} />
                        <span style={{ color: phaseAccent, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            {phaseName}
                        </span>
                    </div>
                    {phaseRecipes.description && (
                        <p style={{ margin: '0 0 0.9rem', fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                            {phaseRecipes.description}
                        </p>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {nutrients.map((nutrient, i) => (
                            <div key={i} style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start', padding: '0.7rem 0', borderTop: i === 0 ? 'none' : '1px solid var(--color-border-light)' }}>
                                <span style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: 'var(--radius-full)',
                                    background: phaseSoft,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <NutrientIcon iconKey={nutrient.icon} color={phaseAccent} />
                                </span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--color-text)' }}>{nutrient.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.45, marginTop: '1px' }}>{nutrient.description}</div>
                                    {nutrient.sources?.length > 0 && (
                                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                            {nutrient.sources.map((s, j) => (
                                                <span key={j} style={j === 0 ? { color: 'var(--color-primary)', fontWeight: '600' } : undefined}>
                                                    {j > 0 && <span style={{ color: 'var(--color-text-muted)', fontWeight: '400' }}> · </span>}
                                                    {s.food}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Fits your day */}
            {suggestions.length > 0 && (
                <section className="card" style={{ marginBottom: '1rem', padding: '0.4rem 0' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: '600', margin: '0.5rem 1rem 0.2rem', color: 'var(--color-text)' }}>
                        {t('recipes.suggestions_title')}
                    </h2>
                    {suggestions.map(({ meal, fits, proteinRich }, idx) =>
                        mealRow(meal, meal.category, idx, fits ? (proteinRich ? t('recipes.fits_protein') : t('recipes.fits_day')) : t('recipes.fits_light'))
                    )}
                </section>
            )}

            {/* Browse per category — same tab bar as Inzichten */}
            <section>
                <h2 style={{ fontSize: '1rem', fontWeight: '600', margin: '0 0 0.6rem', color: 'var(--color-text)' }}>
                    {t('recipes.browse_title')}
                </h2>
                <div role="tablist" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', background: 'var(--color-surface)', borderRadius: 'var(--radius-full)', padding: '4px', boxShadow: 'var(--shadow-sm)', marginBottom: '0.8rem' }}>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            role="tab"
                            aria-selected={selectedCategory === cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            style={{
                                padding: '0.5rem 0.2rem',
                                borderRadius: 'var(--radius-full)',
                                border: 'none',
                                background: selectedCategory === cat.id ? 'var(--color-primary)' : 'transparent',
                                color: selectedCategory === cat.id ? '#ffffff' : 'var(--color-text)',
                                fontSize: '0.8rem',
                                fontWeight: selectedCategory === cat.id ? '700' : '500',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
                <div className="card" style={{ padding: '0.4rem 0', margin: 0 }}>
                    {(phaseRecipes.meals[selectedCategory] || []).map((meal, idx) => mealRow(meal, selectedCategory, idx, null))}
                </div>
            </section>

            {showFoodModal && (
                <FoodModal
                    onClose={() => setShowFoodModal(false)}
                    date={todayStr}
                    onAdd={async (foodId, grams, _, config) => {
                        await logFood(foodId, grams, todayStr, config)
                    }}
                />
            )}
        </div>
    )
}
