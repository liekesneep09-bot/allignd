import React, { useState, useRef, useMemo, useCallback } from 'react'
import { useUser } from '../context/UserContext'

// Parse "YYYY-MM-DD" strings correctly in local time (avoids UTC timezone shift)
function parseLocalDate(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d)
}

export default function WeightTracker({ date }) {
    const { user, logWeight, currentPhase, getPhaseForDate } = useUser()
    const [showSheet, setShowSheet] = useState(false)
    const [tempWeight, setTempWeight] = useState('')

    // Scrubbing state
    const svgRef = useRef(null)
    const [scrubIndex, setScrubIndex] = useState(null)
    const hideTimeoutRef = useRef(null)

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

    const getInsight = (phase) => {
        switch (phase) {
            case 'menstrual':
                return "Vocht verdwijnt langzaam. Je gewicht stabiliseert nu weer."
            case 'follicular':
                return "Dit is je meest stabiele fase. Je gewicht is nu het meest representatief."
            case 'ovulatory':
                return "Rond de eisprong kun je soms een kleine schommeling in vocht zien. Volkomen normaal."
            case 'luteal':
                return "Je houdt meer vocht vast (soms 1-2 kg). Raak niet in paniek, dit is tijdelijk."
            default:
                return "Luister naar je lichaam en staar je niet blind op de weegschaal."
        }
    }

    const handleSaveManual = () => {
        const strVal = String(tempWeight).replace(',', '.')
        const val = parseFloat(strVal)
        if (!isNaN(val) && val > 0) {
            logWeight(date, val)
        }
        setShowSheet(false)
        setTempWeight('')
    }

    const trends = useMemo(() => {
        if (!user.weightLogs || user.weightLogs.length < 1) return null

        const sorted = [...user.weightLogs].sort((a, b) => b.date.localeCompare(a.date))
        const today = new Date()
        const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        const fourteenDaysAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)

        const last7DaysLogs = sorted.filter(l => parseLocalDate(l.date) >= sevenDaysAgo)
        const prev7DaysLogs = sorted.filter(l => {
            const d = parseLocalDate(l.date)
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
            label: diff ? (diff > 0 ? `+${diff} kg` : `${diff} kg`) : 'Eerste week'
        }
    }, [user.weightLogs])

    const chartData = useMemo(() => {
        if (!user.weightLogs || user.weightLogs.length < 1) return null

        // Take last 30 entries, deduplicate per date (keep latest)
        let sorted = [...user.weightLogs]
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-30)

        const deduped = []
        for (const log of sorted) {
            if (deduped.length > 0 && deduped[deduped.length - 1].date === log.date) {
                deduped[deduped.length - 1] = log
            } else {
                deduped.push(log)
            }
        }
        sorted = deduped

        if (sorted.length < 1) return null

        const weights = sorted.map(l => l.weight)
        const rawMin = Math.min(...weights)
        const rawMax = Math.max(...weights)
        // Pad by 1kg so the line doesn't touch the edges
        const min = rawMin - 1
        const max = rawMax + 1

        const W = 100  // viewBox width
        const H = 60   // viewBox height

        // Time-proportional X axis
        const startTs = parseLocalDate(sorted[0].date).getTime()
        const endTs = parseLocalDate(sorted[sorted.length - 1].date).getTime()
        const timeSpan = endTs - startTs || 1 // prevent divide-by-zero for single point

        const pointsArray = sorted.map((l) => {
            const ts = parseLocalDate(l.date).getTime()
            const x = ((ts - startTs) / timeSpan) * W
            const y = H * 0.9 - ((l.weight - min) / (max - min || 1)) * (H * 0.8)
            return { x, y, weight: l.weight, date: l.date }
        })

        // Only draw line / area when we have ≥2 points
        let linePathStr = null
        let areaPathStr = null
        
        // Generate smooth cubic bezier curve (Catmull-Rom to Bezier approximate)
        if (pointsArray.length >= 2) {
            linePathStr = `M ${pointsArray[0].x},${pointsArray[0].y}`
            
            for (let i = 0; i < pointsArray.length - 1; i++) {
                const p0 = pointsArray[Math.max(0, i - 1)]
                const p1 = pointsArray[i]
                const p2 = pointsArray[i + 1]
                const p3 = pointsArray[Math.min(pointsArray.length - 1, i + 2)]

                // Control points distance
                const tension = 0.2
                
                const cp1x = p1.x + (p2.x - p0.x) * tension
                const cp1y = p1.y + (p2.y - p0.y) * tension
                const cp2x = p2.x - (p3.x - p1.x) * tension
                const cp2y = p2.y - (p3.y - p1.y) * tension
                
                linePathStr += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`
            }
            
            areaPathStr = `${linePathStr} L ${pointsArray[pointsArray.length - 1].x},${H} L ${pointsArray[0].x},${H} Z`
        }

        // Phase colored points (instead of block backgrounds)
        if (pointsArray.length >= 1) {
            for (let i = 0; i < pointsArray.length; i++) {
                const phase = getPhaseForDate(sorted[i].date)
                pointsArray[i].phaseColor = PHASE_COLORS[phase] || 'var(--color-primary)'
                pointsArray[i].phaseName = phase
            }
        }

        // X-axis date labels
        const startLabel = parseLocalDate(sorted[0].date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
        const endLabel = parseLocalDate(sorted[sorted.length - 1].date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })

        // Y-axis labels (two readable grid values)
        const yLabelLow = Math.ceil(rawMin)
        const yLabelHigh = Math.floor(rawMax)

        return { pointsArray, linePathStr, areaPathStr, H, W, min, max, startLabel, endLabel, yLabelLow, yLabelHigh }
    }, [user.weightLogs, getPhaseForDate])

    // ── Interaction ──────────────────────────────────────────────────────────
    const handleMove = useCallback((e) => {
        if (!chartData || !svgRef.current) return
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current)
            hideTimeoutRef.current = null
        }
        const rect = svgRef.current.getBoundingClientRect()
        const clientX = e.touches ? e.touches[0].clientX : e.clientX

        let xRelative = Math.max(0, Math.min(clientX - rect.left, rect.width))
        const xPercent = (xRelative / rect.width) * 100

        let closestIdx = 0
        let minDiff = Infinity
        chartData.pointsArray.forEach((p, idx) => {
            const diff = Math.abs(p.x - xPercent)
            if (diff < minDiff) { minDiff = diff; closestIdx = idx }
        })
        setScrubIndex(closestIdx)
    }, [chartData])

    const handleLeave = useCallback(() => {
        // Delay hiding on touch so the user can actually read the tooltip
        hideTimeoutRef.current = setTimeout(() => setScrubIndex(null), 600)
    }, [])

    // For single-point: derive tooltip position
    const scrubPoint = scrubIndex !== null && chartData ? chartData.pointsArray[scrubIndex] : null

    // Clamp tooltip so it never goes off-screen (uses % of chart width)
    const tooltipLeft = scrubPoint
        ? scrubPoint.x < 8 ? '8%'
            : scrubPoint.x > 92 ? '92%'
                : `${scrubPoint.x}%`
        : '50%'

    return (
        <section className="card" style={{ marginBottom: '1.25rem', padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem', paddingBottom: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h2 style={{ fontSize: '1.1rem', margin: '0 0 0.25rem 0' }}>Gewicht</h2>
                        {trends && (
                            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                                Gem.&nbsp;
                                <span style={{ fontWeight: '700', color: 'var(--color-text)' }}>{trends.avgNow} kg</span>
                                {trends.diff !== null && (
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '2px',
                                        color: trends.diff > 0 ? '#ff8a9a' : 'var(--color-movement)',
                                        marginLeft: '6px',
                                        fontWeight: '600'
                                    }}>
                                        {trends.diff > 0 ? '▲' : '▼'} {trends.label}
                                    </span>
                                )}
                                {trends.diff === null && (
                                    <span style={{ color: 'var(--color-text-muted)', marginLeft: '6px' }}>
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
                        style={{ textAlign: 'right', cursor: 'pointer' }}
                    >
                        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-primary)' }}>
                            {currentWeight || '-.-'} <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>kg</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Vandaag</div>
                    </div>
                </div>
            </div>

            {/* Chart area */}
            {chartData ? (
                <div
                    style={{ position: 'relative', width: '100%', touchAction: 'none', userSelect: 'none' }}
                    onMouseMove={handleMove}
                    onMouseLeave={handleLeave}
                    onTouchMove={handleMove}
                    onTouchStart={handleMove}
                    onTouchEnd={handleLeave}
                >
                    {/* Floating Tooltip */}
                    {scrubPoint && (
                        <div style={{
                            position: 'absolute',
                            left: tooltipLeft,
                            top: '6px',
                            transform: 'translateX(-50%)',
                            background: 'var(--color-text)',
                            color: 'var(--color-bg, #fff)',
                            padding: '5px 10px',
                            borderRadius: '10px',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            pointerEvents: 'none',
                            zIndex: 10,
                            whiteSpace: 'nowrap',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            lineHeight: 1.4
                        }}>
                            {scrubPoint.weight} kg
                            <div style={{ fontSize: '0.6rem', opacity: 0.7, textAlign: 'center', fontWeight: '400' }}>
                                {parseLocalDate(scrubPoint.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                            </div>
                        </div>
                    )}

                    {/* Y-axis labels */}
                    <div style={{
                        position: 'absolute',
                        left: '6px',
                        top: 0,
                        bottom: '18px', // above x-axis labels
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        pointerEvents: 'none',
                        zIndex: 5
                    }}>
                        <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', lineHeight: 1 }}>
                            {chartData.yLabelHigh} kg
                        </span>
                        <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', lineHeight: 1 }}>
                            {chartData.yLabelLow} kg
                        </span>
                    </div>

                    <svg
                        ref={svgRef}
                        width="100%"
                        height="120"
                        viewBox={`0 0 ${chartData.W} ${chartData.H}`}
                        preserveAspectRatio="xMidYMid meet"
                        style={{ display: 'block', cursor: 'crosshair' }}
                    >
                        <defs>
                            <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25" />
                                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.0" />
                            </linearGradient>
                        </defs>

                        {/* Horizontal grid line (midpoint) */}
                        <line
                            x1="0" y1={chartData.H * 0.5}
                            x2={chartData.W} y2={chartData.H * 0.5}
                            stroke="var(--color-border)"
                            strokeWidth="0.3"
                            strokeDasharray="2 3"
                        />

                        {/* Area Fill */}
                        {chartData.areaPathStr && (
                            <path
                                d={chartData.areaPathStr}
                                fill="url(#weightGradient)"
                            />
                        )}

                        {/* Trend Line (Smooth) */}
                        {chartData.linePathStr && (
                            <path
                                fill="none"
                                stroke="var(--color-primary)"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d={chartData.linePathStr}
                            />
                        )}

                        {/* Single-point dot (when only 1 log) */}
                        {chartData.pointsArray.length === 1 && (
                            <circle
                                cx={chartData.pointsArray[0].x}
                                cy={chartData.pointsArray[0].y}
                                r="3"
                                fill="var(--color-primary)"
                            />
                        )}

                        {/* All data-point dots (colored by cycle phase) */}
                        {chartData.pointsArray.map((p, i) => (
                            <circle
                                key={i}
                                cx={p.x}
                                cy={p.y}
                                r="1.8"
                                fill={p.phaseColor}
                                opacity="1"
                            />
                        ))}

                        {/* Scrubber Line */}
                        {scrubPoint && (
                            <line
                                x1={scrubPoint.x} y1="0"
                                x2={scrubPoint.x} y2={chartData.H}
                                stroke="var(--color-text)"
                                strokeWidth="0.4"
                                strokeDasharray="2 2"
                                opacity="0.4"
                            />
                        )}

                        {/* Scrubber Dot (highlighted) */}
                        {scrubPoint && (
                            <>
                                <circle cx={scrubPoint.x} cy={scrubPoint.y} r="3.5" fill="var(--color-primary)" opacity="0.2" />
                                <circle cx={scrubPoint.x} cy={scrubPoint.y} r="2" fill="#fff" stroke="var(--color-primary)" strokeWidth="1.2" />
                            </>
                        )}
                    </svg>

                    {/* X-axis date labels */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '2px 8px 4px 8px',
                        pointerEvents: 'none'
                    }}>
                        <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)' }}>{chartData.startLabel}</span>
                        <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)' }}>{chartData.endLabel}</span>
                    </div>
                </div>
            ) : (
                <div style={{ padding: '2rem 1.25rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    Log je eerste gewicht om te beginnen!
                </div>
            )}

            <div style={{ padding: '0 1.25rem 1.25rem 1.25rem' }}>
                {/* Insight */}
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
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: PHASE_COLORS[currentPhase] || 'var(--color-primary)' }} />
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

            {/* BOTTOM SHEET */}
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
                        alignItems: 'center',
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
                            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                            width: '100%',
                            maxWidth: '480px',
                            paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ width: '40px', height: '4px', background: 'var(--color-border)', borderRadius: '2px', margin: '0 auto 1.5rem auto' }} />

                        <h3 style={{ margin: '0 0 1.5rem 0', textAlign: 'center', fontSize: '1.2rem' }}>Wat weeg je vandaag?</h3>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '2rem' }}>
                            <input
                                type="text"
                                inputMode="decimal"
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
