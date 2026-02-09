import { supabase, requireAuth, cors } from '../_lib/shared.js'

export default async function handler(req, res) {
    cors(res)
    if (req.method === 'OPTIONS') return res.status(200).end()
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

    const { user, error: authError } = await requireAuth(req)
    if (authError) return res.status(authError.status).json({ error: authError.message })

    try {
        const limit = Math.min(parseInt(req.query.limit) || 30, 100)

        const { data: topics, error } = await supabase
            .from('community_topics')
            .select('*')
            .order('date', { ascending: false })
            .limit(limit)

        if (error) throw error

        return res.json({ topics: topics || [] })
    } catch (error) {
        console.error('Community topics error:', error)
        return res.status(500).json({ error: 'Kon de onderwerpen niet laden' })
    }
}
