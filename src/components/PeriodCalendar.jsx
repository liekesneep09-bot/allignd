import React, { useState, useMemo } from 'react'
import { useUser } from '../context/UserContext'
import { IconAccount, IconCalendar } from './Icons'
import { getFuturePeriodWindows } from '../logic/cycle-learning'
import { SYMPTOMS_LIST } from './CheckInModal'

export default function PeriodCalendar({ user, onClose, onSelect }) {
    const { togglePeriodDate } = useUser()
    const scrollRef = React.useRef(null)
    const todayRef = React.useRef(null)
    const [hintDismissed, setHintDismissed] = useState(
        () => localStorage.getItem('allignd:calendar-hint-dismissed') === 'true'
    )
    const [selectedSummaryDateStr, setSelectedSummaryDateStr] = useState(null)

    // Generate Month Range (e.g., 12 months past, 12 months future)
    const months = useMemo(() => {
        const today = new Date()
        const list = []
        for (let i = -12; i <= 12; i++) {
            const d = new Date(today.getFullYear(), today.getMonth() + i, 1)
            list.push(d)
        }
        return list
    }, [])

    // Calculate Predictions (Memoized)
    const predictedWindows = useMemo(() => {
        if (!user?.periodStartDates || user.periodStartDates.length === 0) return {}

        return getFuturePeriodWindows(
            user.periodStartDates,
            user.cycleStats?.learnedCycleLength || user.cycleLength || 28,
            user.periodLength || 5,
            user.cycleStats?.variability || 0,
            4 // Predict 4 cycles ahead
        )
    }, [user?.periodStartDates, user?.cycleStats, user?.cycleLength, user?.periodLength])

    // Scroll to today on mount
    React.useEffect(() => {
        if (todayRef.current) {
            todayRef.current.scrollIntoView({ behavior: 'auto', block: 'center' })
        }
    }, [])

    const handleDayClick = (dateStr) => {
        const checkDate = new Date(dateStr)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const isFuture = checkDate > today
        if (isFuture) return

        setSelectedSummaryDateStr(dateStr)
    }

    // Helper data for the summary sheet
    const summaryData = useMemo(() => {
        if (!selectedSummaryDateStr) return null

        const isPeriod = user?.menstruationLogs?.some(l => l.date === selectedSummaryDateStr && l.status === 'yes')
        const hasMoved = user?.movementLogs?.some(l => l.date === selectedSummaryDateStr && l.status === 'moved')
        const waterAmount = user?.waterLogs?.find(l => l.date === selectedSummaryDateStr)?.amount_ml || 0
        const symptomsIds = user?.symptomLogs?.find(l => l.date === selectedSummaryDateStr)?.symptoms || []

        // Simple text representation of symptoms
        const symptomLabels = symptomsIds.map(id => SYMPTOMS_LIST.find(s => s.id === id)?.label).filter(Boolean)

        return { isPeriod, hasMoved, waterAmount, symptomLabels }
    }, [selectedSummaryDateStr, user])

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '480px',
            bottom: 0,
            background: '#FFFFFF', // Clean White like Flo
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
                zIndex: 10,
                borderBottom: '1px solid #f0f0f0'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        color: 'var(--color-text)',
                        cursor: 'pointer',
                        padding: 0
                    }}
                >
                    ✕
                </button>

                <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>Kalender</div>

                <div style={{ width: '24px' }}></div> {/* Spacer */}
            </div>

            {/* Days of Week Header (Sticky below main header) */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                padding: '0.5rem 1rem',
                borderBottom: '1px solid #f0f0f0',
                background: '#fafafa'
            }}>
                {['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'].map(d => (
                    <div key={d} style={{
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        color: 'var(--color-text-muted)',
                        textTransform: 'uppercase',
                        fontWeight: '600'
                    }}>
                        {d}
                    </div>
                ))}
            </div>

            {/* Hint Banner for new users */}
            {!hintDismissed && (user?.periodStartDates?.length || 0) < 3 && (
                <div style={{
                    margin: '0 1rem',
                    padding: '10px 14px',
                    background: 'linear-gradient(135deg, #e2a9f120, #e2a9f110)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    fontSize: '0.82rem',
                    color: '#5D4037',
                    lineHeight: '1.45',
                    border: '1px solid rgba(226,169,241,0.3)'
                }}>
                    <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: '1px' }}>💡</span>
                    <div style={{ flex: 1 }}>
                        <strong>Tip:</strong> blader terug en tik je vorige menstruatiedagen aan. Hoe meer data, hoe nauwkeuriger je voorspelling.
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setHintDismissed(true)
                            localStorage.setItem('allignd:calendar-hint-dismissed', 'true')
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#9E9E9E',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            padding: '0',
                            lineHeight: 1,
                            flexShrink: 0
                        }}
                    >✕</button>
                </div>
            )}

            {/* Scrollable Content */}
            <div
                ref={scrollRef}
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '1rem',
                    paddingBottom: '140px' // Space for fixed legend + button bar
                }}
            >
                {months.map((monthDate, index) => (
                    <MonthGrid
                        key={index}
                        monthDate={monthDate}
                        user={user}
                        predictedWindows={predictedWindows}
                        onDayClick={handleDayClick}
                        todayRef={index === 12 ? todayRef : null} // Index 12 is "Today" (offset 0)
                    />
                ))}

            </div>

            {/* FIXED BOTTOM: Legenda + Klaar Button */}
            <div style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                right: '0',
                background: '#FFFFFF',
                borderTop: '1px solid #f0f0f0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '0.75rem 1.25rem 1.5rem',
                gap: '0.75rem',
                zIndex: 10
            }}>
                {/* Legenda ... */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    width: '100%'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#a86473' }} />
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Menstruatie</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', border: '2px dashed #a86473', boxSizing: 'border-box' }} />
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Verwacht</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4DB6AC' }} />
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Gesport</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f0f0f0' }} />
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Vandaag</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#f5a89c' }} />
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Symptomen</span>
                    </div>
                </div>

                {/* Klaar Button */}
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
                        boxShadow: '0 4px 12px rgba(112, 193, 163, 0.4)',
                        cursor: 'pointer',
                        transition: 'transform 0.1s'
                    }}
                >
                    Klaar
                </button>
            </div>

            {/* DAY SUMMARY OVERLAY SHEET */}
            {selectedSummaryDateStr && summaryData && (() => {
                const dateObj = new Date(selectedSummaryDateStr)
                const dateHeader = dateObj.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })

                return (
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: '#fff',
                        borderTopLeftRadius: '24px',
                        borderTopRightRadius: '24px',
                        boxShadow: '0 -4px 30px rgba(0,0,0,0.1)',
                        zIndex: 3000,
                        padding: '1.5rem',
                        animation: 'slideUp 0.3s ease-out'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--color-text)' }}>
                                <span style={{ textTransform: 'capitalize' }}>{dateHeader}</span>
                            </h3>
                            <button
                                onClick={() => setSelectedSummaryDateStr(null)}
                                style={{ background: 'none', border: 'none', fontSize: '1.5rem', lineHeight: 1, padding: 0, cursor: 'pointer', color: 'var(--color-text-muted)' }}
                            >✕</button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            {/* Menstruation Status */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: summaryData.isPeriod ? '#a86473' : '#f0f0f0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    {summaryData.isPeriod && <span style={{ color: '#fff', fontSize: '0.8rem' }}>✓</span>}
                                </div>
                                <span style={{ fontSize: '0.95rem', color: 'var(--color-text)', fontWeight: summaryData.isPeriod ? '600' : '400' }}>
                                    {summaryData.isPeriod ? 'Menstruatie (Dag gelogd)' : 'Geen menstruatie gelogd'}
                                </span>
                            </div>

                            {/* Movement Status */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: summaryData.hasMoved ? '#4DB6AC' : '#f0f0f0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    {summaryData.hasMoved && <span style={{ color: '#fff', fontSize: '0.8rem' }}>✓</span>}
                                </div>
                                <span style={{ fontSize: '0.95rem', color: 'var(--color-text)', fontWeight: summaryData.hasMoved ? '600' : '400' }}>
                                    {summaryData.hasMoved ? 'Beweging / Sport gelogd' : 'Geen beweging gelogd'}
                                </span>
                            </div>

                            {/* Water Status */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: summaryData.waterAmount > 0 ? '#4da6b3' : '#f0f0f0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    {summaryData.waterAmount > 0 && <span style={{ color: '#fff', fontSize: '0.8rem' }}>💧</span>}
                                </div>
                                <span style={{ fontSize: '0.95rem', color: 'var(--color-text)', fontWeight: summaryData.waterAmount > 0 ? '600' : '400' }}>
                                    {summaryData.waterAmount > 0 ? `${(summaryData.waterAmount / 1000).toFixed(1)}L Water gedronken` : 'Geen water gelogd'}
                                </span>
                            </div>

                            {/* Symptoms Status */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: summaryData.symptomLabels.length > 0 ? '#f5a89c' : '#f0f0f0', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                                    {summaryData.symptomLabels.length > 0 && <span style={{ color: '#fff', fontSize: '0.8rem' }}>✨</span>}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.95rem', color: 'var(--color-text)', fontWeight: summaryData.symptomLabels.length > 0 ? '600' : '400', marginTop: '4px' }}>
                                        {summaryData.symptomLabels.length > 0 ? 'Symptomen gelogd' : 'Geen symptomen gelogd'}
                                    </span>
                                    {summaryData.symptomLabels.length > 0 && (
                                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                                            {summaryData.symptomLabels.join(', ')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                if (onSelect) {
                                    onSelect(dateObj)
                                }
                            }}
                            className="btn btn-primary"
                            style={{ width: '100%', boxShadow: 'var(--shadow-soft)' }}
                        >
                            Bewerk deze dag op dashboard
                        </button>
                    </div>
                )
            })()}

        </div>
    )
}

// Sub-component for a single month
function MonthGrid({ monthDate, user, predictedWindows, onDayClick, todayRef }) {
    const year = monthDate.getFullYear()
    const month = monthDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()
    const startOffset = firstDay === 0 ? 6 : firstDay - 1

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const grid = []

    // Empty slots
    for (let i = 0; i < startOffset; i++) {
        grid.push(<div key={`empty-${i}`} />)
    }

    // Days
    for (let i = 1; i <= daysInMonth; i++) {
        const currentCheckDate = new Date(year, month, i)
        currentCheckDate.setHours(0, 0, 0, 0)

        // Use UTC string for logic to match consistency
        const dateStr = new Date(Date.UTC(year, month, i)).toISOString().split('T')[0]

        const isToday = currentCheckDate.getTime() === today.getTime()
        const isFuture = currentCheckDate > today

        // Check Status
        // 1. Explicit Log
        const log = user.menstruationLogs?.find(l => l.date === dateStr)
        const isPeriod = log?.status === 'yes'

        // 2. Prediction Logic (Visuals)
        const isPredicted = !isPeriod && predictedWindows[dateStr]

        // 3. Movement Logic
        const flowLog = user.movementLogs?.find(l => l.date === dateStr)
        const hasMoved = flowLog?.status === 'moved'

        // 4. Symptoms Logic
        const symptomLog = user.symptomLogs?.find(l => l.date === dateStr)
        const hasSymptoms = symptomLog?.symptoms?.length > 0

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
                    cursor: 'pointer',
                    opacity: 1
                }}
            >
                {/* Number */}
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    fontWeight: isToday || isPeriod ? '700' : '400',
                    background: isPeriod ? '#a86473' : (isToday ? '#f0f0f0' : 'transparent'),
                    color: isPeriod ? '#fff' : (isPredicted ? '#a86473' : '#2D3436'),
                    border: isPredicted ? '2px dashed #a86473' : '2px solid transparent',
                    boxSizing: 'border-box',
                    position: 'relative' // For dot positioning
                }}>
                    {i}
                </div>

                {/* Indicators Container */}
                <div style={{
                    display: 'flex',
                    gap: '3px',
                    position: isPeriod ? 'absolute' : 'static',
                    bottom: isPeriod ? '3px' : 'auto',
                    marginTop: isPeriod ? '0' : '2px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '5px'
                }}>
                    {hasMoved && (
                        <div style={{
                            width: isPeriod ? '4px' : '5px',
                            height: isPeriod ? '4px' : '5px',
                            borderRadius: '50%',
                            background: isPeriod ? '#fff' : '#4DB6AC',
                        }} />
                    )}
                    {hasSymptoms && (
                        <div style={{
                            width: isPeriod ? '4px' : '5px',
                            height: isPeriod ? '4px' : '5px',
                            borderRadius: '50%',
                            background: isPeriod ? 'rgba(255,255,255,0.7)' : '#f5a89c'
                        }} />
                    )}
                </div>
            </div>
        )
    }

    return (
        <div ref={todayRef} style={{ marginBottom: '2rem' }}>
            <h3 style={{
                fontSize: '1rem',
                fontWeight: '700',
                marginBottom: '1rem',
                paddingLeft: '0.5rem',
                color: '#2D3436'
            }}>
                {monthDate.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}
            </h3>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                rowGap: '0.5rem'
            }}>
                {grid}
            </div>
        </div>
    )
}
