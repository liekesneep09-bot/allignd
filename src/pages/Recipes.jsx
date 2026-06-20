import React, { useState, useMemo } from 'react'
import { useUser } from '../context/UserContext'
import { useLanguage } from '../context/LanguageContext'
import { getRecipeContent } from '../data/recipeContent'
import { getPhaseContent } from '../data/phases'
import { IconChevronDown, IconChevronUp, IconPlus } from '../components/Icons'

export default function Recipes() {
    const { user, currentPhase, logFood } = useUser()
    const { language, t } = useLanguage()
    const [selectedRecipe, setSelectedRecipe] = useState(null)
    const [expandedCategory, setExpandedCategory] = useState('ontbijt')
    const [isConfirming, setIsConfirming] = useState(false)
    const [addedSuccess, setAddedSuccess] = useState(false)

    const recipeContent = useMemo(() => getRecipeContent(language), [language])
    const phaseRecipes = recipeContent[currentPhase] || recipeContent.luteal
    const phaseInfo = getPhaseContent(language, currentPhase)

    const categories = [
        { id: 'ontbijt', label: t('meal_editor.breakfast') },
        { id: 'lunch', label: t('meal_editor.lunch') },
        { id: 'diner', label: t('meal_editor.dinner') },
        { id: 'snack', label: t('meal_editor.snack') }
    ]

    const handleLogRecipe = async (recipe) => {
        try {
            const categoryMap = {
                ontbijt: 'breakfast',
                lunch: 'lunch',
                diner: 'dinner',
                snack: 'snack'
            }
            await logFood(`recipe-${recipe.title}`, null, {
                foodName: recipe.title,
                configId: `recipe-${recipe.title}`,
                quantity: 1,
                selectedVariants: null,
                meal_category: categoryMap[expandedCategory] || null,
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
            }, 2000)
        } catch (error) {
            console.error('Error logging recipe:', error)
        }
    }

    if (selectedRecipe) {
        const isPerfect = selectedRecipe.suitability?.includes(user.goal)

        return (
            <div className="container" style={{ paddingBottom: '90px' }}>
                <header style={{ marginBottom: '1.5rem' }}>
                    <button
                        onClick={() => setSelectedRecipe(null)}
                        style={{
                            background: 'none',
                            color: 'var(--color-text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '0.9rem',
                            padding: 0,
                            marginBottom: '1rem'
                        }}
                    >
                        {'\u2190'} {t('fitness.back_to_overview')}
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '2rem' }}>{selectedRecipe.emoji}</span>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>{selectedRecipe.title}</h1>
                    </div>
                </header>

                {isPerfect && (
                    <div style={{
                        background: 'rgba(76, 175, 80, 0.1)',
                        color: '#2E7D32',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        {t('recipes.perfect_for_goal')}
                    </div>
                )}

                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text)', lineHeight: 1.5, fontStyle: 'italic' }}>
                        "{selectedRecipe.explanation}"
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <div className="card" style={{ padding: '0.75rem', textAlign: 'center', margin: 0 }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{t('recipes.protein')}</div>
                        <div style={{ fontWeight: '700' }}>{selectedRecipe.macros.p}g</div>
                    </div>
                    <div className="card" style={{ padding: '0.75rem', textAlign: 'center', margin: 0 }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{t('recipes.carbs')}</div>
                        <div style={{ fontWeight: '700' }}>{selectedRecipe.macros.c}g</div>
                    </div>
                    <div className="card" style={{ padding: '0.75rem', textAlign: 'center', margin: 0 }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{t('recipes.fat')}</div>
                        <div style={{ fontWeight: '700' }}>{selectedRecipe.macros.f}g</div>
                    </div>
                    <div className="card" style={{ padding: '0.75rem', textAlign: 'center', margin: 0 }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{t('recipes.fiber')}</div>
                        <div style={{ fontWeight: '700' }}>{selectedRecipe.macros.fiber}g</div>
                    </div>
                </div>

                <section style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.75rem' }}>{t('recipes.ingredients')}</h2>
                    <div className="card">
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {selectedRecipe.ingredients.map((ing, i) => (
                                <li key={i} style={{ fontSize: '0.95rem' }}>{ing}</li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.75rem' }}>{t('recipes.instructions')}</h2>
                    <div className="card">
                        <ol style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {selectedRecipe.instructions.map((step, i) => (
                                <li key={i} style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>{step}</li>
                            ))}
                        </ol>
                    </div>
                </section>

                <button
                    onClick={() => setIsConfirming(true)}
                    className="button-primary"
                    style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: 'var(--radius-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <IconPlus size={20} />
                    {t('recipes.add_to_daily_goal')} ({selectedRecipe.macros.kcal} kcal)
                </button>

                {isConfirming && (
                    <div style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem',
                        zIndex: 2000
                    }}>
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
                                        <button
                                            onClick={() => setIsConfirming(false)}
                                            style={{
                                                flex: 1,
                                                padding: '0.75rem',
                                                borderRadius: 'var(--radius-md)',
                                                background: 'var(--color-surface-hover)',
                                                border: '1px solid var(--color-border)'
                                            }}
                                        >
                                            {t('recipes.cancel')}
                                        </button>
                                        <button
                                            onClick={() => handleLogRecipe(selectedRecipe)}
                                            className="button-primary"
                                            style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)' }}
                                        >
                                            {t('recipes.confirm_add')}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    const phaseColorMap = {
        menstrual:  { bg: 'rgba(168,100,115,0.08)', border: 'rgba(168,100,115,0.22)', accent: '#7a3a47', dot: '#a86473' },
        follicular: { bg: 'rgba(91,196,212,0.08)',  border: 'rgba(91,196,212,0.22)',  accent: '#1a7a8a', dot: '#5bc4d4' },
        ovulatory:  { bg: 'rgba(245,168,156,0.10)', border: 'rgba(245,168,156,0.25)', accent: '#9a4a3a', dot: '#f5a89c' },
        luteal:     { bg: 'rgba(163,184,153,0.10)', border: 'rgba(163,184,153,0.25)', accent: '#4a6a42', dot: '#a3b899' },
    }
    const phaseColors = phaseColorMap[currentPhase] || phaseColorMap.luteal
    const nutrients = phaseInfo?.nutrients || []

    return (
        <div className="container" style={{ paddingBottom: '90px' }}>
            <header style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>{t('recipes.title')}</h1>
            </header>

            {nutrients.length > 0 && (
                <div style={{ marginBottom: '1.75rem' }}>
                    <h2 style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: 'var(--color-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.6px',
                        margin: '0 0 0.75rem 0'
                    }}>
                        {t('recipes.nutrients_title')}
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {nutrients.map((nutrient, i) => (
                            <div
                                key={i}
                                style={{
                                    background: phaseColors.bg,
                                    border: `1px solid ${phaseColors.border}`,
                                    borderRadius: 'var(--radius-md)',
                                    padding: '1rem 1.1rem',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '0.9rem'
                                }}
                            >
                                <div style={{
                                    minWidth: '36px',
                                    height: '36px',
                                    borderRadius: '8px',
                                    background: phaseColors.icon,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.58rem',
                                    fontWeight: '800',
                                    color: phaseColors.accent,
                                    letterSpacing: '0.3px',
                                    textTransform: 'uppercase',
                                    flexShrink: 0,
                                    fontFamily: 'monospace'
                                }}>
                                    {nutrient.icon}
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontWeight: '700',
                                        fontSize: '0.9rem',
                                        color: 'var(--color-text)',
                                        marginBottom: '0.2rem'
                                    }}>
                                        {nutrient.name}
                                    </div>
                                    <div style={{
                                        fontSize: '0.8rem',
                                        color: 'var(--color-text-muted)',
                                        lineHeight: 1.45,
                                        marginBottom: nutrient.sources?.length ? '0.6rem' : 0
                                    }}>
                                        {nutrient.description}
                                    </div>

                                    {nutrient.sources?.length > 0 && (
                                        <div>
                                            <span style={{
                                                fontSize: '0.68rem',
                                                fontWeight: '700',
                                                color: phaseColors.accent,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                display: 'block',
                                                marginBottom: '0.35rem'
                                            }}>
                                                {t('recipes.nutrients_sources_label')}
                                            </span>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                                                {nutrient.sources.map((src, j) => (
                                                    <span key={j} style={{
                                                        background: 'var(--color-surface)',
                                                        border: `1px solid ${phaseColors.border}`,
                                                        borderRadius: '100px',
                                                        padding: '0.2rem 0.55rem',
                                                        fontSize: '0.75rem',
                                                        color: 'var(--color-text)',
                                                        fontWeight: '500'
                                                    }}>
                                                        {src.food}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {categories.map(cat => {
                    const isExpanded = expandedCategory === cat.id
                    const meals = phaseRecipes.meals[cat.id] || []

                    return (
                        <div key={cat.id} style={{
                            background: 'var(--color-surface)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-border)',
                            overflow: 'hidden'
                        }}>
                            <button
                                onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                                style={{
                                    width: '100%',
                                    padding: '1rem 1.25rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: isExpanded ? 'var(--color-surface-hover)' : 'none',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <span style={{ fontWeight: '600', fontSize: '1rem' }}>{cat.label}</span>
                                {isExpanded ? <IconChevronUp size={20} /> : <IconChevronDown size={20} />}
                            </button>

                            {isExpanded && (
                                <div style={{ padding: '0 1.25rem 1rem 1.25rem' }}>
                                    {meals.map((meal, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => setSelectedRecipe(meal)}
                                            style={{
                                                padding: '1rem 0',
                                                borderTop: '1px solid var(--color-border)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '1rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <span style={{ fontSize: '1.5rem' }}>{meal.emoji}</span>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: '500', fontSize: '0.95rem', color: 'var(--color-text)' }}>{meal.title}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{meal.macros.kcal} kcal</div>
                                            </div>
                                            <div style={{ color: 'var(--color-primary)', fontSize: '1.2rem' }}>&#8250;</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
