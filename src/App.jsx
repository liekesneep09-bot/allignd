import React, { useState, useEffect } from 'react'
import { UserProvider, useUser } from './context/UserContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Onboarding from './pages/Onboarding'
import Today from './pages/Today'
import PhaseGuide from './pages/PhaseGuide'
import Recipes from './pages/Recipes'
import Fitness from './pages/Fitness'
import Profile from './pages/Profile'
import Community from './pages/Community'
import Assistant from './pages/Assistant'
import Login from './pages/Login'
import InstallPrompt from './components/InstallPrompt'
import OfflineBanner from './components/OfflineBanner'
import DebugView from './components/DebugView'
import ErrorBoundary from './components/ErrorBoundary'
import ConfigErrorScreen from './components/ConfigErrorScreen'
import DebugPanel from './components/DebugPanel'
import { supabaseConfigError } from './utils/supabaseClient'

import { IconHome, IconSparkles, IconActivity, IconRecipe, IconCommunity } from './components/Icons'
import logo from './assets/logo-primary.svg'

function MainLayout() {
    const { hasOnboarded, isLoading } = useUser()
    const [currentView, setCurrentView] = useState('today')

    if (isLoading) return null // or a loading spinner

    if (!hasOnboarded) {
        return <Onboarding />
    }

    return (
        <>
            {/* App Header */}
            <header style={{
                padding: '4px 16px', // Compact padding
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--color-bg)',
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

            <main>
                {currentView === 'today' && <Today onNavigate={setCurrentView} />}
                {currentView === 'assistant' && <Assistant />}
                {currentView === 'fitness' && <Fitness />}
                {currentView === 'recipes' && <Recipes />}
                {currentView === 'guide' && <PhaseGuide />}
                {currentView === 'community' && <Community />}
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
                        color: currentView === 'today' ? 'var(--color-primary)' : 'var(--color-text-muted)',
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
                    onClick={() => setCurrentView('assistant')}
                    style={{
                        color: currentView === 'assistant' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        fontSize: '0.7rem',
                        fontWeight: currentView === 'assistant' ? '600' : '400',
                        background: 'none',
                        gap: '4px',
                        width: '64px'
                    }}
                >
                    <IconSparkles size={24} />
                    Assistent
                </button>

                <button
                    onClick={() => setCurrentView('fitness')}
                    style={{
                        color: currentView === 'fitness' ? 'var(--color-primary)' : 'var(--color-text-muted)',
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
                        color: currentView === 'recipes' ? 'var(--color-primary)' : 'var(--color-text-muted)',
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
                    onClick={() => setCurrentView('community')}
                    style={{
                        color: currentView === 'community' ? 'var(--color-primary)' : 'var(--color-text-muted)',
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

import AuthCallback from './components/AuthCallback'

function App() {
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

    // Simple Route Handling for Callback
    // Since we don't have a full router, we check pathname
    const isCallback = window.location.pathname === '/auth/callback'

    if (isCallback) {
        return <AuthCallback />
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

export default App
