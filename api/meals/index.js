import { supabase, requireAuth, cors, calculateMealTotals } from '../_lib/shared.js'

export default async function handler(req, res) {
    cors(res)
    if (req.method === 'OPTIONS') return res.status(200).end()

    const { user, error: authError } = await requireAuth(req)
    if (authError) return res.status(authError.status).json({ error: authError.message })

    // GET /api/meals — List user's meals with calculated totals
    if (req.method === 'GET') {
        try {
            const { data: meals, error: mealsError } = await supabase
                .from('meals')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (mealsError) throw mealsError

            const mealIds = meals.map(m => m.id)
            let itemsMap = {}

            if (mealIds.length > 0) {
                const { data: items, error: itemsError } = await supabase
                    .from('meal_items')
                    .select('*')
                    .in('meal_id', mealIds)

                if (itemsError) throw itemsError

                items.forEach(item => {
                    if (!itemsMap[item.meal_id]) itemsMap[item.meal_id] = []
                    itemsMap[item.meal_id].push(item)
                })
            }

            const mealsWithTotals = meals.map(meal => {
                const mealItems = itemsMap[meal.id] || []
                const totals = calculateMealTotals(mealItems)
                return {
                    ...meal,
                    items: mealItems,
                    totals: {
                        kcal: Math.round(totals.kcal),
                        protein: Math.round(totals.protein * 10) / 10,
                        carbs: Math.round(totals.carbs * 10) / 10,
                        fat: Math.round(totals.fat * 10) / 10
                    }
                }
            })

            return res.json({ meals: mealsWithTotals })
        } catch (error) {
            console.error('Meals list error:', error)
            return res.status(500).json({ error: 'Kon gerechten niet laden' })
        }
    }

    // POST /api/meals — Create a new meal with items
    if (req.method === 'POST') {
        try {
            const { name, category, items } = req.body

            if (!name || !name.trim()) {
                return res.status(400).json({ error: 'Naam is verplicht' })
            }

            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ error: 'Voeg minimaal 1 ingredient toe' })
            }

            const { data: meal, error: mealError } = await supabase
                .from('meals')
                .insert({
                    user_id: user.id,
                    name: name.trim(),
                    category: category || null
                })
                .select()
                .single()

            if (mealError) throw mealError

            const itemRecords = items.map(item => ({
                meal_id: meal.id,
                product_id: item.product_id,
                product_name: item.product_name,
                quantity: item.quantity,
                unit: item.unit || 'g',
                kcal_100: item.kcal_100,
                protein_100: item.protein_100,
                carbs_100: item.carbs_100,
                fat_100: item.fat_100
            }))

            const { data: insertedItems, error: itemsError } = await supabase
                .from('meal_items')
                .insert(itemRecords)
                .select()

            if (itemsError) throw itemsError

            const totals = calculateMealTotals(insertedItems)

            return res.json({
                meal: {
                    ...meal,
                    items: insertedItems,
                    totals: {
                        kcal: Math.round(totals.kcal),
                        protein: Math.round(totals.protein * 10) / 10,
                        carbs: Math.round(totals.carbs * 10) / 10,
                        fat: Math.round(totals.fat * 10) / 10
                    }
                }
            })
        } catch (error) {
            console.error('Meal create error:', error)
            return res.status(500).json({ error: 'Kon gerecht niet opslaan' })
        }
    }

    return res.status(405).json({ error: 'Method not allowed' })
}
