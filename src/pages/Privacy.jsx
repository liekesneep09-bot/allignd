import React from 'react'
import { useLanguage } from '../context/LanguageContext'

export default function Privacy({ onNavigate }) {
    const { t } = useLanguage()

    return (
        <div style={{ padding: '2rem 1.5rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            <button
                onClick={() => onNavigate && onNavigate('profile')}
                style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    color: 'var(--color-primary)', 
                    cursor: 'pointer', 
                    padding: 0,
                    marginBottom: '1.5rem',
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}
            >
                ← {t('common.back')}
            </button>
            
            <h1 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>{t('privacy.title')}</h1>
            
            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>{t('privacy.intro_title')}</h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>{t('privacy.intro_text')}</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>{t('privacy.data_collection_title')}</h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>{t('privacy.data_collection_text')}</p>
                <ul style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', paddingLeft: '1.5rem' }}>
                    <li>{t('privacy.data_personal')}</li>
                    <li>{t('privacy.data_health')}</li>
                    <li>{t('privacy.data_usage')}</li>
                </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>{t('privacy.data_usage_title')}</h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>{t('privacy.data_usage_text')}</p>
                <ul style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', paddingLeft: '1.5rem' }}>
                    <li>{t('privacy.usage_personalize')}</li>
                    <li>{t('usage_calculate')}</li>
                    <li>{t('privacy.usage_track')}</li>
                </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>{t('privacy.data_sharing_title')}</h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>{t('privacy.data_sharing_text')}</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>{t('privacy.data_security_title')}</h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>{t('privacy.data_security_text')}</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>{t('privacy.your_rights_title')}</h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>{t('privacy.your_rights_text')}</p>
                <ul style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', paddingLeft: '1.5rem' }}>
                    <li>{t('privacy.right_access')}</li>
                    <li>{t('privacy.right_export')}</li>
                    <li>{t('privacy.right_delete')}</li>
                </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>{t('privacy.contact_title')}</h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>{t('privacy.contact_text')}</p>
            </section>

            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', fontStyle: 'italic', marginTop: '2rem' }}>
                {t('privacy.last_updated')}: Januari 2026
            </p>
        </div>
    )
}
