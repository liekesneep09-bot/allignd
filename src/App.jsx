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

import { IconHome, IconActivity, IconRecipe, IconAccount, IconCommunity } from './components/Icons'
import logo from './assets/logo-primary.png'

function MainLayout() {
    const { hasOnboarded, isLoading, currentPhase } = useUser()
    const [currentView, setCurrentView] = useState('today')

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

    if (isLoading) return null // or a loading spinner

    if (!hasOnboarded) {
        return <Onboarding />
    }

    // SUBSCRIPTION BYPASSED FOR TESTING
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
                    Vandaag
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
                    Community
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
                    Fitness
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
                    Recepten
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
                    Profiel
                </button>
            </nav>
            {import.meta.env.DEV && <DebugView />}
        </>
    )
}

function AuthenticatedApp() {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--color-bg)',
                color: 'var(--color-text-muted)'
            }}>
                Even laden...
            </div>
        )
    }

    if (!user) {
        return <Login />
    }

    return (
        <UserProvider>
            <MainLayout />
        </UserProvider>
    )
}

export default function App() {
    const [isOnline, setIsOnline] = useState(navigator.onLine)

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
            <AuthProvider>
                <OfflineBanner isOnline={isOnline} />
                <AuthenticatedApp />
                <InstallPrompt />
                {import.meta.env.DEV && <DebugPanel />}
            </AuthProvider>
        </ErrorBoundary>
    )
}
