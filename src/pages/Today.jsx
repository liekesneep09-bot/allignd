import React, { useState, useRef } from 'react'
import { useUser } from '../context/UserContext'
import { useLanguage } from '../context/LanguageContext'
import { getCycleDisplayData, getPhaseTransition } from '../logic/cycle'
import { getPhaseContent } from '../data/phases'
import { IconMap, IconAccount, IconCalendar } from '../components/Icons'
import FoodModal from '../components/FoodModal'
import PeriodCalendar from '../components/PeriodCalendar'
import { toNum, calculateProgress } from '../utils/numbers'
import { getLocalDateStr } from '../utils/date'
import HabitsCard from '../components/HabitsCard'
import WeightTracker from '../components/WeightTracker'
import CheckInModal, { SYMPTOMS_LIST } from '../components/CheckInModal'
import CycleStatusCard from '../components/CycleStatusCard'

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
          <div style={{ fontSize: '1.2rem', fontWeight: '800', color: color, lineHeight: 1 }}>
            {percentage}%
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
  const { t } = useLanguage()
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
        {cat === t('meal_editor.breakfast') ? '☕' : '🍲'}
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
  const { language } = useLanguage()
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
              {date.toLocaleDateString(language === 'nl' ? 'nl-NL' : 'en-US', { weekday: 'narrow' })}
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

const adaptNutritionTip = (tip, dietaryPreference, language) => {
  if (!tip || !dietaryPreference || dietaryPreference === 'everything') return tip;

  let adapted = tip;
  
  if (language === 'nl') {
    if (dietaryPreference === 'vegetarian' || dietaryPreference === 'vegan') {
      adapted = adapted.replace('vette vis, bessen en noten', 'lijnzaad, walnoten en bessen');
      adapted = adapted.replace('zalm, pompoenpitten', 'tempeh, pompoenpitten');
      adapted = adapted.replace('zalm', 'tempeh');
    }
    if (dietaryPreference === 'vegan') {
      adapted = adapted.replace('denk aan eieren, noten', 'denk aan peulvruchten, noten');
      adapted = adapted.replace('spinazie en eieren', 'spinazie en pompoenpitten');
      adapted = adapted.replace('yoghurt, zoete aardappel', 'plantaardige yoghurt, zoete aardappel');
      adapted = adapted.replace('pompoenpitten en yoghurt', 'pompoenpitten en plantaardige yoghurt');
    }
  } else {
    // English
    if (dietaryPreference === 'vegetarian' || dietaryPreference === 'vegan') {
      adapted = adapted.replace('fatty fish, berries, and nuts', 'flaxseed, walnuts, and berries');
      adapted = adapted.replace('salmon, pumpkin seeds', 'tempeh, pumpkin seeds');
      adapted = adapted.replace('salmon', 'tempeh');
    }
    if (dietaryPreference === 'vegan') {
      adapted = adapted.replace('think of eggs, nuts', 'think of legumes, nuts');
      adapted = adapted.replace('spinach, and eggs', 'spinach, and pumpkin seeds');
      adapted = adapted.replace('yogurt, sweet potato', 'plant-based yogurt, sweet potato');
      adapted = adapted.replace('pumpkin seeds, and yogurt', 'pumpkin seeds, and plant-based yogurt');
    }
  }
  
  return adapted;
};

// --- MAIN COMPONENT ---

export default function Today({ onNavigate }) {
  const { user, targets, logFood, getStatsForDate, deleteFoodLog, logPeriodStart, logMovement, resetOnboarding, isLoading, endPeriodToday, getPhaseForDate, isDateInPeriod, togglePeriodDate, startPeriod, stopPeriod, isMenstruatingNow } = useUser()
  const logMenstruation = startPeriod // Alias for legacy call
  const { t, language } = useLanguage()

  const [viewDate, setViewDate] = useState(new Date())
  const viewDateStr = getLocalDateStr(viewDate)
  const todayDateStr = getLocalDateStr(new Date())
  const isToday = viewDateStr === todayDateStr

  const { phase: viewPhase, day: viewDay, linearDay: viewLinearDay, overdueDays } = getPhaseForDate(viewDateStr)
  const effectiveCycleLen = user?.cycleStats?.learnedCycleLength || user?.cycleLength || 28
  const effectivePeriodLen = user?.bleedingLengthDays || user?.periodLength || 5
  const phaseTransition = getPhaseTransition(viewDay, effectiveCycleLen, effectivePeriodLen, viewPhase)

  const content = getPhaseContent(language, viewPhase, user?.dietary_preference)
  const stats = getStatsForDate(viewDateStr)
  const todaysLogs = (user?.foodLogs && Array.isArray(user.foodLogs)) ? user.foodLogs.filter(l => l.date === viewDateStr) : []

  const showMovementLog = !(user.movementLogs && user.movementLogs.find(l => l.date === viewDateStr))

  const [showModal, setShowModal] = useState(false)
  const scrollPosRef = useRef(0)
  const [showCheckInModal, setShowCheckInModal] = useState(false)
  const [showLog, setShowLog] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)

  const todaysSymptomsLog = user?.symptomLogs?.find(l => l.date === viewDateStr)
  const todaysSymptoms = todaysSymptomsLog?.symptoms || []

  const trainingActions = content.training ? content.training.types : []

  const getPhaseColor = (p) => {
    switch (p) {
      case 'menstrual': return {
        bg: 'linear-gradient(to bottom, #c4506a40 0%, rgba(196,80,106,0.2) 60%, rgba(255,255,255,0) 100%)',
        text: '#c4506a',
        accent: '#c4506a80'
      }
      case 'follicular': return {
        bg: 'linear-gradient(to bottom, #2fb5c760 0%, rgba(47,181,199,0.2) 60%, rgba(255,255,255,0) 100%)',
        text: '#2fb5c7',
        accent: '#2fb5c780'
      }
      case 'ovulatory': return {
        bg: 'linear-gradient(to bottom, #e8785f40 0%, rgba(232,120,95,0.2) 60%, rgba(255,255,255,0) 100%)',
        text: '#e8785f',
        accent: '#e8785f80'
      }
      case 'luteal': return {
        bg: 'linear-gradient(to bottom, #6a9f6b40 0%, rgba(106,159,107,0.2) 60%, rgba(255,255,255,0) 100%)',
        text: '#6a9f6b',
        accent: '#6a9f6b80'
      }
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
          {t('today.start_alignment')}
        </h2>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>
          {t('today.no_goals_yet')}
        </p>
        <button
          className="btn btn-primary"
          onClick={async () => {
            await resetOnboarding();
            window.location.reload();
          }}
          style={{ minWidth: '200px' }}
        >
          {t('today.start_onboarding')}
        </button>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: '120px', maxWidth: '100%', overflowX: 'hidden', background: '#FFFFFF' }}>

      {/* HEADER SECTION - Soft Glow */}
      <div style={{
        background: phaseStyle.bg,
        paddingBottom: '1.25rem',
        paddingTop: '1rem',
        position: 'relative',
        transition: 'background 0.5s ease'
      }}>

        <div className="container" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingBottom: 0 }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <button
              onClick={() => onNavigate && onNavigate('profile')}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--color-text)', display: 'flex', opacity: 0.7 }}
            >
              <IconAccount />
            </button>

            <div style={{ textAlign: 'center', opacity: 0.8 }}>
              <h1 style={{ fontSize: '0.9rem', fontWeight: '600', margin: 0, textTransform: 'capitalize', color: 'var(--color-text)' }}>
                {viewDate.toLocaleDateString(language === 'nl' ? 'nl-NL' : 'en-US', { day: 'numeric', month: 'long' })}
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
            const rawVariants = t('phase_variants.' + viewPhase, { returnObjects: true })
            const variants = Array.isArray(rawVariants) ? rawVariants : (t('phase_variants.follicular', { returnObjects: true }) || [])

            // Kies variant op basis van cyclusnummer (roteert elke maand)
            const cycleIndex = (user?.periodStartDates ? user.periodStartDates.length : 0) % 3
            const currentText = (variants && variants[cycleIndex]) ? variants[cycleIndex] : (variants ? variants[0] : {})

            return (
              <div style={{
                marginTop: '0.5rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                {currentText.prefix && (
                  <div style={{
                    fontSize: '0.95rem',
                    color: 'var(--color-text)',
                    fontWeight: '500',
                    marginBottom: '2px'
                  }}>
                    {currentText.prefix}
                  </div>
                )}

                <h2 style={{
                  fontSize: '2.1rem',
                  color: phaseStyle.text,
                  fontWeight: '700',
                  letterSpacing: '-0.02em',
                  lineHeight: '1.1'
                }}>
                  {currentText.title}
                </h2>

                {phaseTransition && phaseTransition.isTransition && viewPhase !== 'menstrual' && (
                  <div style={{
                    fontSize: '0.85rem',
                    color: phaseStyle.text,
                    fontWeight: '600',
                    marginTop: '0.2rem',
                    opacity: 0.85,
                    fontStyle: 'italic'
                  }}>
                    {t('profile.phases.transition_to_' + phaseTransition.nextPhase, { defaultValue: '' })}
                  </div>
                )}

                {/* Streepje onder de titel */}
                <div style={{
                  width: '48px',
                  height: '2px',
                  background: phaseStyle.text,
                  borderRadius: '2px',
                  margin: '0.6rem 0 0.5rem 0',
                  opacity: 0.5
                }} />

                <p style={{
                  fontSize: '0.95rem',
                  color: 'var(--color-text)',
                  lineHeight: '1.5',
                  margin: '0',
                  maxWidth: '100%',
                  opacity: 0.9,
                  fontWeight: '400'
                }}>
                  {currentText.normal}
                </p>

                {/* Menstruatie gestopt link (Under description text, above nutrition card) */}
                {(() => {
                  const isPeriodToday = isDateInPeriod(viewDateStr);
                  const isViewingToday = viewDateStr === todayDateStr;
                  if (isPeriodToday && isViewingToday && viewPhase === 'menstrual') {
                    return (
                      <div style={{ marginTop: '0.8rem', marginBottom: '0.2rem' }}>
                        <span 
                          onClick={() => stopPeriod(viewDateStr)}
                          style={{
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            color: phaseStyle.text, // Same color as the menstruation phase
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            display: 'inline-block',
                            padding: '4px 8px',
                            transition: 'opacity 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '0.8';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '1';
                          }}
                        >
                          {t('today.period_stopped_question', { defaultValue: 'Menstruatie gestopt?' })}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Voedingskaartje — elegant licht design */}
                <div
                  onClick={() => onNavigate && onNavigate('recipes')}
                  style={{
                    marginTop: '1rem',
                    width: '100%',
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '0.85rem 1rem',
                    textAlign: 'left',
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'center',
                    boxSizing: 'border-box',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    border: '1px solid rgba(0,0,0,0.04)',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s ease, transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  {/* Appel icoon in zacht fase-gekleurd rondje */}
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: `${phaseStyle.text}12`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={phaseStyle.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22 0-2.25-1.94-4.22-4.14-4.22-2.19 0-3.69 1.62-5.86 1.62-2.16 0-3.65-1.62-5.84-1.62C3.97 5.56 2 7.72 2 10.41c0 4.19 3 11.59 6 11.59 1.25 0 2.5-1.06 4-1.06Z" />
                      <path d="M10 2c1 0 3.5 1.5 3.5 3.5" />
                    </svg>
                  </div>

                  {/* Tekst kolom */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      color: 'var(--color-text)',
                      marginBottom: '2px',
                      letterSpacing: '0.01em'
                    }}>
                      Voeding
                    </div>
                    <div style={{
                      fontSize: '0.78rem',
                      color: 'var(--color-text)',
                      lineHeight: '1.4',
                      opacity: 0.6
                    }}>
                      {adaptNutritionTip(currentText.nutrition, user?.dietary_preference, language)}
                    </div>
                  </div>

                  {/* Pijltje rechts */}
                  <div style={{
                    flexShrink: 0,
                    color: phaseStyle.text,
                    opacity: 0.5,
                    fontSize: '1.1rem',
                    lineHeight: 1,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    ›
                  </div>
                </div>



              </div>
            )
          })()}

        </div>
      </div>

      {/* MAIN CONTENT SECTION */}
      <div className="container" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem', marginTop: '-1.5rem', position: 'relative', zIndex: 2 }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* CYCLE STATUS CARD & PERIOD BUTTON */}
          {user?.cycleStart && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <CycleStatusCard
                date={viewDateStr}
                phase={viewPhase}
                day={viewDay}
                linearDay={viewLinearDay}
                overdueDays={overdueDays}
                onNavigate={onNavigate}
              />

              {/* PERIOD ACTION BUTTON */}
              {(() => {
            const isNotFuture = viewDateStr <= todayDateStr;
            if (!isNotFuture) return null;

            const isPeriodToday = isDateInPeriod(viewDateStr);
            const isViewingToday = viewDateStr === todayDateStr;

            if (!isPeriodToday && viewPhase !== 'luteal' && viewPhase !== 'menstrual') return null;

            let actionText = '';
            let actionClick = null;

            if (isPeriodToday && isViewingToday && viewPhase === 'menstrual') {
              // Moved to inline link above nutrition card
              return null;
            } else if (!isPeriodToday && (viewPhase === 'luteal' || viewPhase === 'menstrual')) {
              actionText = t('today.log_period', { defaultValue: 'Log menstruatie' }).replace('+ ', '').replace('+', '');
              actionClick = () => startPeriod(viewDateStr);
            } else if (isPeriodToday) {
              actionText = t('today.period_logged', { defaultValue: 'Menstruatie gelogd' }).replace('✓ ', '').replace('✓', '');
              actionClick = () => togglePeriodDate(viewDateStr);
            }

            if (!actionText) return null;

            return (
              <button
                onClick={actionClick}
                style={{
                  width: '100%',
                  background: '#FFFFFF',
                  border: '1px solid var(--color-border)',
                  borderRadius: '16px',
                  padding: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  color: phaseStyle.text,
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${phaseStyle.text}08`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#FFFFFF';
                }}
              >
                {actionText}
              </button>
            )
          })()}
            </div>
          )}

          {(user.tracking !== 'none') && (
            <>
              <div className="card-minimal" style={{
                background: '#fff',
                borderRadius: '24px',
                padding: '1rem 1.25rem 1.25rem',
                border: '1px solid var(--color-border)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* TOP SECTION: DAILY GOAL */}
                <div style={{
                  color: 'var(--color-text)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>{t('today.daily_goal')}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                      <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--color-text)', lineHeight: 1 }}>
                        {Math.round(toNum(stats.kcal))} <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontWeight: '500' }}>/ {toNum(targets.calories)} kcal</span>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-calories)', marginTop: '0.25rem' }}>
                      {Math.max(0, Math.round(toNum(targets.calories) - toNum(stats.kcal)))} kcal {t('today.remaining')}
                    </div>
                  </div>

                  <div style={{ marginRight: '-8px' }}>
                    <CircularProgress
                      current={toNum(stats.kcal)}
                      target={toNum(targets.calories)}
                      size={110}
                      strokeWidth={8}
                      color="var(--color-calories)"
                      trackColor="rgba(0,0,0,0.05)"
                      showText={true}
                    />
                  </div>
                </div>


                {/* BOTTOM SECTION: MACROS & FIBER */}
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <MacroListItem label={t('today.carbs')} current={toNum(stats.c)} target={toNum(targets.carbsMin)} color="var(--color-carbs)" />
                    <MacroListItem label={t('today.fats')} current={toNum(stats.f)} target={toNum(targets.fatMin)} color="var(--color-fat)" />
                    <MacroListItem label={t('today.proteins')} current={toNum(stats.p)} target={toNum(targets.proteinMin)} color="var(--color-protein)" />
                  </div>

                  {/* Subtiele Vezels weergave */}
                  <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', opacity: 0.8 }}>
                      🌿 {t('today.fiber')}: {Math.round(toNum(stats.fiber))}g <span style={{ opacity: 0.6 }}>/ 25g ({t('today.fiber_recommended')})</span>
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  scrollPosRef.current = window.scrollY
                  setShowModal(true)
                }}
                className="btn btn-primary"
                style={{
                  width: 'fit-content',
                  alignSelf: 'center',
                  padding: '0.75rem 2rem',
                  borderRadius: '24px',
                  boxShadow: 'var(--shadow-soft)',
                  marginTop: '0.5rem',
                  fontSize: '0.92rem',
                  fontWeight: '700'
                }}
              >
                {t('today.add_food')}
              </button>
            </>
          )}

              {/* HABITS, WEIGHT & SYMPTOMS WIDGETS */}
              <HabitsCard date={viewDateStr} />
              <WeightTracker date={viewDateStr} compact={true} />

              {/* NEW: DAILY CHECK-IN WIDGET (Symptom Tracker Redesign) */}
              <section className="card-minimal" style={{ padding: '1rem 1.25rem', background: '#fff', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${phaseStyle.text}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: phaseStyle.text }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                              <line x1="9" y1="9" x2="9.01" y2="9"></line>
                              <line x1="15" y1="9" x2="15.01" y2="9"></line>
                            </svg>
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1rem', margin: '0 0 2px 0', color: 'var(--color-text)', fontWeight: '700' }}>{t('checkin.title', { defaultValue: 'Symptomen' })}</h2>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: '500' }}>
                                {todaysSymptoms.length > 0 ? `${todaysSymptoms.length} gelogd` : t('today.how_do_you_feel')}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCheckInModal(true)}
                        style={{ background: 'var(--color-primary)', color: '#333333', border: 'none', borderRadius: '20px', padding: '6px 16px', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 2px 8px rgba(255, 174, 185, 0.3)' }}
                    >
                        Log
                    </button>
                  </div>

                  {todaysSymptoms.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                      {todaysSymptoms.map(sympId => {
                        const sympDef = SYMPTOMS_LIST.find(s => s.id === sympId)
                        if (!sympDef) return null
                        return (
                          <span key={sympId} style={{ fontSize: '0.75rem', padding: '4px 10px', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', borderRadius: '12px', fontWeight: '500', border: '1px solid var(--color-border)' }}>
                            {t(`checkin.symptoms.${sympId}`)}
                          </span>
                        )
                      })}
                    </div>
                  )}
                </section>

                {/* Progressie shortcut (now at the bottom) */}
                <button
                  onClick={() => onNavigate && onNavigate('progress')}
                  style={{
                    width: '100%',
                    padding: '1rem 1.25rem',
                    background: `${phaseStyle.text}15`,
                    border: 'none',
                    borderRadius: '16px',
                    color: 'var(--color-text)',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    marginTop: 0,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Jouw Inzichten
                  </span>
                  <span style={{ color: phaseStyle.text, fontSize: '1.2rem', lineHeight: 1 }}>→</span>
                </button>


              {todaysLogs.length > 0 && (() => {
                const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack', null]
                const MEAL_LABELS = {
                  breakfast: t('meal_editor.breakfast'),
                  lunch:     t('meal_editor.lunch'),
                  dinner:    t('meal_editor.dinner'),
                  snack:     t('meal_editor.snack'),
                  null:      t('today.other')
                }

                // Group logs by meal_category
                const grouped = {}
                for (const cat of MEAL_ORDER) grouped[String(cat)] = []
                for (const log of todaysLogs) {
                  const key = String(log.meal_category ?? null)
                  if (!grouped[key]) grouped[key] = []
                  grouped[key].push(log)
                }

                // Only render categories that have items
                const activeCats = MEAL_ORDER.filter(cat => grouped[String(cat)].length > 0)

                return (
                  <div style={{ marginTop: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--color-text)', margin: 0 }}>
                        {t('today.logged_today')}
                      </h3>
                      <button
                        onClick={() => setShowLog(!showLog)}
                        style={{ background: 'none', color: 'var(--color-primary)', fontSize: '0.82rem', fontWeight: '600', fontFamily: 'inherit' }}
                      >
                        {showLog ? t('today.hide_items') : t('today.show_items')}
                      </button>
                    </div>

                    {showLog && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {activeCats.map(cat => {
                          const catLogs = grouped[String(cat)]
                          const catKcal = catLogs.reduce((sum, l) => sum + (l.kcal || 0), 0)

                          return (
                            <div key={String(cat)}>
                              {/* Category header */}
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'baseline',
                                marginBottom: '0.5rem',
                                paddingBottom: '0.4rem',
                                borderBottom: '1px solid var(--color-border)'
                              }}>
                                <span style={{
                                  fontSize: '0.72rem',
                                  fontWeight: '700',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.07em',
                                  color: phaseStyle.text
                                }}>
                                  {MEAL_LABELS[String(cat)]}
                                </span>
                                <span style={{
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                  color: 'var(--color-text-muted)'
                                }}>
                                  {Math.round(catKcal)} kcal
                                </span>
                              </div>

                              {/* Items */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                {catLogs.map((log, idx) => (
                                  <div key={log.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '0.65rem 0',
                                    borderBottom: idx < catLogs.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none'
                                  }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{
                                        fontWeight: '500',
                                        fontSize: '0.9rem',
                                        color: 'var(--color-text)',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                      }}>
                                        {log.name}
                                      </div>
                                      <div style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--color-text-muted)',
                                        marginTop: '1px'
                                      }}>
                                        {(() => {
                                          if (log.unitName && log.quantity) return `${log.quantity} ${log.unitName}`;
                                          if (log.grams) {
                                            const f = user?.foods?.find(food => food.id === log.foodId);
                                            const unit = f?.unit_type === 'per_100ml' ? 'ml' : 'g';
                                            return `${log.grams}${unit}`;
                                          }
                                          return null;
                                        })()}
                                        {(log.unitName || log.grams) && ' · '}
                                        <span style={{ fontWeight: '500', color: 'var(--color-text)' }}>{log.kcal} kcal</span>
                                        {log.p != null && ` · ${log.p}g eiwit`}
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => deleteFoodLog(log.id)}
                                      style={{
                                        color: 'var(--color-text-muted)',
                                        background: 'none',
                                        border: 'none',
                                        padding: '0.4rem 0.5rem',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                        flexShrink: 0,
                                        opacity: 0.5,
                                        fontFamily: 'inherit'
                                      }}
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })()}

          <section>
            {/* Movement Section Removed */}
          </section>

        </div>
      </div> {/* CLOSE CONTAINER */}

      {/* MODALS ROOT LEVEL */}
      <CheckInModal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        dateStr={viewDateStr}
      />

      {
        showModal && (
          <FoodModal
            onClose={() => {
              setShowModal(false)
              // Restore scroll position after keyboard dismiss + re-render
              requestAnimationFrame(() => {
                setTimeout(() => window.scrollTo(0, scrollPosRef.current), 100)
              })
            }}
            onAdd={(foodId, grams, _, config) => {
              logFood(foodId, grams, viewDateStr, config)
              setShowModal(false)
              // Scroll to top (daily goal card)
              requestAnimationFrame(() => {
                setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
              })
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
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>{t('today.when_last_period')}</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {t('today.choose_first_day')}
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
                {t('common.save')}
              </button>
            </form>

            <button
              onClick={() => setShowDatePicker(false)}
              className="btn-soft"
            >
              {t('common.cancel')}
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
