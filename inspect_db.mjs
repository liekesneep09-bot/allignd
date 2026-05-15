import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { calculateAveragePeriodLength } from './src/logic/cycle-learning.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function inspect() {
  const { data: users, error } = await supabase.from('profiles').select('*').limit(5)
  if (error) {
    console.error(error)
    return
  }
  
  for (const user of users) {
    console.log(`\n=== USER: ${user.name} ===`)
    console.log(`bleeding_length_days: ${user.bleeding_length_days}`)
    console.log(`period_length: ${user.period_length}`)
    const logs = user.menstruation_logs || []
    console.log(`menstruation_logs:`, JSON.stringify(logs, null, 2))
    
    const avg = calculateAveragePeriodLength(logs, user.bleeding_length_days || 5)
    console.log(`Calculated Average Period Length:`, avg)
  }
}

inspect()
