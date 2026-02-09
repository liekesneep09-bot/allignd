import { supabase, cors } from '../_lib/shared.js'

export default async function handler(req, res) {
    cors(res)
    if (req.method === 'OPTIONS') return res.status(200).end()
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

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
