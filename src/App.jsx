import React, { useState, useEffect, useCallback } from 'react'
import { UserProvider, useUser } from './context/UserContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Onboarding from './pages/Onboarding'
import Subscription from './pages/Subscription'
import Today from './pages/Today'
import PhaseGuide from './pages/PhaseGuide'
import Recipes from './pages/Recipes'
import Fitness from './pages/Fitness'
import Profile from './pages/Profile'
import Privacy from './pages/Privacy'
import Community from './pages/Community'
import Progress from './pages/Progress'
import Login from './pages/Login'
import OfflineBanner from './components/OfflineBanner'
import DebugView from './components/DebugView'
import ErrorBoundary from './components/ErrorBoundary'
import ConfigErrorScreen from './components/ConfigErrorScreen'
import DebugPanel from './components/DebugPanel'
import { supabaseConfigError } from './utils/supabaseClient'
import AuthCallback from './components/AuthCallback'
import LandingPage from './pages/LandingPage'
import { LanguageProvider, useLanguage } from './context/LanguageContext'
import BetaUnlockScreen from './components/BetaUnlockScreen'

import { IconHome, IconActivity, IconRecipe, IconAccount, IconCommunity, IconGuide } from './components/Icons'
import logo from './assets/logo-primary.png'

function SplashScreen() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fff',
            animation: 'fadeIn 0.3s ease-out'
        }}>
            <img
                src={logo}
                alt="Allignd"
                style={{ height: '90px', width: 'auto', objectFit: 'contain' }}
            />
            <div style={{
                marginTop: '1.5rem',
                width: '36px',
                height: '3px',
                borderRadius: '2px',
                background: 'var(--color-primary)',
                opacity: 0.4,
                animation: 'pulse 1.2s ease-in-out infinite'
            }} />
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.2; transform: scaleX(0.7); }
                    50% { opacity: 0.6; transform: scaleX(1); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    )
}

function MainLayout() {
    const { hasOnboarded, isLoading, currentPhase, user } = useUser()
    const { t } = useLanguage()
    const [currentView, setCurrentView] = useState('today')

    // Wrapper: scroll to top on every view switch
    const navigateTo = useCallback((view) => {
        setCurrentView(view)
        window.scrollTo(0, 0)
    }, [])
    // Track if we've shown the app at least once — prevents flash back to onboarding
    // Initialize from localStorage: if user already onboarded, skip the guard entirely
    const [appReady, setAppReady] = useState(() => localStorage.getItem('cyclus_onboarded') === 'true')

    useEffect(() => {
        if (!isLoading) {
            setAppReady(true)
        }
    }, [isLoading])

    // Phase colors for background gradient
    const getPhaseColor = (phase) => {
        switch (phase) {
            case 'menstrual': return {
                bg: 'linear-gradient(to bottom, #c4506a20 0%, rgba(196,80,106,0.05) 40%, #FFFFFF 100%)',
                text: '#c4506a'
            }
            case 'follicular': return {
                bg: 'linear-gradient(to bottom, #2fb5c740 0%, rgba(47,181,199,0.1) 40%, #FFFFFF 100%)',
                text: '#2fb5c7'
            }
            case 'ovulatory': return {
                bg: 'linear-gradient(to bottom, #e8785f20 0%, rgba(232,120,95,0.05) 40%, #FFFFFF 100%)',
                text: '#e8785f'
            }
            case 'luteal': return {
                bg: 'linear-gradient(to bottom, #6a9f6b20 0%, rgba(106,159,107,0.05) 40%, #FFFFFF 100%)',
                text: '#6a9f6b'
            }
            default: return {
                bg: 'linear-gradient(to bottom, #F5F5F5 0%, #FFFFFF 100%)',
                text: '#9E9E9E'
            }
        }
    }

    const phaseStyle = getPhaseColor(currentPhase)

    // Show splash while loading, or until appReady is true.
    // appReady prevents a flash of the Onboarding screen when hasOnboarded
    // temporarily reads as false during initial load.
    if (isLoading || !appReady) return <SplashScreen />

    const actuallyHasOnboarded = hasOnboarded
    
    if (!actuallyHasOnboarded) {
        if (!navigator.onLine) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem',
                    textAlign: 'center'
                }}>
                    <img src={logo} alt="Allignd" style={{ height: '80px', marginBottom: '2rem' }} />
                    <h2 style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>
                        {t('offline.title') || 'Geen internetverbinding'}
                    </h2>
                    <p className="text-muted">
                        {t('offline.onboarding_message') || 'Verbind met internet om de setup te voltooien.'}
                    </p>
                </div>
            )
        }
        return <Onboarding />
    }

    // ABONNEMENTEN-MUUR (PAYWALL) — TIJDELIJK UITGESCHAKELD VOOR TESTEN
    // if (user?.subscription_status !== 'active') {
    //     return <Subscription />
    // }

    return (
        <>
            {/* App Header */}
            <header style={{
                padding: '6px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#FFFFFF',
                position: 'sticky',
                top: 0,
                zIndex: 50
            }}>
                <div style={{ width: '32px' }}></div> {/* Spacer for centering */}

                <img
                    src={logo}
                    alt="Allignd Logo"
                    style={{
                        height: '74px',
                        width: 'auto',
                        objectFit: 'contain',
                        display: 'block'
                    }}
                />

                {/* Profile Button top right (Removed to avoid duplication, as it exists top left in Today view) */}
                <div style={{ width: '32px' }}></div> {/* Spacer for centering */}

            </header>

            <main 
                style={{
                    background: currentView !== 'today' ? phaseStyle.bg : undefined,
                    minHeight: currentView !== 'today' ? 'calc(100vh - 56px)' : undefined,
                    transition: 'background 0.5s ease',
                    flex: 1
                }}
            >
                {currentView === 'today' && <Today onNavigate={navigateTo} />}
                {currentView === 'community' && <Community />}
                {currentView === 'fitness' && <Fitness />}
                {currentView === 'recipes' && <Recipes />}
                {currentView === 'guide' && <PhaseGuide />}
                {currentView === 'profile' && <Profile onNavigate={navigateTo} />}
                {currentView === 'privacy' && <Privacy onNavigate={navigateTo} />}
                {currentView === 'progress' && <Progress onClose={() => navigateTo('today')} />}
            </main>

            <nav style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderTop: '1px solid var(--color-border-light)',
                paddingTop: 'var(--space-2)',
                paddingBottom: 'calc(var(--space-2) + env(safe-area-inset-bottom, 0px))',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                maxWidth: '480px',
                margin: '0 auto',
                zIndex: 100
            }}>
                {[
                    { view: 'today', icon: IconHome, label: t('nav.today') },
                    { view: 'community', icon: IconCommunity, label: t('nav.community') },
                    { view: 'fitness', icon: IconActivity, label: t('nav.fitness') },
                    { view: 'recipes', icon: IconRecipe, label: t('nav.recipes') },
                    { view: 'guide', icon: IconGuide, label: t('nav.guide') }
                ].map(({ view, icon: Icon, label }) => {
                    const isActive = currentView === view;
                    return (
                        <button
                            key={view}
                            onClick={() => navigateTo(view)}
                            style={{
                                color: isActive ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                fontSize: 'var(--font-size-xs)',
                                fontWeight: isActive ? '600' : '500',
                                background: 'none',
                                gap: 'var(--space-1)',
                                padding: 'var(--space-2) var(--space-3)',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                transition: 'all var(--transition-base)',
                                minWidth: '56px'
                            }}
                        >
                            <div style={{
                                padding: 'var(--space-2)',
                                borderRadius: 'var(--radius-md)',
                                background: isActive ? 'var(--color-primary-light)' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all var(--transition-base)'
                            }}>
                                <Icon size={22} />
                            </div>
                            <span style={{ lineHeight: 1 }}>{label}</span>
                        </button>
                    );
                })}
            </nav>
        </>
    )
}

function AuthenticatedApp() {
    const { user, loading } = useAuth()

    if (loading) {
        return <SplashScreen />
    }

    let hasAdminOverride = localStorage.getItem('admin_override') === 'true'

    // admin_override is ONLY set via the secret URL (?toegang=liekenelis) or /unlock screen.
    // Do NOT auto-grant it based on auth session — we are in waitlist mode.

    // VOOR-LANCERING BEVEILIGING:
    // Blokkeer toegang tot de app (en de login). Alleen via het wachtwoord kunnen we de app in.
    if (!hasAdminOverride) {
        if (window.location.pathname === '/unlock') {
            return <BetaUnlockScreen />
        }
        
        if (window.location.pathname !== '/') {
            window.history.replaceState({}, '', '/')
        }
        return <LandingPage />
    }

    if (!user) {
        // If we are not logged in, show the Landing Page by default for the tease phase
        if (window.location.pathname === '/login') {
            return <Login />
        }
        return <LandingPage onEnterApp={() => window.history.pushState({}, '', '/login') || window.dispatchEvent(new PopStateEvent('popstate'))} />
    }

    // Force route back to / if they go to /app after logging in, just to keep URL clean (optional)
    if (window.location.pathname === '/app') {
        window.history.replaceState({}, '', '/')
    }

    return (
        <UserProvider>
            <MainLayout />
        </UserProvider>
    )
}

export default function App() {
    const [isOnline, setIsOnline] = useState(navigator.onLine)

    // GEHEIME ACHTERDEUR LOGICA
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        if (params.get('toegang') === 'liekenelis') {
            localStorage.setItem('admin_override', 'true')
            // Maak de URL weer netjes schoon
            window.history.replaceState({}, document.title, window.location.pathname)
        }
    }, [])

    useEffect(() => {
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    // Add listener for popstate to re-render when navigating between landing page and app
    const [, forceUpdate] = useState({})
    useEffect(() => {
        const handlePopState = () => forceUpdate({})
        window.addEventListener('popstate', handlePopState)
        return () => window.removeEventListener('popstate', handlePopState)
    }, [])

    // PWA Service Worker is registered automatically by Vite PWA plugin when using 'prompt', 
    // no need for manual React hooks that might cause re-renders.

    // Simple Route Handling for Callback
    const isCallback = window.location.pathname === '/auth/callback'

    if (isCallback) {
        // If we are on callback but we ALREADY have a session (e.g. from localStorage), just go to home
        return (
            <ErrorBoundary>
                <LanguageProvider>
                    <AuthProvider>
                        <AuthCallback />
                    </AuthProvider>
                </LanguageProvider>
            </ErrorBoundary>
        )
    }

    // Check if Supabase is configured
    if (supabaseConfigError) {
        return <ConfigErrorScreen />
    }

    return (
        <ErrorBoundary>
            <LanguageProvider>
                <AuthProvider>
                    <OfflineBanner isOnline={isOnline} />
                    <AuthenticatedApp />
                    <DebugPanel />
                </AuthProvider>
            </LanguageProvider>
        </ErrorBoundary>
    )
}
