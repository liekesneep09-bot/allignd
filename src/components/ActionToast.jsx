import React, { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'

export default function ActionToast({ type = 'success', message, actionLabel, onAction, onClose }) {
    const { t } = useLanguage()
    const [pending, setPending] = useState(false)
    const [actionFailed, setActionFailed] = useState(false)
    const isError = type === 'error' || actionFailed

    const runAction = async () => {
        if (!onAction || pending) return
        setPending(true)
        try {
            await onAction()
        } catch {
            setActionFailed(true)
        } finally {
            setPending(false)
        }
    }

    return (
        <div
            role={isError ? 'alert' : 'status'}
            aria-live={isError ? 'assertive' : 'polite'}
            style={{
                position: 'fixed',
                left: '50%',
                bottom: 'calc(88px + env(safe-area-inset-bottom, 0px))',
                transform: 'translateX(-50%)',
                width: 'min(calc(100% - 32px), 420px)',
                zIndex: 5000,
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${isError ? 'rgba(244,67,54,0.25)' : 'var(--color-border-light)'}`,
                background: 'var(--color-surface)',
                boxShadow: 'var(--shadow-lg)',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-family)'
            }}
        >
            <span aria-hidden="true" style={{
                width: '28px',
                height: '28px',
                flexShrink: 0,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 'var(--radius-full)',
                background: isError ? 'rgba(244,67,54,0.08)' : 'var(--color-primary-light)',
                color: isError ? 'var(--color-error)' : 'var(--color-primary)',
                fontWeight: 800
            }}>
                {isError ? '!' : '✓'}
            </span>
            <span style={{ flex: 1, minWidth: 0, fontSize: '0.875rem', lineHeight: 1.45 }}>{actionFailed ? t('today.food_restore_error') : message}</span>
            {onAction && (
                <button
                    type="button"
                    onClick={() => void runAction()}
                    disabled={pending}
                    style={{
                        minHeight: '44px',
                        padding: '0 8px',
                        color: 'var(--color-primary)',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        opacity: pending ? 0.55 : 1
                    }}
                >
                    {pending ? `${actionLabel}…` : actionLabel}
                </button>
            )}
            <button
                type="button"
                onClick={onClose}
                aria-label={t('common.close')}
                style={{
                    width: '44px',
                    height: '44px',
                    flexShrink: 0,
                    display: 'grid',
                    placeItems: 'center',
                    color: 'var(--color-text-muted)',
                    fontSize: '1rem'
                }}
            >
                ✕
            </button>
        </div>
    )
}
