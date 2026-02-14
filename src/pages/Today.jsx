import React, { useState } from 'react'
import { useUser } from '../context/UserContext'
import { getCycleDisplayData } from '../logic/cycle'
import { PHASE_CONTENT } from '../data/phases'
import { IconMap, IconAccount, IconCalendar } from '../components/Icons'
import FoodModal from '../components/FoodModal'
import PeriodCalendar from '../components/PeriodCalendar'
import { toNum, calculateProgress } from '../utils/numbers'
import { getLocalDateStr } from '../utils/date'

// --- HELPER COMPONENTS ---

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
        <circle
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          className="progress-ring-circle"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          style={{ strokeDasharray: circumference + ' ' + circumference, strokeDashoffset }}
        />
      </svg>
      {showText && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ fontSize: '0.9rem', fontWeight: '700', color: color, lineHeight: 1.1 }}>
            {current}
          </div>
          <div style={{ width: '40%', height: '1px', background: color, opacity: 0.3, margin: '2px 0' }}></div>
          <div style={{ fontSize: '0.7rem', color: color, opacity: 0.8 }}>
            {target}
          </div>
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
        <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-text)' }}>
          {Math.round(safeCurrent)} / {target} g
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text)', minWidth: '35px' }}>
          {Math.round(percentage)}%
        </span>
        <div style={{ flex: 1, height: '6px', background: 'var(--color-bg)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{
            width: `${percentage}%`,
            height: '100%',
            background: color,
            borderRadius: '3px',
            transition: 'width 0.3s ease-out'
          }} />
        </div>
      </div>
    </div>
  )
}

function RecipeTeaser({ item, cat }) {
  return (
    <div style={{
      padding: '1rem',
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
      background: 'var(--color-surface)',
      borderRadius: '12px',
      border: '1px solid var(--color-border)'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'var(--color-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1rem'
      }}>
        {cat === 'Ontbijt' ? '☕' : '🍲'}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.1rem' }}>
          {cat}
        </div>
        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '500' }}>{item.title}</h4>
      </div>
    </div>
  )
}

function DayStrip({ selectedDate, onSelect, accentColor }) {
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
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0.5rem 0',
      overflowX: 'auto'
    }}>
      {days.map((date, i) => {
        const isSelected = date.toDateString() === selectedDate.toDateString()
        const isToday = date.toDateString() === new Date().toDateString()

        return (
          <div
            key={i}
            onClick={() => onSelect(date)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              cursor: 'pointer',
              padding: '0.5rem',
              minWidth: '36px',
              borderRadius: '20px',
              background: isSelected ? '#FFFFFF' : 'transparent',
              color: isSelected ? (accentColor || 'var(--color-primary)') : 'var(--color-text)',
              boxShadow: isSelected ? '0 2px 10px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            <span style={{
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              opacity: isSelected ? 1 : 0.6
            }}>
              {date.toLocaleDateString('nl-NL', { weekday: 'narrow' })}
            </span>
            <span style={{
              fontSize: '0.9rem',
              fontWeight: isSelected || isToday ? '700' : '400',
              position: 'relative'
            }}>
              {date.getDate()}
              {isToday && !isSelected && (
                <div style={{
                  position: 'absolute',
                  bottom: -4,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: 'var(--color-primary)'
                }} />
              )}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// --- MAIN COMPONENT ---

export default function Today({ onNavigate }) {
  const { user, targets, logFood, getStatsForDate, deleteFoodLog, logMenstruation, logMovement, resetOnboarding, isLoading } = useUser()

  const [viewDate, setViewDate] = useState(new Date())
  const viewDateStr = getLocalDateStr(viewDate)
  const todayDateStr = getLocalDateStr(new Date())
  const isToday = viewDateStr === todayDateStr

  const { phase: viewPhase } = getCycleDisplayData(
    user.cycleStart,
    user.cycleLength,
    user.periodLength || 5,
    user.isMenstruatingNow
  )

  const content = PHASE_CONTENT[viewPhase]
  const stats = getStatsForDate(viewDateStr)
  const todaysLogs = (user.foodLogs && Array.isArray(user.foodLogs)) ? user.foodLogs.filter(l => l.date === viewDateStr) : []

  const showMovementLog = !(user.movementLogs && user.movementLogs.find(l => l.date === viewDateStr))

  const [showModal, setShowModal] = useState(false)
  const [showLog, setShowLog] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)

  const trainingActions = content.training ? content.training.types : []

  const getPhaseColor = (p) => {
    switch (p) {
      case 'menstrual': return { bg: 'linear-gradient(135deg, #FFE5E5 0%, #FFF0F0 100%)', text: '#E57373', accent: '#FFCDD2' }
      case 'follicular': return { bg: 'linear-gradient(135deg, #E0F7FA 0%, #E0F2F1 100%)', text: '#4DB6AC', accent: '#B2EBF2' }
      case 'ovulatory': return { bg: 'linear-gradient(135deg, #F3E5F5 0%, #F8BBD0 100%)', text: '#BA68C8', accent: '#E1BEE7' }
      case 'luteal': return { bg: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)', text: '#FFB74D', accent: '#FFE0B2' }
      default: return { bg: '#F5F5F5', text: '#9E9E9E', accent: '#EEEEEE' }
    }
  }

  const phaseStyle = getPhaseColor(viewPhase)

  if (isLoading) {
    return (
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '120px' }}>
        <div style={{ height: '200px', background: 'var(--color-surface)', borderRadius: '24px', marginBottom: '1.5rem' }}></div>
      </div>
    )
  }

  if (!targets || !targets.calories) {
    return (
      <div className="container" style={{
        paddingTop: '4rem',
        textAlign: 'center',
        maxWidth: '400px',
        margin: '0 auto'
      }}>
        <h2 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>
          Start je afstemming
        </h2>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>
          We hebben je persoonlijke doelen nog niet berekend.
          Ga door de onboarding om je dagelijkse calorie- en macrodoelen te bepalen.
        </p>
        <button
          className="btn btn-primary"
          onClick={async () => {
            console.log("Resetting onboarding...");
            await resetOnboarding();
            window.location.reload();
          }}
          style={{ minWidth: '200px' }}
        >
          Start Onboarding
        </button>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: '120px', maxWidth: '100%', overflowX: 'hidden', background: 'var(--color-bg)' }}>

      {/* HEADER SECTION */}
      <div style={{
        background: phaseStyle.bg,
        paddingBottom: '2rem', // Reduced from 3rem
        paddingTop: '1rem', // Keep comfortable top spacing
        borderBottomLeftRadius: '24px', // Reduced from 40px
        borderBottomRightRadius: '24px', // Reduced from 40px
        marginBottom: '1.5rem', // Reduced from 2rem
        position: 'relative',
        transition: 'background 0.5s ease'
      }}>

        <div className="container" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <button
              onClick={() => onNavigate && onNavigate('profile')}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--color-text)', display: 'flex', opacity: 0.7 }}
            >
              <IconAccount />
            </button>

            <div style={{ textAlign: 'center', opacity: 0.8 }}>
              <h1 style={{ fontSize: '0.9rem', fontWeight: '600', margin: 0, textTransform: 'capitalize', color: 'var(--color-text)' }}>
                {viewDate.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })}
              </h1>
            </div>

            <button
              onClick={() => setShowCalendar(true)}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--color-text)', display: 'flex', opacity: 0.7 }}
            >
              <IconCalendar />
            </button>
          </div>

          <DayStrip
            selectedDate={viewDate}
            onSelect={setViewDate}
            accentColor={phaseStyle.text}
          />

          {(() => {
            const PHASE_TEXT = {
              menstrual: {
                title: "Menstruatiefase",
                normal: "Lagere energie en meer behoefte aan rust zijn normaal in deze fase.",
                focus: "herstel en basisstructuur.",
                nutrition: "Ondersteun je lichaam met ijzer, omega-3 en warme maaltijden."
              },
              follicular: {
                title: "Folliculaire fase",
                normal: "Je energie en motivatie bouwen vaak weer op in deze fase.",
                focus: "opbouwen en progressie.",
                nutrition: "Kies voor frisse, lichte maaltijden, eiwitten en vezels."
              },
              ovulatory: {
                title: "Ovulatiefase",
                normal: "Dit is vaak je meest energieke en krachtige periode.",
                focus: "intensiteit en vertrouwen.",
                nutrition: "Focus op eiwitten, antioxidanten en goede hydratatie."
              },
              luteal: {
                title: "Luteale fase",
                normal: "Meer honger en lagere motivatie zijn normaal in deze fase.",
                focus: "consistentie boven intensiteit.",
                nutrition: "Eet complexe koolhydraten, magnesium en voldoende eiwitten."
              }
            }

            const currentText = PHASE_TEXT[viewPhase] || PHASE_TEXT.follicular

            return (
              <div style={{
                marginTop: '1rem', // Reduced from 1.5rem
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.35rem' // Tighter gap
              }}>
                <div style={{
                  fontSize: '0.85rem',
                  color: 'var(--color-text-muted)',
                  opacity: 0.8,
                  marginBottom: '0',
                  fontWeight: '400'
                }}>
                  Je zit waarschijnlijk in je
                </div>

                <h2 style={{
                  fontSize: '1.75rem', // Slightly smaller
                  color: phaseStyle.text,
                  margin: '0',
                  fontWeight: '800',
                  letterSpacing: '-0.03em',
                  lineHeight: '1.1'
                }}>
                  {currentText.title}
                </h2>

                <p style={{
                  fontSize: '1rem', // Slightly smaller
                  color: 'var(--color-text)',
                  lineHeight: '1.4',
                  margin: '0.25rem 0 0 0',
                  maxWidth: '280px',
                  opacity: 0.9,
                  fontWeight: '400'
                }}>
                  {currentText.normal}
                </p>

                {/* Focus Chip */}
                <div style={{
                  marginTop: '0.5rem',
                  background: 'rgba(255,255,255,0.6)',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.85rem',
                  backdropFilter: 'blur(4px)'
                }}>
                  <span style={{ opacity: 0.7 }}>Focus:</span>
                  <span style={{ fontWeight: '600', color: phaseStyle.text }}>{currentText.focus}</span>
                </div>

                {/* Integrated Nutrition Text - Minimalist Icon + Line */}
                <div style={{
                  marginTop: '1rem', // Tighter spacing to section above
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.4rem',
                  opacity: 0.85
                }}>
                  {/* Minimalist Line Icon (Apple concept) */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: phaseStyle.text }}>
                    {/* Apple Body */}
                    <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22 0-2.25-1.94-4.22-4.14-4.22-2.19 0-3.69 1.62-5.86 1.62-2.16 0-3.65-1.62-5.84-1.62C3.97 5.56 2 7.72 2 10.41c0 4.19 3 11.59 6 11.59 1.25 0 2.5-1.06 4-1.06Z" />
                    {/* Stem/Leaf */}
                    <path d="M10 2c1 0 3.5 1.5 3.5 3.5" />
                  </svg>

                  <div style={{
                    fontSize: '0.9rem',
                    color: 'var(--color-text)',
                    lineHeight: '1.35',
                    fontWeight: '400',
                    maxWidth: '300px'
                  }}>
                    {currentText.nutrition}
                  </div>
                </div>

              </div>
            )
          })()}

        </div>
      </div>

      {/* MAIN CONTENT SECTION */}
      <div className="container" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {(user.tracking !== 'none') && (
            <section>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                <div style={{
                  background: '#fff',
                  borderRadius: '24px',
                  padding: '1.5rem',
                  color: 'var(--color-text)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1px solid var(--color-border)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
                }}>
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
                    <CircularProgress
                      current={toNum(stats.kcal)}
                      target={toNum(targets.calories)}
                      size={90}
                      strokeWidth={8}
                      color="var(--color-calories)"
                      trackColor="rgba(0,0,0,0.05)"
                      showText={true}
                    />
                  </div>
                </div>

                <div className="card-minimal" style={{ padding: '1rem 1.25rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
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

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={() => setShowModal(true)}
                  className="btn btn-primary"
                  style={{
                    width: '90%',
                    boxShadow: 'var(--shadow-soft)'
                  }}
                >
                  + Voeg eten toe
                </button>
              </div>

              {todaysLogs.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--color-text-muted)', margin: 0 }}>Vandaag gelogd</h3>
                    <button
                      onClick={() => setShowLog(!showLog)}
                      style={{ background: 'none', color: 'var(--color-primary)', fontSize: '0.9rem', fontWeight: '500' }}
                    >
                      {showLog ? 'Verberg items ↑' : 'Toon items ↓'}
                    </button>
                  </div>

                  {showLog && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {todaysLogs.map(log => (
                        <div key={log.id} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          background: '#FFF', padding: '0.75rem 1rem', borderRadius: '12px',
                          border: '1px solid var(--color-border)'
                        }}>
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{log.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{log.grams}g • {log.kcal} kcal</div>
                          </div>
                          <button
                            onClick={() => deleteFoodLog(log.id)}
                            style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', padding: '0.5rem' }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          <section>
            <div style={{
              background: 'rgba(112, 193, 163, 0.12)',
              borderRadius: '24px',
              padding: '2rem 1.5rem',
              marginBottom: '0.5rem',
              border: 'none'
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <h2 style={{
                  fontSize: '1rem',
                  color: 'var(--color-primary)',
                  margin: '0 0 0.5rem 0',
                  fontWeight: '600'
                }}>
                  {content.training ? (content.training.title || 'Beweging die je lichaam nu helpt') : 'Beweging'}
                </h2>
                <div style={{ fontSize: '0.95rem', color: 'var(--color-text)', fontWeight: '500' }}>
                  {content.training ? (content.training.subtitle || content.training.goal) : ''}
                </div>
              </div>

              <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                {content.training ? (content.training.description || content.training.why) : ''}
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {trainingActions.map(type => (
                  <span key={type} className="chip-action" style={{ background: '#FFF' }}>
                    {type}
                  </span>
                ))}
              </div>

              {showMovementLog && (
                <div style={{
                  marginTop: '1.5rem',
                  paddingTop: '1.25rem',
                  borderTop: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Heb je vandaag gesport?</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => logMovement(viewDateStr, 'moved')}
                      style={{
                        padding: '0.4rem 0.9rem',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        border: 'none',
                        background: 'var(--color-primary)',
                        color: '#fff',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      Ja
                    </button>
                    <button
                      onClick={() => logMovement(viewDateStr, 'rest')}
                      style={{
                        padding: '0.4rem 0.9rem',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        border: '1px solid var(--color-border)',
                        background: 'transparent',
                        color: 'var(--color-text)',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      Nee / rustdag
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

        </div>
      </div> {/* CLOSE CONTAINER */}

      {/* MODALS ROOT LEVEL */}
      {
        showModal && (
          <FoodModal
            onClose={() => setShowModal(false)}
            onAdd={(foodId, grams) => {
              logFood(foodId, grams, viewDateStr)
              setShowModal(false)
            }}
          />
        )
      }

      {showCalendar && (
        <PeriodCalendar
          user={user}
          onClose={() => setShowCalendar(false)}
          onSelect={(date) => {
            setViewDate(date)
            setShowCalendar(false)
          }}
        />
      )}


      {showDatePicker && (
        <div className="modal-overlay" onClick={() => setShowDatePicker(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Wanneer begon je laatste menstruatie?</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Kies de eerste dag van je laatste menstruatie. We gebruiken dit om je cyclus te berekenen.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault()
              const dateVal = e.target.rootDate.value
              if (dateVal) {
                logMenstruation(dateVal)
                setShowDatePicker(false)
              }
            }}>
              <input
                name="rootDate"
                type="date"
                defaultValue={todayDateStr}
                max={todayDateStr}
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1rem',
                  borderRadius: '12px',
                  border: '1px solid var(--color-border)',
                  marginBottom: '1rem',
                  fontFamily: 'inherit'
                }}
              />

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginBottom: '0.5rem' }}
              >
                Opslaan
              </button>
            </form>

            <button
              onClick={() => setShowDatePicker(false)}
              className="btn-soft"
            >
              Annuleren
            </button>
          </div>
        </div>
      )}

      <style>{`
        .card-minimal {
          background: var(--color-surface);
          border-radius: 20px;
          padding: 1.5rem;
          border: 1px solid var(--color-border);
        }
        
        .chip-action {
          display: inline-flex;
          align-items: center;
          padding: 0.5rem 1rem;
          background-color: var(--color-bg);
          border-radius: 20px;
          font-size: 0.9rem;
          color: var(--color-text);
          font-weight: 500;
          border: 1px solid transparent;
          cursor: default;
        }

        .btn-soft {
          background: var(--color-surface);
          color: var(--color-primary);
          border: 1px solid var(--color-border);
          border-radius: 12px;
          width: 100%;
          padding: 1rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-soft:hover {
          background: var(--color-bg);
        }

        .progress-ring-circle {
           transition: stroke-dashoffset 0.5s ease-in-out;
           transform: rotate(-90deg);
           transform-origin: 50% 50%;
        }

        /* Modal Styles */
        .modal-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.4);
            display: flex;
            align-items: flex-end;
            justify-content: center;
            z-index: 1000;
        }
        @media(min-width: 480px) {
            .modal-overlay { align-items: center; }
        }
        .modal-content {
            background: #FFFFFF;
            width: 100%;
            max-width: 480px;
            padding: 2rem;
            border-radius: 20px 20px 0 0;
            animation: slideUp 0.3s ease-out;
        }
        @media(min-width: 480px) {
            .modal-content { border-radius: 20px; width: 90%; }
        }
        @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
        }
      `}</style>
    </div >
  )
}
