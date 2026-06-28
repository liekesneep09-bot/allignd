import React, { useMemo } from 'react'
import { useUser } from '../context/UserContext'
import { useLanguage } from '../context/LanguageContext'
import { getCyclePrediction } from '../logic/cycle'
import { getLocalDateStr } from '../utils/date'
import { getPhaseContent } from '../data/phases'

// Phase colors matching the rest of the app
const PHASE_COLORS = {
  menstrual: '#c4506a',
  follicular: '#2fb5c7',
  ovulatory: '#e8785f',
  luteal: '#6a9f6b'
}

// Proportional lengths of each phase in the ring (as fraction of cycle)
function getPhaseSegments(cycleLength, periodLength) {
  const lutealLength = 14
  const ovulationDay = cycleLength - lutealLength
  const fertileStart = ovulationDay - 5
  const fertileEnd = ovulationDay + 1

  return [
    { phase: 'menstrual', start: 0, end: periodLength },
    { phase: 'follicular', start: periodLength, end: fertileStart - 1 },
    { phase: 'ovulatory', start: fertileStart - 1, end: fertileEnd },
    { phase: 'luteal', start: fertileEnd, end: cycleLength }
  ]
}

// SVG Segmented Cycle Ring
function CycleRing({ size, strokeWidth, cycleLength, periodLength, currentDay, currentPhase }) {
  const radius = size / 2
  const normalizedRadius = radius - strokeWidth * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const segments = getPhaseSegments(cycleLength, periodLength)

  // Current position angle (0 = top/12 o'clock, shift by 0.5 to center the dot in the day)
  const currentAngle = ((currentDay - 0.5) / cycleLength) * 360
  const dotAngleRad = ((currentAngle - 90) * Math.PI) / 180
  const dotX = radius + normalizedRadius * Math.cos(dotAngleRad)
  const dotY = radius + normalizedRadius * Math.sin(dotAngleRad)

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background track */}
      <circle
        cx={radius}
        cy={radius}
        r={normalizedRadius}
        fill="transparent"
        stroke="rgba(0,0,0,0.04)"
        strokeWidth={strokeWidth}
      />

      {/* Phase segments */}
      {segments.map((seg, i) => {
        const segLength = seg.end - seg.start
        if (segLength <= 0) return null

        const fraction = segLength / cycleLength
        const dashLength = fraction * circumference
        const gapLength = circumference - dashLength

        // Offset: rotate to correct starting position
        // SVG circle starts at 3 o'clock, we want 12 o'clock (-90deg via transform)
        const startFraction = seg.start / cycleLength
        const offset = circumference - (startFraction * circumference)

        return (
          <circle
            key={i}
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            fill="transparent"
            stroke={PHASE_COLORS[seg.phase]}
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
            strokeDasharray={`${dashLength} ${gapLength}`}
            strokeDashoffset={offset}
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%',
              opacity: seg.phase === currentPhase ? 1 : 0.35,
              transition: 'opacity 0.4s ease'
            }}
          />
        )
      })}

      {/* Current position dot */}
      <circle
        cx={dotX}
        cy={dotY}
        r={strokeWidth * 0.9}
        fill="#FFFFFF"
        stroke={PHASE_COLORS[currentPhase] || '#999'}
        strokeWidth={2}
        style={{
          filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.15))',
          transition: 'cx 0.4s ease, cy 0.4s ease'
        }}
      />
    </svg>
  )
}

export default function CycleStatusCard({ date, phase, day, linearDay, overdueDays, onNavigate }) {
  const { user } = useUser()
  const { t, language } = useLanguage()

  const content = getPhaseContent(language, phase)

  const effectiveCycleLen = user?.cycleStats?.learnedCycleLength || user?.cycleLength || 28
  const effectivePeriodLen = user?.bleedingLengthDays || user?.periodLength || 5

  // Calculate countdown and context text
  const { countdownNumber, countdownLabel, phaseLabel, dayLabel, predictedDate, ringDay } = useMemo(() => {
    const cycleLen = effectiveCycleLen
    const periodLen = effectivePeriodLen
    const lutealLength = 14
    const ovulationDay = cycleLen - lutealLength
    const fertileStart = ovulationDay - 5
    const currentDay = day || 1
    const currentLinearDay = linearDay || currentDay
    const isOverdue = (overdueDays && overdueDays > 0)

    // Freeze ring at the end of the cycle if overdue
    const ringDay = isOverdue ? cycleLen : currentDay

    // Phase labels from translations
    const phaseNames = {
      menstrual: t('profile.phases.menstrual'),
      follicular: t('profile.phases.follicular'),
      ovulatory: t('profile.phases.ovulatory'),
      luteal: t('profile.phases.luteal')
    }

    let countdownNumber, countdownLabel
    const isNL = language === 'nl'

    if (isOverdue) {
      countdownNumber = overdueDays
      countdownLabel = isNL
        ? (overdueDays === 1 ? 'dag\novertijd' : 'dagen\novertijd')
        : (overdueDays === 1 ? 'day\nlate' : 'days\nlate')
    } else if (phase === 'menstrual') {
      // During period: show what day of period you're on
      const dayNum = Math.min(currentDay, periodLen)
      const getOrdinalEn = (n) => {
        const s = ["th", "st", "nd", "rd"]
        const v = n % 100
        return n + (s[(v - 20) % 10] || s[v] || s[0])
      }
      countdownNumber = isNL ? `${dayNum}e` : getOrdinalEn(dayNum)
      countdownLabel = isNL ? `dag van je\nmenstruatie` : `day of your\nperiod`
    } else {
      // All other phases: always count down to next period
      const daysUntilPeriod = Math.max(0, cycleLen - currentDay)
      countdownNumber = daysUntilPeriod
      countdownLabel = isNL
        ? (daysUntilPeriod === 1 ? 'dag tot je\nmenstruatie' : 'dagen tot je\nmenstruatie')
        : (daysUntilPeriod === 1 ? 'day until\nyour period' : 'days until\nyour period')
    }

    // Phase and day label
    const phaseLabel = phaseNames[phase] || phaseNames.follicular
    const dayLabel = isNL ? `Dag ${currentLinearDay} van ${cycleLen}` : `Day ${currentLinearDay} of ${cycleLen}`

    // Predicted next period date
    let predictedDate = null
    if (user?.cycleStart) {
      const prediction = getCyclePrediction(user.cycleStart, cycleLen)
      if (prediction) {
        predictedDate = prediction.date
      }
    }

    return { countdownNumber, countdownLabel, phaseLabel, dayLabel, predictedDate, ringDay }
  }, [phase, day, linearDay, overdueDays, effectiveCycleLen, effectivePeriodLen, user?.cycleStart, language])

  // Don't render if no cycle data
  if (!user?.cycleStart) return null

  const phaseColor = PHASE_COLORS[phase] || '#999'

  // Format predicted date
  const formattedPrediction = predictedDate
    ? predictedDate.toLocaleDateString(language === 'nl' ? 'nl-NL' : 'en-US', {
        day: 'numeric',
        month: 'long'
      })
    : null

  const ringSize = 120 // slightly smaller to reduce height
  const strokeW = 9

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '24px',
      padding: '1rem',
      border: '1px solid var(--color-border)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    }}>

      {/* Left: Cycle Ring */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <CycleRing
          size={ringSize}
          strokeWidth={strokeW}
          cycleLength={effectiveCycleLen}
          periodLength={effectivePeriodLen}
          currentDay={ringDay}
          currentPhase={phase}
        />

        {/* Center text inside ring */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: ringSize,
          height: ringSize,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          <div style={{
            fontSize: '1.7rem',
            fontWeight: '800',
            color: phaseColor,
            lineHeight: 1,
            letterSpacing: '-0.02em'
          }}>
            {countdownNumber}
          </div>
          <div style={{
            fontSize: '0.55rem',
            color: 'var(--color-text-muted)',
            fontWeight: '600',
            textAlign: 'center',
            lineHeight: 1.25,
            marginTop: '2px',
            whiteSpace: 'pre-line'
          }}>
            {countdownLabel}
          </div>
        </div>
      </div>

      {/* Right: Phase info & Banner */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Phase dot + name */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          marginBottom: '0.1rem'
        }}>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: phaseColor,
            flexShrink: 0,
            boxShadow: `0 0 6px ${phaseColor}60`
          }} />
          <span style={{
            fontSize: '0.95rem',
            fontWeight: '700',
            color: 'var(--color-text)',
            letterSpacing: '-0.01em'
          }}>
            {phaseLabel}
          </span>
        </div>

        {/* Day counter */}
        <div style={{
          fontSize: '0.8rem',
          color: 'var(--color-text-muted)',
          fontWeight: '500',
          marginBottom: '0.4rem'
        }}>
          {dayLabel}
        </div>

        {/* Clickable Banner inside the right column */}
        <div 
          onClick={() => onNavigate && onNavigate('guide')}
          style={{
            background: `${phaseColor}10`,
            borderRadius: '8px',
            padding: '0.35rem 0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.4rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: `1px solid ${phaseColor}15`,
            marginTop: '0.1rem',
            maxWidth: '100%'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `${phaseColor}15`
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = `${phaseColor}10`
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          {/* Text content - single line with ellipsis */}
          <div style={{ 
            flex: 1, 
            fontSize: '0.7rem', 
            color: phaseColor, 
            lineHeight: 1.2, 
            fontWeight: '600', 
            opacity: 0.9,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {language === 'nl' ? 'Lees meer over deze fase' : 'Read more about this phase'}
          </div>

          {/* Chevron */}
          <div style={{
            color: phaseColor,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            opacity: 0.8
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>


      </div>
    </div>
  )
}
