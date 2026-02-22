import React, { useMemo } from 'react'
import { useUser } from '../context/UserContext'

/**
 * WeightChart — SVG line chart showing weight over time
 * Background bands are colored by cycle phase
 */
export default function WeightChart() {
    const { weightLogs, getPhaseForDate, user } = useUser()

    // Need at least 2 data points to draw a line
    if (!weightLogs || weightLogs.length < 2) {
        return (
            <div style={{
                padding: '1.5rem',
                textAlign: 'center',
                color: 'var(--color-text-muted)',
                fontSize: '0.85rem',
                background: 'var(--color-surface)',
                borderRadius: '16px',
                border: '1px solid var(--color-border)'
            }}>
                {weightLogs?.length === 1
                    ? 'Pas je gewicht nog een keer aan om je verloop te zien.'
                    : 'Sla je gewicht op in je profiel om je verloop bij te houden.'}
            </div>
        )
    }

    // Chart config
    const width = 320
    const height = 140
    const paddingX = 40
    const paddingY = 20
    const chartW = width - paddingX * 2
    const chartH = height - paddingY * 2

    // Phase colors (matching the app palette)
    const PHASE_COLORS = {
        menstrual: '#a8647325',
        follicular: '#99f0ff30',
        ovulatory: '#f5a89c25',
        luteal: '#e2a9f125'
    }

    // Process data: last 12 weeks max
    const data = useMemo(() => {
        const sorted = [...weightLogs].sort((a, b) => a.date.localeCompare(b.date))
        return sorted.slice(-84) // Last ~12 weeks of daily entries
    }, [weightLogs])

    // Min/Max for scaling
    const weights = data.map(d => d.weight)
    const targetWeight = Number(user?.targetWeight)
    const allValues = targetWeight > 0 ? [...weights, targetWeight] : weights
    const minW = Math.min(...allValues) - 0.5
    const maxW = Math.max(...allValues) + 0.5
    const rangeW = maxW - minW || 1

    // Scale functions
    const scaleX = (i) => paddingX + (i / (data.length - 1)) * chartW
    const scaleY = (w) => paddingY + chartH - ((w - minW) / rangeW) * chartH

    // Build the line path
    const linePath = data.map((d, i) =>
        `${i === 0 ? 'M' : 'L'} ${scaleX(i).toFixed(1)} ${scaleY(d.weight).toFixed(1)}`
    ).join(' ')

    // Build phase background bands
    const phaseBands = useMemo(() => {
        if (!getPhaseForDate || data.length < 2) return []

        const bands = []
        let currentPhase = null
        let bandStart = 0

        data.forEach((d, i) => {
            const { phase } = getPhaseForDate(d.date)
            if (phase !== currentPhase) {
                if (currentPhase !== null) {
                    bands.push({
                        phase: currentPhase,
                        x1: scaleX(bandStart),
                        x2: scaleX(i),
                    })
                }
                currentPhase = phase
                bandStart = i
            }
        })
        // Close last band
        if (currentPhase !== null) {
            bands.push({
                phase: currentPhase,
                x1: scaleX(bandStart),
                x2: scaleX(data.length - 1),
            })
        }

        return bands
    }, [data, getPhaseForDate])

    const firstWeight = data[0].weight
    const lastWeight = data[data.length - 1].weight
    const diff = lastWeight - firstWeight
    const diffStr = diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)

    return (
        <div style={{
            background: '#fff',
            borderRadius: '16px',
            border: '1px solid var(--color-border)',
            padding: '1rem',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text)' }}>Gewichtsverloop</span>
                <span style={{
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    color: diff < 0 ? 'var(--color-primary)' : diff > 0 ? '#e57373' : 'var(--color-text-muted)'
                }}>
                    {diffStr} kg
                </span>
            </div>

            {/* SVG Chart */}
            <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
                {/* Phase background bands */}
                {phaseBands.map((band, i) => (
                    <rect
                        key={i}
                        x={band.x1}
                        y={paddingY}
                        width={band.x2 - band.x1}
                        height={chartH}
                        fill={PHASE_COLORS[band.phase] || 'transparent'}
                        rx="4"
                    />
                ))}

                {/* Target weight line (dashed) */}
                {targetWeight > 0 && (
                    <line
                        x1={paddingX}
                        y1={scaleY(targetWeight)}
                        x2={width - paddingX}
                        y2={scaleY(targetWeight)}
                        stroke="var(--color-primary)"
                        strokeWidth="1"
                        strokeDasharray="4,4"
                        opacity="0.5"
                    />
                )}

                {/* Weight line */}
                <path
                    d={linePath}
                    fill="none"
                    stroke="var(--color-text)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Data point dots (first and last) */}
                <circle cx={scaleX(0)} cy={scaleY(firstWeight)} r="3" fill="var(--color-text-muted)" />
                <circle cx={scaleX(data.length - 1)} cy={scaleY(lastWeight)} r="4" fill="var(--color-text)" />

                {/* Labels */}
                <text x={scaleX(0)} y={scaleY(firstWeight) - 8} textAnchor="middle" fontSize="10" fill="var(--color-text-muted)">
                    {firstWeight.toFixed(1)}
                </text>
                <text x={scaleX(data.length - 1)} y={scaleY(lastWeight) - 8} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--color-text)">
                    {lastWeight.toFixed(1)}
                </text>

                {/* Target weight label */}
                {targetWeight > 0 && (
                    <text x={width - paddingX + 4} y={scaleY(targetWeight) + 3} fontSize="9" fill="var(--color-primary)" opacity="0.7">
                        doel
                    </text>
                )}

                {/* Date labels */}
                <text x={paddingX} y={height - 2} textAnchor="start" fontSize="9" fill="var(--color-text-muted)">
                    {new Date(data[0].date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                </text>
                <text x={width - paddingX} y={height - 2} textAnchor="end" fontSize="9" fill="var(--color-text-muted)">
                    {new Date(data[data.length - 1].date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                </text>
            </svg>

            {/* Phase legend (compact) */}
            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                {[
                    { phase: 'menstrual', label: 'Menstruatie' },
                    { phase: 'follicular', label: 'Folliculair' },
                    { phase: 'ovulatory', label: 'Ovulatie' },
                    { phase: 'luteal', label: 'Luteaal' }
                ].map(p => (
                    <div key={p.phase} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '2px', background: PHASE_COLORS[p.phase]?.replace(/[0-9a-f]{2}$/, '') || '#eee' }} />
                        <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{p.label}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
