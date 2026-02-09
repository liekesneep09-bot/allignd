import React from 'react'

export default function Community() {
    return (
        <div style={{
            padding: 'var(--space-lg)',
            paddingBottom: '120px',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
        }}>
            <div style={{
                fontSize: '3rem',
                marginBottom: 'var(--space-md)'
            }}>
                💬
            </div>
            <h1 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: 'var(--color-text)',
                marginBottom: 'var(--space-sm)'
            }}>
                Community
            </h1>
            <p style={{
                fontSize: '1rem',
                color: 'var(--color-text-muted)',
                maxWidth: '280px',
                lineHeight: 1.5
            }}>
                Binnenkort beschikbaar. Deel ervaringen en tips met andere gebruikers.
            </p>
        </div>
    )
}
