import { supabase, cors } from './_lib/shared.js'

export default async function handler(req, res) {
    cors(res)
    if (req.method === 'OPTIONS') return res.status(200).end()
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

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
