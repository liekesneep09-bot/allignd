import React from 'react'
import { useLanguage } from '../context/LanguageContext'

export default function ConfigErrorScreen() {
    const { t } = useLanguage()

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
                maxWidth: '700px',
                width: '100%'
            }}>
                <div style={{
                    fontSize: '48px',
                    textAlign: 'center',
                    marginBottom: '20px'
                }}>🔧</div>

                <h1 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: '#d4567a',
                    marginBottom: '12px',
                    textAlign: 'center'
                }}>
                    {t('config_error.title')}
                </h1>

                <p style={{
                    fontSize: '16px',
                    color: '#666',
                    marginBottom: '24px',
                    textAlign: 'center',
                    lineHeight: '1.5'
                }}>
                    {t('config_error.description')}
                </p>

                <div style={{
                    background: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: '24px'
                }}>
                    <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        marginBottom: '12px',
                        color: '#856404'
                    }}>
                        {t('config_error.how_to_fix')}
                    </h3>

                    <ol style={{
                        fontSize: '14px',
                        color: '#856404',
                        lineHeight: '1.8',
                        paddingLeft: '20px'
                    }}>
                        <li>{t('config_error.step1').split('{file}')[0]}<code style={{
                            background: '#f5f5f5',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontFamily: 'monospace'
                        }}>.env</code>{t('config_error.step1').split('{file}')[1]}</li>
                        <li>{t('config_error.step2')}</li>
                    </ol>

                    <pre style={{
                        background: '#f5f5f5',
                        padding: '16px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontFamily: 'monospace',
                        overflow: 'auto',
                        marginTop: '12px',
                        marginBottom: '12px'
                    }}>
                        {`VITE_SUPABASE_URL=https://jouwproject.supabase.co
VITE_SUPABASE_ANON_KEY=jouw-anon-key-hier`}
                    </pre>

                    <ol start="3" style={{
                        fontSize: '14px',
                        color: '#856404',
                        lineHeight: '1.8',
                        paddingLeft: '20px'
                    }}>
                        <li>{t('config_error.step3').split('{cmd}')[0]}<code style={{
                            background: '#f5f5f5',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontFamily: 'monospace'
                        }}>npm run dev</code>{t('config_error.step3').split('{cmd}')[1]}</li>
                        <li>{t('config_error.step4')}</li>
                    </ol>
                </div>

                <div style={{
                    background: '#e3f2fd',
                    border: '1px solid #2196f3',
                    borderRadius: '8px',
                    padding: '16px',
                    fontSize: '14px',
                    color: '#0d47a1'
                }}>
                    <strong>💡 Tip:</strong> {t('config_error.tip')}
                </div>

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
                        cursor: 'pointer',
                        width: '100%',
                        marginTop: '24px'
                    }}
                >
                    {t('config_error.reload_btn')}
                </button>
            </div>
        </div>
    )
}
