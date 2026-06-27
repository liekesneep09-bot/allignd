import { useState } from 'react'
import { useUser } from '../context/UserContext'
import { useLanguage } from '../context/LanguageContext'

// Circular progress ring — self-contained so no dependency on Today.jsx
function Ring({ value, max, size = 100, stroke = 8, color, label, sublabel }) {
    const r = (size - stroke) / 2
    const circ = 2 * Math.PI * r
    const pct = Math.min(1, Math.max(0, value / (max || 1)))
    const offset = circ - pct * circ

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div style={{ position: 'relative', width: size, height: size }}>
                <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                    {/* Track */}
                    <circle
                        cx={size / 2} cy={size / 2} r={r}
                        fill="none"
                        stroke="rgba(0,0,0,0.06)"
                        strokeWidth={stroke}
                    />
                    {/* Progress */}
                    <circle
                        cx={size / 2} cy={size / 2} r={r}
                        fill="none"
                        stroke={color}
                        strokeWidth={stroke}
                        strokeLinecap="round"
                        strokeDasharray={`${circ} ${circ}`}
                        strokeDashoffset={offset}
                        style={{ transition: 'stroke-dashoffset 0.5s cubic-bezier(0.4,0,0.2,1)' }}
                    />
                </svg>
                {/* Centre text */}
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: '1px'
                }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#333333', lineHeight: 1 }}>{label}</span>
                    <span style={{ fontSize: '0.55rem', color: 'var(--color-text-muted)', fontWeight: '500' }}>{sublabel}</span>
                </div>
            </div>
        </div>
    )
}

// Reusable bottom sheet
function Sheet({ title, onClose, children }) {
    return (
        <div
            style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.4)',
                zIndex: 9999,
                display: 'flex', flexDirection: 'column',
                justifyContent: 'flex-end', alignItems: 'center',
                animation: 'fadeIn 0.2s ease-out'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: '#fff',
                    width: '100%', maxWidth: '480px',
                    borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
                    padding: '1.5rem',
                    paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
                    boxShadow: '0 -4px 24px rgba(0,0,0,0.1)',
                    animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1)'
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ width: '40px', height: '4px', background: 'var(--color-border)', borderRadius: '2px', margin: '0 auto 1.25rem' }} />
                <h3 style={{ margin: '0 0 1.5rem', textAlign: 'center', fontSize: '1.15rem', fontWeight: '700' }}>{title}</h3>
                {children}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function HabitsCard({ date }) {
    const { user, logWater, logSteps } = useUser()
    const { t, language } = useLanguage()

    const [sheet, setSheet] = useState(null) // 'water' | 'steps' | null

    // ── Water ────────────────────────────────────────────────────────────────
    const waterLog = user?.waterLogs?.find(l => l.date === date)
    const amountMl = waterLog?.amount_ml || 0
    const WATER_GOAL = 2500

    const [tempWater, setTempWater] = useState('')
    const waterLiters = (amountMl / 1000).toFixed(1)

    const handleAddWater = (ml) => logWater(date, ml)
    const handleSaveWater = () => {
        const v = parseInt(String(tempWater).replace(',', '.'))
        if (!isNaN(v) && v > 0) logWater(date, v) // Additive
        
        if (document.activeElement && document.activeElement.blur) {
            document.activeElement.blur()
        }
        setTimeout(() => setSheet(null), 50)
        setTempWater('')
    }

    // ── Steps ────────────────────────────────────────────────────────────────
    const stepLog = user?.stepLogs?.find(l => l.date === date)
    const steps = stepLog?.steps || 0
    const STEP_GOAL = 10000

    const weight = user.weight ? Number(user.weight) : 70
    const burnedKcal = Math.round(steps * weight * 0.0006)

    const [tempSteps, setTempSteps] = useState('')

    const handleAddSteps = (n) => logSteps(date, steps + n)
    const handleSaveSteps = () => {
        const v = parseInt(tempSteps)
        if (!isNaN(v) && v > 0) logSteps(date, steps + v) // Additive
        
        if (document.activeElement && document.activeElement.blur) {
            document.activeElement.blur()
        }
        setTimeout(() => setSheet(null), 50)
        setTempSteps('')
    }

    // ── Open sheet helpers ───────────────────────────────────────────────────
    const openWater = () => {
        setTempWater('')
        setSheet('water')
    }
    const openSteps = () => {
        setTempSteps('')
        setSheet('steps')
    }

    // ── Formatted labels ─────────────────────────────────────────────────────
    const stepsLabel = steps >= 1000
        ? `${(steps / 1000).toFixed(1)}k`
        : String(steps)

    return (
        <>
            <section className="card" style={{ padding: '1.25rem' }}>

                {/* Header */}
                <div style={{ marginBottom: '1.25rem' }}>
                    <h2 style={{ fontSize: '1.1rem', margin: '0 0 2px 0' }}>{t('habits.title')}</h2>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        {t('habits.subtitle')}
                    </div>
                </div>

                {/* Two rings side by side */}
                <div style={{ display: 'flex', position: 'relative', marginBottom: '1.5rem' }}>

                    {/* Water ring */}
                    <button
                        onClick={openWater}
                        style={{ flex: 1, background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
                    >
                        <Ring
                            value={amountMl}
                            max={WATER_GOAL}
                            color="#89C4F4"
                            label={`${waterLiters}L`}
                            sublabel={`/ ${(WATER_GOAL / 1000).toFixed(1)}L`}
                        />
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text)' }}>{t('habits.water')}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                                {Math.round((amountMl / WATER_GOAL) * 100)}% {t('habits.of_goal')}
                            </div>
                        </div>
                    </button>

                    {/* Divider */}
                    <div style={{ position: 'absolute', left: '50%', top: '8px', transform: 'translateX(-50%)', width: '1px', height: '84px', background: 'var(--color-border)' }} />

                    {/* Steps ring */}
                    <button
                        onClick={openSteps}
                        style={{ flex: 1, background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
                    >
                        <Ring
                            value={steps}
                            max={STEP_GOAL}
                            color="#F5D98B"
                            label={stepsLabel}
                            sublabel="/ 10k"
                        />
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text)' }}>{t('habits.steps')}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                                {burnedKcal > 0 ? `≈ ${burnedKcal} ${t('habits.kcal_burned')}` : `0% ${t('habits.of_goal')}`}
                            </div>
                        </div>
                    </button>
                </div>

                {/* Quick action buttons */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={openWater}
                        style={{
                            flex: 1,
                            padding: '0.85rem',
                            borderRadius: '16px',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            background: 'var(--color-primary)',
                            color: '#333333',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(255, 174, 185, 0.2)'
                        }}
                    >
                        + {t('habits.water')}
                    </button>
                    <button
                        onClick={openSteps}
                        style={{
                            flex: 1,
                            padding: '0.85rem',
                            borderRadius: '16px',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            background: 'var(--color-primary)',
                            color: '#333333',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(255, 174, 185, 0.2)'
                        }}
                    >
                        + {t('habits.steps')}
                    </button>
                </div>
            </section>

            {/* ── Water Bottom Sheet ─────────────────────────────────────────── */}
            {sheet === 'water' && (
                <Sheet title={t('habits.water_title')} onClose={() => setSheet(null)}>

                    {/* Big current number */}
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#89C4F4', lineHeight: 1 }}>
                            {waterLiters} <span style={{ fontSize: '1.2rem', fontWeight: '500', color: 'var(--color-text-muted)' }}>L</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                            {t('habits.of_goal')} {(WATER_GOAL / 1000).toFixed(1)} L
                        </div>
                    </div>

                    {/* Quick adds */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem', marginBottom: '1.25rem' }}>
                        {[
                            { label: t('habits.glass'), sub: '250 ml', ml: 250 },
                            { label: t('habits.bottle'), sub: '500 ml', ml: 500 },
                            { label: t('habits.shaker'), sub: '1 L', ml: 1000 },
                        ].map(opt => (
                            <button
                                key={opt.ml}
                                onClick={() => { handleAddWater(opt.ml); setSheet(null) }}
                                style={{
                                    padding: '0.9rem 0.5rem',
                                    borderRadius: '16px',
                                    border: '1.5px solid #89C4F420',
                                    background: '#89C4F410',
                                    cursor: 'pointer',
                                    textAlign: 'center'
                                }}
                            >
                                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#89C4F4' }}>+ {opt.label}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{opt.sub}</div>
                            </button>
                        ))}
                    </div>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{t('habits.exact_amount')}</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
                    </div>

                    {/* Manual exact input */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <input
                            type="number"
                            inputMode="numeric"
                            value={tempWater}
                            onChange={e => setTempWater(e.target.value)}
                            placeholder="+0"
                            style={{
                                flex: 1,
                                padding: '14px 16px',
                                borderRadius: '14px',
                                border: '2px solid #89C4F4',
                                fontSize: '1.15rem',
                                fontWeight: '700',
                                textAlign: 'center',
                                outline: 'none',
                                color: 'var(--color-text)'
                            }}
                        />
                        <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>ml</span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            onClick={() => setSheet(null)}
                            style={{ flex: 1, padding: '1rem', borderRadius: '16px', border: 'none', background: 'var(--color-bg)', fontWeight: '600', fontSize: '1rem', cursor: 'pointer' }}
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleSaveWater}
                            className="btn btn-primary"
                            style={{ flex: 2, padding: '1rem', borderRadius: '16px', fontWeight: '600', fontSize: '1rem', background: '#89C4F4' }}
                        >
                            {t('common.save')}
                        </button>
                    </div>

                    {/* Undo */}
                    {amountMl > 0 && (
                        <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
                            <button
                                onClick={() => { 
                                    logWater(date, -amountMl) // adds negative total = resets to 0
                                    setSheet(null) 
                                }}
                                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '0.82rem', textDecoration: 'underline', cursor: 'pointer' }}
                            >
                                {t('habits.reset_water')}
                            </button>
                        </div>
                    )}
                </Sheet>
            )}

            {/* ── Steps Bottom Sheet ─────────────────────────────────────────── */}
            {sheet === 'steps' && (
                <Sheet title={t('habits.steps_title')} onClose={() => setSheet(null)}>

                    {/* Big current number */}
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#F5D98B', lineHeight: 1 }}>
                            {steps.toLocaleString(language === 'en' ? 'en-US' : 'nl-NL')}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                            {t('habits.of_goal')} {STEP_GOAL.toLocaleString(language === 'en' ? 'en-US' : 'nl-NL')} {t('habits.steps_goal')}
                            {burnedKcal > 0 && ` · ≈ ${burnedKcal} kcal`}
                        </div>
                    </div>

                    {/* Quick adds */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem', marginBottom: '1.25rem' }}>
                        {[
                            { label: '+1.000', n: 1000 },
                            { label: '+2.500', n: 2500 },
                            { label: '+5.000', n: 5000 },
                        ].map(opt => (
                            <button
                                key={opt.n}
                                onClick={() => { handleAddSteps(opt.n); setSheet(null) }}
                                style={{
                                    padding: '0.9rem 0.5rem',
                                    borderRadius: '16px',
                                    border: '1.5px solid rgba(245,217,139,0.5)',
                                    background: 'rgba(245,217,139,0.18)',
                                    cursor: 'pointer',
                                    textAlign: 'center'
                                }}
                            >
                                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#F5D98B' }}>{opt.label}</div>
                            </button>
                        ))}
                    </div>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{t('habits.exact_steps')}</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
                    </div>

                    {/* Manual exact input */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <input
                            type="number"
                            inputMode="numeric"
                            value={tempSteps}
                            onChange={e => setTempSteps(e.target.value)}
                            placeholder="+0"
                            style={{
                                flex: 1,
                                padding: '14px 16px',
                                borderRadius: '14px',
                                border: '2px solid #F5D98B',
                                fontSize: '1.15rem',
                                fontWeight: '700',
                                textAlign: 'center',
                                outline: 'none',
                                color: 'var(--color-text)'
                            }}
                        />
                        <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>{t('habits.steps').toLowerCase()}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            onClick={() => setSheet(null)}
                            style={{ flex: 1, padding: '1rem', borderRadius: '16px', border: 'none', background: 'var(--color-bg)', fontWeight: '600', fontSize: '1rem', cursor: 'pointer' }}
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleSaveSteps}
                            className="btn btn-primary"
                            style={{ flex: 2, padding: '1rem', borderRadius: '16px', fontWeight: '600', fontSize: '1rem', background: '#F5D98B', color: '#333' }}
                        >
                            {t('common.save')}
                        </button>
                    </div>

                    {/* Reset */}
                    {steps > 0 && (
                        <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
                            <button
                                onClick={() => { 
                                    logSteps(date, 0)
                                    setSheet(null) 
                                }}
                                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '0.82rem', textDecoration: 'underline', cursor: 'pointer' }}
                            >
                                {t('habits.reset_steps')}
                            </button>
                        </div>
                    )}
                </Sheet>
            )}
        </>
    )
}
