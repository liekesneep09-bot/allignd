import React, { useState, useMemo } from 'react'
import { useUser } from '../context/UserContext'
import { IconAccount, IconCalendar } from './Icons'
import { getPredictionWindow } from '../logic/cycle-learning'

export default function PeriodCalendar({ user, onClose, onSelect }) {
    const { togglePeriodDate } = useUser()
    const scrollRef = React.useRef(null)
    const todayRef = React.useRef(null)

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

        if (togglePeriodDate) {
            togglePeriodDate(dateStr)
        }
    }

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

            {/* Scrollable Content */}
            <div
                ref={scrollRef}
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '1rem',
                    paddingBottom: '100px' // Space for floating button
                }}
            >
                {months.map((monthDate, index) => (
                    <MonthGrid
                        key={index}
                        monthDate={monthDate}
                        user={user}
                        onDayClick={handleDayClick}
                        todayRef={index === 12 ? todayRef : null} // Index 12 is "Today" (offset 0)
                    />
                ))}
            </div>

            {/* Floating "Edit / Done" Button */}
            <div style={{
                position: 'absolute',
                bottom: '2rem',
                left: '0',
                right: '0',
                display: 'flex',
                justifyContent: 'center',
                pointerEvents: 'none' // Allow clicking through container
            }}>
                <button
                    onClick={onClose}
                    style={{
                        pointerEvents: 'auto',
                        background: '#FF5E7D', // Flo Pink
                        color: '#fff',
                        border: 'none',
                        padding: '0.8rem 2rem',
                        borderRadius: '30px',
                        fontWeight: '600',
                        fontSize: '1rem',
                        boxShadow: '0 4px 12px rgba(255, 94, 125, 0.3)',
                        cursor: 'pointer',
                        transform: 'translateY(0)',
                        transition: 'transform 0.1s'
                    }}
                >
                    Pas menstruatie aan
                </button>
            </div>

        </div>
    )
}

// Sub-component for a single month
function MonthGrid({ monthDate, user, onDayClick, todayRef }) {
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

        // 2. Prediction (Simple MVP logic for list view)
        // We can check if date matches a known prediction range if we passed it down,
        // but for now let's keep the list lightweight and focused on history/today.
        const isPredicted = false

        grid.push(
            <div
                key={i}
                onClick={() => onDayClick(dateStr)}
                style={{
                    aspectRatio: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    cursor: isFuture ? 'default' : 'pointer',
                    opacity: isFuture ? 0.4 : 1
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
                    fontWeight: isToday ? '700' : '400',
                    background: isPeriod ? '#FF5E7D' : (isToday ? '#f0f0f0' : 'transparent'),
                    color: isPeriod ? '#fff' : '#2D3436',
                    border: isPredicted ? '1px dashed #FF5E7D' : 'none'
                }}>
                    {i}
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
