import { supabase, requireAuth, cors, COMMUNITY_QUESTIONS, getDayOfYear, getTodayDate } from './_lib/shared.js'
import { moderateCommunityContent } from '../src/logic/community-moderation.js'

const COMMUNITY_CATEGORIES = new Set(['voeding', 'training', 'cyclus', 'algemeen'])
const COMMUNITY_PHASES = new Set(['menstrual', 'follicular', 'ovulatory', 'luteal'])

async function isAdmin(userId) {
    const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .maybeSingle()
    return data?.is_admin === true
}

function validateCommunityText(...parts) {
    const decision = moderateCommunityContent(...parts)
    if (decision.action === 'reject') return decision
    return decision
}

export default async function handler(req, res) {
    cors(res, req)
    if (req.method === 'OPTIONS') return res.status(200).end()

    const url = new URL(req.url, `http://${req.headers.host}`)
    const path = url.pathname
    // Extract path segments: /api/community/comment/123/delete → ['community','comment','123','delete']
    const segments = path.replace('/api/community/', '').split('/').filter(Boolean)

    // All community routes require auth
    const { user, error: authError } = await requireAuth(req)
    if (authError) return res.status(authError.status).json({ error: authError.message })

    // ─── POST /api/community/post ───
    if (segments[0] === 'post' && !segments[1] && req.method === 'POST') {
        try {
            const { title, body, category, phaseTag, isAnonymous, authorName } = req.body || {}
            const trimmedTitle = typeof title === 'string' ? title.trim() : ''
            const trimmedBody = typeof body === 'string' ? body.trim() : ''

            if (trimmedTitle.length < 2 || trimmedTitle.length > 120) {
                return res.status(400).json({ code: 'invalid_title', error: 'Titel moet tussen 2 en 120 tekens bevatten.' })
            }
            if (trimmedBody.length < 2 || trimmedBody.length > 3000) {
                return res.status(400).json({ code: 'invalid_body', error: 'Bericht moet tussen 2 en 3000 tekens bevatten.' })
            }
            if (!COMMUNITY_CATEGORIES.has(category)) {
                return res.status(400).json({ code: 'invalid_category', error: 'Kies een geldige categorie.' })
            }
            if (phaseTag && !COMMUNITY_PHASES.has(phaseTag)) {
                return res.status(400).json({ code: 'invalid_phase', error: 'Kies een geldige cyclusfase.' })
            }

            const decision = validateCommunityText(trimmedTitle, trimmedBody, authorName)
            if (decision.action === 'reject') {
                return res.status(422).json({ code: decision.reason, status: 'rejected' })
            }

            const moderationStatus = decision.action === 'review' ? 'pending_review' : 'approved'
            const { data: post, error } = await supabase
                .from('community_posts')
                .insert({
                    user_id: user.id,
                    author_name: String(authorName || '').trim().slice(0, 80) || 'Allignd member',
                    is_anonymous: Boolean(isAnonymous),
                    category,
                    phase_tag: phaseTag || null,
                    title: trimmedTitle,
                    body: trimmedBody,
                    moderation_status: moderationStatus
                })
                .select()
                .single()

            if (error) throw error
            return res.status(201).json({ post, moderationStatus })
        } catch (error) {
            console.error('Community post submission error:', error)
            return res.status(500).json({ code: 'submit_failed', error: 'Kon bericht niet plaatsen.' })
        }
    }

    // ─── POST /api/community/post/:id/comment ───
    if (segments[0] === 'post' && segments[1] && segments[2] === 'comment' && req.method === 'POST') {
        try {
            const { body, authorName } = req.body || {}
            const trimmedBody = typeof body === 'string' ? body.trim() : ''
            if (trimmedBody.length < 2 || trimmedBody.length > 1000) {
                return res.status(400).json({ code: 'invalid_comment', error: 'Reactie moet tussen 2 en 1000 tekens bevatten.' })
            }

            const { data: post } = await supabase
                .from('community_posts')
                .select('id, user_id, moderation_status')
                .eq('id', segments[1])
                .eq('moderation_status', 'approved')
                .maybeSingle()
            if (!post) return res.status(404).json({ code: 'post_not_found', error: 'Bericht niet gevonden.' })

            const { data: blocked } = await supabase
                .from('community_user_blocks')
                .select('blocked_user_id')
                .eq('blocker_user_id', user.id)
                .eq('blocked_user_id', post.user_id)
                .maybeSingle()
            if (blocked) return res.status(403).json({ code: 'blocked_user', error: 'Je kunt niet reageren op dit bericht.' })

            const decision = validateCommunityText(trimmedBody, authorName)
            if (decision.action === 'reject') {
                return res.status(422).json({ code: decision.reason, status: 'rejected' })
            }

            const moderationStatus = decision.action === 'review' ? 'pending_review' : 'approved'
            const { data: comment, error } = await supabase
                .from('community_comments')
                .insert({
                    post_id: post.id,
                    user_id: user.id,
                    author_name: String(authorName || '').trim().slice(0, 80) || 'Allignd member',
                    body: trimmedBody,
                    moderation_status: moderationStatus
                })
                .select()
                .single()
            if (error) throw error
            return res.status(201).json({ comment, moderationStatus })
        } catch (error) {
            console.error('Community comment submission error:', error)
            return res.status(500).json({ code: 'submit_failed', error: 'Kon reactie niet plaatsen.' })
        }
    }

    // ─── GET /api/community/blocks ───
    if (segments[0] === 'blocks' && req.method === 'GET') {
        const { data, error } = await supabase
            .from('community_user_blocks')
            .select('blocked_user_id')
            .eq('blocker_user_id', user.id)
        if (error) return res.status(500).json({ error: 'Geblokkeerde gebruikers konden niet worden geladen.' })
        const ids = (data || []).map(row => row.blocked_user_id)
        const { data: profiles } = ids.length
            ? await supabase.from('profiles').select('id, name').in('id', ids)
            : { data: [] }
        const namesById = new Map((profiles || []).map(profile => [profile.id, profile.name]))
        return res.json({ blockedUsers: ids.map(id => ({ id, name: namesById.get(id) || 'Allignd member' })) })
    }

    // ─── POST /api/community/block ───
    if (segments[0] === 'block' && !segments[1] && req.method === 'POST') {
        const blockedUserId = req.body?.blockedUserId
        if (!blockedUserId || blockedUserId === user.id) {
            return res.status(400).json({ error: 'Deze gebruiker kan niet worden geblokkeerd.' })
        }
        const { error } = await supabase
            .from('community_user_blocks')
            .upsert({ blocker_user_id: user.id, blocked_user_id: blockedUserId }, { onConflict: 'blocker_user_id,blocked_user_id' })
        if (error) return res.status(500).json({ error: 'Gebruiker blokkeren is mislukt.' })
        return res.json({ ok: true })
    }

    // ─── DELETE /api/community/block/:userId ───
    if (segments[0] === 'block' && segments[1] && req.method === 'DELETE') {
        const { error } = await supabase
            .from('community_user_blocks')
            .delete()
            .eq('blocker_user_id', user.id)
            .eq('blocked_user_id', segments[1])
        if (error) return res.status(500).json({ error: 'Gebruiker deblokkeren is mislukt.' })
        return res.json({ ok: true })
    }

    // ─── GET /api/community/moderation ───
    if (segments[0] === 'moderation' && !segments[1] && req.method === 'GET') {
        if (!await isAdmin(user.id)) return res.status(403).json({ error: 'Geen toegang tot moderatie.' })
        try {
            const [posts, comments, reports] = await Promise.all([
                supabase.from('community_posts').select('*').eq('moderation_status', 'pending_review').order('created_at', { ascending: true }),
                supabase.from('community_comments').select('*').eq('moderation_status', 'pending_review').order('created_at', { ascending: true }),
                supabase.from('community_content_reports').select('*').eq('status', 'open').order('created_at', { ascending: true })
            ])
            const resultError = posts.error || comments.error || reports.error
            if (resultError) throw resultError

            const reportItems = await Promise.all((reports.data || []).map(async report => {
                const table = report.content_type === 'post' ? 'community_posts' : 'community_comments'
                const { data: content } = await supabase.from(table).select('*').eq('id', report.content_id).maybeSingle()
                return { ...report, content }
            }))

            return res.json({ pendingPosts: posts.data || [], pendingComments: comments.data || [], reports: reportItems })
        } catch (error) {
            console.error('Community moderation queue error:', error)
            return res.status(500).json({ error: 'Moderatie-inbox kon niet worden geladen.' })
        }
    }

    // ─── POST /api/community/moderation/approve ───
    if (segments[0] === 'moderation' && segments[1] === 'approve' && req.method === 'POST') {
        if (!await isAdmin(user.id)) return res.status(403).json({ error: 'Geen toegang tot moderatie.' })
        const { contentType, contentId } = req.body || {}
        const table = contentType === 'post' ? 'community_posts' : contentType === 'comment' ? 'community_comments' : null
        if (!table || !contentId) return res.status(400).json({ error: 'Ongeldige inhoud.' })
        const { error } = await supabase.from(table).update({ moderation_status: 'approved' }).eq('id', contentId).eq('moderation_status', 'pending_review')
        if (error) return res.status(500).json({ error: 'Bericht goedkeuren is mislukt.' })
        return res.json({ ok: true })
    }

    // ─── POST /api/community/moderation/remove ───
    if (segments[0] === 'moderation' && segments[1] === 'remove' && req.method === 'POST') {
        if (!await isAdmin(user.id)) return res.status(403).json({ error: 'Geen toegang tot moderatie.' })
        const { contentType, contentId } = req.body || {}
        const table = contentType === 'post' ? 'community_posts' : contentType === 'comment' ? 'community_comments' : null
        if (!table || !contentId) return res.status(400).json({ error: 'Ongeldige inhoud.' })
        const { error } = await supabase.from(table).update({ moderation_status: 'rejected' }).eq('id', contentId)
        if (error) return res.status(500).json({ error: 'Inhoud verwijderen is mislukt.' })
        if (contentType === 'post') {
            const { error: commentsError } = await supabase
                .from('community_comments')
                .update({ moderation_status: 'rejected' })
                .eq('post_id', contentId)
            if (commentsError) return res.status(500).json({ error: 'Reacties bij dit bericht konden niet worden verwijderd.' })
        }
        return res.json({ ok: true })
    }

    // ─── POST /api/community/moderation/resolve-report ───
    if (segments[0] === 'moderation' && segments[1] === 'resolve-report' && req.method === 'POST') {
        if (!await isAdmin(user.id)) return res.status(403).json({ error: 'Geen toegang tot moderatie.' })
        const reportId = req.body?.reportId
        if (!reportId) return res.status(400).json({ error: 'Geen melding opgegeven.' })
        const { error } = await supabase.from('community_content_reports').update({ status: 'reviewed', reviewed_at: new Date().toISOString(), reviewed_by: user.id }).eq('id', reportId)
        if (error) return res.status(500).json({ error: 'Melding afhandelen is mislukt.' })
        return res.json({ ok: true })
    }

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
                .eq('moderation_status', 'approved')
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
                .eq('moderation_status', 'approved')
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

            const decision = validateCommunityText(trimmedBody)
            if (decision.action === 'reject') {
                return res.status(422).json({ code: decision.reason, status: 'rejected' })
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
                    body: trimmedBody,
                    moderation_status: decision.action === 'review' ? 'pending_review' : 'approved'
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

            // Fetch user profile to check admin status
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', user.id)
                .single()

            const isAdmin = profile?.is_admin === true

            if (comment.user_id !== user.id && !isAdmin) {
                return res.status(403).json({ error: 'Je kunt alleen je eigen reacties verwijderen (tenzij je admin bent)' })
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
            const body = req.body || {}
            const contentType = body.contentType || (body.commentId ? 'comment' : null)
            const contentId = body.contentId || body.commentId
            const table = contentType === 'post' ? 'community_posts' : contentType === 'comment' ? 'community_comments' : null
            if (!table || !contentId) return res.status(400).json({ error: 'Kies een bericht of reactie om te melden.' })

            const { data: content } = await supabase
                .from(table)
                .select('id, user_id')
                .eq('id', contentId)
                .maybeSingle()
            if (!content) return res.status(404).json({ error: 'Inhoud niet gevonden.' })
            if (content.user_id === user.id) return res.status(400).json({ error: 'Je kunt je eigen inhoud niet melden.' })

            const { error } = await supabase
                .from('community_content_reports')
                .upsert({
                    content_type: contentType,
                    content_id: contentId,
                    reporter_user_id: user.id,
                    reason: typeof body.reason === 'string' ? body.reason.trim().slice(0, 500) : null,
                    status: 'open'
                }, { onConflict: 'reporter_user_id,content_type,content_id' })

            if (error) throw error
            return res.json({ ok: true })
        } catch (error) {
            console.error('Community report error:', error)
            return res.status(500).json({ error: 'Kon melding niet versturen' })
        }
    }

    return res.status(404).json({ error: 'Not found' })
}
