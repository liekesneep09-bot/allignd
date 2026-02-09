import { supabase, requireAuth, cors, COMMUNITY_QUESTIONS, getDayOfYear, getTodayDate } from '../_lib/shared.js'

export default async function handler(req, res) {
    cors(res)
    if (req.method === 'OPTIONS') return res.status(200).end()
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

    const { user, error: authError } = await requireAuth(req)
    if (authError) return res.status(authError.status).json({ error: authError.message })

    try {
        const today = getTodayDate()

        // Try to find today's topic
        let { data: topic } = await supabase
            .from('community_topics')
            .select('*')
            .eq('date', today)
            .single()

        // If not found, create it
        if (!topic) {
            const dayIndex = getDayOfYear(new Date())
            const question = COMMUNITY_QUESTIONS[dayIndex % COMMUNITY_QUESTIONS.length]

            const { data: newTopic, error: createError } = await supabase
                .from('community_topics')
                .insert({ date: today, question })
                .select()
                .single()

            if (createError) throw createError
            topic = newTopic
        }

        // Get comments for topic
        const { data: comments, error: commentsError } = await supabase
            .from('community_comments')
            .select('*')
            .eq('topic_id', topic.id)
            .eq('is_deleted', false)
            .order('created_at', { ascending: true })

        if (commentsError) throw commentsError

        return res.json({ topic, comments: comments || [] })
    } catch (error) {
        console.error('Community today error:', error)
        return res.status(500).json({ error: 'Kon de community niet laden' })
    }
}
