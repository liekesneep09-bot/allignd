import React, { useState } from 'react'
import { useUser } from '../context/UserContext'
import { useLanguage } from '../context/LanguageContext'

const IconFootprints = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 16v-2.382c0-1.052-.2-2.095-.59-3.054l-1.12-2.8A1.999 1.999 0 0 1 4 6.118V4" />
        <path d="M10 16v-2.382c0-1.052.2-2.095.59-3.054l1.12-2.8A1.999 1.999 0 0 0 10 6.118V4" />
        <path d="M14 16v-2.382c0-1.052.2-2.095.59-3.054l1.12-2.8A1.999 1.999 0 0 1 14 6.118V4" />
        <path d="M20 16v-2.382c0-1.052-.2-2.095-.59-3.054l-1.12-2.8A1.999 1.999 0 0 0 20 6.118V4" />
    </svg>
)

export default function StepTracker({ date }) {
    const { user, logSteps } = useUser()
    const { t } = useLanguage()
    const [isEditing, setIsEditing] = useState(false)
    const [tempSteps, setTempSteps] = useState('')

    const stepLog = user?.stepLogs?.find(l => l.date === date)
    const steps = stepLog?.steps || 0

    const weight = user.weight ? Number(user.weight) : 70
    const kcalPerStep = weight * 0.0006
    const burnedKcal = Math.round(steps * kcalPerStep)

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
                        background: 'rgba(78, 205, 196, 0.1)'
                    }}>
                        <IconFootprints size={16} color="var(--color-movement)" />
                    </div>
                    <h2 style={{ fontSize: 'var(--font-size-base)', margin: 0, fontWeight: '600' }}>{t('steps.title')}</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{ 
                        fontSize: 'var(--font-size-xs)', 
                        background: 'rgba(78, 205, 196, 0.1)', 
                        color: 'var(--color-movement)', 
                        padding: 'var(--space-1) var(--space-2)', 
                        borderRadius: 'var(--radius-full)',
                        fontWeight: '600'
                    }}>
                        {burnedKcal} kcal
                    </div>
                    <div 
                        onClick={() => {
                            setTempSteps(steps)
                            setIsEditing(true)
                        }}
                        style={{ 
                            fontSize: 'var(--font-size-base)', 
                            fontWeight: '700', 
                            color: 'var(--color-text)',
                            cursor: 'pointer'
                        }}
                    >
                        {steps.toLocaleString()} <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)', fontWeight: '400' }}>/ 10k</span>
                    </div>
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
                    background: 'linear-gradient(90deg, var(--color-movement), #3DB8B0)',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width var(--transition-slow)'
                }} />
            </div>

            {isEditing ? (
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <input
                        type="number"
                        value={tempSteps}
                        onChange={(e) => setTempSteps(e.target.value)}
                        placeholder={t('steps.input_placeholder')}
                        autoFocus
                        style={{
                            flex: 1,
                            padding: 'var(--space-3)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-border)',
                            fontSize: 'var(--font-size-sm)'
                        }}
                    />
                    <button
                        onClick={handleSaveManual}
                        className="btn btn-primary"
                        style={{ width: 'auto', padding: '0 var(--space-5)', borderRadius: 'var(--radius-md)' }}
                    >
                        {t('steps.save')}
                    </button>
                </div>
            ) : (
                <>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button
                            onClick={() => handleLog(1000)}
                            className="chip"
                            style={{ flex: 1, padding: 'var(--space-3) var(--space-2)', fontSize: 'var(--font-size-sm)' }}
                        >
                            {t('steps.add_1000')}
                        </button>
                        <button
                            onClick={() => handleLog(2500)}
                            className="chip"
                            style={{ flex: 1, padding: 'var(--space-3) var(--space-2)', fontSize: 'var(--font-size-sm)' }}
                        >
                            + 2.500
                        </button>
                        <button
                            onClick={() => handleLog(5000)}
                            className="chip"
                            style={{ flex: 1, padding: 'var(--space-3) var(--space-2)', fontSize: 'var(--font-size-sm)' }}
                        >
                            + 5.000
                        </button>
                    </div>

                    <div style={{ marginTop: 'var(--space-3)', textAlign: 'center' }}>
                        <button
                            onClick={() => setIsEditing(true)}
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
                            {t('steps.manual_entry')}
                        </button>
                    </div>
                </>
            )}
        </section>
    )
}
