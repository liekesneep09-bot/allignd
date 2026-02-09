
import { createClient } from '@supabase/supabase-js'

// Read environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validation function
function validateSupabaseConfig() {
    // Check if variables exist
    if (!supabaseUrl || !supabaseAnonKey) {
        return {
            valid: false,
            error: 'Missing Supabase environment variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
        }
    }

    // Validate URL format
    if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('supabase.co')) {
        return {
            valid: false,
            error: `Invalid VITE_SUPABASE_URL: "${supabaseUrl}". Must start with https:// and contain supabase.co`
        }
    }

    // Validate anon key is non-empty
    if (typeof supabaseAnonKey !== 'string' || supabaseAnonKey.trim().length === 0) {
        return {
            valid: false,
            error: 'VITE_SUPABASE_ANON_KEY is empty or invalid.'
        }
    }

    return { valid: true, error: null }
}

// 🔒 SECURITY: Ensure service-role key is NEVER in frontend bundle
if (import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('🚨 SECURITY ERROR: Service-role key detected in frontend bundle! This is a critical security vulnerability.')
}

// Validate configuration
const validation = validateSupabaseConfig()

// Export error message if config is invalid
export const supabaseConfigError = validation.valid ? null : validation.error

// Create client only if config is valid
export const supabase = validation.valid
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => validation.valid

// Log status
if (!validation.valid) {
    console.warn('⚠️ Supabase not configured:', validation.error)
    console.warn('The app will show a configuration error screen.')
} else {
    console.log('✅ Supabase client initialized successfully')
}
