import React, { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useUser } from '../context/UserContext'
import { useLanguage } from '../context/LanguageContext'

// Every option a user can log. The id is what gets stored, so never rename an id.
// `hidden` options are no longer offered but stay here so older logs still show a label.
const SYMPTOMS_LIST = [
    // Stemming
    { id: 'happy', label: 'Blij', category: 'mood' },
    { id: 'relaxed', label: 'Ontspannen', category: 'mood' },
    { id: 'motivated', label: 'Gemotiveerd', category: 'mood' },
    { id: 'anxious', label: 'Onrustig', category: 'mood' },
    { id: 'irritable', label: 'Prikkelbaar', category: 'mood' },
    { id: 'sad', label: 'Somber', category: 'mood' },
    { id: 'stressed', label: 'Gestrest', category: 'mood' },
    { id: 'emotional', label: 'Emotioneel', category: 'mood' },
    // Energie
    { id: 'energetic', label: 'Energiek', category: 'energy' },
    { id: 'energy_normal', label: 'Normaal', category: 'energy' },
    { id: 'fatigue', label: 'Vermoeid', category: 'energy' },
    { id: 'exhausted', label: 'Uitgeput', category: 'energy' },
    // Lichaam
    { id: 'cramps', label: 'Krampen', category: 'body' },
    { id: 'headache', label: 'Hoofdpijn', category: 'body' },
    { id: 'bloated', label: 'Opgeblazen', category: 'body' },
    { id: 'tender_breasts', label: 'Gevoelige borsten', category: 'body' },
    { id: 'back_pain', label: 'Rugpijn', category: 'body' },
    { id: 'muscle_soreness', label: 'Spierpijn', category: 'body' },
    { id: 'skin', label: 'Puistjes', category: 'body' },
    { id: 'water_retention', label: 'Vocht vasthouden', category: 'body' },
    // Eetlust
    { id: 'cravings_sweet', label: 'Trek in zoet', category: 'appetite' },
    { id: 'cravings_salty', label: 'Trek in zout', category: 'appetite' },
    { id: 'hungry', label: 'Meer honger', category: 'appetite' },
    { id: 'low_appetite', label: 'Weinig trek', category: 'appetite' },
    { id: 'cravings', label: 'Cravings', category: 'appetite', hidden: true },
    // Slaap
    { id: 'slept_well', label: 'Goed geslapen', category: 'sleep' },
    { id: 'slept_badly', label: 'Slecht geslapen', category: 'sleep' },
    { id: 'insomnia', label: 'Moeilijk inslapen', category: 'sleep' },
    // Training
    { id: 'workout_strong', label: 'Sterk', category: 'training' },
    { id: 'workout_heavy', label: 'Zwaar', category: 'training' },
    { id: 'rest_day', label: 'Rustdag', category: 'training' },
    { id: 'workout_skipped', label: 'Overgeslagen', category: 'training' },
    // Spijsvertering
    { id: 'constipation', label: 'Obstipatie', category: 'digestion' },
    { id: 'diarrhea', label: 'Diarree', category: 'digestion' },
    { id: 'nausea', label: 'Misselijk', category: 'digestion' }
]

// Groups in display order, each with a soft tile color
const GROUPS = [
    { id: 'mood', tint: '#FDEBF0' },
    { id: 'energy', tint: '#FFF3DA' },
    { id: 'body', tint: '#EEF0FA' },
    { id: 'appetite', tint: '#FCEDE4' },
    { id: 'sleep', tint: '#EFEDF9' },
    { id: 'training', tint: '#E7F4EC' },
    { id: 'digestion', tint: '#F0F1EA' }
]

// Simple stroke icons (24×24), same line style as components/Icons.jsx
const CIRCLE = 'M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18z'
const MOON = 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z'
const DROP = 'M12 3C9 7 7 10 7 13a5 5 0 0 0 10 0c0-3-2-6-5-10z'
const BATTERY = 'M3 8h15v8H3z M20 11v2'
const ICONS = {
    happy: `${CIRCLE} M8.5 14s1.3 2 3.5 2 3.5-2 3.5-2 M9 9.5h.01 M15 9.5h.01`,
    relaxed: `${CIRCLE} M8 10c.6.6 1.4.6 2 0 M14 10c.6.6 1.4.6 2 0 M9 15c1.7 1.2 4.3 1.2 6 0`,
    motivated: 'M7 17L17 7 M9 7h8v8',
    anxious: `${CIRCLE} M9 10h.01 M15 10h.01 M8 15.5c1-1 2-1 2.7 0s1.9 1 2.6 0 1.9-1 2.7 0`,
    irritable: `${CIRCLE} M8 9l2.5 1 M16 9l-2.5 1 M9 16c1.7-1.2 4.3-1.2 6 0`,
    sad: `${CIRCLE} M9 10h.01 M15 10h.01 M9 16.5c1.7-1.2 4.3-1.2 6 0`,
    stressed: 'M13 2L4 14h7l-1 8 9-12h-7z',
    emotional: DROP,
    energetic: 'M12 8a4 4 0 1 0 0 8a4 4 0 0 0 0-8z M12 2v2 M12 20v2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M2 12h2 M20 12h2 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4',
    energy_normal: `${BATTERY} M5 10h6v4H5z`,
    fatigue: `${BATTERY} M5 10h2v4H5z`,
    exhausted: `${MOON} M15 4h3l-3 3h3`,
    cramps: 'M4 12h3l2-4 3 8 2-4h6',
    headache: `${CIRCLE} M13 7l-3 5h4l-3 5`,
    bloated: 'M12 3a7 7 0 1 0 0 14a7 7 0 0 0 0-14z M12 17v4',
    tender_breasts: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
    back_pain: 'M12 3v18 M9 6h6 M9 10h6 M9 14h6 M9 18h6',
    muscle_soreness: 'M6 8v8 M18 8v8 M3 10v4 M21 10v4 M6 12h12',
    skin: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z',
    water_retention: `${DROP} M10 14h4`,
    cravings_sweet: 'M6 11h12l-1.5 9h-9z M7 11a5 5 0 0 1 10 0 M12 4v2',
    cravings_salty: 'M4 19L12 5l8 14z M10 15h.01 M14 14h.01 M12 17h.01',
    hungry: `${CIRCLE} M12 9a3 3 0 1 0 0 6a3 3 0 0 0 0-6z`,
    low_appetite: 'M3 11h18c0 5-4 8-9 8s-9-3-9-8z',
    cravings: 'M6 11h12l-1.5 9h-9z M7 11a5 5 0 0 1 10 0 M12 4v2',
    slept_well: `${MOON} M17 3v4 M15 5h4`,
    slept_badly: `${MOON} M15 3l4 4 M19 3l-4 4`,
    insomnia: 'M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z M12 9a3 3 0 1 0 0 6a3 3 0 0 0 0-6z',
    workout_strong: 'M3 17l6-6 4 4 8-8 M15 7h6v6',
    workout_heavy: 'M8 8a4 4 0 0 1 8 0 M6 10h12l-1 10H7z',
    rest_day: 'M9 5v14 M15 5v14',
    workout_skipped: `${CIRCLE} M9 9l6 6 M15 9l-6 6`,
    constipation: `${CIRCLE} M8 12h8`,
    diarrhea: 'M3 9c2-2 4-2 6 0s4 2 6 0 4-2 6 0 M3 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0',
    nausea: `${CIRCLE} M9 10h.01 M15 10h.01 M8 15c1.3-.8 2.7.8 4 0s2.7-.8 4 0`
}

function OptionIcon({ id }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333333" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={ICONS[id] || CIRCLE} />
        </svg>
    )
}

export default function CheckInModal({ isOpen, onClose, dateStr }) {
    const { user, saveSymptoms } = useUser()
    const { t, language } = useLanguage()
    const [selected, setSelected] = useState([])
    const [query, setQuery] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [saveError, setSaveError] = useState(null)

    // Load existing symptoms when the window opens
    useEffect(() => {
        if (isOpen) {
            const log = user?.symptomLogs?.find(l => l.date === dateStr)
            setSelected(log?.symptoms || [])
            setQuery('')
            setSaveError(null)
        }
    }, [isOpen, dateStr, user?.symptomLogs])

    const labelFor = (id) => t(`checkin.symptoms.${id}`, { defaultValue: SYMPTOMS_LIST.find(s => s.id === id)?.label || id })

    const visibleGroups = useMemo(() => {
        const q = query.trim().toLocaleLowerCase()
        return GROUPS.map(group => ({
            ...group,
            items: SYMPTOMS_LIST.filter(s => s.category === group.id && !s.hidden)
                .filter(s => !q || labelFor(s.id).toLocaleLowerCase().includes(q))
        })).filter(group => group.items.length > 0)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, language])

    if (!isOpen) return null

    const toggleSymptom = (id) => {
        setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
    }

    const handleSave = async () => {
        setIsSaving(true)
        setSaveError(null)
        try {
            await saveSymptoms(dateStr, selected)
            onClose()
        } catch {
            setSaveError(t('checkin.save_error'))
        } finally {
            setIsSaving(false)
        }
    }

    const dateLabel = dateStr
        ? new Date(`${dateStr}T12:00:00`).toLocaleDateString(language === 'nl' ? 'nl-NL' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })
        : ''
    const visibleSelectedCount = selected.filter(id => SYMPTOMS_LIST.some(s => s.id === id && !s.hidden)).length

    return createPortal(
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.45)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                animation: 'fadeIn 0.2s ease-out'
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="checkin-title"
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: 'relative',
                    background: '#ffffff',
                    width: '100%',
                    maxWidth: '600px',
                    maxHeight: 'min(90dvh, calc(100dvh - env(safe-area-inset-top, 0px) - 8px))',
                    borderTopLeftRadius: '28px',
                    borderTopRightRadius: '28px',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
                }}
            >
                {/* Header */}
                <div style={{ padding: '0.6rem 1.25rem 0', flexShrink: 0 }}>
                    <div style={{ width: '40px', height: '5px', borderRadius: '3px', background: 'var(--color-border)', margin: '0 auto 0.75rem' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                        <div>
                            <h2 id="checkin-title" style={{ fontSize: '1.3rem', margin: 0, color: '#333333', fontWeight: '800', letterSpacing: '-0.01em' }}>
                                {t('checkin.title_question', { defaultValue: 'Hoe voel je je?' })}
                            </h2>
                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: '2px', textTransform: 'capitalize' }}>
                                {dateLabel}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label={t('common.close')}
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: 'var(--radius-full)',
                                border: 'none',
                                background: 'var(--color-bg)',
                                color: '#333333',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                        </button>
                    </div>

                    {/* Search */}
                    <label style={{
                        marginTop: '1rem',
                        height: '44px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-bg)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0 0.9rem',
                        color: 'var(--color-text-muted)'
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
                        <input
                            id="checkin-search"
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t('checkin.search_placeholder', { defaultValue: 'Zoek, bijvoorbeeld hoofdpijn' })}
                            aria-label={t('checkin.search_placeholder', { defaultValue: 'Zoek, bijvoorbeeld hoofdpijn' })}
                            style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: '1rem', color: '#333333' }}
                        />
                    </label>
                </div>

                {/* Groups of icon tiles */}
                <div style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    overscrollBehavior: 'contain',
                    padding: '1.25rem 1.25rem 6rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem'
                }}>
                    {visibleGroups.length === 0 && (
                        <p style={{ margin: 0, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                            {t('checkin.no_results', { defaultValue: 'Niets gevonden. Probeer een ander woord.' })}
                        </p>
                    )}
                    {visibleGroups.map(group => (
                        <section key={group.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <h3 style={{ margin: 0, fontSize: 'var(--font-size-sm)', fontWeight: '700', color: '#333333' }}>
                                {t(`checkin.groups.${group.id}`)}
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '0.9rem 0.5rem' }}>
                                {group.items.map(item => {
                                    const isSelected = selected.includes(item.id)
                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => toggleSymptom(item.id)}
                                            aria-pressed={isSelected}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                padding: 0,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontFamily: 'inherit',
                                                fontSize: 'var(--font-size-xs)',
                                                lineHeight: 1.25,
                                                textAlign: 'center',
                                                color: '#333333',
                                                fontWeight: isSelected ? '700' : '500'
                                            }}
                                        >
                                            <span style={{
                                                position: 'relative',
                                                width: '56px',
                                                height: '56px',
                                                borderRadius: 'var(--radius-full)',
                                                background: group.tint,
                                                boxShadow: isSelected ? 'inset 0 0 0 2.5px var(--color-primary)' : 'none',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'box-shadow 0.15s ease'
                                            }}>
                                                <OptionIcon id={item.id} />
                                                {isSelected && (
                                                    <span style={{
                                                        position: 'absolute',
                                                        right: '-2px',
                                                        bottom: '-2px',
                                                        width: '20px',
                                                        height: '20px',
                                                        borderRadius: 'var(--radius-full)',
                                                        background: 'var(--color-primary)',
                                                        border: '2px solid #ffffff',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
                                                    </span>
                                                )}
                                            </span>
                                            {labelFor(item.id)}
                                        </button>
                                    )
                                })}
                            </div>
                        </section>
                    ))}
                </div>

                {/* Floating save button */}
                <div style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: '1.5rem 1.25rem max(1rem, env(safe-area-inset-bottom, 0px))',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, #ffffff 45%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    pointerEvents: 'none',
                    borderBottomLeftRadius: 0
                }}>
                    {saveError && <div role="alert" style={{ color: 'var(--color-error)', fontSize: '0.85rem', pointerEvents: 'auto' }}>{saveError}</div>}
                    <button
                        type="button"
                        onClick={() => void handleSave()}
                        disabled={isSaving}
                        style={{
                            pointerEvents: 'auto',
                            minHeight: '48px',
                            padding: '0 1.75rem',
                            borderRadius: 'var(--radius-full)',
                            border: 'none',
                            background: 'var(--color-primary)',
                            color: '#ffffff',
                            fontFamily: 'inherit',
                            fontSize: 'var(--font-size-base)',
                            fontWeight: '700',
                            cursor: isSaving ? 'default' : 'pointer',
                            boxShadow: '0 6px 18px rgba(255, 143, 163, 0.45)',
                            opacity: isSaving ? 0.8 : 1
                        }}
                    >
                        {isSaving
                            ? t('common.saving', { defaultValue: 'Opslaan…' })
                            : visibleSelectedCount > 0
                                ? `${t('checkin.save')} · ${visibleSelectedCount}`
                                : t('checkin.save')}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}

export { SYMPTOMS_LIST, GROUPS as SYMPTOM_GROUPS, OptionIcon as SymptomIcon }
