import React, { useMemo, useRef, useCallback, useState } from 'react'
import { useUser } from '../context/UserContext'
import { useLanguage } from '../context/LanguageContext'
import { getLocalDateStr } from '../utils/date'
import { toNum } from '../utils/numbers'

// ─── Helpers ─────────────────────────────────────────────

function parseLocalDate(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d)
}

const PHASE_COLORS = {
    menstrual: '#a86473',
    follicular: '#5bc4d4',
    ovulatory: '#f5a89c',
    luteal: '#a3b899'
}

// ─── Macro Weekly Average Card ────────────────────────────

function MacroWeekCard({ t, language }) {
    const { user, targets } = useUser()

    const weekStats = useMemo(() => {
        const today = new Date()
        const days = []
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today)
            d.setDate(today.getDate() - i)
            days.push(getLocalDateStr(d))
        }

        const logs = user.foodLogs || []
        let totalKcal = 0, totalP = 0, totalC = 0, totalF = 0
        let daysWithLogs = 0

        for (const dateStr of days) {
            const dayLogs = logs.filter(l => l.date === dateStr)
            if (dayLogs.length > 0) {
                daysWithLogs++
                dayLogs.forEach(l => {
                    totalKcal += toNum(l.kcal)
                    totalP += toNum(l.protein)
                    totalC += toNum(l.carbs)
                    totalF += toNum(l.fat)
                })
            }
        }

        if (daysWithLogs === 0) return null

        return {
            avgKcal: Math.round(totalKcal / daysWithLogs),
            avgP: Math.round(totalP / daysWithLogs),
            avgC: Math.round(totalC / daysWithLogs),
            avgF: Math.round(totalF / daysWithLogs),
            daysWithLogs
        }
    }, [user.foodLogs])

    const goalKcal = targets?.calories || 2000
    const goalP = targets?.proteinMin || 0
    const goalC = targets?.carbsMin || 0
    const goalF = targets?.fatMin || 0

    if (!weekStats) {
        return (
            <div style={cardStyle}>
                <h3 style={cardTitleStyle}>{t('progress.weekly_avg')}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
                    {t('progress.no_food_logs')}
                </p>
            </div>
        )
    }

    const macros = [
        { label: t('today.proteins'), avg: weekStats.avgP, goal: goalP, color: 'var(--color-protein)' },
        { label: t('today.carbs'), avg: weekStats.avgC, goal: goalC, color: 'var(--color-carbs)' },
        { label: t('today.fats'), avg: weekStats.avgF, goal: goalF, color: 'var(--color-fat)' }
    ]

    const kcalPct = Math.min(100, Math.round((weekStats.avgKcal / goalKcal) * 100))
    const kcalColor = kcalPct >= 90 && kcalPct <= 115 ? '#a3b899' : kcalPct < 70 ? '#f5a89c' : 'var(--color-calories)'

    return (
        <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div>
                    <h3 style={cardTitleStyle}>{t('progress.weekly_avg')}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {t('progress.based_on_days').replace('{n}', weekStats.daysWithLogs)}
                    </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.9rem', fontWeight: '800', color: kcalColor, lineHeight: 1 }}>
                        {weekStats.avgKcal}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                        / {goalKcal} kcal
                    </div>
                </div>
            </div>

            {/* Kcal progress bar */}
            <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ height: '8px', background: 'var(--color-bg)', borderRadius: '4px', overflow: 'hidden', marginBottom: '4px' }}>
                    <div style={{
                        width: `${kcalPct}%`,
                        height: '100%',
                        background: kcalColor,
                        borderRadius: '4px',
                        transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)'
                    }} />
                </div>
                <div style={{ fontSize: '0.72rem', color: kcalColor, fontWeight: '600' }}>
                    {kcalPct}% {t('progress.of_goal')}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {macros.map(m => {
                    const pct = Math.min(100, Math.round((m.avg / (m.goal || 1)) * 100))
                    return (
                        <div key={m.label}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{m.label}</span>
                                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text)' }}>
                                    {m.avg}g <span style={{ opacity: 0.5, fontWeight: 400 }}>/ {m.goal}g</span>
                                </span>
                            </div>
                            <div style={{ height: '5px', background: 'var(--color-bg)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{
                                    width: `${pct}%`,
                                    height: '100%',
                                    background: m.color,
                                    borderRadius: '3px',
                                    transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)'
                                }} />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// ─── Weight Trend Card ────────────────────────────────────

function WeightTrendCard({ t, language }) {
    const { user, getPhaseForDate, currentPhase } = useUser()
    const svgRef = useRef(null)
    const [scrubIndex, setScrubIndex] = useState(null)
    const hideTimeoutRef = useRef(null)

    const phaseColor = PHASE_COLORS[currentPhase] || 'var(--color-primary)'

    const chartData = useMemo(() => {
        if (!user.weightLogs || user.weightLogs.length < 1) return null

        // Last 90 days
        let sorted = [...user.weightLogs]
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-90)

        // Deduplicate per date
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
        const MIN_VISIBLE_RANGE = 2
        const dataMid = (rawMin + rawMax) / 2

        let yLow, yHigh
        if (dataRange < MIN_VISIBLE_RANGE) {
            yLow = Math.floor((dataMid - MIN_VISIBLE_RANGE / 2) * 2) / 2
            yHigh = Math.ceil((dataMid + MIN_VISIBLE_RANGE / 2) * 2) / 2
        } else {
            const padding = Math.max(0.3, dataRange * 0.08)
            yLow = Math.floor((rawMin - padding) * 2) / 2
            yHigh = Math.ceil((rawMax + padding) * 2) / 2
        }
        if (yHigh - yLow < 1) { yLow -= 0.5; yHigh += 0.5 }

        const W = 100, H = 70
        const xPad = sorted.length > 1 ? 4 : 0
        const plotW = W - xPad * 2
        const startTs = parseLocalDate(sorted[0].date).getTime()
        const endTs = parseLocalDate(sorted[sorted.length - 1].date).getTime()
        const timeSpan = endTs - startTs || 1
        const plotTop = H * 0.08, plotHeight = H * 0.82

        const pts = sorted.map(l => {
            const ts = parseLocalDate(l.date).getTime()
            const xN = sorted.length === 1 ? 0.5 : (ts - startTs) / timeSpan
            const x = xPad + xN * plotW
            const yN = (l.weight - yLow) / (yHigh - yLow || 1)
            const y = plotTop + plotHeight - yN * plotHeight
            const { phase } = getPhaseForDate(l.date)
            return { x, y, weight: l.weight, date: l.date, phaseColor: PHASE_COLORS[phase] || phaseColor, phase }
        })

        // Target weight line
        let targetY = null
        if (user.targetWeight) {
            const tW = parseFloat(user.targetWeight)
            if (!isNaN(tW) && tW >= yLow && tW <= yHigh) {
                const yN = (tW - yLow) / (yHigh - yLow || 1)
                targetY = plotTop + plotHeight - yN * plotHeight
            }
        }

        // Smooth bezier line
        let linePathStr = null, areaPathStr = null
        if (pts.length >= 2) {
            linePathStr = `M ${pts[0].x},${pts[0].y}`
            for (let i = 0; i < pts.length - 1; i++) {
                const p0 = pts[Math.max(0, i - 1)]
                const p1 = pts[i]
                const p2 = pts[i + 1]
                const p3 = pts[Math.min(pts.length - 1, i + 2)]
                const t = 0.25
                const cp1x = p1.x + (p2.x - p0.x) * t
                const cp1y = p1.y + (p2.y - p0.y) * t
                const cp2x = p2.x - (p3.x - p1.x) * t
                const cp2y = p2.y - (p3.y - p1.y) * t
                linePathStr += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`
            }
            areaPathStr = `${linePathStr} L ${pts[pts.length - 1].x},${H} L ${pts[0].x},${H} Z`
        }

        const startLabel = parseLocalDate(sorted[0].date).toLocaleDateString(language === 'en' ? 'en-US' : 'nl-NL', { day: 'numeric', month: 'short' })
        const endLabel = parseLocalDate(sorted[sorted.length - 1].date).toLocaleDateString(language === 'en' ? 'en-US' : 'nl-NL', { day: 'numeric', month: 'short' })

        return { pts, linePathStr, areaPathStr, H, W, yLow, yHigh, startLabel, endLabel, targetY, plotTop, plotHeight }
    }, [user.weightLogs, user.targetWeight, getPhaseForDate])

    // Trend summary
    const trendText = useMemo(() => {
        if (!user.weightLogs || user.weightLogs.length < 2) return null
        const sorted = [...user.weightLogs].sort((a, b) => a.date.localeCompare(b.date))
        const first = sorted[0].weight
        const last = sorted[sorted.length - 1].weight
        const diff = Number((last - first).toFixed(1))
        if (Math.abs(diff) <= 0.05) return t('weight.stable_since')
        const arrow = diff > 0 ? '↑' : '↓'
        const key = diff > 0 ? t('weight.more_than') : t('weight.less_than')
        const dateStr = parseLocalDate(sorted[0].date).toLocaleDateString(language === 'en' ? 'en-US' : 'nl-NL', { day: 'numeric', month: 'long' })
        return `${arrow} ${Math.abs(diff).toFixed(1)} kg ${key} ${dateStr}`
    }, [user.weightLogs, language, t])

    const handleMove = useCallback((e) => {
        if (!chartData || !svgRef.current) return
        if (hideTimeoutRef.current) { clearTimeout(hideTimeoutRef.current); hideTimeoutRef.current = null }
        const rect = svgRef.current.getBoundingClientRect()
        const clientX = e.touches ? e.touches[0].clientX : e.clientX
        const xPct = (Math.max(0, Math.min(clientX - rect.left, rect.width)) / rect.width) * 100
        let closest = 0, minD = Infinity
        chartData.pts.forEach((p, i) => { const d = Math.abs(p.x - xPct); if (d < minD) { minD = d; closest = i } })
        setScrubIndex(closest)
    }, [chartData])

    const handleLeave = useCallback(() => {
        hideTimeoutRef.current = setTimeout(() => setScrubIndex(null), 600)
    }, [])

    const scrubPt = scrubIndex !== null && chartData ? chartData.pts[scrubIndex] : null
    const tooltipLeft = scrubPt ? (scrubPt.x < 8 ? '8%' : scrubPt.x > 92 ? '92%' : `${scrubPt.x}%`) : '50%'

    if (!chartData) {
        return (
            <div style={cardStyle}>
                <h3 style={cardTitleStyle}>{t('progress.weight_trend')}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
                    {t('weight.log_cta')}
                </p>
            </div>
        )
    }

    return (
        <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={cardTitleStyle}>{t('progress.weight_trend')}</h3>
                {user.targetWeight && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        <div style={{ width: '20px', height: '2px', background: '#888', borderRadius: '1px', opacity: 0.4, borderTop: '2px dashed #888', marginTop: '-2px' }} />
                        {t('progress.target')} {user.targetWeight} kg
                    </div>
                )}
            </div>

            {trendText && (
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                    {trendText}
                </div>
            )}

            <div
                style={{ position: 'relative', width: '100%', touchAction: 'none', userSelect: 'none' }}
                onMouseMove={handleMove}
                onMouseLeave={handleLeave}
                onTouchMove={handleMove}
                onTouchStart={handleMove}
                onTouchEnd={handleLeave}
            >
                {scrubPt && (
                    <div style={{
                        position: 'absolute', left: tooltipLeft, top: '8px',
                        transform: 'translateX(-50%)',
                        background: 'var(--color-text)', color: '#fff',
                        padding: '6px 12px', borderRadius: '12px',
                        fontSize: '0.75rem', fontWeight: '700',
                        pointerEvents: 'none', zIndex: 10,
                        whiteSpace: 'nowrap',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                        lineHeight: 1.4
                    }}>
                        {scrubPt.weight} kg
                        <div style={{ fontSize: '0.62rem', opacity: 0.7, textAlign: 'center', fontWeight: '400' }}>
                            {parseLocalDate(scrubPt.date).toLocaleDateString(language === 'en' ? 'en-US' : 'nl-NL', { day: 'numeric', month: 'short' })}
                        </div>
                        <div style={{ fontSize: '0.62rem', color: scrubPt.phaseColor, textAlign: 'center', marginTop: '2px', fontWeight: 800, filter: 'brightness(1.4)' }}>
                            {t(`weight.phases.${scrubPt.phase}`)}
                        </div>
                    </div>
                )}

                <svg ref={svgRef} width="100%" height="180"
                    viewBox={`0 0 ${chartData.W} ${chartData.H}`}
                    preserveAspectRatio="none"
                    style={{ display: 'block', cursor: 'crosshair' }}>
                    <defs>
                        <linearGradient id="progressWeightGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={phaseColor} stopOpacity="0.2" />
                            <stop offset="100%" stopColor={phaseColor} stopOpacity="0.02" />
                        </linearGradient>
                    </defs>

                    {/* Target weight dashed line */}
                    {chartData.targetY !== null && (
                        <line x1="0" y1={chartData.targetY} x2={chartData.W} y2={chartData.targetY}
                            stroke="#888" strokeWidth="0.6" strokeDasharray="3 3" opacity="0.4" />
                    )}

                    {/* Area fill */}
                    {chartData.areaPathStr && <path d={chartData.areaPathStr} fill="url(#progressWeightGrad)" />}

                    {/* Line */}
                    {chartData.linePathStr && (
                        <path fill="none" stroke={phaseColor} strokeWidth="2.5"
                            strokeLinecap="round" strokeLinejoin="round" d={chartData.linePathStr} />
                    )}

                    {/* Phase-colored dots */}
                    {chartData.pts.map((pt, i) => (
                        <circle key={i} cx={pt.x} cy={pt.y} r="1.8" fill={pt.phaseColor} opacity="0.7" />
                    ))}

                    {/* Scrubber */}
                    {scrubPt && (
                        <>
                            <line x1={scrubPt.x} y1="0" x2={scrubPt.x} y2={chartData.H}
                                stroke="var(--color-text)" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />
                            <circle cx={scrubPt.x} cy={scrubPt.y} r="5" fill={scrubPt.phaseColor} opacity="0.15" />
                            <circle cx={scrubPt.x} cy={scrubPt.y} r="3" fill="#fff" stroke={scrubPt.phaseColor} strokeWidth="1.5" />
                        </>
                    )}
                </svg>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 6px 0', pointerEvents: 'none' }}>
                    <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)' }}>{chartData.startLabel}</span>
                    <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)' }}>{chartData.endLabel}</span>
                </div>
            </div>

            {/* Phase legend */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '0.75rem' }}>
                {Object.entries(PHASE_COLORS).map(([phase, color]) => (
                    <div key={phase} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                        <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                            {t(`weight.phases.${phase}`)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ─── Symptom Cycle Comparison Card ───────────────────────

function SymptomCompareCard({ t, language }) {
    const { user, currentPhase } = useUser()

    const comparison = useMemo(() => {
        if (!user.symptomLogs || user.symptomLogs.length === 0) return null
        if (!user.periodStartDates || user.periodStartDates.length < 2) return null

        const starts = [...user.periodStartDates].sort()
        const currentCycleStart = starts[starts.length - 1]
        const prevCycleStart = starts[starts.length - 2]

        const effectiveCycleLen = user.cycleStats?.learnedCycleLength || user.cycleLength || 28

        // Get phase date range for current cycle
        function getPhaseDates(cycleStart, phase, cycleLen, periodLen = 5) {
            const start = parseLocalDate(cycleStart)
            const phaseRanges = {
                menstrual: [0, periodLen - 1],
                follicular: [periodLen, Math.floor(cycleLen * 0.43)],
                ovulatory: [Math.floor(cycleLen * 0.43), Math.floor(cycleLen * 0.57)],
                luteal: [Math.floor(cycleLen * 0.57), cycleLen - 1]
            }
            const [from, to] = phaseRanges[phase] || [0, 7]
            const dates = []
            for (let i = from; i <= to; i++) {
                const d = new Date(start)
                d.setDate(start.getDate() + i)
                dates.push(getLocalDateStr(d))
            }
            return dates
        }

        const currentPhaseDates = getPhaseDates(currentCycleStart, currentPhase, effectiveCycleLen, user.periodLength)
        const prevPhaseDates = getPhaseDates(prevCycleStart, currentPhase, effectiveCycleLen, user.periodLength)

        const logs = user.symptomLogs

        const currentSymptoms = new Set()
        const prevSymptoms = new Set()

        for (const log of logs) {
            if (currentPhaseDates.includes(log.date)) {
                log.symptoms?.forEach(s => currentSymptoms.add(s))
            }
            if (prevPhaseDates.includes(log.date)) {
                log.symptoms?.forEach(s => prevSymptoms.add(s))
            }
        }

        const shared = [...currentSymptoms].filter(s => prevSymptoms.has(s))
        const newSymptoms = [...currentSymptoms].filter(s => !prevSymptoms.has(s))
        const resolved = [...prevSymptoms].filter(s => !currentSymptoms.has(s))

        return {
            current: [...currentSymptoms],
            prev: [...prevSymptoms],
            shared,
            newSymptoms,
            resolved,
            hasPrevData: prevSymptoms.size > 0,
            hasCurrentData: currentSymptoms.size > 0
        }
    }, [user.symptomLogs, user.periodStartDates, currentPhase, user.cycleLength, user.periodLength])

    const phaseColor = PHASE_COLORS[currentPhase] || 'var(--color-primary)'

    return (
        <div style={cardStyle}>
            <h3 style={cardTitleStyle}>{t('progress.symptom_title')}</h3>

            {!comparison || (!comparison.hasCurrentData && !comparison.hasPrevData) ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
                    {t('progress.no_symptoms')}
                </p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Current phase symptoms */}
                    {comparison.current.length > 0 && (
                        <div>
                            <div style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: phaseColor, marginBottom: '0.5rem' }}>
                                {t('progress.this_cycle')}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {comparison.current.map(s => (
                                    <span key={s} style={{
                                        padding: '4px 10px', borderRadius: '20px',
                                        background: `${phaseColor}15`,
                                        border: `1px solid ${phaseColor}30`,
                                        fontSize: '0.78rem', color: 'var(--color-text)', fontWeight: '500'
                                    }}>
                                        {t(`checkin.symptoms.${s}`)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Previous cycle comparison */}
                    {comparison.hasPrevData && (
                        <div style={{ padding: '0.75rem', background: 'var(--color-bg)', borderRadius: '12px' }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                                {t('progress.prev_cycle')}
                            </div>

                            {comparison.resolved.length > 0 && (
                                <div style={{ marginBottom: '0.4rem' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#a3b899', fontWeight: '600' }}>✓ {t('progress.resolved')}: </span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                        {comparison.resolved.map(s => t(`checkin.symptoms.${s}`)).join(', ')}
                                    </span>
                                </div>
                            )}

                            {comparison.shared.length > 0 && (
                                <div style={{ marginBottom: '0.4rem' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#f5a89c', fontWeight: '600' }}>↺ {t('progress.recurring')}: </span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                        {comparison.shared.map(s => t(`checkin.symptoms.${s}`)).join(', ')}
                                    </span>
                                </div>
                            )}

                            {comparison.newSymptoms.length > 0 && (
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: '#a86473', fontWeight: '600' }}>+ {t('progress.new_this_cycle')}: </span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                        {comparison.newSymptoms.map(s => t(`checkin.symptoms.${s}`)).join(', ')}
                                    </span>
                                </div>
                            )}

                            {comparison.resolved.length === 0 && comparison.shared.length === 0 && comparison.newSymptoms.length === 0 && (
                                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0 }}>
                                    {t('progress.no_prev_symptoms_in_phase')}
                                </p>
                            )}
                        </div>
                    )}

                    {!comparison.hasPrevData && (
                        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                            {t('progress.more_cycles_needed')}
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}

// ─── Card Styles ──────────────────────────────────────────

const cardStyle = {
    background: '#fff',
    borderRadius: '20px',
    padding: '1.5rem',
    border: '1px solid var(--color-border)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
    marginBottom: '1rem'
}

const cardTitleStyle = {
    fontSize: '1rem',
    fontWeight: '700',
    margin: '0 0 0 0',
    color: 'var(--color-text)'
}

// ─── Main Page ────────────────────────────────────────────

export default function Progress({ onClose }) {
    const { t, language } = useLanguage()
    const { currentPhase } = useUser()
    const phaseColor = PHASE_COLORS[currentPhase] || 'var(--color-primary)'

    return (
        <div style={{ minHeight: '100vh', background: '#FAFAFA', paddingBottom: '120px' }}>

            {/* Header */}
            <div style={{
                background: '#fff',
                padding: '1rem 1.5rem 0.75rem',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        background: 'none', border: 'none',
                        fontSize: '1rem', color: 'var(--color-text-muted)',
                        cursor: 'pointer', padding: '0.25rem',
                        display: 'flex', alignItems: 'center', gap: '4px'
                    }}
                >
                    ← {t('common.back')}
                </button>
                <h1 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0, flex: 1, textAlign: 'center' }}>
                    {t('progress.title')}
                </h1>
                {/* Spacer to center title */}
                <div style={{ width: '60px' }} />
            </div>

            {/* Phase indicator */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.6rem 1.5rem',
                background: `${phaseColor}10`
            }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: phaseColor }} />
                <span style={{ fontSize: '0.78rem', color: phaseColor, fontWeight: '600' }}>
                    {t('progress.current_phase')}: {t(`profile.phases.${currentPhase}`)}
                </span>
            </div>

            <div style={{ padding: '1.25rem 1.25rem 0' }}>
                <MacroWeekCard t={t} language={language} />
                <WeightTrendCard t={t} language={language} />
                <SymptomCompareCard t={t} language={language} />
            </div>
        </div>
    )
}
