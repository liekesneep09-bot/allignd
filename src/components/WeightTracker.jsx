import React, { useState } from 'react'
import { useUser } from '../context/UserContext'
import { getLocalDateStr } from '../utils/date'

export default function WeightTracker({ date }) {
    const { user, logWeight, currentPhase, getPhaseForDate } = useUser()
    const [isEditing, setIsEditing] = useState(false)
    const [tempWeight, setTempWeight] = useState('')

    // Today's weight
    const weightLog = user?.weightLogs?.find(l => l.date === date)
    const currentWeight = weightLog?.weight || user.weight || 0

    // Cycle Phase Colors (from CSS variables)
    const PHASE_COLORS = {
        menstrual: '#a86473',
        follicular: '#5bc4d4',
        ovulatory: '#f5a89c',
        luteal: '#a3b899'
    }

    // Cycle-Aware Insights (Clean, no emojis)
    const getInsight = (phase) => {
        switch (phase) {
            case 'menstrual':
                return "Vocht verdwijnt langzaam. Je gewicht stabiliseert nu weer."
            case 'follicular':
                return "Dit is je meest stabiele fase. Je gewicht is nu het meest representatief."
            case 'ovulatory':
                return "Rond de eisprong kun je soms een kleine schommeling zien. Dit is volkomen normaal."
            case 'luteal':
                return "Het is heel gebruikelijk om 1-2kg 'aan te komen' door vochtretentie in deze fase. Geen zorgen, dit is tijdelijk."
            default:
                return "Luister naar je lichaam en focus op hoe je je voelt, ongeacht het getal op de schaal."
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

    // Weekly Average Calculation (Last 7 days vs previous 7 days)
    const trends = (() => {
        if (!user.weightLogs || user.weightLogs.length < 2) return null
        
        const sorted = [...user.weightLogs].sort((a,b) => b.date.localeCompare(a.date))
        const today = new Date()
        const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        const fourteenDaysAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)

        const last7DaysLogs = sorted.filter(l => new Date(l.date) >= sevenDaysAgo)
        const prev7DaysLogs = sorted.filter(l => {
            const d = new Date(l.date)
            return d < sevenDaysAgo && d >= fourteenDaysAgo
        })

        if (last7DaysLogs.length === 0) return null

        const avgNow = last7DaysLogs.reduce((acc, curr) => acc + curr.weight, 0) / last7DaysLogs.length
        const avgPrev = prev7DaysLogs.length > 0 
            ? prev7DaysLogs.reduce((acc, curr) => acc + curr.weight, 0) / prev7DaysLogs.length 
            : null

        const diff = avgPrev ? (avgNow - avgPrev).toFixed(1) : null

        return { 
            avgNow: avgNow.toFixed(1), 
            diff: diff ? Number(diff) : null,
            label: diff ? (diff > 0 ? `+${diff}kg` : `${diff}kg`) : 'Eerste gemiddelde'
        }
    })()

    // SVG Sparkline Logic (Last 30 days)
    const sparklineData = (() => {
        if (!user.weightLogs || user.weightLogs.length < 2) return null
        
        // Use last 30 days of data
        const sorted = [...user.weightLogs]
            .sort((a,b) => a.date.localeCompare(b.date))
            .slice(-30)
        
        if (sorted.length < 2) return null

        const weights = sorted.map(l => l.weight)
        const min = Math.min(...weights) - 0.5
        const max = Math.max(...weights) + 0.5
        const range = max - min

        const width = 100
        const height = 40
        
        const points = sorted.map((l, i) => {
            const x = (i / (sorted.length - 1)) * width
            const y = height * 0.8 - ((l.weight - min) / (max - min || 1)) * (height * 0.6)
            return `${x},${y}`
        }).join(' ')

        // Phase bar data (discrete blocks below the graph)
        const phaseBlocks = sorted.map((l, i) => {
            const phase = getPhaseForDate(l.date)
            return {
                x: (i / sorted.length) * 100,
                width: (1 / sorted.length) * 100,
                color: PHASE_COLORS[phase] || 'var(--color-border)'
            }
        })

        return { points, phaseBlocks }
    })()

    return (
        <section className="card" style={{ marginBottom: '1.25rem', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.1rem', margin: '0 0 0.25rem 0' }}>Gewicht</h2>
                    {trends && (
                        <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                            Wekelijks gem. <span style={{ fontWeight: '700', color: 'var(--color-text)' }}>{trends.avgNow} kg</span> 
                            {trends.diff !== null && (
                                <span style={{ 
                                    color: trends.diff > 0 ? '#ff8a9a' : 'var(--color-movement)', 
                                    marginLeft: '6px',
                                    fontWeight: '600'
                                }}>
                                    ({trends.label})
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <div 
                    onClick={() => {
                        setTempWeight(currentWeight)
                        setIsEditing(true)
                    }}
                    style={{ 
                        textAlign: 'right',
                        cursor: 'pointer'
                    }}
                >
                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                        {currentWeight} <span style={{ fontSize: '0.85rem', fontWeight: '400' }}>kg</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Vandaag</div>
                </div>
            </div>

            {/* Sparkline & Phase Bar Visualization */}
            {sparklineData && (
                <div style={{ margin: '1rem 0', position: 'relative' }}>
                    <svg width="100%" height="50" viewBox="0 0 100 50" preserveAspectRatio="none" style={{ display: 'block' }}>
                        {/* Phase Bar (Background blocks) */}
                        {sparklineData.phaseBlocks.map((block, idx) => (
                            <rect
                                key={idx}
                                x={block.x}
                                y="44"
                                width={block.width}
                                height="4"
                                fill={block.color}
                                rx="2"
                            />
                        ))}
                        
                        {/* Trend Line */}
                        <polyline
                            fill="none"
                            stroke="rgba(255, 174, 185, 0.4)"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={sparklineData.points}
                        />
                    </svg>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        <span>30 dagen geleden</span>
                        <span>Nu</span>
                    </div>
                </div>
            )}

            {/* Insight Text (Clean) */}
            <div style={{
                background: 'var(--color-bg)',
                padding: '1rem',
                borderRadius: '16px',
                fontSize: '0.85rem',
                lineHeight: '1.5',
                marginBottom: '1rem',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: PHASE_COLORS[currentPhase] }} />
                    <span style={{ fontWeight: '700', color: 'var(--color-text)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Cyclus Inzicht
                    </span>
                </div>
                {getInsight(currentPhase)}
            </div>

            {isEditing ? (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <input
                            type="number"
                            step="0.1"
                            value={tempWeight}
                            onChange={(e) => setTempWeight(e.target.value)}
                            placeholder="65.0"
                            autoFocus
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '12px',
                                border: '2px solid var(--color-primary)',
                                fontSize: '1rem',
                                fontWeight: '600'
                            }}
                        />
                        <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>kg</span>
                    </div>
                    <button
                        onClick={handleSaveManual}
                        className="btn btn-primary"
                        style={{ width: 'auto', padding: '0 20px', borderRadius: '12px', height: '48px' }}
                    >
                        Opslaan
                    </button>
                    <button
                        onClick={() => setIsEditing(false)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}
                    >
                        Annuleer
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setIsEditing(true)}
                    className="chip"
                    style={{ 
                        width: '100%', 
                        padding: '1rem', 
                        fontSize: '0.9rem', 
                        borderRadius: '16px',
                        backgroundColor: 'rgba(255, 174, 185, 0.1)',
                        border: '1px solid rgba(255, 174, 185, 0.2)',
                        fontWeight: '700'
                    }}
                >
                    Log nieuw weegmoment
                </button>
            )}
        </section>
    )
}
