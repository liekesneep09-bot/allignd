import { supabase, requireAuth, cors } from '../_lib/shared.js'

export default async function handler(req, res) {
    cors(res)
    if (req.method === 'OPTIONS') return res.status(200).end()
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

    const { user, error: authError } = await requireAuth(req)
    if (authError) return res.status(authError.status).json({ error: authError.message })

    try {
        const { date } = req.query
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
