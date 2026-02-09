import React, { useState } from 'react'
import { supabase, supabaseConfigError } from '../utils/supabaseClient'

export default function DebugPanel() {
    const [isExpanded, setIsExpanded] = useState(false)

    // Only show in development
    if (!import.meta.env.DEV) return null

    const resetSession = async () => {
        if (!confirm('Reset local session? Dit verwijdert alle lokale data en logt je uit.')) {
            return
        }

        try {
            // Sign out from Supabase
            if (supabase) {
                await supabase.auth.signOut()
            }

            // Clear all Supabase localStorage keys
            Object.keys(localStorage)
                .filter(key => key.startsWith('sb-'))
                .forEach(key => {
                    localStorage.removeItem(key)
                    console.log('Removed:', key)
                })

            // Clear app data
            localStorage.removeItem('cyclus_onboarded')

            // Reload
            window.location.href = '/'
        } catch (err) {
            console.error('Failed to reset session:', err)
            alert('Reset failed. Check console.')
        }
    }

    const envVars = {
        url: import.meta.env.VITE_SUPABASE_URL,
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
    }

    const projectRef = envVars.url
        ? envVars.url.replace('https://', '').split('.')[0]
        : 'N/A'

    return (
        <div style={{
            position: 'fixed',
            bottom: '16px',
            right: '16px',
            zIndex: 9999
        }}>
            {!isExpanded ? (
                <button
                    onClick={() => setIsExpanded(true)}
                    style={{
                        background: '#2196f3',
                        color: 'white',
                        border: 'none',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                >
                    🔧 Debug
                </button>
            ) : (
                <div style={{
                    background: 'rgba(0, 0, 0, 0.95)',
                    color: '#00ff00',
                    padding: '16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    minWidth: '300px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    border: '1px solid #00ff00'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px'
                    }}>
                        <strong style={{ color: '#00ff00' }}>🔬 DEBUG PANEL</strong>
                        <button
                            onClick={() => setIsExpanded(false)}
                            style={{
                                background: 'transparent',
                                color: '#00ff00',
                                border: '1px solid #00ff00',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                cursor: 'pointer'
                            }}
                        >
                            ✕
                        </button>
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                        <strong>ENV Status:</strong>
                    </div>
                    <div style={{ marginLeft: '12px', marginBottom: '8px' }}>
                        <div>URL: {envVars.url ? '✓' : '✗'}</div>
                        <div>Anon Key: {envVars.anonKey ? '✓' : '✗'}</div>
                    </div>

                    {supabaseConfigError && (
                        <div style={{
                            background: '#ff000020',
                            border: '1px solid #ff0000',
                            padding: '8px',
                            borderRadius: '4px',
                            marginBottom: '8px',
                            color: '#ff6666'
                        }}>
                            <strong>⚠️ Config Error:</strong><br />
                            {supabaseConfigError}
                        </div>
                    )}

                    <div style={{ marginBottom: '8px' }}>
                        <strong>Project:</strong> {projectRef}
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                        <strong>Auth:</strong> {supabase ? 'Initialized' : 'Failed'}
                    </div>

                    <hr style={{ borderColor: '#00ff00', margin: '12px 0' }} />

                    <button
                        onClick={resetSession}
                        style={{
                            background: '#ff5722',
                            color: 'white',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            width: '100%'
                        }}
                    >
                        🗑️ Reset Local Session
                    </button>

                    <div style={{
                        marginTop: '12px',
                        fontSize: '10px',
                        color: '#888',
                        textAlign: 'center'
                    }}>
                        DEV ONLY
                    </div>
                </div>
            )}
        </div>
    )
}
