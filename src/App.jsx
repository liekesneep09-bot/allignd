import React, { useState, useEffect } from 'react'
import { UserProvider, useUser } from './context/UserContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Onboarding from './pages/Onboarding'
import Subscription from './pages/Subscription'
import Today from './pages/Today'
import PhaseGuide from './pages/PhaseGuide'
import Recipes from './pages/Recipes'
import Fitness from './pages/Fitness'
import Profile from './pages/Profile'
import Community from './pages/Community'
import Login from './pages/Login'
import InstallPrompt from './components/InstallPrompt'
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

import { IconHome, IconActivity, IconRecipe, IconAccount, IconCommunity } from './components/Icons'
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
    const { hasOnboarded, isLoading, currentPhase } = useUser()
    const { t } = useLanguage()
    const [currentView, setCurrentView] = useState('today')
    // Track if we've shown the app at least once — prevents flash back to onboarding
    const [appReady, setAppReady] = useState(false)

    useEffect(() => {
        if (!isLoading) setAppReady(true)
    }, [isLoading])

    // Phase colors for background gradient
    const getPhaseColor = (phase) => {
        switch (phase) {
            case 'menstrual': return {
                bg: 'linear-gradient(to bottom, #a8647320 0%, rgba(168,100,115,0.05) 40%, #FFFFFF 100%)',
                text: '#a86473'
            }
            case 'follicular': return {
                bg: 'linear-gradient(to bottom, #5bc4d440 0%, rgba(91,196,212,0.1) 40%, #FFFFFF 100%)',
                text: '#5bc4d4'
            }
            case 'ovulatory': return {
                bg: 'linear-gradient(to bottom, #f5a89c20 0%, rgba(245,168,156,0.05) 40%, #FFFFFF 100%)',
                text: '#f5a89c'
            }
            case 'luteal': return {
                bg: 'linear-gradient(to bottom, #a3b89920 0%, rgba(163,184,153,0.05) 40%, #FFFFFF 100%)',
                text: '#a3b899'
            }
            default: return {
                bg: 'linear-gradient(to bottom, #F5F5F5 0%, #FFFFFF 100%)',
                text: '#9E9E9E'
            }
        }
    }

    const phaseStyle = getPhaseColor(currentPhase)

    // Show splash while loading
    if (isLoading) return <SplashScreen />

    // Fix for PWA background state flash:
    // If the app reloads from background while offline, the profile fetch might fail.
    // If it fails, hasOnboarded defaults to false. We don't want to show Onboarding if they were already in the app.
    if (!hasOnboarded) {
        // If they are offline, don't force them to Onboarding
        if (!navigator.onLine) {
            return <SplashScreen /> // Stay on splash until network returns
        }
        return <Onboarding />
    }

    // SUBSCRIPTION ACCESS (HIDDEN UNTIL LIVE)
    // if (window.location.pathname === '/subscription') {
    //     return <Subscription />
    // }

    return (
        <>
            {/* App Header */}
            <header style={{
                padding: '4px 16px', // Compact padding
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#FFFFFF',
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}>
                <div style={{ width: '32px' }}></div> {/* Spacer for centering */}

                <img
                    src={logo}
                    alt="Cyclus Logo"
                    style={{
                        height: '74px',
                        width: 'auto',
                        objectFit: 'contain',
                        display: 'block'
                    }}
                />

                {/* Right Spacer for centering */}
                <div style={{ width: '32px' }}></div>

            </header>

            <main style={{
                background: currentView !== 'today' ? phaseStyle.bg : undefined,
                minHeight: currentView !== 'today' ? 'calc(100vh - 82px)' : undefined,
                transition: 'background 0.5s ease'
            }}>
                {currentView === 'today' && <Today onNavigate={setCurrentView} />}
                {currentView === 'community' && <Community />}
                {currentView === 'fitness' && <Fitness />}
                {currentView === 'recipes' && <Recipes />}
                {currentView === 'guide' && <PhaseGuide />}
                {currentView === 'profile' && <Profile />}
            </main>

            <nav style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'var(--color-surface)',
                borderTop: '1px solid var(--color-border)',
                padding: '0.8rem 0', // Adjusted padding
                display: 'flex',
                justifyContent: 'space-around',
                boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
                maxWidth: '480px', /* Match root constraint */
                margin: '0 auto', /* center nav */
                zIndex: 100
            }}>
                <button
                    onClick={() => setCurrentView('today')}
                    style={{
                        color: currentView === 'today' ? phaseStyle.text : 'var(--color-text-muted)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        fontSize: '0.7rem',
                        fontWeight: currentView === 'today' ? '600' : '400',
                        background: 'none',
                        gap: '4px',
                        width: '64px' // Consistent touch target
                    }}
                >
                    <IconHome size={24} />
                    {t('nav.today')}
                </button>

                <button
                    onClick={() => setCurrentView('community')}
                    style={{
                        color: currentView === 'community' ? phaseStyle.text : 'var(--color-text-muted)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        fontSize: '0.7rem',
                        fontWeight: currentView === 'community' ? '600' : '400',
                        background: 'none',
                        gap: '4px',
                        width: '64px'
                    }}
                >
                    <IconCommunity size={24} />
                    {t('nav.community')}
                </button>

                <button
                    onClick={() => setCurrentView('fitness')}
                    style={{
                        color: currentView === 'fitness' ? phaseStyle.text : 'var(--color-text-muted)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        fontSize: '0.7rem',
                        fontWeight: currentView === 'fitness' ? '600' : '400',
                        background: 'none',
                        gap: '4px',
                        width: '64px'
                    }}
                >
                    <IconActivity size={24} />
                    {t('nav.fitness')}
                </button>

                <button
                    onClick={() => setCurrentView('recipes')}
                    style={{
                        color: currentView === 'recipes' ? phaseStyle.text : 'var(--color-text-muted)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        fontSize: '0.7rem',
                        fontWeight: currentView === 'recipes' ? '600' : '400',
                        background: 'none',
                        gap: '4px',
                        width: '64px'
                    }}
                >
                    <IconRecipe size={24} />
                    {t('nav.recipes')}
                </button>

                <button
                    onClick={() => setCurrentView('profile')}
                    style={{
                        color: currentView === 'profile' ? phaseStyle.text : 'var(--color-text-muted)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        fontSize: '0.7rem',
                        fontWeight: currentView === 'profile' ? '600' : '400',
                        background: 'none',
                        gap: '4px',
                        width: '64px'
                    }}
                >
                    <IconAccount size={24} />
                    {t('nav.profile')}
                </button>
            </nav>
        </>
    )
}

function AuthenticatedApp() {
    const { user, loading } = useAuth()

    if (loading) {
        return <SplashScreen />
    }

    const hasAdminOverride = localStorage.getItem('admin_override') === 'true'

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
                <AuthProvider>
                    <AuthCallback />
                </AuthProvider>
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
                    {/* <InstallPrompt /> */}
                </AuthProvider>
            </LanguageProvider>
        </ErrorBoundary>
    )
}
