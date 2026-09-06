import React, { useEffect, useState, useRef } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useLanguage } from '../context/LanguageContext'

export default function AuthCallback() {
    const [status, setStatus] = useState('loading')
    const { t } = useLanguage()
    const hasRedirected = useRef(false)

    const doRedirect = () => {
        if (hasRedirected.current) return
        hasRedirected.current = true
        setStatus('success')
        setTimeout(() => {
            window.location.href = '/'
        }, 1500)
    }

    useEffect(() => {
        let mounted = true

        const processAuth = async () => {
            try {
                const url = new URL(window.location.href)
                const params = url.searchParams

                // --- Flow 1: PKCE (code param) ---
                // Newer Supabase default: ?code=xxx
                const code = params.get('code')
                if (code) {
                    const { error } = await supabase.auth.exchangeCodeForSession(code)
                    if (error) throw error
                    if (mounted) doRedirect()
                    return
                }

                // --- Flow 2: OTP / token_hash ---
                // Email confirmation with token_hash: ?token_hash=xxx&type=signup
                const token_hash = params.get('token_hash')
                const type = params.get('type')
                if (token_hash && type) {
                    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
                    if (error) throw error
                    if (mounted) doRedirect()
                    return
                }

                // --- Flow 3: Implicit (hash fragment) ---
                // Older Supabase: #access_token=xxx in URL hash
                // The Supabase client handles this automatically via onAuthStateChange
                // So we just wait a bit and check for session
                await new Promise(resolve => setTimeout(resolve, 1200))
                if (!mounted || hasRedirected.current) return

                const { data: { session }, error } = await supabase.auth.getSession()
                if (!mounted) return
                if (error) throw error

                if (session) {
                    doRedirect()
                } else {
                    // Last resort: check if there's an error param in URL
                    const errorDesc = params.get('error_description') || params.get('error')
                    console.error('[AuthCallback] No session found.', errorDesc || 'No error param either.')
                    if (mounted) setStatus('error')
                }

            } catch (err) {
                console.error('[AuthCallback] Error:', err)
                if (mounted) setStatus('error')
            }
        }

        // Also listen for auth state changes (handles implicit flow hash)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (!mounted) return
            if (session && !hasRedirected.current) {
                doRedirect()
            }
        })

        processAuth()

        return () => {
            mounted = false
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
                    <h2>{t('callback.verifying')}</h2>
                    <p style={{ color: 'var(--color-text-muted)' }}>{t('callback.please_wait')}</p>
                </>
            )}

            {status === 'success' && (
                <>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                    <h2>{t('callback.confirmed')}</h2>
                    <p style={{ color: 'var(--color-text-muted)' }}>{t('callback.redirecting')}</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        style={{
                            marginTop: '1rem',
                            padding: '0.8rem 1.5rem',
                            background: 'var(--color-primary)',
                            color: '#333',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        {t('callback.continue')}
                    </button>
                </>
            )}

            {status === 'error' && (
                <>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
                    <h2>{t('callback.error_title')}</h2>
                    <p style={{ color: 'var(--color-text-muted)' }}>{t('callback.error_desc')}</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        style={{
                            marginTop: '1rem',
                            padding: '0.8rem 1.5rem',
                            background: 'var(--color-primary)',
                            color: '#333',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        {t('callback.go_to_login')}
                    </button>
                </>
            )}
        </div>
    )
}
