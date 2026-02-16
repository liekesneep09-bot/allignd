import React, { useState, useMemo } from 'react'
import { useUser } from '../context/UserContext'
import { getFitnessAdvice, BODY_PARTS, getBodyPartExercises, getBodyPartAdvice } from '../data/fitness'
import { PHASE_CONTENT } from '../data/phases'
import { IconActivity } from '../components/Icons'
import { getLocalDateStr } from '../utils/date'
import { calculateProgress } from '../utils/numbers'

// Focus bullets based on goal + phase (all start with verb, max 6-7 words)
const FOCUS_BULLETS = {
    loss: {
        menstrual: [
            'Beweeg zacht om spanning los te laten',
            'Gun jezelf rust zonder schuldgevoel',
            'Luister naar je lichaam vandaag'
        ],
        follicular: [
            'Bouw langzaam op in intensiteit',
            'Geniet van sneller herstel',
            'Kies beweging die energie geeft'
        ],
        ovulatory: [
            'Benut je hogere energieniveau',
            'Verkort rustpauzes als het past',
            'Train iets intensiever als je wilt'
        ],
        luteal: [
            'Houd vast aan je routine',
            'Beweeg tegen opgezet gevoel',
            'Accepteer schommelingen in kracht'
        ]
    },
    recomp: {
        menstrual: [
            'Neem rust voor herstel en groei',
            'Houd je soepel met lichte beweging',
            'Sla zware sets vandaag over'
        ],
        follicular: [
            'Verhoog geleidelijk de intensiteit',
            'Benut je betere herstelvermogen',
            'Focus op opbouw en techniek'
        ],
        ovulatory: [
            'Train op je sterkste moment',
            'Pak compounds en zwaardere sets',
            'Daag jezelf uit met goede vorm'
        ],
        luteal: [
            'Onderhoud wat je hebt opgebouwd',
            'Verfijn je techniek deze fase',
            'Eet voldoende voor herstel'
        ]
    },
    gain: {
        menstrual: [
            'Neem rust voor spiergroei',
            'Beweeg licht of neem rustdag',
            'Eet voldoende voor herstel'
        ],
        follicular: [
            'Verhoog gewicht en intensiteit',
            'Benut optimaal spierherstel',
            'Focus op compound-oefeningen'
        ],
        ovulatory: [
            'Pak je zwaarste sets nu',
            'Benut je piek in kracht',
            'Train met perfecte techniek'
        ],
        luteal: [
            'Verlaag volume, verhoog kwaliteit',
            'Werk aan techniek en vorm',
            'Luister naar vermoeidheidssignalen'
        ]
    },
    maintain: {
        menstrual: [
            'Beweeg zacht of neem rust',
            'Laat verplichtingen los vandaag',
            'Volg wat je lichaam vraagt'
        ],
        follicular: [
            'Geniet van terugkerende energie',
            'Probeer variatie in trainingsvormen',
            'Kies beweging die je leuk vindt'
        ],
        ovulatory: [
            'Gebruik energie op jouw manier',
            'Probeer sociale of actieve workouts',
            'Laat plezier voorop staan'
        ],
        luteal: [
            'Houd routine zonder druk',
            'Kies steady-state beweging',
            'Accepteer wisselende energieniveaus'
        ]
    }
}

// Helper to get this week's logged workouts
function getThisWeekWorkouts(movementLogs) {
    if (!movementLogs || !Array.isArray(movementLogs) || movementLogs.length === 0) return 0

    const now = new Date()
    const dayOfWeek = now.getDay() // 0 = Sunday
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const monday = new Date(now)
    monday.setDate(now.getDate() - mondayOffset)
    monday.setHours(0, 0, 0, 0)

    const mondayStr = monday.toISOString().split('T')[0]

    return movementLogs.filter(log =>
        log.status === 'moved' && log.date >= mondayStr
    ).length
}

// Helper to get this week's days (Mon-Sun) with movement status
function getWeekDays(movementLogs) {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const monday = new Date(now)
    monday.setDate(now.getDate() - mondayOffset)
    monday.setHours(0, 0, 0, 0)

    const days = []
    const dayLabels = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday)
        d.setDate(monday.getDate() + i)
        const dateStr = d.toISOString().split('T')[0]
        const log = movementLogs?.find(l => l.date === dateStr)
        days.push({
            label: dayLabels[i],
            dateStr,
            status: log?.status || null, // 'moved', 'rest', or null
            isToday: dateStr === getLocalDateStr(new Date())
        })
    }
    return days
}

export default function Fitness() {
    const { user, currentPhase, logMovement } = useUser()
    const [selectedBodyPart, setSelectedBodyPart] = useState(null)

    // Goal Labels
    const goalLabels = {
        loss: 'Afvallen',
        recomp: 'Afvallen + Spier',
        maintain: 'Gewicht Behouden',
        gain: 'Spiermassa Opbouwen'
    }

    const phaseContent = PHASE_CONTENT[currentPhase]
    const phaseName = phaseContent.name
    const phaseKey = currentPhase // menstrual, follicular, ovulatory, luteal

    // Week stats
    const weekWorkouts = useMemo(() => getThisWeekWorkouts(user.movementLogs || []), [user.movementLogs])
    const weekTarget = user.trainingFrequency || 3

    // Focus bullets for current goal + phase
    const focusBullets = FOCUS_BULLETS[user.goal]?.[phaseKey] || FOCUS_BULLETS.maintain[phaseKey]

    // Movement log for today
    const todayStr = getLocalDateStr(new Date())
    const todayLog = user.movementLogs?.find(l => l.date === todayStr)
    const todayStatus = todayLog?.status || null
    const weekDays = useMemo(() => getWeekDays(user.movementLogs || []), [user.movementLogs])

    // --- VIEW 1: OVERVIEW ---
    if (!selectedBodyPart) {
        return (
            <div className="container" style={{ paddingBottom: '90px' }}>

                {/* WEEK STATUS BLOCK */}
                <div style={{
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    marginBottom: '1.5rem',
                    border: '1px solid var(--color-border)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <IconActivity size={18} />
                            <span style={{ fontWeight: '600', fontSize: '1rem' }}>
                                Deze week: {weekWorkouts} van {weekTarget}
                            </span>
                        </div>
                        <span style={{
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: 'var(--color-primary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            {phaseName}
                        </span>
                    </div>
                    <p style={{
                        margin: 0,
                        fontSize: '0.9rem',
                        color: 'var(--color-text-muted)',
                        lineHeight: 1.4
                    }}>
                        {phaseContent.training.why}
                    </p>
                </div>

                {/* BEWEGING VANDAAG */}
                <div style={{
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    marginBottom: '1.5rem',
                    border: '1px solid var(--color-border)'
                }}>
                    <h2 style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        marginBottom: '0.75rem',
                        color: 'var(--color-text)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        margin: '0 0 0.75rem 0'
                    }}>Beweging Vandaag</h2>

                    {todayStatus ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: todayStatus === 'moved'
                                    ? 'rgba(76, 175, 80, 0.15)'
                                    : 'rgba(158, 158, 158, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.1rem'
                            }}>
                                {todayStatus === 'moved' ? '✓' : '—'}
                            </div>
                            <span style={{
                                fontSize: '0.95rem',
                                color: 'var(--color-text)',
                                fontWeight: '500'
                            }}>
                                {todayStatus === 'moved' ? 'Je hebt vandaag bewogen 💪' : 'Rustdag — ook goed!'}
                            </span>
                            <button
                                onClick={() => logMovement(todayStr, todayStatus === 'moved' ? 'rest' : 'moved')}
                                style={{
                                    marginLeft: 'auto',
                                    background: 'none',
                                    color: 'var(--color-primary)',
                                    fontSize: '0.8rem',
                                    fontWeight: '500',
                                    padding: '0.25rem 0.5rem'
                                }}
                            >
                                Wijzig
                            </button>
                        </div>
                    ) : (
                        <div>
                            <p style={{
                                margin: '0 0 0.75rem 0',
                                fontSize: '0.9rem',
                                color: 'var(--color-text-muted)',
                                lineHeight: 1.4
                            }}>Heb je vandaag bewogen?</p>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    onClick={() => logMovement(todayStr, 'moved')}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: '2px solid rgba(76, 175, 80, 0.3)',
                                        background: 'rgba(76, 175, 80, 0.08)',
                                        color: '#4CAF50',
                                        fontWeight: '600',
                                        fontSize: '0.95rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s'
                                    }}
                                >
                                    Ja ✓
                                </button>
                                <button
                                    onClick={() => logMovement(todayStr, 'rest')}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: '2px solid rgba(158, 158, 158, 0.3)',
                                        background: 'rgba(158, 158, 158, 0.08)',
                                        color: '#9E9E9E',
                                        fontWeight: '600',
                                        fontSize: '0.95rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s'
                                    }}
                                >
                                    Nee
                                </button>
                            </div>
                        </div>
                    )}

                    {/* WEEK OVERZICHT DOTS */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '1rem',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid var(--color-border)'
                    }}>
                        {weekDays.map(day => (
                            <div key={day.dateStr} style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.3rem'
                            }}>
                                <span style={{
                                    fontSize: '0.65rem',
                                    color: day.isToday ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                    fontWeight: day.isToday ? '700' : '400',
                                    textTransform: 'uppercase'
                                }}>{day.label}</span>
                                <div style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    background: day.status === 'moved'
                                        ? '#4CAF50'
                                        : day.status === 'rest'
                                            ? 'rgba(158, 158, 158, 0.3)'
                                            : 'rgba(0, 0, 0, 0.06)',
                                    border: day.isToday ? '2px solid var(--color-primary)' : 'none',
                                    boxSizing: 'border-box'
                                }} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* PAGE TITLE */}
                <header style={{ marginBottom: '1rem' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Fitness</h1>
                </header>

                {/* Body Part Selection */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                    {BODY_PARTS.map(part => (
                        <button
                            key={part.id}
                            onClick={() => setSelectedBodyPart(part)}
                            className="card"
                            style={{
                                margin: 0,
                                textAlign: 'left',
                                padding: '1.25rem',
                                transition: 'transform 0.1s',
                                cursor: 'pointer'
                            }}
                        >
                            <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text)' }}>
                                {part.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* JOUW FOCUS DEZE FASE */}
                <section>
                    <h2 style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        marginBottom: '0.75rem',
                        color: 'var(--color-text)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        Jouw focus deze fase
                    </h2>
                    <div style={{
                        background: 'var(--color-surface)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem',
                        border: '1px solid var(--color-border)'
                    }}>
                        <ul style={{
                            margin: 0,
                            paddingLeft: '1.25rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem'
                        }}>
                            {focusBullets.map((bullet, idx) => (
                                <li key={idx} style={{
                                    fontSize: '0.9rem',
                                    color: 'var(--color-text)',
                                    lineHeight: 1.4
                                }}>
                                    {bullet}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

            </div>
        )
    }

    // --- VIEW 2: BODY PART DETAIL ---
    const exercises = getBodyPartExercises(selectedBodyPart.id)
    const partAdvice = getBodyPartAdvice(user.goal, currentPhase)

    return (
        <div className="container" style={{ paddingBottom: '90px' }}>
            {/* Header / Back */}
            <header style={{ marginTop: '0', marginBottom: '1.5rem' }}>
                <button
                    onClick={() => setSelectedBodyPart(null)}
                    style={{
                        background: 'none',
                        color: 'var(--color-text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '0.9rem',
                        padding: 0,
                        marginBottom: '1rem'
                    }}
                >
                    ← Terug naar overzicht
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700', margin: 0 }}>
                        {selectedBodyPart.label}
                    </h1>
                    <span style={{
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontWeight: '600',
                        color: 'var(--color-primary)'
                    }}>{phaseName}</span>
                </div>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* 1. SECTION: AANPAK VANDAAG */}
                <section>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                        <h2 style={{
                            fontSize: '1rem',
                            fontWeight: '600',
                            margin: 0,
                            color: 'var(--color-text)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>Aanpak Vandaag</h2>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{partAdvice.label}</span>
                    </div>

                    <div className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Intensiteit</label>
                                <p style={{ fontWeight: 600, margin: 0 }}>{partAdvice.intensity}</p>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Gewicht</label>
                                <p style={{ fontWeight: 600, margin: 0 }}>{partAdvice.weight}</p>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Reps</label>
                                <p style={{ fontWeight: 600, margin: 0 }}>{partAdvice.reps}</p>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Sets</label>
                                <p style={{ fontWeight: 600, margin: 0 }}>{partAdvice.sets}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. SECTION: BASISOEFENINGEN */}
                <section>
                    <h2 style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        marginBottom: '0.75rem',
                        color: 'var(--color-text)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>Beste Basisoefeningen</h2>
                    <div className="card">
                        <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                            {exercises.map((ex, idx) => (
                                <li key={idx} style={{ marginBottom: '0.5rem', fontSize: '1rem', color: 'var(--color-text)' }}>
                                    {ex}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* 3. SECTION: FOCUS DEZE FASE */}
                <section>
                    <h2 style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        marginBottom: '0.75rem',
                        color: 'var(--color-text)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>Jouw focus ({goalLabels[user.goal] || user.goal})</h2>
                    <div style={{
                        background: 'var(--color-surface)',
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)'
                    }}>
                        <ul style={{
                            margin: 0,
                            paddingLeft: '1.25rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem'
                        }}>
                            {focusBullets.map((bullet, idx) => (
                                <li key={idx} style={{
                                    fontSize: '0.9rem',
                                    color: 'var(--color-text)',
                                    lineHeight: 1.4
                                }}>
                                    {bullet}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

            </div>
        </div>
    )
}
