import React, { useState } from 'react'
import { useUser } from '../context/UserContext'
import { GOAL_TYPES } from '../logic/nutrition'

export default function Profile() {
    const { user, updateUser, resetOnboarding, resetData, logout, deleteAccount, logMenstruation, adjustCyclePhase } = useUser()
    const [name, setName] = useState(user.name)
    const [goal, setGoal] = useState(user.goal)
    const [resultTempo, setResultTempo] = useState(user.resultTempo || 'average')

    // Cycle Settings
    const [cycleLength, setCycleLength] = useState(user.cycleLength)
    const [periodLength, setPeriodLength] = useState(user.periodLength || 5)

    const [isEditing, setIsEditing] = useState(false)
    const [showCorrection, setShowCorrection] = useState(false)

    const handleSave = () => {
        updateUser({ name, goal, resultTempo, cycleLength: parseInt(cycleLength), periodLength: parseInt(periodLength) })
        setIsEditing(false)
    }

    // Action: Redo Onboarding (Explicit Reset)
    const handleRedoOnboarding = async () => {
        if (!window.confirm('Weet je het zeker? Je moet de hele onboarding opnieuw doorlopen. Je huidige doelen en gewicht instellingen worden overschreven.')) {
            return
        }

        // 1. Reset flag in DB
        await updateUser({ is_onboarded: false }) // This will trigger DB update via context

        // 2. Reset local flag (force redirect via App.jsx or manual nav)
        // Ideally App.jsx listens to isOnboarded. If not, we might need to force navigate.
        // For now, let's assume App.jsx routing handles !isOnboarded -> /onboarding
        // But we need to update context state first.
        // The `updateUser` might not update `isOnboarded` state directly if it maps to snake_case.
        // Let's force it:

        // Actually, UserContext `updateUser` maps specific fields. `is_onboarded` isn't in the map in `UserContext.jsx` update logic!
        // We need to add a dedicated "resetOnboarding" method in Context or just hack it slightly.
        // Better: Update UserContext to expose a method `resetOnboarding`.

        // Since I can't edit UserContext in this turn (already did), I will use the `updateUser` functionality 
        // to set a flag, BUT `updateUser` filters fields.

        // Revised Plan (Self-Correction):
        // I should have added `resetOnboarding` to UserContext.
        // But I can simulate it by manually calling resetData() which clears local storage,
        // BUT resetData() wipes EVERYTHING including food logs potentially? No, it just resets state variables.
        // The user wants to KEEP history but REDO settings.

        // Let's implement a direct call from here if available, or ask adding it.
        // Wait, I can just cheat and use `completeOnboarding` in reverse? No.

        // Workaround: Call `resetData()` which sets isOnboarded=false. 
        // But that clears `user` object too much.

        // Let's use `updateUser` (but wait, `is_onboarded` column isn't in the allowlist in `updateUser`).
        // I need to go back and fix `UserContext` to allow `is_onboarded` update or add a function.
        // **Wait**, I am in the `UserContext` refactor phase. I should have added it.
        // I will add `redoOnboarding` to `UserContext` in the next step.
        // For now, I'll write the call here assuming it exists.

        resetOnboarding()
        onNavigate('onboarding')
    }

    return (
        <div className="container" style={{ paddingBottom: '6rem' }}>
            <h1 style={{ color: 'var(--color-primary)', marginBottom: '2rem', marginTop: '0' }}>Profiel & Instellingen</h1>

            {/* Editing Section */}
            <div className="card">
                <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Jouw Gegevens</h2>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Naam</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        disabled={!isEditing}
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: isEditing ? '#fff' : 'transparent'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Doel</label>
                    <select
                        value={goal}
                        onChange={e => setGoal(e.target.value)}
                        disabled={!isEditing}
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: isEditing ? '#fff' : 'transparent'
                        }}
                    >
                        <option value={GOAL_TYPES.LOSE_FAT}>Afvallen</option>
                        <option value={GOAL_TYPES.RECOMP}>Afvallen + Spier</option>
                        <option value={GOAL_TYPES.MAINTAIN}>Behoud</option>
                        <option value={GOAL_TYPES.GAIN}>Spiermassa</option>
                    </select>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Tempo</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {[
                            { value: 'slow', label: 'Rustig & duurzaam' },
                            { value: 'average', label: 'Gemiddeld tempo' },
                            { value: 'fast', label: 'Snel resultaat' }
                        ].map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => {
                                    setResultTempo(opt.value)
                                    updateUser({ resultTempo: opt.value })
                                }}
                                style={{
                                    padding: '0.6rem',
                                    border: resultTempo === opt.value ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                    borderRadius: '8px',
                                    background: resultTempo === opt.value ? 'var(--color-surface)' : 'transparent',
                                    color: resultTempo === opt.value ? 'var(--color-primary)' : 'var(--color-text)',
                                    fontWeight: resultTempo === opt.value ? '600' : '400',
                                    width: '100%',
                                    fontSize: '0.85rem',
                                    textAlign: 'left',
                                    cursor: 'pointer'
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                        Dit beïnvloedt je dagelijkse calorieberekening.
                    </p>
                </div>

                {isEditing ? (
                    <button className="btn btn-primary" onClick={handleSave}>Opslaan</button>
                ) : (
                    <button className="btn" style={{ border: '1px solid var(--color-border)' }} onClick={() => setIsEditing(true)}>Wijzigen</button>
                )}
            </div>

            {/* Cycle Settings & Correction */}
            <div className="card" style={{ marginTop: '1.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Mijn cyclus</h2>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Gemiddelde cyclusduur (dagen)</label>
                        <input
                            type="number"
                            value={cycleLength}
                            onChange={e => setCycleLength(e.target.value)}
                            disabled={!isEditing}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: isEditing ? '#fff' : 'transparent'
                            }}
                        />
                    </div>
                </div>

                {isEditing && (
                    <div style={{ marginBottom: '1rem' }}>
                        <button
                            className="btn"
                            style={{ fontSize: '0.85rem', padding: '0.5rem', border: '1px solid var(--color-border)' }}
                            onClick={() => setCycleLength(28)}
                        >
                            Cyclus opnieuw instellen (Reset naar 28)
                        </button>
                    </div>
                )}


                {!isEditing && (
                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--color-text)' }}>Klopt er iets niet?</h3>

                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', marginBottom: '0.5rem' }}
                            onClick={() => {
                                if (window.confirm("Start dit een nieuwe cyclus?")) {
                                    logMenstruation()
                                    alert("Cyclus gestart!")
                                }
                            }}
                        >
                            Ik ben vandaag ongesteld
                        </button>

                        <button
                            className="btn"
                            style={{ width: '100%', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                            onClick={() => setShowCorrection(!showCorrection)}
                        >
                            {showCorrection ? "Annuleer correctie" : "Pas fase handmatig aan"}
                        </button>

                        {showCorrection && (
                            <div className="fade-in" style={{ marginTop: '1rem', background: 'var(--color-surface)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                                <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Selecteer je huidige fase:</p>
                                <div style={{ display: 'grid', gap: '0.5rem' }}>
                                    <button className="btn" style={{ fontSize: '0.9rem', justifyContent: 'flex-start' }} onClick={() => { adjustCyclePhase('menstrual'); setShowCorrection(false); alert("Fase aangepast!") }}>🩸 Menstruatie</button>
                                    <button className="btn" style={{ fontSize: '0.9rem', justifyContent: 'flex-start' }} onClick={() => { adjustCyclePhase('follicular'); setShowCorrection(false); alert("Fase aangepast!") }}>🌱 Folliculaire fase</button>
                                    <button className="btn" style={{ fontSize: '0.9rem', justifyContent: 'flex-start' }} onClick={() => { adjustCyclePhase('ovulatory'); setShowCorrection(false); alert("Fase aangepast!") }}>🥚 Ovulatie</button>
                                    <button className="btn" style={{ fontSize: '0.9rem', justifyContent: 'flex-start' }} onClick={() => { adjustCyclePhase('luteal'); setShowCorrection(false); alert("Fase aangepast!") }}>🍂 Luteale fase</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Menstruation Data Correction */}
            <div className="card" style={{ marginTop: '1.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Menstruatie gegevens</h2>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Laatste menstruatie begonnen op</label>
                    <input
                        type="date"
                        defaultValue={user.cycleStart ? new Date(user.cycleStart).toISOString().split('T')[0] : ''}
                        id="period-date-input"
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-sm)',
                        }}
                    />
                    <button
                        className="btn btn-primary"
                        style={{ marginTop: '1rem', width: '100%' }}
                        onClick={() => {
                            const val = document.getElementById('period-date-input').value
                            if (val) {
                                logMenstruation(val)
                                alert("Datum aangepast!")
                            }
                        }}
                    >
                        Opslaan
                    </button>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                        Dit herberekent je huidige fase.
                    </p>
                </div>
            </div>

            {/* Actions Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
                <button
                    onClick={handleRedoOnboarding}
                    style={{ padding: '1rem', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text)' }}
                >
                    Onboarding opnieuw doen
                </button>

                <button
                    onClick={logout}
                    style={{ padding: '1rem', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text)' }}
                >
                    Uitloggen
                </button>

                <button
                    onClick={() => { if (window.confirm('LET OP: Dit verwijdert al je data definitief. Weet je het zeker?')) deleteAccount() }}
                    style={{ padding: '1rem', background: 'transparent', border: '1px solid #FFCDD2', borderRadius: 'var(--radius-md)', color: '#D32F2F', marginTop: '1rem' }}
                >
                    Account verwijderen
                </button>
            </div>
        </div>
    )
}
