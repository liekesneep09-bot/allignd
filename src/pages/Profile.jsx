
import React, { useState, useEffect } from 'react'
import { useUser } from '../context/UserContext'
import { useLanguage } from '../context/LanguageContext'
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
        updateUser,
        logout,
        deleteAccount,
        resetOnboarding,
        logPeriodStart,
        endPeriodToday,
        adjustCyclePhase
    } = useUser()

    const { language, setLanguage, t } = useLanguage()

    const [isDirty, setIsDirty] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [showCycleCorrection, setShowCycleCorrection] = useState(false)

    // Local State for Form (initialized from user)
    const [formData, setFormData] = useState({
        name: user?.name || '',
        age: user?.age || '',
        height: user?.height || '',
        weight: user?.weight || '',
        targetWeight: user?.targetWeight || '',
        goal: user?.goal || 'maintain',
        resultTempo: user?.resultTempo || 'average',
        lifestyle_level: user?.lifestyle_level || 'sedentary',
        steps_range: user?.steps_range || 'lt4k',
        trainingFrequency: user?.training_days_per_week || 0,
        // Cycle
        cycleLength: user?.cycleLength || 28,
        periodLength: user?.periodLength || 5,
        cycleStart: (() => {
            try {
                if (!user?.cycleStart) return ''
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
            alert(t('profile.delete_error') + ": " + err.message)
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
            // alert(t('profile.save_success'))
        } catch (e) {
            console.error(e)
            alert(t('profile.save_error'))
        } finally {
            setIsSaving(false)
        }
    }

    // Goal Options
    const GOALS = [
        { value: 'lose_fat', label: t('profile.goals.lose_fat') },
        { value: 'recomp', label: t('profile.goals.recomp') },
        { value: 'maintain', label: t('profile.goals.maintain') },
        { value: 'gain_muscle', label: t('profile.goals.gain_muscle') }
    ]

    // Activity / Lifestyle Options (New System)
    const LIFESTYLES = [
        { value: 'sedentary', label: t('profile.lifestyles.sedentary') },
        { value: 'lightly_active', label: t('profile.lifestyles.lightly_active') },
        { value: 'moderately_active', label: t('profile.lifestyles.moderately_active') },
        { value: 'very_active', label: t('profile.lifestyles.very_active') }
    ]

    const STEPS = [
        { value: 'lt4k', label: t('profile.steps.lt4k') },
        { value: '4k_8k', label: t('profile.steps.4k_8k') },
        { value: '8k_12k', label: t('profile.steps.8k_12k') },
        { value: 'gt12k', label: t('profile.steps.gt12k') }
    ]

    const TEMPOS = [
        { value: 'slow', label: t('profile.tempos.slow') },
        { value: 'average', label: t('profile.tempos.average') },
        { value: 'fast', label: t('profile.tempos.fast') }
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="page-title" style={{ fontSize: '2.2rem', fontWeight: '700', margin: 0 }}>{t('profile.title')}</h1>
                
                {/* Language Switcher */}
                <div style={{ display: 'flex', background: 'var(--color-surface)', borderRadius: '12px', padding: '4px', border: '1px solid var(--color-border)' }}>
                    <button 
                        onClick={() => updateUser({ user_language: 'nl' })}
                        style={{ 
                            padding: '6px 12px', 
                            borderRadius: '8px', 
                            border: 'none', 
                            background: language === 'nl' ? 'var(--color-primary)' : 'transparent', 
                            color: language === 'nl' ? '#333' : 'var(--color-text-muted)',
                            fontWeight: language === 'nl' ? '700' : '500',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        NL
                    </button>
                    <button 
                        onClick={() => updateUser({ user_language: 'en' })}
                        style={{ 
                            padding: '6px 12px', 
                            borderRadius: '8px', 
                            border: 'none', 
                            background: language === 'en' ? 'var(--color-primary)' : 'transparent', 
                            color: language === 'en' ? '#333' : 'var(--color-text-muted)',
                            fontWeight: language === 'en' ? '700' : '500',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        EN
                    </button>
                </div>
            </div>

            {/* SECTION 1: PERSONAL */}
            <section className="card" style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <IconAccount opacity={1} /> {t('profile.personal')}
                </h2>

                <div className="form-group">
                    <label style={labelStyle}>{t('profile.name')}</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={e => handleChange('name', e.target.value)}
                        placeholder={t('profile.name_placeholder')}
                        className="input-field"
                        style={{ padding: '1rem', fontSize: '1rem', borderRadius: '12px' }}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div className="form-group">
                        <label style={labelStyle}>{t('profile.age')}</label>
                        <input
                            type="number"
                            value={formData.age}
                            onChange={e => handleChange('age', e.target.value)}
                            className="input-field"
                            style={{ padding: '1rem', fontSize: '1rem', borderRadius: '12px' }}
                        />
                    </div>
                    <div className="form-group">
                        <label style={labelStyle}>{t('profile.height')}</label>
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
                <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{t('profile.body_goals')}</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                    <div className="form-group">
                        <label style={labelStyle}>{t('profile.current_weight')}</label>
                        <input
                            type="number"
                            value={formData.weight}
                            onChange={e => handleChange('weight', e.target.value)}
                            className="input-field"
                            style={{ padding: '1rem', fontSize: '1rem', borderRadius: '12px' }}
                        />
                    </div>
                    <div className="form-group">
                        <label style={labelStyle}>{t('profile.target_weight')}</label>
                        <input
                            type="number"
                            value={formData.targetWeight}
                            onChange={e => handleChange('targetWeight', e.target.value)}
                            className="input-field"
                            style={{ padding: '1rem', fontSize: '1rem', borderRadius: '12px' }}
                            placeholder={t('profile.optional')}
                        />
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={labelStyle}>{t('profile.main_goal')}</label>
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
                        <label style={labelStyle}>{t('profile.tempo')}</label>
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
                        <label style={labelStyle}>{t('profile.lifestyle')}</label>
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
                        <label style={labelStyle}>{t('profile.daily_steps')}</label>
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
                        <label style={labelStyle}>{t('profile.training_days')}</label>
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
                    <IconCalendar opacity={1} /> {t('profile.your_cycle')}
                </h2>

                <div className="form-group">
                    <label style={labelStyle}>{t('profile.avg_cycle_length')}</label>
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
                        {t('profile.cycle_learning_tip')}
                    </p>
                </div>

                <div style={{ marginTop: '2rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '1rem', letterSpacing: '0.05em' }}>{t('profile.corrections')}</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={labelStyle}>{t('profile.last_period_start')}</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <input
                                    type="date"
                                    value={formData.cycleStart}
                                    onChange={e => handleChange('cycleStart', e.target.value)}
                                    className="input-field"
                                    style={{ width: '100%', padding: '1rem', fontSize: '1rem', borderRadius: '12px' }}
                                />
                            </div>
                        </div>

                        <button
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--color-text-muted)',
                                textDecoration: 'underline',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                textAlign: 'left',
                                padding: '0'
                            }}
                            onClick={() => setShowCycleCorrection(!showCycleCorrection)}
                        >
                            {showCycleCorrection ? t('profile.close_phase_options') : t('profile.other_phase')}
                        </button>

                        {showCycleCorrection && (
                            <div className="fade-in" style={{
                                background: 'var(--color-bg)',
                                padding: '1rem',
                                borderRadius: '12px',
                                display: 'grid', gap: '0.5rem'
                            }}>
                                <SelectOption label={t('profile.phases.menstrual')} onClick={() => adjustCyclePhase('menstrual')} />
                                <SelectOption label={t('profile.phases.follicular')} onClick={() => adjustCyclePhase('follicular')} />
                                <SelectOption label={t('profile.phases.ovulatory')} onClick={() => adjustCyclePhase('ovulatory')} />
                                <SelectOption label={t('profile.phases.luteal')} onClick={() => adjustCyclePhase('luteal')} />
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* SECTION 4: ACCOUNT ACTIONS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem', opacity: 0.8 }}>
                <button
                    onClick={() => {
                        if (window.confirm(t('profile.onboarding_reset_confirm'))) {
                            resetOnboarding()
                        }
                    }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--color-text)', textDecoration: 'underline', cursor: 'pointer' }}
                >
                    {t('profile.onboarding_reset')}
                </button>

                <button
                    onClick={logout}
                    style={{ background: 'transparent', border: 'none', color: 'var(--color-text)', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                >
                    {t('profile.logout')}
                </button>

                {/* STRIPE CUSTOMER PORTAL */}
                <button
                    onClick={() => {
                        // In the future, this can be an API endpoint that generates a secure Portal session
                        // For now, we link to the hardcoded portal if configured in VITE_STRIPE_PORTAL_LINK
                        const portalLink = import.meta.env.VITE_STRIPE_PORTAL_LINK || 'https://billing.stripe.com/p/login/test_12345'
                        window.open(portalLink, '_blank')
                    }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--color-primary)', fontWeight: '600', cursor: 'pointer', textAlign: 'left', padding: 0, marginTop: '0.5rem' }}
                >
                    Beheer Abonnement (Opzeggen)
                </button>

                {!showDeleteConfirm ? (
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        style={{ background: 'transparent', border: 'none', color: '#D32F2F', fontSize: '0.8rem', cursor: 'pointer', textAlign: 'left', padding: 0, marginTop: '1rem' }}
                    >
                        {t('profile.delete_account')}
                    </button>
                ) : (
                    <div style={{ background: '#FFF5F5', padding: '1rem', borderRadius: '12px', border: '1px solid #FFE3E3', marginTop: '1rem' }}>
                        <p style={{ fontSize: '0.85rem', color: '#D32F2F', marginBottom: '0.75rem', fontWeight: 600 }}>
                            {t('profile.delete_confirm_desc')}
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
                                {isDeleting ? t('common.deleting') : t('profile.delete_permanent')}
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
                                {t('common.cancel')}
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
                    {isSaving ? t('common.saving') : t('common.save')}
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
