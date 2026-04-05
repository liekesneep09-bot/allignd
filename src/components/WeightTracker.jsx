import React, { useState, useRef, useMemo } from 'react'
import { useUser } from '../context/UserContext'
import { getLocalDateStr } from '../utils/date'

export default function WeightTracker({ date }) {
    const { user, logWeight, currentPhase, getPhaseForDate } = useUser()
    const [showSheet, setShowSheet] = useState(false)
    const [tempWeight, setTempWeight] = useState('')
    
    // Scrubbing state
    const svgRef = useRef(null)
    const [scrubIndex, setScrubIndex] = useState(null)

    // Today's weight
    const weightLog = user?.weightLogs?.find(l => l.date === date)
    const currentWeight = weightLog?.weight || user.weight || 0

    // Cycle Phase Colors
    const PHASE_COLORS = {
        menstrual: '#a86473',
        follicular: '#5bc4d4',
        ovulatory: '#f5a89c',
        luteal: '#a3b899'
    }

    // Phase transparent backgrounds for the chart (8% opacity)
    const PHASE_BGS = {
        menstrual: 'rgba(168, 100, 115, 0.08)',
        follicular: 'rgba(91, 196, 212, 0.08)',
        ovulatory: 'rgba(245, 168, 156, 0.08)',
        luteal: 'rgba(163, 184, 153, 0.08)'
    }

    const getInsight = (phase) => {
        switch (phase) {
            case 'menstrual':
                return "Vocht verdwijnt langzaam. Je gewicht stabiliseert nu weer."
            case 'follicular':
                return "Dit is je meest stabiele fase. Je gewicht is nu het meest representatief."
            case 'ovulatory':
                return "Rond de eisprong kun je soms een kleine schommeling in vocht zien. Volkomen normaal."
            case 'luteal':
                return "Je houdt meer vocht vast (soms 1-2kg). Raak niet in paniek, dit is tijdelijk."
            default:
                return "Luister naar je lichaam en staar je niet blind op de weegschaal."
        }
    }

    const handleSaveManual = () => {
        const val = parseFloat(tempWeight.replace(',', '.'))
        if (!isNaN(val) && val > 0) {
            logWeight(date, val)
        }
        setShowSheet(false)
        setTempWeight('')
    }

    const trends = useMemo(() => {
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
    }, [user.weightLogs])

    const chartData = useMemo(() => {
        if (!user.weightLogs || user.weightLogs.length < 2) return null
        
        // Take last 30 days of data and cluster them by day if there are duplicates
        let sorted = [...user.weightLogs]
            .sort((a,b) => a.date.localeCompare(b.date))
            .slice(-30)
            
        // Deduplicate: keep the latest weight per date
        const deduped = []
        for (const log of sorted) {
            if (deduped.length > 0 && deduped[deduped.length-1].date === log.date) {
                deduped[deduped.length-1] = log
            } else {
                deduped.push(log)
            }
        }
        sorted = deduped
        
        if (sorted.length < 2) return null

        const weights = sorted.map(l => l.weight)
        const min = Math.min(...weights) - 0.5
        const max = Math.max(...weights) + 0.5
        
        const width = 100
        const height = 60 // Taller chart
        
        const pointsArray = sorted.map((l, i) => {
            const x = (i / (sorted.length - 1)) * width
            const y = height * 0.9 - ((l.weight - min) / (max - min || 1)) * (height * 0.8)
            return { x, y, weight: l.weight, date: l.date }
        })

        const linePoints = pointsArray.map(p => `${p.x},${p.y}`).join(' ')
        // Create a closed polygon for the area gradient
        const areaPoints = `${pointsArray[0].x},${height} ${linePoints} ${pointsArray[pointsArray.length-1].x},${height}`

        const phaseBlocks = []
        let currentPhaseStart = 0
        let currentPhaseBg = null

        for (let i = 0; i < sorted.length; i++) {
            const phase = getPhaseForDate(sorted[i].date)
            const bg = PHASE_BGS[phase] || 'transparent'
            const cx = (i / (sorted.length - 1)) * width

            if (i === 0) {
                currentPhaseBg = bg
                currentPhaseStart = 0
            } else if (bg !== currentPhaseBg) {
                phaseBlocks.push({ x: currentPhaseStart, width: cx - currentPhaseStart, color: currentPhaseBg })
                currentPhaseStart = cx
                currentPhaseBg = bg
            }
            if (i === sorted.length - 1) {
                phaseBlocks.push({ x: currentPhaseStart, width: width - currentPhaseStart, color: currentPhaseBg })
            }
        }

        return { pointsArray, linePoints, areaPoints, phaseBlocks, height, min, max }
    }, [user.weightLogs, getPhaseForDate])

    // Interaction handling
    const handleMove = (e) => {
        if (!chartData || !svgRef.current) return
        const rect = svgRef.current.getBoundingClientRect()
        const clientX = e.touches ? e.touches[0].clientX : e.clientX
        
        let xRelative = clientX - rect.left
        // clamp to bounds
        xRelative = Math.max(0, Math.min(xRelative, rect.width))
        
        const xPercent = (xRelative / rect.width) * 100

        // Find closest point
        let closestIdx = 0
        let minDiff = Infinity
        chartData.pointsArray.forEach((p, idx) => {
            const diff = Math.abs(p.x - xPercent)
            if (diff < minDiff) {
                minDiff = diff
                closestIdx = idx
            }
        })
        setScrubIndex(closestIdx)
    }

    const handleLeave = () => {
        setScrubIndex(null)
    }

    return (
        <section className="card" style={{ marginBottom: '1.25rem', padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem', paddingBottom: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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
                            setTempWeight(currentWeight ? String(currentWeight) : '')
                            setShowSheet(true)
                        }}
                        style={{ 
                            textAlign: 'right',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-primary)' }}>
                            {currentWeight || '-.-'} <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>kg</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Vandaag</div>
                    </div>
                </div>
            </div>

            {/* Premium Interactive Area Chart */}
            {chartData ? (
                <div 
                    style={{ position: 'relative', width: '100%', touchAction: 'none' }}
                    onMouseMove={handleMove}
                    onMouseLeave={handleLeave}
                    onTouchMove={handleMove}
                    onTouchStart={handleMove}
                    onTouchEnd={handleLeave}
                >
                    {/* Floating Tooltip */}
                    {scrubIndex !== null && (
                        <div style={{
                            position: 'absolute',
                            left: `${chartData.pointsArray[scrubIndex].x}%`,
                            top: '5px',
                            transform: 'translateX(-50%)',
                            background: '#333',
                            color: '#fff',
                            padding: '4px 8px',
                            borderRadius: '8px',
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            pointerEvents: 'none',
                            zIndex: 10,
                            whiteSpace: 'nowrap',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}>
                            {chartData.pointsArray[scrubIndex].weight} kg
                            <div style={{ fontSize: '0.55rem', opacity: 0.8, textAlign: 'center', marginTop: '1px', fontWeight: '400' }}>
                                {new Date(chartData.pointsArray[scrubIndex].date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                            </div>
                        </div>
                    )}

                    <svg 
                        ref={svgRef}
                        width="100%" 
                        height="120" 
                        viewBox={`0 0 100 ${chartData.height}`} 
                        preserveAspectRatio="none" 
                        style={{ display: 'block', cursor: 'crosshair' }}
                    >
                        <defs>
                            <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.0" />
                            </linearGradient>
                        </defs>

                        {/* Phase Backgrounds */}
                        {chartData.phaseBlocks.map((block, idx) => (
                            <rect
                                key={idx}
                                x={block.x}
                                y="0"
                                width={block.width}
                                height={chartData.height}
                                fill={block.color}
                            />
                        ))}
                        
                        {/* Area Fill */}
                        <polygon
                            points={chartData.areaPoints}
                            fill="url(#weightGradient)"
                        />

                        {/* Trend Line */}
                        <polyline
                            fill="none"
                            stroke="var(--color-primary)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={chartData.linePoints}
                        />

                        {/* Interactive Scrubber Line */}
                        {scrubIndex !== null && (
                            <line 
                                x1={chartData.pointsArray[scrubIndex].x} 
                                y1="0" 
                                x2={chartData.pointsArray[scrubIndex].x} 
                                y2={chartData.height} 
                                stroke="#333" 
                                strokeWidth="0.5" 
                                strokeDasharray="2 2"
                            />
                        )}

                        {/* Interactive Scrubber Dot */}
                        {scrubIndex !== null && (
                            <circle 
                                cx={chartData.pointsArray[scrubIndex].x} 
                                cy={chartData.pointsArray[scrubIndex].y} 
                                r="2" 
                                fill="#fff" 
                                stroke="var(--color-primary)" 
                                strokeWidth="1"
                            />
                        )}
                    </svg>
                </div>
            ) : (
                <div style={{ padding: '2rem 1.25rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    Nog niet genoeg data voor een grafiek. Log je gewicht vaker!
                </div>
            )}

            <div style={{ padding: '0 1.25rem 1.25rem 1.25rem' }}>
                {/* Insight Text */}
                <div style={{
                    background: 'var(--color-bg)',
                    padding: '1rem',
                    borderRadius: '16px',
                    fontSize: '0.85rem',
                    lineHeight: '1.5',
                    marginBottom: '1rem',
                    marginTop: '1rem',
                    color: 'var(--color-text)',
                    border: '1px solid var(--color-border)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: PHASE_COLORS[currentPhase] }} />
                        <span style={{ fontWeight: '700', color: 'var(--color-text)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Cyclus Inzicht
                        </span>
                    </div>
                    {getInsight(currentPhase)}
                </div>

                <button
                    onClick={() => {
                        setTempWeight(currentWeight ? String(currentWeight) : '')
                        setShowSheet(true)
                    }}
                    className="btn btn-primary"
                    style={{ 
                        width: '100%', 
                        padding: '1rem', 
                        fontSize: '0.95rem', 
                        borderRadius: '16px',
                        fontWeight: '600'
                    }}
                >
                    Log nieuw weegmoment
                </button>
            </div>

            {/* BOTTOM SHEET FOR LOGGING */}
            {showSheet && (
                <div 
                    style={{ 
                        position: 'fixed', 
                        bottom: 0, left: 0, right: 0, top: 0, 
                        background: 'rgba(0,0,0,0.4)', 
                        zIndex: 9999, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'flex-end',
                        animation: 'fadeIn 0.2s ease-out'
                    }}
                    onClick={() => setShowSheet(false)}
                >
                    <div 
                        style={{ 
                            background: '#fff', 
                            padding: '1.5rem', 
                            borderTopLeftRadius: '24px', 
                            borderTopRightRadius: '24px',
                            boxShadow: '0 -4px 24px rgba(0,0,0,0.1)',
                            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                        onClick={e => e.stopPropagation()} /* Prevent closing when clicking inside */
                    >
                        <div style={{ width: '40px', height: '4px', background: 'var(--color-border)', borderRadius: '2px', margin: '0 auto 1.5rem auto' }} />
                        
                        <h3 style={{ margin: '0 0 1.5rem 0', textAlign: 'center', fontSize: '1.2rem' }}>Wat weeg je vandaag?</h3>
                        
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '2rem' }}>
                            <input
                                type="number"
                                step="0.1"
                                value={tempWeight}
                                onChange={(e) => setTempWeight(e.target.value)}
                                placeholder="65.0"
                                autoFocus
                                style={{
                                    width: '140px',
                                    padding: '16px',
                                    borderRadius: '16px',
                                    border: '2px solid var(--color-primary)',
                                    fontSize: '1.5rem',
                                    fontWeight: '800',
                                    textAlign: 'center',
                                    color: 'var(--color-text)',
                                    outline: 'none',
                                    boxShadow: 'var(--shadow-soft)'
                                }}
                            />
                            <span style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>kg</span>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => setShowSheet(false)}
                                style={{ 
                                    flex: 1, 
                                    padding: '1rem', 
                                    borderRadius: '16px', 
                                    border: 'none', 
                                    background: 'var(--color-bg)', 
                                    color: 'var(--color-text)', 
                                    fontWeight: '600',
                                    fontSize: '1rem'
                                }}
                            >
                                Annuleer
                            </button>
                            <button
                                onClick={handleSaveManual}
                                className="btn btn-primary"
                                style={{ 
                                    flex: 2, 
                                    padding: '1rem', 
                                    borderRadius: '16px', 
                                    fontWeight: '600',
                                    fontSize: '1rem'
                                }}
                            >
                                Opslaan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}
