import React, { useState } from 'react'
import { useUser } from '../context/UserContext'
import { PHASE_CONTENT } from '../data/phases'

export default function PhaseGuide() {
    const { user, currentPhase, currentDay } = useUser()
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
        const dateStr = new Date(Date.UTC(viewDate.getFullYear(), viewDate.getMonth(), day)).toISOString().split('T')[0]
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

    const handlePrev = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
    const handleNext = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))

    // --- RENDER ---
    const phase = PHASE_CONTENT[currentPhase]

    return (
        <div className="container" style={{ paddingBottom: '90px' }}>
            <header style={{ marginBottom: '1.5rem', marginTop: '0' }}>
                <h1 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', margin: 0 }}>Jouw Cyclus</h1>
            </header>

            {/* 1. CALENDAR BLOCK */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <button onClick={handlePrev} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: 'var(--color-text)', opacity: 0.6, cursor: 'pointer', padding: '0.25rem' }}>‹</button>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0, textTransform: 'capitalize', color: 'var(--color-text)' }}>
                        {viewDate.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button onClick={handleNext} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: 'var(--color-text)', opacity: 0.6, cursor: 'pointer', padding: '0.25rem' }}>›</button>
                </div>

                {/* Days Header */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '0.75rem' }}>
                    {['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'].map(d => (
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

                        // Movement Check
                        const dateStr = new Date(Date.UTC(date.getFullYear(), date.getMonth(), day)).toISOString().split('T')[0]
                        const hasMovement = user.movementLogs?.some(l => l.date === dateStr && l.status === 'moved')

                        return (
                            <div key={day} style={{
                                aspectRatio: '1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                background: isToday ? 'var(--color-bg)' : 'transparent',
                                borderRadius: '50%',
                                margin: '2px'
                            }}>
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
                                }}>{day}</span>

                                {/* Dots Container */}
                                <div style={{ position: 'absolute', bottom: '6px', left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', zIndex: 2 }}>
                                    {isPeriod && (
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-primary)' }} />
                                    )}
                                    {hasMovement && (
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-movement)' }} />
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Legend */}
                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)' }}></div>
                        <span>Menstruatie</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-movement)' }}></div>
                        <span>Gesport</span>
                    </div>
                </div>
            </div>

            {/* 2. PHASE OVERVIEW */}
            <div className="card" style={{ borderLeft: `4px solid var(${phase.colorVar})` }}>
                <div style={{
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: 'var(--color-text-muted)',
                    marginBottom: '0.5rem'
                }}>
                    {phase.name} · dag {currentDay}
                </div>
                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: 'var(--color-text)', margin: 0 }}>
                    {phase.overview}
                </p>
            </div>
        </div>
    )
}
