import React from 'react'
import { useLanguage } from '../context/LanguageContext'

export default function Terms({ onNavigate }) {
    const { t } = useLanguage()

    const sections = [
        ['purpose_title', 'purpose_text'],
        ['cycle_title', 'cycle_text'],
        ['fertility_title', 'fertility_text'],
        ['health_title', 'health_text'],
        ['community_title', 'community_text']
    ]

    return (
        <div style={{ padding: '2rem 1.5rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            <button
                onClick={() => onNavigate ? onNavigate('profile') : window.location.assign('/')}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-primary)',
                    cursor: 'pointer',
                    padding: 0,
                    marginBottom: '1.5rem',
                    fontSize: '0.95rem'
                }}
            >
                ← {t('common.back')}
            </button>

            <h1 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>{t('terms.title')}</h1>
            <p style={{
                color: 'var(--color-text-muted)',
                fontSize: '0.85rem',
                padding: '0.75rem 1rem',
                background: 'var(--color-primary-light)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1.5rem'
            }}>
                {t('terms.draft_notice')}
            </p>

            {sections.map(([title, body]) => (
                <section key={title} style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>{t(`terms.${title}`)}</h2>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', margin: 0 }}>{t(`terms.${body}`)}</p>
                </section>
            ))}

            <section style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>{t('terms.contact_title')}</h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', margin: 0 }}>
                    {t('terms.contact_text')} <a href="mailto:support@allignd.fit">support@allignd.fit</a>
                </p>
            </section>
        </div>
    )
}
