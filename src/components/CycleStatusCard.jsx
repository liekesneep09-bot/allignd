import React, { useMemo } from 'react'
import { useUser } from '../context/UserContext'
import { useLanguage } from '../context/LanguageContext'
import { getCyclePrediction } from '../logic/cycle'
import { getLocalDateStr } from '../utils/date'

// Phase colors matching the rest of the app
const PHASE_COLORS = {
  menstrual: '#a86473',
  follicular: '#5bc4d4',
  ovulatory: '#f5a89c',
  luteal: '#a3b899'
}

// Proportional lengths of each phase in the ring (as fraction of cycle)
function getPhaseSegments(cycleLength, periodLength) {
  const lutealLength = 14
  const ovulationDay = cycleLength - lutealLength
  const fertileStart = ovulationDay - 5
  const fertileEnd = ovulationDay + 1

  return [
    { phase: 'menstrual', start: 0, end: periodLength },
    { phase: 'follicular', start: periodLength, end: fertileStart },
    { phase: 'ovulatory', start: fertileStart, end: fertileEnd + 1 },
    { phase: 'luteal', start: fertileEnd + 1, end: cycleLength }
  ]
}

// SVG Segmented Cycle Ring
function CycleRing({ size, strokeWidth, cycleLength, periodLength, currentDay, currentPhase }) {
  const radius = size / 2
  const normalizedRadius = radius - strokeWidth * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const segments = getPhaseSegments(cycleLength, periodLength)

  // Current position angle (0 = top/12 o'clock)
  const currentAngle = ((currentDay - 1) / cycleLength) * 360
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

export default function CycleStatusCard({ date, phase, day }) {
  const { user } = useUser()
  const { t, language } = useLanguage()

  const effectiveCycleLen = user?.cycleStats?.learnedCycleLength || user?.cycleLength || 28
  const effectivePeriodLen = user?.bleedingLengthDays || user?.periodLength || 5

  // Calculate countdown and context text
  const { countdownNumber, countdownLabel, phaseLabel, dayLabel, predictedDate } = useMemo(() => {
    const cycleLen = effectiveCycleLen
    const periodLen = effectivePeriodLen
    const lutealLength = 14
    const ovulationDay = cycleLen - lutealLength
    const fertileStart = ovulationDay - 5
    const currentDay = day || 1

    // Days until next period
    const daysUntilPeriod = Math.max(0, cycleLen - currentDay)

    // Days until ovulation
    const daysUntilOvulation = Math.max(0, ovulationDay - currentDay)

    // Phase labels from translations
    const phaseNames = {
      menstrual: t('profile.phases.menstrual'),
      follicular: t('profile.phases.follicular'),
      ovulatory: t('profile.phases.ovulatory'),
      luteal: t('profile.phases.luteal')
    }

    let countdownNumber, countdownLabel
    const isNL = language === 'nl'

    if (phase === 'menstrual') {
      // During period: show what day of period you're on
      countdownNumber = Math.min(currentDay, periodLen)
      countdownLabel = isNL ? `dag van je\nmenstruatie` : `day of your\nperiod`
    } else {
      // All other phases: always count down to next period
      countdownNumber = daysUntilPeriod
      countdownLabel = isNL
        ? (daysUntilPeriod === 1 ? 'dag tot je\nmenstruatie' : 'dagen tot je\nmenstruatie')
        : (daysUntilPeriod === 1 ? 'day until\nyour period' : 'days until\nyour period')
    }

    // Phase and day label
    const phaseLabel = phaseNames[phase] || phaseNames.follicular
    const dayLabel = isNL ? `Dag ${currentDay} van ${cycleLen}` : `Day ${currentDay} of ${cycleLen}`

    // Predicted next period date
    let predictedDate = null
    if (user?.cycleStart) {
      const prediction = getCyclePrediction(user.cycleStart, cycleLen)
      if (prediction) {
        predictedDate = prediction.date
      }
    }

    return { countdownNumber, countdownLabel, phaseLabel, dayLabel, predictedDate }
  }, [phase, day, effectiveCycleLen, effectivePeriodLen, user?.cycleStart, language])

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

  const ringSize = 120
  const strokeW = 8

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '24px',
      padding: '1.25rem 1.5rem',
      border: '1px solid var(--color-border)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
      display: 'flex',
      alignItems: 'center',
      gap: '1.25rem'
    }}>

      {/* Left: Cycle Ring */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <CycleRing
          size={ringSize}
          strokeWidth={strokeW}
          cycleLength={effectiveCycleLen}
          periodLength={effectivePeriodLen}
          currentDay={day || 1}
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
            fontSize: '1.8rem',
            fontWeight: '800',
            color: phaseColor,
            lineHeight: 1,
            letterSpacing: '-0.02em'
          }}>
            {countdownNumber}
          </div>
          <div style={{
            fontSize: '0.6rem',
            color: 'var(--color-text-muted)',
            fontWeight: '500',
            textAlign: 'center',
            lineHeight: 1.25,
            marginTop: '2px',
            whiteSpace: 'pre-line'
          }}>
            {countdownLabel}
          </div>
        </div>
      </div>

      {/* Right: Phase info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Phase dot + name */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          marginBottom: '0.25rem'
        }}>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: phaseColor,
            flexShrink: 0
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
          fontSize: '0.82rem',
          color: 'var(--color-text-muted)',
          fontWeight: '500',
          marginBottom: '0.6rem'
        }}>
          {dayLabel}
        </div>

        {/* Predicted date */}
        {formattedPrediction && phase !== 'menstrual' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.4rem 0.65rem',
            background: `${phaseColor}12`,
            borderRadius: '12px',
            width: 'fit-content'
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={phaseColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: phaseColor
            }}>
              {language === 'nl' ? 'Verwacht' : 'Expected'}: {formattedPrediction}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
