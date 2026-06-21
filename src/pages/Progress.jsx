import React, { useMemo, useRef, useCallback, useState } from 'react'
import { useUser } from '../context/UserContext'
import { useLanguage } from '../context/LanguageContext'
import { getLocalDateStr } from '../utils/date'
import { toNum } from '../utils/numbers'
import WeightTracker from '../components/WeightTracker'

// ─── Helpers ─────────────────────────────────────────────

function parseLocalDate(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d)
}

const PHASE_COLORS = {
    menstrual: '#a86473',
    follicular: '#5bc4d4',
    ovulatory: '#f5a89c',
    luteal: '#a3b899'
}

// ─── Macro Weekly Average Card ────────────────────────────

function MacroWeekCard({ t, language }) {
    const { user, targets } = useUser()

    const weekStats = useMemo(() => {
        const today = new Date()
        const days = []
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today)
            d.setDate(today.getDate() - i)
            days.push(getLocalDateStr(d))
        }

        const logs = user.foodLogs || []
        let totalKcal = 0, totalP = 0, totalC = 0, totalF = 0
        let daysWithLogs = 0

        for (const dateStr of days) {
            const dayLogs = logs.filter(l => l.date === dateStr)
            if (dayLogs.length > 0) {
                daysWithLogs++
                dayLogs.forEach(l => {
                    totalKcal += toNum(l.kcal)
                    totalP += toNum(l.p || l.protein)
                    totalC += toNum(l.c || l.carbs)
                    totalF += toNum(l.f || l.fat)
                })
            }
        }

        if (daysWithLogs === 0) return null

        return {
            avgKcal: Math.round(totalKcal / daysWithLogs),
            avgP: Math.round(totalP / daysWithLogs),
            avgC: Math.round(totalC / daysWithLogs),
            avgF: Math.round(totalF / daysWithLogs),
            daysWithLogs
        }
    }, [user.foodLogs])

    const goalKcal = targets?.calories || 2000
    const goalP = targets?.proteinMin || 0
    const goalC = targets?.carbsMin || 0
    const goalF = targets?.fatMin || 0

    if (!weekStats) {
        return (
            <div style={cardStyle}>
                <h3 style={cardTitleStyle}>Voeding Weekgemiddelde</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
                    {t('progress.no_food_logs')}
                </p>
            </div>
        )
    }

    const macros = [
        { label: t('today.proteins'), avg: weekStats.avgP, goal: goalP, color: 'var(--color-protein)' },
        { label: t('today.carbs'), avg: weekStats.avgC, goal: goalC, color: 'var(--color-carbs)' },
        { label: t('today.fats'), avg: weekStats.avgF, goal: goalF, color: 'var(--color-fat)' }
    ]

    const kcalPct = Math.min(100, Math.round((weekStats.avgKcal / goalKcal) * 100))
    const kcalColor = kcalPct >= 90 && kcalPct <= 115 ? '#a3b899' : kcalPct < 70 ? '#f5a89c' : 'var(--color-calories)'

    return (
        <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div>
                    <h3 style={cardTitleStyle}>Voeding Weekgemiddelde</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {t('progress.based_on_days').replace('{n}', weekStats.daysWithLogs)}
                    </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.9rem', fontWeight: '800', color: kcalColor, lineHeight: 1 }}>
                        {weekStats.avgKcal}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                        / {goalKcal} kcal
                    </div>
                </div>
            </div>

            {/* Kcal progress bar */}
            <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ height: '8px', background: 'var(--color-bg)', borderRadius: '4px', overflow: 'hidden', marginBottom: '4px' }}>
                    <div style={{
                        width: `${kcalPct}%`,
                        height: '100%',
                        background: kcalColor,
                        borderRadius: '4px',
                        transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)'
                    }} />
                </div>
                <div style={{ fontSize: '0.72rem', color: kcalColor, fontWeight: '600' }}>
                    {kcalPct}% {t('progress.of_goal')}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {macros.map(m => {
                    const pct = Math.min(100, Math.round((m.avg / (m.goal || 1)) * 100))
                    return (
                        <div key={m.label}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{m.label}</span>
                                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text)' }}>
                                    {m.avg}g <span style={{ opacity: 0.5, fontWeight: 400 }}>/ {m.goal}g</span>
                                </span>
                            </div>
                            <div style={{ height: '5px', background: 'var(--color-bg)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{
                                    width: `${pct}%`,
                                    height: '100%',
                                    background: m.color,
                                    borderRadius: '3px',
                                    transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)'
                                }} />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}


// ─── Symptom Cycle Comparison Card ───────────────────────

function SymptomCompareCard({ t, language }) {
    const { user, currentPhase } = useUser()

    const comparison = useMemo(() => {
        if (!user.symptomLogs || user.symptomLogs.length === 0) return null
        if (!user.periodStartDates || user.periodStartDates.length < 2) return null

        const starts = [...user.periodStartDates].sort()
        const currentCycleStart = starts[starts.length - 1]
        const prevCycleStart = starts[starts.length - 2]

        const effectiveCycleLen = user.cycleStats?.learnedCycleLength || user.cycleLength || 28

        // Get phase date range for current cycle
        function getPhaseDates(cycleStart, phase, cycleLen, periodLen = 5) {
            const start = parseLocalDate(cycleStart)
            const phaseRanges = {
                menstrual: [0, periodLen - 1],
                follicular: [periodLen, Math.floor(cycleLen * 0.43)],
                ovulatory: [Math.floor(cycleLen * 0.43), Math.floor(cycleLen * 0.57)],
                luteal: [Math.floor(cycleLen * 0.57), cycleLen - 1]
            }
            const [from, to] = phaseRanges[phase] || [0, 7]
            const dates = []
            for (let i = from; i <= to; i++) {
                const d = new Date(start)
                d.setDate(start.getDate() + i)
                dates.push(getLocalDateStr(d))
            }
            return dates
        }

        const currentPhaseDates = getPhaseDates(currentCycleStart, currentPhase, effectiveCycleLen, user.periodLength)
        const prevPhaseDates = getPhaseDates(prevCycleStart, currentPhase, effectiveCycleLen, user.periodLength)

        const logs = user.symptomLogs

        const currentSymptoms = new Set()
        const prevSymptoms = new Set()

        for (const log of logs) {
            if (currentPhaseDates.includes(log.date)) {
                log.symptoms?.forEach(s => currentSymptoms.add(s))
            }
            if (prevPhaseDates.includes(log.date)) {
                log.symptoms?.forEach(s => prevSymptoms.add(s))
            }
        }

        const shared = [...currentSymptoms].filter(s => prevSymptoms.has(s))
        const newSymptoms = [...currentSymptoms].filter(s => !prevSymptoms.has(s))
        const resolved = [...prevSymptoms].filter(s => !currentSymptoms.has(s))

        return {
            current: [...currentSymptoms],
            prev: [...prevSymptoms],
            shared,
            newSymptoms,
            resolved,
            hasPrevData: prevSymptoms.size > 0,
            hasCurrentData: currentSymptoms.size > 0
        }
    }, [user.symptomLogs, user.periodStartDates, currentPhase, user.cycleLength, user.periodLength])

    const phaseColor = PHASE_COLORS[currentPhase] || 'var(--color-primary)'

    return (
        <div style={cardStyle}>
            <h3 style={cardTitleStyle}>{t('progress.symptom_title')}</h3>

            {!comparison || (!comparison.hasCurrentData && !comparison.hasPrevData) ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
                    {t('progress.no_symptoms')}
                </p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Current phase symptoms */}
                    {comparison.current.length > 0 && (
                        <div>
                            <div style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: phaseColor, marginBottom: '0.5rem' }}>
                                {t('progress.this_cycle')}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {comparison.current.map(s => (
                                    <span key={s} style={{
                                        padding: '4px 10px', borderRadius: '20px',
                                        background: `${phaseColor}15`,
                                        border: `1px solid ${phaseColor}30`,
                                        fontSize: '0.78rem', color: 'var(--color-text)', fontWeight: '500'
                                    }}>
                                        {t(`checkin.symptoms.${s}`)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Previous cycle comparison */}
                    {comparison.hasPrevData && (
                        <div style={{ padding: '0.75rem', background: 'var(--color-bg)', borderRadius: '12px' }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                                {t('progress.prev_cycle')}
                            </div>

                            {comparison.resolved.length > 0 && (
                                <div style={{ marginBottom: '0.4rem' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#a3b899', fontWeight: '600' }}>✓ {t('progress.resolved')}: </span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                        {comparison.resolved.map(s => t(`checkin.symptoms.${s}`)).join(', ')}
                                    </span>
                                </div>
                            )}

                            {comparison.shared.length > 0 && (
                                <div style={{ marginBottom: '0.4rem' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#f5a89c', fontWeight: '600' }}>↺ {t('progress.recurring')}: </span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                        {comparison.shared.map(s => t(`checkin.symptoms.${s}`)).join(', ')}
                                    </span>
                                </div>
                            )}

                            {comparison.newSymptoms.length > 0 && (
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: '#a86473', fontWeight: '600' }}>+ {t('progress.new_this_cycle')}: </span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                        {comparison.newSymptoms.map(s => t(`checkin.symptoms.${s}`)).join(', ')}
                                    </span>
                                </div>
                            )}

                            {comparison.resolved.length === 0 && comparison.shared.length === 0 && comparison.newSymptoms.length === 0 && (
                                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0 }}>
                                    {t('progress.no_prev_symptoms_in_phase')}
                                </p>
                            )}
                        </div>
                    )}

                    {!comparison.hasPrevData && (
                        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                            {t('progress.more_cycles_needed')}
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}

// ─── Card Styles ──────────────────────────────────────────

const cardStyle = {
    background: '#fff',
    borderRadius: '20px',
    padding: '1.5rem',
    border: '1px solid var(--color-border)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
    marginBottom: '1rem'
}

const cardTitleStyle = {
    fontSize: '1rem',
    fontWeight: '700',
    margin: '0 0 0 0',
    color: 'var(--color-text)'
}

// ─── Main Page ────────────────────────────────────────────

export default function Progress({ onClose }) {
    const { t, language } = useLanguage()
    const { currentPhase } = useUser()
    const phaseColor = PHASE_COLORS[currentPhase] || 'var(--color-primary)'

    return (
        <div style={{ minHeight: '100vh', background: '#FAFAFA', paddingBottom: '120px' }}>

            {/* Header */}
            <div style={{
                background: '#fff',
                padding: '1rem 1.5rem 0.75rem',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        background: 'none', border: 'none',
                        fontSize: '1rem', color: 'var(--color-text-muted)',
                        cursor: 'pointer', padding: '0.25rem',
                        display: 'flex', alignItems: 'center', gap: '4px'
                    }}
                >
                    ← {t('common.back')}
                </button>
                <h1 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0, flex: 1, textAlign: 'center' }}>
                    {t('progress.title')}
                </h1>
                {/* Spacer to center title */}
                <div style={{ width: '60px' }} />
            </div>

            {/* Phase indicator */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.6rem 1.5rem',
                background: `${phaseColor}10`
            }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: phaseColor }} />
                <span style={{ fontSize: '0.78rem', color: phaseColor, fontWeight: '600' }}>
                    {t('progress.current_phase')}: {t(`profile.phases.${currentPhase}`)}
                </span>
            </div>

            <div style={{ padding: '1.25rem 1.25rem 0' }}>
                <MacroWeekCard t={t} language={language} />
                <WeightTracker date={getLocalDateStr(new Date())} />
                <SymptomCompareCard t={t} language={language} />
            </div>
        </div>
    )
}
