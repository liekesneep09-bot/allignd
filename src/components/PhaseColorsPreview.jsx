import React, { useState } from 'react'
import logo from '../assets/logo-primary.png'

const phases = [
    { id: 'menstrual', label: 'Menstruatie', day: 'Dag 3' },
    { id: 'follicular', label: 'Folliculaire fase', day: 'Dag 8' },
    { id: 'ovulatory', label: 'Ovulatiefase', day: 'Dag 14' },
    { id: 'luteal', label: 'Luteale fase', day: 'Dag 21' }
]

const phaseVar = (phase, token = '') => `var(--phase-${phase}${token})`

export default function PhaseColorsPreview() {
    const [selectedId, setSelectedId] = useState('follicular')
    const selected = phases.find((phase) => phase.id === selectedId) || phases[1]
    const base = phaseVar(selected.id)
    const text = phaseVar(selected.id, '-text')
    const soft = phaseVar(selected.id, '-soft')

    return (
        <main style={{
            minHeight: '100dvh',
            maxWidth: '480px',
            margin: '0 auto',
            padding: '20px 16px 40px',
            background: 'var(--color-bg)',
            color: 'var(--color-text)',
            fontFamily: 'var(--font-family)'
        }}>
            <header style={{ textAlign: 'center', marginBottom: '20px' }}>
                <img src={logo} alt="Allignd" style={{ width: '140px', height: 'auto' }} />
                <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    Lokale kleurpreview — niet zichtbaar voor appgebruikers
                </p>
            </header>

            <section style={{ marginBottom: '20px' }}>
                <h1 style={{ fontSize: '22px', marginBottom: '6px' }}>Kleuren per fase</h1>
                <p style={{ fontSize: '14px', marginBottom: '14px' }}>
                    Kies een fase. De accenten veranderen hieronder op meerdere voorbeeldschermen.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {phases.map((phase) => {
                        const active = selectedId === phase.id
                        return (
                            <button
                                key={phase.id}
                                type="button"
                                aria-pressed={active}
                                onClick={() => setSelectedId(phase.id)}
                                style={{
                                    minHeight: '44px',
                                    padding: '9px 12px',
                                    borderRadius: 'var(--radius-md)',
                                    border: `1.5px solid ${active ? phaseVar(phase.id) : 'var(--color-border)'}`,
                                    background: active ? phaseVar(phase.id, '-soft') : 'var(--color-surface)',
                                    color: active ? phaseVar(phase.id, '-text') : 'var(--color-text-secondary)',
                                    fontWeight: active ? 700 : 500,
                                    textAlign: 'left'
                                }}
                            >
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: phaseVar(phase.id) }} />
                                    {phase.label}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </section>

            <section style={{
                borderRadius: 'var(--radius-lg)',
                padding: '18px',
                marginBottom: '12px',
                background: `linear-gradient(180deg, ${soft}, #fff 85%)`,
                border: `1px solid ${phaseVar(selected.id, '-soft')}`
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: text, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                        Vandaag · {selected.day}
                    </span>
                    <span style={{ padding: '4px 9px', borderRadius: 99, background: soft, color: text, fontSize: '12px', fontWeight: 700 }}>
                        {selected.label}
                    </span>
                </div>
                <h2 style={{ color: text, fontSize: '26px', marginBottom: '6px' }}>Jouw dag, afgestemd op jou</h2>
                <p style={{ fontSize: '14px' }}>Rustige roze tinten houden de huisstijl gelijk, terwijl de faseaccenten nog herkenbaar zijn.</p>
                <button style={{ marginTop: '14px', padding: '10px 14px', borderRadius: 'var(--radius-full)', background: base, color: '#fff', fontWeight: 700 }}>
                    Menstruatie loggen
                </button>
            </section>

            <section style={{ ...cardStyle, marginBottom: '12px' }}>
                <h2 style={sectionTitleStyle}>Cycluskalender</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginTop: '14px', textAlign: 'center' }}>
                    {['M', 'D', 'W', 'D', 'V', 'Z', 'Z'].map((day, i) => <span key={`label-${i}`} style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>{day}</span>)}
                    {[12, 13, 14, 15, 16, 17, 18].map((day, i) => {
                        const phase = phases[Math.min(3, Math.floor(i / 2))]
                        const period = i < 2
                        return (
                            <span key={day} style={{
                                width: 34,
                                height: 34,
                                justifySelf: 'center',
                                display: 'grid',
                                placeItems: 'center',
                                borderRadius: '50%',
                                background: period ? 'var(--color-primary)' : phaseVar(phase.id, '-soft'),
                                color: period ? '#333' : phaseVar(phase.id, '-text'),
                                border: i === 4 ? `2px solid ${phaseVar(selected.id)}` : '2px solid transparent',
                                fontSize: '12px',
                                fontWeight: 700
                            }}>{day}</span>
                        )
                    })}
                </div>
                <p style={{ fontSize: '12px', marginTop: '12px' }}>Fasekleuren geven cyclusfasen aan; de agenda toont geen vruchtbare dagen.</p>
            </section>

            <section style={{ ...cardStyle, marginBottom: '12px', borderLeft: `4px solid ${base}` }}>
                <h2 style={sectionTitleStyle}>Fitness · focus deze fase</h2>
                <p style={{ fontSize: '14px', marginTop: '8px' }}>Beweging die past bij je doelen en hoe je je vandaag voelt.</p>
                <div style={{ height: 7, background: 'var(--color-border-light)', borderRadius: 99, marginTop: '14px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '68%', background: base, borderRadius: 99 }} />
                </div>
            </section>

            <section style={{ ...cardStyle, marginBottom: '12px' }}>
                <h2 style={sectionTitleStyle}>Voeding · fase-inspiratie</h2>
                <div style={{ marginTop: '12px', padding: '12px', borderRadius: 'var(--radius-md)', background: soft }}>
                    <strong style={{ color: text }}>Idee voor vandaag</strong>
                    <p style={{ fontSize: '13px', marginTop: '4px' }}>Een rustige accentkleur, zonder de andere schermen een heel andere uitstraling te geven.</p>
                </div>
            </section>

            <section style={{ ...cardStyle, marginBottom: '12px' }}>
                <h2 style={sectionTitleStyle}>Community</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                    <span style={{ padding: '4px 9px', borderRadius: 99, background: soft, color: text, fontSize: '12px', fontWeight: 700 }}>{selected.label}</span>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>optionele fasetag bij een bericht</span>
                </div>
            </section>

            <section style={{ ...cardStyle, marginBottom: '20px' }}>
                <h2 style={sectionTitleStyle}>Voortgang</h2>
                <svg viewBox="0 0 320 64" width="100%" height="64" style={{ marginTop: '12px' }} aria-label="Voorbeeld van een fasegekleurde voortgangslijn">
                    <path d="M4 50 C 60 40, 88 46, 130 25 S 210 34, 260 14 S 290 20, 316 8" fill="none" stroke={base} strokeWidth="4" strokeLinecap="round" />
                    {[4, 130, 260, 316].map((x, i) => <circle key={x} cx={x} cy={[50, 25, 14, 8][i]} r="5" fill={base} stroke="#fff" strokeWidth="2" />)}
                </svg>
                <span style={{ fontSize: '12px', color: text }}>Accentkleur voor de geselecteerde fase</span>
            </section>

            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '12px' }}>
                Alleen een visueel voorbeeld — bestaande fasebenamingen en berekeningen zijn niet aangepast.
            </p>
        </main>
    )
}

const cardStyle = {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border-light)',
    borderRadius: 'var(--radius-lg)',
    padding: '16px',
    boxShadow: 'var(--shadow-sm)'
}

const sectionTitleStyle = {
    margin: 0,
    fontSize: '16px',
    color: 'var(--color-text)',
    fontWeight: 700
}
