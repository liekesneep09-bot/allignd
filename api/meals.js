import { supabase, requireAuth, cors, calculateMealTotals } from './_lib/shared.js'

export default async function handler(req, res) {
    cors(res)
    if (req.method === 'OPTIONS') return res.status(200).end()

    const url = new URL(req.url, `http://${req.headers.host}`)
    const path = url.pathname

    // All routes require auth
    const { user, error: authError } = await requireAuth(req)
    if (authError) return res.status(authError.status).json({ error: authError.message })

    // ═══════════════════════════════════════════════════
    // FOOD LOGS ROUTES
    // ═══════════════════════════════════════════════════

    // ─── GET /api/food-logs ───
    if (path === '/api/food-logs' && req.method === 'GET') {
        try {
            const date = url.searchParams.get('date')
            const targetDate = date || new Date().toISOString().split('T')[0]

            const { data: logs, error } = await supabase
                .from('food_logs')
                .select('*')
                .eq('user_id', user.id)
                .eq('date', targetDate)
                .order('created_at', { ascending: true })

            if (error) throw error
            return res.json({ logs: logs || [] })
        } catch (error) {
            console.error('Food logs error:', error)
            return res.status(500).json({ error: 'Kon logs niet laden' })
        }
    }

    // ─── DELETE /api/food-logs/:id ───
    const foodLogMatch = path.match(/^\/api\/food-logs\/([^/]+)$/)
    if (foodLogMatch && req.method === 'DELETE') {
        try {
            const id = foodLogMatch[1]

            const { error } = await supabase
                .from('food_logs')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id)

            if (error) throw error
            return res.json({ ok: true })
        } catch (error) {
            console.error('Food log delete error:', error)
            return res.status(500).json({ error: 'Kon log niet verwijderen' })
        }
    }

    // ═══════════════════════════════════════════════════
    // MEALS ROUTES
    // ═══════════════════════════════════════════════════

    // ─── GET /api/meals (list all) ───
    if (path === '/api/meals' && req.method === 'GET') {
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

    // ─── POST /api/meals (create) ───
    if (path === '/api/meals' && req.method === 'POST') {
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

    // ─── POST /api/meals/:id/log ───
    const mealLogMatch = path.match(/^\/api\/meals\/([^/]+)\/log$/)
    if (mealLogMatch && req.method === 'POST') {
        try {
            const id = mealLogMatch[1]
            const { date } = req.body
            const targetDate = date || new Date().toISOString().split('T')[0]

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

    // ─── GET/PUT/DELETE /api/meals/:id ───
    const mealIdMatch = path.match(/^\/api\/meals\/([^/]+)$/)
    if (mealIdMatch) {
        const id = mealIdMatch[1]

        // GET single meal
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

        // PUT update meal
        if (req.method === 'PUT') {
            try {
                const { name, category, items } = req.body

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

        // DELETE meal
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
    }

    return res.status(404).json({ error: 'Not found' })
}
