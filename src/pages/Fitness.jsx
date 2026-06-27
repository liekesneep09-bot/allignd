import React, { useState, useMemo } from 'react'
import { useUser } from '../context/UserContext'
import { useLanguage } from '../context/LanguageContext'
import { getFitnessAdvice, getFitnessContent, getBodyPartAdvice } from '../data/fitnessContent'
import { getPhaseContent } from '../data/phases'
import { IconActivity } from '../components/Icons'
import { getLocalDateStr } from '../utils/date'

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
function getWeekDays(movementLogs, language) {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const monday = new Date(now)
    monday.setDate(now.getDate() - mondayOffset)
    monday.setHours(0, 0, 0, 0)

    const days = []
    const dayLabelsNl = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']
    const dayLabelsEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const dayLabels = language === 'en' ? dayLabelsEn : dayLabelsNl

    for (let i = 0; i < 7; i++) {
        const d = new Date(monday)
        d.setDate(monday.getDate() + i)
        const dateStr = getLocalDateStr(d)
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
    const { language, t } = useLanguage()
    const [selectedBodyPart, setSelectedBodyPart] = useState(null)

    const fitnessContent = getFitnessContent(language)
    const phaseContent = getPhaseContent(language, currentPhase)
    const phaseName = phaseContent.name
    const phaseKey = currentPhase // menstrual, follicular, ovulatory, luteal

    // Week stats
    const weekWorkouts = useMemo(() => getThisWeekWorkouts(user.movementLogs || []), [user.movementLogs])
    const weekTarget = user.trainingFrequency || 3

    // Focus bullets for current goal + phase
    const focusBullets = fitnessContent.focusBullets[user.goal]?.[phaseKey] || fitnessContent.focusBullets.maintain[phaseKey]

    // Movement log for today
    const todayStr = getLocalDateStr(new Date())
    const todayLog = user.movementLogs?.find(l => l.date === todayStr)
    const todayStatus = todayLog?.status || null
    const weekDays = useMemo(() => getWeekDays(user.movementLogs || [], language), [user.movementLogs, language])

    // --- VIEW 1: OVERVIEW ---
    if (!selectedBodyPart) {

        // Intensiteit naar visuele dots (1-5)
        const intensityMap = {
            'Laag': 1, 'Low': 1,
            'Laag - Gemiddeld': 2, 'Low - Medium': 2,
            'Gemiddeld': 3, 'Medium': 3,
            'Gemiddeld - Hoog': 4, 'Medium - High': 4,
            'Hoog': 5, 'High': 5,
            'Maximaal (PR Poging)': 5, 'Maximum (PR Attempt)': 5,
            'Op gevoel': 3, 'By feel': 3
        }
        const intensityDots = intensityMap[phaseContent.training.intensity] || 3

        // Fase kleur mapping
        const phaseColorMap = {
            menstrual:  { bg: 'rgba(196,80,106,0.08)', border: 'rgba(196,80,106,0.22)', accent: '#8a2e45', dot: '#c4506a' },
            follicular: { bg: 'rgba(47,181,199,0.08)',  border: 'rgba(47,181,199,0.22)',  accent: '#1a8a96', dot: '#2fb5c7' },
            ovulatory:  { bg: 'rgba(232,120,95,0.10)', border: 'rgba(232,120,95,0.25)', accent: '#a0422e', dot: '#e8785f' },
            luteal:     { bg: 'rgba(106,159,107,0.10)', border: 'rgba(106,159,107,0.25)', accent: '#3d6e3e', dot: '#6a9f6b' },
        }
        const phaseColors = phaseColorMap[phaseKey] || phaseColorMap.luteal

        return (
            <div className="container" style={{ paddingBottom: '90px' }}>
                <header style={{ marginBottom: '1.5rem' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>{t('fitness.title')}</h1>
                </header>

                {/* FASE HIGHLIGHT HERO CARD */}
                <div style={{
                    background: phaseColors.bg,
                    border: `1px solid ${phaseColors.border}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    marginBottom: '1.5rem'
                }}>
                    {/* Header rij */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span style={{
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            color: phaseColors.accent,
                            textTransform: 'uppercase',
                            letterSpacing: '0.6px'
                        }}>
                            {t('fitness.phase_highlight_label')}
                        </span>
                        <span style={{
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: phaseColors.accent,
                            background: `${phaseColors.border}`,
                            padding: '0.2rem 0.6rem',
                            borderRadius: '100px'
                        }}>
                            {phaseName}
                        </span>
                    </div>

                    {/* Beschrijving */}
                    <p style={{
                        margin: '0 0 1rem 0',
                        fontSize: '0.95rem',
                        color: 'var(--color-text)',
                        lineHeight: 1.5,
                        fontWeight: '500'
                    }}>
                        {phaseContent.training.description}
                    </p>

                    {/* Aanbevolen beweging chips */}
                    <div style={{ marginBottom: '1rem' }}>
                        <span style={{
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            color: 'var(--color-text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            display: 'block',
                            marginBottom: '0.4rem'
                        }}>
                            {t('fitness.phase_highlight_types')}
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {phaseContent.training.types.map((type, i) => (
                                <span key={i} style={{
                                    background: 'var(--color-surface)',
                                    border: `1px solid ${phaseColors.border}`,
                                    borderRadius: '100px',
                                    padding: '0.3rem 0.7rem',
                                    fontSize: '0.78rem',
                                    color: 'var(--color-text)',
                                    fontWeight: '600'
                                }}>
                                    {type}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Intensiteitsindicator */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            color: 'var(--color-text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            flexShrink: 0
                        }}>
                            {t('fitness.phase_highlight_intensity')}
                        </span>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            {[1,2,3,4,5].map(n => (
                                <div key={n} style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    background: n <= intensityDots ? phaseColors.dot : 'var(--color-border)',
                                    transition: 'background 0.2s'
                                }} />
                            ))}
                        </div>
                        <span style={{
                            fontSize: '0.78rem',
                            fontWeight: '600',
                            color: phaseColors.accent
                        }}>
                            {phaseContent.training.intensity}
                        </span>
                    </div>
                </div>

                {/* WEEK STATUS & BEWEGING VANDAAG CONSOLIDATED */}
                <div style={{
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    marginBottom: '1.5rem',
                    border: '1px solid var(--color-border)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <IconActivity size={18} />
                            <span style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--color-text)' }}>
                                {t('fitness.this_week')}: {weekWorkouts} {t('fitness.of')} {weekTarget}
                            </span>
                        </div>
                        <span style={{
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            color: 'var(--color-primary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            background: 'rgba(255,174,185,0.15)',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '100px'
                        }}>
                            {phaseName}
                        </span>
                    </div>

                    {todayStatus ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
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
                                {todayStatus === 'moved' ? t('fitness.moved_success') : t('fitness.rest_day')}
                            </span>
                            <button
                                onClick={() => logMovement(todayStr, todayStatus === 'moved' ? 'rest' : 'moved')}
                                style={{
                                    marginLeft: 'auto',
                                    background: 'none',
                                    color: 'var(--color-primary)',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    padding: '0.25rem 0.5rem',
                                    cursor: 'pointer'
                                }}
                            >
                                {t('fitness.change')}
                            </button>
                        </div>
                    ) : (
                        <div style={{ marginBottom: '1.25rem' }}>
                            <p style={{
                                margin: '0 0 0.75rem 0',
                                fontSize: '0.95rem',
                                color: 'var(--color-text)',
                                fontWeight: '500'
                            }}>{t('fitness.did_you_move')}</p>
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
                                    {t('fitness.yes')}
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
                                    {t('fitness.no')}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* WEEK OVERZICHT DOTS */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        paddingTop: '1rem',
                        borderTop: '1px solid var(--color-border)'
                    }}>
                        {weekDays.map(day => (
                            <div key={day.dateStr} style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.4rem'
                            }}>
                                <span style={{
                                    fontSize: '0.65rem',
                                    color: day.isToday ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                    fontWeight: day.isToday ? '700' : '500',
                                    textTransform: 'uppercase'
                                }}>{day.label}</span>
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    background: day.status === 'moved'
                                        ? '#4CAF50'
                                        : day.status === 'rest'
                                            ? 'rgba(158, 158, 158, 0.3)'
                                            : 'rgba(0, 0, 0, 0.06)',
                                    border: day.isToday && !day.status ? '2px solid var(--color-primary)' : 'none',
                                    boxSizing: 'border-box'
                                }} />
                            </div>
                        ))}
                    </div>
                </div>


                {/* Body Part Selection */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                    {fitnessContent.bodyParts.map(part => (
                        <button
                            key={part.id}
                            onClick={() => { setSelectedBodyPart(part); window.scrollTo(0, 0) }}
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
                        {t('fitness.your_focus')}
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
    const exercises = fitnessContent.exercises[selectedBodyPart.id] || []
    const partAdvice = getBodyPartAdvice(user.goal, currentPhase, language)

    return (
        <div className="container" style={{ paddingBottom: '90px' }}>
            {/* Header / Back */}
            <header style={{ marginTop: '0', marginBottom: '1.5rem' }}>
                <button
                    onClick={() => { setSelectedBodyPart(null); window.scrollTo(0, 0) }}
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
                    ← {t('fitness.back_to_overview')}
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
                        }}>{t('fitness.approach_today')}</h2>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{partAdvice.label}</span>
                    </div>

                    <div className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{t('fitness.intensity')}</label>
                                <p style={{ fontWeight: 600, margin: 0 }}>{partAdvice.intensity}</p>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{t('fitness.weight')}</label>
                                <p style={{ fontWeight: 600, margin: 0 }}>{partAdvice.weight}</p>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{t('fitness.reps')}</label>
                                <p style={{ fontWeight: 600, margin: 0 }}>{partAdvice.reps}</p>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{t('fitness.sets')}</label>
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
                    }}>{t('fitness.best_exercises')}</h2>
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
                    }}>{t('fitness.your_focus')} ({fitnessContent.goals[user.goal] || user.goal})</h2>
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
