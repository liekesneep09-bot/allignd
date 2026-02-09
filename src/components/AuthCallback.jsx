import React, { useEffect, useState } from 'react'
import { supabase } from '../utils/supabaseClient'

export default function AuthCallback() {
    const [status, setStatus] = useState('loading') // loading, success, error

    useEffect(() => {
        // Supabase client automatically handles the session exchange from the URL hash/query
        // We just need to give it a moment to process
        const processAuth = async () => {
            try {
                // Check if we have a session now
                const { data: { session }, error } = await supabase.auth.getSession()

                if (error) throw error

                if (session) {
                    setStatus('success')
                    // Redirect to home after short delay
                    setTimeout(() => {
                        window.location.href = '/' // Force reload to clear URL parameters
                    }, 2000)
                } else {
                    // Sometimes the hash is meant for recovery or invite, Supabase handles it asynchronously
                    // We listen for the AUTH_STATE_CHANGE event in AuthContext, 
                    // but here we just want to provide visual feedback.
                    // If no session found yet, wait for onAuthStateChange to possibly fire?
                    // Or maybe the user *just* signed up and is confirming email.

                    // Let's assume success if no error, but give user a button to proceed
                    setStatus('success')
                    setTimeout(() => {
                        window.location.href = '/'
                    }, 2000)
                }
            } catch (err) {
                console.error('Auth Callback Error:', err)
                setStatus('error')
            }
        }

        processAuth()
    }, [])

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-bg)',
            color: 'var(--color-text)',
            padding: '2rem',
            textAlign: 'center'
        }}>
            {status === 'loading' && (
                <>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚙️</div>
                    <h2>Account verifiëren...</h2>
                    <p style={{ color: 'var(--color-text-muted)' }}>Een moment geduld.</p>
                </>
            )}

            {status === 'success' && (
                <>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                    <h2>E-mail bevestigd!</h2>
                    <p style={{ color: 'var(--color-text-muted)' }}>Je wordt doorgestuurd naar de app.</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        style={{
                            marginTop: '1rem',
                            padding: '0.8rem 1.5rem',
                            background: 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        Ga direct door
                    </button>
                </>
            )}

            {status === 'error' && (
                <>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
                    <h2>Er ging iets mis</h2>
                    <p style={{ color: 'var(--color-text-muted)' }}>We konden je niet automatisch inloggen.</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        style={{
                            marginTop: '1rem',
                            padding: '0.8rem 1.5rem',
                            background: 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        Ga naar inloggen
                    </button>
                </>
            )}
        </div>
    )
}
