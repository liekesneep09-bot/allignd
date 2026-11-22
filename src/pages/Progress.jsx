import React, { useMemo, useState } from 'react'
import { useUser } from '../context/UserContext'
import { useLanguage } from '../context/LanguageContext'
import { getLocalDateStr } from '../utils/date'
import { toNum } from '../utils/numbers'
import { getCyclePrediction } from '../logic/cycle'
import WeightTracker from '../components/WeightTracker'
import { SYMPTOMS_LIST, SYMPTOM_GROUPS, SymptomIcon } from '../components/CheckInModal'
import { PHASE_COLORS, PHASE_TEXT_COLORS, withAlpha } from '../logic/calendar-marks'
import {
    PHASE_ORDER,
    getPhaseSegments,
    getCycleStarts,
    getCycleLengths,
    foodByPhase,
    symptomsByPhase,
    symptomsInPhaseOfCycle,
    daysBetween
} from '../logic/insights'

// ─── Shared styles ────────────────────────────────────────

const INK = '#333333'

const cardStyle = {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    padding: '1.25rem',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--color-border-light)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
}

const cardTitleStyle = {
    margin: 0,
    fontSize: 'var(--font-size-base)',
    fontWeight: '700',
    color: INK
}

const mutedStyle = {
    margin: 0,
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-muted)',
    lineHeight: 1.5
}

function EmptyText({ children }) {
    return <p style={{ ...mutedStyle, textAlign: 'center', padding: '0.75rem 0' }}>{children}</p>
}

function useCycleBasics() {
    const { user } = useUser()
    return useMemo(() => {
        const cycleLength = user?.cycleStats?.learnedCycleLength || user?.cycleLength || 28
        const periodLength = user?.bleedingLengthDays || user?.periodLength || 5
        const starts = getCycleStarts(user?.periodStartDates, user?.cycleStart)
        return { cycleLength, periodLength, starts }
    }, [user?.cycleStats, user?.cycleLength, user?.bleedingLengthDays, user?.periodLength, user?.periodStartDates, user?.cycleStart])
}

function symptomLabel(t, id) {
    return t(`checkin.symptoms.${id}`, { defaultValue: SYMPTOMS_LIST.find(s => s.id === id)?.label || id })
}

function SymptomChip({ id, label, count }) {
    const def = SYMPTOMS_LIST.find(s => s.id === id)
    const tint = SYMPTOM_GROUPS.find(g => g.id === def?.category)?.tint || 'var(--color-bg)'
    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px 4px 4px',
            background: tint,
            color: INK,
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: '600'
        }}>
            <span style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'scale(0.85)' }}>
                <SymptomIcon id={id} />
            </span>
            {label}
            {count != null && <span style={{ fontWeight: '500', color: 'var(--color-text-muted)' }}>· {count}</span>}
        </span>
    )
}

// ─── Deze cyclus: where you are now ───────────────────────

function CycleNowCard({ t, language }) {
    const { user, getPhaseForDate } = useUser()
    const { cycleLength, periodLength, starts } = useCycleBasics()
    const today = getLocalDateStr(new Date())
    const { phase, day } = getPhaseForDate(today)
    const segments = getPhaseSegments(cycleLength, periodLength)
    const phaseOf = (i) => (segments.find(s => i >= s.start && i < s.end) || segments[segments.length - 1]).phase

    const prediction = getCyclePrediction(user?.cycleStart, cycleLength)
    const margin = Math.max(1, Math.ceil(user?.cycleStats?.variability || 0))
    const completedCycles = getCycleLengths(starts).length
    const locale = language === 'nl' ? 'nl-NL' : 'en-US'

    return (
        <section style={cardStyle}>
            <h2 style={cardTitleStyle}>{t('progress.your_cycle', { defaultValue: 'Jouw cyclus' })}</h2>

            <div aria-hidden="true" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                {Array.from({ length: cycleLength }, (_, i) => {
                    const isToday = i + 1 === Math.min(day, cycleLength)
                    const isPast = i + 1 < day
                    const color = PHASE_COLORS[phaseOf(i)]
                    return (
                        <span key={i} style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                            <span style={{
                                width: isToday ? '14px' : '8px',
                                height: isToday ? '14px' : '8px',
                                borderRadius: 'var(--radius-full)',
                                background: isToday ? '#ffffff' : color,
                                border: isToday ? `3px solid ${color}` : 'none',
                                boxSizing: 'border-box',
                                opacity: isPast || isToday ? 1 : 0.35,
                                flexShrink: 0
                            }} />
                        </span>
                    )
                })}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span style={{ width: 9, height: 9, borderRadius: 'var(--radius-full)', background: PHASE_COLORS[phase] }} />
                    <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: '800', color: PHASE_TEXT_COLORS[phase] }}>
                        {t(`profile.phases.${phase}`)}
                    </span>
                    <span style={{ fontSize: 'var(--font-size-base)', fontWeight: '500', color: INK }}>
                        · {t('cycle_status.day_x').replace('{current}', day).toLocaleLowerCase(locale)}
                    </span>
                </div>
                {prediction && (
                    <p style={{ margin: 0, fontSize: 'var(--font-size-base)', color: INK }}>
                        {t('progress.next_period', { defaultValue: 'Volgende menstruatie rond' })}{' '}
                        <b>{prediction.date.toLocaleDateString(locale, { day: 'numeric', month: 'long' })}</b>
                    </p>
                )}
                <p style={mutedStyle}>
                    ± {margin} {margin === 1 ? t('progress.day_one', { defaultValue: 'dag' }) : t('progress.day_other', { defaultValue: 'dagen' })}
                    {' · '}
                    {completedCycles > 0
                        ? t('progress.based_on_cycles', { defaultValue: 'gebaseerd op {n} cycli' }).replace('{n}', completedCycles)
                        : t('progress.based_on_settings', { defaultValue: 'gebaseerd op je instellingen' })}
                </p>
            </div>
        </section>
    )
}

function FeelingThisPhaseCard({ t }) {
    const { user, getPhaseForDate } = useUser()
    const { cycleLength, periodLength, starts } = useCycleBasics()
    const { phase } = getPhaseForDate(getLocalDateStr(new Date()))

    const { current, alsoLastCycle } = useMemo(() => {
        const logs = user?.symptomLogs || []
        if (starts.length === 0) return { current: [], alsoLastCycle: [] }
        const currentStart = starts[starts.length - 1]
        const prevStart = starts[starts.length - 2]
        const current = symptomsInPhaseOfCycle(logs, currentStart, null, phase, cycleLength, periodLength)
        const previous = prevStart
            ? symptomsInPhaseOfCycle(logs, prevStart, currentStart, phase, daysBetween(prevStart, currentStart), periodLength)
            : []
        const previousIds = new Set(previous.map(p => p.id))
        return { current, alsoLastCycle: current.filter(c => previousIds.has(c.id)).map(c => c.id) }
    }, [user?.symptomLogs, starts, phase, cycleLength, periodLength])

    const phaseName = t(`profile.phases.${phase}`).toLocaleLowerCase()

    return (
        <section style={cardStyle}>
            <div>
                <h2 style={cardTitleStyle}>{t('progress.feeling_this_phase', { defaultValue: 'Jouw gevoel deze fase' })}</h2>
                <p style={mutedStyle}>{t('progress.feeling_this_phase_sub', { defaultValue: 'Wat je logde in je {phase}' }).replace('{phase}', phaseName)}</p>
            </div>
            {current.length === 0 ? (
                <EmptyText>{t('progress.feeling_empty', { defaultValue: 'Log hoe je je voelt via Gevoel op Vandaag. Na een paar dagen zie je hier je patroon.' })}</EmptyText>
            ) : (
                <>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                        {current.slice(0, 6).map(s => (
                            <SymptomChip key={s.id} id={s.id} label={symptomLabel(t, s.id)} count={s.days} />
                        ))}
                    </div>
                    {alsoLastCycle.length > 0 && (
                        <p style={{ ...mutedStyle, color: INK }}>
                            {t('progress.also_last_cycle', { defaultValue: 'Ook vorige cyclus in deze fase:' })}{' '}
                            <b>{alsoLastCycle.map(id => symptomLabel(t, id)).join(', ')}</b>
                        </p>
                    )}
                </>
            )}
        </section>
    )
}

function NutritionWeekCard({ t }) {
    const { user, targets } = useUser()

    const week = useMemo(() => {
        const days = []
        for (let i = 6; i >= 0; i--) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            days.push(getLocalDateStr(d))
        }
        const totals = { kcal: 0, p: 0, c: 0, f: 0, fiber: 0 }
        let daysWithLogs = 0
        for (const dateStr of days) {
            const dayLogs = (user?.foodLogs || []).filter(l => l.date === dateStr)
            if (dayLogs.length === 0) continue
            daysWithLogs++
            for (const l of dayLogs) {
                totals.kcal += toNum(l.kcal)
                totals.p += toNum(l.p ?? l.protein)
                totals.c += toNum(l.c ?? l.carbs)
                totals.f += toNum(l.f ?? l.fat)
                totals.fiber += toNum(l.fiber)
            }
        }
        if (daysWithLogs === 0) return null
        const avg = (v) => Math.round(v / daysWithLogs)
        return { kcal: avg(totals.kcal), p: avg(totals.p), c: avg(totals.c), f: avg(totals.f), fiber: avg(totals.fiber), daysWithLogs }
    }, [user?.foodLogs])

    const goalKcal = toNum(targets?.calories) || 2000
    const rows = week ? [
        { label: t('today.proteins'), avg: week.p, goal: toNum(targets?.proteinMin) },
        { label: t('today.carbs'), avg: week.c, goal: toNum(targets?.carbsMin) },
        { label: t('today.fats'), avg: week.f, goal: toNum(targets?.fatMin) },
        { label: t('today.fiber'), avg: week.fiber, goal: 25 }
    ] : []

    return (
        <section style={cardStyle}>
            <div>
                <h2 style={cardTitleStyle}>{t('progress.nutrition_week', { defaultValue: 'Voeding deze week' })}</h2>
                {week && <p style={mutedStyle}>{t('progress.avg_per_day', { defaultValue: 'Gemiddeld per dag · {n} dagen gelogd' }).replace('{n}', week.daysWithLogs)}</p>}
            </div>
            {!week ? (
                <EmptyText>{t('progress.no_food_logs')}</EmptyText>
            ) : (
                <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: '800', color: INK, lineHeight: 1 }}>
                            {week.kcal.toLocaleString('nl-NL')} <span style={{ fontSize: 'var(--font-size-base)', fontWeight: '500', color: 'var(--color-text-muted)' }}>/ {goalKcal.toLocaleString('nl-NL')} kcal</span>
                        </div>
                        <div style={{ height: '6px', borderRadius: 'var(--radius-full)', background: 'var(--color-border-light)', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(100, Math.round(week.kcal / goalKcal * 100))}%`, height: '100%', borderRadius: 'var(--radius-full)', background: 'var(--color-primary)' }} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.9rem 1.25rem' }}>
                        {rows.map(r => (
                            <div key={r.label} style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0 }}>
                                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{r.label}</span>
                                <span style={{ fontSize: 'var(--font-size-base)', fontWeight: '700', color: INK }}>
                                    {r.avg} <span style={{ fontWeight: '500', color: 'var(--color-text-muted)' }}>/ {r.goal} g</span>
                                </span>
                                <div style={{ height: '4px', borderRadius: 'var(--radius-full)', background: 'var(--color-border-light)', overflow: 'hidden' }}>
                                    <div style={{ width: `${Math.min(100, Math.round(r.avg / (r.goal || 1) * 100))}%`, height: '100%', background: INK }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </section>
    )
}

// ─── Trends: patterns across cycles ───────────────────────

const NORMAL_MIN = 21
const NORMAL_MAX = 35
const CHART_MIN = 15
const CHART_MAX = 40

function CycleLengthCard({ t, language }) {
    const { starts } = useCycleBasics()
    const cycles = getCycleLengths(starts).slice(-6)
    const locale = language === 'nl' ? 'nl-NL' : 'en-US'
    const toPct = (v) => ((Math.min(CHART_MAX, Math.max(CHART_MIN, v)) - CHART_MIN) / (CHART_MAX - CHART_MIN)) * 100
    const average = cycles.length ? Math.round(cycles.reduce((s, c) => s + c.length, 0) / cycles.length) : null
    const outside = cycles.filter(c => c.length < NORMAL_MIN || c.length > NORMAL_MAX).length

    return (
        <section style={cardStyle}>
            <h2 style={cardTitleStyle}>{t('progress.cycle_length', { defaultValue: 'Cycluslengte' })}</h2>
            {cycles.length === 0 ? (
                <EmptyText>{t('progress.cycle_length_empty', { defaultValue: 'Na je volgende menstruatie zie je hier hoe lang je cycli duren.' })}</EmptyText>
            ) : (
                <>
                    <p style={{ margin: 0, fontSize: 'var(--font-size-base)', color: INK, lineHeight: 1.5 }}>
                        {t('progress.cycle_avg', { defaultValue: 'Je cycli duren gemiddeld {n} dagen.' }).replace('{n}', average)}{' '}
                        {outside === 0
                            ? t('progress.cycle_all_normal', { defaultValue: 'Allemaal binnen het normale bereik.' })
                            : t('progress.cycle_some_outside', { defaultValue: '{n} buiten het normale bereik. Blijft dat zo, bespreek het dan met je huisarts.' }).replace('{n}', outside)}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <div role="img" aria-label={cycles.map(c => `${c.length}`).join(', ')} style={{ position: 'relative', flex: 1, height: '132px' }}>
                            <div style={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                bottom: `${toPct(NORMAL_MIN)}%`,
                                height: `${toPct(NORMAL_MAX) - toPct(NORMAL_MIN)}%`,
                                background: withAlpha('var(--phase-luteal)', 0.1),
                                borderTop: '1px dashed var(--phase-luteal)',
                                borderBottom: '1px dashed var(--phase-luteal)'
                            }} />
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', gap: '10px', padding: '0 4px' }}>
                                {cycles.map(c => (
                                    <div key={c.start} style={{ flex: 1, height: `${toPct(c.length)}%`, background: 'var(--color-primary)', borderRadius: '6px 6px 2px 2px', position: 'relative' }}>
                                        <span style={{ position: 'absolute', top: '-20px', left: 0, right: 0, textAlign: 'center', fontSize: 'var(--font-size-xs)', fontWeight: '700', color: INK }}>{c.length}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ position: 'relative', width: '22px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                            <span style={{ position: 'absolute', right: 0, bottom: `calc(${toPct(NORMAL_MAX)}% - 7px)` }}>{NORMAL_MAX}</span>
                            <span style={{ position: 'absolute', right: 0, bottom: `calc(${toPct(NORMAL_MIN)}% - 7px)` }}>{NORMAL_MIN}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', padding: '0 30px 0 4px', marginTop: '-0.5rem' }}>
                        {cycles.map(c => (
                            <span key={c.start} style={{ flex: 1, textAlign: 'center', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                                {new Date(`${c.start}T12:00:00`).toLocaleDateString(locale, { month: 'short' }).replace('.', '')}
                            </span>
                        ))}
                    </div>
                    <p style={{ ...mutedStyle, fontSize: 'var(--font-size-xs)' }}>
                        {t('progress.normal_range', { defaultValue: 'Gestreept vlak: normaal bereik van 21 tot 35 dagen' })}
                    </p>
                </>
            )}
        </section>
    )
}

function FoodPerPhaseCard({ t }) {
    const { user } = useUser()
    const { cycleLength, periodLength, starts } = useCycleBasics()
    const rows = useMemo(() => foodByPhase(user?.foodLogs, starts, cycleLength, periodLength), [user?.foodLogs, starts, cycleLength, periodLength])
    const withData = rows.filter(r => r.days > 0)
    const maxKcal = Math.max(1, ...withData.map(r => r.avgKcal))
    const totalDays = rows.reduce((s, r) => s + r.days, 0)
    const lut = rows.find(r => r.phase === 'luteal')
    const fol = rows.find(r => r.phase === 'follicular')

    let insight = null
    if (lut?.days && fol?.days) {
        const diff = lut.avgKcal - fol.avgKcal
        if (diff >= 100) insight = t('progress.food_more_luteal', { defaultValue: 'In je luteale fase eet je gemiddeld {n} kcal meer dan in je folliculaire fase. Dat is normaal: je lichaam verbruikt dan iets meer.' }).replace('{n}', diff)
        else if (diff <= -100) insight = t('progress.food_less_luteal', { defaultValue: 'In je luteale fase eet je gemiddeld {n} kcal minder dan in je folliculaire fase.' }).replace('{n}', -diff)
        else insight = t('progress.food_even', { defaultValue: 'Je eet in je folliculaire en luteale fase ongeveer even veel.' })
    }

    return (
        <section style={cardStyle}>
            <div>
                <h2 style={cardTitleStyle}>{t('progress.food_per_phase', { defaultValue: 'Eten per fase' })}</h2>
                {totalDays > 0 && <p style={mutedStyle}>{t('progress.food_per_phase_sub', { defaultValue: 'Gemiddeld per dag · {n} dagen gelogd' }).replace('{n}', totalDays)}</p>}
            </div>
            {withData.length === 0 ? (
                <EmptyText>{t('progress.no_food_logs')}</EmptyText>
            ) : (
                <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        {rows.map(r => (
                            <div key={r.phase} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: 'var(--font-size-sm)', fontWeight: '600', color: INK }}>
                                        <span style={{ width: 8, height: 8, borderRadius: 'var(--radius-full)', background: PHASE_COLORS[r.phase] }} />
                                        {t(`profile.phases.${r.phase}`)}
                                    </span>
                                    <span style={{ fontSize: 'var(--font-size-sm)', color: r.days ? INK : 'var(--color-text-muted)', fontWeight: r.days ? '700' : '400' }}>
                                        {r.days
                                            ? <>{r.avgKcal.toLocaleString('nl-NL')} kcal <span style={{ fontWeight: '500', color: 'var(--color-text-muted)' }}>· {r.avgProtein} g {t('today.proteins').toLocaleLowerCase()}</span></>
                                            : t('progress.no_data_yet', { defaultValue: 'nog geen data' })}
                                    </span>
                                </div>
                                <div style={{ height: '8px', borderRadius: 'var(--radius-full)', background: 'var(--color-border-light)', overflow: 'hidden' }}>
                                    <div style={{ width: `${r.days ? Math.round(r.avgKcal / maxKcal * 100) : 0}%`, height: '100%', borderRadius: 'var(--radius-full)', background: PHASE_COLORS[r.phase] }} />
                                </div>
                            </div>
                        ))}
                    </div>
                    {insight && (
                        <div style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: '0.75rem 0.9rem', fontSize: 'var(--font-size-sm)', lineHeight: 1.5, color: INK }}>
                            {insight}
                        </div>
                    )}
                </>
            )}
        </section>
    )
}

function SymptomsPerPhaseCard({ t }) {
    const { user } = useUser()
    const { cycleLength, periodLength, starts } = useCycleBasics()
    const { daysPerPhase, rows } = useMemo(
        () => symptomsByPhase(user?.symptomLogs, starts, cycleLength, periodLength),
        [user?.symptomLogs, starts, cycleLength, periodLength]
    )
    const top = rows.filter(r => SYMPTOMS_LIST.some(s => s.id === r.id)).slice(0, 6)
    const shortNames = {
        menstrual: t('progress.short_menstrual', { defaultValue: 'Menstr.' }),
        follicular: t('progress.short_follicular', { defaultValue: 'Foll.' }),
        ovulatory: t('progress.short_ovulatory', { defaultValue: 'Ovul.' }),
        luteal: t('progress.short_luteal', { defaultValue: 'Lut.' })
    }

    return (
        <section style={cardStyle}>
            <div>
                <h2 style={cardTitleStyle}>{t('progress.symptom_title')}</h2>
                <p style={mutedStyle}>{t('progress.symptoms_heat_sub', { defaultValue: 'Hoe vaker je het logde in een fase, hoe donkerder het vakje' })}</p>
            </div>
            {top.length === 0 ? (
                <EmptyText>{t('progress.no_symptoms')}</EmptyText>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) repeat(4, minmax(0, 1fr))', gap: '6px', alignItems: 'center' }}>
                    <span />
                    {PHASE_ORDER.map(p => (
                        <span key={p} style={{ textAlign: 'center', fontSize: '11px', fontWeight: '700', color: PHASE_TEXT_COLORS[p] }}>{shortNames[p]}</span>
                    ))}
                    {top.map(row => (
                        <React.Fragment key={row.id}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, fontSize: 'var(--font-size-sm)', fontWeight: '600', color: INK }}>
                                <span style={{ flexShrink: 0, transform: 'scale(0.8)', display: 'flex' }}><SymptomIcon id={row.id} /></span>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{symptomLabel(t, row.id)}</span>
                            </span>
                            {PHASE_ORDER.map(p => {
                                const ratio = daysPerPhase[p] ? row.perPhase[p] / daysPerPhase[p] : 0
                                return (
                                    <span
                                        key={p}
                                        title={`${row.perPhase[p]} / ${daysPerPhase[p]}`}
                                        style={{
                                            height: '26px',
                                            borderRadius: '8px',
                                            background: ratio > 0 ? withAlpha(PHASE_COLORS[p], 0.15 + ratio * 0.75) : 'var(--color-border-light)'
                                        }}
                                    />
                                )
                            })}
                        </React.Fragment>
                    ))}
                </div>
            )}
        </section>
    )
}

// ─── Main Page ────────────────────────────────────────────

export default function Progress({ onClose }) {
    const { t, language } = useLanguage()
    const [tab, setTab] = useState('cycle')
    const tabs = [
        { id: 'cycle', label: t('progress.tab_cycle', { defaultValue: 'Deze cyclus' }) },
        { id: 'trends', label: t('progress.tab_trends', { defaultValue: 'Trends' }) }
    ]

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)', paddingBottom: '120px' }}>
            <div className="container" style={{ paddingTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={t('common.back')}
                        style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: 'var(--radius-md)',
                            border: 'none',
                            background: 'var(--color-surface)',
                            boxShadow: 'var(--shadow-sm)',
                            color: INK,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
                    </button>
                    <h1 style={{ margin: 0, fontSize: 'var(--font-size-2xl)', fontWeight: '800', color: INK, letterSpacing: '-0.02em' }}>
                        {t('progress.title_short', { defaultValue: 'Inzichten' })}
                    </h1>
                </div>

                {/* Tabs */}
                <div role="tablist" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', background: 'var(--color-surface)', borderRadius: 'var(--radius-full)', padding: '4px', boxShadow: 'var(--shadow-sm)' }}>
                    {tabs.map(tb => (
                        <button
                            key={tb.id}
                            type="button"
                            role="tab"
                            aria-selected={tab === tb.id}
                            onClick={() => setTab(tb.id)}
                            style={{
                                minHeight: '40px',
                                border: 'none',
                                borderRadius: 'var(--radius-full)',
                                background: tab === tb.id ? 'var(--color-primary)' : 'transparent',
                                color: tab === tb.id ? '#ffffff' : INK,
                                fontFamily: 'inherit',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'background 0.2s ease'
                            }}
                        >
                            {tb.label}
                        </button>
                    ))}
                </div>

                {tab === 'cycle' ? (
                    <>
                        <CycleNowCard t={t} language={language} />
                        <FeelingThisPhaseCard t={t} />
                        <NutritionWeekCard t={t} />
                    </>
                ) : (
                    <>
                        <CycleLengthCard t={t} language={language} />
                        <FoodPerPhaseCard t={t} />
                        <SymptomsPerPhaseCard t={t} />
                        <WeightTracker date={getLocalDateStr(new Date())} />
                    </>
                )}
            </div>
        </div>
    )
}
