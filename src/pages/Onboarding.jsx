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

    // FLOW:
    // Step 0: Welcome
    // Step 1: Account creation (name, email, password)
    // Step 2: Email verification screen
    // --- user clicks email link, comes back, authUser is set ---
    // Step 3: Cyclus info (start date, cycle length, period length)
    // Step 4: Lichaam (age, height, weight)
    // Step 5: Doel + tempo + target weight
    // Step 6: Activiteit (lifestyle, steps, frequency)
    // Step 7: Ervaring
    // Step 8: Voedingsvoorkeur
    // Step 9: Resultaten + "Start 7 dagen gratis" knop

    // Auto-skip to the right step based on auth state
    useEffect(() => {
        if (authUser && step <= 2) {
            // User is logged in (either just verified email or returning user)
            // Skip welcome + account + verification, go straight to onboarding questions
            setStep(3);
        }
    }, [authUser]) // Only run when authUser changes, not on every step change

    const [isLoading, setIsLoading] = useState(false)

    const [formData, setFormData] = useState({
        name: authUser?.user_metadata?.name || '',
        email: authUser?.email || '',
        password: '',
        cycleStart: user.cycleStart || '',
        cycleLength: user.cycleLength || 28,
        periodLength: user.periodLength || 5,
        periodEnded: user.cycleStart ? 'no' : null, // If they already have a cycleStart, don't block them with a null answer
        periodEndDate: user.cycleStart ? user.cycleStart : '',
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
        steps_range: user.steps_range || 'lt4k',
        dietary_preference: user.dietary_preference || 'everything'
    })

    // Sync formData when user profile loads or changes
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
                periodEnded: prev.periodEnded !== null ? prev.periodEnded : (user.cycleStart ? 'no' : null),
                periodEndDate: prev.periodEndDate || (user.cycleStart ? user.cycleStart : ''),
                goal: prev.goal || user.goal || GOAL_TYPES.MAINTAIN,
                lifestyle_level: prev.lifestyle_level || user.lifestyle_level || 'sedentary',
                steps_range: prev.steps_range || user.steps_range || 'lt4k',
                dietary_preference: prev.dietary_preference || user.dietary_preference || 'everything'
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

    // Step 1: Create account
    const handleAccountSubmit = async () => {
        setIsLoading(true);
        try {
            const signUpResult = await signUp(formData.email, formData.password);
            const userId = signUpResult?.user?.id;
            const needsVerification = !signUpResult?.session;

            if (!userId) throw new Error(t('onboarding.error_account_creation'));

            if (needsVerification) {
                // Go to email verification screen
                setStep(2);
            } else {
                // Already verified (unlikely but possible), go to onboarding questions
                setStep(3);
            }
        } catch (error) {
            console.error("Account creation error:", error);
            alert(t('onboarding.error_generic') + ": " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Step 9: Submit all onboarding data
    const handleOnboardingSubmit = async () => {
        setIsLoading(true);
        try {
            const userId = authUser?.id;
            if (!userId) throw new Error(t('onboarding_extra.no_user_found'));

            await saveProfileAndCalculate({
                ...formData,
                id: userId,
                trainingFrequency: formData.trainingFrequency,
                trainingType: formData.trainingType,
                resultTempo: formData.resultTempo,
                goal: formData.goal
            });

            // Show results screen
            setStep(9);
        } catch (error) {
            console.error("Onboarding Error:", error);
            alert(t('onboarding.error_generic') + ": " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNext = async () => {
        if (step === 1) {
            // Account creation step
            if (authUser) {
                // Already logged in, skip to onboarding
                setStep(3);
            } else {
                await handleAccountSubmit();
            }
        } else if (step === 8) {
            // Last onboarding question, submit all data
            await handleOnboardingSubmit();
        } else if (step < 8) {
            setStep(step + 1)
        }
    }

    // Back Function
    const handleBack = () => {
        if (step > 3 && step <= 8) {
            // Can go back within onboarding questions (steps 3-8)
            setStep(step - 1)
        }
        // Can't go back from step 3 to step 2 (verification) or step 1 (account)
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

    // Steps 1-9: Main flow
    // Calculate progress: steps 1-8 map to progress, step 9 is complete
    const progressSteps = step <= 8 ? step : 8;
    const totalSteps = 8;

    return (
        <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: '100px', position: 'relative', overflow: 'hidden' }}>

            {/* Progress */}
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '6px', background: 'var(--color-surface)', zIndex: 20 }}>
                <div style={{ height: '100%', width: `${progressSteps / totalSteps * 100}%`, background: 'var(--color-primary)', transition: 'width 0.3s ease-out' }} />
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
                        visibility: (step <= 3 || step === 9) ? 'hidden' : 'visible',
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
                            height: '42px',
                            width: 'auto',
                            marginBottom: '0.2rem',
                            objectFit: 'contain'
                        }}
                    />
                    {step >= 3 && step <= 8 && <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0 }}>{t('onboarding.step_x_of_y').replace('{step}', step - 2)}</p>}
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

                {/* STEP 1: ACCOUNT AANMAKEN */}
                {step === 1 && (
                    <div className="fade-in">
                        <h2 className="text-center" style={{ marginBottom: '1.5rem' }}>
                            {t('onboarding.step6_title_new')}
                        </h2>
                        <p className="text-center text-muted" style={{ marginBottom: '2rem' }}>
                            {t('onboarding.step6_sub_new')}
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
                        </div>
                    </div>
                )}

                {/* STEP 2: EMAIL VERIFICATIE */}
                {step === 2 && (
                    <div className="fade-in" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>{t('onboarding_extra.verify_email_title')}</h2>
                            <p className="text-muted">{t('onboarding_extra.verify_email_subtitle')}</p>
                        </div>
                    </div>
                )}

                {/* STEP 3: CYCLUS */}
                {step === 3 && (
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
                                            const isToday = e.target.value === new Date().toISOString().split('T')[0]
                                            handleChange('periodEnded', isToday ? 'yes' : null)
                                            handleChange('periodEndDate', '')
                                        }}
                                        style={{
                                            ...inputStyle,
                                            WebkitAppearance: 'none',
                                            minHeight: '3.5rem',
                                            color: formData.cycleStart ? 'var(--color-text)' : 'transparent'
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

                {/* STEP 4: LICHAAM */}
                {step === 4 && (
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

                {/* STEP 5: DOEL */}
                {step === 5 && (
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

                {/* STEP 6: ACTIVITEIT */}
                {step === 6 && (
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

                {/* STEP 7: ERVARING */}
                {step === 7 && (
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

                {/* STEP 8: VOEDINGSVOORKEUR */}
                {step === 8 && (
                    <div className="fade-in">
                        <div className="text-center">
                            <h2 style={{ marginBottom: '0.5rem' }}>{t('onboarding.step6_title', { defaultValue: 'Voedingsvoorkeur' })}</h2>
                            <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                {t('onboarding.step6_subtitle', { defaultValue: 'We passen je recepten en voedingsadviezen hierop aan.' })}
                            </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <SelectOption
                                label={t('profile.dietary.everything')}
                                selected={formData.dietary_preference === 'everything'}
                                onClick={() => handleChange('dietary_preference', 'everything')}
                            />
                            <SelectOption
                                label={t('profile.dietary.vegetarian')}
                                selected={formData.dietary_preference === 'vegetarian'}
                                onClick={() => handleChange('dietary_preference', 'vegetarian')}
                            />
                            <SelectOption
                                label={t('profile.dietary.vegan')}
                                selected={formData.dietary_preference === 'vegan'}
                                onClick={() => handleChange('dietary_preference', 'vegan')}
                            />
                        </div>
                    </div>
                )}

                {/* STEP 9: RESULTATEN */}
                {step === 9 && (
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
                                {t('onboarding_extra.current_phase_label')}
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
                            {isLoading ? t('common.loading') : t('onboarding_extra.start_free_trial')}
                        </button>
                    </div>
                )}

            </div>

            {/* Next button for steps 1 and 3-8 (not for step 0, 2, 9) */}
            {step !== 0 && step !== 2 && step !== 9 && (
                <div style={{ marginTop: '2rem', paddingBottom: '2rem', position: 'relative', zIndex: 1 }}>
                    <button className="btn btn-primary" onClick={handleNext} disabled={isLoading || !isValid(step, formData, !!authUser)}>
                        {isLoading ? t('onboarding.saving') : (step === 8 ? t('onboarding.save_start_authed') : t('onboarding.next'))}
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
    // Step 1: Account creation
    if (step === 1) {
        if (!data.name) return false
        if (!isAuthed && (!data.email || !data.password)) return false
        return true
    }

    // Step 3: Cyclus
    if (step === 3) {
        if (!data.cycleStart) return false;
        if (!data.cycleLength || isNaN(data.cycleLength) || data.cycleLength < 10) return false;
        const isToday = data.cycleStart === new Date().toISOString().split('T')[0];
        if (!isToday && !data.periodEnded) return false;
        if (data.periodEnded === 'no' && !data.periodEndDate) return false;
        return true;
    }
    
    // Step 4: Lichaam
    if (step === 4 && (!data.age || !data.height || !data.weight)) return false

    // Step 5: Doel
    if (step === 5 && !data.goal) return false

    // Step 6: Activiteit
    if (step === 6 && (
        !data.lifestyle_level ||
        !data.steps_range ||
        data.trainingFrequency === undefined ||
        data.trainingFrequency === null ||
        data.trainingFrequency === ''
    )) return false

    // Step 7: Ervaring
    if (step === 7 && !data.experienceLevel) return false

    // Step 8: Voedingsvoorkeur (always valid, has default)
    if (step === 8) return true

    return true
}
