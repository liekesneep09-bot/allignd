import React from 'react'
import { useLanguage } from '../context/LanguageContext'

export default function OfflineBanner({ isOnline }) {
    const { t } = useLanguage()
    if (isOnline) return null

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            padding: '8px 16px',
            background: '#FFF3CD',
            color: '#856404',
            textAlign: 'center',
            fontSize: '0.85rem',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
        }}>
            <span>📡</span>
            <span>{t('common.offline')}</span>
        </div>
    )
}
