import React, { useState, useEffect } from 'react'
import { useUser } from '../context/UserContext'
import { useAuth } from '../context/AuthContext'
import { GOAL_TYPES } from '../logic/nutrition'
import logo from '../assets/logo-primary.svg'

export default function Onboarding() {
    const { user, updateUser, completeOnboarding, saveProfileAndCalculate, logout } = useUser()
    const { signUp, user: authUser } = useAuth()
    const [step, setStep] = useState(0) // Start at Step 0 (Welcome)

    // NEW: Auto-skip Welcome Screen if already logged in
    useEffect(() => {
        if (authUser && step === 0) {
            setStep(1)
        }
    }, [authUser, step])

    const [isLoading, setIsLoading] = useState(false)

    const [formData, setFormData] = useState({
        name: authUser?.user_metadata?.name || '',
        email: authUser?.email || '',
        password: '',
        cycleStart: user.cycleStart || '',
        cycleLength: user.cycleLength || 28,
        periodLength: user.periodLength || 5,
        age: user.age || '',
        height: user.height || '',
        weight: user.weight || '',
        trainingFrequency: user.training_days_per_week !== undefined ? user.training_days_per_week : 3,
        goal: user.goal || GOAL_TYPES.MAINTAIN,
        experienceLevel: user.experienceLevel || 'beginner',
        trainingType: user.trainingType || 'combination',
        resultTempo: user.resultTempo || 'average',
        targetWeight: user.targetWeight || '',
        // New MVP Fields
        lifestyle_level: user.lifestyle_level || 'sedentary',
        steps_range: user.steps_range || 'lt4k'
    })

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleProfileSubmit = async (data) => {
        setIsLoading(true);
        try {
            console.log("=== Starting Onboarding Submission ===");
            console.log("Onboarding Data:", data);

            // 1. If not logged in, create account first (moved here from handleNext)
            if (!authUser) {
                console.log("Creating new account...");
                await signUp(data.email, data.password);
                console.log("✅ Account created successfully");
            } else {
                console.log("User already authenticated:", authUser.email);
            }

            // 2. Save & Calculate Exact Targets (Server-Side Logic)
            console.log("Saving profile and calculating targets...");
            await saveProfileAndCalculate({
                ...data,
                // Ensure mapping matches what saveProfileAndCalculate expects
                trainingFrequency: data.trainingFrequency,
                trainingType: data.trainingType,
                resultTempo: data.resultTempo,
                goal: data.goal
            });
            console.log("✅ Profile saved and targets calculated");

            // 3. Complete Onboarding
            console.log("Completing onboarding...");
            await completeOnboarding();
            console.log("✅ Onboarding completed!");

            // 4. Navigation is handled by App.jsx based on isOnboarded state
        } catch (error) {
            console.error("❌ Onboarding Error:", error);
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
            alert("Er ging iets mis: " + error.message); // Show error to user
        } finally {
            setIsLoading(false);
        }
    };

    const handleNext = async () => {
        if (step < 6) { // Increased step count to 6
            setStep(step + 1)
        } else {
            // FINISH STEP (Step 6)
            await handleProfileSubmit(formData);
        }
    }

    // NEW: Back Function
    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1)
        }
    }

    // Step 0: Welcome Screen
    if (step === 0) {
        return (
            <div className="container" style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center'
            }}>
                <div style={{ marginBottom: '3rem' }}>
                    <img
                        src={logo}
                        alt="Cyclus Logo"
                        style={{
                            height: '160px',
                            width: 'auto',
                            objectFit: 'contain'
                        }}
                    />
                </div>

                <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
                    Train en eet afgestemd op jouw cyclus
                </h1>
                <p className="text-muted" style={{ maxWidth: '300px', margin: '0 auto 3rem auto' }}>
                    Op basis van jouw lichaam, doelen en energie
                </p>

                <button className="btn btn-primary" onClick={() => setStep(1)} style={{ minWidth: '200px' }}>
                    START NU
                </button>

                <div style={{ marginTop: '2rem' }}>
                    <button
                        onClick={logout}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-text-muted)',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        Log uit / Ander account
                    </button>
                </div>
            </div>
        )
    }

    // Steps 1-6: Profile Setup (Updated Flow)
    return (
        <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: '100px' }}>

            {/* Progress */}
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '4px', background: 'var(--color-surface)', zIndex: 20 }}>
                <div style={{ height: '100%', width: `${Math.min(step, 6) / 6 * 100}%`, background: 'var(--color-primary)', transition: 'width 0.3s' }} />
            </div>

            <header style={{
                marginBottom: '1.5rem',
                marginTop: '1.5rem',
                display: 'grid',
                gridTemplateColumns: 'min-content 1fr min-content',
                alignItems: 'center',
                width: '100%'
            }}>
                {/* Back Button */}
                <button
                    onClick={handleBack}
                    style={{
                        border: 'none',
                        background: 'none',
                        fontSize: '0.9rem',
                        color: 'var(--color-primary)', // Using primary color for visibility
                        cursor: 'pointer',
                        padding: '0.5rem',
                        whiteSpace: 'nowrap'
                    }}
                >
                    ← Terug
                </button>

                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img
                        src={logo}
                        alt="Cyclus Logo"
                        style={{
                            height: '42px', // Slightly smaller
                            width: 'auto',
                            marginBottom: '0.2rem',
                            objectFit: 'contain'
                        }}
                    />
                    {step <= 6 && <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0 }}>Stap {step} van 6</p>}
                </div>

                {/* Logout Button (Top Right) */}
                <div style={{ width: '60px', display: 'flex', justifyContent: 'flex-end' }}>
                    {authUser && (
                        <button
                            onClick={logout}
                            style={{
                                border: 'none',
                                background: 'none',
                                fontSize: '0.8rem',
                                color: 'var(--color-text-muted)',
                                cursor: 'pointer',
                                padding: '0',
                                textDecoration: 'underline'
                            }}
                        >
                            Log uit
                        </button>
                    )}
                </div>
            </header>

            <div style={{ flex: 1 }}>

                {/* STEP 1: CYCLUS */}
                {step === 1 && (
                    <div className="fade-in">
                        <h2 className="text-center" style={{ marginBottom: '1.5rem' }}>Jouw Cyclus</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Startdatum laatste menstruatie</label>
                                <input
                                    type="date"
                                    value={formData.cycleStart ? String(formData.cycleStart).substr(0, 10) : ''}
                                    onChange={e => handleChange('cycleStart', e.target.value)}
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Gemiddelde cycluslengte (dagen)</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    {[21, 24, 26, 28].map(len => (
                                        <CompactOption
                                            key={len}
                                            label={len.toString()}
                                            selected={parseInt(formData.cycleLength) === len}
                                            onClick={() => handleChange('cycleLength', len)}
                                        />
                                    ))}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                                    {[30, 32].map(len => (
                                        <CompactOption
                                            key={len}
                                            label={len.toString()}
                                            selected={parseInt(formData.cycleLength) === len}
                                            onClick={() => handleChange('cycleLength', len)}
                                        />
                                    ))}
                                    <CompactOption
                                        label="Weet niet"
                                        selected={false} // Visual only, or maybe set a flag? For now acts as 28 default if clicked?
                                        onClick={() => handleChange('cycleLength', 28)}
                                    />
                                </div>
                                <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                                    {parseInt(formData.cycleLength) === 28 ? "28 dagen (standaard) geselecteerd" : `${formData.cycleLength} dagen geselecteerd`}
                                </p>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Gemiddelde menstruatieduur (optioneel)</label>
                                <input
                                    type="number"
                                    value={formData.periodLength}
                                    onChange={e => handleChange('periodLength', parseInt(e.target.value) || 5)}
                                    placeholder="5"
                                    style={inputStyle}
                                />
                                <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                    Standaard 5 dagen. Dit helpt ons de fases beter in te schatten.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: LICHAAM */}
                {step === 2 && (
                    <div className="fade-in">
                        <h2 className="text-center" style={{ marginBottom: '1.5rem' }}>Over jouw lichaam</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Leeftijd</label>
                                <input
                                    type="number"
                                    value={formData.age}
                                    onChange={e => handleChange('age', e.target.value)}
                                    placeholder="Bijv. 30"
                                    style={inputStyle}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Lengte (cm)</label>
                                    <input
                                        type="number"
                                        value={formData.height}
                                        onChange={e => handleChange('height', e.target.value)}
                                        placeholder="Bijv. 170"
                                        style={inputStyle}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Gewicht (kg)</label>
                                    <input
                                        type="number"
                                        value={formData.weight}
                                        onChange={e => handleChange('weight', e.target.value)}
                                        placeholder="Bijv. 65"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: DOEL (Split Part 1) */}
                {step === 3 && (
                    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="text-center">
                            <h2 style={{ marginBottom: '0.5rem' }}>Wat is je doel?</h2>
                            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                                Op basis hiervan berekenen we jouw calorieën en macro’s.
                            </p>
                        </div>

                        {/* 1. Goal */}
                        <div>
                            <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>Jouw Doel</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <SelectOption label="Afvallen" selected={formData.goal === GOAL_TYPES.LOSE_FAT} onClick={() => handleChange('goal', GOAL_TYPES.LOSE_FAT)} />
                                <SelectOption label="Afvallen met spieropbouw" selected={formData.goal === GOAL_TYPES.RECOMP} onClick={() => handleChange('goal', GOAL_TYPES.RECOMP)} />
                                <SelectOption label="Op gewicht blijven" selected={formData.goal === GOAL_TYPES.MAINTAIN} onClick={() => handleChange('goal', GOAL_TYPES.MAINTAIN)} />
                                <SelectOption label="Spiermassa opbouwen" selected={formData.goal === GOAL_TYPES.GAIN} onClick={() => handleChange('goal', GOAL_TYPES.GAIN)} />
                            </div>
                        </div>

                        {/* 2. Target Weight */}
                        <div>
                            <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>Streefgewicht (optioneel)</label>
                            <input
                                type="number"
                                value={formData.targetWeight}
                                onChange={e => handleChange('targetWeight', e.target.value)}
                                placeholder="Bijv. 60"
                                style={{ ...inputStyle, marginTop: 0 }}
                            />
                        </div>

                        {/* 3. Tempo */}
                        <div>
                            <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>Tempo</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <CompactOption label="Rustig & duurzaam" selected={formData.resultTempo === 'slow'} onClick={() => handleChange('resultTempo', 'slow')} />
                                <CompactOption label="Gemiddeld tempo" selected={formData.resultTempo === 'average'} onClick={() => handleChange('resultTempo', 'average')} />
                                <CompactOption label="Snel resultaat" selected={formData.resultTempo === 'fast'} onClick={() => handleChange('resultTempo', 'fast')} />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 4: ACTIVITEIT (Split Part 2) */}
                {step === 4 && (
                    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="text-center">
                            <h2 style={{ marginBottom: '0.5rem' }}>Hoe beweeg jij?</h2>
                            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                                Dit bepaalt hoeveel energie je dagelijks nodig hebt.
                            </p>
                        </div>

                        {/* 1. Lifestyle Level */}
                        <div>
                            <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>Werk & leefstijl</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <SelectOption
                                    label="Vooral zittend"
                                    selected={formData.lifestyle_level === 'sedentary'}
                                    onClick={() => handleChange('lifestyle_level', 'sedentary')}
                                />
                                <SelectOption
                                    label="Afwisselend"
                                    selected={formData.lifestyle_level === 'mixed'}
                                    onClick={() => handleChange('lifestyle_level', 'mixed')}
                                />
                                <SelectOption
                                    label="Vooral staand / fysiek"
                                    selected={formData.lifestyle_level === 'active'}
                                    onClick={() => handleChange('lifestyle_level', 'active')}
                                />
                            </div>
                        </div>

                        {/* 2. Steps Range */}
                        <div>
                            <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>Dagelijkse stappen</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                                <SelectOption label="Minder dan 4.000 stappen" selected={formData.steps_range === 'lt4k'} onClick={() => handleChange('steps_range', 'lt4k')} />
                                <SelectOption label="4.000 – 7.000 stappen" selected={formData.steps_range === 'k4_7'} onClick={() => handleChange('steps_range', 'k4_7')} />
                                <SelectOption label="7.000 – 10.000 stappen" selected={formData.steps_range === 'k7_10'} onClick={() => handleChange('steps_range', 'k7_10')} />
                                <SelectOption label="Meer dan 10.000 stappen" selected={formData.steps_range === 'gt10k'} onClick={() => handleChange('steps_range', 'gt10k')} />
                            </div>
                        </div>

                        {/* 3. Frequency (0-7) */}
                        <div>
                            <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>Kracht/Training (dagen p/w)</label>
                            <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'space-between' }}>
                                {[0, 1, 2, 3, 4, 5, 6, 7].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => handleChange('trainingFrequency', val)}
                                        style={{
                                            flex: 1,
                                            padding: '0.6rem 0',
                                            border: formData.trainingFrequency === val ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                            borderRadius: '8px',
                                            background: formData.trainingFrequency === val ? 'var(--color-surface)' : 'transparent',
                                            color: formData.trainingFrequency === val ? 'var(--color-primary)' : 'var(--color-text)',
                                            fontWeight: formData.trainingFrequency === val ? '600' : '400',
                                            fontSize: '0.9rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 5: ERVARING (Shifted) */}
                {step === 5 && (
                    <div className="fade-in">
                        <h2 className="text-center" style={{ marginBottom: '1.5rem' }}>Hoeveel ervaring heb je?</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <SelectOption
                                label="Beginner"
                                selected={formData.experienceLevel === 'beginner'}
                                onClick={() => handleChange('experienceLevel', 'beginner')}
                            />
                            <SelectOption
                                label="Enige ervaring"
                                selected={formData.experienceLevel === 'intermediate'}
                                onClick={() => handleChange('experienceLevel', 'intermediate')}
                            />
                            <SelectOption
                                label="Gevorderd"
                                selected={formData.experienceLevel === 'advanced'}
                                onClick={() => handleChange('experienceLevel', 'advanced')}
                            />
                        </div>
                    </div>
                )}

                {/* STEP 6: ACCOUNT (Shifted) */}
                {step === 6 && (
                    <div className="fade-in">
                        <h2 className="text-center" style={{ marginBottom: '1.5rem' }}>
                            {authUser ? 'Bijna klaar!' : 'Maak je account aan'}
                        </h2>
                        <p className="text-center text-muted" style={{ marginBottom: '2rem' }}>
                            {authUser
                                ? 'We slaan je profiel veilig op.'
                                : 'Sla je gegevens veilig op.'}
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Naam</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => handleChange('name', e.target.value)}
                                    placeholder="Je voornaam"
                                    style={inputStyle}
                                />
                            </div>

                            {!authUser && (
                                <>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Email</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={e => handleChange('email', e.target.value)}
                                            placeholder="jouw@email.com"
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Wachtwoord</label>
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={e => handleChange('password', e.target.value)}
                                            placeholder="••••••••"
                                            style={inputStyle}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

            </div>

            <div style={{ marginTop: '2rem', paddingBottom: '2rem' }}>
                <div style={{ marginTop: '2rem', paddingBottom: '2rem' }}>
                    <button className="btn btn-primary" onClick={handleNext} disabled={!isValid(step, formData, !!authUser)}>
                        {step === 6 ? (authUser ? 'Profiel Opslaan & Starten' : 'Account aanmaken & Starten') : 'Volgende'}
                    </button>
                </div>
            </div>


        </div>
    )
}

function SelectOption({ label, selected, onClick }) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: '0.8rem 1rem', // Reduced padding
                border: selected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                background: selected ? 'var(--color-surface)' : 'transparent',
                color: selected ? 'var(--color-primary)' : 'var(--color-text)',
                fontWeight: selected ? '600' : '400',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.2s',
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
                padding: '0.6rem',
                border: selected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                borderRadius: '8px',
                background: selected ? 'var(--color-surface)' : 'transparent',
                color: selected ? 'var(--color-primary)' : 'var(--color-text)',
                fontWeight: selected ? '600' : '400',
                width: '100%',
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            }}
        >
            {label}
        </button>
    )
}

const inputStyle = {
    width: '100%',
    padding: '1rem',
    fontSize: '1.1rem',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    marginTop: '0.5rem',
    background: 'var(--color-surface)',
    color: 'var(--color-text)'
}

function isValid(step, data, isAuthed) {
    if (step === 1 && !data.cycleStart) return false
    if (step === 2 && (!data.age || !data.height || !data.weight)) return false

    // Step 3: Goals (Must have goal)
    if (step === 3 && !data.goal) return false

    // Step 4: Activity (Must have lifestyle, steps, frequency)
    // Frequency 0 is valid, so check undefined/null
    if (step === 4 && (
        !data.lifestyle_level ||
        !data.steps_range ||
        data.trainingFrequency === undefined ||
        data.trainingFrequency === null
    )) return false

    // Step 5: Experience
    if (step === 5 && !data.experienceLevel) return false

    // Step 6: Account
    if (step === 6) {
        if (!data.name) return false
        // If NOT authed, we need email and password. If authed, we don't.
        if (!isAuthed && (!data.email || !data.password)) return false
    }

    return true
}
