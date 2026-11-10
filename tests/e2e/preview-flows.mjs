import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { JSDOM } = require(process.cwd() + '/.test-tools/node_modules/jsdom')
const assert = require('node:assert/strict')

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' })
globalThis.window = dom.window
globalThis.document = dom.window.document
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true, writable: true })
globalThis.localStorage = dom.window.localStorage
globalThis.HTMLElement = dom.window.HTMLElement
globalThis.HTMLInputElement = dom.window.HTMLInputElement
globalThis.Node = dom.window.Node
globalThis.MouseEvent = dom.window.MouseEvent
globalThis.requestAnimationFrame = (callback) => setTimeout(callback, 0)
globalThis.IS_REACT_ACT_ENVIRONMENT = true
window.scrollTo = () => {}
window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} })

function localDate(offset = 0) {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + offset)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const profile = {
  name: 'Preview',
  cycleStart: localDate(-12),
  cycleLength: 28,
  periodLength: 5,
  bleedingLengthDays: 5,
  periodEnded: 'no',
  periodEndDate: localDate(-7),
  periodStartDates: [localDate(-40), localDate(-12)],
  cycleLengthHistory: [],
  cycleStats: { learnedCycleLength: null, variability: 0, confidence: 'medium' },
  menstruationLogs: [
    { date: localDate(-12), status: 'yes' },
    { date: localDate(-7), status: 'no' }
  ],
  macroTargets: {
    calories: 2226,
    caloriesMax: 2337,
    proteinMin: 123,
    proteinMax: 135,
    fatMin: 62,
    fatMax: 68,
    carbsMin: 294,
    carbsMax: 323
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
  foodLogs: [],
  movementLogs: [{ id: 'yesterday', date: localDate(-1), status: 'moved' }],
  weightLogs: [{ date: localDate(), weight: 68.4 }],
  waterLogs: [{ date: localDate(), amount_ml: 1250 }],
  stepLogs: [{ date: localDate(), steps: 6400 }],
  symptomLogs: [{ date: localDate(), symptoms: ['energetic'] }],
  logs: {},
  cycleHistory: []
}

document.oninput = () => {}
console.log('input support check:', 'oninput' in document, typeof document.createElement('div').oninput)

const [{ createRoot }, { act, Simulate }, { MainLayout }, { AuthProvider }, { LanguageProvider }, { UserProvider }] = await Promise.all([
  import('react-dom/client'),
  import('react-dom/test-utils'),
  import('../../src/App.jsx'),
  import('../../src/context/AuthContext.jsx'),
  import('../../src/context/LanguageContext.jsx'),
  import('../../src/context/UserContext.jsx')
])

const container = document.createElement('div')
document.body.appendChild(container)
const root = createRoot(container)

function buttons() {
  return Array.from(document.querySelectorAll('button'))
}

function text() {
  return document.body.textContent.replace(/\s+/g, ' ')
}

async function click(element) {
  assert.ok(element, 'Expected clickable element to exist')
  await act(async () => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
}

async function clickButton(label, exact = true) {
  const button = buttons().find(item => exact ? item.textContent.trim() === label : item.textContent.includes(label))
  if (!button) throw new Error(`Button not found: ${label}\nAvailable: ${buttons().map(item => item.textContent.trim()).filter(Boolean).join(' | ')}`)
  await click(button)
}

async function setInput(input, value) {
  assert.ok(input, 'Expected input to exist')
  console.log('before input support:', 'oninput' in document, typeof document.oninput, document.documentMode)
  await act(async () => {
    input.focus()
    input.value = String(value)
    Simulate.change(input)
  })
}

async function main() {
  localStorage.setItem('cyclus_onboarded', 'true')
  localStorage.setItem('app_language', 'nl')
  root.render(
    <LanguageProvider>
      <AuthProvider preview>
        <UserProvider previewProfile={profile} isExpoApp>
          <MainLayout initialView="today" isExpoApp />
        </UserProvider>
      </AuthProvider>
    </LanguageProvider>
  )
  console.log('render called')
  await new Promise(resolve => setTimeout(resolve, 100))

  console.log('body:', text().slice(0, 1000))
  assert.ok(text().includes('Dagdoel'), 'Today renders after preview mount')
  console.log('mount ok')

  // Regular product: decimal amount, success feedback, delete and restore.
  console.log('before food')
  await clickButton('Voeding toevoegen')
  console.log('food modal clicked')
  assert.ok(text().includes('Voeg eten toe'), 'Food modal opens')
  const productButton = document.querySelector('button.food-item-btn')
  const productName = productButton.querySelector('span').textContent.trim()
  await click(productButton)
  console.log('product selected', productName)
  await setInput(document.querySelector('input[placeholder="0"]'), '100.5')
  console.log('grams set')
  await clickButton('Toevoegen aan vandaag')
  console.log('food added')
  console.log('after add body:', text().slice(0, 1800))
  assert.ok(text().includes(`${productName} toegevoegd aan`), 'Added confirmation is shown')
  assert.ok(text().includes('100.5g'), 'Decimal gram amount is preserved')

  const deleteButton = buttons().filter(button => button.textContent.trim() === '✕').at(-1)
  await click(deleteButton)
  assert.ok(text().includes(`${productName} verwijderd`), 'Delete confirmation is shown')
  await clickButton('Ongedaan maken')
  assert.ok(text().includes(`${productName} hersteld`), 'Restore confirmation is shown')
  assert.ok(text().includes('100.5g'), 'Restored item keeps the original values')

  console.log('delete undo done')
  // Water quick-add.
  const waterButton = buttons().find(button => button.textContent.includes('Water') && button.textContent.includes('%'))
  await click(waterButton)
  assert.ok(text().includes('Water bijhouden'), 'Water sheet opens')
  await clickButton('Glas250 ml', false)
  assert.ok(text().includes('1.5'), 'Water total increases from 1250 to 1500 ml')

  // Steps quick-add.
  const stepsButton = buttons().find(button => button.textContent.includes('Stappen') && button.textContent.includes('%'))
  await click(stepsButton)
  assert.ok(text().includes('Stappen bijhouden'), 'Steps sheet opens')
  await clickButton('+1.000')
  assert.ok(text().includes('7.4k'), 'Steps total increases from 6400 to 7400')

  // Weight save.
  await clickButton('Log')
  await setInput(document.querySelector('input[placeholder="65.0"]'), '69.1')
  await clickButton('Opslaan')
  assert.ok(text().includes('69.1 kg'), 'Weight is updated and visible')

  // Symptom check-in.
  await clickButton('Log')
  await clickButton('Prikkelbaar')
  await clickButton('Opslaan')
  assert.ok(text().includes('Prikkelbaar'), 'Symptom is saved and visible')

  // Fitness movement and rest-day toggle.
  await clickButton('Beweging')
  await clickButton('Ja')
  assert.ok(text().includes('Je hebt vandaag bewogen'), 'Movement is logged in Fitness')
  await clickButton('Wijzig')
  assert.ok(text().includes('Rustdag, ook goed!'), 'Rest day replaces movement without losing state')

  // All remaining tabs render their real content.
  await clickButton('Voeding')
  assert.ok(text().includes('WAT HEEFT JE LICHAAM NU NODIG?'), 'Recipes tab renders')
  await clickButton('Cyclus')
  assert.ok(text().includes('VOLGENDE MENSTRUATIE'), 'Cycle tab renders')
  await clickButton('Community')
  assert.ok(text().includes('Deel je ervaring. Stel je vraag. Groei samen.'), 'Community tab renders')

  await act(async () => root.unmount())
  console.log('✔ preview product, delete/undo, water, steps, weight, symptoms, fitness, recipes, cycle and community navigation passed')
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
