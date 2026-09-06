import React, { useState, useEffect } from 'react'
import { useUser } from '../context/UserContext'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { GOAL_TYPES } from '../logic/nutrition'
import logo from '../assets/logo-primary.png'

export default function Onboarding() {
    const { user, updateUser, completeOnboarding, saveProfileAndCalculate, logout } = useUser()
    const { signUp, signInWithGoogle, user: authUser } = useAuth()
    const { t, language } = useLanguage()
    const [step, setStep] = useState(0)

    // NEW FLOW (industry standard):
    // Step 0: Welcome
    // Step 1: Cyclus info
    // Step 2: Lichaam + Doel (combined)
    // Step 3: Activiteit + Ervaring (combined)
    // Step 4: Voedingsvoorkeur
    // Step 5: Resultaten + Paywall
    // Step 6: Account aanmaken (via Google/Apple OAuth of email)
    // Step 7: Email verificatie (alleen bij email signup)

    const [isLoading, setIsLoading] = useState(false)
    const [calculatedTargets, setCalculatedTargets] = useState(null)
    const [signupMethod, setSignupMethod] = useState(null) // 'google' | 'email'

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        cycleStart: user.cycleStart || '',
        cycleLength: user.cycleLength || 28,
        periodLength: user.periodLength || 5,
        periodEnded: user.cycleStart ? 'no' : null,
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

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error("Google sign-in error:", error);
            alert(t('onboarding.error_generic') + ": " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailSignUp = async () => {
        setIsLoading(true);
        try {
            const signUpResult = await signUp(formData.email, formData.password);
            const userId = signUpResult?.user?.id;
            const needsVerification = !signUpResult?.session;

            if (!userId) throw new Error(t('onboarding.error_account_creation'));

            if (needsVerification) {
                setSignupMethod('email');
                setStep(7);
            } else {
                await finalizeOnboarding(userId);
            }
        } catch (error) {
            console.error("Account creation error:", error);
            alert(t('onboarding.error_generic') + ": " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const finalizeOnboarding = async (userId) => {
        setIsLoading(true);
        try {
            await saveProfileAndCalculate({
                ...formData,
                id: userId,
                trainingFrequency: formData.trainingFrequency,
                trainingType: formData.trainingType,
                resultTempo: formData.resultTempo,
                goal: formData.goal
            });
            await completeOnboarding();
        } catch (error) {
            console.error("Onboarding Error:", error);
            alert(t('onboarding.error_generic') + ": " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNext = async () => {
        if (step === 4) {
            // Last question step, calculate targets and show results
            setIsLoading(true);
            try {
                const targets = await saveProfileAndCalculate({
                    ...formData,
                    id: authUser?.id || 'temp',
                    trainingFrequency: formData.trainingFrequency,
                    trainingType: formData.trainingType,
                    resultTempo: formData.resultTempo,
                    goal: formData.goal
                });
                setCalculatedTargets(targets);
                setStep(5);
            } catch (error) {
                console.error("Onboarding Error:", error);
                alert(t('onboarding.error_generic') + ": " + error.message);
            } finally {
                setIsLoading(false);
            }
        } else if (step < 4) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 0 && step <= 4) {
            setStep(step - 1);
        }
    };

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
                        alt="Allignd Logo"
                        style={{ height: '160px', width: 'auto', objectFit: 'contain' }}
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
        );
    }

    // Progress bar
    const totalSteps = 5;
    const progressSteps = step <= totalSteps ? step : totalSteps;

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
                <button
                    onClick={handleBack}
                    style={{
                        visibility: step === 0 || step === 5 || step === 6 || step === 7 ? 'hidden' : 'visible',
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
                        alt="Allignd Logo"
                        style={{ height: '42px', width: 'auto', marginBottom: '0.2rem', objectFit: 'contain' }}
                    />
                    {step >= 1 && step <= 4 && <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0 }}>{t('onboarding.step_x_of_y').replace('{step}', step).replace('{total}', totalSteps)}</p>}
                </div>

                <div style={{ width: '60px', display: 'flex', justifyContent: 'flex-end' }}>
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
                                            handleChange('cycleStart', new Date().toISOString().split('T')[0]);
                                            handleChange('periodEnded', 'yes');
                                            handleChange('periodEndDate', '');
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
                                            handleChange('cycleStart', e.target.value);
                                            const isToday = e.target.value === new Date().toISOString().split('T')[0];
                                            handleChange('periodEnded', isToday ? 'yes' : null);
                                            handleChange('periodEndDate', '');
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

                            {formData.cycleStart && formData.cycleStart !== new Date().toISOString().split('T')[0] && (
                                <div style={{
                                    background: 'var(--color-bg)',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '1rem',
                                    border: '1px solid var(--color-border)'
                                }}>
                                    <label style={{ ...labelStyle, marginBottom: '0.75rem', display: 'block' }}>
                                        {t('onboarding.still_menstruating')}
                                    </label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => {
                                                handleChange('periodEnded', 'yes');
                                                handleChange('periodEndDate', '');
                                            }}
                                            style={{
                                                flex: 1,
                                                padding: '0.75rem',
                                                borderRadius: 'var(--radius-sm)',
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
                                                borderRadius: 'var(--radius-sm)',
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
                                                borderRadius: 'var(--radius-lg)',
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

                {/* STEP 2: LICHAAM + DOEL (combined) */}
                {step === 2 && (
                    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="text-center">
                            <h2 style={{ marginBottom: '0.5rem' }}>{t('onboarding.step2_title')}</h2>
                            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                                {t('onboarding.step2_subtitle')}
                            </p>
                        </div>

                        {/* Lichaam */}
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

                        {/* Divider */}
                        <div style={{ height: '1px', background: 'var(--color-border)', margin: '0.5rem 0' }} />

                        {/* Doel */}
                        <div>
                            <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>{t('onboarding.your_goal')}</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <SelectOption label={t('onboarding.goal_lose_fat')} selected={formData.goal === GOAL_TYPES.LOSE_FAT} onClick={() => handleChange('goal', GOAL_TYPES.LOSE_FAT)} />
                                <SelectOption label={t('onboarding.goal_recomp')} selected={formData.goal === GOAL_TYPES.RECOMP} onClick={() => handleChange('goal', GOAL_TYPES.RECOMP)} />
                                <SelectOption label={t('onboarding.goal_maintain')} selected={formData.goal === GOAL_TYPES.MAINTAIN} onClick={() => handleChange('goal', GOAL_TYPES.MAINTAIN)} />
                                <SelectOption label={t('onboarding.goal_gain')} selected={formData.goal === GOAL_TYPES.GAIN} onClick={() => handleChange('goal', GOAL_TYPES.GAIN)} />
                            </div>
                        </div>

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

                {/* STEP 3: ACTIVITEIT + ERVARING (combined) */}
                {step === 3 && (
                    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="text-center">
                            <h2 style={{ marginBottom: '0.5rem' }}>{t('onboarding.step4_title')}</h2>
                            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                                {t('onboarding.step4_subtitle')}
                            </p>
                        </div>

                        {/* Lifestyle */}
                        <div>
                            <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>{t('onboarding.lifestyle')}</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <SelectOption label={t('onboarding.lifestyle_sedentary')} selected={formData.lifestyle_level === 'sedentary'} onClick={() => handleChange('lifestyle_level', 'sedentary')} />
                                <SelectOption label={t('onboarding.lifestyle_lightly_active')} selected={formData.lifestyle_level === 'lightly_active'} onClick={() => handleChange('lifestyle_level', 'lightly_active')} />
                                <SelectOption label={t('onboarding.lifestyle_moderately_active')} selected={formData.lifestyle_level === 'moderately_active'} onClick={() => handleChange('lifestyle_level', 'moderately_active')} />
                                <SelectOption label={t('onboarding.lifestyle_very_active')} selected={formData.lifestyle_level === 'very_active'} onClick={() => handleChange('lifestyle_level', 'very_active')} />
                            </div>
                        </div>

                        {/* Steps */}
                        <div>
                            <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>{t('onboarding.steps')}</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                                <SelectOption label={t('onboarding.steps_lt4k')} selected={formData.steps_range === 'lt4k'} onClick={() => handleChange('steps_range', 'lt4k')} />
                                <SelectOption label={t('onboarding.steps_4k_8k')} selected={formData.steps_range === '4k_8k'} onClick={() => handleChange('steps_range', '4k_8k')} />
                                <SelectOption label={t('onboarding.steps_8k_12k')} selected={formData.steps_range === '8k_12k'} onClick={() => handleChange('steps_range', '8k_12k')} />
                                <SelectOption label={t('onboarding.steps_gt12k')} selected={formData.steps_range === 'gt12k'} onClick={() => handleChange('steps_range', 'gt12k')} />
                            </div>
                        </div>

                        {/* Training frequency */}
                        <div>
                            <label style={labelStyle}>{t('onboarding.training_days')}</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                                {[0, 1, 2, 3, 4, 5, 6, 7].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => handleChange('trainingFrequency', val)}
                                        style={{
                                            padding: '0.9rem 0',
                                            border: formData.trainingFrequency === val ? '2.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                                            borderRadius: 'var(--radius-sm)',
                                            background: formData.trainingFrequency === val ? 'rgba(255, 174, 185, 0.05)' : 'transparent',
                                            color: formData.trainingFrequency === val ? 'var(--color-primary)' : 'var(--color-text)',
                                            fontWeight: formData.trainingFrequency === val ? '700' : '400',
                                            fontSize: '1rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            minWidth: '44px',
                                            minHeight: '44px'
                                        }}
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Divider */}
                        <div style={{ height: '1px', background: 'var(--color-border)', margin: '0.5rem 0' }} />

                        {/* Experience */}
                        <div>
                            <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>{t('onboarding.step5_title')}</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <SelectOption label={t('onboarding.exp_beginner')} selected={formData.experienceLevel === 'beginner'} onClick={() => handleChange('experienceLevel', 'beginner')} />
                                <SelectOption label={t('onboarding.exp_intermediate')} selected={formData.experienceLevel === 'intermediate'} onClick={() => handleChange('experienceLevel', 'intermediate')} />
                                <SelectOption label={t('onboarding.exp_advanced')} selected={formData.experienceLevel === 'advanced'} onClick={() => handleChange('experienceLevel', 'advanced')} />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 4: VOEDINGSVOORKEUR */}
                {step === 4 && (
                    <div className="fade-in">
                        <div className="text-center">
                            <h2 style={{ marginBottom: '0.5rem' }}>{t('onboarding.step6_title', { defaultValue: 'Voedingsvoorkeur' })}</h2>
                            <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                {t('onboarding.step6_subtitle', { defaultValue: 'We passen je recepten en voedingsadviezen hierop aan.' })}
                            </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <SelectOption label={t('profile.dietary.everything')} selected={formData.dietary_preference === 'everything'} onClick={() => handleChange('dietary_preference', 'everything')} />
                            <SelectOption label={t('profile.dietary.vegetarian')} selected={formData.dietary_preference === 'vegetarian'} onClick={() => handleChange('dietary_preference', 'vegetarian')} />
                            <SelectOption label={t('profile.dietary.vegan')} selected={formData.dietary_preference === 'vegan'} onClick={() => handleChange('dietary_preference', 'vegan')} />
                        </div>
                    </div>
                )}

                {/* STEP 5: RESULTATEN + PAYWALL */}
                {step === 5 && (
                    <div className="fade-in" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>{t('onboarding.step7_title')}</h2>
                            <p className="text-muted">{t('onboarding.step7_subtitle')}</p>
                        </div>

                        <div className="card" style={{ padding: '1.5rem', background: '#FFFFFF', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: '600', marginBottom: '1rem' }}>
                                {t('today.daily_goal')}
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-text)', marginBottom: '1rem' }}>
                                {calculatedTargets?.calorie_target_min || user?.macroTargets?.calories || 2000} <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontWeight: '500' }}>kcal</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-carbs)' }}>{calculatedTargets?.carbs_g_min || user?.macroTargets?.carbsMin || 0}g</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{t('today.carbs')}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-protein)' }}>{calculatedTargets?.protein_g_min || user?.macroTargets?.proteinMin || 0}g</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{t('today.proteins')}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-fat)' }}>{calculatedTargets?.fat_g_min || user?.macroTargets?.fatMin || 0}g</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{t('today.fats')}</div>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--color-primary)', background: '#FFFFFF', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderRadius: 'var(--radius-md)', textAlign: 'left' }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                                {t('onboarding_extra.current_phase_label')}
                            </div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-text)', textTransform: 'capitalize' }}>
                                {t(`profile.phases.${user?.currentPhase || 'follicular'}`)}
                            </div>
                        </div>

                        {/* PAYWALL */}
                        <div style={{
                            background: 'linear-gradient(135deg, var(--color-primary-light) 0%, rgba(255,174,185,0.05) 100%)',
                            borderRadius: 'var(--radius-md)',
                            padding: '1.5rem',
                            border: '1px solid var(--color-primary)',
                            marginTop: '0.5rem'
                        }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-text)', marginBottom: '0.5rem' }}>
                                {t('paywall.title', { defaultValue: 'Start je 7 dagen gratis' })}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1rem', lineHeight: '1.5' }}>
                                {t('paywall.subtitle', { defaultValue: 'Onbeperkt toegang tot alle functies. Annuleer op elk moment.' })}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                                {['paywall.feature_1', 'paywall.feature_2', 'paywall.feature_3'].map((key, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text)' }}>
                                        <span style={{ color: 'var(--color-primary)', fontWeight: '700' }}>✓</span>
                                        {t(key, { defaultValue: ['Gepersonaliseerde voeding per fase', 'Workout schema\'s per cyclus', 'Community toegang'][i] })}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setStep(6)}
                            className="btn btn-primary"
                            style={{ marginTop: '0.5rem', padding: '1rem', fontSize: '1.1rem' }}
                        >
                            {t('paywall.cta', { defaultValue: 'Start gratis proefperiode' })}
                        </button>
                    </div>
                )}

                {/* STEP 6: ACCOUNT AANMAKEN */}
                {step === 6 && (
                    <div className="fade-in" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-text)', marginBottom: '0.5rem' }}>{t('onboarding.create_account')}</h2>
                            <p className="text-muted">{t('onboarding.create_account_subtitle')}</p>
                        </div>

                        {/* Google Sign In */}
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)',
                                background: '#FFFFFF',
                                color: 'var(--color-text)',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            {t('onboarding.continue_with_google')}
                        </button>

                        {/* Divider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                            <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
                            {t('common.or')}
                            <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
                        </div>

                        {/* Email signup */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
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

                        <button
                            onClick={handleEmailSignUp}
                            disabled={isLoading || !formData.name || !formData.email || !formData.password}
                            className="btn btn-primary"
                            style={{ padding: '1rem', fontSize: '1rem' }}
                        >
                            {isLoading ? t('common.loading') : t('onboarding.create_account_email')}
                        </button>
                    </div>
                )}

                {/* STEP 7: EMAIL VERIFICATIE */}
                {step === 7 && (
                    <div className="fade-in" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>{t('onboarding_extra.verify_email_title')}</h2>
                            <p className="text-muted">{t('onboarding_extra.verify_email_subtitle')}</p>
                        </div>
                    </div>
                )}

            </div>

            {/* Next button for steps 1-4 */}
            {step >= 1 && step <= 4 && (
                <div style={{ marginTop: '2rem', paddingBottom: '2rem', position: 'relative', zIndex: 1 }}>
                    <button className="btn btn-primary" onClick={handleNext} disabled={isLoading || !isValid(step, formData)}>
                        {isLoading ? t('onboarding.saving') : (step === 4 ? t('onboarding.see_results') : t('onboarding.next'))}
                    </button>
                    {(!isValid(step, formData)) && (
                        <p className="text-muted" style={{ fontSize: '0.8rem', textAlign: 'center', marginTop: '0.5rem', margin: '0.5rem auto 0', maxWidth: '300px' }}>
                            {t('onboarding.fill_all_fields')}
                        </p>
                    )}
                </div>
            )}

        </div>
    );
}

function SelectOption({ label, selected, onClick }) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: 'var(--space-4)',
                border: selected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                background: selected ? 'var(--color-primary-light)' : 'var(--color-surface)',
                color: selected ? 'var(--color-primary)' : 'var(--color-text)',
                fontWeight: selected ? '600' : '500',
                textAlign: 'left',
                width: '100%',
                transition: 'all var(--transition-base)',
                fontSize: 'var(--font-size-base)'
            }}
        >
            {label}
        </button>
    );
}

function CompactOption({ label, selected, onClick }) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: 'var(--space-3) var(--space-4)',
                border: selected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                background: selected ? 'var(--color-primary-light)' : 'var(--color-surface)',
                color: selected ? 'var(--color-primary)' : 'var(--color-text)',
                fontWeight: selected ? '600' : '500',
                width: '100%',
                fontSize: 'var(--font-size-sm)',
                transition: 'all var(--transition-base)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
            }}
        >
            {label}
        </button>
    );
}

const labelStyle = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--color-text-muted)',
    marginBottom: '0.6rem'
};

const inputStyle = {
    width: '100%',
    padding: '1rem',
    fontSize: '1rem',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    transition: 'all 0.2s ease'
};

function isValid(step, data) {
    // Step 1: Cyclus
    if (step === 1) {
        if (!data.cycleStart) return false;
        if (!data.cycleLength || isNaN(data.cycleLength) || data.cycleLength < 10) return false;
        const isToday = data.cycleStart === new Date().toISOString().split('T')[0];
        if (!isToday && !data.periodEnded) return false;
        if (data.periodEnded === 'no' && !data.periodEndDate) return false;
        return true;
    }

    // Step 2: Lichaam + Doel
    if (step === 2) {
        if (!data.age || !data.height || !data.weight) return false;
        if (!data.goal) return false;
        return true;
    }

    // Step 3: Activiteit + Ervaring
    if (step === 3) {
        if (!data.lifestyle_level || !data.steps_range) return false;
        if (data.trainingFrequency === undefined || data.trainingFrequency === null || data.trainingFrequency === '') return false;
        if (!data.experienceLevel) return false;
        return true;
    }

    // Step 4: Voedingsvoorkeur (always valid, has default)
    if (step === 4) return true;

    return true;
}
