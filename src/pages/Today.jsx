
import React, { useState } from 'react'
import { useUser } from '../context/UserContext'
import { getCycleDisplayData } from '../logic/cycle' // NEW IMPORT
import { PHASE_CONTENT } from '../data/phases'
import { IconMap, IconAccount, IconCalendar, IconChevronDown } from '../components/Icons'
import FoodModal from '../components/FoodModal'
import PeriodCalendar from '../components/PeriodCalendar'
import { toNum, calculateProgress } from '../utils/numbers'

import { getLocalDateStr } from '../utils/date'

export default function Today({ onNavigate }) {
  const { user, currentPhase: realCurrentPhase, currentDay: realCurrentDay, targets, logFood, getStatsForDate, deleteFoodLog, logMenstruation, getCyclePredictions, confirmPeriodToday, endPeriodToday, isPeriodOverridden, getPhaseForDate, logMovement, resetOnboarding, isLoading } = useUser()

  // VIEW DATE STATE
  const [viewDate, setViewDate] = useState(new Date())
  const viewDateStr = getLocalDateStr(viewDate)
  const todayDateStr = getLocalDateStr(new Date())
  const isToday = viewDateStr === todayDateStr

  // Derive Data for View Date
  const { phase: viewPhase, displayDay, overdueDays } = getCycleDisplayData(
    user.cycleStart,
    user.cycleLength,
    user.periodLength || 5,
    user.isMenstruatingNow
  )

  const content = PHASE_CONTENT[viewPhase]
  const stats = getStatsForDate(viewDateStr)
  const todaysLogs = user.foodLogs?.filter(l => l.date === viewDateStr) || []

  // Check-in Logic (Only for Today)
  const showCheckIn = isToday && user.lastCheckInDate !== todayDateStr

  // Movement Logic
  const savedMovement = user.movementLogs?.find(l => l.date === viewDateStr)
  const showMovementLog = !savedMovement

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [showLog, setShowLog] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false) // NEW
  const [isCycleExpanded, setIsCycleExpanded] = useState(false)

  // Training Actions
  const trainingActions = content.training.types

  // EMPTY STATE
  if (isLoading) {
    return (
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '120px' }}>
        <div style={{ height: '30px', width: '150px', background: 'var(--color-surface)', borderRadius: '8px', marginBottom: '2rem', margin: '0 auto' }}></div>
        <div style={{ height: '180px', background: 'var(--color-surface)', borderRadius: '24px', marginBottom: '1.5rem' }}></div>
        <div style={{ height: '120px', background: 'var(--color-surface)', borderRadius: '20px' }}></div>
      </div>
    )
  }

  if (!targets || !targets.calories) {
    return (
      <div className="container" style={{ paddingTop: '4rem', textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Start je afstemming</h2>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>We hebben je persoonlijke doelen nog niet berekend.</p>
        <button
          className="btn btn-primary"
          onClick={async () => { await resetOnboarding(); window.location.reload(); }}
          style={{ minWidth: '200px' }}
        >
          Start Onboarding
        </button>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingBottom: '120px', maxWidth: '100%', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>

      {/* 1. HERO HEADER */}
      <header style={{ marginBottom: '2.5rem', paddingTop: '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <button onClick={() => onNavigate && onNavigate('profile')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--color-text)' }}>
            <IconAccount />
          </button>

          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '1rem', fontWeight: '600', margin: 0, textTransform: 'capitalize' }}>
              {viewDate.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })}
            </h1>
          </div>

          <button onClick={() => setShowCalendar(true)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--color-text)', opacity: 0.8 }}>
            <IconCalendar />
          </button>
        </div>

        <DayStrip selectedDate={viewDate} onSelect={setViewDate} />

        {showCalendar && (
          <PeriodCalendar
            user={user}
            onClose={() => setShowCalendar(false)}
            onSelect={(date) => { setViewDate(date); setShowCalendar(false) }}
          />
        )}

        {/* Hero Content */}
        <div style={{ marginTop: '2.5rem', textAlign: 'center', padding: '0 1rem' }}>
          <div style={{ fontSize: '2rem', color: 'var(--color-text)', fontWeight: '700', marginBottom: '0.25rem', lineHeight: 1.2 }}>
            {content.name}
          </div>

          <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1rem', fontStyle: 'italic', opacity: 0.8 }}>
            Iedere cyclus en ieder lichaam is anders. Als dit niet herkenbaar is, is dat normaal.
          </div>

          {!user.cycleStart && !user.isMenstruatingNow && (
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text)', marginBottom: '1.5rem', background: 'var(--color-surface)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--color-border)', display: 'inline-flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left' }}>
              <span>We hebben je laatste menstruatie nodig om je fase te berekenen.</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => logMenstruation(new Date().toISOString())} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', borderRadius: '8px' }}>Begon vandaag</button>
                <button onClick={() => setShowDatePicker(true)} style={{ background: 'var(--color-surface)', color: 'var(--color-primary)', border: '1px solid var(--color-border)', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}>Kies datum</button>
              </div>
            </div>
          )}

          <div onClick={() => setIsCycleExpanded(!isCycleExpanded)} style={{ cursor: 'pointer', userSelect: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.03)', padding: '0.5rem 1rem', borderRadius: '20px', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--color-text-muted)' }}>Wat betekent deze fase?</span>
            <div style={{ color: 'var(--color-text-muted)', transform: isCycleExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', display: 'flex', alignItems: 'center' }}>
              <IconChevronDown size={14} />
            </div>
          </div>

          {showCheckIn && (
            <div className="fade-in" style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFF', padding: '0.75rem 1.25rem', borderRadius: '16px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-soft)' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Was je vandaag ongesteld?</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={(e) => { e.stopPropagation(); confirmPeriodToday() }} style={{ border: 'none', background: 'var(--color-primary)', color: '#FFF', padding: '0.4rem 0.9rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.85rem' }}>Ja</button>
                <button onClick={(e) => { e.stopPropagation(); endPeriodToday() }} style={{ border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text)', padding: '0.4rem 0.9rem', borderRadius: '8px', fontWeight: '500', fontSize: '0.85rem' }}>Nee</button>
              </div>
            </div>
          )}

          <div style={{ maxHeight: isCycleExpanded ? '600px' : '0', opacity: isCycleExpanded ? 1 : 0, overflow: 'hidden', transition: 'all 0.4s ease-in-out', marginTop: isCycleExpanded ? '1rem' : '0' }}>
            <PhaseInfoExpanded content={content} />
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>

        {/* 2. MOVEMENT (Green Tint) */}
        <section>
          <div style={{ background: 'rgba(112, 193, 163, 0.12)', borderRadius: '24px', padding: '2rem 1.5rem', marginBottom: '0.5rem', border: 'none' }}>
            <div style={{ marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.1rem', color: 'var(--color-primary)', margin: '0 0 0.5rem 0', fontWeight: '700' }}>{content.training.title || 'Beweging die je lichaam nu helpt'}</h2>
              <div style={{ fontSize: '1rem', color: 'var(--color-text)', fontWeight: '600' }}>{content.training.subtitle || content.training.goal}</div>
            </div>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--color-text)', opacity: 0.8, marginBottom: '1.5rem' }}>{content.training.description || content.training.why}</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {trainingActions.map(type => (
                <span key={type} className="chip-action" style={{ background: '#FFF' }}>{type}</span>
              ))}
            </div>
            {showMovementLog && (
              <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-text)', fontWeight: '500' }}>Heb je vandaag gesport?</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => logMovement(viewDateStr, 'moved')} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: '600', border: 'none', background: '#FFF', color: 'var(--color-primary)', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>Ja</button>
                  <button onClick={() => logMovement(viewDateStr, 'rest')} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: '500', border: '1px solid rgba(0,0,0,0.1)', background: 'transparent', color: 'var(--color-text)', borderRadius: '8px', cursor: 'pointer' }}>Nee / rustdag</button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 3. NUTRIENTS (Ivory/Grey Tint) */}
        {content.nutrients && content.nutrients.length > 0 && (
          <section>
            <div style={{ background: '#FAF9F6', borderRadius: '24px', padding: '2rem 1.5rem', border: 'none' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--color-text)', marginBottom: '1.5rem', lineHeight: '1.4' }}>Voedingsstoffen die je lichaam in deze fase kunnen ondersteunen</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {content.nutrients.map((nutrient, index) => (
                  <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--color-text)', letterSpacing: '-0.01em' }}>{nutrient.name}</span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>{nutrient.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 4. MACROS */}
        {(user.tracking !== 'none') && (
          <section>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Card 1: Calories */}
              <div style={{ background: '#FFF', borderRadius: '24px', padding: '1.5rem', color: 'var(--color-text)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-soft)', border: 'none' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>Dagdoel</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--color-text)', lineHeight: 1 }}>
                      {Math.round(toNum(stats.kcal))} <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontWeight: '500' }}>/ {toNum(targets.calories)} kcal</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-calories)', marginTop: '0.25rem' }}>
                    {Math.round(calculateProgress(stats.kcal, targets.calories) * 100)}% van dagdoel
                  </div>
                </div>
                <div style={{ padding: '4px' }}>
                  <CircularProgress current={toNum(stats.kcal)} target={toNum(targets.calories)} size={100} strokeWidth={8} color="var(--color-calories)" trackColor="rgba(0,0,0,0.05)" showText={true} />
                </div>
              </div>

              {/* Card 2: Macros */}
              <div style={{ background: '#FFF', borderRadius: '24px', padding: '1.5rem', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <h2 style={{ fontSize: '0.95rem', margin: 0, fontWeight: '600', color: 'var(--color-text)' }}>Macro's</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <MacroListItem label="Koolhydraten" current={toNum(stats.c)} target={toNum(targets.carbsMin)} color="var(--color-carbs)" />
                  <MacroListItem label="Vetten" current={toNum(stats.f)} target={toNum(targets.fatMin)} color="var(--color-fat)" />
                  <MacroListItem label="Eiwitten" current={toNum(stats.p)} target={toNum(targets.proteinMin)} color="var(--color-protein)" />
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
              <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ width: '90%', boxShadow: 'var(--shadow-soft)', borderRadius: '100px', padding: '1rem' }}>+ Voeg eten toe</button>
            </div>

            {todaysLogs.length > 0 && (
              <div style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1rem', color: 'var(--color-text-muted)', margin: 0 }}>Vandaag gelogd</h3>
                  <button onClick={() => setShowLog(!showLog)} style={{ background: 'none', color: 'var(--color-primary)', fontSize: '0.9rem', fontWeight: '500' }}>{showLog ? 'Verberg items ↑' : 'Toon items ↓'}</button>
                </div>
                {showLog && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {todaysLogs.map(log => (
                      <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFF', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{log.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{log.grams}g • {log.kcal} kcal</div>
                        </div>
                        <button onClick={() => deleteFoodLog(log.id)} style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', padding: '0.5rem' }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </div>

      {showModal && <FoodModal onClose={() => setShowModal(false)} onAdd={(foodId, grams) => { logFood(foodId, grams, viewDateStr); setShowModal(false) }} />}

      {showDatePicker && (
        <div className="modal-overlay" onClick={() => setShowDatePicker(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Wanneer begon je laatste menstruatie?</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Kies de eerste dag van je laatste menstruatie. We gebruiken dit om je cyclus te berekenen.</p>
            <form onSubmit={(e) => { e.preventDefault(); const dateVal = e.target.rootDate.value; if (dateVal) { logMenstruation(dateVal); setShowDatePicker(false) } }}>
              <input name="rootDate" type="date" defaultValue={todayDateStr} max={todayDateStr} style={{ width: '100%', padding: '1rem', fontSize: '1rem', borderRadius: '12px', border: '1px solid var(--color-border)', marginBottom: '1rem', fontFamily: 'inherit' }} />
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '0.5rem' }}>Opslaan</button>
            </form>
            <button onClick={() => setShowDatePicker(false)} className="btn-soft">Annuleren</button>
          </div>
        </div>
      )}

      <style>{`
        .chip-action { display: inline-flex; alignItems: center; padding: 0.5rem 1rem; background-color: var(--color-bg); border-radius: 20px; fontSize: 0.9rem; color: var(--color-text); fontWeight: 500; border: 1px solid transparent; cursor: default; }
        .btn-soft { background: var(--color-surface); color: var(--color-primary); border: 1px solid var(--color-border); border-radius: 12px; width: 100%; padding: 1rem; fontSize: 1rem; fontWeight: 500; cursor: pointer; transition: background 0.2s; }
        .btn-soft:hover { background: var(--color-bg); }
        .progress-ring-circle { transition: stroke-dashoffset 0.5s ease-in-out; transform: rotate(-90deg); transform-origin: 50% 50%; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; alignItems: flex-end; justifyContent: center; z-index: 1000; }
        @media(min-width: 480px) { .modal-overlay { alignItems: center; } }
        .modal-content { background: #FFFFFF; width: 100%; max-width: 480px; padding: 2rem; border-radius: 20px 20px 0 0; animation: slideUp 0.3s ease-out; }
        @media(min-width: 480px) { .modal-content { border-radius: 20px; width: 90%; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  )
}

// HELPER COMPONENTS
function CircularProgress({ current, target, size, strokeWidth, color = 'var(--color-calories)', trackColor = 'var(--color-border)', showText = false }) {
  const safeCurrent = toNum(current)
  const safeTarget = toNum(target)
  const radius = size / 2
  const normalizedRadius = radius - strokeWidth * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const progressFn = calculateProgress(safeCurrent, safeTarget)
  const percentage = Math.round(progressFn * 100)
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg height={size} width={size}>
        <circle stroke={trackColor} strokeWidth={strokeWidth} fill="transparent" r={normalizedRadius} cx={radius} cy={radius} />
        <circle className="progress-ring-circle" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" fill="transparent" r={normalizedRadius} cx={radius} cy={radius} style={{ strokeDasharray: circumference + ' ' + circumference, strokeDashoffset }} />
      </svg>
      {showText && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: '700', color: color, lineHeight: 1.1 }}>{current}</div>
          <div style={{ width: '40%', height: '1px', background: color, opacity: 0.3, margin: '2px 0' }}></div>
          <div style={{ fontSize: '0.7rem', color: color, opacity: 0.8 }}>{target}</div>
        </div>
      )}
    </div>
  )
}

function MacroListItem({ label, current, target, color }) {
  const safeCurrent = toNum(current)
  const safeTarget = toNum(target)
  const progressFn = calculateProgress(safeCurrent, safeTarget)
  const percentage = Math.round(progressFn * 100)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{label}</span>
        <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-text)' }}>{Math.round(safeCurrent)} / {target} g</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text)', minWidth: '35px' }}>{Math.round(percentage)}%</span>
        <div style={{ flex: 1, height: '6px', background: 'var(--color-bg)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ width: `${percentage}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.3s ease-out' }} />
        </div>
      </div>
    </div>
  )
}

function RecipeTeaser({ item, cat }) {
  return (
    <div style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>{cat === 'Ontbijt' ? '☕' : '🍲'}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.1rem' }}>{cat}</div>
        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '500' }}>{item.title}</h4>
      </div>
    </div>
  )
}

function DayStrip({ selectedDate, onSelect }) {
  const startOfWeek = new Date(selectedDate)
  const day = startOfWeek.getDay()
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff)

  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    days.push(d)
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', overflowX: 'auto' }}>
      {days.map((date, i) => {
        const isSelected = date.toDateString() === selectedDate.toDateString()
        const isToday = date.toDateString() === new Date().toDateString()
        return (
          <div key={i} onClick={() => onSelect(date)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', padding: '0.5rem', minWidth: '36px', borderRadius: '20px', background: isSelected ? 'var(--color-primary)' : 'transparent', color: isSelected ? '#fff' : 'var(--color-text)' }}>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: isSelected ? 1 : 0.6 }}>{date.toLocaleDateString('nl-NL', { weekday: 'narrow' })}</span>
            <span style={{ fontSize: '0.9rem', fontWeight: isSelected || isToday ? '700' : '400', position: 'relative' }}>
              {date.getDate()}
              {isToday && !isSelected && <div style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', borderRadius: '50%', background: 'var(--color-primary)' }} />}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function PhaseInfoExpanded({ content }) {
  const [showMore, setShowMore] = useState(false)
  const visibleBullets = content.bullets?.slice(0, 2) || []
  const hiddenBullets = content.bullets?.slice(2) || []
  const hasMoreBullets = hiddenBullets.length > 0

  return (
    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
      {content.validation && <p style={{ fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: '0.75rem', lineHeight: 1.5 }}>{content.validation}</p>}
      {content.explanation && <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>{content.explanation}</p>}
      <ul style={{ margin: '0 0 0.5rem 0', padding: 0, listStyle: 'none' }}>
        {visibleBullets.map((bullet, i) => (
          <li key={i} style={{ marginBottom: '0.5rem', color: 'var(--color-text)', fontSize: '0.9rem', lineHeight: 1.4, display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ display: 'block', width: '5px', height: '5px', borderRadius: '50%', background: 'var(--color-primary)', flexShrink: 0 }}></span>{bullet}
          </li>
        ))}
        {showMore && hiddenBullets.map((bullet, i) => (
          <li key={`extra-${i}`} style={{ marginBottom: '0.5rem', color: 'var(--color-text)', fontSize: '0.9rem', lineHeight: 1.4, display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ display: 'block', width: '5px', height: '5px', borderRadius: '50%', background: 'var(--color-primary)', flexShrink: 0 }}></span>{bullet}
          </li>
        ))}
      </ul>
      {hasMoreBullets && (
        <button onClick={(e) => { e.stopPropagation(); setShowMore(!showMore) }} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.85rem', cursor: 'pointer', padding: 0, marginBottom: '1rem' }}>
          {showMore ? 'Minder tonen' : 'Bekijk meer'}
        </button>
      )}
      {content.phaseClosing && (
        <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(212, 165, 165, 0.08)', borderRadius: '8px', borderLeft: '3px solid var(--color-primary)' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text)', margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>{content.phaseClosing}</p>
        </div>
      )}
    </div>
  )
}
