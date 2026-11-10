import React, { useState } from 'react'
import logo from '../assets/logo-primary.png'

const phases = [
    { id: 'menstrual', label: 'Menstruatie', day: 'Dag 3', short: 'Herstel' },
    { id: 'follicular', label: 'Folliculaire fase', day: 'Dag 8', short: 'Opbouw' },
    { id: 'ovulatory', label: 'Ovulatiefase', day: 'Dag 14', short: 'Energie' },
    { id: 'luteal', label: 'Luteale fase', day: 'Dag 21', short: 'Balans' }
]

const palettes = [
    {
        id: 'barbie-sorbet',
        name: 'Barbie sorbet',
        description: 'Barbie-roze, poederblauw, zachte perzik en lilac. Fris en licht, zonder een regenboogeffect.',
        recommended: true,
        colors: {
            menstrual: ['#FF5C8A', '#A93660', '255, 92, 138'],
            follicular: ['#86B7E8', '#3E678F', '134, 183, 232'],
            ovulatory: ['#F3A28E', '#945344', '243, 162, 142'],
            luteal: ['#B49ADB', '#66508F', '180, 154, 219']
        }
    },
    {
        id: 'barbie-cool',
        name: 'Barbie cool',
        description: 'Barbie-roze, koel blauw, orchidee en zacht paars. Meer serene luxe en iets minder speels.',
        colors: {
            menstrual: ['#FF5C8A', '#A93660', '255, 92, 138'],
            follicular: ['#7FB4D9', '#396789', '127, 180, 217'],
            ovulatory: ['#C58AC6', '#80457F', '197, 138, 198'],
            luteal: ['#9D92D4', '#5C4F90', '157, 146, 212']
        }
    }
]

const phaseVar = (phase, token = '') => `var(--phase-${phase}${token})`

function paletteVariables(palette) {
    return Object.fromEntries(Object.entries(palette.colors).flatMap(([id, [base, text, rgb]]) => [
        [`--phase-${id}`, base],
        [`--phase-${id}-text`, text],
        [`--phase-${id}-soft`, `rgba(${rgb}, 0.14)`],
        [`--phase-${id}-rgb`, rgb]
    ]))
}

function CycleRing({ selected }) {
    const radius = 64
    const circumference = 2 * Math.PI * radius
    const segments = [
        { id: 'menstrual', days: 5 },
        { id: 'follicular', days: 6 },
        { id: 'ovulatory', days: 5 },
        { id: 'luteal', days: 12 }
    ]
    let cursor = 0

    return (
        <svg width="156" height="156" viewBox="0 0 156 156" role="img" aria-label="Cyclusring met vier duidelijk verschillende fasekleuren">
            <circle cx="78" cy="78" r={radius} fill="none" stroke="var(--color-border-light)" strokeWidth="12" />
            {segments.map((segment) => {
                const length = (segment.days / 28) * circumference
                const offset = cursor
                cursor += length
                return (
                    <circle
                        key={segment.id}
                        cx="78"
                        cy="78"
                        r={radius}
                        fill="none"
                        stroke={phaseVar(segment.id)}
                        strokeWidth="12"
                        strokeLinecap="butt"
                        strokeDasharray={`${Math.max(0, length - 3)} ${circumference - Math.max(0, length - 3)}`}
                        strokeDashoffset={-offset}
                        transform="rotate(-90 78 78)"
                        opacity="0.96"
                    />
                )
            })}
            <text x="78" y="72" textAnchor="middle" fill={phaseVar(selected.id)} fontSize="23" fontWeight="750">{selected.day}</text>
            <text x="78" y="94" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="12">{selected.label}</text>
            <text x="78" y="113" textAnchor="middle" fill="var(--color-text-muted)" fontSize="11">van 28 dagen</text>
        </svg>
    )
}

export default function FreshPhaseColorsPreview() {
    const [paletteId, setPaletteId] = useState('barbie-sorbet')
    const [selectedId, setSelectedId] = useState('ovulatory')
    const palette = palettes.find((item) => item.id === paletteId) || palettes[0]
    const selected = phases.find((phase) => phase.id === selectedId) || phases[2]

    return (
        <main style={{
            ...paletteVariables(palette),
            height: '100dvh',
            overflowY: 'auto',
            maxWidth: '480px',
            margin: '0 auto',
            padding: '20px 16px 40px',
            background: 'var(--color-bg)',
            color: 'var(--color-text)',
            fontFamily: 'var(--font-family)'
        }}>
            <header style={{ textAlign: 'center', marginBottom: '22px' }}>
                <img src={logo} alt="Allignd" style={{ width: '132px', height: 'auto' }} />
                <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    Fasekleuren vergelijken — de app is nog ongewijzigd
                </p>
            </header>

            <section style={{ marginBottom: '22px' }}>
                <h1 style={{ fontSize: '23px', marginBottom: '7px' }}>Fasekleuren in jouw huisstijl</h1>
                <p style={{ fontSize: '14px', marginBottom: '16px' }}>
                    Barbie-roze blijft de basis. Kies welke zachte kleurfamilie daar het beste bij past en vergelijk daarna de fasen.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {palettes.map((item) => {
                        const active = item.id === paletteId
                        return (
                            <button
                                key={item.id}
                                type="button"
                                aria-pressed={active}
                                onClick={() => setPaletteId(item.id)}
                                style={{
                                    padding: '14px',
                                    borderRadius: 'var(--radius-md)',
                                    border: `2px solid ${active ? 'var(--color-primary)' : 'var(--color-border-light)'}`,
                                    background: 'var(--color-surface)',
                                    textAlign: 'left',
                                    boxShadow: active ? 'var(--shadow-sm)' : 'none'
                                }}
                            >
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                                    <strong style={{ fontSize: '15px' }}>{item.name}{item.recommended ? ' · aanbevolen' : ''}</strong>
                                    <span style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
                                        {phases.map((phase) => (
                                            <span key={phase.id} style={{ width: 18, height: 18, borderRadius: '50%', background: item.colors[phase.id][0], border: '1px solid rgba(0,0,0,0.04)' }} />
                                        ))}
                                    </span>
                                </span>
                                <span style={{ display: 'block', marginTop: '6px', fontSize: '12px', lineHeight: 1.5, color: 'var(--color-text-secondary)' }}>{item.description}</span>
                            </button>
                        )
                    })}
                </div>
            </section>

            <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                {phases.map((phase) => {
                    const active = selectedId === phase.id
                    return (
                        <button
                            key={phase.id}
                            type="button"
                            aria-pressed={active}
                            onClick={() => setSelectedId(phase.id)}
                            style={{
                                minHeight: '46px',
                                padding: '9px 10px',
                                borderRadius: 'var(--radius-md)',
                                border: `1.5px solid ${active ? phaseVar(phase.id) : 'var(--color-border)'}`,
                                background: active ? phaseVar(phase.id, '-soft') : 'var(--color-surface)',
                                color: active ? phaseVar(phase.id, '-text') : 'var(--color-text-secondary)',
                                fontWeight: active ? 700 : 500,
                                textAlign: 'left'
                            }}
                        >
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ width: 10, height: 10, borderRadius: '50%', background: phaseVar(phase.id), flexShrink: 0 }} />
                                {phase.label}
                            </span>
                        </button>
                    )
                })}
            </section>

            <section style={{ ...cardStyle, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '18px', background: `linear-gradient(145deg, ${phaseVar(selected.id, '-soft')}, #fff 70%)` }}>
                <CycleRing selected={selected} />
                <div style={{ flex: 1 }}>
                    <span style={{ display: 'inline-block', padding: '5px 10px', borderRadius: 99, background: phaseVar(selected.id, '-soft'), color: phaseVar(selected.id, '-text'), fontSize: '12px', fontWeight: 700 }}>{selected.short}</span>
                    <h2 style={{ color: phaseVar(selected.id), fontSize: '22px', margin: '12px 0 6px' }}>{selected.label}</h2>
                    <p style={{ fontSize: '13px' }}>Alle vier de fasen blijven in de ring zichtbaar. Niet alleen de fase van vandaag.</p>
                </div>
            </section>

            <section style={{ ...cardStyle, marginBottom: '14px' }}>
                <h2 style={sectionTitleStyle}>Cycluskalender</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginTop: '16px', textAlign: 'center' }}>
                    {['M', 'D', 'W', 'D', 'V', 'Z', 'Z'].map((day, index) => <span key={`label-${index}`} style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>{day}</span>)}
                    {[12, 13, 14, 15, 16, 17, 18].map((day, index) => {
                        const phase = phases[Math.min(3, Math.floor(index / 2))]
                        const active = selected.id === phase.id
                        return (
                            <span key={day} style={{
                                width: 36,
                                height: 36,
                                justifySelf: 'center',
                                display: 'grid',
                                placeItems: 'center',
                                borderRadius: '50%',
                                background: phaseVar(phase.id, '-soft'),
                                color: phaseVar(phase.id, '-text'),
                                border: active ? `2px solid ${phaseVar(phase.id)}` : '2px solid transparent',
                                fontSize: '12px',
                                fontWeight: 700
                            }}>{day}</span>
                        )
                    })}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '18px' }}>
                    {phases.map((phase) => (
                        <span key={phase.id} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                            <span style={{ width: 9, height: 9, borderRadius: '50%', background: phaseVar(phase.id), flexShrink: 0 }} />{phase.label}
                        </span>
                    ))}
                </div>
            </section>

            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '12px', lineHeight: 1.6 }}>
                Dit is alleen een ontwerppreview. Jouw app en de bestaande faseberekeningen zijn nog niet aangepast.
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
