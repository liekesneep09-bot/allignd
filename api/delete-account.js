import { supabase, requireAuth, cors } from './_lib/shared.js'

export default async function handler(req, res) {
    cors(res, req)
    if (req.method === 'OPTIONS') return res.status(200).end()
    if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' })

    const { user, error: authError } = await requireAuth(req)
    if (authError) return res.status(authError.status).json({ error: authError.message })

    const userId = user.id

    try {
        // 1. Delete all user data in the correct order (to avoid FK conflicts)
        await supabase.from('community_reports').delete().eq('reporter_user_id', userId)
        await supabase.from('community_comments').delete().eq('user_id', userId)
        
        // Meals
        const { data: userMeals } = await supabase.from('meals').select('id').eq('user_id', userId)
        if (userMeals && userMeals.length > 0) {
            const mealIds = userMeals.map(m => m.id)
            await supabase.from('meal_items').delete().in('meal_id', mealIds)
            await supabase.from('meals').delete().in('id', mealIds)
        }
        await supabase.from('custom_foods').delete().eq('user_id', userId)

        // Logs
        await supabase.from('food_logs').delete().eq('user_id', userId)
        await supabase.from('water_logs').delete().eq('user_id', userId)
        await supabase.from('weight_logs').delete().eq('user_id', userId)
        await supabase.from('step_logs').delete().eq('user_id', userId)
        await supabase.from('symptom_logs').delete().eq('user_id', userId)
        await supabase.from('movement_logs').delete().eq('user_id', userId)
        await supabase.from('daily_logs').delete().eq('user_id', userId)
        await supabase.from('logs').delete().eq('user_id', userId)
        
        await supabase.from('computed_targets').delete().eq('user_id', userId)
        await supabase.from('profiles').delete().eq('user_id', userId)
        await supabase.from('profiles').delete().eq('id', userId)

        // 2. Delete the auth user (requires service role key — only available server-side)
        const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)
        if (deleteError) throw deleteError

        return res.status(200).json({ ok: true })
    } catch (error) {
        console.error('Delete account error:', error)
        return res.status(500).json({ error: 'Verwijderen mislukt. Probeer het later opnieuw.' })
    }
}
