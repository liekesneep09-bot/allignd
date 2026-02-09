import { supabase, requireAuth, cors } from '../_lib/shared.js'

export default async function handler(req, res) {
    cors(res)
    if (req.method === 'OPTIONS') return res.status(200).end()
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    const { user, error: authError } = await requireAuth(req)
    if (authError) return res.status(authError.status).json({ error: authError.message })

    try {
        const { commentId, reason } = req.body

        if (!commentId) {
            return res.status(400).json({ error: 'Geen reactie opgegeven' })
        }

        // Verify comment exists
        const { data: comment } = await supabase
            .from('community_comments')
            .select('id')
            .eq('id', commentId)
            .single()

        if (!comment) {
            return res.status(404).json({ error: 'Reactie niet gevonden' })
        }

        // Insert report
        const { error } = await supabase
            .from('community_reports')
            .insert({
                comment_id: commentId,
                reporter_user_id: user.id,
                reason: reason || null
            })

        if (error) throw error

        return res.json({ ok: true })
    } catch (error) {
        console.error('Community report error:', error)
        return res.status(500).json({ error: 'Kon melding niet versturen' })
    }
}
