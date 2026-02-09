
import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [session, setSession] = useState(null)
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // If Supabase is not configured, skip auth entirely
        if (!isSupabaseConfigured()) {
            console.warn('Supabase not configured. Running without auth.')
            setLoading(false)
            // Set a mock user so the app continues to work
            setUser({ id: 'local-user', email: 'local@device' })
            return
        }

        // Check initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

    const signIn = async (email, password) => {
        if (!isSupabaseConfigured()) {
            throw new Error('Auth is niet geconfigureerd')
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) {
            // Translate error messages to Dutch
            if (error.message.includes('Invalid login credentials')) {
                throw new Error('Deze combinatie klopt niet')
            }
            if (error.message.includes('Email not confirmed')) {
                throw new Error('Bevestig eerst je e-mailadres')
            }
            throw new Error(error.message)
        }

        return data
    }

    const signUp = async (email, password) => {
        if (!isSupabaseConfigured()) {
            throw new Error('Auth is niet geconfigureerd')
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: window.location.origin
            }
        })

        if (error) {
            if (error.message.includes('already registered')) {
                throw new Error('Dit account bestaat al')
            }
            if (error.message.includes('Password')) {
                throw new Error('Wachtwoord moet minimaal 6 tekens zijn')
            }
            throw new Error(error.message)
        }

        return data
    }

    const resendVerificationEmail = async (email) => {
        if (!isSupabaseConfigured()) return

        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email,
            options: {
                emailRedirectTo: window.location.origin
            }
        })

        if (error) throw new Error(error.message)
    }

    const signOut = async () => {
        if (isSupabaseConfigured()) {
            await supabase.auth.signOut()
        }
        setSession(null)
        setUser(null)
    }

    const value = {
        session,
        user,
        loading,
        signIn,
        signUp,
        signOut,
        resendVerificationEmail,
        getAccessToken: () => session?.access_token,
        isConfigured: isSupabaseConfigured()
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
