import React, { useState } from 'react'
import { useUser } from '../context/UserContext'

export default function WaterTracker({ date }) {
    const { user, logWater } = useUser()

    // Find today's water amount
    const waterLog = user?.waterLogs?.find(l => l.date === date)
    const amountMl = waterLog?.amount_ml || 0

    // Format to Liters (e.g. 1.5L)
    const amountLiters = (amountMl / 1000).toFixed(1)

    // Daily goal
    const goalMl = 2500
    const progressPercent = Math.min(100, Math.max(0, (amountMl / goalMl) * 100))

    const handleAdd = (amount) => {
        logWater(date, amount)
    }

    return (
        <section className="card" style={{ marginBottom: '1.25rem', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Water</h2>
                <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--color-primary)' }}>
                    {amountLiters}L <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: '400' }}>/ 2.5L</span>
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
                    backgroundColor: 'var(--color-primary)',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease-in-out'
                }} />
            </div>

            {/* Quick Add Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                    onClick={() => handleAdd(250)}
                    className="chip"
                    style={{ flex: 1, padding: '0.6rem 0.2rem', fontSize: '0.85rem' }}
                >
                    + Glas (250)
                </button>
                <button
                    onClick={() => handleAdd(500)}
                    className="chip"
                    style={{ flex: 1, padding: '0.6rem 0.2rem', fontSize: '0.85rem' }}
                >
                    + Fles (500)
                </button>
                <button
                    onClick={() => handleAdd(1000)}
                    className="chip"
                    style={{ flex: 1, padding: '0.6rem 0.2rem', fontSize: '0.85rem' }}
                >
                    + Bidon (1L)
                </button>
            </div>
            {amountMl > 0 && (
                <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                    <button
                        onClick={() => handleAdd(-250)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-text-muted)',
                            fontSize: '0.82rem',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            padding: '0.2rem'
                        }}
                    >
                        Herstellen (-250ml)
                    </button>
                </div>
            )}
        </section>
    )
}
