// Dev-only demo preview: renders the real MainLayout with demo data and no
// Supabase account, the same way the Expo app's demo mode does
// (mobile/src/components/dom/allignd-app.jsx). Open /preview.html on the dev server.
// Cycle day can be chosen with ?dag=<1-28> or #dag-<1-28>, e.g. /preview.html?dag=22.
import React from 'react'
import ReactDOM from 'react-dom/client'
import { MainLayout } from '../App.jsx'
import { AuthProvider } from '../context/AuthContext.jsx'
import { LanguageProvider } from '../context/LanguageContext.jsx'
import { UserProvider } from '../context/UserContext.jsx'
import '../index.css'

function localDate(offset = 0) {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + offset)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function cycleDayFromUrl() {
  const fromHash = window.location.hash.match(/dag-(\d+)/)
  const raw = Number(fromHash ? fromHash[1] : new URLSearchParams(window.location.search).get('dag'))
  return Number.isInteger(raw) && raw >= 1 && raw <= 28 ? raw : 13
}

function createPreviewProfile() {
  const today = localDate()
  const cycleDay = cycleDayFromUrl()
  const startOffset = -(cycleDay - 1)
  const cycleStart = localDate(startOffset)
  const isMenstruatingNow = cycleDay <= 5
  return {
    name: 'Demo',
    cycleStart,
    cycleLength: 28,
    periodLength: 5,
    bleedingLengthDays: 5,
    currentPeriodLength: null,
    isMenstruatingNow,
    periodEnded: isMenstruatingNow ? 'no' : 'yes',
    periodEndDate: isMenstruatingNow ? null : localDate(startOffset + 5),
    previousPeriodStart: localDate(startOffset - 28),
    previousPeriodEnd: localDate(startOffset - 23),
    periodStartDates: [localDate(startOffset - 28), cycleStart],
    cycleLengthHistory: [],
    cycleStats: { learnedCycleLength: null, variability: 0, confidence: 'medium' },
    // A 'no' log marks the end of the period, otherwise the app assumes it is still going
    menstruationLogs: isMenstruatingNow
      ? [{ date: cycleStart, status: 'yes' }]
      : [{ date: cycleStart, status: 'yes' }, { date: localDate(startOffset + 5), status: 'no' }],
    macroTargets: {
      calories: 2000,
      caloriesMax: 2100,
      proteinMin: 120,
      proteinMax: 135,
      fatMin: 65,
      fatMax: 75,
      carbsMin: 220,
      carbsMax: 245,
    },
    age: 30,
    height: 170,
    weight: 68.4,
    goal: 'maintain',
    tracking: 'now',
    trainingFrequency: 3,
    training_days_per_week: 3,
    lifestyle_level: 'moderately_active',
    steps_range: '4k8k',
    resultTempo: 'average',
    experienceLevel: 'beginner',
    trainingType: 'combination',
    user_language: 'nl',
    dietary_preference: 'everything',
    subscription_status: 'active',
    foodLogs: [
      { id: 'preview-oats', date: today, foodId: null, name: 'Havermout', grams: 60, kcal: 228, p: 7.8, c: 36, f: 4.2, fiber: 6 },
      { id: 'preview-banana', date: today, foodId: null, name: 'Banaan', grams: 120, kcal: 105, p: 1.3, c: 27.6, f: 0.4, fiber: 3.1 },
      { id: 'preview-chicken', date: today, foodId: null, name: 'Kipfilet', grams: 150, kcal: 248, p: 46.5, c: 0, f: 4.5, fiber: 0 },
    ],
    movementLogs: [{ id: 'preview-movement', date: localDate(-1), status: 'moved' }],
    weightLogs: [
      { date: localDate(-14), weight: 69.1 },
      { date: localDate(-7), weight: 68.8 },
      { date: today, weight: 68.4 },
    ],
    waterLogs: [{ date: today, amount_ml: 1250 }],
    stepLogs: [{ date: today, steps: 6400 }],
    symptomLogs: [{ date: today, symptoms: ['energetic'] }],
    logs: {},
    cycleHistory: [],
  }
}

// Design exploration: try a font with #font-<naam> (or ?font=). Only affects this preview.
const FONT_OPTIONS = {
  jakarta: { family: 'Plus Jakarta Sans', css: 'Plus+Jakarta+Sans:wght@400;500;600;700;800' },
  manrope: { family: 'Manrope', css: 'Manrope:wght@400;500;600;700;800' },
  outfit: { family: 'Outfit', css: 'Outfit:wght@300;400;500;600;700;800' },
  figtree: { family: 'Figtree', css: 'Figtree:wght@400;500;600;700;800' }
}
function applyFontFromUrl() {
  const fromHash = window.location.hash.match(/font-([a-z]+)/)
  const option = FONT_OPTIONS[fromHash ? fromHash[1] : new URLSearchParams(window.location.search).get('font')]
  if (!option) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${option.css}&display=swap`
  document.head.appendChild(link)
  document.documentElement.style.setProperty('--font-family', `'${option.family}', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`)
}
applyFontFromUrl()

// The demo reads the cycle day once at start, so reload when the link changes
window.addEventListener('hashchange', () => window.location.reload())

function PreviewApp() {
  const [previewProfile] = React.useState(createPreviewProfile)
  return (
    <LanguageProvider>
      <AuthProvider preview onPreviewSignOut={() => window.location.reload()}>
        <UserProvider previewProfile={previewProfile}>
          <MainLayout initialView="today" />
        </UserProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<PreviewApp />)
