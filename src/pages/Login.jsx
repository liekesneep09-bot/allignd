
import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabaseClient'
import logo from '../assets/logo-primary.svg'

export default function Login() {
    const { signIn, signUp, resendVerificationEmail, isConfigured } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [view, setView] = useState('start') // 'start', 'login', 'signup'
    const [showConfirmation, setShowConfirmation] = useState(false)


    const handleResend = async () => {
        setIsLoading(true)
        setError('')
        setSuccessMessage('')
        try {
            await resendVerificationEmail(email)
            setSuccessMessage('Nieuwe mail is verzonden! Check ook je spam.')
        } catch (err) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccessMessage('')
        setIsLoading(true)

        // Validate email
        if (!email || !email.includes('@')) {
            setError('Vul een geldig e-mailadres in')
            setIsLoading(false)
            return
        }

        // Validate password
        if (!password || password.length < 6) {
            setError('Wachtwoord moet minimaal 6 tekens zijn')
            setIsLoading(false)
            return
        }

        try {
            if (view === 'login') {
                await signIn(email, password)
            } else if (view === 'signup') {
                const data = await signUp(email, password)
                if (data.user && !data.session) {
                    setShowConfirmation(true)
                }
            }
        } catch (err) {
            if (err.message.includes('Bevestig eerst je e-mailadres') || err.message.includes('Email not confirmed')) {
                setShowConfirmation(true)
                setError('') // Clear error, show confirmation screen instead
            } else {
                setError(err.message)
            }
        } finally {
            setIsLoading(false)
        }
    }

    const goBack = () => {
        setView('start')
        setEmail('')
        setPassword('')
        setError('')
        setSuccessMessage('')
        setShowConfirmation(false)
    }

    // Confirmation Screen
    if (showConfirmation) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
                <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem' }}>✉️</div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Check je inbox</h1>
                    <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                        We hebben een bevestigingsmail gestuurd naar <strong>{email}</strong>.
                        Klik op de link daarin om je account te activeren.
                    </p>
                    <div style={{ padding: '1rem', background: 'var(--color-surface)', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                        Tip: Check ook je spam of reclame folder als je hem niet ziet.
                    </div>
                    {successMessage && <div style={{ color: 'green', fontSize: '0.9rem' }}>{successMessage}</div>}
                    {error && <div style={{ color: 'red', fontSize: '0.9rem' }}>{error}</div>}
                    <button onClick={handleResend} disabled={isLoading} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.95rem' }}>
                        {isLoading ? 'Bezig...' : 'Mail opnieuw sturen'}
                    </button>
                    <button onClick={async () => {
                        setIsLoading(true)
                        try {
                            const { data } = await supabase.auth.refreshSession()
                            if (data.session && data.user?.email_confirmed_at) {
                                handleSubmit({ preventDefault: () => { } })
                            } else {
                                const { data: userData } = await supabase.auth.getUser()
                                if (userData.user?.email_confirmed_at) {
                                    handleSubmit({ preventDefault: () => { } })
                                } else {
                                    setError('Nog niet bevestigd. Heb je op de link geklikt?')
                                }
                            }
                        } catch (err) {
                            handleSubmit({ preventDefault: () => { } })
                        } finally {
                            setIsLoading(false)
                        }
                    }} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: 'none', background: 'var(--color-primary)', color: 'white', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', marginTop: '0.5rem' }}>
                        Ik heb bevestigd, ga verder
                    </button>
                    <button onClick={goBack} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.9rem' }}>Gebruik ander e-mailadres</button>
                </div>
            </div>
        )
    }

    // Start Screen (RE-RE-DESIGN)
    // Removed: "Not against it", "White Block"
    // Added: "Abstract Cycle Line", Large Centered Logo
    if (view === 'start') {
        return (
            <div style={{
                minHeight: '100vh',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                padding: '2rem',
                background: 'var(--color-bg)',
                color: 'var(--color-text)'
            }}>

                {/* BACKGROUND: Clean/Minimalist - No Illustration */}
                {/* User requested removal of illustration. Keeps focus purely on Logo + Tagline. */}


                {/* CONTENT: Centered */}
                <div style={{
                    position: 'relative',
                    zIndex: 1,
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    maxWidth: '400px',
                    margin: '0 auto',
                    gap: '1rem'
                }}>

                    {/* 1. Large Logo Centered */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                        <img
                            src={logo}
                            alt="Allignd"
                            style={{
                                height: '220px', // Requested "groot"
                                width: 'auto',
                                maxWidth: '80%',
                                marginBottom: '1.5rem',
                                objectFit: 'contain'
                            }}
                        />

                        {/* Tagline: Just the core one */}
                        <p style={{
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: 'var(--color-text)',
                            letterSpacing: '-0.01em',
                            textAlign: 'center',
                            margin: 0
                        }}>
                            Move with your cycle
                        </p>
                    </div>


                    {/* Actions Area */}
                    <div style={{ width: '100%', paddingBottom: '2.5rem' }}>

                        {/* Micro-copy (Kept as requested initially, confirmed in Step 2 unless user hates it now. User only complained about slogan) */}
                        <p style={{
                            textAlign: 'center',
                            fontSize: '0.9rem',
                            color: 'var(--color-text-muted)',
                            marginBottom: '1.5rem',
                            fontStyle: 'italic',
                            opacity: 0.8
                        }}>
                            Omdat jouw lichaam geen one-size-fits-all is
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Primary: Sign Up (Tall) */}
                            <button
                                onClick={() => setView('signup')}
                                style={{
                                    width: '100%',
                                    padding: '1.25rem',
                                    borderRadius: '16px',
                                    border: 'none',
                                    background: 'var(--color-primary)',
                                    color: 'white',
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 20px rgba(112, 193, 163, 0.3)', // Enhanced shadow
                                    transition: 'transform 0.1s'
                                }}
                            >
                                Meld je aan
                            </button>

                            {/* Secondary: Log In (Ghost) */}
                            <button
                                onClick={() => setView('login')}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--color-text)',
                                    fontSize: '1rem',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    opacity: 0.8
                                }}
                            >
                                Log in
                            </button>
                        </div>
                    </div>

                    {/* Config Warning */}
                    {!isConfigured && (
                        <p style={{
                            position: 'absolute',
                            bottom: 10,
                            color: 'var(--color-text-muted)',
                            fontSize: '0.75rem',
                            textAlign: 'center',
                            width: '100%'
                        }}>
                            ⚠️ Auth niet geconfigureerd.
                        </p>
                    )}
                </div>
            </div>
        )
    }

    // Login / Signup Form
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
            <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <button onClick={goBack} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '0.9rem', cursor: 'pointer', padding: '0.5rem 0' }}>← Terug</button>
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--color-text)', marginBottom: '0.5rem' }}>{view === 'login' ? 'Welkom terug' : 'Account aanmaken'}</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{view === 'login' ? 'Log in om verder te gaan' : 'Vul je gegevens in om te starten'}</p>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input type="email" placeholder="E-mailadres" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" style={{ padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: '1rem' }} />
                    <input type="password" placeholder="Wachtwoord" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={view === 'login' ? 'current-password' : 'new-password'} style={{ padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: '1rem' }} />
                    {error && <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.875rem' }}>{error}</div>}
                    <button type="submit" disabled={isLoading} style={{ padding: '0.875rem 1rem', borderRadius: '8px', border: 'none', background: 'var(--color-primary)', color: 'white', fontSize: '1rem', fontWeight: '500', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1, marginTop: '0.5rem' }}>{isLoading ? 'Even geduld...' : (view === 'login' ? 'Log in' : 'Account aanmaken')}</button>
                </form>
                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '1rem' }}>
                    {view === 'login' ? (<>Nog geen account? <button onClick={() => { setView('signup'); setError('') }} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline' }}>Meld je aan</button></>) : (<>Heb je al een account? <button onClick={() => { setView('login'); setError('') }} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline' }}>Log in</button></>)}
                </div>
            </div>
        </div>
    )
}
