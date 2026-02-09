import { supabase, requireAuth, cors, calculateMealTotals } from '../../../_lib/shared.js'

export default async function handler(req, res) {
    cors(res)
    if (req.method === 'OPTIONS') return res.status(200).end()
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    const { user, error: authError } = await requireAuth(req)
    if (authError) return res.status(authError.status).json({ error: authError.message })

    try {
        const { id } = req.query
        const { date } = req.body
        const targetDate = date || new Date().toISOString().split('T')[0]

        // Get meal with items
        const { data: meal } = await supabase
            .from('meals')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (!meal) {
            return res.status(404).json({ error: 'Gerecht niet gevonden' })
        }

        const { data: items } = await supabase
            .from('meal_items')
            .select('*')
            .eq('meal_id', id)

        const totals = calculateMealTotals(items || [])

        // Insert food log
        const { data: log, error: logError } = await supabase
            .from('food_logs')
            .insert({
                user_id: user.id,
                source_type: 'meal',
                source_id: id,
                name_snapshot: meal.name,
                totals_kcal: Math.round(totals.kcal * 10) / 10,
                totals_protein: Math.round(totals.protein * 10) / 10,
                totals_carbs: Math.round(totals.carbs * 10) / 10,
                totals_fat: Math.round(totals.fat * 10) / 10,
                date: targetDate
            })
            .select()
            .single()

        if (logError) throw logError

        return res.json({ log })
    } catch (error) {
        console.error('Meal log error:', error)
        return res.status(500).json({ error: 'Kon gerecht niet loggen' })
    }
}
