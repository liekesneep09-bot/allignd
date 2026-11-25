import React, { useState } from 'react'
import { useUser } from '../context/UserContext'
import { useLanguage } from '../context/LanguageContext'
import { getPhaseContent } from '../data/phases'
import { movementPhases, movementForms } from '../data/movementIdeas'
import { getLocalDateStr } from '../utils/date'
import { getFitnessContent } from '../data/fitnessContent'
import portrait from '../assets/beweging-halter.webp'
import './Fitness.css'

export default function Fitness() {
    const { user, currentPhase, logMovement } = useUser()
    const { language, t } = useLanguage()
    const en = language === 'en'
    const [energy, setEnergy] = useState(1)
    const [browsePhase, setBrowsePhase] = useState('menstrual')
    const [movementPending, setMovementPending] = useState(false)
    const [movementError, setMovementError] = useState(null)
    const todayStr = getLocalDateStr(new Date())
    const todayStatus = user.movementLogs?.find(log => log.date === todayStr)?.status
    const phase = movementPhases[currentPhase] ? currentPhase : browsePhase
    const data = movementPhases[phase]
    const forms = movementForms[en ? 'en' : 'nl']
    const goals = getFitnessContent(language).goals
    const [sessionGoal, setSessionGoal] = useState(null)
    const goal = sessionGoal || (goals[user.goal] ? user.goal : 'maintain')
    const suggestedForm = ['gain_muscle', 'recomp'].includes(goal) ? 'strength'
        : data.forms.find(id => ['walk', 'cardio', 'dance'].includes(id))
    const suggestion = forms[suggestedForm]
    const [duration, title, cue] = suggestion.sessions[energy]
    const phaseName = key => getPhaseContent(language, key).name
    const energyLabels = en ? ['Low', 'Medium', 'High'] : ['Weinig', 'Gemiddeld', 'Veel']

    const handleMovement = async (status) => {
        if (movementPending || todayStatus === status) return
        setMovementPending(true)
        setMovementError(null)
        try {
            await logMovement(todayStr, status)
        } catch {
            setMovementError(t('fitness.save_error'))
        } finally {
            setMovementPending(false)
        }
    }

    return (
        <div className="energy-check" style={{
            '--tint': `var(--phase-${phase}-bg)`,
            '--accent': `var(--phase-${phase}-text)`,
            '--soft': `var(--phase-${phase}-soft)`
        }}>
            <div className="energy-inner">
                <header><strong>{en ? 'Movement' : 'Bewegen'}</strong>
                    {movementPhases[currentPhase] ? <span>{phaseName(phase)}</span> :
                        <select value={phase} onChange={e => setBrowsePhase(e.target.value)} aria-label={en ? 'Explore a phase' : 'Bekijk fase'}>
                            {Object.keys(movementPhases).map(key => <option key={key} value={key}>{phaseName(key)}</option>)}
                        </select>}
                </header>
                <section className="movement-hero">
                    <small>{phaseName(phase)}</small>
                    <h1>{data.title[en ? 1 : 0]}</h1><p>{data.lesson[en ? 1 : 0]}</p>
                    <img src={portrait} alt="" width="538" height="732" />
                </section>
                <h2>{en ? 'Movement in this phase' : 'Bewegen in deze fase'}</h2>
                {data.forms.map(id => <details name="movement" key={phase + id}>
                    <summary>{forms[id].name}</summary><p>{forms[id].description}</p>
                    <strong className="movement-examples">{forms[id].examples}</strong>
                </details>)}
                <h2>{en ? 'What fits today?' : 'Wat past vandaag?'}</h2>
                <article>
                    <label className="movement-goal">{en ? 'My goal' : 'Mijn doel'}
                        <select value={goal} onChange={event => setSessionGoal(event.target.value)}>
                            {Object.entries(goals).map(([id,label]) => <option key={id} value={id}>{label}</option>)}
                        </select>
                    </label>
                    <fieldset className="movement-energy"><legend>{en ? 'How much energy do you have?' : 'Hoeveel energie heb je?'}</legend>
                        <div className="energy-controls">{energyLabels.map((label, i) =>
                            <button key={label} aria-pressed={energy === i} onClick={() => setEnergy(i)}>{label}</button>)}</div>
                    </fieldset>
                    <div aria-live="polite"><small>{suggestion.name} · ca. {duration}</small><h3>{title}</h3><p>{cue}</p></div>
                </article>
                <section className="energy-calendar">
                    <h2>{en ? 'Your calendar' : 'Jouw kalender'}</h2><p>{en ? 'How would you like to record today?' : 'Hoe wil je vandaag onthouden?'}</p>
                    <div className="energy-controls">{['moved', 'rest'].map(status =>
                        <button key={status} disabled={movementPending} aria-pressed={todayStatus === status} onClick={() => handleMovement(status)}>
                            {status === 'rest' ? t('fitness.log_rest') : t('fitness.log_moved')}
                        </button>)}</div>
                    <small role="status">{todayStatus && new Date().toLocaleDateString(en ? 'en-GB' : 'nl-NL', { day:'numeric', month:'long' }) + ' · ' + t(todayStatus === 'rest' ? 'fitness.log_rest' : 'fitness.log_moved') + ' ✓'}</small>
                    {movementError && <p role="alert">{movementError}</p>}
                </section>
                <details><summary>{en ? 'Sources for this phase' : 'Bronnen bij deze fase'}</summary>
                    <p><a href={data.source[1]} target="_blank" rel="noreferrer">{en ? (phase === 'menstrual' ? 'Cochrane' : 'NHS') : data.source[0]}</a></p>
                    <p><a href="https://doi.org/10.1007/s40279-020-01319-3" target="_blank" rel="noreferrer">{en ? 'Review · Cycle and exercise performance' : 'Overzichtsstudie · Cyclus en sportprestatie'}</a></p>
                </details>
            </div>
        </div>
    )
}
