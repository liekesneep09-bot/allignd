import { createContext, use, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { supabase, supabaseConfigurationError } from '@/lib/supabase';

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
  configurationError: string | null;
  isPreview: boolean;
  enterPreview: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function authErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('Invalid login credentials')) {
    return 'Je e-mailadres of wachtwoord klopt niet.';
  }
  if (message.includes('Email not confirmed')) {
    return 'Bevestig eerst je e-mailadres via de link in je mailbox.';
  }
  if (message.toLowerCase().includes('password')) {
    return 'Kies een wachtwoord van minimaal 6 tekens.';
  }
  return message || 'Inloggen is niet gelukt. Probeer het opnieuw.';
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!supabase) {
      setLoading(false);
      return () => { mounted = false; };
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      if (nextSession) setIsPreview(false);
      setLoading(false);
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) console.warn('Sessie herstellen mislukt:', error.message);
      setSession(data.session);
      setLoading(false);
    }).catch((error: unknown) => {
      console.warn('Sessie herstellen mislukt:', error);
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    loading,
    configurationError: supabaseConfigurationError,
    isPreview,
    enterPreview: () => setIsPreview(true),
    signIn: async (email, password) => {
      if (!supabase) throw new Error(supabaseConfigurationError ?? 'Supabase is niet ingesteld.');
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw new Error(authErrorMessage(error));
    },
    signUp: async (email, password) => {
      if (!supabase) throw new Error(supabaseConfigurationError ?? 'Supabase is niet ingesteld.');
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: Linking.createURL('/auth/callback') },
      });
      if (error) throw new Error(authErrorMessage(error));
      return Boolean(data.session);
    },
    signOut: async () => {
      const wasPreview = isPreview;
      setIsPreview(false);
      setSession(null);
      if (!supabase || wasPreview) return;

      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) return;
      const { error } = await supabase.auth.signOut();
      if (error && !error.message.toLowerCase().includes('session missing')) {
        throw new Error('Uitloggen is niet gelukt. Probeer het opnieuw.');
      }
    },
  }), [session, loading, isPreview]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = use(AuthContext);
  if (!context) throw new Error('useAuth moet binnen AuthProvider worden gebruikt.');
  return context;
}
