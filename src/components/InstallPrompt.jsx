
import React, { useState, useEffect } from 'react'

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null)
    const [showPrompt, setShowPrompt] = useState(false)
    const [isIOS, setIsIOS] = useState(false)
    const [isInstalled, setIsInstalled] = useState(false)

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true)
            return
        }

        // Check if iOS
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
        setIsIOS(iOS)

        // Check if dismissed recently
        const dismissed = localStorage.getItem('install_prompt_dismissed')
        if (dismissed) {
            const dismissedTime = parseInt(dismissed, 10)
            const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)
            if (daysSinceDismissed < 7) return // Don't show for 7 days
        }

        // Listen for install prompt (Android/Chrome)
        const handler = (e) => {
            e.preventDefault()
            setDeferredPrompt(e)
            setShowPrompt(true)
        }

        window.addEventListener('beforeinstallprompt', handler)

        // For iOS, show custom prompt after a delay
        if (iOS) {
            const timer = setTimeout(() => setShowPrompt(true), 3000)
            return () => {
                clearTimeout(timer)
                window.removeEventListener('beforeinstallprompt', handler)
            }
        }

        return () => window.removeEventListener('beforeinstallprompt', handler)
    }, [])

    const handleInstall = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice
            if (outcome === 'accepted') {
                setShowPrompt(false)
            }
            setDeferredPrompt(null)
        }
    }

    const handleDismiss = () => {
        localStorage.setItem('install_prompt_dismissed', Date.now().toString())
        setShowPrompt(false)
    }

    if (isInstalled || !showPrompt) return null

    return (
        <div style={{
            position: 'fixed',
            bottom: '80px',
            left: '16px',
            right: '16px',
            maxWidth: '448px',
            margin: '0 auto',
            padding: '16px',
            background: 'var(--color-surface)',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            zIndex: 1000,
            animation: 'slideUp 0.3s ease-out'
        }}>
            <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <img
                    src="/icon-192.png"
                    alt="Allignd"
                    style={{ width: '48px', height: '48px', borderRadius: '12px' }}
                />

                <div style={{ flex: 1 }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: 'var(--color-text)'
                    }}>
                        Installeer Allignd
                    </h3>
                    <p style={{
                        margin: '4px 0 0',
                        fontSize: '0.85rem',
                        color: 'var(--color-text-muted)'
                    }}>
                        {isIOS
                            ? 'Tik op "Deel" en dan "Zet op beginscherm"'
                            : 'Voeg toe aan je startscherm voor snelle toegang'}
                    </p>
                </div>
            </div>

            <div style={{
                display: 'flex',
                gap: '8px',
                marginTop: '12px',
                justifyContent: 'flex-end'
            }}>
                <button
                    onClick={handleDismiss}
                    style={{
                        padding: '8px 16px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-text-muted)',
                        fontSize: '0.9rem',
                        cursor: 'pointer'
                    }}
                >
                    Later
                </button>

                {!isIOS && (
                    <button
                        onClick={handleInstall}
                        style={{
                            padding: '8px 20px',
                            background: 'var(--color-primary)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}
                    >
                        Installeren
                    </button>
                )}
            </div>
        </div>
    )
}
