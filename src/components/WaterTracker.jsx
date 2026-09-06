import React from 'react'
import { useUser } from '../context/UserContext'
import { useLanguage } from '../context/LanguageContext'

const IconDroplet = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
)

export default function WaterTracker({ date }) {
    const { user, logWater } = useUser()
    const { t } = useLanguage()

    const waterLog = user?.waterLogs?.find(l => l.date === date)
    const amountMl = waterLog?.amount_ml || 0
    const amountLiters = (amountMl / 1000).toFixed(1)

    const goalMl = 2500
    const progressPercent = Math.min(100, Math.max(0, (amountMl / goalMl) * 100))

    const handleAdd = (amount) => {
        logWater(date, amount)
    }

    return (
        <section className="card" style={{ padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-primary-light)'
                    }}>
                        <IconDroplet size={16} color="var(--color-primary)" />
                    </div>
                    <h2 style={{ fontSize: 'var(--font-size-base)', margin: 0, fontWeight: '600' }}>Water</h2>
                </div>
                <div style={{ fontSize: 'var(--font-size-base)', fontWeight: '700', color: 'var(--color-text)' }}>
                    {amountLiters}L <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)', fontWeight: '400' }}>/ 2.5L</span>
                </div>
            </div>

            <div style={{
                width: '100%',
                height: '6px',
                backgroundColor: 'var(--color-border-light)',
                borderRadius: 'var(--radius-full)',
                marginBottom: 'var(--space-4)',
                overflow: 'hidden'
            }}>
                <div style={{
                    height: '100%',
                    width: `${progressPercent}%`,
                    background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-hover))',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width var(--transition-slow)'
                }} />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button
                    onClick={() => handleAdd(250)}
                    className="chip"
                    style={{ flex: 1, padding: 'var(--space-3) var(--space-2)', fontSize: 'var(--font-size-sm)' }}
                >
                    {t('water.glass')}
                </button>
                <button
                    onClick={() => handleAdd(500)}
                    className="chip"
                    style={{ flex: 1, padding: 'var(--space-3) var(--space-2)', fontSize: 'var(--font-size-sm)' }}
                >
                    {t('water.bottle')}
                </button>
                <button
                    onClick={() => handleAdd(1000)}
                    className="chip"
                    style={{ flex: 1, padding: 'var(--space-3) var(--space-2)', fontSize: 'var(--font-size-sm)' }}
                >
                    {t('water.bidon')}
                </button>
            </div>
            
            {amountMl > 0 && (
                <div style={{ marginTop: 'var(--space-3)', textAlign: 'center' }}>
                    <button
                        onClick={() => handleAdd(-250)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-text-tertiary)',
                            fontSize: 'var(--font-size-xs)',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            padding: 'var(--space-1)'
                        }}
                    >
                        {t('water.restore')} (-250ml)
                    </button>
                </div>
            )}
        </section>
    )
}
