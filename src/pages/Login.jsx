
import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabaseClient'
import logo from '../assets/logo-primary.png'
import startBg from '../assets/Ontwerp zonder titel.png'

export default function Login() {
    const { signIn, signUp, resetPassword, resendVerificationEmail, isConfigured } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [view, setView] = useState('start') // 'start', 'login', 'signup', 'forgot'
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [resetSent, setResetSent] = useState(false)

    const handleResetPassword = async () => {
        if (!email || !email.includes('@')) {
            setError('Vul een geldig e-mailadres in')
            return
        }
        setIsLoading(true)
        setError('')
        try {
            await resetPassword(email)
            setResetSent(true)
        } catch (err) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }


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
        setResetSent(false)
    }

    // Confirmation Screen
    if (showConfirmation) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
                <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', textAlign: 'center' }}>
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
                        setError('')
                        try {
                            await signIn(email, password)
                        } catch (err) {
                            if (err.message.includes('Bevestig eerst') || err.message.includes('not confirmed')) {
                                setError('Nog niet bevestigd. Heb je op de link geklikt?')
                            } else {
                                setError(err.message)
                            }
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

    // Password Reset Screen
    if (view === 'forgot') {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
                <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', textAlign: 'center' }}>
                    {resetSent ? (
                        <>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Check je inbox</h1>
                            <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                                We hebben een link gestuurd naar <strong>{email}</strong> waarmee je je wachtwoord kunt resetten.
                            </p>
                            <div style={{ padding: '1rem', background: 'var(--color-surface)', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                                Tip: Check ook je spam of reclame folder.
                            </div>
                            <button onClick={() => { setView('login'); setResetSent(false); setError('') }} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: 'none', background: 'var(--color-primary)', color: 'white', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}>
                                Terug naar inloggen
                            </button>
                        </>
                    ) : (
                        <>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Wachtwoord vergeten?</h1>
                            <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                                Vul je e-mailadres in en we sturen je een link om je wachtwoord te resetten.
                            </p>
                            <input type="email" placeholder="E-mailadres" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: '1rem' }} />
                            {error && <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.875rem', width: '100%' }}>{error}</div>}
                            <button onClick={handleResetPassword} disabled={isLoading} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: 'none', background: 'var(--color-primary)', color: 'white', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', opacity: isLoading ? 0.7 : 1 }}>
                                {isLoading ? 'Bezig...' : 'Verstuur reset link'}
                            </button>
                        </>
                    )}
                    <button onClick={goBack} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.9rem' }}>Terug</button>
                </div>
            </div>
        )
    }

    // Start Screen (RE-RE-DESIGN)
    // Removed: "Not against it", "White Block"
    if (view === 'start') {
        return (
            <div style={{
                minHeight: '100vh',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#FFFFFF',
                color: 'var(--color-text)'
            }}>

                {/* Background: illustration */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: `url(${startBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    transform: 'scale(1.25)', // Maakt de afbeelding een stuk groter
                    opacity: 0.55, // Middle ground: niet te fel/dominant, maar de kleuren blijven helder
                    filter: 'saturate(0.75)',
                    zIndex: 0
                }} />

                {/* Content */}
                <div style={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100vh',
                    maxWidth: '400px',
                    margin: '0 auto',
                    padding: '2rem'
                }}>

                    {/* Logo + Tagline — perfectly centered in viewport */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                        <img
                            src={logo}
                            alt="Allignd"
                            style={{
                                height: '260px',
                                width: 'auto',
                                maxWidth: '90%',
                                marginBottom: '1rem',
                                objectFit: 'contain'
                            }}
                        />

                        <p style={{
                            fontSize: '0.9rem',
                            fontWeight: '400',
                            fontStyle: 'italic',
                            color: 'var(--color-text-muted)',
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            textAlign: 'center',
                            margin: 0
                        }}>
                            Move with your cycle
                        </p>
                    </div>

                    {/* Buttons — pinned to bottom so they don't disrupt centering */}
                    <div style={{
                        position: 'absolute',
                        bottom: '2.5rem',
                        left: 0,
                        right: 0,
                        padding: '0 2rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        width: '100%'
                    }}>
                        <button
                            onClick={() => setView('signup')}
                            style={{
                                width: '100%',
                                padding: '1.2rem',
                                borderRadius: '14px',
                                border: 'none',
                                background: 'var(--color-primary)',
                                color: 'white',
                                fontSize: '1.05rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                boxShadow: '0 6px 18px rgba(112, 193, 163, 0.25)',
                                transition: 'transform 0.1s'
                            }}
                        >
                            Meld je aan
                        </button>

                        <button
                            onClick={() => setView('login')}
                            style={{
                                width: '100%',
                                padding: '0.9rem',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--color-text)',
                                fontSize: '0.95rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                opacity: 0.7
                            }}
                        >
                            Log in
                        </button>
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
                            Auth niet geconfigureerd.
                        </p>
                    )}
                </div>
            </div>
        )
    }

    // Login / Signup Form
    return (
        <div style={{
            minHeight: '100vh',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            color: 'var(--color-text)'
        }}>
            {/* Animated phase-color background (Shared with Start Screen) */}
            <style>{`
                @keyframes phaseColors {
                    0%, 100% { background: linear-gradient(135deg, #a8647320 0%, rgba(168,100,115,0.05) 50%, #FFFFFF 100%); } /* Menstrual */
                    25% { background: linear-gradient(135deg, #5bc4d440 0%, rgba(91,196,212,0.1) 50%, #FFFFFF 100%); } /* Follicular - New Color */
                    50% { background: linear-gradient(135deg, #f5a89c20 0%, rgba(245,168,156,0.05) 50%, #FFFFFF 100%); } /* Ovulatory */
                    75% { background: linear-gradient(135deg, #e2a9f120 0%, rgba(226,169,241,0.05) 50%, #FFFFFF 100%); } /* Luteal */
                }
            `}</style>
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                animation: 'phaseColors 12s ease-in-out infinite',
                zIndex: 0
            }} />

            <div style={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                maxWidth: '400px',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                // Add a subtle glass effect to make form readable over gradient
                background: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(10px)',
                padding: '2rem',
                borderRadius: '24px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
            }}>
                <button onClick={goBack} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '0.9rem', cursor: 'pointer', padding: '0.5rem 0' }}>← Terug</button>
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--color-text)', marginBottom: '0.5rem' }}>{view === 'login' ? 'Welkom terug' : 'Account aanmaken'}</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{view === 'login' ? 'Log in om verder te gaan' : 'Vul je gegevens in om te starten'}</p>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input type="email" placeholder="E-mailadres" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" style={{ padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.8)', color: 'var(--color-text)', fontSize: '1rem' }} />
                    <input type="password" placeholder="Wachtwoord" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={view === 'login' ? 'current-password' : 'new-password'} style={{ padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.8)', color: 'var(--color-text)', fontSize: '1rem' }} />
                    {error && <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.875rem' }}>{error}</div>}
                    <button type="submit" disabled={isLoading} style={{ padding: '0.875rem 1rem', borderRadius: '8px', border: 'none', background: 'var(--color-primary)', color: 'white', fontSize: '1rem', fontWeight: '500', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1, marginTop: '0.5rem', boxShadow: '0 4px 12px rgba(112, 193, 163, 0.2)' }}>{isLoading ? 'Even geduld...' : (view === 'login' ? 'Log in' : 'Account aanmaken')}</button>
                </form>
                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '1rem' }}>
                    {view === 'login' ? (<>Nog geen account? <button onClick={() => { setView('signup'); setError('') }} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline' }}>Meld je aan</button></>) : (<>Heb je al een account? <button onClick={() => { setView('login'); setError('') }} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline' }}>Log in</button></>)}
                </div>
                {view === 'login' && (
                    <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                        <button onClick={() => { setView('forgot'); setError('') }} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}>
                            Wachtwoord vergeten?
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
