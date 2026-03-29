import React, { useEffect, useState } from 'react'
import { supabase } from '../utils/supabaseClient'

export default function AuthCallback() {
    const [status, setStatus] = useState('loading') // loading, success, error

    useEffect(() => {
        const processAuth = async () => {
            try {
                // If there's no hash and no query parameters, this might be a regular page load
                // but the route matched /auth/callback. We check if there's an active session.
                const { data: { session }, error } = await supabase.auth.getSession()

                if (error) throw error

                if (session) {
                    setStatus('success')
                    setTimeout(() => {
                        window.location.replace('/') // replace instead of href to avoid history bloat
                    }, 2000)
                } else if (window.location.hash.includes('access_token')) {
                    // Supabase handles the hash automatically, wait a tick for session to establish
                    setTimeout(async () => {
                        const { data: { session: newSession } } = await supabase.auth.getSession()
                        if (newSession) {
                            setStatus('success')
                        } else {
                            setStatus('error')
                        }
                        setTimeout(() => {
                            window.location.replace('/')
                        }, 2000)
                    }, 1000)
                } else {
                    // No session and no auth hash found. Unlikely here, but handle safely.
                    setStatus('error')
                    setTimeout(() => {
                         window.location.replace('/')
                    }, 2000)
                }
            } catch (err) {
                console.error('Auth Callback Error:', err)
                setStatus('error')
                 setTimeout(() => {
                    window.location.replace('/')
                }, 3000)
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
