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
  const dailyGoalRef = useRef(null)
  const [showCheckInModal, setShowCheckInModal] = useState(false)
  const [showLog, setShowLog] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)

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
    <div style={{ paddingBottom: '120px', maxWidth: '100%', overflowX: 'hidden', background: 'var(--color-bg)' }}>

      {/* HEADER SECTION */}
      <div style={{
        paddingBottom: 'var(--space-4)',
        paddingTop: 'var(--space-3)',
        transition: 'background 0.5s ease'
      }}>

        <div className="container" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingBottom: 0 }}>

          {/* Top Bar: Profile + Date + Calendar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
            <button
              onClick={() => onNavigate && onNavigate('profile')}
              aria-label={t('nav.profile')}
              style={{ 
                background: 'var(--color-surface)', 
                border: 'none', 
                padding: 'var(--space-2)', 
                cursor: 'pointer', 
                color: 'var(--color-text)', 
                display: 'flex',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <IconAccount />
            </button>

            <div style={{ textAlign: 'center' }}>
              <h1 style={{ 
                fontSize: 'var(--font-size-xs)', 
                fontWeight: '600', 
                margin: 0, 
                textTransform: 'capitalize', 
                color: 'var(--color-text-secondary)',
                letterSpacing: '0.02em'
              }}>
                {viewDate.toLocaleDateString(language === 'nl' ? 'nl-NL' : 'en-US', { day: 'numeric', month: 'long' })}
              </h1>
            </div>

            <button
              onClick={() => setShowCalendar(true)}
              aria-label={t('nav.calendar')}
              style={{ 
                background: 'var(--color-surface)', 
                border: 'none', 
                padding: 'var(--space-2)', 
                cursor: 'pointer', 
                color: 'var(--color-text)', 
                display: 'flex',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-sm)'
              }}
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

            const cycleIndex = (user?.periodStartDates ? user.periodStartDates.length : 0) % 3
            const currentText = (variants && variants[cycleIndex]) ? variants[cycleIndex] : (variants ? variants[0] : {})

            return (
              <div style={{
                marginTop: 'var(--space-3)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}>
                {currentText.prefix && (
                  <div style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-secondary)',
                    fontWeight: '500'
                  }}>
                    {currentText.prefix}
                  </div>
                )}

                <h2 style={{
                  fontSize: 'var(--font-size-4xl)',
                  color: phaseStyle.text,
                  fontWeight: '800',
                  letterSpacing: '-0.03em',
                  lineHeight: '1.05',
                  margin: 0
                }}>
                  {currentText.title}
                </h2>

                {phaseTransition && phaseTransition.isTransition && viewPhase !== 'menstrual' && (
                  <div style={{
                    fontSize: 'var(--font-size-sm)',
                    color: phaseStyle.text,
                    fontWeight: '600',
                    opacity: 0.85,
                    fontStyle: 'italic'
                  }}>
                    {t('profile.phases.transition_to_' + phaseTransition.nextPhase, { defaultValue: '' })}
                  </div>
                )}

                <p style={{
                  fontSize: 'var(--font-size-base)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.5',
                  margin: '0',
                  maxWidth: '320px',
                  fontWeight: '400'
                }}>
                  {currentText.normal}
                </p>

                {/* Menstruatie gestopt / Log menstruatie link (Under description text, above nutrition card) */}
                {(() => {
                  const isNotFuture = viewDateStr <= todayDateStr;
                  if (!isNotFuture) return null;

                  const isPeriodToday = isDateInPeriod(viewDateStr);
                  const isViewingToday = viewDateStr === todayDateStr;

                  let actionText = '';
                  let actionClick = null;

                  if (isPeriodToday && isViewingToday && viewPhase === 'menstrual') {
                    actionText = t('today.period_stopped_question', { defaultValue: 'Menstruatie gestopt?' });
                    actionClick = () => stopPeriod(viewDateStr);
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
                        marginTop: 'var(--space-4)',
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border-light)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--space-3) var(--space-4)',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: '600',
                        color: phaseStyle.text,
                        cursor: 'pointer',
                        transition: 'all var(--transition-base)',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--space-2)',
                        width: '100%',
                        maxWidth: '320px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <span>{actionText}</span>
                    </button>
                  );
                })()}

                {/* Nutrition Card — Compact */}
                <button
                  onClick={() => onNavigate && onNavigate('recipes')}
                  style={{
                    marginTop: 'var(--space-2)',
                    width: '100%',
                    maxWidth: '320px',
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-3)',
                    textAlign: 'left',
                    display: 'flex',
                    gap: 'var(--space-3)',
                    alignItems: 'center',
                    boxSizing: 'border-box',
                    boxShadow: 'var(--shadow-sm)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all var(--transition-base)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22 0-2.25-1.94-4.22-4.14-4.22-2.19 0-3.69 1.62-5.86 1.62-2.16 0-3.65-1.62-5.84-1.62C3.97 5.56 2 7.72 2 10.41c0 4.19 3 11.59 6 11.59 1.25 0 2.5-1.06 4-1.06Z" />
                      <path d="M10 2c1 0 3.5 1.5 3.5 3.5" />
                    </svg>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: '600',
                      color: 'var(--color-text)',
                      lineHeight: '1.2'
                    }}>
                      {t('today.nutrition_label')}
                    </div>
                  </div>

                  <div style={{
                    flexShrink: 0,
                    color: 'var(--color-primary)',
                    fontSize: 'var(--font-size-lg)',
                    lineHeight: 1
                  }}>
                    →
                  </div>
                </button>

              </div>
            )
          })()}

        </div>
      </div>

      {/* MAIN CONTENT SECTION */}
      <div className="container" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingTop: 'var(--space-2)' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>

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


            </div>
          )}

          {(user.tracking !== 'none') && (
            <>
              <div ref={dailyGoalRef} className="card" style={{
                padding: 'var(--space-5)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* TOP SECTION: DAILY GOAL */}
                <div style={{
                  color: 'var(--color-text)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 'var(--space-4)'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                      <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-secondary)' }}>{t('today.daily_goal')}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
                      <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: '800', color: 'var(--color-text)', lineHeight: 1 }}>
                        {Math.round(toNum(stats.kcal))} <span style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)', fontWeight: '500' }}>/ {toNum(targets.calories)} kcal</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-calories)', marginTop: 'var(--space-1)' }}>
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <MacroListItem label={t('today.carbs')} current={toNum(stats.c)} target={toNum(targets.carbsMin)} color="var(--color-carbs)" />
                    <MacroListItem label={t('today.fats')} current={toNum(stats.f)} target={toNum(targets.fatMin)} color="var(--color-fat)" />
                    <MacroListItem label={t('today.proteins')} current={toNum(stats.p)} target={toNum(targets.proteinMin)} color="var(--color-protein)" />
                  </div>

                  <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                      🌿 {t('today.fiber')}: {Math.round(toNum(stats.fiber))}g <span style={{ color: 'var(--color-text-tertiary)' }}>/ 25g ({t('today.fiber_recommended')})</span>
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowModal(true)
                }}
                className="btn btn-primary"
                style={{
                  width: 'fit-content',
                  alignSelf: 'center',
                  padding: 'var(--space-3) var(--space-6)',
                  borderRadius: 'var(--radius-full)',
                  boxShadow: 'var(--shadow-md)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: '600'
                }}
              >
                {t('today.add_food')}
              </button>
            </>
          )}

              {/* HABITS, WEIGHT & SYMPTOMS WIDGETS */}
              <HabitsCard date={viewDateStr} />
              <WeightTracker date={viewDateStr} compact={true} />

              {/* DAILY CHECK-IN WIDGET */}
              <section className="card" style={{ padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: 'var(--radius-md)', 
                        background: 'var(--color-primary-light)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'var(--color-primary)' 
                      }}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                            <line x1="9" y1="9" x2="9.01" y2="9"></line>
                            <line x1="15" y1="9" x2="15.01" y2="9"></line>
                          </svg>
                      </div>
                      <div>
                          <h2 style={{ fontSize: 'var(--font-size-base)', margin: '0 0 2px 0', color: 'var(--color-text)', fontWeight: '600' }}>{t('checkin.title', { defaultValue: 'Symptomen' })}</h2>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
                              {todaysSymptoms.length > 0 ? t('today.symptoms_count').replace('{n}', todaysSymptoms.length) : t('today.how_do_you_feel')}
                          </div>
                      </div>
                  </div>
                  <button
                      onClick={() => setShowCheckInModal(true)}
                      className="btn btn-primary"
                      style={{ 
                        width: 'auto',
                        padding: 'var(--space-2) var(--space-4)', 
                        borderRadius: 'var(--radius-full)', 
                        fontSize: 'var(--font-size-xs)', 
                        fontWeight: '600' 
                      }}
                  >
                      {t('today.log_btn')}
                  </button>
              </section>

              {todaysSymptoms.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'calc(var(--space-2) * -1)', marginBottom: 'var(--space-4)', paddingLeft: 'calc(40px + var(--space-3) + var(--space-3))' }}>
                  {todaysSymptoms.map(sympId => {
                    const sympDef = SYMPTOMS_LIST.find(s => s.id === sympId)
                    if (!sympDef) return null
                    return (
                      <span key={sympId} style={{ 
                        fontSize: 'var(--font-size-xs)', 
                        padding: 'var(--space-1) var(--space-3)', 
                        backgroundColor: 'var(--color-bg)', 
                        color: 'var(--color-text-secondary)', 
                        borderRadius: 'var(--radius-full)', 
                        fontWeight: '500', 
                        border: '1px solid var(--color-border-light)' 
                      }}>
                        {t(`checkin.symptoms.${sympId}`)}
                      </span>
                    )
                  })}
                </div>
              )}

                {/* Progressie shortcut */}
                <button
                  onClick={() => onNavigate && onNavigate('progress')}
                  className="btn btn-secondary"
                  style={{
                    justifyContent: 'space-between',
                    padding: 'var(--space-4)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    {t('today.your_insights')}
                  </span>
                  <span style={{ color: 'var(--color-primary)', fontSize: 'var(--font-size-lg)', lineHeight: 1 }}>→</span>
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
                  <div style={{ marginTop: 'var(--space-6)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                      <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700', color: 'var(--color-text)', margin: 0 }}>
                        {t('today.logged_today')}
                      </h3>
                      <button
                        onClick={() => setShowLog(!showLog)}
                        className="btn btn-ghost"
                        style={{ width: 'auto', padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--font-size-xs)' }}
                      >
                        {showLog ? t('today.hide_items') : t('today.show_items')}
                      </button>
                    </div>

                    {showLog && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        {activeCats.map(cat => {
                          const catLogs = grouped[String(cat)]
                          const catKcal = catLogs.reduce((sum, l) => sum + (l.kcal || 0), 0)

                          return (
                            <div key={String(cat)} className="card" style={{ padding: 'var(--space-4)' }}>
                              {/* Category header */}
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'baseline',
                                marginBottom: 'var(--space-3)',
                                paddingBottom: 'var(--space-3)',
                                borderBottom: '1px solid var(--color-border-light)'
                              }}>
                                <span style={{
                                  fontSize: 'var(--font-size-sm)',
                                  fontWeight: '700',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                  color: 'var(--color-primary)'
                                }}>
                                  {MEAL_LABELS[String(cat)]}
                                </span>
                                <span style={{
                                  fontSize: 'var(--font-size-sm)',
                                  fontWeight: '700',
                                  color: 'var(--color-text)'
                                }}>
                                  {Math.round(catKcal)} kcal
                                </span>
                              </div>

                              {/* Items */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                {catLogs.map((log) => (
                                  <div key={log.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: 'var(--space-3)',
                                    background: 'var(--color-bg)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--color-border-light)'
                                  }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{
                                        fontWeight: '600',
                                        fontSize: 'var(--font-size-base)',
                                        color: 'var(--color-text)',
                                        marginBottom: 'var(--space-1)'
                                      }}>
                                        {log.name}
                                      </div>
                                      <div style={{
                                        fontSize: 'var(--font-size-sm)',
                                        color: 'var(--color-text-secondary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-2)',
                                        flexWrap: 'wrap'
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
                                        <span style={{ fontWeight: '700', color: 'var(--color-text)' }}>{log.kcal} kcal</span>
                                        {log.p != null && <span>· {t('today.protein_grams').replace('{p}', log.p)}</span>}
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => deleteFoodLog(log.id)}
                                      aria-label={t('common.delete')}
                                      style={{
                                        color: 'var(--color-text-tertiary)',
                                        background: 'none',
                                        border: 'none',
                                        padding: 'var(--space-2)',
                                        cursor: 'pointer',
                                        flexShrink: 0,
                                        opacity: 0.5,
                                        fontFamily: 'inherit',
                                        fontSize: 'var(--font-size-lg)'
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
              // Restore scroll to daily goal card
              requestAnimationFrame(() => {
                setTimeout(() => {
                  if (dailyGoalRef.current) {
                    const yOffset = -20
                    const y = dailyGoalRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset
                    window.scrollTo({ top: y, behavior: 'smooth' })
                  }
                }, 100)
              })
            }}
            onAdd={(foodId, grams, _, config) => {
              logFood(foodId, grams, viewDateStr, config)
              setShowModal(false)
              // Scroll to daily goal card
              requestAnimationFrame(() => {
                setTimeout(() => {
                  if (dailyGoalRef.current) {
                    const yOffset = -20
                    const y = dailyGoalRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset
                    window.scrollTo({ top: y, behavior: 'smooth' })
                  }
                }, 100)
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
