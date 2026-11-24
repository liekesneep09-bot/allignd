import { useState, useMemo, useRef } from 'react'
import { useUser } from '../context/UserContext'
import { cycleLessons } from '../data/cycleLessons'
import './PhaseGuide.css'
import { useLanguage } from '../context/LanguageContext'
import { getLocalDateStr } from '../utils/date'
import { IconActivity, IconNutrition } from '../components/Icons'
import { getFuturePeriodWindows } from '../logic/cycle-learning'
import {
    getCalendarCycleInfo,
    getNextPeriodMilestone,
    phaseColor,
    phaseTextColor,
    withAlpha,
    parseDateStr,
    PHASE_ORDER
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
    const [explorePhase, setExplorePhase] = useState(null)
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

    const milestones = useMemo(() => {
        if (!user?.cycleStart) return null
        return getNextPeriodMilestone(user.cycleStart, effectiveCycleLen, todayStr)
    }, [user?.cycleStart, effectiveCycleLen, todayStr])

    const handlePrev = () => {
        setExplorePhase(null)
        setSelectedDateStr(null)
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
    }
    const handleNext = () => {
        setExplorePhase(null)
        setSelectedDateStr(null)
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
    }

    const selectDay = (dateStr) => {
        setExplorePhase(null)
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
            return { phase: PHASES.MENSTRUAL, day: getCalendarCycleInfo(activeDateStr, user.cycleStart, effectiveCycleLen, effectivePeriodLen)?.day }
        }
        return getCalendarCycleInfo(activeDateStr, user.cycleStart, effectiveCycleLen, effectivePeriodLen)
    }, [activeDateStr, user?.cycleStart, effectiveCycleLen, effectivePeriodLen, isDateInPeriod])

    const en = language === 'en'
    const isViewingToday = activeDateStr === todayStr
    const datedPhase = isViewingToday && user?.cycleStart ? currentPhase : activeCycleInfo?.phase
    const guidePhase = explorePhase || datedPhase || PHASES.MENSTRUAL
    const guideDay = isViewingToday ? currentDay : activeCycleInfo?.day
    const [headline, body, signals, pattern] = cycleLessons[en ? 'en' : 'nl'][guidePhase]
    const activeSymptoms = user?.symptomLogs?.find(l => l.date === activeDateStr)?.symptoms || []

    // --- RENDER ---
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const formatDateLabel = (dateStr) => {
        const d = parseDateStr(dateStr)
        return d.toLocaleDateString(language === 'en' ? 'en-US' : 'nl-NL', { day: 'numeric', month: 'long' })
    }

    return (
        <div className="cycle-guide" style={{ '--wash': `var(--phase-${guidePhase}-bg)`, '--tone': phaseTextColor(guidePhase), '--soft': `var(--phase-${guidePhase}-soft)` }}>
          <div className="cycle-inner">
            <header ref={guideRef} className="cycle-header">
                <h1>{en ? 'Your cycle' : 'Jouw cyclus'}</h1>
                <span>{isViewingToday ? t('calendar.today') : formatDateLabel(activeDateStr)}{datedPhase && guideDay ? ' · ' + t('common.day') + ' ' + guideDay : ''}</span>
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

            <div className="cycle-phases" role="group" aria-label={en ? 'Explore a phase' : 'Ontdek een fase'}>
                {PHASE_ORDER.map((id, index) => <button key={id} aria-pressed={guidePhase === id}
                    style={{ '--phase-ink': phaseTextColor(id), '--phase-fill': `var(--phase-${id}-soft)` }}
                    onClick={() => setExplorePhase(id)}>
                    {(en ? ['Period','Follicular','Ovulation','Luteal'] : ['Menstruatie','Folliculair','Ovulatie','Luteaal'])[index]}
                </button>)}
            </div>
            <article className="cycle-feature" aria-live="polite">
                <small>{!datedPhase || guidePhase !== datedPhase ? (en ? 'Explore this phase' : 'Ontdek deze fase') : (en ? 'Estimated phase' : 'Geschatte fase')} · {t('profile.phases.' + guidePhase)}</small>
                <h2>{headline}</h2><p>{body}</p>
            </article>
            <section className="cycle-notes">
                <h2>{en ? 'What you might notice' : 'Wat kun je merken?'}</h2><p>{signals}</p>
                <details key={guidePhase}><summary>{en ? 'Recognise your own pattern' : 'Herken je eigen patroon'}</summary><p>{pattern}</p></details>
            </section>
            {activeDateStr <= todayStr && <div className="cycle-check">
                <button onClick={() => setShowCheckIn(true)}>{t('cycle.log_checkin')} · {isViewingToday ? t('calendar.today') : formatDateLabel(activeDateStr)}</button>
                {activeSymptoms.length > 0 && <p>{activeSymptoms.map(id => t('checkin.symptoms.' + id)).join(' · ')}</p>}
            </div>}
            {/* 1. CALENDAR BLOCK */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <button
                        onClick={handlePrev}
                        style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: 'var(--color-text)', opacity: 0.6, cursor: 'pointer', padding: '0.25rem', minWidth: '44px', minHeight: '44px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        aria-label={language === 'en' ? 'Previous month' : 'Vorige maand'}
                    >‹</button>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0, textTransform: 'capitalize', color: 'var(--color-text)' }}>
                        {viewDate.toLocaleDateString(language === 'en' ? 'en-US' : 'nl-NL', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button
                        onClick={handleNext}
                        style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: 'var(--color-text)', opacity: 0.6, cursor: 'pointer', padding: '0.25rem', minWidth: '44px', minHeight: '44px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        aria-label={language === 'en' ? 'Next month' : 'Volgende maand'}
                    >›</button>
                </div>

                {/* Return to the current month and day */}
                {user?.cycleStart && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        {(!isViewingToday || viewDate.getMonth() !== today.getMonth() || viewDate.getFullYear() !== today.getFullYear()) && (
                            <button
                                onClick={() => { setViewDate(new Date()); setExplorePhase(null); setSelectedDateStr(null) }}
                                style={{
                                    background: 'none',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-full)',
                                    padding: '0.2rem 0.6rem',
                                    minHeight: '44px',
                                    fontSize: '0.7rem',
                                    color: 'var(--color-text-muted)',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                {t('calendar.today')}
                            </button>
                        )}
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
                        const isSelected = activeDateStr === dateStr
                        const hasMovement = user?.movementLogs?.some(l => l.date === dateStr && l.status === 'moved')
                        const hasSymptoms = user?.symptomLogs?.some(l => l.date === dateStr && l.symptoms?.length > 0)
                        const tintColor = cycleInfo?.phase ? phaseColor(cycleInfo.phase) : null

                        return (
                            <button
                                key={day}
                                type="button"
                                aria-label={date.toLocaleDateString(language === 'en' ? 'en-US' : 'nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                aria-pressed={isSelected}
                                aria-current={isToday ? 'date' : undefined}
                                onClick={() => selectDay(dateStr)}
                                style={{
                                    aspectRatio: '1',
                                    minHeight: '44px',
                                    width: '100%',
                                    padding: 0,
                                    border: 0,
                                    background: 'transparent',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    cursor: 'pointer',
                                    borderRadius: 'var(--radius-sm)'
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
                                {(hasMovement || hasSymptoms) && (
                                    <div style={{ position: 'absolute', bottom: '0', left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', zIndex: 2 }}>
                                        {hasMovement && (
                                            <div style={{ width: '6px', height: '6px', borderRadius: 'var(--radius-full)', background: 'var(--color-movement)' }} />
                                        )}
                                        {hasSymptoms && (
                                            <div style={{ width: '6px', height: '6px', borderRadius: 'var(--radius-full)', background: 'var(--color-symptoms)' }} />
                                        )}
                                    </div>
                                )}
                            </button>
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
                    </div>
                )}

                <details className="cycle-legend"><summary>{en ? 'Calendar key' : 'Wat betekenen de kleuren?'}</summary>
                <div style={{ marginTop: '1.25rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ width: '14px', height: '14px', borderRadius: 'var(--radius-full)', background: 'var(--color-primary)' }}></div>
                        <span>{t('cycle.menstruation')}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ width: '14px', height: '14px', borderRadius: 'var(--radius-full)', border: '2px dashed var(--color-primary)', boxSizing: 'border-box' }}></div>
                        <span>{t('cycle.predicted_menstruation')}</span>
                    </div>
                    {PHASE_ORDER.map(phaseId => (
                        <div key={phaseId} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <div style={{ width: '14px', height: '14px', borderRadius: 'var(--radius-full)', background: withAlpha(phaseColor(phaseId), 0.35), boxSizing: 'border-box' }} />
                            <span>{t(`profile.phases.${phaseId}`)}</span>
                        </div>
                    ))}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: 'var(--radius-full)', background: 'var(--color-movement)' }}></div>
                        <span>{t('cycle.moved')}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: 'var(--radius-full)', background: 'var(--color-symptoms)' }}></div>
                        <span>{t('cycle.symptoms')}</span>
                    </div>
                </div>
                <p style={{ margin: '0.9rem 0 0', textAlign: 'center', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                    {t('cycle.prediction_note')}
                </p></details>

            </div>

            <div className="cycle-links">
                <button onClick={() => onNavigate('recipes')}><IconNutrition size={18} />{en ? 'Nutrition today' : 'Voeding vandaag'} ›</button>
                <button onClick={() => onNavigate('fitness')}><IconActivity size={18} />{en ? 'Movement today' : 'Beweging vandaag'} ›</button>
            </div>
            <CheckInModal
                isOpen={showCheckIn}
                onClose={() => setShowCheckIn(false)}
                dateStr={activeDateStr}
            />
          </div>
        </div>
    )
}
