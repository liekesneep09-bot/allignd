import React, { useState } from 'react'
import { useUser } from '../context/UserContext'
import { useLanguage } from '../context/LanguageContext'
import { getPhaseContent } from '../data/phases'
import { phaseIdeas, sessions, englishIdeas } from '../data/movementIdeas'
import { getLocalDateStr } from '../utils/date'
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
    const phase = phaseIdeas[currentPhase] ? currentPhase : browsePhase
    const data = en ? englishIdeas[phase] : phaseIdeas[phase]
    const workouts = en ? data.sessions : sessions[phase]
    const [duration, title, cue] = data.ideas[energy]
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
                    {phaseIdeas[currentPhase] ? <span>{phaseName(phase)}</span> :
                        <select value={phase} onChange={e => setBrowsePhase(e.target.value)} aria-label={en ? 'Explore a phase' : 'Bekijk fase'}>
                            {Object.keys(phaseIdeas).map(key => <option key={key} value={key}>{phaseName(key)}</option>)}
                        </select>}
                </header>
                <h1>{en ? 'How much energy ' : 'Hoeveel energie '}<em>{en ? 'do you have today?' : 'heb je vandaag?'}</em></h1>
                <p>{data.lesson}</p>
                <div className="energy-picker">
                    <div className="energy-dial" aria-hidden="true"><i style={{ transform: `rotate(${[25, 90, 155][energy]}deg)` }} /></div>
                    <div className="energy-controls" role="group" aria-label={en ? 'Energy today' : 'Energie vandaag'}>
                        {energyLabels.map((label, i) => <button key={label} aria-pressed={energy === i} onClick={() => setEnergy(i)}>{label}</button>)}
                    </div>
                </div>
                <h2>{en ? 'An idea for today' : 'Een idee voor vandaag'}</h2>
                <article aria-live="polite"><small>{en ? 'Try' : 'Bijvoorbeeld'} {duration}</small><h3>{title}</h3><p>{cue}</p></article>
                <h2>{en ? 'More to try' : 'Meer om te proberen'}</h2><p>{data.more}</p>
                {workouts.map(([name, instructions]) => <details key={name}><summary>{name}</summary><p>{instructions}</p></details>)}
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
                    <p><a href={phaseIdeas[phase].source[1]} target="_blank" rel="noreferrer">{en ? data.source : data.source[0]}</a></p>
                    <p><a href="https://doi.org/10.1007/s40279-020-01319-3" target="_blank" rel="noreferrer">{en ? 'Review · Cycle and exercise performance' : 'Overzichtsstudie · Cyclus en sportprestatie'}</a></p>
                </details>
            </div>
        </div>
    )
}
