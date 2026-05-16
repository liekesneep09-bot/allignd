import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabaseClient'
import logo from '../assets/logo-primary.png'
import startBg from '../assets/beginscherm-achtergrond-3.jpg'
import { useLanguage } from '../context/LanguageContext'

export default function Login() {
    const { signIn, signUp, resetPassword, resendVerificationEmail, isConfigured } = useAuth()
    const { t, language, setLanguage } = useLanguage()
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
            setError(t('auth.invalid_email'))
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
            setSuccessMessage(t('auth.resend_success'))
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
            setError(t('auth.invalid_email'))
            setIsLoading(false)
            return
        }

        // Validate password
        if (!password || password.length < 6) {
            setError(t('auth.password_length'))
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
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '600' }}>{t('auth.check_inbox')}</h1>
                    <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                        {t('auth.confirm_sent')} <strong>{email}</strong>.
                        {t('auth.confirm_click')}
                    </p>
                    <div style={{ padding: '1rem', background: 'var(--color-surface)', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                        {t('auth.tip_spam')}
                    </div>
                    {successMessage && <div style={{ color: 'green', fontSize: '0.9rem' }}>{successMessage}</div>}
                    {error && <div style={{ color: 'red', fontSize: '0.9rem' }}>{error}</div>}
                    <button onClick={handleResend} disabled={isLoading} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.95rem' }}>
                        {isLoading ? t('auth.loading') : t('auth.resend')}
                    </button>
                    <button onClick={async () => {
                        setIsLoading(true)
                        setError('')
                        try {
                            await signIn(email, password)
                        } catch (err) {
                            if (err.message.includes('Bevestig eerst') || err.message.includes('not confirmed')) {
                                setError(t('auth.not_confirmed'))
                            } else {
                                setError(err.message)
                            }
                        } finally {
                            setIsLoading(false)
                        }
                    }} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: 'none', background: 'var(--color-primary)', color: '#333333', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', marginTop: '0.5rem' }}>
                        {t('auth.confirmed_btn')}
                    </button>
                    <button onClick={goBack} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.9rem' }}>{t('auth.other_email')}</button>
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
                            <h1 style={{ fontSize: '1.5rem', fontWeight: '600' }}>{t('auth.check_inbox')}</h1>
                            <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                                {t('auth.reset_sent_to')} <strong>{email}</strong> {t('auth.reset_link_info')}
                            </p>
                            <div style={{ padding: '1rem', background: 'var(--color-surface)', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                                {t('auth.tip_spam')}
                            </div>
                            <button onClick={() => { setView('login'); setResetSent(false); setError('') }} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: 'none', background: 'var(--color-primary)', color: '#333333', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}>
                                {t('auth.back_to_login')}
                            </button>
                        </>
                    ) : (
                        <>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: '600' }}>{t('auth.forgot_title')}</h1>
                            <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                                {t('auth.forgot_desc')}
                            </p>
                            <input type="email" placeholder={t('auth.email_placeholder')} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: '1rem' }} />
                            {error && <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.875rem', width: '100%' }}>{error}</div>}
                            <button onClick={handleResetPassword} disabled={isLoading} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: 'none', background: 'var(--color-primary)', color: '#333333', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', opacity: isLoading ? 0.7 : 1 }}>
                                {isLoading ? t('auth.loading') : t('auth.send_reset')}
                            </button>
                        </>
                    )}
                    <button onClick={goBack} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.9rem' }}>{t('auth.back')}</button>
                </div>
            </div>
        )
    }

    // Start Screen (RE-RE-DESIGN)
    if (view === 'start') {
        return (
            <div style={{
                minHeight: '100vh',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#FFFFFF',
            }}>

                {/* Full-screen Background Image */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: `url(${startBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: 0
                }} />

                {/* Subtle Light Gradient Overlay for Readability */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'linear-gradient(to bottom, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 40%, rgba(255,255,255,0.3) 70%, rgba(255,255,255,0.6) 100%)',
                    zIndex: 1
                }} />

                {/* Content */}
                <div style={{
                    position: 'relative',
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    height: '100vh',
                    maxWidth: '400px',
                    margin: '0 auto',
                    padding: '1.5rem 1.5rem 2.5rem 1.5rem', // Reduced top padding
                    justifyContent: 'space-between'
                }}>

                    {/* Top Bar: Logo Left, Languages Right */}
                    <div style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <img
                            src={logo}
                            alt="Allignd"
                            style={{
                                height: '55px',
                                width: 'auto',
                                objectFit: 'contain'
                            }}
                        />

                        {/* Language Switcher */}
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                             <button 
                                onClick={() => setLanguage('nl')} 
                                style={{ color: '#333333', background: 'none', border: 'none', opacity: language === 'nl' ? 1 : 0.4, fontWeight: language === 'nl' ? 700 : 400, fontSize: '0.85rem', cursor: 'pointer' }}
                             >NL</button>
                             <span style={{ color: '#333333', opacity: 0.2 }}>|</span>
                             <button 
                                onClick={() => setLanguage('en')} 
                                style={{ color: '#333333', background: 'none', border: 'none', opacity: language === 'en' ? 1 : 0.4, fontWeight: language === 'en' ? 700 : 400, fontSize: '0.85rem', cursor: 'pointer' }}
                             >EN</button>
                        </div>
                    </div>

                    {/* Hero Text Section */}
                    <div style={{ 
                        textAlign: 'left', 
                        width: '100%', 
                        marginTop: 'auto', 
                        marginBottom: 'auto' 
                    }}>
                        <h1 style={{ 
                            fontSize: '2.8rem', 
                            lineHeight: 1.1, 
                            fontWeight: '700', 
                            color: '#333333', 
                            margin: 0,
                            letterSpacing: '-0.02em',
                            textShadow: '0 1px 2px rgba(255,255,255,0.8)' // Better contrast over image
                        }}>
                            {t('auth.tagline_main')}<br />
                            <span style={{ 
                                color: 'var(--color-primary)', 
                                fontStyle: 'italic',
                                fontWeight: '500'
                            }}>{t('auth.tagline_highlight')}</span>
                        </h1>
                        
                        <p style={{
                            fontSize: '1.05rem',
                            lineHeight: '1.5',
                            color: '#333333', // Darker for better visibility
                            marginTop: '1.5rem',
                            maxWidth: '280px',
                            fontWeight: '700' // Bold as requested
                        }}>
                            {t('auth.subtext')}
                        </p>
                    </div>

                    {/* Buttons Container */}
                    <div style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        alignItems: 'center',
                        marginTop: 'auto' // Pushes buttons to the bottom
                    }}>
                        <button
                            onClick={() => setView('signup')}
                            style={{
                                width: '100%',
                                padding: '1.1rem',
                                borderRadius: '16px',
                                border: 'none',
                                background: 'var(--color-primary)',
                                color: '#1a1a1a',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                boxShadow: '0 8px 24px rgba(255, 174, 185, 0.3)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {t('auth.signup_btn')}
                        </button>

                        <button
                            onClick={() => setView('login')}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: 'transparent',
                                border: 'none',
                                color: '#333333',
                                fontSize: '1.05rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                textShadow: '0 1px 2px rgba(255,255,255,0.5)'
                            }}
                        >
                            {t('auth.login_btn_ghost')}
                        </button>
                    </div>

                    {/* Config Warning */}
                    {!isConfigured && (
                        <p style={{
                            position: 'absolute',
                            bottom: 10,
                            color: 'rgba(0,0,0,0.3)',
                            fontSize: '0.75rem',
                            textAlign: 'center',
                            width: '100%'
                        }}>
                            {t('auth.not_configured')}
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
                <button onClick={goBack} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '0.9rem', cursor: 'pointer', padding: '0.5rem 0' }}>← {t('auth.back')}</button>
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--color-text)', marginBottom: '0.5rem' }}>{view === 'login' ? t('auth.welcome_back') : t('auth.create_account')}</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{view === 'login' ? t('auth.login_desc') : t('auth.signup_desc')}</p>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input type="email" placeholder={t('auth.email_placeholder')} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" style={{ padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.8)', color: 'var(--color-text)', fontSize: '1rem' }} />
                    <input type="password" placeholder={t('auth.password_placeholder')} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={view === 'login' ? 'current-password' : 'new-password'} style={{ padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.8)', color: 'var(--color-text)', fontSize: '1rem' }} />
                    {error && <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.875rem' }}>{error}</div>}
                    <button type="submit" disabled={isLoading} style={{ padding: '0.875rem 1rem', borderRadius: '8px', border: 'none', background: 'var(--color-primary)', color: '#333333', fontSize: '1rem', fontWeight: '500', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1, marginTop: '0.5rem', boxShadow: '0 4px 12px rgba(255, 174, 185, 0.2)' }}>{isLoading ? t('auth.loading') : (view === 'login' ? t('auth.login_btn') : t('auth.signup_btn'))}</button>
                </form>
                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '1rem' }}>
                    {view === 'login' ? (<>{t('auth.no_account')} <button onClick={() => { setView('signup'); setError('') }} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline' }}>{t('auth.signup_btn')}</button></>) : (<>{t('auth.has_account')} <button onClick={() => { setView('login'); setError('') }} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline' }}>{t('auth.login_btn')}</button></>)}
                </div>
                {view === 'login' && (
                    <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                        <button onClick={() => { setView('forgot'); setError('') }} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}>
                            {t('auth.forgot_link')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
