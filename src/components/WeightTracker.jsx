import React, { useState, useRef, useMemo, useCallback } from 'react'
import { useUser } from '../context/UserContext'
import { useLanguage } from '../context/LanguageContext'

// Parse "YYYY-MM-DD" strings correctly in local time (avoids UTC timezone shift)
function parseLocalDate(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d)
}

export default function WeightTracker({ date }) {
    const { user, logWeight, currentPhase, getPhaseForDate } = useUser()
    const { t, language } = useLanguage()
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
                return t('weight.insights.menstrual')
            case 'follicular':
                return t('weight.insights.follicular')
            case 'ovulatory':
                return t('weight.insights.ovulatory')
            case 'luteal':
                return t('weight.insights.luteal')
            default:
                return t('weight.insights.default')
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

        const sorted = [...user.weightLogs].sort((a, b) => a.date.localeCompare(b.date))

        const firstWeight = sorted[0].weight
        const latestWeight = sorted[sorted.length - 1].weight
        const totalDiff = Number((latestWeight - firstWeight).toFixed(1))
        const firstDate = sorted[0].date  // YYYY-MM-DD of first log
        const logCount = sorted.length

        return { firstWeight, latestWeight, totalDiff, firstDate, logCount }
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
        const dataRange = rawMax - rawMin

        // ── DYNAMIC Y-AXIS SCALING ──
        // The key insight: we want the graph to SHOW real changes.
        // If someone goes from 65.0 to 65.3, that should be visible as a curve, not a flat line.
        //
        // Strategy: use a minimum visible window of 2kg, but center it on the actual data.
        // When the data range is larger than 2kg, use the actual range with small padding.
        const MIN_VISIBLE_RANGE = 2 // minimum kg range shown on Y-axis
        const dataMid = (rawMin + rawMax) / 2

        let yLabelLow, yLabelHigh

        if (dataRange < MIN_VISIBLE_RANGE) {
            // Small range: center the window on the data midpoint
            // Use 0.5 steps for finer labels (e.g., 64.5 — 66.5)
            yLabelLow = Math.floor((dataMid - MIN_VISIBLE_RANGE / 2) * 2) / 2
            yLabelHigh = Math.ceil((dataMid + MIN_VISIBLE_RANGE / 2) * 2) / 2
        } else {
            // Wider range: tight fit with proportional padding (5% of range on each side)
            const padding = Math.max(0.3, dataRange * 0.08)
            yLabelLow = Math.floor((rawMin - padding) * 2) / 2
            yLabelHigh = Math.ceil((rawMax + padding) * 2) / 2
        }

        // Ensure labels are never identical
        if (yLabelHigh - yLabelLow < 1) {
            yLabelLow -= 0.5
            yLabelHigh += 0.5
        }

        // The actual plotting range — tight to the labels
        const min = yLabelLow
        const max = yLabelHigh

        const W = 100  // viewBox width
        const H = 60   // viewBox height

        // Add horizontal padding so dots at edges aren't clipped
        const xPad = sorted.length > 1 ? 4 : 0
        const plotW = W - xPad * 2

        // Time-proportional X axis
        const startTs = parseLocalDate(sorted[0].date).getTime()
        const endTs = parseLocalDate(sorted[sorted.length - 1].date).getTime()
        const timeSpan = endTs - startTs || 1 // prevent divide-by-zero for single point

        // Vertical plot area: leave 10% top, 10% bottom for breathing room
        const plotTop = H * 0.08
        const plotHeight = H * 0.82

        const pointsArray = sorted.map((l) => {
            const ts = parseLocalDate(l.date).getTime()
            const xNorm = sorted.length === 1 ? 0.5 : (ts - startTs) / timeSpan
            const x = xPad + xNorm * plotW
            const yNorm = (l.weight - min) / (max - min || 1)
            const y = plotTop + plotHeight - yNorm * plotHeight
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

                // Control points distance — slightly higher tension for smoother curves
                const tension = 0.25
                
                const cp1x = p1.x + (p2.x - p0.x) * tension
                const cp1y = p1.y + (p2.y - p0.y) * tension
                const cp2x = p2.x - (p3.x - p1.x) * tension
                const cp2y = p2.y - (p3.y - p1.y) * tension
                
                linePathStr += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`
            }
            
            areaPathStr = `${linePathStr} L ${pointsArray[pointsArray.length - 1].x},${H} L ${pointsArray[0].x},${H} Z`
        }

        // Phase colored points — destructure .phase because getPhaseForDate returns {phase, day, confidence}
        if (pointsArray.length >= 1) {
            for (let i = 0; i < pointsArray.length; i++) {
                const { phase } = getPhaseForDate(sorted[i].date)
                pointsArray[i].phaseColor = PHASE_COLORS[phase] || 'var(--color-primary)'
                pointsArray[i].phaseName = phase  // now a string, safe to render
            }
        }

        // X-axis date labels
        const startLabel = parseLocalDate(sorted[0].date).toLocaleDateString(language === 'en' ? 'en-US' : 'nl-NL', { day: 'numeric', month: 'short' })
        const endLabel = parseLocalDate(sorted[sorted.length - 1].date).toLocaleDateString(language === 'en' ? 'en-US' : 'nl-NL', { day: 'numeric', month: 'short' })

        // Generate Y-axis grid lines for visual reference
        const yRange = yLabelHigh - yLabelLow
        const gridLines = []
        // Determine step: 0.5kg steps for small ranges, 1kg for larger
        const gridStep = yRange <= 3 ? 0.5 : 1
        for (let v = yLabelLow; v <= yLabelHigh; v += gridStep) {
            const rounded = Math.round(v * 10) / 10
            const yNorm = (rounded - min) / (max - min || 1)
            const y = plotTop + plotHeight - yNorm * plotHeight
            gridLines.push({ y, label: rounded, isMain: Number.isInteger(rounded) })
        }

        // Mid label for Y-axis (rounded to 1 decimal)
        const yLabelMid = Math.round(((yLabelLow + yLabelHigh) / 2) * 2) / 2

        return { pointsArray, linePathStr, areaPathStr, H, W, min, max, startLabel, endLabel, yLabelLow, yLabelHigh, yLabelMid, gridLines, plotTop, plotHeight }
    }, [user.weightLogs, user.menstruationLogs, user.cycleStart, user.cycleLength, getPhaseForDate])

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

    // Phase color for this render
    const phaseColor = PHASE_COLORS[currentPhase] || 'var(--color-primary)'

    // Build simple trend sentence (only when 2+ logs)
    const trendSentence = (() => {
        if (!trends || trends.logCount < 2) return null
        const diff = trends.totalDiff
        const absVal = Math.abs(diff).toFixed(1)
        const firstDateObj = parseLocalDate(trends.firstDate)
        const dateStr = firstDateObj.toLocaleDateString(language === 'en' ? 'en-US' : 'nl-NL', { day: 'numeric', month: 'long' })
        if (Math.abs(diff) <= 0.05) return `${t('weight.stable_since')} ${dateStr}`
        return `${diff > 0 ? '↑' : '↓'} ${absVal} kg ${diff > 0 ? t('weight.more_than') : t('weight.less_than')} ${dateStr}`
    })()

    return (
        <section className="card" style={{ marginBottom: '1.25rem', padding: '0', overflow: 'hidden' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.25rem 0.75rem' }}>
                <h2 style={{ fontSize: '1.1rem', margin: 0 }}>{t('weight.title')}</h2>
                <button
                    onClick={() => { setTempWeight(currentWeight ? String(currentWeight) : ''); setShowSheet(true) }}
                    style={{
                        background: 'var(--color-primary)',
                        color: '#333333',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '6px 16px',
                        fontSize: '0.82rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        letterSpacing: '0.01em'
                    }}
                >
                    + Log
                </button>
            </div>

            {/* Graph */}
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
                            top: '8px',
                            transform: 'translateX(-50%)',
                            background: 'var(--color-text)',
                            color: '#fff',
                            padding: '6px 12px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            pointerEvents: 'none',
                            zIndex: 10,
                            whiteSpace: 'nowrap',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                            lineHeight: 1.4
                        }}>
                            {scrubPoint.weight} kg
                            <div style={{ fontSize: '0.62rem', opacity: 0.7, textAlign: 'center', fontWeight: '400' }}>
                                {parseLocalDate(scrubPoint.date).toLocaleDateString(language === 'en' ? 'en-US' : 'nl-NL', { day: 'numeric', month: 'short' })}
                            </div>
                            {scrubPoint.phaseName && (
                                <div style={{ fontSize: '0.62rem', color: scrubPoint.phaseColor, textAlign: 'center', marginTop: '2px', fontWeight: 800, filter: 'brightness(1.6)' }}>
                                    {t(`weight.phases.${scrubPoint.phaseName}`)}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Y-axis labels (3-level) */}
                    <div style={{ position: 'absolute', left: '8px', top: '4px', bottom: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none', zIndex: 5 }}>
                        <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', lineHeight: 1 }}>{chartData.yLabelHigh} kg</span>
                        <span style={{ fontSize: '0.55rem', color: 'var(--color-text-muted)', lineHeight: 1, opacity: 0.6 }}>{chartData.yLabelMid}</span>
                        <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', lineHeight: 1 }}>{chartData.yLabelLow} kg</span>
                    </div>

                    <svg
                        ref={svgRef}
                        width="100%"
                        height="160"
                        viewBox={`0 0 ${chartData.W} ${chartData.H}`}
                        preserveAspectRatio="none"
                        style={{ display: 'block', cursor: 'crosshair' }}
                    >
                        <defs>
                            <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={phaseColor} stopOpacity="0.25" />
                                <stop offset="80%" stopColor={phaseColor} stopOpacity="0.05" />
                                <stop offset="100%" stopColor={phaseColor} stopOpacity="0.0" />
                            </linearGradient>
                        </defs>

                        {/* Grid lines for visual reference */}
                        {chartData.gridLines.map((gl, i) => (
                            <line key={i} x1="0" y1={gl.y} x2={chartData.W} y2={gl.y}
                                stroke="var(--color-border)" strokeWidth={gl.isMain ? '0.4' : '0.2'}
                                strokeDasharray={gl.isMain ? '3 4' : '1.5 3'} opacity={gl.isMain ? 0.6 : 0.35} />
                        ))}

                        {/* Area fill — phase colored */}
                        {chartData.areaPathStr && <path d={chartData.areaPathStr} fill="url(#weightGradient)" />}

                        {/* Line — phase colored */}
                        {chartData.linePathStr && (
                            <path fill="none" stroke={phaseColor} strokeWidth="2.5"
                                strokeLinecap="round" strokeLinejoin="round" d={chartData.linePathStr} />
                        )}

                        {/* Data point dots — subtle dark grey */}
                        {chartData.pointsArray.map((pt, i) => (
                            <circle key={i} cx={pt.x} cy={pt.y} r="1.5" fill="#333333" opacity="0.5" />
                        ))}

                        {/* Scrubber */}
                        {scrubPoint && (
                            <>
                                <line x1={scrubPoint.x} y1="0" x2={scrubPoint.x} y2={chartData.H}
                                    stroke="var(--color-text)" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.35" />
                                <circle cx={scrubPoint.x} cy={scrubPoint.y} r="5" fill={phaseColor} opacity="0.2" />
                                <circle cx={scrubPoint.x} cy={scrubPoint.y} r="3" fill="#fff" stroke={phaseColor} strokeWidth="1.5" />
                            </>
                        )}
                    </svg>

                    {/* X-axis labels */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 10px 4px 10px', pointerEvents: 'none' }}>
                        <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)' }}>{chartData.startLabel}</span>
                        <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)' }}>{chartData.endLabel}</span>
                    </div>
                </div>
            ) : (
                <div style={{ padding: '2.5rem 1.25rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    {t('weight.log_cta')}
                </div>
            )}

            {/* Big weight hero + trend sentence */}
            <div style={{ padding: '1rem 1.25rem 0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                    <span style={{ fontSize: '2.8rem', fontWeight: '800', color: 'var(--color-text)', lineHeight: 1, letterSpacing: '-0.03em' }}>
                        {currentWeight || '—'}
                    </span>
                    <span style={{ fontSize: '1.1rem', fontWeight: '500', color: 'var(--color-text-muted)' }}>kg</span>
                </div>
                {trendSentence && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '3px' }}>
                        {trendSentence}
                    </div>
                )}
                {trends && trends.logCount === 1 && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '3px' }}>
                        {t('weight.first_log_hint')}
                    </div>
                )}
            </div>

            {/* Cyclus insight — compact inline */}
            <div style={{ padding: '0.75rem 1.25rem 1.25rem' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    padding: '0.75rem',
                    background: 'var(--color-bg)',
                    borderRadius: '12px',
                    border: `1px solid ${phaseColor}30`
                }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: phaseColor, marginTop: '4px', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-text)', lineHeight: '1.45' }}>
                        {getInsight(currentPhase)}
                    </span>
                </div>
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

                        <h3 style={{ margin: '0 0 1.5rem 0', textAlign: 'center', fontSize: '1.2rem' }}>{t('weight.sheet_title')}</h3>

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
                                    border: `2px solid ${phaseColor}`,
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
                                style={{ flex: 1, padding: '1rem', borderRadius: '16px', border: 'none', background: 'var(--color-bg)', color: 'var(--color-text)', fontWeight: '600', fontSize: '1rem', cursor: 'pointer' }}
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={handleSaveManual}
                                className="btn btn-primary"
                                style={{ flex: 2, padding: '1rem', borderRadius: '16px', fontWeight: '600', fontSize: '1rem', background: phaseColor }}
                            >
                                {t('common.save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}
