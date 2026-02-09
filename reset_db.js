
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

// Load env vars from .env file in same directory
const envConfig = dotenv.parse(fs.readFileSync('.env'))

// Use NODE environment variables if set, fallback to .env
const supabaseUrl = process.env.SUPABASE_URL || envConfig.SUPABASE_URL || envConfig.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || envConfig.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase URL or Service Role Key in .env')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function resetDatabase() {
    console.log('🔥 Starting COMPLETE database reset...')
    console.log(`Target URL: ${supabaseUrl}`)

    // Helper to delete all rows from a table
    const deleteTable = async (table) => {
        console.log(`... Deleting ${table}`)
        // .neq('id', '00000000-0000-0000-0000-000000000000') matches all UUIDs
        // For tables without 'id' as primary key, this might need adjustment, but most have 'id'
        const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
        if (error) console.error(`❌ Error deleting ${table}:`, error.message)
    }

    // 1. Child Tables first (to avoid some FK issues, though Service Role usually bypasses RLS, it doesn't bypass FKs)
    await deleteTable('community_reports')
    await deleteTable('community_comments')
    // await deleteTable('community_topics') // Optional

    await deleteTable('food_logs')
    await deleteTable('meal_items')
    await deleteTable('meals')

    // Nutrition & Daily Logs
    // nutrition_targets has user_id, might need special handling if PK is user_id
    console.log('... Deleting nutrition_targets')
    await supabase.from('nutrition_targets').delete().neq('user_id', '00000000-0000-0000-0000-000000000000')

    console.log('... Deleting daily_logs')
    // daily_logs usually has user_id but maybe id? Let's assume id or delete by user_id
    // If daily_logs doesn't have ID, we use user_id
    await supabase.from('daily_logs').delete().neq('user_id', '00000000-0000-0000-0000-000000000000')

    // 2. Profiles (Parents)
    await deleteTable('profiles')

    console.log('✅ ALL DATA DELETED successfully')
}

resetDatabase()
