import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';


// Simple Check Icon Component
const IconCheck = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12l5 5l10 -10" />
    </svg>
);

export default function Subscription() {
    const { t } = useLanguage();
    const [selectedPlan, setSelectedPlan] = useState('yearly'); // Default to best value
    const [isLoading, setIsLoading] = useState(false);

    const handleSubscribe = async () => {
        setIsLoading(true);
        // TEMPORARY FOR TESTING: Bypass Stripe
        // Uncomment lines below to restore real payment flow

        /*
        try {
            // Call backend to create checkout session
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId: selectedPlan === 'monthly'
                        ? import.meta.env.VITE_STRIPE_PRICE_MONTHLY
                        : import.meta.env.VITE_STRIPE_PRICE_YEARLY,
                    mode: 'subscription'
                }),
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(t('subscription.failed'));
            }
        } catch (error) {
            console.error("Subscription Error:", error);
            alert(t('subscription.error'));
        } finally {
            setIsLoading(false);
        }
        */

        // MOCK SUCCESS
        setTimeout(() => {
            window.location.href = '/'; // Go to Dashboard
        }, 500);
    };

    return (
        <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', padding: '2rem' }}>

            <h1 className="bricolage-font" style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
                {t('subscription.title')}
            </h1>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2.5rem', maxWidth: '400px' }}>
                {t('subscription.subtitle')}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '350px' }}>

                {/* YEARLY CARD */}
                <div
                    onClick={() => setSelectedPlan('yearly')}
                    style={{
                        background: selectedPlan === 'yearly' ? 'var(--color-card-bg)' : 'transparent',
                        border: selectedPlan === 'yearly' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        cursor: 'pointer',
                        position: 'relative',
                        textAlign: 'left',
                        transition: 'all 0.2s ease'
                    }}
                >
                    {selectedPlan === 'yearly' && (
                        <div style={{
                            position: 'absolute', top: '-12px', right: '16px',
                            background: 'var(--color-primary)', color: '#333333',
                            fontSize: '0.75rem', fontWeight: 'bold', padding: '4px 8px',
                            borderRadius: '12px', textTransform: 'uppercase'
                        }}>
                            {t('subscription.best_value')}
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{t('subscription.yearly')}</span>
                        <span style={{ fontWeight: '700', fontSize: '1.2rem' }}>€99</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                        {t('subscription.pay_yearly')}
                        <br />
                        <span style={{ color: 'var(--color-primary)', fontWeight: '500' }}>{t('subscription.save_20')}</span>
                    </p>
                </div>

                {/* MONTHLY CARD */}
                <div
                    onClick={() => setSelectedPlan('monthly')}
                    style={{
                        background: selectedPlan === 'monthly' ? 'var(--color-card-bg)' : 'transparent',
                        border: selectedPlan === 'monthly' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{t('subscription.monthly')}</span>
                        <span style={{ fontWeight: '700', fontSize: '1.2rem' }}>€9,99</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                        {t('subscription.flexible')}
                    </p>
                </div>

            </div>

            <div style={{ marginTop: '2.5rem', width: '100%', maxWidth: '350px' }}>
                <button
                    className="btn-primary"
                    onClick={handleSubscribe}
                    disabled={isLoading}
                    style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                >
                    {isLoading ? t('common.loading') : t('subscription.start_free')}
                </button>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '1rem' }}>
                    {t('subscription.trial_desc')}
                </p>
            </div>

        </div>
    );
}
