import React, { useEffect, useState, useRef } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useLanguage } from '../context/LanguageContext'

export default function AuthCallback() {
    const [status, setStatus] = useState('loading') // loading, success, error
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
        let mounted = true;

        // Listen for auth state changes (primary handler)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (!mounted) return
            if (session) {
                doRedirect()
            }
        })

        // Fallback: check for existing session after brief delay
        const processAuth = async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 800));
                if (!mounted || hasRedirected.current) return;

                const { data: { session }, error } = await supabase.auth.getSession()
                if (!mounted) return;
                if (error) throw error

                if (session) {
                    doRedirect()
                } else {
                    setStatus('error')
                }
            } catch (err) {
                console.error('Auth Callback Error:', err)
                if (mounted) setStatus('error')
            }
        }

        processAuth()

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
