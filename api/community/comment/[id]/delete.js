import { supabase, requireAuth, cors } from '../../../_lib/shared.js'

export default async function handler(req, res) {
    cors(res)
    if (req.method === 'OPTIONS') return res.status(200).end()
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    const { user, error: authError } = await requireAuth(req)
    if (authError) return res.status(authError.status).json({ error: authError.message })

    try {
        const { id } = req.query

        // Verify ownership
        const { data: comment } = await supabase
            .from('community_comments')
            .select('user_id')
            .eq('id', id)
            .single()

        if (!comment) {
            return res.status(404).json({ error: 'Reactie niet gevonden' })
        }

        if (comment.user_id !== user.id) {
            return res.status(403).json({ error: 'Je kunt alleen je eigen reacties verwijderen' })
        }

        // Soft delete
        const { error } = await supabase
            .from('community_comments')
            .update({ is_deleted: true })
            .eq('id', id)

        if (error) throw error

        return res.json({ ok: true })
    } catch (error) {
        console.error('Community delete error:', error)
        return res.status(500).json({ error: 'Kon reactie niet verwijderen' })
    }
}
