import crypto from 'node:crypto'
import { supabase, cors, getTodayDate } from './_lib/shared.js'

const DAILY_MESSAGES = {
    nl: {
        title: 'Tijd voor je dagelijkse check-in',
        body: 'Log vandaag je beweging, water en symptomen voor een compleet beeld van je cyclus.'
    },
    en: {
        title: 'Time for your daily check-in',
        body: 'Log your movement, water and symptoms today for a fuller picture of your cycle.'
    }
}

const PHASE_MESSAGES = {
    menstrual: {
        nl: { title: 'Je menstruele fase is begonnen', body: 'Tijd voor rust en herstel. Kies lichte beweging en ijzerrijke voeding.' },
        en: { title: 'Your menstrual phase has started', body: 'Time for rest and recovery. Choose light movement and iron-rich food.' }
    },
    follicular: {
        nl: { title: 'Je folliculaire fase is begonnen', body: 'Je energie stijgt. Perfect voor opbouwende training en frisse maaltijden.' },
        en: { title: 'Your follicular phase has started', body: 'Your energy is rising. Great for build-up training and fresh meals.' }
    },
    ovulatory: {
        nl: { title: 'Je ovulatie is begonnen', body: 'Je piek in kracht en energie. Ideaal voor een stevige workout.' },
        en: { title: 'Your ovulation has started', body: 'Your peak in strength and energy. Ideal for a solid workout.' }
    },
    luteal: {
        nl: { title: 'Je luteale fase is begonnen', body: 'Fase van stabiliteit. Houd je bloedsuiker stabiel en train iets rustiger.' },
        en: { title: 'Your luteal phase has started', body: 'A phase of stability. Keep your blood sugar steady and train a little easier.' }
    }
}

function normalizePrivateKey(value) {
    if (!value) return value
    return value.replace(/\\n/g, '\n')
}

function signRsaJwt(claims, privateKey, header) {
    const enc = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url')
    const input = `${enc(header)}.${enc(claims)}`
    const signature = crypto.createSign('RSA-SHA256').update(input).sign(privateKey, 'base64url')
    return `${input}.${signature}`
}

function derToRawSignature(der) {
    let offset = 0
    if (der[0] !== 0x30) throw new Error('Invalid DER signature')
    offset = 2
    if (der[offset] !== 0x02) throw new Error('Invalid r marker')
    offset += 1
    let rLen = der[offset]
    offset += 1
    if (rLen & 0x80) {
        const nBytes = rLen & 0x7f
        rLen = der.readUIntBE(offset, nBytes)
        offset += nBytes
    }
    let r = der.subarray(offset, offset + rLen)
    offset += rLen
    if (r[0] === 0x00) r = r.subarray(1)
    if (r.length > 32) r = r.subarray(r.length - 32)
    if (r.length < 32) r = Buffer.concat([Buffer.alloc(32 - r.length), r])
    if (der[offset] !== 0x02) throw new Error('Invalid s marker')
    offset += 1
    let sLen = der[offset]
    offset += 1
    if (sLen & 0x80) {
        const nBytes = sLen & 0x7f
        sLen = der.readUIntBE(offset, nBytes)
        offset += nBytes
    }
    let s = der.subarray(offset, offset + sLen)
    if (s[0] === 0x00) s = s.subarray(1)
    if (s.length > 32) s = s.subarray(s.length - 32)
    if (s.length < 32) s = Buffer.concat([Buffer.alloc(32 - s.length), s])
    return Buffer.concat([r, s])
}

function signApnsJwt() {
    const key = normalizePrivateKey(process.env.APNS_KEY)
    const keyId = process.env.APNS_KEY_ID
    const teamId = process.env.APNS_TEAM_ID
    if (!key || !keyId || !teamId) throw new Error('Missing APNS configuration')
    const enc = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url')
    const header = { alg: 'ES256', kid: keyId }
    const claims = { iss: teamId, iat: Math.floor(Date.now() / 1000) }
    const input = `${enc(header)}.${enc(claims)}`
    const der = crypto.createSign('sha256').update(input).sign(key)
    const raw = derToRawSignature(der)
    return `${input}.${raw.toString('base64url')}`
}

async function getFcmAccessToken(serviceAccountJson) {
    const sa = JSON.parse(serviceAccountJson)
    const now = Math.floor(Date.now() / 1000)
    const assertion = signRsaJwt(
        {
            iss: sa.client_email,
            scope: 'https://www.googleapis.com/auth/firebase.messaging',
            aud: 'https://oauth2.googleapis.com/token',
            iat: now,
            exp: now + 3600
        },
        normalizePrivateKey(sa.private_key),
        { alg: 'RS256', typ: 'JWT' }
    )

    const body = new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion
    })

    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body
    })
    const data = await res.json()
    if (!res.ok) throw new Error('FCM token error: ' + (data.error_description || data.error))
    return { accessToken: data.access_token, projectId: sa.project_id }
}

async function sendFcm(token, message) {
    const serviceAccountJson = process.env.FCM_SERVICE_ACCOUNT_JSON
    if (!serviceAccountJson) throw new Error('Missing FCM_SERVICE_ACCOUNT_JSON')
    const { accessToken, projectId } = await getFcmAccessToken(serviceAccountJson)

    const res = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            message: {
                token,
                notification: { title: message.title, body: message.body },
                data: { view: message.view }
            }
        })
    })
    const data = await res.json()
    if (!res.ok) throw new Error('FCM ' + res.status + ': ' + JSON.stringify(data))
    return data
}

async function sendApns(token, message) {
    const jwt = signApnsJwt()
    const bundleId = process.env.APNS_BUNDLE_ID || 'nl.allignd.app'
    const host = process.env.APNS_ENV === 'sandbox'
        ? 'https://api.sandbox.push.apple.com/3/device/'
        : 'https://api.push.apple.com/3/device/'

    const res = await fetch(host + token, {
        method: 'POST',
        headers: {
            authorization: `bearer ${jwt}`,
            'apns-topic': bundleId,
            'apns-push-type': 'alert',
            'apns-priority': '10',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            aps: { alert: { title: message.title, body: message.body }, sound: 'default' },
            view: message.view
        })
    })
    if (!res.ok) throw new Error('APNs ' + res.status + ': ' + (await res.text()))
    return { ok: true }
}

function isApnsToken(token) {
    return /^[a-f0-9]{64}$/i.test(token)
}

async function sendToDevice(token, platform, message) {
    if (platform === 'ios' || (platform !== 'android' && isApnsToken(token))) {
        return sendApns(token, message)
    }
    return sendFcm(token, message)
}

function authorized(req) {
    const secret = process.env.CRON_SECRET || process.env.NOTIFICATIONS_SECRET
    if (!secret) {
        return { ok: false, error: { status: 503, message: 'Notifications secret niet geconfigureerd' } }
    }
    if ((req.headers.authorization || '') !== `Bearer ${secret}`) {
        return { ok: false, error: { status: 401, message: 'Niet geautoriseerd' } }
    }
    return { ok: true }
}

function parseDate(dateStr) {
    return new Date(dateStr + 'T00:00:00')
}

function cycleDay(startDate, targetDate = new Date()) {
    if (!startDate) return 1
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)
    const target = new Date(targetDate)
    target.setHours(0, 0, 0, 0)
    const diffDays = Math.floor((target - start) / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return 1
    return diffDays + 1
}

function isMenstruatingOn(dateStr, logs = []) {
    const today = parseDate(dateStr)

    const yesToday = logs.some(l => l.date === dateStr && l.status === 'yes')
    const noToday = logs.some(l => l.date === dateStr && l.status === 'no')
    if (yesToday && !noToday) return true

    const pastYes = logs
        .filter(l => l.status === 'yes' && parseDate(l.date) <= today)
        .sort((a, b) => parseDate(b.date) - parseDate(a.date))

    if (pastYes.length === 0) return false

    let clusterStartDate = parseDate(pastYes[0].date)
    for (let i = 1; i < pastYes.length; i++) {
        const prevDate = parseDate(pastYes[i].date)
        const diff = Math.round((clusterStartDate - prevDate) / (1000 * 60 * 60 * 24))
        if (diff === 1) clusterStartDate = prevDate
        else if (diff === 0) continue
        else break
    }

    const stopLogs = logs
        .filter(l => l.status === 'no' && parseDate(l.date) > clusterStartDate)
        .sort((a, b) => parseDate(a.date) - parseDate(b.date))

    const stopDate = stopLogs.length > 0 ? parseDate(stopLogs[0].date) : null

    const maxEndDate = new Date(clusterStartDate)
    maxEndDate.setDate(clusterStartDate.getDate() + 13)

    if (stopDate) {
        return today >= clusterStartDate && today < stopDate
    }
    return today >= clusterStartDate && today <= maxEndDate
}

function getPhaseForDay(day, cycleLength = 28) {
    if (!day || day < 1) return 'follicular'
    if (day > cycleLength) return 'luteal'
    const ovulationDay = cycleLength - 14
    const fertileStart = ovulationDay - 2
    const fertileEnd = ovulationDay + 2
    if (day >= fertileStart && day <= fertileEnd) return 'ovulatory'
    if (day > fertileEnd) return 'luteal'
    return 'follicular'
}

function computePhase(profile, dateStr) {
    if (profile.is_menstruating_now === true) return 'menstrual'
    if (isMenstruatingOn(dateStr, profile.menstruation_logs || [])) return 'menstrual'
    const cycleLength = profile.cycle_length || 28
    const day = cycleDay(profile.cycle_start, dateStr)
    return getPhaseForDay(day, cycleLength)
}

async function sendDaily(res) {
    const today = getTodayDate()

    const loggedToday = new Set()
    const tables = ['food_logs', 'movement_logs', 'water_logs', 'step_logs', 'symptom_logs', 'weight_logs']
    for (const table of tables) {
        const { data } = await supabase.from(table).select('user_id').eq('date', today)
        for (const row of data || []) loggedToday.add(row.user_id)
    }

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, push_token, push_platform, user_language')
        .eq('is_onboarded', true)
        .not('push_token', 'is', null)

    if (error) throw error

    const results = { sent: 0, skippedLogged: 0, errors: [] }
    for (const profile of profiles || []) {
        if (loggedToday.has(profile.id)) {
            results.skippedLogged++
            continue
        }
        const message = DAILY_MESSAGES[profile.user_language === 'en' ? 'en' : 'nl']
        try {
            await sendToDevice(profile.push_token, profile.push_platform, { ...message, view: 'today' })
            results.sent++
        } catch (e) {
            results.errors.push({ userId: profile.id, error: e.message })
        }
    }
    return res.json(results)
}

async function sendPhase(res) {
    const today = getTodayDate()

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, push_token, push_platform, user_language, cycle_start, cycle_length, is_menstruating_now, menstruation_logs, last_notified_phase')
        .eq('is_onboarded', true)
        .not('push_token', 'is', null)

    if (error) throw error

    const results = { sent: 0, alreadySent: 0, errors: [] }
    for (const profile of profiles || []) {
        const phase = profile.cycle_start ? computePhase(profile, today) : null
        if (!phase || phase === profile.last_notified_phase) {
            results.alreadySent++
            continue
        }
        const language = profile.user_language === 'en' ? 'en' : 'nl'
        const message = PHASE_MESSAGES[phase] ? PHASE_MESSAGES[phase][language] : null
        if (!message) {
            results.alreadySent++
            continue
        }
        try {
            await sendToDevice(profile.push_token, profile.push_platform, { ...message, view: 'guide' })
            await supabase.from('profiles').update({ last_notified_phase: phase }).eq('id', profile.id)
            results.sent++
        } catch (e) {
            results.errors.push({ userId: profile.id, error: e.message })
        }
    }
    return res.json(results)
}

async function sendManual(req, res) {
    const { userId, title, body, view } = req.body || {}
    if (!userId || !title || !body) {
        return res.status(400).json({ error: 'userId, title en body zijn verplicht' })
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('push_token, push_platform')
        .eq('id', userId)
        .single()

    if (!profile || !profile.push_token) {
        return res.status(404).json({ error: 'Geen push token voor deze gebruiker' })
    }

    try {
        await sendToDevice(profile.push_token, profile.push_platform, { title, body, view: view || 'today' })
        return res.json({ ok: true, sent: true })
    } catch (e) {
        console.error('Manual push error:', e)
        return res.status(500).json({ error: e.message })
    }
}

export default async function handler(req, res) {
    cors(res, req)
    if (req.method === 'OPTIONS') return res.status(200).end()

    const url = new URL(req.url, `http://${req.headers.host}`)
    const segments = url.pathname.replace('/api/notifications', '').split('/').filter(Boolean)

    const auth = authorized(req)
    if (!auth.ok) return res.status(auth.error.status).json({ error: auth.error.message })

    if (segments[0] === 'daily') {
        try {
            return await sendDaily(res)
        } catch (e) {
            console.error('Daily push error:', e)
            return res.status(500).json({ error: 'Kon dagelijkse notificaties niet versturen' })
        }
    }

    if (segments[0] === 'phase') {
        try {
            return await sendPhase(res)
        } catch (e) {
            console.error('Phase push error:', e)
            return res.status(500).json({ error: 'Kon fase notificaties niet versturen' })
        }
    }

    if (segments[0] === 'send' && req.method === 'POST') {
        return sendManual(req, res)
    }

    return res.status(404).json({ error: 'Not found' })
}