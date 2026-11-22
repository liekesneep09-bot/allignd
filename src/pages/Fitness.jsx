import React, { useMemo, useState } from 'react'
import { useUser } from '../context/UserContext'
import { useLanguage } from '../context/LanguageContext'
import { getFitnessContent } from '../data/fitnessContent'
import { getPhaseContent } from '../data/phases'
import { getLocalDateStr } from '../utils/date'

function getWeekDays(movementLogs, t) {
    const now = new Date()
    const monday = new Date(now)
    const mondayOffset = now.getDay() === 0 ? 6 : now.getDay() - 1
    monday.setDate(now.getDate() - mondayOffset)
    monday.setHours(0, 0, 0, 0)

    const rawDayLabels = t('guide.days_short', { returnObjects: true })
    const dayLabels = Array.isArray(rawDayLabels) ? rawDayLabels : ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']

    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(monday)
        date.setDate(monday.getDate() + index)
        const dateStr = getLocalDateStr(date)
        const log = movementLogs?.find(item => item.date === dateStr)
        return {
            label: dayLabels[index],
            dateStr,
            status: log?.status || null,
            isToday: dateStr === getLocalDateStr(now)
        }
    })
}

const phaseColors = {
    menstrual: 'var(--phase-menstrual-text)',
    follicular: 'var(--phase-follicular-text)',
    ovulatory: 'var(--phase-ovulatory-text)',
    luteal: 'var(--phase-luteal-text)'
}

export default function Fitness() {
    const { user, currentPhase, logMovement } = useUser()
    const { language, t } = useLanguage()
    const [approach, setApproach] = useState('plan')
    const [showWhy, setShowWhy] = useState(false)
    const [movementPending, setMovementPending] = useState(false)
    const [movementError, setMovementError] = useState(null)

    const todayStr = getLocalDateStr(new Date())
    const todayStatus = user.movementLogs?.find(log => log.date === todayStr)?.status || null
    const weekDays = useMemo(() => getWeekDays(user.movementLogs || [], t), [user.movementLogs, t])
    const weekWorkouts = weekDays.filter(day => day.status === 'moved').length
    const weekTarget = user.trainingFrequency ?? 3
    const fitnessContent = getFitnessContent(language)
    const goalLabel = fitnessContent.goals[user.goal] || user.goal || t('fitness.any_goal')
    const phaseName = getPhaseContent(language, currentPhase).name
    const accent = phaseColors[currentPhase] || phaseColors.luteal

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

    const approaches = [
        { id: 'plan', label: t('fitness.approach_plan'), text: t('fitness.approach_plan_text') },
        { id: 'lighter', label: t('fitness.approach_lighter'), text: t('fitness.approach_lighter_text') },
        { id: 'rest', label: t('fitness.approach_rest'), text: t('fitness.approach_rest_text') }
    ]
    const selectedApproach = approaches.find(item => item.id === approach) || approaches[0]

    return (
        <div className="container" style={{ paddingTop: '1rem', paddingBottom: '100px' }}>
            <header style={{ marginBottom: '1.25rem' }}>
                <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, margin: '0 0 0.35rem' }}>
                    {t('fitness.title')}
                </h1>
                <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                    {t('fitness.subtitle')}
                </p>
            </header>

            <section
                aria-labelledby="movement-today-title"
                style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '24px',
                    padding: '1.2rem',
                    marginBottom: '1rem',
                    boxShadow: 'var(--shadow-sm)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem' }}>
                    <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', background: accent }} />
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        {phaseName}
                    </span>
                </div>

                <h2 id="movement-today-title" style={{ fontSize: '1.45rem', lineHeight: 1.2, margin: '0 0 0.5rem', color: 'var(--color-text)' }}>
                    {t('fitness.today_question')}
                </h2>
                <p style={{ margin: '0 0 1rem', color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    {t(`fitness.phase_context_${currentPhase}`, { defaultValue: t('fitness.phase_context_default') })}
                </p>

                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.55rem' }}>
                    {t('fitness.your_goal')}: <strong style={{ color: 'var(--color-text)', fontWeight: 600 }}>{goalLabel}</strong>
                </div>

                <div role="group" aria-label={t('fitness.choose_approach')} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.45rem', marginBottom: '0.75rem' }}>
                    {approaches.map(item => {
                        const isSelected = approach === item.id
                        return (
                            <button
                                key={item.id}
                                type="button"
                                aria-pressed={isSelected}
                                onClick={() => setApproach(item.id)}
                                style={{
                                    minHeight: 42,
                                    padding: '0.55rem 0.35rem',
                                    borderRadius: '14px',
                                    border: isSelected ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                                    background: isSelected ? 'rgba(255, 92, 138, 0.08)' : 'var(--color-surface)',
                                    color: isSelected ? 'var(--color-primary)' : 'var(--color-text)',
                                    fontSize: '0.78rem',
                                    lineHeight: 1.25,
                                    fontWeight: isSelected ? 700 : 500,
                                    cursor: 'pointer'
                                }}
                            >
                                {item.label}
                            </button>
                        )
                    })}
                </div>

                <div aria-live="polite" style={{ background: 'var(--color-background)', borderRadius: '16px', padding: '0.85rem 0.95rem' }}>
                    <p style={{ margin: 0, color: 'var(--color-text)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                        {selectedApproach.text}
                    </p>
                </div>

                <button
                    type="button"
                    aria-expanded={showWhy}
                    onClick={() => setShowWhy(value => !value)}
                    style={{ background: 'none', border: 0, padding: '0.8rem 0 0', color: 'var(--color-primary)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                >
                    {showWhy ? t('fitness.why_less') : t('fitness.why_this')}
                </button>
                {showWhy && (
                    <p style={{ margin: '0.55rem 0 0', color: 'var(--color-text-muted)', fontSize: '0.82rem', lineHeight: 1.55 }}>
                        {t('fitness.why_text', { goal: goalLabel })}
                    </p>
                )}
            </section>

            <section
                aria-labelledby="movement-week-title"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '1rem 1.1rem', boxShadow: 'var(--shadow-sm)' }}
            >
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.85rem' }}>
                    <h2 id="movement-week-title" style={{ margin: 0, fontSize: '1rem', color: 'var(--color-text)' }}>{t('fitness.week_title')}</h2>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                        <strong style={{ color: 'var(--color-text)' }}>{weekWorkouts}</strong> {t('fitness.of')} {weekTarget} {t('fitness.movement_days')}
                    </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.3rem', marginBottom: '1rem' }}>
                    {weekDays.map(day => (
                        <div key={day.dateStr} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', minWidth: 24 }}>
                            <span style={{ fontSize: '0.68rem', fontWeight: day.isToday ? 700 : 500, color: day.isToday ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                                {day.label}
                            </span>
                            <span
                                aria-label={day.status === 'moved' ? t('fitness.moved_success') : day.status === 'rest' ? t('fitness.rest_day') : t('fitness.not_logged')}
                                style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    background: day.status === 'moved' ? 'var(--color-primary)' : day.status === 'rest' ? 'var(--color-border)' : 'transparent',
                                    border: day.isToday && !day.status ? '1.5px solid var(--color-primary)' : day.status ? 'none' : '1px solid var(--color-border)',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                    ))}
                </div>

                <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: '0.8rem' }}>
                    <p style={{ margin: '0 0 0.6rem', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{t('fitness.log_prompt')}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        {[
                            { status: 'moved', label: t('fitness.log_moved') },
                            { status: 'rest', label: t('fitness.log_rest') }
                        ].map(option => {
                            const isSelected = todayStatus === option.status
                            return (
                                <button
                                    key={option.status}
                                    type="button"
                                    aria-pressed={isSelected}
                                    disabled={movementPending}
                                    onClick={() => void handleMovement(option.status)}
                                    style={{
                                        minHeight: 42,
                                        borderRadius: '13px',
                                        border: isSelected ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                                        background: isSelected ? 'rgba(255, 92, 138, 0.08)' : 'transparent',
                                        color: isSelected ? 'var(--color-primary)' : 'var(--color-text)',
                                        fontSize: '0.82rem',
                                        fontWeight: isSelected ? 700 : 500,
                                        cursor: movementPending ? 'wait' : 'pointer',
                                        opacity: movementPending ? 0.65 : 1
                                    }}
                                >
                                    {option.label}
                                </button>
                            )
                        })}
                    </div>
                    {movementError && <p role="alert" style={{ color: 'var(--color-error)', margin: '0.55rem 0 0', fontSize: '0.8rem' }}>{movementError}</p>}
                </div>
            </section>
        </div>
    )
}
