import { supabase, getUserFromToken, cors } from './_lib/shared.js'

export default async function handler(req, res) {
    cors(res)
    if (req.method === 'OPTIONS') return res.status(200).end()

    // Parse the sub-route from the URL
    const url = new URL(req.url, `http://${req.headers.host}`)
    const path = url.pathname

    // ─── GET /api/bootstrap ───
    if (path === '/api/bootstrap' && req.method === 'GET') {
        const authHeader = req.headers.authorization
        const deviceId = req.headers['x-device-id']
        const user = await getUserFromToken(authHeader)
        const userId = user?.id

        if (!userId && !deviceId) {
            return res.status(400).json({ error: 'Missing authentication or device ID' })
        }

        try {
            const profileData = userId
                ? { user_id: userId, device_id: deviceId || null }
                : { device_id: deviceId }

            const { error: profileError } = await supabase
                .from('profiles')
                .upsert(profileData, { onConflict: userId ? 'user_id' : 'device_id' })

            if (profileError) console.error('Profile upsert error:', profileError)

            let query = supabase.from('logs').select('*')
            if (userId) {
                query = query.eq('user_id', userId)
            } else {
                query = query.eq('device_id', deviceId)
            }

            const { data: logs, error: logsError } = await query
                .order('date', { ascending: true })
                .order('created_at', { ascending: true })

            if (logsError) throw logsError
            return res.json({ logs, userId })
        } catch (error) {
            console.error('Bootstrap Error:', error)
            return res.status(500).json({ error: 'Failed to bootstrap data' })
        }
    }

    // ─── POST /api/log ───
    if (path === '/api/log' && req.method === 'POST') {
        const { deviceId, userId, date, type, data } = req.body

        if ((!deviceId && !userId) || !date || !type || !data) {
            return res.status(400).json({ error: 'Missing required fields' })
        }

        try {
            const logEntry = { date, type, data }
            if (userId) logEntry.user_id = userId
            if (deviceId) logEntry.device_id = deviceId

            const { error } = await supabase.from('logs').insert(logEntry)
            if (error) throw error
            return res.json({ ok: true })
        } catch (error) {
            console.error('Log Error:', error)
            return res.status(500).json({ error: 'Failed to save log' })
        }
    }

    // ─── POST /api/logs/batch ───
    if (path === '/api/logs/batch' && req.method === 'POST') {
        const { deviceId, logs } = req.body

        if (!deviceId || !logs || !Array.isArray(logs)) {
            return res.status(400).json({ error: 'Invalid batch request' })
        }

        try {
            const records = logs.map(log => ({
                device_id: deviceId,
                date: log.date,
                type: log.type,
                data: log.data
            }))

            const { error } = await supabase.from('logs').insert(records)
            if (error) throw error
            return res.json({ ok: true })
        } catch (error) {
            console.error('Batch Log Error:', error)
            return res.status(500).json({ error: 'Failed to sync batch logs' })
        }
    }

    return res.status(404).json({ error: 'Not found' })
}
