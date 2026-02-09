import React, { useState, useMemo } from 'react'
import { IconAccount, IconCalendar } from './Icons'
import { getPredictionWindow } from '../logic/cycle-learning'

export default function PeriodCalendar({ user, onClose, onSelect }) {
    const [viewDate, setViewDate] = useState(new Date())

    // Helper to get days in month
    const getDaysInMonth = (date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const days = new Date(year, month + 1, 0).getDate()
        const firstDay = new Date(year, month, 1).getDay() // 0 = Sun, 1 = Mon...

        // Adjust for Monday start (standard in NL/EU)
        // Sun(0) -> 6, Mon(1) -> 0
        const startOffset = firstDay === 0 ? 6 : firstDay - 1
        return { days, startOffset }
    }

    const { days, startOffset } = getDaysInMonth(viewDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Calculate prediction window
    const predictionWindow = useMemo(() => {
        const cycleLength = user.cycleStats?.learnedCycleLength || user.cycleLength || 28
        const confidence = user.cycleStats?.confidence || 'low'
        const periodStarts = user.periodStartDates || []

        // If no period starts logged, try to use cycleStart as fallback
        const startsToUse = periodStarts.length > 0
            ? periodStarts
            : (user.cycleStart ? [user.cycleStart.split('T')[0]] : [])

        return getPredictionWindow(startsToUse, cycleLength, confidence)
    }, [user.cycleStats, user.cycleLength, user.periodStartDates, user.cycleStart])

    // Helper: Is this day in prediction window?
    const isPredicted = (day) => {
        if (!predictionWindow) return false

        const dateStr = new Date(Date.UTC(viewDate.getFullYear(), viewDate.getMonth(), day)).toISOString().split('T')[0]
        return dateStr >= predictionWindow.start && dateStr <= predictionWindow.end
    }

    // Helper: Is this day a menstruation day?
    const isMenstruating = (day) => {
        const currentCheckDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
        currentCheckDate.setHours(0, 0, 0, 0)
        const checkTime = currentCheckDate.getTime()

        // 0. Check Explicit Logs (Overrides History/Prediction)
        const dateStr = new Date(Date.UTC(viewDate.getFullYear(), viewDate.getMonth(), day)).toISOString().split('T')[0]
        const explicitLog = user.menstruationLogs?.find(l => l.date === dateStr)

        if (explicitLog) {
            return explicitLog.status === 'yes'
        }

        // 1. Check History
        if (user.cycleHistory) {
            for (let cycle of user.cycleHistory) {
                const s = new Date(cycle.startDate)
                s.setHours(0, 0, 0, 0)
                // Use 'periodLength' from history if available, else standard fallback
                const pLen = cycle.periodLength || user.periodLength || 5

                // End date of PERIOD, not cycle
                const e = new Date(s)
                e.setDate(s.getDate() + pLen - 1)

                if (checkTime >= s.getTime() && checkTime <= e.getTime()) {
                    return true
                }
            }
        }

        // 2. Check Current Cycle
        if (user.cycleStart) {
            const s = new Date(user.cycleStart)
            s.setHours(0, 0, 0, 0)

            // Effective Period Length for current cycle
            const pLen = (user.currentPeriodLength !== null && user.currentPeriodLength !== undefined)
                ? user.currentPeriodLength
                : user.periodLength

            const e = new Date(s)
            e.setDate(s.getDate() + pLen - 1)

            if (checkTime >= s.getTime() && checkTime <= e.getTime()) {
                return true
            }
        }

        return false
    }

    const handlePrev = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
    }
    const handleNext = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
    }

    // Grid Generation
    const grid = []
    // Empty start slots
    for (let i = 0; i < startOffset; i++) {
        grid.push(<div key={`empty-${i}`} />)
    }
    // Days
    for (let i = 1; i <= days; i++) {
        const isPeriod = isMenstruating(i)
        const checkDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), i)
        checkDate.setHours(0, 0, 0, 0)
        const isToday = checkDate.getTime() === today.getTime()

        // Movement Check
        const dateStr = new Date(Date.UTC(checkDate.getFullYear(), checkDate.getMonth(), i)).toISOString().split('T')[0]
        const hasMovement = user.movementLogs?.some(l => l.date === dateStr && l.status === 'moved')

        // Prediction Check (only show if not already menstruating)
        const showPrediction = !isPeriod && isPredicted(i)

        // Background: prediction highlight takes precedence over today highlight
        let bgColor = 'transparent'
        if (showPrediction) {
            bgColor = 'rgba(232, 180, 188, 0.25)'
        } else if (isToday) {
            bgColor = 'var(--color-bg)'
        }

        grid.push(
            <div key={i} style={{
                aspectRatio: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                background: bgColor,
                borderRadius: '50%',
                margin: '2px',
                cursor: 'pointer'
            }} onClick={() => onSelect && onSelect(checkDate)}>


                {/* Date Number */}
                <span style={{
                    position: 'absolute',
                    top: '6px',
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    fontSize: '0.75rem',
                    color: isToday ? 'var(--color-primary)' : 'var(--color-text)',
                    fontWeight: isToday ? '700' : '400',
                    zIndex: 1
                }}>{i}</span>

                {/* Dots Container */}
                <div style={{
                    position: 'absolute',
                    bottom: '6px',
                    left: 0,
                    right: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    zIndex: 2
                }}>
                    {isPeriod && (
                        <div style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: '#E8B4BC'
                        }}></div>
                    )}
                    {hasMovement && (
                        <div style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-movement)'
                        }}></div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backdropFilter: 'blur(4px)'
        }} onClick={onClose}>

            {/* Boxed Card */}
            <div style={{
                background: 'var(--color-surface)',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '360px',
                padding: '1.5rem',
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                position: 'relative'
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.5rem'
                }}>
                    <button onClick={handlePrev} style={{
                        background: 'none', border: 'none',
                        fontSize: '1.5rem', cursor: 'pointer',
                        color: 'var(--color-text)', opacity: 0.6,
                        padding: '0.5rem'
                    }}>‹</button>

                    <h2 style={{
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        margin: 0,
                        textTransform: 'capitalize',
                        color: 'var(--color-text)'
                    }}>
                        {viewDate.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}
                    </h2>

                    <button onClick={handleNext} style={{
                        background: 'none', border: 'none',
                        fontSize: '1.5rem', cursor: 'pointer',
                        color: 'var(--color-text)', opacity: 0.6,
                        padding: '0.5rem'
                    }}>›</button>
                </div>

                {/* Days Header */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    marginBottom: '0.75rem'
                }}>
                    {['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'].map(d => (
                        <div key={d} style={{
                            textAlign: 'center',
                            fontSize: '0.7rem',
                            color: 'var(--color-text-muted)',
                            textTransform: 'uppercase',
                            fontWeight: '600',
                            letterSpacing: '1px'
                        }}>
                            {d}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    rowGap: '0.5rem',
                    columnGap: '0.2rem'
                }}>
                    {grid}
                </div>

                {/* Legend */}
                <div style={{
                    marginTop: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '1.25rem',
                        fontSize: '0.8rem',
                        color: 'var(--color-text-muted)',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#E8B4BC' }}></div>
                            <span>Menstruatie</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-movement)' }}></div>
                            <span>Gesport</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                background: 'rgba(232, 180, 188, 0.25)'
                            }}></div>
                            <span>Waarschijnlijk menstruatie</span>
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <p style={{
                        fontSize: '0.7rem',
                        color: 'var(--color-text-muted)',
                        textAlign: 'center',
                        margin: 0,
                        opacity: 0.7,
                        lineHeight: 1.4
                    }}>
                        Schatting op basis van je logs. Kan per cyclus verschillen.
                    </p>
                </div>

            </div>
        </div>
    )
}
