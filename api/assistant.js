import OpenAI from 'openai'
import { cors } from './_lib/shared.js'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default async function handler(req, res) {
    cors(res)
    if (req.method === 'OPTIONS') return res.status(200).end()
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    try {
        const { message } = req.body

        if (!message) {
            return res.status(400).json({ error: 'Geen message ontvangen.' })
        }

        if (!process.env.OPENAI_API_KEY) {
            return res.status(400).json({ error: 'No API Key' })
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'Je bent een vriendelijke fitness & voeding assistent voor vrouwen. Geef korte, duidelijke antwoorden zonder medische claims.'
                },
                { role: 'user', content: message }
            ],
            temperature: 0.7
        })

        const reply = completion.choices?.[0]?.message?.content || ''
        return res.json({ reply })
    } catch (error) {
        console.error('OpenAI Error:', error?.message)
        return res.status(500).json({
            error: 'Er ging iets mis met de assistent.',
            details: error?.message || String(error)
        })
    }
}
