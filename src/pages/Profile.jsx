
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
        logPeriodStart,
        endPeriodToday, // NEW
        adjustCyclePhase
    } = useUser()

    const [isDirty, setIsDirty] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [showCycleCorrection, setShowCycleCorrection] = useState(false)

    // Local State for Form (initialized from user)
    const [formData, setFormData] = useState({
        name: user.name || '',
        age: user.age || '',
        height: user.height || '',
        weight: user.weight || '',
        targetWeight: user.targetWeight || '',
        goal: user.goal || 'maintain',
        resultTempo: user.resultTempo || 'average',
        lifestyle_level: user.lifestyle_level || 'sedentary',
        steps_range: user.steps_range || 'lt4k',
        trainingFrequency: user.training_days_per_week || 0,
        // Cycle
        cycleLength: user.cycleLength || 28,
        periodLength: user.periodLength || 5,
        cycleStart: (() => {
            try {
                if (!user.cycleStart) return ''
                const d = new Date(user.cycleStart)
                if (isNaN(d.getTime())) return ''
                return d.toISOString().split('T')[0]
            } catch (e) {
                return ''
            }
        })()
    })

    useEffect(() => {
        // Only sync from global state if user is NOT currently editing (isDirty is false)
        // OR if a save just completed (isSaving became false)
        if (user && !isDirty && !isSaving) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                age: user.age || '',
                height: user.height || '',
                weight: user.weight || '',
                targetWeight: user.targetWeight || '',
                goal: user.goal || 'maintain',
                resultTempo: user.resultTempo || 'average',
                lifestyle_level: user.lifestyle_level || 'sedentary',
                steps_range: user.steps_range || 'lt4k',
                trainingFrequency: user.training_days_per_week || 0,
            }))
        }
    }, [user, isDirty, isSaving])

    const handleDeleteAccount = async () => {
        setIsDeleting(true)
        try {
            await deleteAccount()
        } catch (err) {
            alert("Fout bij verwijderen: " + err.message)
            setIsDeleting(false)
            setShowDeleteConfirm(false)
        }
    }

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
        { value: 'lose_fat', label: 'Vet verliezen' },
        { value: 'recomp', label: 'Afvallen & Spieropbouw' },
        { value: 'maintain', label: 'Gewicht behouden' },
        { value: 'gain_muscle', label: 'Spier opbouwen' }
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

    const TEMPOS = [
        { value: 'slow', label: 'Rustig & duurzaam' },
        { value: 'average', label: 'Gemiddeld tempo' },
        { value: 'fast', label: 'Snel resultaat' }
    ]

    const labelStyle = {
        display: 'block',
        fontSize: '0.75rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: 'var(--color-text-muted)',
        marginBottom: '0.6rem'
    }

    return (
        <div className="container" style={{ paddingBottom: '10rem', backgroundColor: 'var(--color-bg)' }}>
            <h1 className="page-title" style={{ fontSize: '2.2rem', fontWeight: '700', marginBottom: '2rem' }}>Profiel</h1>

            {/* SECTION 1: PERSONAL */}
            <section className="card" style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <IconAccount opacity={1} /> Persoonlijk
                </h2>

                <div className="form-group">
                    <label style={labelStyle}>Naam</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={e => handleChange('name', e.target.value)}
                        placeholder="Je naam"
                        className="input-field"
                        style={{ padding: '1rem', fontSize: '1rem', borderRadius: '12px' }}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div className="form-group">
                        <label style={labelStyle}>Leeftijd</label>
                        <input
                            type="number"
                            value={formData.age}
                            onChange={e => handleChange('age', e.target.value)}
                            className="input-field"
                            style={{ padding: '1rem', fontSize: '1rem', borderRadius: '12px' }}
                        />
                    </div>
                    <div className="form-group">
                        <label style={labelStyle}>Lengte (cm)</label>
                        <input
                            type="number"
                            value={formData.height}
                            onChange={e => handleChange('height', e.target.value)}
                            className="input-field"
                            style={{ padding: '1rem', fontSize: '1rem', borderRadius: '12px' }}
                        />
                    </div>
                </div>
            </section>
            {/* SECTION 2: BODY & GOALS */}
            <section className="card" style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Lichaam & Doelen</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                    <div className="form-group">
                        <label style={labelStyle}>Huidig Gewicht (kg)</label>
                        <input
                            type="number"
                            value={formData.weight}
                            onChange={e => handleChange('weight', e.target.value)}
                            className="input-field"
                            style={{ padding: '1rem', fontSize: '1rem', borderRadius: '12px' }}
                        />
                    </div>
                    <div className="form-group">
                        <label style={labelStyle}>Streefgewicht (kg)</label>
                        <input
                            type="number"
                            value={formData.targetWeight}
                            onChange={e => handleChange('targetWeight', e.target.value)}
                            className="input-field"
                            style={{ padding: '1rem', fontSize: '1rem', borderRadius: '12px' }}
                            placeholder="Optioneel"
                        />
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={labelStyle}>Wat is je hoofddoel?</label>
                    <div style={{ display: 'grid', gap: '0.6rem' }}>
                        {GOALS.map(g => (
                            <SelectOption
                                key={g.value}
                                label={g.label}
                                selected={formData.goal === g.value}
                                onClick={() => handleChange('goal', g.value)}
                            />
                        ))}
                    </div>
                </div>

                {formData.goal !== 'maintain' && (
                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label style={labelStyle}>Hoe snel wil je resultaat?</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem' }}>
                            {TEMPOS.map(t => (
                                <CompactOption
                                    key={t.value}
                                    label={t.label}
                                    selected={formData.resultTempo === t.value}
                                    onClick={() => handleChange('resultTempo', t.value)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ marginBottom: '1.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={labelStyle}>Werk & leefstijl</label>
                        <div style={{ display: 'grid', gap: '0.6rem' }}>
                            {LIFESTYLES.map(l => (
                                <SelectOption
                                    key={l.value}
                                    label={l.label}
                                    selected={formData.lifestyle_level === l.value}
                                    onClick={() => handleChange('lifestyle_level', l.value)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={labelStyle}>Dagelijkse stappen</label>
                        <div style={{ display: 'grid', gap: '0.6rem' }}>
                            {STEPS.map(s => (
                                <SelectOption
                                    key={s.value}
                                    label={s.label}
                                    selected={formData.steps_range === s.value}
                                    onClick={() => handleChange('steps_range', s.value)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={labelStyle}>Sportdagen per week</label>
                        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                            {[0, 1, 2, 3, 4, 5, 6, 7].map(n => (
                                <button
                                    key={n}
                                    onClick={() => handleChange('trainingFrequency', n)}
                                    style={{
                                        width: '40px', height: '40px',
                                        borderRadius: '50%',
                                        border: formData.trainingFrequency === n ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                        background: formData.trainingFrequency === n ? 'rgba(255,174,185,0.1)' : 'transparent',
                                        color: formData.trainingFrequency === n ? 'var(--color-primary)' : 'var(--color-text)',
                                        fontWeight: '700',
                                        fontSize: '0.9rem',
                                        transition: 'all 0.2s',
                                        flexShrink: 0
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
                    <label style={labelStyle}>Gemiddelde cyclusduur (dagen)</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="number"
                            value={formData.cycleLength}
                            onChange={e => handleChange('cycleLength', e.target.value)}
                            className="input-field"
                            style={{ padding: '1rem', fontSize: '1rem', borderRadius: '12px' }}
                        />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                        De app leert van je logs en past dit automatisch aan.
                    </p>
                </div>

                <div style={{ marginTop: '2rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '1rem', letterSpacing: '0.05em' }}>Correcties</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={labelStyle}>Startdatum laatste menstruatie</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <input
                                    type="date"
                                    value={formData.cycleStart}
                                    onChange={e => handleChange('cycleStart', e.target.value)}
                                    className="input-field"
                                    style={{ width: '100%', padding: '1rem', fontSize: '1rem', borderRadius: '12px' }}
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
                                        style={{ width: '100%', border: '1px solid #a8647340', background: '#a8647320', color: '#a86473', cursor: 'pointer', fontWeight: '600' }}
                                    >
                                        Stop Menstruatie
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            if (window.confirm("Is je menstruatie begonnen? Dit start een nieuwe cyclus.")) {
                                                if (formData.cycleStart) {
                                                    logPeriodStart(formData.cycleStart)
                                                    alert("Nieuwe cyclus gestart!")
                                                }
                                            }
                                        }}
                                        className="btn btn-primary"
                                        style={{ width: '100%', border: 'none', color: '#fff' }}
                                    >
                                        Nieuwe cyclus starten
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
                                <SelectOption label="Menstruatie" onClick={() => adjustCyclePhase('menstrual')} />
                                <SelectOption label="Folliculaire fase" onClick={() => adjustCyclePhase('follicular')} />
                                <SelectOption label="Ovulatie" onClick={() => adjustCyclePhase('ovulatory')} />
                                <SelectOption label="Luteale fase" onClick={() => adjustCyclePhase('luteal')} />
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
                        }
                    }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--color-text)', textDecoration: 'underline', cursor: 'pointer' }}
                >
                    Onboarding opnieuw doen
                </button>

                <button
                    onClick={logout}
                    style={{ background: 'transparent', border: 'none', color: 'var(--color-text)', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                >
                    Uitloggen
                </button>

                {!showDeleteConfirm ? (
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        style={{ background: 'transparent', border: 'none', color: '#D32F2F', fontSize: '0.8rem', cursor: 'pointer', textAlign: 'left', padding: 0, marginTop: '1rem' }}
                    >
                        Account verwijderen
                    </button>
                ) : (
                    <div style={{ background: '#FFF5F5', padding: '1rem', borderRadius: '12px', border: '1px solid #FFE3E3', marginTop: '1rem' }}>
                        <p style={{ fontSize: '0.85rem', color: '#D32F2F', marginBottom: '0.75rem', fontWeight: 600 }}>
                            Weet je het zeker? Dit verwijdert definitief al je data (logs, profiel en account) en kan niet ongedaan gemaakt worden.
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={isDeleting}
                                style={{
                                    flex: 1, padding: '0.6rem', borderRadius: '8px', border: 'none',
                                    background: '#D32F2F', color: 'white', fontSize: '0.85rem', fontWeight: 600,
                                    cursor: isDeleting ? 'not-allowed' : 'pointer', opacity: isDeleting ? 0.7 : 1
                                }}
                            >
                                {isDeleting ? 'Bezig...' : 'Ja, verwijder definitief'}
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeleting}
                                style={{
                                    flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--color-border)',
                                    background: 'white', color: 'var(--color-text)', fontSize: '0.85rem', fontWeight: 600,
                                    cursor: isDeleting ? 'not-allowed' : 'pointer'
                                }}
                            >
                                Annuleer
                            </button>
                        </div>
                    </div>
                )}
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
                    {isSaving ? "Opslaan..." : "Opslaan"}
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

// --- UI COMPONENTS ---

function SelectOption({ label, selected, onClick }) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: '1rem',
                border: selected ? '2.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                borderRadius: '16px',
                background: selected ? 'rgba(255, 174, 185, 0.05)' : 'var(--color-surface)',
                color: selected ? 'var(--color-primary)' : 'var(--color-text)',
                fontWeight: selected ? '700' : '500',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                fontSize: '0.95rem'
            }}
        >
            {label}
        </button>
    )
}

function CompactOption({ label, selected, onClick }) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: '0.75rem 0.5rem',
                border: selected ? '2.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                borderRadius: '12px',
                background: selected ? 'rgba(255, 174, 185, 0.05)' : 'var(--color-surface)',
                color: selected ? 'var(--color-primary)' : 'var(--color-text)',
                fontWeight: selected ? '700' : '500',
                width: '100%',
                fontSize: '0.82rem',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
            }}
        >
            {label}
        </button>
    )
}
