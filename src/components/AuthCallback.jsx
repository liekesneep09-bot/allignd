import React, { useEffect, useState } from 'react'
import { supabase } from '../utils/supabaseClient'

export default function AuthCallback() {
    const [status, setStatus] = useState('loading') // loading, success, error

    useEffect(() => {
        let mounted = true;

        const processAuth = async () => {
            try {
                // Wait briefly for Supabase to process the URL hash automatically
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const { data: { session }, error } = await supabase.auth.getSession()

                if (!mounted) return;

                if (error) throw error

                if (session) {
                    setStatus('success')
                    setTimeout(() => {
                        window.location.href = '/'
                    }, 1500)
                } else {
                    setStatus('error')
                }
            } catch (err) {
                console.error('Auth Callback Error:', err)
                if (mounted) setStatus('error')
            }
        }

        processAuth()

        // Also listen for auth changes directly
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session && mounted) {
                setStatus('success')
                setTimeout(() => {
                    window.location.href = '/'
                }, 1500)
            }
        })

        return () => {
            mounted = false;
            subscription.unsubscribe()
        }
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
