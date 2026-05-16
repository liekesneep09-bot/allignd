import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useUser } from '../context/UserContext'
import { useLanguage } from '../context/LanguageContext'
import { SYMPTOMS_LIST } from './CheckInModal'
import { getFuturePeriodWindows } from '../logic/cycle-learning'

// Parse "YYYY-MM-DD" in local time
function parseLocal(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d)
}

export default function PeriodCalendar({ user, onClose, onSelect }) {
    const { togglePeriodDate, isDateInPeriod } = useUser()
    const { t, language } = useLanguage()
    const scrollRef = React.useRef(null)
    const todayRef = React.useRef(null)
    const [hintDismissed, setHintDismissed] = useState(
        () => localStorage.getItem('allignd:calendar-hint-dismissed') === 'true'
    )
    const [selectedSummaryDateStr, setSelectedSummaryDateStr] = useState(null)
    const [justLogged, setJustLogged] = useState(false) // feedback flash

    const today = useMemo(() => {
        const t = new Date()
        t.setHours(0, 0, 0, 0)
        return t
    }, [])

    const todayStr = useMemo(() => {
        const pad = n => String(n).padStart(2, '0')
        return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
    }, [today])

    // Generate Month Range: 12 past, 12 future
    const months = useMemo(() => {
        const list = []
        for (let i = -12; i <= 12; i++) {
            const d = new Date(today.getFullYear(), today.getMonth() + i, 1)
            list.push(d)
        }
        return list
    }, [])

    // Predictions
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

    // Scroll to today on mount
    React.useEffect(() => {
        if (todayRef.current) {
            todayRef.current.scrollIntoView({ behavior: 'auto', block: 'center' })
        }
    }, [])

    // Any date ≤ today is clickable (including today)
    const handleDayClick = (dateStr) => {
        const d = parseLocal(dateStr)
        if (d > today) return // block future only
        setJustLogged(false)
        setSelectedSummaryDateStr(dateStr)
    }

    const handleTogglePeriod = () => {
        togglePeriodDate(selectedSummaryDateStr)
        setJustLogged(true)
        // After a short moment, close the sheet so the user sees the calendar update
        setTimeout(() => {
            setSelectedSummaryDateStr(null)
            setJustLogged(false)
        }, 800)
    }

    // Summary data for selected date
    const summaryData = useMemo(() => {
        if (!selectedSummaryDateStr) return null
        const isPeriod = isDateInPeriod(selectedSummaryDateStr)
        const hasMoved = user?.movementLogs?.some(l => l.date === selectedSummaryDateStr && l.status === 'moved')
        const waterAmount = user?.waterLogs?.find(l => l.date === selectedSummaryDateStr)?.amount_ml || 0
        const symptomsIds = user?.symptomLogs?.find(l => l.date === selectedSummaryDateStr)?.symptoms || []
        const symptomLabels = symptomsIds.map(id => SYMPTOMS_LIST.find(s => s.id === id)?.label).filter(Boolean)
        const isToday = selectedSummaryDateStr === todayStr

        return { isPeriod, hasMoved, waterAmount, symptomLabels, isToday }
    }, [selectedSummaryDateStr, user, justLogged]) // re-run when justLogged toggles to catch state update

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '480px',
            bottom: 0,
            background: '#FFFFFF',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 0 20px rgba(0,0,0,0.1)'
        }}>

            {/* Header */}
            <div style={{
                padding: '1rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#fff',
                borderBottom: '1px solid #f0f0f0'
            }}>
                <button
                    onClick={onClose}
                    style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: 'var(--color-text)', cursor: 'pointer', padding: 0 }}
                >
                    ✕
                </button>
                <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{t('calendar.title')}</div>
                <div style={{ width: '24px' }} />
            </div>

            {/* Day of week headers */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                padding: '0.5rem 1rem 0.25rem',
                borderBottom: '1px solid #f0f0f0',
                background: '#fafafa'
            }}>
                {t('calendar.days', { returnObjects: true })?.map(d => (
                    <div key={d} style={{
                        textAlign: 'center',
                        fontSize: '0.72rem',
                        color: 'var(--color-text-muted)',
                        textTransform: 'uppercase',
                        fontWeight: '600'
                    }}>
                        {d}
                    </div>
                ))}
            </div>

            {/* Hint banner */}
            {!hintDismissed && (user?.periodStartDates?.length || 0) < 3 && (
                <div style={{
                    margin: '0.75rem 1rem 0',
                    padding: '10px 14px',
                    background: 'rgba(168,100,115,0.07)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    fontSize: '0.82rem',
                    color: '#5D4037',
                    lineHeight: '1.45',
                    border: '1px solid rgba(168,100,115,0.15)'
                }}>
                    <span style={{ flexShrink: 0 }}>💡</span>
                    <div style={{ flex: 1 }}>
                        <strong>{t('calendar.tip')}</strong> {t('calendar.tip_desc')}
                    </div>
                    <button
                        onClick={e => {
                            e.stopPropagation()
                            setHintDismissed(true)
                            localStorage.setItem('allignd:calendar-hint-dismissed', 'true')
                        }}
                        style={{ background: 'none', border: 'none', color: '#9E9E9E', fontSize: '1rem', cursor: 'pointer', padding: 0, flexShrink: 0 }}
                    >✕</button>
                </div>
            )}

            {/* Scrollable months */}
            <div
                ref={scrollRef}
                style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1rem', paddingBottom: '130px' }}
            >
                {months.map((monthDate, index) => (
                    <MonthGrid
                        key={index}
                        monthDate={monthDate}
                        user={user}
                        predictedWindows={predictedWindows}
                        onDayClick={handleDayClick}
                        todayRef={index === 12 ? todayRef : null}
                        isDateInPeriod={isDateInPeriod}
                        todayStr={todayStr}
                    />
                ))}
            </div>

            {/* Fixed bottom: legend + button */}
            <div style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                background: '#fff',
                borderTop: '1px solid #f0f0f0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '0.75rem 1.25rem 1.5rem',
                gap: '0.65rem'
            }}>
                {/* Legend — "Vandaag" removed */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <LegendItem color="#a86473" filled label={t('calendar.period')} />
                    <LegendItem color="#a86473" dashed label={t('calendar.expected')} />
                    <LegendItem color="#4DB6AC" dot label={t('calendar.moved')} />
                    <LegendItem color="#f5a89c" dot label={t('calendar.symptoms')} />
                </div>
                <button
                    onClick={onClose}
                    style={{
                        background: 'var(--color-primary)',
                        color: '#fff',
                        border: 'none',
                        padding: '0.8rem 3rem',
                        borderRadius: '30px',
                        fontWeight: '600',
                        fontSize: '1rem',
                        boxShadow: '0 4px 12px rgba(255, 174, 185, 0.4)',
                        cursor: 'pointer'
                    }}
                >
                    {t('common.done')}
                </button>
            </div>

            {/* Day summary sheet */}
            {selectedSummaryDateStr && summaryData && (
                <DaySummarySheet
                    dateStr={selectedSummaryDateStr}
                    summaryData={summaryData}
                    justLogged={justLogged}
                    onClose={() => setSelectedSummaryDateStr(null)}
                    onToggle={handleTogglePeriod}
                />
            )}
        </div>
    )
}

// ── Legend item ───────────────────────────────────────────────────────────────
function LegendItem({ color, filled, dashed, dot, label }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {dot ? (
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
            ) : dashed ? (
                <div style={{ width: 10, height: 10, borderRadius: '50%', border: `2px dashed ${color}`, boxSizing: 'border-box' }} />
            ) : (
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
            )}
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{label}</span>
        </div>
    )
}

// ── Day Summary Sheet ─────────────────────────────────────────────────────────
function DaySummarySheet({ dateStr, summaryData, justLogged, onClose, onToggle }) {
    const { t, language } = useLanguage()
    const dateObj = parseLocal(dateStr)
    const dateHeader = dateObj.toLocaleDateString(language === 'en' ? 'en-US' : 'nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })
    const { isPeriod, hasMoved, waterAmount, symptomLabels, isToday } = summaryData

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 2999 }}
            />
            <div style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                background: '#fff',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
                boxShadow: '0 -4px 30px rgba(0,0,0,0.12)',
                zIndex: 3000,
                padding: '1.5rem',
                animation: 'slideUp 0.25s ease-out'
            }}>
                {/* Handle */}
                <div style={{ width: '40px', height: '4px', background: 'var(--color-border)', borderRadius: '2px', margin: '0 auto 1.25rem' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--color-text)', textTransform: 'capitalize' }}>
                        {isToday ? t('calendar.today') : dateHeader}
                    </h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.4rem', padding: 0, cursor: 'pointer', color: 'var(--color-text-muted)' }}>✕</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    {/* Menstruation row */}
                    <SummaryRow
                        color={isPeriod ? '#a86473' : '#f0f0f0'}
                        iconColor={isPeriod ? '#fff' : 'transparent'}
                        label={isPeriod ? t('calendar.period_logged') : t('calendar.no_period_logged')}
                        active={isPeriod}
                    />

                    {/* Movement */}
                    <SummaryRow color={hasMoved ? '#4DB6AC' : '#f0f0f0'} iconColor={hasMoved ? '#fff' : 'transparent'} label={hasMoved ? t('calendar.movement_logged') : t('calendar.no_movement_logged')} active={hasMoved} />

                    {/* Water */}
                    <SummaryRow
                        color={waterAmount > 0 ? '#89C4F4' : '#f0f0f0'}
                        iconColor={waterAmount > 0 ? '#fff' : 'transparent'}
                        label={waterAmount > 0 ? `${(waterAmount / 1000).toFixed(1)}L ${t('calendar.water_logged')}` : t('calendar.no_water_logged')}
                        active={waterAmount > 0}
                    />

                    {/* Symptoms */}
                    {symptomLabels.length > 0 && (
                        <SummaryRow color="#f5a89c" iconColor="#fff" label={`${t('calendar.symptoms_prefix')} ${symptomLabels.join(', ')}`} active={true} />
                    )}
                </div>

                {/* CTA: Toggle period */}
                {justLogged ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '1rem',
                        background: 'rgba(168,100,115,0.08)',
                        borderRadius: '16px',
                        color: '#a86473',
                        fontWeight: '600',
                        fontSize: '0.95rem'
                    }}>
                        ✓ {isPeriod ? t('calendar.success_logged') : t('calendar.success_removed')}
                    </div>
                ) : (
                    <button
                        onClick={onToggle}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            borderRadius: '16px',
                            border: 'none',
                            background: isPeriod ? 'rgba(168,100,115,0.08)' : '#a86473',
                            color: isPeriod ? '#a86473' : '#fff',
                            fontWeight: '700',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {isPeriod ? t('calendar.remove_period') : t('calendar.add_period')}
                    </button>
                )}
            </div>
        </>
    )
}

function SummaryRow({ color, label, active }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
                width: '26px', height: '26px', borderRadius: '50%',
                background: color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
            }}>
                {active && <span style={{ color: '#fff', fontSize: '0.75rem' }}>✓</span>}
            </div>
            <span style={{ fontSize: '0.9rem', color: 'var(--color-text)', fontWeight: active ? '600' : '400' }}>
                {label}
            </span>
        </div>
    )
}

// ── Month Grid ────────────────────────────────────────────────────────────────
function MonthGrid({ monthDate, user, predictedWindows, onDayClick, todayRef, isDateInPeriod, todayStr }) {
    const { t, language } = useLanguage()
    const year = monthDate.getFullYear()
    const month = monthDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()
    const startOffset = firstDay === 0 ? 6 : firstDay - 1

    const grid = []

    for (let i = 0; i < startOffset; i++) {
        grid.push(<div key={`e-${i}`} />)
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const pad = n => String(n).padStart(2, '0')
        const dateStr = `${year}-${pad(month + 1)}-${pad(i)}`
        const isToday = dateStr === todayStr

        const isPeriod = isDateInPeriod?.(dateStr) || false
        const isPredicted = !isPeriod && predictedWindows[dateStr]
        const hasMoved = user.movementLogs?.some(l => l.date === dateStr && l.status === 'moved')
        const hasSymptoms = user.symptomLogs?.some(l => l.date === dateStr && l.symptoms?.length > 0)

        // Is future (strictly after today)
        const dDate = parseLocal(dateStr)
        const dToday = parseLocal(todayStr)
        const isFuture = dDate > dToday

        grid.push(
            <div
                key={i}
                onClick={() => onDayClick(dateStr)}
                style={{
                    aspectRatio: '1',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    cursor: isFuture ? 'default' : 'pointer',
                    opacity: isFuture ? 0.4 : 1
                }}
            >
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.88rem',
                    fontWeight: isToday || isPeriod ? '700' : '400',
                    background: isPeriod ? '#a86473' : 'transparent',
                    color: isPeriod ? '#fff' : (isPredicted ? '#a86473' : '#2D3436'),
                    border: isToday && !isPeriod
                        ? '2px solid var(--color-primary)'
                        : isPredicted
                            ? '2px dashed #a86473'
                            : '2px solid transparent',
                    boxSizing: 'border-box'
                }}>
                    {i}
                </div>

                {/* Indicator dots */}
                <div style={{
                    display: 'flex',
                    gap: '2px',
                    marginTop: '2px',
                    height: '5px',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    {hasMoved && (
                        <div style={{
                            width: 4, height: 4, borderRadius: '50%',
                            background: isPeriod ? 'rgba(255,255,255,0.8)' : '#4DB6AC'
                        }} />
                    )}
                    {hasSymptoms && (
                        <div style={{
                            width: 4, height: 4, borderRadius: '50%',
                            background: isPeriod ? 'rgba(255,255,255,0.6)' : '#f5a89c'
                        }} />
                    )}
                </div>
            </div>
        )
    }

    return (
        <div ref={todayRef} style={{ marginBottom: '1.75rem' }}>
            <h3 style={{
                fontSize: '0.95rem',
                fontWeight: '700',
                marginBottom: '0.75rem',
                paddingLeft: '0.25rem',
                color: '#2D3436',
                textTransform: 'capitalize'
            }}>
                {monthDate.toLocaleDateString(language === 'en' ? 'en-US' : 'nl-NL', { month: 'long', year: 'numeric' })}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: '0.35rem' }}>
                {grid}
            </div>
        </div>
    )
}
