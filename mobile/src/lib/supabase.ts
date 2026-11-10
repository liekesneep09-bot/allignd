import './local-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);
export const supabaseConfigurationError = isSupabaseConfigured
  ? null
  : 'De database-instellingen ontbreken. Je kunt de demo bekijken of later opnieuw proberen.';

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabasePublishableKey!, {
      auth: {
        // Expo Router can create the client during server rendering, where the
        // browser storage global does not exist. Native and browser runtimes
        // still use the SQLite-backed localStorage adapter installed above.
        storage: typeof localStorage === 'undefined' ? undefined : localStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

if (supabase) {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      void supabase.auth.startAutoRefresh();
    } else {
      void supabase.auth.stopAutoRefresh();
    }
  });
}

export function getSupabase() {
  if (!supabase) throw new Error('Supabase is niet ingesteld.');
  return supabase;
}
