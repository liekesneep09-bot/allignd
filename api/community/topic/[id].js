import { supabase, requireAuth, cors } from '../../_lib/shared.js'

export default async function handler(req, res) {
    cors(res)
    if (req.method === 'OPTIONS') return res.status(200).end()
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

    const { user, error: authError } = await requireAuth(req)
    if (authError) return res.status(authError.status).json({ error: authError.message })

    try {
        const { id } = req.query

        const { data: topic, error: topicError } = await supabase
            .from('community_topics')
            .select('*')
            .eq('id', id)
            .single()

        if (topicError || !topic) {
            return res.status(404).json({ error: 'Onderwerp niet gevonden' })
        }

        const { data: comments, error: commentsError } = await supabase
            .from('community_comments')
            .select('*')
            .eq('topic_id', id)
            .eq('is_deleted', false)
            .order('created_at', { ascending: true })

        if (commentsError) throw commentsError

        return res.json({ topic, comments: comments || [] })
    } catch (error) {
        console.error('Community topic error:', error)
        return res.status(500).json({ error: 'Kon het onderwerp niet laden' })
    }
}
