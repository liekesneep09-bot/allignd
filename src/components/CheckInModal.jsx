import React, { useState, useEffect } from 'react'
import { useUser } from '../context/UserContext'
import { useLanguage } from '../context/LanguageContext'

const SYMPTOMS_LIST = [
    { id: 'cramps', label: 'Krampen', category: 'body' },
    { id: 'bloated', label: 'Opgeblazen', category: 'body' },
    { id: 'headache', label: 'Hoofdpijn', category: 'body' },
    { id: 'tender_breasts', label: 'Gevoelige Borsten', category: 'body' },
    { id: 'cravings', label: 'Cravings', category: 'body' },
    { id: 'fatigue', label: 'Vermoeid', category: 'body' },

    { id: 'energetic', label: 'Energiek', category: 'mood' },
    { id: 'relaxed', label: 'Ontspannen', category: 'mood' },
    { id: 'anxious', label: 'Onrustig', category: 'mood' },
    { id: 'irritable', label: 'Prikkelbaar', category: 'mood' },
    { id: 'sad', label: 'Somber', category: 'mood' }
]

export default function CheckInModal({ isOpen, onClose, dateStr }) {
    const { user, saveSymptoms } = useUser()
    const { t } = useLanguage()
    const [selected, setSelected] = useState([])
    const [isSaving, setIsSaving] = useState(false)

    // Load existing symptoms when modal opens
    useEffect(() => {
        if (isOpen) {
            const log = user?.symptomLogs?.find(l => l.date === dateStr)
            setSelected(log?.symptoms || [])
        }
    }, [isOpen, dateStr, user?.symptomLogs])

    if (!isOpen) return null

    const toggleSymptom = (id) => {
        setSelected(prev =>
            prev.includes(id)
                ? prev.filter(s => s !== id)
                : [...prev, id]
        )
    }

    const handleSave = () => {
        setIsSaving(true)
        saveSymptoms(dateStr, selected)
        setTimeout(() => {
            setIsSaving(false)
            onClose()
        }, 600)
    }

    const bodySymptoms = SYMPTOMS_LIST.filter(s => s.category === 'body')
    const moodSymptoms = SYMPTOMS_LIST.filter(s => s.category === 'mood')

    const renderChip = (item) => {
        const isSelected = selected.includes(item.id)
        return (
            <button
                key={item.id}
                onClick={() => toggleSymptom(item.id)}
                style={{
                    padding: '0.6rem 1rem',
                    borderRadius: '20px',
                    border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    backgroundColor: isSelected ? 'var(--color-bg)' : '#fff',
                    color: isSelected ? 'var(--color-primary)' : 'var(--color-text)',
                    fontSize: '0.9rem',
                    fontWeight: isSelected ? '600' : '400',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                }}
            >
                {t(`checkin.symptoms.${item.id}`)}
            </button>
        )
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-end', // slide up from bottom visually
            justifyContent: 'center', // Center on desktop
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <div style={{
                background: '#ffffff',
                width: '100%',
                maxWidth: '600px', // Prevent full width stretch on desktop
                maxHeight: '90vh',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
                padding: '1.5rem',
                overflowY: 'auto',
                boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{t('checkin.title')}</h2>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', padding: '0.5rem', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}
                    >
                        &times;
                    </button>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--color-text-muted)', marginBottom: '1rem', fontWeight: '500' }}>{t('checkin.mood')}</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {moodSymptoms.map(renderChip)}
                    </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--color-text-muted)', marginBottom: '1rem', fontWeight: '500' }}>{t('checkin.body')}</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {bodySymptoms.map(renderChip)}
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '1rem', transition: 'all 0.2s' }}
                    disabled={isSaving}
                >
                    {isSaving ? `✓ ${t('common.saved', { defaultValue: 'Opgeslagen' })}` : t('checkin.save')}
                </button>
            </div>
        </div>
    )
}

export { SYMPTOMS_LIST }
