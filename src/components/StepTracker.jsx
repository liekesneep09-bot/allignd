import React, { useState, useEffect } from 'react'
import { useUser } from '../context/UserContext'

export default function StepTracker({ date }) {
    const { user, logSteps } = useUser()
    const [isEditing, setIsEditing] = useState(false)
    const [tempSteps, setTempSteps] = useState('')

    // Find today's steps
    const stepLog = user?.stepLogs?.find(l => l.date === date)
    const steps = stepLog?.steps || 0

    // Calorie calculation
    const weight = user.weight ? Number(user.weight) : 70
    const kcalPerStep = weight * 0.0006
    const burnedKcal = Math.round(steps * kcalPerStep)

    // Daily goal
    const goalSteps = 10000
    const progressPercent = Math.min(100, Math.max(0, (steps / goalSteps) * 100))

    const handleLog = (val) => {
        const newTotal = Math.max(0, steps + val)
        logSteps(date, newTotal)
    }

    const handleSaveManual = () => {
        const val = parseInt(tempSteps)
        if (!isNaN(val)) {
            logSteps(date, val)
        }
        setIsEditing(false)
        setTempSteps('')
    }

    return (
        <section className="card" style={{ marginBottom: '1.25rem', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Stappen</h2>
                    <div style={{ 
                        fontSize: '0.75rem', 
                        background: 'rgba(56, 178, 172, 0.1)', 
                        color: 'var(--color-movement)', 
                        padding: '2px 8px', 
                        borderRadius: '10px',
                        fontWeight: '600'
                    }}>
                        🔥 {burnedKcal} kcal
                    </div>
                </div>
                <div 
                    onClick={() => {
                        setTempSteps(steps)
                        setIsEditing(true)
                    }}
                    style={{ 
                        fontSize: '1rem', 
                        fontWeight: '600', 
                        color: 'var(--color-movement)',
                        cursor: 'pointer'
                    }}
                >
                    {steps.toLocaleString()} <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: '400' }}>/ 10k</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'var(--color-border)',
                borderRadius: '4px',
                marginBottom: '1rem',
                overflow: 'hidden'
            }}>
                <div style={{
                    height: '100%',
                    width: `${progressPercent}%`,
                    backgroundColor: 'var(--color-movement)',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease-in-out'
                }} />
            </div>

            {isEditing ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                        type="number"
                        value={tempSteps}
                        onChange={(e) => setTempSteps(e.target.value)}
                        placeholder="Aantal stappen..."
                        autoFocus
                        style={{
                            flex: 1,
                            padding: '10px',
                            borderRadius: '12px',
                            border: '1px solid var(--color-border)',
                            fontSize: '0.9rem'
                        }}
                    />
                    <button
                        onClick={handleSaveManual}
                        className="btn btn-primary"
                        style={{ width: 'auto', padding: '0 20px', borderRadius: '12px' }}
                    >
                        Opslaan
                    </button>
                </div>
            ) : (
                <>
                    {/* Quick Add Buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button
                            onClick={() => handleLog(1000)}
                            className="chip"
                            style={{ flex: 1, padding: '0.6rem 0.2rem', fontSize: '0.85rem' }}
                        >
                            + 1.000
                        </button>
                        <button
                            onClick={() => handleLog(2500)}
                            className="chip"
                            style={{ flex: 1, padding: '0.6rem 0.2rem', fontSize: '0.85rem' }}
                        >
                            + 2.500
                        </button>
                        <button
                            onClick={() => handleLog(5000)}
                            className="chip"
                            style={{ flex: 1, padding: '0.6rem 0.2rem', fontSize: '0.85rem' }}
                        >
                            + 5.000
                        </button>
                    </div>

                    <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                        <button
                            onClick={() => setIsEditing(true)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--color-text-muted)',
                                fontSize: '0.85rem',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                                padding: '0.2rem'
                            }}
                        >
                            Handmatig invoeren
                        </button>
                    </div>
                </>
            )}
        </section>
    )
}
