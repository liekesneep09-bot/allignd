import React, { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useUser } from '../context/UserContext'
import { useLanguage } from '../context/LanguageContext'
import { getRecipeContent } from '../data/recipeContent'
import { getPhaseContent } from '../data/phases'
import { IconPlus } from '../components/Icons'
import { getLocalDateStr } from '../utils/date'
import pokeBowlPortrait from '../assets/voeding-pokebowl.webp'
import './Recipes.css'

const focus = {
    menstrual: ['Kies voor iets warms en ijzerrijks.', 'Try a warm, iron-rich meal.'],
    follicular: ['Breng kleur op je bord.', 'Add colour to your plate.'],
    ovulatory: ['Geef je actieve dag volwaardige brandstof.', 'Fuel your active day.'],
    luteal: ['Stel een vullende maaltijd samen.', 'Build a satisfying meal.']
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

export default function Recipes({ onNavigate }) {
    const { user, getPhaseForDate, logFood } = useUser()
    const { language, t } = useLanguage()
    const [selectedRecipe, setSelectedRecipe] = useState(null) // { ...meal, category }
    const [isConfirming, setIsConfirming] = useState(false)
    const [addedSuccess, setAddedSuccess] = useState(false)
    const [browsePhase, setBrowsePhase] = useState('menstrual')

    const todayStr = getLocalDateStr(new Date())
    const recipeContent = useMemo(() => getRecipeContent(language, user?.dietary_preference), [language, user?.dietary_preference])
    const { phase, day } = getPhaseForDate(todayStr)
    const currentPhase = phase || browsePhase
    const phaseRecipes = recipeContent[currentPhase]
    const en = language === 'en'
    const phaseInfo = getPhaseContent(language, currentPhase, user?.dietary_preference)
    const phaseName = phaseInfo?.name || ''
    const nutrients = phaseInfo?.nutrients || []
    const phaseAccent = `var(--phase-${currentPhase}-text, var(--color-primary))`
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

    return (
        <div className="phase-food" style={{
            '--phase-bg': `var(--phase-${currentPhase}-bg)`,
            '--phase-soft': `var(--phase-${currentPhase}-soft)`,
            '--phase-dark': phaseAccent,
            '--phase-deep': `color-mix(in srgb, var(--phase-${currentPhase}-text) 60%, #231d26)`
        }}>
            <div className="screen">
                <header className="topbar">
                    <button className="round-button" aria-label={en ? 'Profile' : 'Profiel'} onClick={() => onNavigate('profile')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></svg>
                    </button>
                    <time className="date" dateTime={todayStr}>{new Date().toLocaleDateString(en ? 'en-GB' : 'nl-NL', { day: 'numeric', month: 'long' })}</time>
                    <button className="round-button" aria-label={en ? 'Phase guide' : 'Fasegids'} onClick={() => onNavigate('guide')}>ⓘ</button>
                </header>
                {phase ? <div className="phase-pill">{phaseName} · {en ? 'day' : 'dag'} {day}</div> :
                    <select className="phase-pill" aria-label={en ? 'Explore a phase' : 'Ontdek een fase'} value={browsePhase} onChange={event => setBrowsePhase(event.target.value)}>
                        {Object.keys(focus).map(key => <option key={key} value={key}>{getPhaseContent(language, key).name}</option>)}
                    </select>}
                <h1>{en ? 'Nutrition that ' : 'Voeding die met je '}<em>{en ? 'moves with you.' : 'meebeweegt.'}</em></h1>
                <p className="intro">{phaseInfo.intro}</p>
                <section className="focus-card">
                    <div className="eyebrow">{en ? 'Focus for this phase' : 'Focus van deze fase'}</div>
                    <h2>{focus[currentPhase][en ? 1 : 0]}</h2>
                    <p>{phaseRecipes.focusPoints.slice(0, 2).join(' · ')}</p>
                    <img className="focus-portrait" src={pokeBowlPortrait} alt="" width="480" height="540" />
                </section>
                <div className="section-head"><h2>{en ? 'What helps now?' : 'Wat helpt nu?'}</h2></div>
                <section className="nutrient-list">
                    {nutrients.slice(0, 3).map(nutrient => (
                        <article className="nutrient-row" key={nutrient.name}>
                            <span className="nutrient-icon" aria-hidden="true">{nutrient.icon}</span>
                            <div className="nutrient-copy">
                                <h3>{nutrient.name}</h3><p>{nutrient.description}</p>
                                <div className="sources">{nutrient.sources.slice(0, 3).map(source => source.food).join(' · ')}</div>
                            </div>
                        </article>
                    ))}
                </section>
                <div className="section-head"><h2>{en ? 'Quick bites' : 'Snel iets lekkers'}</h2></div>
                <section className="quick-grid">
                    {['ontbijt', 'lunch', 'snack'].map(category => {
                        const meal = phaseRecipes.meals[category]?.[0]
                        if (!meal) return null
                        return <button key={category} className="quick-item" onClick={() => openRecipe(meal, category)}>
                            <span className="food-dot" aria-hidden="true">{meal.emoji || <CategoryIcon category={category} />}</span>
                            <strong>{meal.title}</strong>
                            <small>{t('meal_editor.' + categoryMap[category])}</small>
                        </button>
                    })}
                </section>
            </div>
        </div>
    )
}
