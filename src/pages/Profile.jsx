
import React, { useState, useEffect } from 'react'
import { useUser } from '../context/UserContext'
import { IconAccount, IconCalendar } from '../components/Icons'

/**
 * Modern Profile & Settings Page
 * - Always editable (no "Edit Mode")
 * - Smart Save Button (appears on change)
 * - Clear Sections
 */
export default function Profile() {
    const {
        user,
        saveProfileAndCalculate,
        logout,
        deleteAccount,
        resetOnboarding,
        logMenstruation,
        endPeriodToday, // NEW
        adjustCyclePhase
    } = useUser()

    // Local State for Form (initialized from user)
    const [formData, setFormData] = useState({
        name: user.name || '',
        age: user.age || '',
        height: user.height || '',
        weight: user.weight || '',
        targetWeight: user.targetWeight || '', // New Field
        goal: user.goal || 'maintain',
        activity: user.activity || 1.375, // Using number logic for now, UI maps to text
        lifestyle_level: user.lifestyle_level || 'sedentary', // New Logic
        steps_range: user.steps_range || 'lt4k', // New Logic
        trainingFrequency: user.training_days_per_week || 0, // Using snake_case default? No, Context maps it.
        // Cycle
        cycleLength: user.cycleLength || 28,
        periodLength: user.periodLength || 5,
        // Cycle Start for correction
        cycleStart: user.cycleStart ? new Date(user.cycleStart).toISOString().split('T')[0] : ''
    })

    // Update form when user data loads (e.g. initial fetch)
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                age: user.age || '',
                height: user.height || '',
                weight: user.weight || '',
                targetWeight: user.targetWeight || '', // Sync targetWeight
                goal: user.goal || 'maintain',
            }))
        }
    }, [user.name, user.weight, user.targetWeight]) // Watch specific fields

    const [isDirty, setIsDirty] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [showCycleCorrection, setShowCycleCorrection] = useState(false)

    // Handle Input Change
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        setIsDirty(true)
    }

    // Handle Save
    const handleSave = async () => {
        setIsSaving(true)
        try {
            await saveProfileAndCalculate({
                ...formData,
                // Ensure numbers
                age: Number(formData.age),
                height: Number(formData.height),
                weight: Number(formData.weight),
                targetWeight: Number(formData.targetWeight),
                trainingFrequency: Number(formData.trainingFrequency),
            })
            setIsDirty(false)
        } catch (e) {
            console.error(e)
            alert("Er ging iets mis bij het opslaan.")
        } finally {
            setIsSaving(false)
        }
    }

    // Goal Options
    const GOALS = [
        { value: 'lose_fat', label: 'Vet verliezen', icon: '🔥' },
        { value: 'recomp', label: 'Afvallen & Spieropbouw', icon: '✨' },
        { value: 'maintain', label: 'Gewicht behouden', icon: '⚖️' },
        { value: 'gain_muscle', label: 'Spier opbouwen', icon: '💪' }
    ]

    // Activity / Lifestyle Options (New System)
    const LIFESTYLES = [
        { value: 'sedentary', label: 'Zittend werk / weinig beweging' },
        { value: 'lightly_active', label: 'Licht actief (staand werk/student)' },
        { value: 'moderately_active', label: 'Actief (fysiek werk/veel lopen)' },
        { value: 'very_active', label: 'Zeer actief (zwaar werk/atleet)' }
    ]

    const STEPS = [
        { value: 'lt4k', label: 'Minder dan 4.000 stappen' },
        { value: '4k_8k', label: '4.000 - 8.000 stappen' },
        { value: '8k_12k', label: '8.000 - 12.000 stappen' },
        { value: 'gt12k', label: 'Meer dan 12.000 stappen' }
    ]

    return (
        <div className="container" style={{ paddingBottom: '8rem' }}>
            <h1 className="page-title">Jouw Profiel</h1>

            {/* SECTION 1: PERSONAL */}
            <section className="card" style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <IconAccount opacity={1} /> Persoonlijk
                </h2>

                <div className="form-group">
                    <label>Naam</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={e => handleChange('name', e.target.value)}
                        placeholder="Je naam"
                        className="input-field"
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                        <label>Leeftijd</label>
                        <input
                            type="number"
                            value={formData.age}
                            onChange={e => handleChange('age', e.target.value)}
                            className="input-field"
                        />
                    </div>
                    <div className="form-group">
                        <label>Lengte (cm)</label>
                        <input
                            type="number"
                            value={formData.height}
                            onChange={e => handleChange('height', e.target.value)}
                            className="input-field"
                        />
                    </div>
                </div>
            </section>

            {/* SECTION 2: BODY & GOALS */}
            <section className="card" style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Lichaam & Doelen</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group">
                        <label>Huidig Gewicht (kg)</label>
                        <input
                            type="number"
                            value={formData.weight}
                            onChange={e => handleChange('weight', e.target.value)}
                            className="input-field"
                        />
                    </div>
                    <div className="form-group">
                        <label>Streefgewicht (kg)</label>
                        <input
                            type="number"
                            value={formData.targetWeight}
                            onChange={e => handleChange('targetWeight', e.target.value)}
                            className="input-field"
                            placeholder="Optioneel"
                        />
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label>Wat is je hoofddoel?</label>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                        {GOALS.map(g => (
                            <button
                                key={g.value}
                                onClick={() => handleChange('goal', g.value)}
                                style={{
                                    padding: '0.8rem',
                                    border: formData.goal === g.value ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                    background: formData.goal === g.value ? 'var(--color-surface)' : 'transparent',
                                    borderRadius: '12px',
                                    textAlign: 'left',
                                    color: 'var(--color-text)',
                                    display: 'flex', alignItems: 'center', gap: '0.8rem',
                                    fontWeight: formData.goal === g.value ? 600 : 400
                                }}
                            >
                                <span style={{ fontSize: '1.2rem' }}>{g.icon}</span>
                                {g.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 600 }}>Levensstijl</label>

                    <div className="form-group">
                        <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Hoe actief is je dagelijks leven?</label>
                        <select
                            value={formData.lifestyle_level}
                            onChange={e => handleChange('lifestyle_level', e.target.value)}
                            className="input-field"
                        >
                            {LIFESTYLES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Gemiddelde stappen per dag</label>
                        <select
                            value={formData.steps_range}
                            onChange={e => handleChange('steps_range', e.target.value)}
                            className="input-field"
                        >
                            {STEPS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Sportdagen per week</label>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {[0, 1, 2, 3, 4, 5, 6, 7].map(n => (
                                <button
                                    key={n}
                                    onClick={() => handleChange('trainingFrequency', n)}
                                    style={{
                                        width: '36px', height: '36px',
                                        borderRadius: '50%',
                                        border: formData.trainingFrequency === n ? 'none' : '1px solid var(--color-border)',
                                        background: formData.trainingFrequency === n ? 'var(--color-primary)' : 'transparent',
                                        color: formData.trainingFrequency === n ? '#fff' : 'var(--color-text)',
                                        fontWeight: 600
                                    }}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 3: CYCLE */}
            <section className="card" style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <IconCalendar opacity={1} /> Jouw Cyclus
                </h2>

                <div className="form-group">
                    <label>Gemiddelde cyclusduur (dagen)</label>
                    <input
                        type="number"
                        value={formData.cycleLength}
                        // Allow manual override, knowing app learns too
                        onChange={e => handleChange('cycleLength', e.target.value)}
                        className="input-field"
                    />
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.3rem' }}>
                        De app past dit automatisch aan op basis van je logs.
                    </p>
                </div>

                <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Correcties</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>
                                Startdatum laatste menstruatie
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="date"
                                    value={formData.cycleStart}
                                    onChange={e => handleChange('cycleStart', e.target.value)}
                                    className="input-field"
                                    style={{ flex: 1, minWidth: '120px' }} // Fix layout
                                />
                                {user.isMenstruatingNow ? (
                                    <button
                                        onClick={() => {
                                            if (window.confirm("Is je menstruatie afgelopen?")) {
                                                endPeriodToday()
                                                alert("Menstruatie gestopt.")
                                            }
                                        }}
                                        className="btn"
                                        style={{ border: '1px solid var(--color-border)', background: '#FFE5E5', color: '#D32F2F', whiteSpace: 'nowrap', cursor: 'pointer' }}
                                    >
                                        Stop Menstruatie
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            if (window.confirm("Is je menstruatie begonnen? Dit start een nieuwe cyclus.")) {
                                                if (formData.cycleStart) {
                                                    logMenstruation(formData.cycleStart)
                                                    alert("Nieuwe cyclus gestart!")
                                                }
                                            }
                                        }}
                                        className="btn"
                                        style={{ border: 'none', background: 'var(--color-primary)', color: '#fff', whiteSpace: 'nowrap' }}
                                    >
                                        Start (Nieuwe Cyclus)
                                    </button>
                                )}
                            </div>
                        </div>

                        <button
                            className="btn"
                            style={{
                                justifyContent: 'flex-start',
                                border: '1px solid var(--color-border)',
                                color: 'var(--color-text)',
                                fontSize: '0.9rem'
                            }}
                            onClick={() => setShowCycleCorrection(!showCycleCorrection)}
                        >
                            {showCycleCorrection ? "Sluit fase opties" : "Ik zit in een andere fase..."}
                        </button>

                        {showCycleCorrection && (
                            <div className="fade-in" style={{
                                background: 'var(--color-bg)',
                                padding: '1rem',
                                borderRadius: '12px',
                                display: 'grid', gap: '0.5rem'
                            }}>
                                <button className="btn" onClick={() => adjustCyclePhase('menstrual')}>🩸 Menstruatie</button>
                                <button className="btn" onClick={() => adjustCyclePhase('follicular')}>🌱 Folliculaire fase</button>
                                <button className="btn" onClick={() => adjustCyclePhase('ovulatory')}>🥚 Ovulatie</button>
                                <button className="btn" onClick={() => adjustCyclePhase('luteal')}>🍂 Luteale fase</button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* SECTION 4: ACCOUNT ACTIONS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem', opacity: 0.8 }}>
                <button
                    onClick={() => {
                        if (window.confirm("Weet je zeker dat je de onboarding opnieuw wilt doen? Je instellingen worden gereset.")) {
                            resetOnboarding()
                            window.location.href = "/" // Force reload
                        }
                    }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--color-text)', textDecoration: 'underline', cursor: 'pointer' }}
                >
                    Onboarding opnieuw doen
                </button>

                <button
                    onClick={logout}
                    style={{ background: 'transparent', border: 'none', color: 'var(--color-text)', cursor: 'pointer' }}
                >
                    Uitloggen
                </button>

                <button
                    onClick={() => {
                        if (window.confirm("LET OP: Dit verwijdert defintief je account en data. Dit kan niet ongedaan gemaakt worden.")) {
                            deleteAccount()
                        }
                    }}
                    style={{ background: 'transparent', border: 'none', color: '#D32F2F', fontSize: '0.8rem', cursor: 'pointer' }}
                >
                    Account verwijderen
                </button>
            </div>

            {/* STICKY SAVE BUTTON (Mobile Friendly) */}
            <div style={{
                position: 'fixed',
                bottom: '90px', // Above bottom nav
                left: '50%',
                transform: isDirty ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(150%)',
                transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                zIndex: 100,
                width: 'auto',
                pointerEvents: isDirty ? 'auto' : 'none'
            }}>
                <button
                    className="btn btn-primary"
                    style={{
                        minWidth: '140px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                        borderRadius: '100px',
                        padding: '0.75rem 1.5rem',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                    }}
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? "Opslaan..." : (
                        <>
                            <span>💾</span> Opslaan
                        </>
                    )}
                </button>
            </div>

            <style>{`
                .form-group { margin-bottom: 1rem; }
                .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; font-size: 0.9rem; }
                .input-field {
                    width: 100%;
                    padding: 0.8rem;
                    border: 1px solid var(--color-border);
                    border-radius: 12px;
                    background: transparent;
                    color: var(--color-text);
                    font-size: 1rem;
                    transition: all 0.2s;
                }
                .input-field:focus {
                    border-color: var(--color-primary);
                    background: var(--color-surface);
                    outline: none;
                }
                .page-title {
                    color: var(--color-primary);
                    margin-bottom: 1.5rem;
                    margin-top: 0;
                    font-size: 1.8rem;
                }
            `}</style>
        </div>
    )
}
