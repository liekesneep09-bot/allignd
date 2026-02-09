import { supabase, getUserFromToken, cors } from './_lib/shared.js'

export default async function handler(req, res) {
    cors(res)
    if (req.method === 'OPTIONS') return res.status(200).end()
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

    const authHeader = req.headers.authorization
    const deviceId = req.headers['x-device-id']

    // Try to get authenticated user
    const user = await getUserFromToken(authHeader)
    const userId = user?.id

    // Must have either user or device id
    if (!userId && !deviceId) {
        return res.status(400).json({ error: 'Missing authentication or device ID' })
    }

    try {
        // 1. Ensure profile exists (upsert)
        const profileData = userId
            ? { user_id: userId, device_id: deviceId || null }
            : { device_id: deviceId }

        const { error: profileError } = await supabase
            .from('profiles')
            .upsert(profileData, { onConflict: userId ? 'user_id' : 'device_id' })

        if (profileError) {
            console.error('Profile upsert error:', profileError)
        }

        // 2. Fetch logs (prefer user_id if available)
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
