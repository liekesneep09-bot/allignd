import { supabase, requireAuth, cors, calculateMealTotals } from '../../_lib/shared.js'

export default async function handler(req, res) {
    cors(res)
    if (req.method === 'OPTIONS') return res.status(200).end()

    const { user, error: authError } = await requireAuth(req)
    if (authError) return res.status(authError.status).json({ error: authError.message })

    const { id } = req.query

    // GET /api/meals/:id — Get single meal with items
    if (req.method === 'GET') {
        try {
            const { data: meal, error: mealError } = await supabase
                .from('meals')
                .select('*')
                .eq('id', id)
                .eq('user_id', user.id)
                .single()

            if (mealError || !meal) {
                return res.status(404).json({ error: 'Gerecht niet gevonden' })
            }

            const { data: items, error: itemsError } = await supabase
                .from('meal_items')
                .select('*')
                .eq('meal_id', id)

            if (itemsError) throw itemsError

            const totals = calculateMealTotals(items || [])

            return res.json({
                meal: {
                    ...meal,
                    items: items || [],
                    totals: {
                        kcal: Math.round(totals.kcal),
                        protein: Math.round(totals.protein * 10) / 10,
                        carbs: Math.round(totals.carbs * 10) / 10,
                        fat: Math.round(totals.fat * 10) / 10
                    }
                }
            })
        } catch (error) {
            console.error('Meal get error:', error)
            return res.status(500).json({ error: 'Kon gerecht niet laden' })
        }
    }

    // PUT /api/meals/:id — Update meal
    if (req.method === 'PUT') {
        try {
            const { name, category, items } = req.body

            // Verify ownership
            const { data: existing } = await supabase
                .from('meals')
                .select('id')
                .eq('id', id)
                .eq('user_id', user.id)
                .single()

            if (!existing) {
                return res.status(404).json({ error: 'Gerecht niet gevonden' })
            }

            const { error: updateError } = await supabase
                .from('meals')
                .update({
                    name: name?.trim() || existing.name,
                    category: category !== undefined ? category : existing.category
                })
                .eq('id', id)

            if (updateError) throw updateError

            // If items provided, replace all items
            if (items && Array.isArray(items)) {
                await supabase.from('meal_items').delete().eq('meal_id', id)

                if (items.length > 0) {
                    const itemRecords = items.map(item => ({
                        meal_id: id,
                        product_id: item.product_id,
                        product_name: item.product_name,
                        quantity: item.quantity,
                        unit: item.unit || 'g',
                        kcal_100: item.kcal_100,
                        protein_100: item.protein_100,
                        carbs_100: item.carbs_100,
                        fat_100: item.fat_100
                    }))

                    await supabase.from('meal_items').insert(itemRecords)
                }
            }

            // Fetch updated meal
            const { data: meal } = await supabase
                .from('meals')
                .select('*')
                .eq('id', id)
                .single()

            const { data: updatedItems } = await supabase
                .from('meal_items')
                .select('*')
                .eq('meal_id', id)

            const totals = calculateMealTotals(updatedItems || [])

            return res.json({
                meal: {
                    ...meal,
                    items: updatedItems || [],
                    totals: {
                        kcal: Math.round(totals.kcal),
                        protein: Math.round(totals.protein * 10) / 10,
                        carbs: Math.round(totals.carbs * 10) / 10,
                        fat: Math.round(totals.fat * 10) / 10
                    }
                }
            })
        } catch (error) {
            console.error('Meal update error:', error)
            return res.status(500).json({ error: 'Kon gerecht niet bijwerken' })
        }
    }

    // DELETE /api/meals/:id — Delete meal
    if (req.method === 'DELETE') {
        try {
            const { error } = await supabase
                .from('meals')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id)

            if (error) throw error

            return res.json({ ok: true })
        } catch (error) {
            console.error('Meal delete error:', error)
            return res.status(500).json({ error: 'Kon gerecht niet verwijderen' })
        }
    }

    return res.status(405).json({ error: 'Method not allowed' })
}
