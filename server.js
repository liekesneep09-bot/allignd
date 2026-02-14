
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});

dotenv.config();

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI
// Note: This requires OPENAI_API_KEY in .env file
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
Je bent een rustige, deskundige gids voor vrouwen die traint en eet volgens haar cyclus.
Je bent GEEN dokter. Geef NOOIT medisch advies.
Bij ernstige klachten, pijn of mentale problemen: verwijs naar de huisarts.

Jouw toon is:
- Kalm en geruststellend
- Praktisch en 'down to earth' (geen zweverige taal)
- Niet oordelend

Je antwoorden zijn:
- In het Nederlands
- Kort en bondig (max 5-10 regels)
- Gericht op praktische aanpassingen in training of voeding
- Gebaseerd op de cyclusfase van de gebruiker

CONTEXT:
De gebruiker stuurt haar huidige cyclusfase mee. Gebruik dit om je advies te kleuren.
- Menstruatie (Winter): Focus op rust, comfort, warmte, ijzerrijk eten.
- Folliculair (Lente): Focus op opbouw, frisse energie, koolhydraten.
- Ovulatie (Zomer): Focus op kracht, zelfvertrouwen, performance.
- Luteaal (Herfst): Focus op stabiliteit, bloedsuiker, mildheid.
`;

app.post('/api/assistant', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Geen message ontvangen." });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(400).json({ error: "No API Key" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Je bent een vriendelijke fitness & voeding assistent voor vrouwen. Geef korte, duidelijke antwoorden zonder medische claims.",
        },
        { role: "user", content: message },
      ],
      temperature: 0.7,
    });

    const reply = completion.choices?.[0]?.message?.content || "";
    return res.json({ reply });
  } catch (error) {
    console.error("OpenAI Error (full):", error);
    console.error("OpenAI Error message:", error?.message);
    console.error("OpenAI Error status:", error?.status);


    return res.status(500).json({
      error: "Er ging iets mis met de assistent.",
      details: error?.message || String(error),
    });
  }

});

console.log("About to start server...");


// Initialize Stripe
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// POST /api/create-checkout-session
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { priceId, mode } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: 'Missing priceId' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'ideal'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode || 'subscription',
      subscription_data: {
        trial_period_days: 7,
      },
      success_url: `${req.headers.origin}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/subscription`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe Error:', err);
    res.status(500).json({ error: err.message });
  }
});

import { createClient } from '@supabase/supabase-js'

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// ------------------------------------------------------------------
// AUTH MIDDLEWARE
// ------------------------------------------------------------------

// Helper to extract user from token
async function getUserFromToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error) throw error
    return user
  } catch (e) {
    console.error('Auth Error:', e)
    return null
  }
}

// ------------------------------------------------------------------
// API ENDPOINTS
// ------------------------------------------------------------------

// GET /api/bootstrap
// Fetch all logs for user/device to hydrate frontend state
app.get('/api/bootstrap', async (req, res) => {
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
      // Don't throw, continue to fetch logs
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
})

// POST /api/log
// Insert a single log entry
app.post('/api/log', async (req, res) => {
  const { deviceId, userId, date, type, data } = req.body

  if ((!deviceId && !userId) || !date || !type || !data) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const logEntry = {
      date,
      type,
      data
    }

    if (userId) logEntry.user_id = userId
    if (deviceId) logEntry.device_id = deviceId

    const { error } = await supabase
      .from('logs')
      .insert(logEntry)

    if (error) throw error

    return res.json({ ok: true })
  } catch (error) {
    console.error('Log Error:', error)
    return res.status(500).json({ error: 'Failed to save log' })
  }
})

// POST /api/logs/batch
// Insert multiple logs (for offline sync)
app.post('/api/logs/batch', async (req, res) => {
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

    const { error } = await supabase
      .from('logs')
      .insert(records)

    if (error) throw error

    return res.json({ ok: true })
  } catch (error) {
    console.error('Batch Log Error:', error)
    return res.status(500).json({ error: 'Failed to sync batch logs' })
  }
})

// ------------------------------------------------------------------
// COMMUNITY FEATURE
// ------------------------------------------------------------------

// Dutch questions about cycle + fitness (50 questions)
const COMMUNITY_QUESTIONS = [
  "Hoe pas jij je training aan tijdens je menstruatie?",
  "Welk voedsel helpt jou het meeste met energie tijdens de luteale fase?",
  "Wat doe je om je lichaam te helpen ontspannen in de dagen voor je menstruatie?",
  "Heb je ooit gemerkt dat je sterker bent rond je ovulatie?",
  "Welke snacks heb je altijd bij de hand tijdens je cyclus?",
  "Hoe ga jij om met vermoeidheid tijdens je menstruatie?",
  "Wat is jouw go-to workout als je weinig energie hebt?",
  "Heb je tips voor het behouden van motivatie tijdens de luteale fase?",
  "Welke stretches helpen jou het beste tegen krampen?",
  "Hoe plan jij je zwaardere trainingen in je cyclus?",
  "Wat eet je graag in de folliculaire fase voor extra energie?",
  "Hoe merk jij dat je ovulatie nadert?",
  "Wat is je favoriete manier om stress te verminderen tijdens PMS?",
  "Heb je ooit je trainingsschema aangepast aan je cyclus? Hoe bevalt dat?",
  "Welke kruiden of supplementen gebruik je voor cyclusklachten?",
  "Wat doe je om goed te slapen tijdens de luteale fase?",
  "Hoe blijf je gemotiveerd voor fitness tijdens drukke periodes?",
  "Welke lichte beweging doe je graag op rustdagen?",
  "Heb je tips voor ijzerrijke maaltijden tijdens de menstruatie?",
  "Wat is de grootste verandering die je hebt gemerkt sinds je cyclus-bewust traint?",
  "Hoe ga je om met bloating tijdens je cyclus?",
  "Welke activiteiten helpen jou het beste om te ontspannen?",
  "Wat is je favoriete proteïnebron?",
  "Hoe houd je je voeding op peil tijdens drukke werkdagen?",
  "Welk moment van de dag train jij het liefst?",
  "Heb je tips voor het omgaan met cravings?",
  "Wat doe je als je echt geen zin hebt om te trainen?",
  "Hoe zorg je voor voldoende hydratatie tijdens je cyclus?",
  "Welke podcast of muziek luister je tijdens het sporten?",
  "Heb je ooit een sport geprobeerd die je niet verwacht had leuk te vinden?",
  "Wat is je favoriete gezonde traktatie?",
  "Hoe combineer je werk en fitness?",
  "Wat is je beste tip voor beginners die cyclus-bewust willen trainen?",
  "Hoe vier je kleine successen in je fitnessreis?",
  "Welke ochtendgewoontes helpen jou de dag goed te beginnen?",
  "Wat is het beste advies dat je ooit hebt gekregen over training?",
  "Hoe ga je om met een slechte nachten rust voor een training?",
  "Welke apps gebruik je om je cyclus bij te houden?",
  "Wat eet je het liefst als ontbijt op een trainingsdag?",
  "Hoe houd je het leuk om consistent te blijven trainen?",
  "Wat is je favoriete seizoen om buiten te sporten?",
  "Heb je tips voor het opbouwen van spierkracht thuis?",
  "Welke fouten heb je gemaakt in het begin van je fitnessjournee?",
  "Hoe beloon je jezelf na een goede trainingsweek?",
  "Wat doe je om hersteltijd te optimaliseren?",
  "Heb je een training buddy of train je liever solo?",
  "Welke maaltijd bereid je graag voor als meal prep?",
  "Hoe blijf je gefocust op je fitnessdoelen tijdens vakanties?",
  "Wat inspireert jou om gezond te blijven leven?",
  "Heb je een favoriete yoga-pose of stretchoefening?"
]

// Helper: Get day of year
function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date - start
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

// Helper: Get today's date as YYYY-MM-DD
function getTodayDate() {
  const now = new Date()
  return now.toISOString().split('T')[0]
}

// Auth middleware for community routes
async function requireAuth(req, res, next) {
  const user = await getUserFromToken(req.headers.authorization)
  if (!user) {
    return res.status(401).json({ error: 'Niet ingelogd' })
  }
  req.user = user
  next()
}

// GET /api/community/today - Get today's topic + comments
app.get('/api/community/today', requireAuth, async (req, res) => {
  try {
    const today = getTodayDate()

    // Try to find today's topic
    let { data: topic, error: findError } = await supabase
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
})

// GET /api/community/topics - List recent topics
app.get('/api/community/topics', requireAuth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 30, 100)

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
})

// GET /api/community/topic/:id - Get specific topic
app.get('/api/community/topic/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params

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
})

// POST /api/community/comment - Create comment
app.post('/api/community/comment', requireAuth, async (req, res) => {
  try {
    const { topicId, body } = req.body

    // Validate
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

    // Verify topic exists
    const { data: topic } = await supabase
      .from('community_topics')
      .select('id')
      .eq('id', topicId)
      .single()

    if (!topic) {
      return res.status(404).json({ error: 'Onderwerp niet gevonden' })
    }

    // Insert comment
    const { data: comment, error } = await supabase
      .from('community_comments')
      .insert({
        topic_id: topicId,
        user_id: req.user.id,
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
})

// POST /api/community/comment/:id/delete - Soft delete comment
app.post('/api/community/comment/:id/delete', requireAuth, async (req, res) => {
  try {
    const { id } = req.params

    // Verify ownership
    const { data: comment } = await supabase
      .from('community_comments')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!comment) {
      return res.status(404).json({ error: 'Reactie niet gevonden' })
    }

    if (comment.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Je kunt alleen je eigen reacties verwijderen' })
    }

    // Soft delete
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
})

// POST /api/community/report - Report a comment
app.post('/api/community/report', requireAuth, async (req, res) => {
  try {
    const { commentId, reason } = req.body

    if (!commentId) {
      return res.status(400).json({ error: 'Geen reactie opgegeven' })
    }

    // Verify comment exists
    const { data: comment } = await supabase
      .from('community_comments')
      .select('id')
      .eq('id', commentId)
      .single()

    if (!comment) {
      return res.status(404).json({ error: 'Reactie niet gevonden' })
    }

    // Insert report
    const { error } = await supabase
      .from('community_reports')
      .insert({
        comment_id: commentId,
        reporter_user_id: req.user.id,
        reason: reason || null
      })

    if (error) throw error

    return res.json({ ok: true })
  } catch (error) {
    console.error('Community report error:', error)
    return res.status(500).json({ error: 'Kon melding niet versturen' })
  }
})

// ------------------------------------------------------------------
// MEALS (GERECHTEN) FEATURE
// ------------------------------------------------------------------

// Helper: Calculate meal totals from items
function calculateMealTotals(items) {
  return items.reduce((totals, item) => {
    // For g/ml: factor = quantity / 100
    // For stuk/portie: factor = quantity (treat as multiplier on base values)
    const factor = (item.unit === 'g' || item.unit === 'ml')
      ? item.quantity / 100
      : item.quantity

    return {
      kcal: totals.kcal + (item.kcal_100 * factor),
      protein: totals.protein + (item.protein_100 * factor),
      carbs: totals.carbs + (item.carbs_100 * factor),
      fat: totals.fat + (item.fat_100 * factor)
    }
  }, { kcal: 0, protein: 0, carbs: 0, fat: 0 })
}

// GET /api/meals - List user's meals with calculated totals
app.get('/api/meals', requireAuth, async (req, res) => {
  try {
    // Get all meals for user
    const { data: meals, error: mealsError } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })

    if (mealsError) throw mealsError

    // Get all items for these meals
    const mealIds = meals.map(m => m.id)
    let itemsMap = {}

    if (mealIds.length > 0) {
      const { data: items, error: itemsError } = await supabase
        .from('meal_items')
        .select('*')
        .in('meal_id', mealIds)

      if (itemsError) throw itemsError

      // Group items by meal_id
      items.forEach(item => {
        if (!itemsMap[item.meal_id]) itemsMap[item.meal_id] = []
        itemsMap[item.meal_id].push(item)
      })
    }

    // Calculate totals for each meal
    const mealsWithTotals = meals.map(meal => {
      const mealItems = itemsMap[meal.id] || []
      const totals = calculateMealTotals(mealItems)
      return {
        ...meal,
        items: mealItems,
        totals: {
          kcal: Math.round(totals.kcal),
          protein: Math.round(totals.protein * 10) / 10,
          carbs: Math.round(totals.carbs * 10) / 10,
          fat: Math.round(totals.fat * 10) / 10
        }
      }
    })

    return res.json({ meals: mealsWithTotals })
  } catch (error) {
    console.error('Meals list error:', error)
    return res.status(500).json({ error: 'Kon gerechten niet laden' })
  }
})

// POST /api/meals - Create a new meal with items
app.post('/api/meals', requireAuth, async (req, res) => {
  try {
    const { name, category, items } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Naam is verplicht' })
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Voeg minimaal 1 ingredient toe' })
    }

    // Create the meal
    const { data: meal, error: mealError } = await supabase
      .from('meals')
      .insert({
        user_id: req.user.id,
        name: name.trim(),
        category: category || null
      })
      .select()
      .single()

    if (mealError) throw mealError

    // Insert items
    const itemRecords = items.map(item => ({
      meal_id: meal.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit: item.unit || 'g',
      kcal_100: item.kcal_100,
      protein_100: item.protein_100,
      carbs_100: item.carbs_100,
      fat_100: item.fat_100
    }))

    const { data: insertedItems, error: itemsError } = await supabase
      .from('meal_items')
      .insert(itemRecords)
      .select()

    if (itemsError) throw itemsError

    // Calculate totals
    const totals = calculateMealTotals(insertedItems)

    return res.json({
      meal: {
        ...meal,
        items: insertedItems,
        totals: {
          kcal: Math.round(totals.kcal),
          protein: Math.round(totals.protein * 10) / 10,
          carbs: Math.round(totals.carbs * 10) / 10,
          fat: Math.round(totals.fat * 10) / 10
        }
      }
    })
  } catch (error) {
    console.error('Meal create error:', error)
    return res.status(500).json({ error: 'Kon gerecht niet opslaan' })
  }
})

// GET /api/meals/:id - Get single meal with items
app.get('/api/meals/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params

    const { data: meal, error: mealError } = await supabase
      .from('meals')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single()

    if (mealError || !meal) {
      return res.status(404).json({ error: 'Gerecht niet gevonden' })
    }

    const { data: items, error: itemsError } = await supabase
      .from('meal_items')
      .select('*')
      .eq('meal_id', id)

    if (itemsError) throw itemsError

    const totals = calculateMealTotals(items || [])

    return res.json({
      meal: {
        ...meal,
        items: items || [],
        totals: {
          kcal: Math.round(totals.kcal),
          protein: Math.round(totals.protein * 10) / 10,
          carbs: Math.round(totals.carbs * 10) / 10,
          fat: Math.round(totals.fat * 10) / 10
        }
      }
    })
  } catch (error) {
    console.error('Meal get error:', error)
    return res.status(500).json({ error: 'Kon gerecht niet laden' })
  }
})

// PUT /api/meals/:id - Update meal
app.put('/api/meals/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { name, category, items } = req.body

    // Verify ownership
    const { data: existing } = await supabase
      .from('meals')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single()

    if (!existing) {
      return res.status(404).json({ error: 'Gerecht niet gevonden' })
    }

    // Update meal
    const { error: updateError } = await supabase
      .from('meals')
      .update({
        name: name?.trim() || existing.name,
        category: category !== undefined ? category : existing.category
      })
      .eq('id', id)

    if (updateError) throw updateError

    // If items provided, replace all items
    if (items && Array.isArray(items)) {
      // Delete existing items
      await supabase.from('meal_items').delete().eq('meal_id', id)

      // Insert new items
      if (items.length > 0) {
        const itemRecords = items.map(item => ({
          meal_id: id,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit: item.unit || 'g',
          kcal_100: item.kcal_100,
          protein_100: item.protein_100,
          carbs_100: item.carbs_100,
          fat_100: item.fat_100
        }))

        await supabase.from('meal_items').insert(itemRecords)
      }
    }

    // Fetch updated meal
    const { data: meal } = await supabase
      .from('meals')
      .select('*')
      .eq('id', id)
      .single()

    const { data: updatedItems } = await supabase
      .from('meal_items')
      .select('*')
      .eq('meal_id', id)

    const totals = calculateMealTotals(updatedItems || [])

    return res.json({
      meal: {
        ...meal,
        items: updatedItems || [],
        totals: {
          kcal: Math.round(totals.kcal),
          protein: Math.round(totals.protein * 10) / 10,
          carbs: Math.round(totals.carbs * 10) / 10,
          fat: Math.round(totals.fat * 10) / 10
        }
      }
    })
  } catch (error) {
    console.error('Meal update error:', error)
    return res.status(500).json({ error: 'Kon gerecht niet bijwerken' })
  }
})

// DELETE /api/meals/:id - Delete meal (cascade deletes items)
app.delete('/api/meals/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params

    // Verify ownership and delete
    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)

    if (error) throw error

    return res.json({ ok: true })
  } catch (error) {
    console.error('Meal delete error:', error)
    return res.status(500).json({ error: 'Kon gerecht niet verwijderen' })
  }
})

// POST /api/meals/:id/log - Log meal to today
app.post('/api/meals/:id/log', requireAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { date } = req.body
    const targetDate = date || new Date().toISOString().split('T')[0]

    // Get meal with items
    const { data: meal } = await supabase
      .from('meals')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single()

    if (!meal) {
      return res.status(404).json({ error: 'Gerecht niet gevonden' })
    }

    const { data: items } = await supabase
      .from('meal_items')
      .select('*')
      .eq('meal_id', id)

    const totals = calculateMealTotals(items || [])

    // Insert food log
    const { data: log, error: logError } = await supabase
      .from('food_logs')
      .insert({
        user_id: req.user.id,
        source_type: 'meal',
        source_id: id,
        name_snapshot: meal.name,
        totals_kcal: Math.round(totals.kcal * 10) / 10,
        totals_protein: Math.round(totals.protein * 10) / 10,
        totals_carbs: Math.round(totals.carbs * 10) / 10,
        totals_fat: Math.round(totals.fat * 10) / 10,
        date: targetDate
      })
      .select()
      .single()

    if (logError) throw logError

    return res.json({ log })
  } catch (error) {
    console.error('Meal log error:', error)
    return res.status(500).json({ error: 'Kon gerecht niet loggen' })
  }
})

// GET /api/food-logs - Get food logs for a date
app.get('/api/food-logs', requireAuth, async (req, res) => {
  try {
    const { date } = req.query
    const targetDate = date || new Date().toISOString().split('T')[0]

    const { data: logs, error } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('date', targetDate)
      .order('created_at', { ascending: true })

    if (error) throw error

    return res.json({ logs: logs || [] })
  } catch (error) {
    console.error('Food logs error:', error)
    return res.status(500).json({ error: 'Kon logs niet laden' })
  }
})

// DELETE /api/food-logs/:id - Delete a food log
app.delete('/api/food-logs/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('food_logs')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)

    if (error) throw error

    return res.json({ ok: true })
  } catch (error) {
    console.error('Food log delete error:', error)
    return res.status(500).json({ error: 'Kon log niet verwijderen' })
  }
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

