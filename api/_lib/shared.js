import { createClient } from '@supabase/supabase-js'

// Initialize Supabase with service role key (server-side only)
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
export const supabase = createClient(supabaseUrl, supabaseKey)

// ------------------------------------------------------------------
// AUTH HELPERS
// ------------------------------------------------------------------

export async function getUserFromToken(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null
    }

    const token = authHeader.replace('Bearer ', '')

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token)
        if (error) throw error
        return user
    } catch (e) {
        console.error('Auth Error:', e)
        return null
    }
}

export async function requireAuth(req) {
    const user = await getUserFromToken(req.headers.authorization)
    if (!user) {
        return { user: null, error: { status: 401, message: 'Niet ingelogd' } }
    }
    return { user, error: null }
}

// ------------------------------------------------------------------
// CORS HELPER
// ------------------------------------------------------------------

export function cors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Device-Id')
}

// ------------------------------------------------------------------
// COMMUNITY DATA
// ------------------------------------------------------------------

export const COMMUNITY_QUESTIONS = [
    "Hoe pas jij je training aan tijdens je menstruatie?",
    "Welk voedsel helpt jou het meeste met energie tijdens de luteale fase?",
    "Wat doe je om je lichaam te helpen ontspannen in de dagen voor je menstruatie?",
    "Heb je ooit gemerkt dat je sterker bent rond je ovulatie?",
    "Welke snacks heb je altijd bij de hand tijdens je cyclus?",
    "Hoe ga jij om met vermoeidheid tijdens je menstruatie?",
    "Wat is jouw go-to workout als je weinig energie hebt?",
    "Heb je tips voor het behouden van motivatie tijdens de luteale fase?",
    "Welke stretches helpen jou het beste tegen krampen?",
    "Hoe plan jij je zwaardere trainingen in je cyclus?",
    "Wat eet je graag in de folliculaire fase voor extra energie?",
    "Hoe merk jij dat je ovulatie nadert?",
    "Wat is je favoriete manier om stress te verminderen tijdens PMS?",
    "Heb je ooit je trainingsschema aangepast aan je cyclus? Hoe bevalt dat?",
    "Welke kruiden of supplementen gebruik je voor cyclusklachten?",
    "Wat doe je om goed te slapen tijdens de luteale fase?",
    "Hoe blijf je gemotiveerd voor fitness tijdens drukke periodes?",
    "Welke lichte beweging doe je graag op rustdagen?",
    "Heb je tips voor ijzerrijke maaltijden tijdens de menstruatie?",
    "Wat is de grootste verandering die je hebt gemerkt sinds je cyclus-bewust traint?",
    "Hoe ga je om met bloating tijdens je cyclus?",
    "Welke activiteiten helpen jou het beste om te ontspannen?",
    "Wat is je favoriete proteïnebron?",
    "Hoe houd je je voeding op peil tijdens drukke werkdagen?",
    "Welk moment van de dag train jij het liefst?",
    "Heb je tips voor het omgaan met cravings?",
    "Wat doe je als je echt geen zin hebt om te trainen?",
    "Hoe zorg je voor voldoende hydratatie tijdens je cyclus?",
    "Welke podcast of muziek luister je tijdens het sporten?",
    "Heb je ooit een sport geprobeerd die je niet verwacht had leuk te vinden?",
    "Wat is je favoriete gezonde traktatie?",
    "Hoe combineer je werk en fitness?",
    "Wat is je beste tip voor beginners die cyclus-bewust willen trainen?",
    "Hoe vier je kleine successen in je fitnessreis?",
    "Welke ochtendgewoontes helpen jou de dag goed te beginnen?",
    "Wat is het beste advies dat je ooit hebt gekregen over training?",
    "Hoe ga je om met een slechte nachten rust voor een training?",
    "Welke apps gebruik je om je cyclus bij te houden?",
    "Wat eet je het liefst als ontbijt op een trainingsdag?",
    "Hoe houd je het leuk om consistent te blijven trainen?",
    "Wat is je favoriete seizoen om buiten te sporten?",
    "Heb je tips voor het opbouwen van spierkracht thuis?",
    "Welke fouten heb je gemaakt in het begin van je fitnessjournee?",
    "Hoe beloon je jezelf na een goede trainingsweek?",
    "Wat doe je om hersteltijd te optimaliseren?",
    "Heb je een training buddy of train je liever solo?",
    "Welke maaltijd bereid je graag voor als meal prep?",
    "Hoe blijf je gefocust op je fitnessdoelen tijdens vakanties?",
    "Wat inspireert jou om gezond te blijven leven?",
    "Heb je een favoriete yoga-pose of stretchoefening?"
]

export function getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0)
    const diff = date - start
    const oneDay = 1000 * 60 * 60 * 24
    return Math.floor(diff / oneDay)
}

export function getTodayDate() {
    const now = new Date()
    return now.toISOString().split('T')[0]
}

// ------------------------------------------------------------------
// MEALS HELPER
// ------------------------------------------------------------------

export function calculateMealTotals(items) {
    return items.reduce((totals, item) => {
        const factor = (item.unit === 'g' || item.unit === 'ml')
            ? item.quantity / 100
            : item.quantity

        return {
            kcal: totals.kcal + (item.kcal_100 * factor),
            protein: totals.protein + (item.protein_100 * factor),
            carbs: totals.carbs + (item.carbs_100 * factor),
            fat: totals.fat + (item.fat_100 * factor)
        }
    }, { kcal: 0, protein: 0, carbs: 0, fat: 0 })
}
