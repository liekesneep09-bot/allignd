import { supabase, requireAuth, cors } from '../_lib/shared.js'

export default async function handler(req, res) {
    cors(res)
    if (req.method === 'OPTIONS') return res.status(200).end()
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    const { user, error: authError } = await requireAuth(req)
    if (authError) return res.status(authError.status).json({ error: authError.message })

    try {
        const { topicId, body } = req.body

        // Validate
        if (!topicId || !body) {
            return res.status(400).json({ error: 'Vul een reactie in' })
        }

        const trimmedBody = body.trim()
        if (trimmedBody.length < 2) {
            return res.status(400).json({ error: 'Reactie moet minimaal 2 tekens zijn' })
        }
        if (trimmedBody.length > 500) {
            return res.status(400).json({ error: 'Reactie mag maximaal 500 tekens zijn' })
        }

        // Verify topic exists
        const { data: topic } = await supabase
            .from('community_topics')
            .select('id')
            .eq('id', topicId)
            .single()

        if (!topic) {
            return res.status(404).json({ error: 'Onderwerp niet gevonden' })
        }

        // Insert comment
        const { data: comment, error } = await supabase
            .from('community_comments')
            .insert({
                topic_id: topicId,
                user_id: user.id,
                body: trimmedBody
            })
            .select()
            .single()

        if (error) throw error

        return res.json({ comment })
    } catch (error) {
        console.error('Community comment error:', error)
        return res.status(500).json({ error: 'Kon reactie niet plaatsen' })
    }
}
