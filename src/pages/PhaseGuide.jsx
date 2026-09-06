import { useState, useMemo } from 'react'
import { useUser } from '../context/UserContext'
import { getPhaseContent } from '../data/phases'
import { useLanguage } from '../context/LanguageContext'
import { getLocalDateStr } from '../utils/date'
import { IconActivity, IconNutrition } from '../components/Icons'
import { getFuturePeriodWindows } from '../logic/cycle-learning'

export default function PhaseGuide() {
    const { user, currentPhase, currentDay } = useUser()
    const { t, language } = useLanguage()
    const [viewDate, setViewDate] = useState(new Date())

    // --- CALENDAR LOGIC ---
    const getDaysInMonth = (date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const days = new Date(year, month + 1, 0).getDate()
        const firstDay = new Date(year, month, 1).getDay() // 0 = Sun
        const startOffset = firstDay === 0 ? 6 : firstDay - 1
        return { days, startOffset }
    }

    const { days, startOffset } = getDaysInMonth(viewDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const isMenstruating = (day) => {
        const checkTime = new Date(viewDate.getFullYear(), viewDate.getMonth(), day).setHours(0, 0, 0, 0)

        // 0. Explicit Logs
        const checkDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
        const dateStr = getLocalDateStr(checkDate)
        const explicitLog = user.menstruationLogs?.find(l => l.date === dateStr)
        if (explicitLog) return explicitLog.status === 'yes'

        // 1. History
        if (user.cycleHistory) {
            for (let cycle of user.cycleHistory) {
                const s = new Date(cycle.startDate); s.setHours(0, 0, 0, 0)
                const pLen = cycle.periodLength || user.periodLength || 5
                const e = new Date(s); e.setDate(s.getDate() + pLen - 1)
                if (checkTime >= s.getTime() && checkTime <= e.getTime()) return true
            }
        }
        // 2. Current
        if (user.cycleStart) {
            const s = new Date(user.cycleStart); s.setHours(0, 0, 0, 0)
            const pLen = (user.currentPeriodLength !== null && user.currentPeriodLength !== undefined)
                ? user.currentPeriodLength : user.periodLength
            const e = new Date(s); e.setDate(s.getDate() + pLen - 1)
            if (checkTime >= s.getTime() && checkTime <= e.getTime()) return true
        }
        return false
    }

    const predictedWindows = useMemo(() => {
        if (!user?.periodStartDates || user.periodStartDates.length === 0) return {}
        return getFuturePeriodWindows(
            user.periodStartDates,
            user.cycleStats?.learnedCycleLength || user.cycleLength || 28,
            user.periodLength || 5,
            user.cycleStats?.variability || 0,
            4
        )
    }, [user?.periodStartDates, user?.cycleStats, user?.cycleLength, user?.periodLength])

    const handlePrev = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
    const handleNext = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))

    // --- RENDER ---
    const phase = getPhaseContent(language, currentPhase, user?.dietary_preference)

    return (
        <div className="container" style={{ paddingBottom: '90px', paddingTop: '1rem' }}>
            <header style={{ marginBottom: '1.5rem', marginTop: '0' }}>
                <h1 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', margin: 0 }}>{t('cycle.title')}</h1>
            </header>

            {/* 1. CALENDAR BLOCK */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <button onClick={handlePrev} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: 'var(--color-text)', opacity: 0.6, cursor: 'pointer', padding: '0.25rem' }}>‹</button>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0, textTransform: 'capitalize', color: 'var(--color-text)' }}>
                        {viewDate.toLocaleDateString(language === 'en' ? 'en-US' : 'nl-NL', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button onClick={handleNext} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: 'var(--color-text)', opacity: 0.6, cursor: 'pointer', padding: '0.25rem' }}>›</button>
                </div>

                {/* Days Header */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '0.75rem' }}>
                    {t('cycle.days', { returnObjects: true }).map(d => (
                        <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>{d}</div>
                    ))}
                </div>

                {/* Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: '0.5rem', columnGap: '0.2rem' }}>
                    {Array.from({ length: startOffset }).map((_, i) => <div key={`e-${i}`} />)}
                    {Array.from({ length: days }).map((_, i) => {
                        const day = i + 1
                        const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
                        date.setHours(0, 0, 0, 0)
                        const isToday = date.getTime() === today.getTime()
                        const isPeriod = isMenstruating(day)
                        const dateStr = getLocalDateStr(date)
                        const isPredicted = !isPeriod && predictedWindows[dateStr]

                        // Movement Check
                        const hasMovement = user.movementLogs?.some(l => l.date === dateStr && l.status === 'moved')

                        return (
                            <div key={day} style={{
                                aspectRatio: '1',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative'
                            }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: 'var(--radius-full)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.88rem',
                                    fontWeight: isToday || isPeriod ? '700' : '400',
                                    background: isPeriod ? 'var(--color-primary)' : 'transparent',
                                    color: isPeriod ? '#333333' : (isPredicted ? 'var(--color-primary)' : 'var(--color-text)'),
                                    border: isToday && !isPeriod && !isPredicted
                                        ? '2px solid var(--color-primary)'
                                        : isPredicted
                                            ? '2px dashed var(--color-primary)'
                                            : '2px solid transparent',
                                    boxSizing: 'border-box'
                                }}>
                                    {day}
                                </div>

                                {/* Indicator dots */}
                                <div style={{ position: 'absolute', bottom: '0', left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', zIndex: 2 }}>
                                    {hasMovement && (
                                        <div style={{ width: '6px', height: '6px', borderRadius: 'var(--radius-full)', background: 'var(--color-movement)' }} />
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Legend */}
                <div style={{ marginTop: '2rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: 'var(--radius-full)', background: 'var(--color-primary)' }}></div>
                        <span>{t('cycle.menstruation')}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: 'var(--radius-full)', border: '2px dashed var(--color-primary)' }}></div>
                        <span>{t('cycle.predicted_menstruation')}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: 'var(--radius-full)', background: 'var(--color-movement)' }}></div>
                        <span>{t('cycle.moved')}</span>
                    </div>
                </div>
            </div>

            {/* 2. PHASE OVERVIEW HEADER */}
            <div style={{ marginBottom: '1.25rem', padding: '0 0.25rem' }}>
                <div style={{
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: `var(${phase.colorVar})`,
                    fontWeight: '700',
                    marginBottom: '0.25rem'
                }}>
                    {t('common.day')} {currentDay}
                </div>
                <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: '700', color: 'var(--color-text)' }}>
                    {phase.name}
                </h2>
            </div>

            {/* SECTION 1: THE SCIENCE */}
            {(phase.explanation || phase.bodySignal) && (
                <div className="card" style={{
                    marginBottom: '1rem',
                    background: `linear-gradient(135deg, var(--color-surface) 0%, rgba(255,255,255,0) 100%)`,
                    borderLeft: `4px solid var(${phase.colorVar})`
                }}>
                    <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', margin: '0 0 0.5rem 0' }}>
                        {t('guide.science_title')}
                    </h3>
                    {phase.explanation && (
                        <p style={{ fontSize: '0.95rem', lineHeight: '1.5', margin: '0 0 0.5rem 0', color: 'var(--color-text)' }}>
                            {phase.explanation}
                        </p>
                    )}
                    {phase.bodySignal && (
                        <p style={{ fontSize: '0.85rem', lineHeight: '1.5', margin: 0, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                            {phase.bodySignal}
                        </p>
                    )}
                </div>
            )}

            {/* SECTION 2: WHAT YOU MIGHT NOTICE */}
            {phase.bullets && phase.bullets.length > 0 && (
                <div className="card" style={{ marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', margin: '0 0 0.75rem 0' }}>
                        {t('guide.symptoms_title')}
                    </h3>
                    {phase.validation && (
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text)', marginBottom: '1rem', fontWeight: '500' }}>
                            {phase.validation}
                        </p>
                    )}
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {phase.bullets.map((bullet, idx) => (
                            <li key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                <div style={{ color: `var(${phase.colorVar})`, fontWeight: '700', marginTop: '-2px' }}>✓</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--color-text)', lineHeight: '1.4' }}>{bullet}</div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* SECTION 3: SUPPORT */}
            {(phase.nutrition || phase.training) && (
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                    {phase.nutrition && (
                        <div className="card" style={{ flex: 1, margin: 0, padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
                                <IconNutrition size={16} />
                                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>{t('guide.food_focus')}</span>
                            </div>
                            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text)', marginBottom: '0.25rem' }}>
                                {phase.nutrition.focus}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                {phase.nutrition.purpose}
                            </div>
                        </div>
                    )}
                    {phase.training && (
                        <div className="card" style={{ flex: 1, margin: 0, padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
                                <IconActivity size={16} />
                                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>{t('guide.movement_focus')}</span>
                            </div>
                            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text)', marginBottom: '0.25rem' }}>
                                {phase.training.goal}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                {phase.training.focus}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* SECTION 4: KEY NUTRIENTS */}
            {phase.nutrients && phase.nutrients.length > 0 && (
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', margin: '0 0 1rem 0' }}>
                        {t('guide.nutrients_title')}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {phase.nutrients.map((nutrient, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{
                                    width: '40px', height: '40px',
                                    borderRadius: 'var(--radius-sm)',
                                    background: `rgba(0,0,0,0.04)`,
                                    border: `1px solid rgba(0,0,0,0.08)`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.85rem', fontWeight: '700', color: `var(${phase.colorVar})`,
                                    flexShrink: 0
                                }}>
                                    {nutrient.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-text)', marginBottom: '0.15rem' }}>
                                        {nutrient.name}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: '1.4', marginBottom: '0.4rem' }}>
                                        {nutrient.description}
                                    </div>
                                    {nutrient.sources && nutrient.sources.length > 0 && (
                                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                                            <span style={{ fontWeight: '600' }}>{t('guide.nutrient_sources')}</span> {nutrient.sources.map(s => s.food).join(', ')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
