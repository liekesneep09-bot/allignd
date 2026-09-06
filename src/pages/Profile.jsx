import React, { useState, useEffect } from 'react'
import { useUser } from '../context/UserContext'
import { useLanguage } from '../context/LanguageContext'
import { IconAccount, IconCalendar, IconRecipe, IconActivity } from '../components/Icons'
import { GOAL_TYPES } from '../logic/nutrition'

/**
 * Profile & Settings Page — Settings List Style
 * - Main page: overview of sections
 * - Each section: sub-page with back button
 * - Language toggle stays inline
 */

// ─── Sub-page components ──────────────────────────────────

function PersonalSection({ formData, handleChange, t }) {
    const inputStyle = {
        width: '100%',
        padding: '1rem',
        fontSize: '1rem',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        transition: 'all 0.2s ease'
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

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
                <label style={labelStyle}>{t('profile.name')}</label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={e => handleChange('name', e.target.value)}
                    placeholder={t('profile.name_placeholder')}
                    style={inputStyle}
                />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div>
                    <label style={labelStyle}>{t('profile.age')}</label>
                    <input
                        type="number"
                        value={formData.age}
                        onChange={e => handleChange('age', e.target.value)}
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={labelStyle}>{t('profile.height')}</label>
                    <input
                        type="number"
                        value={formData.height}
                        onChange={e => handleChange('height', e.target.value)}
                        style={inputStyle}
                    />
                </div>
            </div>
        </div>
    )
}

function BodyGoalsSection({ formData, handleChange, t }) {
    const inputStyle = {
        width: '100%',
        padding: '1rem',
        fontSize: '1rem',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--color-surface)',
        color: 'var(--color-text)'
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

    const GOALS = [
        { value: 'lose_fat', label: t('profile.goals.lose_fat') },
        { value: 'recomp', label: t('profile.goals.recomp') },
        { value: 'maintain', label: t('profile.goals.maintain') },
        { value: 'gain_muscle', label: t('profile.goals.gain_muscle') }
    ]
    const TEMPOS = [
        { value: 'slow', label: t('profile.tempos.slow') },
        { value: 'average', label: t('profile.tempos.average') },
        { value: 'fast', label: t('profile.tempos.fast') }
    ]

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div>
                    <label style={labelStyle}>{t('profile.current_weight')}</label>
                    <input type="number" value={formData.weight} onChange={e => handleChange('weight', e.target.value)} style={inputStyle} />
                </div>
                <div>
                    <label style={labelStyle}>{t('profile.target_weight')}</label>
                    <input type="number" value={formData.targetWeight} onChange={e => handleChange('targetWeight', e.target.value)} placeholder={t('profile.optional')} style={inputStyle} />
                </div>
            </div>

            <div>
                <label style={labelStyle}>{t('profile.main_goal')}</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {GOALS.map(g => (
                        <button
                            key={g.value}
                            onClick={() => handleChange('goal', g.value)}
                            style={{
                                padding: '1rem',
                                border: formData.goal === g.value ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                background: formData.goal === g.value ? 'var(--color-primary-light)' : 'var(--color-surface)',
                                color: formData.goal === g.value ? 'var(--color-primary)' : 'var(--color-text)',
                                fontWeight: formData.goal === g.value ? '600' : '500',
                                textAlign: 'left',
                                width: '100%',
                                fontSize: '0.95rem',
                                cursor: 'pointer'
                            }}
                        >
                            {g.label}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label style={labelStyle}>{t('profile.tempo')}</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem' }}>
                    {TEMPOS.map(tempo => (
                        <button
                            key={tempo.value}
                            onClick={() => handleChange('resultTempo', tempo.value)}
                            style={{
                                padding: '0.75rem 0.5rem',
                                border: formData.resultTempo === tempo.value ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                background: formData.resultTempo === tempo.value ? 'var(--color-primary-light)' : 'var(--color-surface)',
                                color: formData.resultTempo === tempo.value ? 'var(--color-primary)' : 'var(--color-text)',
                                fontWeight: formData.resultTempo === tempo.value ? '600' : '500',
                                fontSize: '0.82rem',
                                cursor: 'pointer'
                            }}
                        >
                            {tempo.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

function CycleSection({ formData, handleChange, adjustCyclePhase, t }) {
    const [showPhaseCorrection, setShowPhaseCorrection] = useState(false)
    const inputStyle = {
        width: '100%',
        padding: '1rem',
        fontSize: '1rem',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--color-surface)',
        color: 'var(--color-text)'
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

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
                <label style={labelStyle}>{t('profile.avg_cycle_length')}</label>
                <input type="number" value={formData.cycleLength} onChange={e => handleChange('cycleLength', e.target.value)} style={inputStyle} />
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                    {t('profile.cycle_learning_tip')}
                </p>
            </div>

            <div>
                <label style={labelStyle}>{t('profile.last_period_start')}</label>
                <input type="date" value={formData.cycleStart} onChange={e => handleChange('cycleStart', e.target.value)} style={inputStyle} />
            </div>

            <button
                onClick={() => setShowPhaseCorrection(!showPhaseCorrection)}
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
            >
                {showPhaseCorrection ? t('profile.close_phase_options') : t('profile.other_phase')}
            </button>

            {showPhaseCorrection && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {['menstrual', 'follicular', 'ovulatory', 'luteal'].map(phase => (
                        <button
                            key={phase}
                            onClick={() => adjustCyclePhase(phase)}
                            style={{
                                padding: '1rem',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--color-surface)',
                                color: 'var(--color-text)',
                                textAlign: 'left',
                                fontSize: '0.95rem',
                                cursor: 'pointer'
                            }}
                        >
                            {t(`profile.phases.${phase}`)}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

function NutritionSection({ formData, handleChange, t }) {
    const DIETS = [
        { value: 'everything', label: t('profile.dietary.everything', { defaultValue: 'Alles' }) },
        { value: 'vegetarian', label: t('profile.dietary.vegetarian', { defaultValue: 'Vegetarisch' }) },
        { value: 'vegan', label: t('profile.dietary.vegan', { defaultValue: 'Vegan' }) }
    ]

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {DIETS.map(d => (
                <button
                    key={d.value}
                    onClick={() => handleChange('dietary_preference', d.value)}
                    style={{
                        padding: '1rem',
                        border: formData.dietary_preference === d.value ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        background: formData.dietary_preference === d.value ? 'var(--color-primary-light)' : 'var(--color-surface)',
                        color: formData.dietary_preference === d.value ? 'var(--color-primary)' : 'var(--color-text)',
                        fontWeight: formData.dietary_preference === d.value ? '600' : '500',
                        textAlign: 'left',
                        width: '100%',
                        fontSize: '0.95rem',
                        cursor: 'pointer'
                    }}
                >
                    {d.label}
                </button>
            ))}
        </div>
    )
}

function ActivitySection({ formData, handleChange, t }) {
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
                <label style={labelStyle}>{t('profile.lifestyle')}</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {LIFESTYLES.map(l => (
                        <button
                            key={l.value}
                            onClick={() => handleChange('lifestyle_level', l.value)}
                            style={{
                                padding: '1rem',
                                border: formData.lifestyle_level === l.value ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                background: formData.lifestyle_level === l.value ? 'var(--color-primary-light)' : 'var(--color-surface)',
                                color: formData.lifestyle_level === l.value ? 'var(--color-primary)' : 'var(--color-text)',
                                fontWeight: formData.lifestyle_level === l.value ? '600' : '500',
                                textAlign: 'left',
                                width: '100%',
                                fontSize: '0.95rem',
                                cursor: 'pointer'
                            }}
                        >
                            {l.label}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label style={labelStyle}>{t('profile.daily_steps')}</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {STEPS.map(s => (
                        <button
                            key={s.value}
                            onClick={() => handleChange('steps_range', s.value)}
                            style={{
                                padding: '1rem',
                                border: formData.steps_range === s.value ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                background: formData.steps_range === s.value ? 'var(--color-primary-light)' : 'var(--color-surface)',
                                color: formData.steps_range === s.value ? 'var(--color-primary)' : 'var(--color-text)',
                                fontWeight: formData.steps_range === s.value ? '600' : '500',
                                textAlign: 'left',
                                width: '100%',
                                fontSize: '0.95rem',
                                cursor: 'pointer'
                            }}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label style={labelStyle}>{t('profile.training_days')}</label>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    {[0, 1, 2, 3, 4, 5, 6, 7].map(n => (
                        <button
                            key={n}
                            onClick={() => handleChange('trainingFrequency', n)}
                            style={{
                                width: '40px', height: '40px',
                                borderRadius: 'var(--radius-full)',
                                border: formData.trainingFrequency === n ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                background: formData.trainingFrequency === n ? 'rgba(255,174,185,0.1)' : 'transparent',
                                color: formData.trainingFrequency === n ? 'var(--color-primary)' : 'var(--color-text)',
                                fontWeight: '700',
                                fontSize: '0.9rem',
                                cursor: 'pointer'
                            }}
                        >
                            {n}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label style={labelStyle}>{t('onboarding.step5_title')}</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {[
                        { value: 'beginner', label: t('onboarding.exp_beginner') },
                        { value: 'intermediate', label: t('onboarding.exp_intermediate') },
                        { value: 'advanced', label: t('onboarding.exp_advanced') }
                    ].map(e => (
                        <button
                            key={e.value}
                            onClick={() => handleChange('experienceLevel', e.value)}
                            style={{
                                padding: '1rem',
                                border: formData.experienceLevel === e.value ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                background: formData.experienceLevel === e.value ? 'var(--color-primary-light)' : 'var(--color-surface)',
                                color: formData.experienceLevel === e.value ? 'var(--color-primary)' : 'var(--color-text)',
                                fontWeight: formData.experienceLevel === e.value ? '600' : '500',
                                textAlign: 'left',
                                width: '100%',
                                fontSize: '0.95rem',
                                cursor: 'pointer'
                            }}
                        >
                            {e.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ─── Main Profile Component ───────────────────────────────

export default function Profile({ onNavigate }) {
    const {
        user,
        saveProfileAndCalculate,
        updateUser,
        logout,
        deleteAccount,
        resetOnboarding,
        adjustCyclePhase
    } = useUser()

    const { language, t } = useLanguage()
    const [activeSection, setActiveSection] = useState(null)
    const [isDirty, setIsDirty] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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
        experienceLevel: user?.experienceLevel || 'beginner',
        dietary_preference: user?.dietary_preference || 'everything',
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
                experienceLevel: user.experienceLevel || 'beginner',
                dietary_preference: user.dietary_preference || 'everything'
            }))
        }
    }, [user, isDirty, isSaving])

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        setIsDirty(true)
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await saveProfileAndCalculate({
                ...formData,
                age: Number(formData.age),
                height: Number(formData.height),
                weight: Number(formData.weight),
                targetWeight: Number(formData.targetWeight),
                trainingFrequency: Number(formData.trainingFrequency),
            })
            setIsDirty(false)
            setActiveSection(null)
        } catch (e) {
            console.error(e)
            alert(t('profile.save_error'))
        } finally {
            setIsSaving(false)
        }
    }

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

    // ─── Sub-page views ───────────────────────────────────
    if (activeSection === 'personal') {
        return (
            <SubPage title={t('profile.personal')} onBack={() => setActiveSection(null)}>
                <PersonalSection formData={formData} handleChange={handleChange} t={t} />
            </SubPage>
        )
    }
    if (activeSection === 'body') {
        return (
            <SubPage title={t('profile.body_goals')} onBack={() => setActiveSection(null)}>
                <BodyGoalsSection formData={formData} handleChange={handleChange} t={t} />
            </SubPage>
        )
    }
    if (activeSection === 'cycle') {
        return (
            <SubPage title={t('profile.your_cycle')} onBack={() => setActiveSection(null)}>
                <CycleSection formData={formData} handleChange={handleChange} adjustCyclePhase={adjustCyclePhase} t={t} />
            </SubPage>
        )
    }
    if (activeSection === 'nutrition') {
        return (
            <SubPage title={t('profile.dietary_preference')} onBack={() => setActiveSection(null)}>
                <NutritionSection formData={formData} handleChange={handleChange} t={t} />
            </SubPage>
        )
    }
    if (activeSection === 'activity') {
        return (
            <SubPage title={t('profile.activity')} onBack={() => setActiveSection(null)}>
                <ActivitySection formData={formData} handleChange={handleChange} t={t} />
            </SubPage>
        )
    }

    // ─── Main settings list ───────────────────────────────
    return (
        <div className="container" style={{ paddingBottom: '10rem', backgroundColor: 'var(--color-bg)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="page-title" style={{ fontSize: '2.2rem', fontWeight: '700', margin: 0 }}>{t('profile.title')}</h1>

                {/* Language Switcher */}
                <div style={{ display: 'flex', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', padding: '4px', border: '1px solid var(--color-border)' }}>
                    <button
                        onClick={() => updateUser({ user_language: 'nl' })}
                        style={{
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-sm)',
                            border: 'none',
                            background: language === 'nl' ? 'var(--color-primary)' : 'transparent',
                            color: language === 'nl' ? '#333' : 'var(--color-text-muted)',
                            fontWeight: language === 'nl' ? '700' : '500',
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                        }}
                    >
                        NL
                    </button>
                    <button
                        onClick={() => updateUser({ user_language: 'en' })}
                        style={{
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-sm)',
                            border: 'none',
                            background: language === 'en' ? 'var(--color-primary)' : 'transparent',
                            color: language === 'en' ? '#333' : 'var(--color-text-muted)',
                            fontWeight: language === 'en' ? '700' : '500',
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                        }}
                    >
                        EN
                    </button>
                </div>
            </div>

            {/* Settings List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <SettingsItem icon={<IconAccount opacity={1} />} label={t('profile.personal')} onClick={() => setActiveSection('personal')} />
                <SettingsItem icon={<IconAccount opacity={1} />} label={t('profile.body_goals')} onClick={() => setActiveSection('body')} />
                <SettingsItem icon={<IconCalendar opacity={1} />} label={t('profile.your_cycle')} onClick={() => setActiveSection('cycle')} />
                <SettingsItem icon={<IconRecipe opacity={1} size={20} />} label={t('profile.dietary_preference')} onClick={() => setActiveSection('nutrition')} />
                <SettingsItem icon={<IconActivity opacity={1} size={20} />} label={t('profile.activity')} onClick={() => setActiveSection('activity')} />

                {/* Divider */}
                <div style={{ height: '1px', background: 'var(--color-border)', margin: '0.5rem 0' }} />

                {/* Account actions */}
                <SettingsItem label={t('profile.privacy_policy')} onClick={() => onNavigate && onNavigate('privacy')} />
                <SettingsItem
                    label={t('profile_extra.manage_subscription')}
                    onClick={() => {
                        const portalLink = import.meta.env.VITE_STRIPE_PORTAL_LINK
                        if (portalLink) window.open(portalLink, '_blank')
                    }}
                    color="var(--color-primary)"
                />
                <SettingsItem label={t('profile.logout')} onClick={logout} />
                <SettingsItem label={t('profile.delete_account')} onClick={() => setShowDeleteConfirm(true)} />
            </div>

            {/* Delete Confirm Modal */}
            {showDeleteConfirm && (
                <div
                    onClick={() => setShowDeleteConfirm(false)}
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1rem'
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: 'var(--color-surface)',
                            borderRadius: 'var(--radius-md)',
                            padding: '1.5rem',
                            maxWidth: '320px',
                            width: '100%',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                            textAlign: 'center'
                        }}
                    >
                        <p style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--color-text)' }}>
                            {t('profile.delete_confirm_title')}
                        </p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
                            {t('profile.delete_confirm_desc')}
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                style={{
                                    flex: 1, padding: '0.7rem', borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--color-border)', background: 'var(--color-bg)',
                                    color: 'var(--color-text)', fontSize: '0.9rem', fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={isDeleting}
                                style={{
                                    flex: 1, padding: '0.7rem', borderRadius: 'var(--radius-sm)',
                                    border: 'none', background: '#D32F2F',
                                    color: 'white', fontSize: '0.9rem', fontWeight: '600',
                                    cursor: isDeleting ? 'not-allowed' : 'pointer', opacity: isDeleting ? 0.7 : 1
                                }}
                            >
                                {isDeleting ? t('common.deleting') : t('profile.delete_permanent')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sticky Save Button */}
            {isDirty && (
                <div style={{
                    position: 'fixed',
                    bottom: '90px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 100
                }}>
                    <button
                        className="btn btn-primary"
                        style={{
                            minWidth: '140px',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                            borderRadius: 'var(--radius-full)',
                            padding: '0.75rem 1.5rem',
                            fontSize: '0.9rem',
                            fontWeight: 600
                        }}
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? t('common.saving') : t('common.save')}
                    </button>
                </div>
            )}
        </div>
    )
}

// ─── Helper Components ────────────────────────────────────

function SubPage({ title, onBack, children }) {
    return (
        <div className="container" style={{ paddingBottom: '10rem', backgroundColor: 'var(--color-bg)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.2rem',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer',
                        padding: '0.5rem'
                    }}
                >
                    ←
                </button>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>{title}</h1>
            </div>
            {children}
        </div>
    )
}

function SettingsItem({ icon, label, onClick, color }) {
    return (
        <button
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem 1.25rem',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border-light)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                transition: 'all 0.2s'
            }}
        >
            {icon && <span style={{ display: 'flex', alignItems: 'center', color: color || 'var(--color-text)' }}>{icon}</span>}
            <span style={{ flex: 1, fontSize: '1rem', fontWeight: '500', color: color || 'var(--color-text)' }}>{label}</span>
            <span style={{ color: 'var(--color-text-tertiary)', fontSize: '1.2rem' }}>›</span>
        </button>
    )
}
