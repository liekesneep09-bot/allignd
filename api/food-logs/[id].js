import { supabase, requireAuth, cors } from '../../_lib/shared.js'

export default async function handler(req, res) {
    cors(res)
    if (req.method === 'OPTIONS') return res.status(200).end()
    if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' })

    const { user, error: authError } = await requireAuth(req)
    if (authError) return res.status(authError.status).json({ error: authError.message })

    try {
        const { id } = req.query

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
