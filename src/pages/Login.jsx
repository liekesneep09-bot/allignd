import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabaseClient'
import logo from '../assets/logo-primary.png'
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

        if (!email || !email.includes('@')) {
            setError(t('auth.invalid_email'))
            setIsLoading(false)
            return
        }

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
            const msg = err.message || ''
            const isEmailNotConfirmed = 
                msg.includes('Bevestig eerst je e-mailadres') ||
                msg.includes('Email not confirmed') ||
                msg.includes('email_not_confirmed')
            if (isEmailNotConfirmed) {
                setShowConfirmation(true)
                setError('')
            } else {
                setError(msg)
            }
        } finally {
            setIsLoading(false)
        }
    }

    const goBack = () => {
        setView('start')
        setPassword('')
        setError('')
        setSuccessMessage('')
        setShowConfirmation(false)
        setResetSent(false)
    }

    // --- Premium Minimalist Styling Objects ---
    const pageStyle = {
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#333333', // Dark mode brand color
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        color: '#333333',
        fontFamily: "'DM Sans', sans-serif",
        transition: 'all 0.3s ease'
    }

    const cardStyle = {
        width: '100%',
        maxWidth: '400px', // slightly smaller, tighter for premium feel
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        padding: '2.5rem 2rem',
        boxShadow: '0 12px 48px rgba(0,0,0,0.06)', // deep soft shadow
        border: '1px solid rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        alignItems: 'center',
        textAlign: 'center'
    }

    const inputStyle = {
        width: '100%',
        padding: '1rem 1.25rem',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid #EBEBEB',
        backgroundColor: '#FCFCFC',
        color: '#333333',
        fontSize: '1rem',
        outline: 'none',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box'
    }

    const primaryBtnStyle = {
        width: '100%',
        padding: '1.1rem',
        borderRadius: 'var(--radius-md)',
        border: 'none',
        background: 'var(--color-primary)', // Keeping brand identity
        color: '#333333',
        fontSize: '1.05rem',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 4px 14px rgba(255, 174, 185, 0.4)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        marginTop: '0.5rem',
        opacity: isLoading ? 0.7 : 1
    }

    const secondaryBtnStyle = {
        width: '100%',
        padding: '1.1rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid #EBEBEB',
        backgroundColor: '#FFFFFF',
        color: '#333333',
        fontSize: '1.05rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background 0.2s ease',
    }

    const textBtnStyle = {
        background: 'none',
        border: 'none',
        color: 'var(--color-text-muted)',
        fontSize: '0.9rem',
        cursor: 'pointer',
        textDecoration: 'underline',
        padding: '0.5rem'
    }

    // --- Render Helpers ---

    const renderConfirmation = () => (
        <div style={cardStyle}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0 }}>{t('auth.check_inbox')}</h1>
            <p style={{ color: '#666', lineHeight: '1.5', margin: 0 }}>
                {t('auth.confirm_sent')} <strong style={{color: '#333'}}>{email}</strong>.<br/>
                {t('auth.confirm_click')}
            </p>
            <div style={{ padding: '1rem', background: '#F8F8F8', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', color: '#666', width: '100%', boxSizing: 'border-box' }}>
                {t('auth.tip_spam')}
            </div>
            {successMessage && <div style={{ color: '#10B981', fontSize: '0.9rem', fontWeight: '500' }}>{successMessage}</div>}
            {error && <div style={{ color: '#EF4444', fontSize: '0.9rem', fontWeight: '500' }}>{error}</div>}
            <button onClick={handleResend} disabled={isLoading} style={textBtnStyle}>
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
            }} style={primaryBtnStyle}>
                {t('auth.confirmed_btn')}
            </button>
            <button onClick={goBack} style={textBtnStyle}>{t('auth.other_email')}</button>
        </div>
    )

    const renderForgot = () => (
        <div style={cardStyle}>
            {resetSent ? (
                <>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0 }}>{t('auth.check_inbox')}</h1>
                    <p style={{ color: '#666', lineHeight: '1.5', margin: 0 }}>
                        {t('auth.reset_sent_to')} <strong style={{color: '#333'}}>{email}</strong> {t('auth.reset_link_info')}
                    </p>
                    <div style={{ padding: '1rem', background: '#F8F8F8', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', color: '#666', width: '100%', boxSizing: 'border-box' }}>
                        {t('auth.tip_spam')}
                    </div>
                    <button onClick={() => { setView('login'); setResetSent(false); setError('') }} style={primaryBtnStyle}>
                        {t('auth.back_to_login')}
                    </button>
                </>
            ) : (
                <>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0 }}>{t('auth.forgot_title')}</h1>
                    <p style={{ color: '#666', lineHeight: '1.5', margin: 0 }}>
                        {t('auth.forgot_desc')}
                    </p>
                    <input type="email" placeholder={t('auth.email_placeholder')} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" style={inputStyle} />
                    {error && <div style={{ padding: '0.8rem', borderRadius: 'var(--radius-sm)', background: '#FEF2F2', color: '#EF4444', fontSize: '0.875rem', width: '100%', boxSizing: 'border-box' }}>{error}</div>}
                    <button onClick={handleResetPassword} disabled={isLoading} style={primaryBtnStyle}>
                        {isLoading ? t('auth.loading') : t('auth.send_reset')}
                    </button>
                </>
            )}
            <button onClick={goBack} style={textBtnStyle}>{t('auth.back')}</button>
        </div>
    )

    const renderStart = () => (
        <div style={{...cardStyle, padding: '3.5rem 2rem 2.5rem 2rem', gap: '2rem'}}>
            <img src={logo} alt="Allignd" style={{ height: '110px', width: 'auto', marginBottom: '0.5rem' }} />
            
            <div style={{ textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.4rem', lineHeight: 1.1, fontWeight: '800', color: '#333333', margin: '0 0 1rem 0', letterSpacing: '-0.03em' }}>
                    {t('auth.tagline_main')}<br />
                    <span style={{ color: 'var(--color-primary)', fontStyle: 'italic', fontWeight: '600' }}>{t('auth.tagline_highlight')}</span>
                </h1>
                <p style={{ fontSize: '1.05rem', lineHeight: '1.5', color: '#666', margin: 0, fontWeight: '500' }}>
                    {t('auth.subtext')}
                </p>
            </div>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button onClick={() => setView('signup')} style={primaryBtnStyle}>
                    {t('auth.signup_btn')}
                </button>
                <button onClick={() => setView('login')} style={secondaryBtnStyle}>
                    {t('auth.login_btn_ghost')}
                </button>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '1rem' }}>
                 <button onClick={() => setLanguage('nl')} style={{ color: '#333', background: 'none', border: 'none', opacity: language === 'nl' ? 1 : 0.4, fontWeight: language === 'nl' ? 700 : 500, fontSize: '0.9rem', cursor: 'pointer', padding: 0 }}>NL</button>
                 <span style={{ color: '#CCC', fontSize: '0.9rem' }}>|</span>
                 <button onClick={() => setLanguage('en')} style={{ color: '#333', background: 'none', border: 'none', opacity: language === 'en' ? 1 : 0.4, fontWeight: language === 'en' ? 700 : 500, fontSize: '0.9rem', cursor: 'pointer', padding: 0 }}>EN</button>
            </div>

            {!isConfigured && (
                <p style={{ color: '#999', fontSize: '0.75rem', margin: 0 }}>{t('auth.not_configured')}</p>
            )}
        </div>
    )

    const renderForm = () => (
        <div style={cardStyle}>
            <button onClick={goBack} style={{ ...textBtnStyle, alignSelf: 'flex-start', padding: 0, textDecoration: 'none', fontWeight: '600', color: '#666' }}>← {t('auth.back')}</button>
            
            <div style={{ textAlign: 'center', width: '100%', marginBottom: '0.5rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#333333', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
                    {view === 'login' ? t('auth.welcome_back') : t('auth.create_account')}
                </h1>
                <p style={{ color: '#666', fontSize: '0.95rem', margin: 0 }}>
                    {view === 'login' ? t('auth.login_desc') : t('auth.signup_desc')}
                </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                <input type="email" placeholder={t('auth.email_placeholder')} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" style={inputStyle} />
                <input type="password" placeholder={t('auth.password_placeholder')} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={view === 'login' ? 'current-password' : 'new-password'} style={inputStyle} />
                
                {error && <div style={{ padding: '0.8rem', borderRadius: 'var(--radius-sm)', background: '#FEF2F2', color: '#EF4444', fontSize: '0.875rem', width: '100%', boxSizing: 'border-box', textAlign: 'left' }}>{error}</div>}
                
                <button type="submit" disabled={isLoading} style={{...primaryBtnStyle, marginTop: '1rem'}}>
                    {isLoading ? t('auth.loading') : (view === 'login' ? t('auth.login_btn') : t('auth.signup_btn'))}
                </button>
            </form>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>
                    {view === 'login' ? (
                        <>{t('auth.no_account')} <button onClick={() => { setView('signup'); setError('') }} style={{...textBtnStyle, padding: 0, color: 'var(--color-primary)', fontWeight: '600'}}>{t('auth.signup_btn')}</button></>
                    ) : (
                        <>{t('auth.has_account')} <button onClick={() => { setView('login'); setError('') }} style={{...textBtnStyle, padding: 0, color: 'var(--color-primary)', fontWeight: '600'}}>{t('auth.login_btn')}</button></>
                    )}
                </div>
                
                {view === 'login' && (
                    <button onClick={() => { setView('forgot'); setError('') }} style={textBtnStyle}>
                        {t('auth.forgot_link')}
                    </button>
                )}
            </div>
        </div>
    )

    return (
        <div style={pageStyle}>
            {showConfirmation ? renderConfirmation() : 
             view === 'forgot' ? renderForgot() : 
             view === 'start' ? renderStart() : 
             renderForm()}
        </div>
    )
}
