import { supabase, requireAuth, cors } from './_lib/shared.js'

async function deleteRows(table, column, value) {
    const { error } = await supabase.from(table).delete().eq(column, value)
    if (error) {
        throw new Error(`Failed to delete ${table}: ${error.message}`)
    }
}

export default async function handler(req, res) {
    cors(res, req)
    if (req.method === 'OPTIONS') return res.status(200).end()
    if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' })

    const { user, error: authError } = await requireAuth(req)
    if (authError) return res.status(authError.status).json({ error: authError.message })

    const userId = user.id

    try {
        // Delete user-generated community data before their account.
        await deleteRows('community_reports', 'reporter_user_id', userId)
        await deleteRows('community_likes', 'user_id', userId)
        await deleteRows('community_comments', 'user_id', userId)
        await deleteRows('community_posts', 'user_id', userId)

        // Meals
        const { data: userMeals, error: mealsError } = await supabase
            .from('meals')
            .select('id')
            .eq('user_id', userId)
        if (mealsError) throw new Error(`Failed to find user meals: ${mealsError.message}`)

        if (userMeals && userMeals.length > 0) {
            const mealIds = userMeals.map(m => m.id)
            const { error: mealItemsError } = await supabase.from('meal_items').delete().in('meal_id', mealIds)
            if (mealItemsError) throw new Error(`Failed to delete meal items: ${mealItemsError.message}`)
            const { error: mealsDeleteError } = await supabase.from('meals').delete().in('id', mealIds)
            if (mealsDeleteError) throw new Error(`Failed to delete meals: ${mealsDeleteError.message}`)
        }
        await deleteRows('custom_foods', 'user_id', userId)

        // Logs
        await deleteRows('food_logs', 'user_id', userId)
        await deleteRows('water_logs', 'user_id', userId)
        await deleteRows('weight_logs', 'user_id', userId)
        await deleteRows('step_logs', 'user_id', userId)
        await deleteRows('symptom_logs', 'user_id', userId)
        await deleteRows('movement_logs', 'user_id', userId)
        await deleteRows('daily_logs', 'user_id', userId)
        await deleteRows('logs', 'user_id', userId)

        await deleteRows('computed_targets', 'user_id', userId)
        await deleteRows('profiles', 'id', userId)

        // 2. Delete the auth user (requires service role key — only available server-side)
        const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)
        if (deleteError) throw deleteError

        return res.status(200).json({ ok: true })
    } catch (error) {
        console.error('Delete account error:', error)
        return res.status(500).json({ error: 'Verwijderen mislukt. Probeer het later opnieuw.' })
    }
}
