import { supabase, requireAuth, cors, COMMUNITY_QUESTIONS, getDayOfYear, getTodayDate } from './_lib/shared.js'

export default async function handler(req, res) {
    cors(res)
    if (req.method === 'OPTIONS') return res.status(200).end()

    const url = new URL(req.url, `http://${req.headers.host}`)
    const path = url.pathname
    // Extract path segments: /api/community/comment/123/delete → ['community','comment','123','delete']
    const segments = path.replace('/api/community/', '').split('/').filter(Boolean)

    // All community routes require auth
    const { user, error: authError } = await requireAuth(req)
    if (authError) return res.status(authError.status).json({ error: authError.message })

    // ─── GET /api/community/today ───
    if (segments[0] === 'today' && req.method === 'GET') {
        try {
            const today = getTodayDate()

            let { data: topic } = await supabase
                .from('community_topics')
                .select('*')
                .eq('date', today)
                .single()

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

    // ─── GET /api/community/topics ───
    if (segments[0] === 'topics' && req.method === 'GET') {
        try {
            const limit = Math.min(parseInt(url.searchParams.get('limit')) || 30, 100)

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

    // ─── GET /api/community/topic/:id ───
    if (segments[0] === 'topic' && segments[1] && req.method === 'GET') {
        try {
            const id = segments[1]

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

    // ─── POST /api/community/comment ───
    if (segments[0] === 'comment' && !segments[1] && req.method === 'POST') {
        try {
            const { topicId, body } = req.body

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

            const { data: topic } = await supabase
                .from('community_topics')
                .select('id')
                .eq('id', topicId)
                .single()

            if (!topic) {
                return res.status(404).json({ error: 'Onderwerp niet gevonden' })
            }

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

    // ─── POST /api/community/comment/:id/delete ───
    if (segments[0] === 'comment' && segments[1] && segments[2] === 'delete' && req.method === 'POST') {
        try {
            const id = segments[1]

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

    // ─── POST /api/community/report ───
    if (segments[0] === 'report' && req.method === 'POST') {
        try {
            const { commentId, reason } = req.body

            if (!commentId) {
                return res.status(400).json({ error: 'Geen reactie opgegeven' })
            }

            const { data: comment } = await supabase
                .from('community_comments')
                .select('id')
                .eq('id', commentId)
                .single()

            if (!comment) {
                return res.status(404).json({ error: 'Reactie niet gevonden' })
            }

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

    return res.status(404).json({ error: 'Not found' })
}
