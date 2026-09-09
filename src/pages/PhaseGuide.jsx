import { useState, useMemo, useRef } from 'react'
import { useUser } from '../context/UserContext'
import { getPhaseContent } from '../data/phases'
import { useLanguage } from '../context/LanguageContext'
import { getLocalDateStr } from '../utils/date'
import { IconActivity, IconNutrition } from '../components/Icons'
import { getFuturePeriodWindows } from '../logic/cycle-learning'
import {
    getCalendarCycleInfo,
    getFertileMarkers,
    getNextMilestones,
    phaseColor,
    phaseCssVar,
    withAlpha,
    parseDateStr
} from '../logic/calendar-marks'
import CheckInModal from '../components/CheckInModal'
import { PHASES } from '../logic/cycle'

const DAYS_IN_GRID = 7

export default function PhaseGuide({ onNavigate }) {
    const { user, currentPhase, currentDay, isDateInPeriod } = useUser()
    const { t, language } = useLanguage()
    const [viewDate, setViewDate] = useState(new Date())
    const [selectedDateStr, setSelectedDateStr] = useState(null)
    const [showCheckIn, setShowCheckIn] = useState(false)
    const guideRef = useRef(null)

    const todayStr = getLocalDateStr()
    const effectiveCycleLen = user?.cycleStats?.learnedCycleLength || user?.cycleLength || 28
    const effectivePeriodLen = user?.bleedingLengthDays || user?.periodLength || 5

    // --- CALENDAR LOGIC ---
    const getDaysInMonth = (viewDate) => {
        const year = viewDate.getFullYear()
        const month = viewDate.getMonth()
        const days = new Date(year, month + 1, 0).getDate()
        const firstDay = new Date(year, month, 1).getDay()
        const startOffset = firstDay === 0 ? 6 : firstDay - 1
        return { days, startOffset }
    }

    const { days, startOffset } = getDaysInMonth(viewDate)

    const predictedWindows = useMemo(() => {
        if (!user?.periodStartDates || user.periodStartDates.length === 0) return {}
        return getFuturePeriodWindows(
            user.periodStartDates,
            user.cycleStats?.learnedCycleLength || user.cycleLength || 28,
            effectivePeriodLen,
            user.cycleStats?.variability || 0,
            4
        )
    }, [user?.periodStartDates, user?.cycleStats, user?.cycleLength, effectivePeriodLen])

    const fertileMarkers = useMemo(() => {
        if (!user?.cycleStart) return {}
        return getFertileMarkers(user.cycleStart, effectiveCycleLen, 4)
    }, [user?.cycleStart, effectiveCycleLen])

    const milestones = useMemo(() => {
        if (!user?.cycleStart) return null
        return getNextMilestones(user.cycleStart, effectiveCycleLen, todayStr)
    }, [user?.cycleStart, effectiveCycleLen, todayStr])

    const handlePrev = () => {
        setSelectedDateStr(null)
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
    }
    const handleNext = () => {
        setSelectedDateStr(null)
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
    }

    const selectDay = (dateStr) => {
        setSelectedDateStr(dateStr)
        requestAnimationFrame(() => {
            guideRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        })
    }

    // --- GUIDE LOGIC ---
    const activeDateStr = selectedDateStr || todayStr
    const activeCycleInfo = useMemo(() => {
        if (!user?.cycleStart) return null
        if (isDateInPeriod(activeDateStr)) {
            return { phase: PHASES.MENSTRUAL, day: null, isPeriod: true }
        }
        return getCalendarCycleInfo(activeDateStr, user.cycleStart, effectiveCycleLen, effectivePeriodLen)
    }, [activeDateStr, user?.cycleStart, effectiveCycleLen, effectivePeriodLen, isDateInPeriod])

    const guidePhase = activeCycleInfo?.phase || currentPhase || PHASES.FOLLICULAR
    const guideDay = activeCycleInfo?.day || currentDay || 1
    const phase = getPhaseContent(language, guidePhase, user?.dietary_preference)

    const isViewingToday = activeDateStr === todayStr
    const activeSymptoms = user?.symptomLogs?.find(l => l.date === activeDateStr)?.symptoms || []

    // --- RENDER ---
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const formatDateLabel = (dateStr) => {
        const d = parseDateStr(dateStr)
        return d.toLocaleDateString(language === 'en' ? 'en-US' : 'nl-NL', { day: 'numeric', month: 'long' })
    }

    return (
        <div className="container" style={{ paddingBottom: '90px', paddingTop: '1rem' }}>
            <header style={{ marginBottom: '1.5rem', marginTop: '0' }}>
                <h1 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', margin: 0 }}>{t('cycle.title')}</h1>
            </header>

            {/* 0. NO DATA STATE */}
            {!user?.cycleStart && (
                <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--color-text)', marginBottom: '0.4rem' }}>
                        {t('cycle.setup_title')}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: '1.5', marginBottom: '1rem' }}>
                        {t('cycle.setup_desc')}
                    </div>
                    <button
                        onClick={() => onNavigate && onNavigate('profile')}
                        className="btn btn-primary"
                        style={{ borderRadius: 'var(--radius-full)', padding: '0.6rem 1.5rem', fontWeight: '600' }}
                    >
                        {t('cycle.setup_cta')}
                    </button>
                </div>
            )}

            {/* 1. CALENDAR BLOCK */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <button
                        onClick={handlePrev}
                        style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: 'var(--color-text)', opacity: 0.6, cursor: 'pointer', padding: '0.25rem' }}
                        aria-label="Previous month"
                    >‹</button>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0, textTransform: 'capitalize', color: 'var(--color-text)' }}>
                        {viewDate.toLocaleDateString(language === 'en' ? 'en-US' : 'nl-NL', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button
                        onClick={handleNext}
                        style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: 'var(--color-text)', opacity: 0.6, cursor: 'pointer', padding: '0.25rem' }}
                        aria-label="Next month"
                    >›</button>
                </div>

                {/* Phase badge (top-right of calendar) + today reset */}
                {user?.cycleStart && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        {!isViewingToday && (
                            <button
                                onClick={() => setSelectedDateStr(null)}
                                style={{
                                    background: 'none',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-full)',
                                    padding: '0.2rem 0.6rem',
                                    fontSize: '0.7rem',
                                    color: 'var(--color-text-muted)',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                {t('calendar.today')}
                            </button>
                        )}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                background: withAlpha(phaseColor(guidePhase), 0.1),
                                border: `1px solid ${withAlpha(phaseColor(guidePhase), 0.25)}`,
                                borderRadius: 'var(--radius-full)',
                                padding: '0.2rem 0.7rem',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                color: phaseColor(guidePhase)
                            }}
                        >
                            <span style={{ width: 7, height: 7, borderRadius: 'var(--radius-full)', background: phaseColor(guidePhase), flexShrink: 0 }} />
                            {t('profile.phases.' + guidePhase)}
                        </div>
                    </div>
                )}

                {/* Days Header */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '0.75rem' }}>
                    {t('cycle.days', { returnObjects: true }).map(d => (
                        <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>{d}</div>
                    ))}
                </div>

                {/* Day cells */}
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${DAYS_IN_GRID}, 1fr)`, rowGap: '0.5rem', columnGap: '0.2rem' }}>
                    {Array.from({ length: startOffset }).map((_, i) => <div key={`e-${i}`} />)}
                    {Array.from({ length: days }).map((_, i) => {
                        const day = i + 1
                        const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
                        date.setHours(0, 0, 0, 0)
                        const dateStr = getLocalDateStr(date)
                        const isToday = date.getTime() === today.getTime()
                        const isPeriod = isDateInPeriod(dateStr)
                        const isPredicted = !isPeriod && predictedWindows[dateStr]
                        const cycleInfo = getCalendarCycleInfo(dateStr, user?.cycleStart, effectiveCycleLen, effectivePeriodLen)
                        const isOvulation = !!fertileMarkers[dateStr]?.isOvulation
                        const isSelected = activeDateStr === dateStr
                        const hasMovement = user?.movementLogs?.some(l => l.date === dateStr && l.status === 'moved')
                        const hasSymptoms = user?.symptomLogs?.some(l => l.date === dateStr && l.symptoms?.length > 0)
                        const tintColor = cycleInfo?.phase ? phaseColor(cycleInfo.phase) : null

                        return (
                            <div
                                key={day}
                                onClick={() => selectDay(dateStr)}
                                style={{
                                    aspectRatio: '1',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{
                                    width: '34px',
                                    height: '34px',
                                    borderRadius: 'var(--radius-full)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.88rem',
                                    fontWeight: isToday || isPeriod ? '700' : '400',
                                    // Background: period always wins, otherwise phase tint
                                    background: isPeriod
                                        ? 'var(--color-primary)'
                                        : (tintColor ? withAlpha(tintColor, 0.14) : 'transparent'),
                                    color: isPeriod
                                        ? '#333333'
                                        : (isPredicted ? 'var(--color-primary)' : (tintColor ? tintColor : 'var(--color-text)')),
                                    // Border: predicted > today > selected
                                    border: isPredicted
                                        ? '2px dashed var(--color-primary)'
                                        : isToday
                                            ? '2px solid var(--color-primary)'
                                            : '2px solid transparent',
                                    boxShadow: isSelected
                                        ? '0 0 0 2px #fff, 0 0 0 4px var(--color-primary)'
                                        : 'none',
                                    boxSizing: 'border-box',
                                    transition: 'background 0.2s ease, box-shadow 0.2s ease'
                                }}>
                                    {day}
                                </div>

                                {/* Indicator dots */}
                                {(hasMovement || hasSymptoms || isOvulation) && (
                                    <div style={{ position: 'absolute', bottom: '0', left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', zIndex: 2 }}>
                                        {isOvulation && (
                                            <div style={{ width: '6px', height: '6px', borderRadius: 'var(--radius-full)', background: tintColor || phaseColor('ovulatory') }} />
                                        )}
                                        {hasMovement && (
                                            <div style={{ width: '6px', height: '6px', borderRadius: 'var(--radius-full)', background: 'var(--color-movement)' }} />
                                        )}
                                        {hasSymptoms && (
                                            <div style={{ width: '6px', height: '6px', borderRadius: 'var(--radius-full)', background: 'var(--color-symptoms)' }} />
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Milestone strip */}
                {user?.cycleStart && milestones && (
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                        <div style={{ flex: 1, background: withAlpha(phaseColor(guidePhase), 0.06), borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem' }}>
                            <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: '600', marginBottom: '0.2rem' }}>
                                {t('cycle.milestone_next_period')}
                            </div>
                            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--color-text)' }}>
                                ~{formatDateLabel(milestones.nextPeriod)}
                            </div>
                        </div>
                        <div style={{ flex: 1, background: withAlpha(phaseColor(guidePhase), 0.06), borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem' }}>
                            <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: '600', marginBottom: '0.2rem' }}>
                                {t('cycle.milestone_ovulation')}
                            </div>
                            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--color-text)' }}>
                                ~{formatDateLabel(milestones.ovulation)}
                            </div>
                        </div>
                    </div>
                )}

                {/* Legend */}
                <div style={{ marginTop: '1.25rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ width: '14px', height: '14px', borderRadius: 'var(--radius-full)', background: 'var(--color-primary)' }}></div>
                        <span>{t('cycle.menstruation')}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ width: '14px', height: '14px', borderRadius: 'var(--radius-full)', border: '2px dashed var(--color-primary)', boxSizing: 'border-box' }}></div>
                        <span>{t('cycle.predicted_menstruation')}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ width: '14px', height: '14px', borderRadius: 'var(--radius-full)', border: `2px solid ${phaseColor('ovulatory')}`, boxSizing: 'border-box' }}></div>
                        <span>{t('cycle.ovulation_label')}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: 'var(--radius-full)', background: 'var(--color-movement)' }}></div>
                        <span>{t('cycle.moved')}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: 'var(--radius-full)', background: 'var(--color-symptoms)' }}></div>
                        <span>{t('cycle.symptoms')}</span>
                    </div>
                </div>

                {/* Estimate line */}
                {user?.cycleStart && (
                    <div style={{ marginTop: '0.9rem', textAlign: 'center', fontSize: '0.7rem', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>
                        {t('cycle.fertility_estimate_note')}
                    </div>
                )}
            </div>

            {/* 2. GUIDE */}
            <div ref={guideRef} style={{
                borderRadius: 'var(--radius-lg)',
                padding: '1.75rem 1.5rem',
                background: withAlpha(phaseColor(guidePhase), 0.05),
                borderTop: `4px solid ${phaseColor(guidePhase)}`,
                marginBottom: '1.5rem',
                scrollMarginTop: '20px'
            }}>
                {/* Guide header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div>
                        <div style={{
                            fontSize: '0.85rem',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            color: phaseCssVar(guidePhase),
                            fontWeight: '700',
                            marginBottom: '0.25rem'
                        }}>
                            {t('common.day')} {guideDay}
                        </div>
                        <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: '700', color: 'var(--color-text)' }}>
                            {phase.name}
                        </h2>
                    </div>
                    {!isViewingToday && (
                        <button
                            onClick={() => setSelectedDateStr(null)}
                            style={{
                                background: 'var(--color-surface)',
                                border: `1px solid ${withAlpha(phaseColor(guidePhase), 0.3)}`,
                                borderRadius: 'var(--radius-full)',
                                padding: '0.35rem 0.8rem',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                color: phaseColor(guidePhase),
                                cursor: 'pointer',
                                flexShrink: 0
                            }}
                        >
                            {t('calendar.today')}
                        </button>
                    )}
                </div>

                {/* SECTION 1: WHAT YOU MIGHT NOTICE */}
                <div style={{ marginBottom: '1.75rem' }}>
                    <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', margin: '0 0 0.75rem 0' }}>
                        {t('guide.symptoms_title')}
                    </h3>
                    {phase.validation && (
                        <p style={{ fontSize: '0.92rem', color: 'var(--color-text)', marginBottom: '0.9rem', fontWeight: '500', lineHeight: '1.5' }}>
                            {phase.validation}
                        </p>
                    )}
                    {phase.bullets && phase.bullets.length > 0 && (
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                            {phase.bullets.map((bullet, idx) => (
                                <li key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                    <div style={{ color: phaseCssVar(guidePhase), fontWeight: '700', marginTop: '-2px' }}>✓</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text)', lineHeight: '1.4' }}>{bullet}</div>
                                </li>
                            ))}
                        </ul>
                    )}
                    <button
                        onClick={() => setShowCheckIn(true)}
                        style={{
                            background: 'var(--color-surface)',
                            border: `1px solid ${withAlpha(phaseColor(guidePhase), 0.35)}`,
                            borderRadius: 'var(--radius-full)',
                            padding: '0.5rem 1.1rem',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            color: phaseColor(guidePhase),
                            cursor: 'pointer'
                        }}
                    >
                        {t('cycle.log_checkin')}
                    </button>

                    {activeSymptoms.length > 0 && (
                        <div style={{ marginTop: '1.1rem' }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                                {t('cycle.checkin_title')}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                {activeSymptoms.map(id => (
                                    <span key={id} style={{
                                        fontSize: '0.78rem',
                                        padding: '0.3rem 0.7rem',
                                        background: withAlpha(phaseColor(guidePhase), 0.08),
                                        border: `1px solid ${withAlpha(phaseColor(guidePhase), 0.22)}`,
                                        borderRadius: 'var(--radius-full)',
                                        color: 'var(--color-text)',
                                        fontWeight: '500'
                                    }}>
                                        {t('checkin.symptoms.' + id)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* SECTION 2: WHAT TO DO NOW */}
                {(phase.nutrition || phase.training) && (
                    <div style={{ marginBottom: '1.75rem' }}>
                        <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', margin: '0 0 0.75rem 0' }}>
                            {t('guide.do_title')}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {phase.nutrition && (
                                <button
                                    onClick={() => onNavigate && onNavigate('recipes')}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        background: 'var(--color-surface)',
                                        border: '1px solid var(--color-border-light)',
                                        borderRadius: 'var(--radius-md)',
                                        padding: '0.85rem 1rem',
                                        textAlign: 'left',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-sm)', background: withAlpha(phaseColor(guidePhase), 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', color: phaseColor(guidePhase), flexShrink: 0 }}>
                                        <IconNutrition size={18} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text)', marginBottom: '0.1rem' }}>
                                            {phase.nutrition.focus}
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                                            {phase.nutrition.purpose}
                                        </div>
                                    </div>
                                    <span style={{ color: 'var(--color-text-muted)', fontSize: '1rem', flexShrink: 0 }}>›</span>
                                </button>
                            )}
                            {phase.training && (
                                <button
                                    onClick={() => onNavigate && onNavigate('fitness')}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        background: 'var(--color-surface)',
                                        border: '1px solid var(--color-border-light)',
                                        borderRadius: 'var(--radius-md)',
                                        padding: '0.85rem 1rem',
                                        textAlign: 'left',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-sm)', background: withAlpha(phaseColor(guidePhase), 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', color: phaseColor(guidePhase), flexShrink: 0 }}>
                                        <IconActivity size={18} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text)', marginBottom: '0.1rem' }}>
                                            {phase.training.goal}
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                                            {phase.training.focus}
                                        </div>
                                    </div>
                                    <span style={{ color: 'var(--color-text-muted)', fontSize: '1rem', flexShrink: 0 }}>›</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* SECTION 3: THE SCIENCE */}
                {(phase.explanation || phase.bodySignal) && (
                    <div>
                        <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', margin: '0 0 0.6rem 0' }}>
                            {t('guide.science_title')}
                        </h3>
                        {phase.explanation && (
                            <p style={{ fontSize: '0.92rem', lineHeight: '1.55', margin: '0 0 0.5rem 0', color: 'var(--color-text)' }}>
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
            </div>

            <CheckInModal
                isOpen={showCheckIn}
                onClose={() => setShowCheckIn(false)}
                dateStr={todayStr}
            />
        </div>
    )
}