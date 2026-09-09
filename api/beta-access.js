import crypto from 'node:crypto'

const COOKIE_NAME = 'allignd_beta_access'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30

function getSecret() {
    return process.env.BETA_ACCESS_PASSWORD || ''
}

function safeEqual(left, right) {
    const leftHash = crypto.createHash('sha256').update(left).digest()
    const rightHash = crypto.createHash('sha256').update(right).digest()
    return crypto.timingSafeEqual(leftHash, rightHash)
}

function sign(value) {
    return crypto
        .createHmac('sha256', getSecret())
        .update(value)
        .digest('base64url')
}

function createAccessToken() {
    const expiresAt = Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE
    const payload = String(expiresAt)
    return `${payload}.${sign(payload)}`
}

function hasValidAccessCookie(req) {
    const cookieHeader = req.headers.cookie || ''
    const cookies = Object.fromEntries(
        cookieHeader.split(';').map((part) => {
            const [key, ...value] = part.trim().split('=')
            return [key, value.join('=')]
        }).filter(([key]) => key)
    )
    const token = cookies[COOKIE_NAME]
    if (!token || !getSecret()) return false

    const [expiresAt, signature] = token.split('.')
    const expiry = Number(expiresAt)
    if (!expiresAt || !signature || !Number.isFinite(expiry) || expiry <= Math.floor(Date.now() / 1000)) {
        return false
    }

    return safeEqual(signature, sign(expiresAt))
}

function setAccessCookie(res) {
    const flags = [
        `${COOKIE_NAME}=${createAccessToken()}`,
        'HttpOnly',
        'Path=/',
        `Max-Age=${COOKIE_MAX_AGE}`,
        'SameSite=Lax'
    ]
    if (process.env.NODE_ENV === 'production') flags.push('Secure')
    res.setHeader('Set-Cookie', flags.join('; '))
}

function setCorsHeaders(req, res) {
    const origin = req.headers.origin
    const allowedOrigins = new Set([
        'https://allignd.nl',
        'https://www.allignd.nl',
        'https://allignd.fit',
        'https://www.allignd.fit',
        'http://localhost:5173',
        'capacitor://localhost',
        'https://localhost'
    ])

    if (allowedOrigins.has(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin)
        res.setHeader('Access-Control-Allow-Credentials', 'true')
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
        res.setHeader('Vary', 'Origin')
    }
}

export default async function handler(req, res) {
    setCorsHeaders(req, res)
    res.setHeader('Cache-Control', 'no-store')

    if (req.method === 'OPTIONS') return res.status(204).end()

    if (req.method === 'GET') {
        const authorized = hasValidAccessCookie(req)
        return res.status(authorized ? 200 : 401).json({ authorized })
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const secret = getSecret()
    if (!secret) {
        console.error('BETA_ACCESS_PASSWORD is not configured')
        return res.status(503).json({ error: 'Beta access is not configured' })
    }

    let body
    try {
        body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    } catch {
        return res.status(400).json({ error: 'Invalid request' })
    }

    const password = typeof body?.password === 'string' ? body.password : ''
    if (!safeEqual(password, secret)) {
        return res.status(401).json({ error: 'Invalid access code' })
    }

    setAccessCookie(res)
    return res.status(200).json({ authorized: true })
}
