import React from 'react'

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
        this.state = { hasError: true, error, errorInfo }
    }

    resetSession = async () => {
        try {
            // Clear all Supabase localStorage keys
            Object.keys(localStorage)
                .filter(key => key.startsWith('sb-'))
                .forEach(key => localStorage.removeItem(key))

            // Clear other app data
            localStorage.removeItem('cyclus_onboarded')

            // Reload
            window.location.href = '/'
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
                    background: '#fdf5f7',
                    padding: '20px'
                }}>
                    <div style={{
                        background: 'white',
                        padding: '40px',
                        borderRadius: '16px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        maxWidth: '600px',
                        width: '100%'
                    }}>
                        <div style={{
                            fontSize: '48px',
                            textAlign: 'center',
                            marginBottom: '20px'
                        }}>⚠️</div>

                        <h1 style={{
                            fontSize: '24px',
                            fontWeight: '600',
                            color: '#d4567a',
                            marginBottom: '12px',
                            textAlign: 'center'
                        }}>
                            Er ging iets mis
                        </h1>

                        <p style={{
                            fontSize: '16px',
                            color: '#666',
                            marginBottom: '24px',
                            textAlign: 'center',
                            lineHeight: '1.5'
                        }}>
                            De app is onverwacht gestopt. Probeer de pagina opnieuw te laden of reset je sessie.
                        </p>

                        {isDev && this.state.error && (
                            <div style={{
                                background: '#f5f5f5',
                                padding: '16px',
                                borderRadius: '8px',
                                marginBottom: '24px',
                                fontSize: '14px',
                                fontFamily: 'monospace',
                                overflow: 'auto',
                                maxHeight: '200px'
                            }}>
                                <strong>Error:</strong> {this.state.error.toString()}
                                {this.state.errorInfo && (
                                    <pre style={{ marginTop: '8px', fontSize: '12px' }}>
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                )}
                            </div>
                        )}

                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            flexDirection: 'column'
                        }}>
                            <button
                                onClick={() => window.location.reload()}
                                style={{
                                    background: '#d4567a',
                                    color: 'white',
                                    border: 'none',
                                    padding: '14px 24px',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                🔄 Herlaad Pagina
                            </button>

                            <button
                                onClick={this.resetSession}
                                style={{
                                    background: '#666',
                                    color: 'white',
                                    border: 'none',
                                    padding: '14px 24px',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                🗑️ Reset Sessie
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
