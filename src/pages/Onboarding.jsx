import React, { useState, useEffect } from 'react'
import { useUser } from '../context/UserContext'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { GOAL_TYPES } from '../logic/nutrition'
import logo from '../assets/logo-primary.png'

export default function Onboarding() {
    const { user, updateUser, completeOnboarding, saveProfileAndCalculate, logout } = useUser()
    const { signUp, user: authUser } = useAuth()
    const { t, language } = useLanguage()
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
        periodEnded: null, // null = not answered, 'yes' = still menstruating, 'no' = period ended
        periodEndDate: '',
        age: user.age || '',
        height: user.height || '',
        weight: user.weight || '',
        trainingFrequency: (user.training_days_per_week !== undefined && user.training_days_per_week !== null) ? user.training_days_per_week : 3,
        goal: user.goal || GOAL_TYPES.MAINTAIN,
        experienceLevel: user.experienceLevel || 'beginner',
        trainingType: user.trainingType || 'combination',
        resultTempo: user.resultTempo || 'average',
        targetWeight: user.targetWeight || '',
        lifestyle_level: user.lifestyle_level || 'sedentary',
        steps_range: user.steps_range || 'lt4k'
    })

    // NEW: Sync formData when user profile loads or changes (Fixes stale state bug)
    useEffect(() => {
        if (user && Object.keys(user).length > 0) {
            setFormData(prev => ({
                ...prev,
                name: prev.name || user.name || '',
                age: prev.age || user.age || '',
                height: prev.height || user.height || '',
                weight: prev.weight || user.weight || '',
                cycleStart: prev.cycleStart || user.cycleStart || '',
                cycleLength: prev.cycleLength || user.cycleLength || 28,
                periodLength: prev.periodLength || user.periodLength || 5,
                goal: prev.goal || user.goal || GOAL_TYPES.MAINTAIN,
                lifestyle_level: prev.lifestyle_level || user.lifestyle_level || 'sedentary',
                steps_range: prev.steps_range || user.steps_range || 'lt4k'
            }))
        }
    }, [user])

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    // Helper to ensure date is always YYYY-MM-DD for input
    const formatDateForInput = (val) => {
        if (!val) return '';
        try {
            const d = new Date(val);
            if (isNaN(d.getTime())) return '';
            return d.toISOString().split('T')[0];
        } catch (e) {
            return '';
        }
    }

    const handleProfileSubmit = async (data) => {
        setIsLoading(true);
        try {
            // 1. If not logged in, create account first
            let userId = authUser?.id;
            let needsVerification = false;
            if (!userId) {
                const signUpResult = await signUp(data.email, data.password);
                userId = signUpResult?.user?.id;
                needsVerification = !signUpResult?.session;
            }

            if (!userId) throw new Error(t('onboarding.error_account_creation'));

            // If email verification is required, store pending data and show step 8
            if (needsVerification) {
                localStorage.setItem('pending_onboarding_data', JSON.stringify(data));
                setStep(8);
                return;
            }

            // 2. Save & Calculate Exact Targets (Server-Side Logic)
            await saveProfileAndCalculate({
                ...data,
                id: userId,
                trainingFrequency: data.trainingFrequency,
                trainingType: data.trainingType,
                resultTempo: data.resultTempo,
                goal: data.goal
            });

            // 3. Move to Step 7 (Success Screen)
            setStep(7);

            // 4. Navigation is handled by Step 7 finish button
        } catch (error) {
            console.error("Onboarding Error:", error);
            alert(t('onboarding.error_generic') + ": " + error.message); // Show error to user
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
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>

                <div style={{ marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
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

                <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#c4506a', position: 'relative', zIndex: 1 }}>
                    {t('onboarding.welcome_title')}
                </h1>
                <p className="text-muted" style={{ maxWidth: '300px', margin: '0 auto 3rem auto' }}>
                    {t('onboarding.welcome_subtitle')}
                </p>

                <button className="btn btn-primary" onClick={() => setStep(1)} style={{ minWidth: '200px', position: 'relative', zIndex: 1 }}>
                    {t('onboarding.start_now')}
                </button>

                <div style={{ marginTop: '2rem', position: 'relative', zIndex: 1 }}>
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
                        {t('onboarding.logout_other')}
                    </button>
                </div>
            </div>
        )
    }

    // Steps 1-6: Profile Setup (Updated Flow)
    return (
        <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: '100px', position: 'relative', overflow: 'hidden' }}>


            {/* Progress */}
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '6px', background: 'var(--color-surface)', zIndex: 20 }}>
                <div style={{ height: '100%', width: `${Math.min(step, 6) / 6 * 100}%`, background: 'var(--color-primary)', transition: 'width 0.3s ease-out' }} />
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
                        visibility: step === 7 ? 'hidden' : 'visible',
                        border: 'none',
                        background: 'none',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        whiteSpace: 'nowrap',
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em'
                    }}
                >
                    &larr; {t('onboarding.back')}
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
                    {step <= 6 && <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0 }}>{t('onboarding.step_x_of_y').replace('{step}', step)}</p>}
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
                            {t('onboarding.logout')}
                        </button>
                    )}
                </div>
            </header>

            <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>

                {/* STEP 1: CYCLUS */}
                {step === 1 && (
                    <div className="fade-in">
                        <div className="text-center">
                            <h2 style={{ marginBottom: '0.5rem' }}>{t('onboarding.step1_title')}</h2>
                            <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                {t('onboarding.step1_subtitle')}
                            </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                                    <label style={labelStyle}>{t('onboarding.last_period_start')}</label>
                                    <button
                                        onClick={() => {
                                            handleChange('cycleStart', new Date().toISOString().split('T')[0])
                                            handleChange('periodEnded', 'yes')
                                            handleChange('periodEndDate', '')
                                        }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--color-primary)',
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            textDecoration: 'underline',
                                            padding: 0
                                        }}
                                    >
                                        {t('onboarding.today')}
                                    </button>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="date"
                                        value={formatDateForInput(formData.cycleStart)}
                                        onChange={e => {
                                            handleChange('cycleStart', e.target.value)
                                            // Reset the period status when date changes
                                            const isToday = e.target.value === new Date().toISOString().split('T')[0]
                                            handleChange('periodEnded', isToday ? 'yes' : null)
                                            handleChange('periodEndDate', '')
                                        }}
                                        style={{
                                            ...inputStyle,
                                            WebkitAppearance: 'none', // fixes iOS native styling issues
                                            minHeight: '3.5rem', // Ensure same height as other inputs
                                            color: formData.cycleStart ? 'var(--color-text)' : 'transparent' // Hide default d/m/y text if empty
                                        }}
                                        max={new Date().toISOString().split('T')[0]}
                                    />
                                    {!formData.cycleStart && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '1rem',
                                            transform: 'translateY(-50%)',
                                            color: 'var(--color-text-muted)',
                                            pointerEvents: 'none',
                                            fontSize: '1rem'
                                        }}>
                                            {t('onboarding.pick_date')}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Show "still menstruating?" only when a past date is selected */}
                            {formData.cycleStart && formData.cycleStart !== new Date().toISOString().split('T')[0] && (
                                <div style={{ 
                                    background: 'var(--color-bg)', 
                                    borderRadius: '12px', 
                                    padding: '1rem',
                                    border: '1px solid var(--color-border)'
                                }}>
                                    <label style={{ ...labelStyle, marginBottom: '0.75rem', display: 'block' }}>
                                        {t('onboarding.still_menstruating')}
                                    </label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => {
                                                handleChange('periodEnded', 'yes')
                                                handleChange('periodEndDate', '')
                                            }}
                                            style={{
                                                flex: 1,
                                                padding: '0.75rem',
                                                borderRadius: '10px',
                                                border: formData.periodEnded === 'yes' ? 'none' : '1px solid var(--color-border)',
                                                background: formData.periodEnded === 'yes' ? 'var(--color-primary)' : 'transparent',
                                                color: formData.periodEnded === 'yes' ? '#333333' : 'var(--color-text)',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {t('onboarding.still_menstruating_yes')}
                                        </button>
                                        <button
                                            onClick={() => handleChange('periodEnded', 'no')}
                                            style={{
                                                flex: 1,
                                                padding: '0.75rem',
                                                borderRadius: '10px',
                                                border: formData.periodEnded === 'no' ? 'none' : '1px solid var(--color-border)',
                                                background: formData.periodEnded === 'no' ? 'var(--color-primary)' : 'transparent',
                                                color: formData.periodEnded === 'no' ? '#333333' : 'var(--color-text)',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {t('onboarding.still_menstruating_no')}
                                        </button>
                                    </div>

                                    {/* Show end date picker when "no" is selected */}
                                    {formData.periodEnded === 'no' && (
                                        <div style={{ marginTop: '0.75rem' }}>
                                            <label style={{ ...labelStyle, marginBottom: '0.2rem', display: 'block' }}>
                                                {t('onboarding.period_end_date')}
                                            </label>
                                            <input
                                                type="date"
                                                value={formatDateForInput(formData.periodEndDate)}
                                                onChange={e => handleChange('periodEndDate', e.target.value)}
                                                min={formatDateForInput(formData.cycleStart)}
                                                max={new Date().toISOString().split('T')[0]}
                                                style={{
                                                    ...inputStyle,
                                                    WebkitAppearance: 'none',
                                                    minHeight: '3.5rem'
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            <div>
                                <label style={labelStyle}>{t('onboarding.avg_cycle_length')}</label>
                                <input
                                    type="number"
                                    value={formData.cycleLength}
                                    onChange={e => {
                                        const val = parseInt(e.target.value);
                                        handleChange('cycleLength', isNaN(val) ? '' : val);
                                    }}
                                    placeholder={t('onboarding.placeholder_cycle_length')}
                                    style={inputStyle}
                                />

                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                    {[26, 28, 30, 32].map(len => (
                                        <button
                                            key={len}
                                            onClick={() => handleChange('cycleLength', len)}
                                            style={{
                                                padding: '0.4rem 0.8rem',
                                                borderRadius: '20px',
                                                border: formData.cycleLength === len ? 'none' : '1px solid var(--color-border)',
                                                background: formData.cycleLength === len ? 'var(--color-primary)' : 'transparent',
                                                color: formData.cycleLength === len ? '#333333' : 'var(--color-text-muted)',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {len} {t('onboarding.days')}
                                        </button>
                                    ))}
                                </div>

                            </div>

                            <div>
                                <label style={labelStyle}>{t('onboarding.avg_period_length')}</label>
                                <input
                                    type="number"
                                    value={formData.periodLength || ''}
                                    onChange={e => {
                                        const val = parseInt(e.target.value);
                                        handleChange('periodLength', isNaN(val) ? '' : val);
                                    }}
                                    placeholder="5"
                                    style={inputStyle}
                                />

                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: LICHAAM */}
                {step === 2 && (
                    <div className="fade-in">
                        <div className="text-center">
                            <h2 style={{ marginBottom: '0.5rem' }}>{t('onboarding.step2_title')}</h2>
                            <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                {t('onboarding.step2_subtitle')}
                            </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>{t('onboarding.age')}</label>
                                <input
                                    type="number"
                                    value={formData.age}
                                    onChange={e => handleChange('age', e.target.value)}
                                    placeholder={t('onboarding.placeholder_age')}
                                    style={inputStyle}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>{t('onboarding.height')}</label>
                                    <input
                                        type="number"
                                        value={formData.height}
                                        onChange={e => handleChange('height', e.target.value)}
                                        placeholder={t('onboarding.placeholder_height')}
                                        style={inputStyle}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>{t('onboarding.weight')}</label>
                                    <input
                                        type="number"
                                        value={formData.weight}
                                        onChange={e => handleChange('weight', e.target.value)}
                                        placeholder={t('onboarding.placeholder_weight')}
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
                            <h2 style={{ marginBottom: '0.5rem' }}>{t('onboarding.step3_title')}</h2>
                            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                                {t('onboarding.step3_subtitle')}
                            </p>
                        </div>

                        {/* 1. Goal */}
                        <div>
                            <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>{t('onboarding.your_goal')}</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <SelectOption label={t('onboarding.goal_lose_fat')} selected={formData.goal === GOAL_TYPES.LOSE_FAT} onClick={() => handleChange('goal', GOAL_TYPES.LOSE_FAT)} />
                                <SelectOption label={t('onboarding.goal_recomp')} selected={formData.goal === GOAL_TYPES.RECOMP} onClick={() => handleChange('goal', GOAL_TYPES.RECOMP)} />
                                <SelectOption label={t('onboarding.goal_maintain')} selected={formData.goal === GOAL_TYPES.MAINTAIN} onClick={() => handleChange('goal', GOAL_TYPES.MAINTAIN)} />
                                <SelectOption label={t('onboarding.goal_gain')} selected={formData.goal === GOAL_TYPES.GAIN} onClick={() => handleChange('goal', GOAL_TYPES.GAIN)} />
                            </div>
                        </div>

                        {/* 2. Target Weight */}
                        <div>
                            <label style={labelStyle}>{t('onboarding.target_weight')}</label>
                            <input
                                type="number"
                                value={formData.targetWeight}
                                onChange={e => handleChange('targetWeight', e.target.value)}
                                placeholder={t('onboarding.placeholder_target_weight')}
                                style={inputStyle}
                            />
                        </div>

                        {/* 3. Tempo */}
                        <div>
                            <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>{t('onboarding.tempo')}</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <CompactOption label={t('onboarding.tempo_slow')} selected={formData.resultTempo === 'slow'} onClick={() => handleChange('resultTempo', 'slow')} />
                                <CompactOption label={t('onboarding.tempo_average')} selected={formData.resultTempo === 'average'} onClick={() => handleChange('resultTempo', 'average')} />
                                <CompactOption label={t('onboarding.tempo_fast')} selected={formData.resultTempo === 'fast'} onClick={() => handleChange('resultTempo', 'fast')} />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 4: ACTIVITEIT (Split Part 2) */}
                {step === 4 && (
                    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="text-center">
                            <h2 style={{ marginBottom: '0.5rem' }}>{t('onboarding.step4_title')}</h2>
                            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                                {t('onboarding.step4_subtitle')}
                            </p>
                        </div>

                        {/* 1. Lifestyle Level */}
                        <div>
                            <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>{t('onboarding.lifestyle')}</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <SelectOption
                                    label={t('onboarding.lifestyle_sedentary')}
                                    selected={formData.lifestyle_level === 'sedentary'}
                                    onClick={() => handleChange('lifestyle_level', 'sedentary')}
                                />
                                <SelectOption
                                    label={t('onboarding.lifestyle_mixed')}
                                    selected={formData.lifestyle_level === 'mixed'}
                                    onClick={() => handleChange('lifestyle_level', 'mixed')}
                                />
                                <SelectOption
                                    label={t('onboarding.lifestyle_active')}
                                    selected={formData.lifestyle_level === 'active'}
                                    onClick={() => handleChange('lifestyle_level', 'active')}
                                />
                            </div>
                        </div>

                        {/* 2. Steps Range */}
                        <div>
                            <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>{t('onboarding.steps')}</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                                <SelectOption label={t('onboarding.steps_lt4k')} selected={formData.steps_range === 'lt4k'} onClick={() => handleChange('steps_range', 'lt4k')} />
                                <SelectOption label={t('onboarding.steps_4k_8k')} selected={formData.steps_range === '4k_8k'} onClick={() => handleChange('steps_range', '4k_8k')} />
                                <SelectOption label={t('onboarding.steps_8k_12k')} selected={formData.steps_range === '8k_12k'} onClick={() => handleChange('steps_range', '8k_12k')} />
                                <SelectOption label={t('onboarding.steps_gt12k')} selected={formData.steps_range === 'gt12k'} onClick={() => handleChange('steps_range', 'gt12k')} />
                            </div>
                        </div>

                        {/* 3. Frequency (0-7) */}
                        <div>
                            <label style={labelStyle}>{t('onboarding.training_days')}</label>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between' }}>
                                {[0, 1, 2, 3, 4, 5, 6, 7].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => handleChange('trainingFrequency', val)}
                                        style={{
                                            flex: 1,
                                            padding: '0.8rem 0',
                                            border: formData.trainingFrequency === val ? '2.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                                            borderRadius: '12px',
                                            background: formData.trainingFrequency === val ? 'rgba(255, 174, 185, 0.05)' : 'transparent',
                                            color: formData.trainingFrequency === val ? 'var(--color-primary)' : 'var(--color-text)',
                                            fontWeight: formData.trainingFrequency === val ? '700' : '400',
                                            fontSize: '0.9rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
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
                        <div className="text-center">
                            <h2 style={{ marginBottom: '0.5rem' }}>{t('onboarding.step5_title')}</h2>
                            <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                {t('onboarding.step5_subtitle')}
                            </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <SelectOption
                                label={t('onboarding.exp_beginner')}
                                selected={formData.experienceLevel === 'beginner'}
                                onClick={() => handleChange('experienceLevel', 'beginner')}
                            />
                            <SelectOption
                                label={t('onboarding.exp_intermediate')}
                                selected={formData.experienceLevel === 'intermediate'}
                                onClick={() => handleChange('experienceLevel', 'intermediate')}
                            />
                            <SelectOption
                                label={t('onboarding.exp_advanced')}
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
                            {authUser ? t('onboarding.step6_title_authed') : t('onboarding.step6_title_new')}
                        </h2>
                        <p className="text-center text-muted" style={{ marginBottom: '2rem' }}>
                            {authUser
                                ? t('onboarding.step6_sub_authed')
                                : t('onboarding.step6_sub_new')}
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>{t('onboarding.name')}</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => handleChange('name', e.target.value)}
                                    placeholder={t('onboarding.name_placeholder')}
                                    style={inputStyle}
                                />
                            </div>

                            {!authUser && (
                                <>
                                    <div>
                                        <label style={labelStyle}>{t('onboarding.email')}</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={e => handleChange('email', e.target.value)}
                                            placeholder={t('onboarding.email_placeholder')}
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>{t('onboarding.password')}</label>
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

                {/* STEP 7: RESULTS REVEAL */}
                {step === 7 && (
                    <div className="fade-in" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>{t('onboarding.step7_title')}</h2>
                            <p className="text-muted">{t('onboarding.step7_subtitle')}</p>
                        </div>
                        
                        <div className="card" style={{ padding: '1.5rem', background: '#FFFFFF', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderRadius: '16px' }}>
                            <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: '600', marginBottom: '1rem' }}>
                                {t('today.daily_goal')}
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-text)', marginBottom: '1rem' }}>
                                {user?.macroTargets?.calories || 2000} <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontWeight: '500' }}>kcal</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-carbs)' }}>{user?.macroTargets?.carbsMin || 0}g</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{t('today.carbs')}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-protein)' }}>{user?.macroTargets?.proteinMin || 0}g</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{t('today.proteins')}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-fat)' }}>{user?.macroTargets?.fatMin || 0}g</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{t('today.fats')}</div>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--color-primary)', background: '#FFFFFF', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderRadius: '16px', textAlign: 'left' }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                                {language === 'en' ? 'Current Phase:' : 'Huidige fase:'}
                            </div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-text)', textTransform: 'capitalize' }}>
                                {t(`profile.phases.${user?.currentPhase || 'follicular'}`)}
                            </div>
                        </div>

                        <button 
                            onClick={async () => {
                                setIsLoading(true);
                                await completeOnboarding();
                                setIsLoading(false);
                            }} 
                            className="btn btn-primary" 
                            style={{ marginTop: '1rem', padding: '1rem', fontSize: '1.1rem' }}
                            disabled={isLoading}
                        >
                            {isLoading ? t('common.loading') : "Start 7 dagen gratis"}
                        </button>
                    </div>
                )}

                {/* STEP 8: EMAIL VERIFICATION */}
                {step === 8 && (
                    <div className="fade-in" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>{t('onboarding.verify_email_title', { defaultValue: 'Verifieer je e-mail' })}</h2>
                            <p className="text-muted">{t('onboarding.verify_email_subtitle', { defaultValue: 'We hebben een bevestigingslink naar je e-mailadres gestuurd. Klik op de link om je account te activeren. Je kunt dit venster daarna sluiten.' })}</p>
                        </div>
                    </div>
                )}

            </div>

            {step !== 7 && step !== 8 && (
                <div style={{ marginTop: '2rem', paddingBottom: '2rem', position: 'relative', zIndex: 1 }}>
                    <button className="btn btn-primary" onClick={handleNext} disabled={isLoading || !isValid(step, formData, !!authUser)}>
                        {isLoading ? t('onboarding.saving') : (step === 6 ? (authUser ? t('onboarding.save_start_authed') : t('onboarding.save_start_new')) : t('onboarding.next'))}
                    </button>
                </div>
            )}


        </div>
    )
}

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

const labelStyle = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--color-text-muted)',
    marginBottom: '0.6rem'
}

const inputStyle = {
    width: '100%',
    padding: '1rem',
    fontSize: '1rem',
    border: '1px solid var(--color-border)',
    borderRadius: '12px',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    transition: 'all 0.2s ease'
}

function isValid(step, data, isAuthed) {
    if (step === 1) {
        // Very lenient validation: just needs a truthy date and a number > 10 for cycle length
        if (!data.cycleStart) return false;
        if (!data.cycleLength || isNaN(data.cycleLength) || data.cycleLength < 10) return false;
        // If a past date is selected, user must answer the "still menstruating?" question
        const isToday = data.cycleStart === new Date().toISOString().split('T')[0];
        if (!isToday && !data.periodEnded) return false;
        // If they said "no", they need to provide an end date
        if (data.periodEnded === 'no' && !data.periodEndDate) return false;
        return true;
    }
    
    if (step === 2 && (!data.age || !data.height || !data.weight)) return false

    // Step 3: Goals (Must have goal)
    if (step === 3 && !data.goal) return false

    // Step 4: Activity (Must have lifestyle, steps, frequency)
    // Frequency 0 is valid, so check undefined/null explicitly
    if (step === 4 && (
        !data.lifestyle_level ||
        !data.steps_range ||
        data.trainingFrequency === undefined ||
        data.trainingFrequency === null ||
        data.trainingFrequency === ''
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
