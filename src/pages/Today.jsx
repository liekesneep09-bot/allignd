import React, { useState, useRef, useEffect } from 'react'
import { useUser } from '../context/UserContext'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabaseClient'
import { getCycleDisplayData, getPhaseTransition } from '../logic/cycle'
import { getPhaseContent } from '../data/phases'
import { IconMap, IconAccount, IconCalendar, IconGuide, IconNutrition, IconActivity, IconCommunity } from '../components/Icons'
import FoodModal from '../components/FoodModal'
import PeriodCalendar from '../components/PeriodCalendar'
import { toNum, calculateProgress } from '../utils/numbers'
import { getLocalDateStr } from '../utils/date'
import HabitsCard from '../components/HabitsCard'
import WeightTracker from '../components/WeightTracker'
import CheckInModal, { SYMPTOMS_LIST, SYMPTOM_GROUPS, SymptomIcon } from '../components/CheckInModal'
import CycleStatusCard from '../components/CycleStatusCard'
import ActionToast from '../components/ActionToast'
import { normalizeMealCategory } from '../utils/mealCategory'

// --- HELPER COMPONENTS ---

// Small stroke icons for the Today quick actions (same style as components/Icons.jsx)
const quickIconProps = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
const IconInsights = ({ size = 20 }) => (
  <svg {...quickIconProps} width={size} height={size}><path d="M5 20V11M12 20V4M19 20v-6" /></svg>
)
const IconFeeling = () => (
  <svg {...quickIconProps}><circle cx="12" cy="12" r="9" /><path d="M8.5 14s1.3 2 3.5 2 3.5-2 3.5-2" /><path d="M9 9.5h.01M15 9.5h.01" /></svg>
)
const IconFork = () => (
  <svg {...quickIconProps}><path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M17 3c-2.2 2-3.2 5-3.2 8.5H17V21" /></svg>
)
const IconDrop = () => (
  <svg {...quickIconProps}><path d="M12 2.8C9.2 6.6 6 10 6 13.8a6 6 0 0 0 12 0C18 10 14.8 6.6 12 2.8z" /></svg>
)
const IconSteps = () => (
  <svg {...quickIconProps}><path d="M8 16.5c-1.7 0-3-1.6-3-4.2C5 9.6 6.2 7 8 7s2.6 2.3 2.4 4.6c-.2 2.4-.7 4.9-2.4 4.9zM5.6 19.5c.4 1 1.4 1.5 2.4 1.5s1.8-.6 2-1.6M16 12.5c1.7 0 3-1.6 3-4.2C19 5.6 17.8 3 16 3s-2.6 2.3-2.4 4.6c.2 2.4.7 4.9 2.4 4.9zM18.4 15.5c-.4 1-1.4 1.5-2.4 1.5s-1.8-.6-2-1.6" /></svg>
)

function CircularProgress({ current, target, size, strokeWidth, color = 'var(--color-calories)', trackColor = 'var(--color-border)', showText = false }) {
  const safeCurrent = toNum(current)
  const safeTarget = toNum(target)
  const radius = size / 2
  // Same geometry as the water and steps rings in HabitsCard: the ring fills its box
  const normalizedRadius = (size - strokeWidth) / 2
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
        <div style={{ flex: 1, height: '6px', background: 'var(--color-bg)', borderRadius: 'var(--radius-xs)', overflow: 'hidden' }}>
          <div style={{
            width: `${percentage}%`,
            height: '100%',
            background: color,
            borderRadius: 'var(--radius-xs)',
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
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--color-border)'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
                  borderRadius: 'var(--radius-full)',
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
          <button
            key={i}
            type="button"
            onClick={() => onSelect(date)}
            aria-label={date.toLocaleDateString(language === 'nl' ? 'nl-NL' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            aria-pressed={isSelected}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem',
              cursor: 'pointer',
              padding: '0.5rem 0.25rem',
              minWidth: '44px',
              minHeight: '52px',
              borderRadius: 'var(--radius-lg)',
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
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-primary)'
                }} />
              )}
            </span>
          </button>
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
  const { user, targets, logFood, getStatsForDate, deleteFoodLog, restoreFoodLog, logPeriodStart, logMovement, resetOnboarding, isLoading, endPeriodToday, getPhaseForDate, isDateInPeriod, togglePeriodDate, startPeriod, stopPeriod, isMenstruatingNow } = useUser()
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
  const [habitSheet, setHabitSheet] = useState(null) // 'water' | 'steps' | null, opened from the quick actions
  const [showLog, setShowLog] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [dailyTopic, setDailyTopic] = useState(null)
  const [actionFeedback, setActionFeedback] = useState(null)

  const { user: authUser } = useAuth()

  useEffect(() => {
    if (!actionFeedback) return undefined
    const timeout = setTimeout(() => setActionFeedback(null), actionFeedback.onAction ? 8000 : 5000)
    return () => clearTimeout(timeout)
  }, [actionFeedback])

  useEffect(() => {
    if (!authUser) return
    let cancelled = false
    const fetchTopic = async () => {
      try {
        const { data, error } = await supabase
          .from('community_topics')
          .select('id, question, date')
          .order('date', { ascending: false })
          .limit(5)
        if (error) throw error
        if (cancelled) return
        const todayStr = getLocalDateStr(new Date())
        const topic = (data || []).find(t => t.date <= todayStr)
        setDailyTopic(topic || null)
      } catch (e) {
        console.error('Failed to fetch daily topic:', e)
      }
    }
    fetchTopic()
    return () => { cancelled = true }
  }, [authUser])

  const todaysSymptomsLog = user?.symptomLogs?.find(l => l.date === viewDateStr)
  const todaysSymptoms = todaysSymptomsLog?.symptoms || []

  const trainingActions = content.training ? content.training.types : []

  const getPhaseColor = (p) => {
    switch (p) {
      case 'menstrual': return {
        bg: 'linear-gradient(to bottom, rgba(var(--phase-menstrual-rgb), 0.25) 0%, rgba(var(--phase-menstrual-rgb), 0.12) 60%, rgba(255,255,255,0) 100%)',
        text: 'var(--phase-menstrual)',
        accent: 'rgba(var(--phase-menstrual-rgb), 0.5)'
      }
      case 'follicular': return {
        bg: 'linear-gradient(to bottom, rgba(var(--phase-follicular-rgb), 0.25) 0%, rgba(var(--phase-follicular-rgb), 0.12) 60%, rgba(255,255,255,0) 100%)',
        text: 'var(--phase-follicular)',
        accent: 'rgba(var(--phase-follicular-rgb), 0.5)'
      }
      case 'ovulatory': return {
        bg: 'linear-gradient(to bottom, rgba(var(--phase-ovulatory-rgb), 0.25) 0%, rgba(var(--phase-ovulatory-rgb), 0.12) 60%, rgba(255,255,255,0) 100%)',
        text: 'var(--phase-ovulatory)',
        accent: 'rgba(var(--phase-ovulatory-rgb), 0.5)'
      }
      case 'luteal': return {
        bg: 'linear-gradient(to bottom, rgba(var(--phase-luteal-rgb), 0.25) 0%, rgba(var(--phase-luteal-rgb), 0.12) 60%, rgba(255,255,255,0) 100%)',
        text: 'var(--phase-luteal)',
        accent: 'rgba(var(--phase-luteal-rgb), 0.5)'
      }
      default: return { bg: '#F5F5F5', text: '#9E9E9E', accent: '#EEEEEE' }
    }
  }

  const phaseStyle = getPhaseColor(viewPhase)

  const mealCategoryLabel = (category) => {
    const normalized = normalizeMealCategory(category)
    const labels = {
      breakfast: t('meal_editor.breakfast'),
      lunch: t('meal_editor.lunch'),
      dinner: t('meal_editor.dinner'),
      snack: t('meal_editor.snack')
    }
    return (labels[normalized] || t('today.other')).toLocaleLowerCase()
  }

  const handleFoodAdded = ({ name, category }) => {
    setShowLog(true)
    setActionFeedback({
      type: 'success',
      message: t('today.food_added')
        .replace('{name}', name)
        .replace('{category}', mealCategoryLabel(category))
    })
  }

  const handleDeleteFood = async (log) => {
    try {
      const deleted = await deleteFoodLog(log.id)
      setActionFeedback({
        type: 'success',
        message: t('today.food_deleted').replace('{name}', deleted?.name || log.name),
        actionLabel: t('today.undo'),
        onAction: async () => {
          try {
            await restoreFoodLog(deleted || log)
            setActionFeedback({
              type: 'success',
              message: t('today.food_restored').replace('{name}', deleted?.name || log.name)
            })
          } catch {
            setActionFeedback({ type: 'error', message: t('today.food_restore_error') })
          }
        }
      })
    } catch {
      setActionFeedback({ type: 'error', message: t('today.food_delete_error') })
    }
  }

  if (isLoading) {
    return (
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '120px' }}>
        <div style={{ height: '200px', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem' }}></div>
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
    <div style={{
      paddingBottom: '120px',
      maxWidth: '100%',
      overflowX: 'hidden',
      minHeight: '100vh',
      // Background moves with the phase of the selected day
      background: viewPhase ? `var(--phase-${viewPhase}-bg, var(--color-bg))` : 'var(--color-bg)',
      transition: 'background 0.5s ease'
    }}>

      {/* HEADER SECTION */}
      <div style={{
        paddingBottom: 'var(--space-4)',
        paddingTop: 'var(--space-3)',
        transition: 'background 0.5s ease'
      }}>

        <div className="container" style={{ paddingBottom: 0 }}>

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
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '44px',
                minHeight: '44px',
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
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '44px',
                minHeight: '44px',
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
                {user?.cycleStart ? (
                  <CycleStatusCard
                    variant="hero"
                    date={viewDateStr}
                    phase={viewPhase}
                    day={viewDay}
                    linearDay={viewLinearDay}
                    overdueDays={overdueDays}
                    onNavigate={onNavigate}
                  />
                ) : (
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
                )}

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
                  fontSize: 'var(--font-size-sm)',
                  color: '#333333',
                  lineHeight: '1.5',
                  margin: '0',
                  maxWidth: '360px',
                  fontWeight: '400'
                }}>
                  {currentText.normal}
                </p>

                {/* Row 1 — read more: this phase, nutrition, movement, insights */}
                <div style={{
                  marginTop: 'var(--space-3)',
                  width: '100%',
                  maxWidth: '380px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                  gap: 'var(--space-2)'
                }}>
                  {[
                    { view: 'guide', Icon: IconGuide, label: t('today.hero_phase', { defaultValue: 'Deze fase' }) },
                    { view: 'recipes', Icon: IconNutrition, label: t('today.hero_nutrition', { defaultValue: 'Voeding' }) },
                    { view: 'fitness', Icon: IconActivity, label: t('today.hero_movement', { defaultValue: 'Beweging' }) },
                    { view: 'progress', Icon: IconInsights, label: t('today.hero_insights', { defaultValue: 'Inzichten' }) }
                  ].map(({ view, Icon, label }) => (
                    <button
                      key={view}
                      type="button"
                      onClick={() => onNavigate && onNavigate(view)}
                      style={{
                        minHeight: '72px',
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border-light)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: 'var(--space-2)',
                        cursor: 'pointer',
                        color: 'var(--color-text)',
                        fontFamily: 'inherit',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: '600'
                      }}
                    >
                      <span style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-full)',
                        background: viewPhase ? `var(--phase-${viewPhase}-soft)` : 'var(--color-bg)',
                        color: viewPhase ? `var(--phase-${viewPhase}-text)` : 'var(--color-text)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Icon size={18} />
                      </span>
                      {label}
                    </button>
                  ))}
                </div>

                {/* Row 2 — log right away: feeling, food, water, steps */}
                <div style={{
                  marginTop: 'var(--space-3)',
                  width: '100%',
                  maxWidth: '380px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                  gap: 'var(--space-2)'
                }}>
                  {[
                    { key: 'feeling', Icon: IconFeeling, label: t('today.quick_feeling', { defaultValue: 'Gevoel' }), onClick: () => setShowCheckInModal(true) },
                    { key: 'food', Icon: IconFork, label: t('today.quick_food', { defaultValue: 'Eten' }), onClick: () => setShowModal(true) },
                    { key: 'water', Icon: IconDrop, label: t('today.quick_water', { defaultValue: 'Water' }), onClick: () => setHabitSheet('water') },
                    { key: 'steps', Icon: IconSteps, label: t('today.quick_steps', { defaultValue: 'Stappen' }), onClick: () => setHabitSheet('steps') }
                  ].map(({ key, Icon, label, onClick }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={onClick}
                      aria-label={`${label} ${t('today.quick_log_suffix', { defaultValue: 'loggen' })}`}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: '600',
                        color: 'var(--color-text-secondary)'
                      }}
                    >
                      <span style={{
                        position: 'relative',
                        width: '48px',
                        height: '48px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border-light)',
                        boxShadow: 'var(--shadow-sm)',
                        color: 'var(--color-text)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Icon />
                        <span style={{
                          position: 'absolute',
                          right: '-2px',
                          bottom: '-2px',
                          width: '18px',
                          height: '18px',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--color-primary)',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '13px',
                          fontWeight: '700',
                          lineHeight: 1,
                          border: '2px solid var(--color-surface)'
                        }}>+</span>
                      </span>
                      {label}
                    </button>
                  ))}
                </div>

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

              </div>
            )
          })()}

        </div>
      </div>

      {/* MAIN CONTENT SECTION */}
      <div className="container" style={{ paddingTop: 'var(--space-2)' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>

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

                  {/* Tap the ring to add food — same plus badge as the water and steps rings */}
                  <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    aria-label={t('today.add_food')}
                    style={{
                      position: 'relative',
                      flexShrink: 0,
                      width: '100px',
                      height: '100px',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer'
                    }}
                  >
                    <CircularProgress
                      current={toNum(stats.kcal)}
                      target={toNum(targets.calories)}
                      size={100}
                      strokeWidth={8}
                      color="var(--color-calories)"
                      trackColor="rgba(0,0,0,0.05)"
                      showText={true}
                    />
                    <span
                      className="ring-plus-badge"
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        bottom: '-2px',
                        right: '-2px',
                        width: '28px',
                        height: '28px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 6px rgba(255, 174, 185, 0.4)',
                        border: '2px solid #ffffff',
                        color: '#ffffff',
                        fontSize: '1.15rem',
                        fontWeight: '700',
                        lineHeight: 1
                      }}
                    >
                      +
                    </span>
                  </button>
                </div>


                {/* BOTTOM SECTION: MACROS & FIBER */}
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <MacroListItem label={t('today.carbs')} current={toNum(stats.c)} target={toNum(targets.carbsMin)} color="var(--color-text-secondary)" />
                    <MacroListItem label={t('today.fats')} current={toNum(stats.f)} target={toNum(targets.fatMin)} color="var(--color-text-secondary)" />
                    <MacroListItem label={t('today.proteins')} current={toNum(stats.p)} target={toNum(targets.proteinMin)} color="var(--color-text-secondary)" />
                    <MacroListItem label={t('today.fiber')} current={toNum(stats.fiber)} target={25} color="var(--color-text-secondary)" />
                  </div>
                </div>
              </div>
            </>
          )}

              {/* HABITS, WEIGHT & SYMPTOMS WIDGETS */}
              <HabitsCard
                date={viewDateStr}
                requestedSheet={habitSheet}
                onSheetRequestHandled={() => setHabitSheet(null)}
              />
              <WeightTracker date={viewDateStr} compact={true} />

              {/* Logged feelings: icon chips in the same style as the check-in window */}
              {todaysSymptoms.length > 0 && (
                <section className="card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <h2 style={{ margin: 0, fontSize: 'var(--font-size-base)', fontWeight: '700', color: '#333333' }}>
                      {t('today.your_feeling_today', { defaultValue: 'Jouw gevoel vandaag' })}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setShowCheckInModal(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 'var(--space-2) 0 var(--space-2) var(--space-2)',
                        minHeight: '44px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: '700',
                        color: 'var(--color-primary)'
                      }}
                    >
                      {t('today.edit_feeling', { defaultValue: 'Aanpassen' })}
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    {todaysSymptoms.map(sympId => {
                      const sympDef = SYMPTOMS_LIST.find(s => s.id === sympId)
                      if (!sympDef) return null
                      const tint = SYMPTOM_GROUPS.find(g => g.id === sympDef.category)?.tint || 'var(--color-bg)'
                      return (
                        <span key={sympId} style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 12px 4px 4px',
                          background: tint,
                          color: '#333333',
                          borderRadius: 'var(--radius-full)',
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: '600'
                        }}>
                          <span style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: 'var(--radius-full)',
                            background: 'rgba(255,255,255,0.7)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transform: 'scale(0.85)'
                          }}>
                            <SymptomIcon id={sympId} />
                          </span>
                          {t(`checkin.symptoms.${sympId}`)}
                        </span>
                      )
                    })}
                  </div>
                </section>
              )}

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
                  const key = String(normalizeMealCategory(log.meal_category))
                  if (!grouped[key]) grouped[key] = []
                  grouped[key].push(log)
                }

                // Only render categories that have items
                const activeCats = MEAL_ORDER.filter(cat => grouped[String(cat)].length > 0)

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <button
                      type="button"
                      onClick={() => setShowLog(!showLog)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 'var(--space-2) var(--space-3)',
                        minHeight: '44px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: '600',
                        color: 'var(--color-text-secondary)',
                        textDecoration: 'underline',
                        textUnderlineOffset: '3px'
                      }}
                    >
                      {showLog
                        ? t('today.hide_logged_meals', { defaultValue: 'Gelogde maaltijden verbergen' })
                        : t('today.show_logged_meals', { defaultValue: 'Gelogde maaltijden bekijken ({n})' }).replace('{n}', todaysLogs.length)}
                    </button>

                    {showLog && (
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
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
                                      onClick={() => void handleDeleteFood(log)}
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

          {/* Question of the day — belongs to Community, so it sits at the bottom */}
          {dailyTopic && (
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('community')}
              className="card"
              style={{
                marginTop: 'var(--space-3)',
                padding: 'var(--space-4)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                width: '100%',
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: 'inherit',
                border: '1px solid var(--color-border-light)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <span style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <IconCommunity size={20} />
              </span>
              <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span style={{
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--color-text-secondary)'
                }}>
                  {t('today.daily_topic_title')}
                </span>
                <span style={{
                  fontSize: 'var(--font-size-base)',
                  fontWeight: '600',
                  color: 'var(--color-text)',
                  lineHeight: '1.4'
                }}>
                  {dailyTopic.question}
                </span>
                <span style={{
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: '600',
                  color: 'var(--color-primary)'
                }}>
                  {t('today.daily_topic_answer')} →
                </span>
              </span>
            </button>
          )}

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
            date={viewDateStr}
            onAdd={async (foodId, grams, _, config) => {
              await logFood(foodId, grams, viewDateStr, config)
            }}
            onAdded={handleFoodAdded}
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

      {actionFeedback && (
        <ActionToast
          {...actionFeedback}
          onClose={() => setActionFeedback(null)}
        />
      )}

      <style>{`
        .card-minimal {
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          border: 1px solid var(--color-border);
        }

        .chip-action {
          display: inline-flex;
          align-items: center;
          padding: 0.5rem 1rem;
          background-color: var(--color-bg);
          border-radius: var(--radius-lg);
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
          border-radius: var(--radius-md);
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

      `}</style>
    </div >
  )
}
