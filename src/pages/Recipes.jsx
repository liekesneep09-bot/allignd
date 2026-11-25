import React, { useMemo, useState } from 'react'
import { useUser } from '../context/UserContext'
import { useLanguage } from '../context/LanguageContext'
import { getRecipeContent } from '../data/recipeContent'
import { nutritionPhases, nutrients } from '../data/nutritionGuide'
import { getLocalDateStr } from '../utils/date'
import pokeBowlPortrait from '../assets/voeding-pokebowl.webp'
import './Recipes.css'

const categories = { ontbijt:'breakfast', lunch:'lunch', diner:'dinner', snack:'snack' }

export default function Recipes() {
    const { user, getPhaseForDate, logFood, deleteFoodLog, getStatsForDate } = useUser()
    const { language, t } = useLanguage()
    const en = language === 'en'
    const i = en ? 1 : 0
    const today = getLocalDateStr()
    const { phase, day } = getPhaseForDate(today)
    const [browsePhase, setBrowsePhase] = useState('menstrual')
    const [category, setCategory] = useState('lunch')
    const [added, setAdded] = useState([])
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')
    const key = phase || browsePhase
    const guide = nutritionPhases[key]
    const recipes = useMemo(() => getRecipeContent(language, user?.dietary_preference), [language, user?.dietary_preference])
    const latest = added.filter(log => log.date === today && user.foodLogs?.some(item => item.id === log.id)).at(-1)
    const macroLine = m => [
        Math.round(m.kcal) + ' kcal',
        ...[['p','protein'], ['c','carbs'], ['f','fat']].map(([field,label]) => Math.round(m[field]) + ' g ' + t('recipes.' + label).toLowerCase())
    ].join(' · ')

    async function save(recipe) {
        if (busy) return
        setBusy(true)
        setError('')
        try {
            const m = recipe.macros
            const id = 'recipe-' + recipe.title
            const log = await logFood(id, null, { foodName:recipe.title, configId:id, quantity:1, date:today,
                meal_category:categories[category], selectedVariants:null,
                calculatedMacros:{kcal:m.kcal, protein:m.p, carbs:m.c, fat:m.f, fiber:m.fiber || 0} })
            setAdded(prev => [...prev, log])
        } catch {
            setError(en ? 'Could not save. Please try again.' : 'Opslaan is niet gelukt. Probeer het opnieuw.')
        } finally { setBusy(false) }
    }

    async function undo() {
        if (busy || !latest) return
        setBusy(true)
        setError('')
        try {
            await deleteFoodLog(latest.id)
            setAdded(prev => prev.filter(log => log.id !== latest.id))
        } catch {
            setError(en ? 'Could not undo. Please try again.' : 'Ongedaan maken is niet gelukt. Probeer het opnieuw.')
        } finally { setBusy(false) }
    }

    return <div className="phase-food" style={{'--phase-bg':`var(--phase-${key}-bg)`, '--phase-soft':`var(--phase-${key}-soft)`,
        '--phase-dark':`var(--phase-${key}-text)`, '--phase-deep':`color-mix(in srgb,var(--phase-${key}-text) 60%,#231d26)`}}>
        <div className="screen">
            <header className="topbar"><h1>{en ? 'Nutrition' : 'Voeding'}</h1>
                {phase ? <span className="phase-pill">{t('profile.phases.'+phase)} · {en ? 'day' : 'dag'} {day}</span> :
                    <select value={browsePhase} aria-label={en ? 'Phase' : 'Fase'} onChange={e => setBrowsePhase(e.target.value)}>
                        {Object.keys(nutritionPhases).map(id => <option key={id} value={id}>{t('profile.phases.'+id)}</option>)}
                    </select>}
            </header>
            <section className="focus-card"><div className="eyebrow">{t('profile.phases.'+key)}</div>
                <h2>{guide.title[i]}</h2><p>{guide.tip[i]}</p><img className="focus-portrait" src={pokeBowlPortrait} alt="" /></section>
            <div className="section-head"><h2>{en ? 'Nutrients for this phase' : 'Voedingsstoffen in deze fase'}</h2></div>
            <section className="food-list">{guide.nutrients.map(id => {
                const n = nutrients[id]
                return <details key={key+id} name="nutrient"><summary><span className="nutrient-icon">{n.symbol}</span>{n.name[i]}</summary>
                    <p>{n.why[i]}</p><strong className="food-sources">{n.foods[i]}</strong><p>{n.tip[i]}</p></details>
            })}</section>
            <div className="section-head"><h2>{en ? 'On your plate' : 'Op je bord'}</h2></div>
            <div className="meal-tabs" role="group" aria-label={en ? 'Meal' : 'Eetmoment'}>
                {Object.entries(categories).map(([id,label]) => <button key={id} aria-pressed={category===id} onClick={() => setCategory(id)}>{t('meal_editor.'+label)}</button>)}
            </div>
            <section className="food-list">{recipes[key].meals[category].slice(0,3).map(recipe => <details key={key+category+recipe.title}>
                <summary><span>{recipe.title}<small>{recipe.macros.p} g {en ? 'protein per serving' : 'eiwit per portie'}</small></span></summary>
                <p>{macroLine(recipe.macros)}</p><ul>{recipe.ingredients.map((text,index) => <li key={index}>{text}</li>)}</ul>
                <details><summary>{t('recipes.instructions')}</summary><ol>{recipe.instructions.map((text,index) => <li key={index}>{text}</li>)}</ol></details>
                <button className="add-meal" disabled={busy} onClick={() => save(recipe)}>{en ? 'Add 1 serving to Today' : 'Voeg 1 portie toe aan Vandaag'}</button>
            </details>)}</section>
            {latest && <section className="meal-total" aria-live="polite"><strong>{en ? 'Your total today' : 'Je dagtotaal'}</strong><p>{macroLine(getStatsForDate(today))}</p>
                <p>{en ? 'Added: ' : 'Toegevoegd: '}{latest.name}</p><button disabled={busy} onClick={undo}>{en ? 'Undo last addition' : 'Laatste toevoeging ongedaan maken'}</button></section>}
            {error && <p role="alert">{error}</p>}
        </div>
    </div>
}
