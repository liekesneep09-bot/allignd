import React from 'react'
import { IconHome } from './Icons'
import nl from '../i18n/nl.json'
import en from '../i18n/en.json'

const t = (key) => {
    const lang = localStorage.getItem('app_language') || 'nl'
    const dict = lang === 'en' ? en : nl
    return key.split('.').reduce((obj, k) => (obj && obj[k] !== undefined) ? obj[k] : obj, dict) || key
}

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null, errorInfo: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true }
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo)
        if (import.meta.env.DEV) {
            try {
                fetch('http://localhost:9999/log', { method: 'POST', body: error.stack + '\n\n' + JSON.stringify(errorInfo) });
            } catch(e) {}
        }
        this.setState({ hasError: true, error, errorInfo })
    }

    resetSession = async () => {
        try {
            // Clear all Supabase localStorage keys safely
            Object.keys(localStorage)
                .filter(key => key.startsWith('sb-') || key.startsWith('cyclus_'))
                .forEach(key => localStorage.removeItem(key))
            
            // Clear session storage just in case
            sessionStorage.clear()

            // Hard reload without cache
            window.location.replace('/')
        } catch (err) {
            console.error('Failed to reset session:', err)
            window.location.reload()
        }
    }

    render() {
        if (this.state.hasError) {
            const isDev = import.meta.env.DEV

            return (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    background: 'var(--color-bg, #fdf5f7)',
                    padding: '24px',
                    fontFamily: 'var(--font-family)'
                }}>
                    <div className="card" style={{
                        padding: '40px 32px',
                        maxWidth: '400px',
                        width: '100%',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '24px'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '-8px' }}>⚠️</div>

                        <div>
                            <h1 style={{
                                fontSize: '24px',
                                fontWeight: '700',
                                color: 'var(--color-primary, #d4567a)',
                                margin: '0 0 12px 0'
                            }}>
                                {t('error_boundary.title')}
                            </h1>
                            <p style={{
                                fontSize: '15px',
                                color: 'var(--color-text-muted, #666)',
                                margin: 0,
                                lineHeight: '1.5'
                            }}>
                                {t('error_boundary.description')}
                            </p>
                        </div>

                        {this.state.error && (
                            <div style={{
                                background: 'rgba(0,0,0,0.05)',
                                padding: '12px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontFamily: 'monospace',
                                color: '#333',
                                textAlign: 'left',
                                overflow: 'auto',
                                maxHeight: '150px'
                            }}>
                                <strong>{this.state.error.toString()}</strong>
                                <br />
                                <span>{this.state.errorInfo && this.state.errorInfo.componentStack}</span>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                            <button
                                onClick={() => window.location.reload()}
                                className="btn btn-primary"
                                style={{
                                    padding: '16px',
                                    borderRadius: '16px',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                }}
                            >
                                {t('error_boundary.reload_btn')}
                            </button>

                            <button
                                onClick={this.resetSession}
                                className="btn"
                                style={{
                                    background: 'transparent',
                                    color: 'var(--color-text-muted, #666)',
                                    border: '1px solid var(--color-border, #eaeaea)',
                                    padding: '16px',
                                    borderRadius: '16px',
                                    fontSize: '15px',
                                    fontWeight: '500'
                                }}
                            >
                                {t('error_boundary.clear_cache_btn')}
                            </button>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
