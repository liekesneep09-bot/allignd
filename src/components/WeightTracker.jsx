import React, { useState } from 'react'
import { useUser } from '../context/UserContext'

export default function WeightTracker({ date }) {
    const { user, logWeight, currentPhase } = useUser()
    const [isEditing, setIsEditing] = useState(false)
    const [tempWeight, setTempWeight] = useState('')

    // Today's weight
    const weightLog = user?.weightLogs?.find(l => l.date === date)
    const currentWeight = weightLog?.weight || user.weight || 0

    // Cycle-Aware Insights
    const getInsight = (phase) => {
        switch (phase) {
            case 'menstrual':
                return "Vocht verdwijnt langzaam. Je gewicht stabiliseert nu weer. ✨"
            case 'follicular':
                return "Dit is je meest stabiele fase. Je gewicht is nu het meest representatief. 💪"
            case 'ovulatory':
                return "Rond de eisprong kun je soms een kleine schommeling zien. Helemaal normaal! 🌸"
            case 'luteal':
                return "Heel normaal om 1-2kg 'aan te komen' door vocht. Geen zorgen, dit is tijdelijk! 🧘‍♀️"
            default:
                return "Luister naar je lichaam, ongeacht het getal op de schaal. 🌸"
        }
    }

    const handleSaveManual = () => {
        const val = parseFloat(tempWeight)
        if (!isNaN(val) && val > 0) {
            logWeight(date, val)
        }
        setIsEditing(false)
        setTempWeight('')
    }

    const trend = (() => {
        if (!user.weightLogs || user.weightLogs.length < 2) return null
        const sorted = [...user.weightLogs].sort((a,b) => b.date.localeCompare(a.date))
        const latest = sorted[0].weight
        const previous = sorted[1].weight
        const diff = (latest - previous).toFixed(1)
        return { diff: Number(diff), label: diff > 0 ? `+${diff}kg` : `${diff}kg` }
    })()

    return (
        <section className="card" style={{ marginBottom: '1.25rem', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Gewicht</h2>
                    {trend && (
                        <div style={{ 
                            fontSize: '0.75rem', 
                            background: trend.diff > 0 ? 'rgba(255, 174, 185, 0.1)' : 'rgba(165, 220, 201, 0.2)', 
                            color: trend.diff > 0 ? '#ff8a9a' : '#2D3436', 
                            padding: '2px 8px', 
                            borderRadius: '10px',
                            fontWeight: '600'
                        }}>
                            {trend.label} vs vorig moment
                        </div>
                    )}
                </div>
                <div 
                    onClick={() => {
                        setTempWeight(currentWeight)
                        setIsEditing(true)
                    }}
                    style={{ 
                        fontSize: '1rem', 
                        fontWeight: '600', 
                        color: 'var(--color-primary)',
                        cursor: 'pointer'
                    }}
                >
                    {currentWeight} <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: '400' }}>kg</span>
                </div>
            </div>

            {/* Insight Text */}
            <div style={{
                background: 'var(--color-bg)',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                fontSize: '0.85rem',
                lineHeight: '1.4',
                marginBottom: '1rem',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)'
            }}>
                <span style={{ fontWeight: '600', color: 'var(--color-primary)', marginRight: '4px' }}>Inzicht:</span>
                {getInsight(currentPhase)}
            </div>

            {isEditing ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                        type="number"
                        step="0.1"
                        value={tempWeight}
                        onChange={(e) => setTempWeight(e.target.value)}
                        placeholder="65.0"
                        autoFocus
                        style={{
                            flex: 1,
                            padding: '10px',
                            borderRadius: '12px',
                            border: '1px solid var(--color-border)',
                            fontSize: '0.9rem'
                        }}
                    />
                    <button
                        onClick={handleSaveManual}
                        className="btn btn-primary"
                        style={{ width: 'auto', padding: '0 20px', borderRadius: '12px' }}
                    >
                        Opslaan
                    </button>
                </div>
            ) : (
                <div style={{ textAlign: 'center' }}>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="chip"
                        style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem' }}
                    >
                        Nieuw weegmoment loggen
                    </button>
                </div>
            )}
        </section>
    )
}
