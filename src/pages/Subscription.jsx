import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';

// Simple Check Icon Component
const IconCheck = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12l5 5l10 -10" />
    </svg>
);

export default function Subscription() {
    const { t } = useLanguage();
    const { user, signOut } = useAuth();
    const [selectedPlan, setSelectedPlan] = useState('yearly'); // Default to best value
    const [isLoading, setIsLoading] = useState(false);
    const [isPolling, setIsPolling] = useState(false);

    // Auto-refresh when payment succeeds
    useEffect(() => {
        if (!user?.id) return;
        
        const checkStatus = async () => {
            try {
                const { data } = await supabase
                    .from('profiles')
                    .select('subscription_status')
                    .eq('id', user.id)
                    .single();
                
                if (data?.subscription_status === 'active') {
                    // Payment succeeded! The webhook updated the database.
                    // Reload the page to load the app
                    window.location.reload();
                }
            } catch (err) {
                console.error("Polling error", err);
            }
        };

        // Poll every 3 seconds while on this page
        const interval = setInterval(() => {
            checkStatus();
        }, 3000);

        return () => clearInterval(interval);
    }, [user]);

    const handleSubscribe = () => {
        if (!user) {
            console.error("Geen gebruiker ingelogd");
            return;
        }

        setIsLoading(true);
        
        // Direct links provided by the user
        const YEARLY_LINK = import.meta.env.VITE_STRIPE_YEARLY_LINK || 'https://buy.stripe.com/test_eVqcN55vC6DI2Ho3Nkb7y01';
        const MONTHLY_LINK = import.meta.env.VITE_STRIPE_MONTHLY_LINK || 'https://buy.stripe.com/test_cNieVdgage6adm2cjQb7y02';

        let checkoutUrl = selectedPlan === 'monthly' ? MONTHLY_LINK : YEARLY_LINK;
        
        // Append the user ID so the Stripe webhook knows who paid
        if (checkoutUrl.includes('?')) {
            checkoutUrl += `&client_reference_id=${user.id}&prefilled_email=${encodeURIComponent(user.email)}`;
        } else {
            checkoutUrl += `?client_reference_id=${user.id}&prefilled_email=${encodeURIComponent(user.email)}`;
        }
        
        // Redirect the user to Stripe
        window.location.href = checkoutUrl;
    };

    // Check if user just returned from Stripe
    const isProcessingPayment = window.location.search.includes('session_id');

    return (
        <div className="page-container" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '100vh', 
            textAlign: 'center', 
            padding: '2rem',
            background: 'linear-gradient(135deg, #FFF5F6 0%, #FFFFFF 100%)'
        }}>

            <div style={{ marginBottom: '3rem' }}>
                <h1 className="bricolage-font" style={{ 
                    fontSize: '2.5rem', 
                    marginBottom: '1rem', 
                    color: '#333333',
                    lineHeight: '1.1'
                }}>
                    {t('subscription.heading')} <span style={{ color: 'var(--color-primary)' }}>{t('subscription.heading_highlight')}</span>{t('subscription.heading_suffix')}
                </h1>
                <p style={{ color: '#666666', fontSize: '1.1rem', maxWidth: '450px', margin: '0 auto', lineHeight: '1.5' }}>
                    {t('subscription.tagline')}
                </p>
            </div>

            {isProcessingPayment ? (
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: '1rem',
                    background: '#FFFFFF',
                    padding: '2.5rem',
                    borderRadius: '24px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                    maxWidth: '400px',
                    width: '100%'
                }}>
                    <div className="spinner" style={{ 
                        width: '40px', 
                        height: '40px', 
                        border: '4px solid var(--color-surface)',
                        borderTop: '4px solid var(--color-primary)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }} />
                    <h3 style={{ margin: 0, color: '#333' }}>{t('subscription.processing')}</h3>
                    <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
                        {t('subscription.processing_desc')}
                    </p>
                </div>
            ) : (
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '1.5rem', 
                    width: '100%', 
                    maxWidth: '400px' 
                }}>

                {/* YEARLY CARD */}
                <div
                    onClick={() => setSelectedPlan('yearly')}
                    style={{
                        background: '#FFFFFF',
                        border: selectedPlan === 'yearly' ? '2px solid var(--color-primary)' : '1px solid #EEEEEE',
                        borderRadius: '24px',
                        padding: '1.5rem',
                        cursor: 'pointer',
                        position: 'relative',
                        textAlign: 'left',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: selectedPlan === 'yearly' ? '0 20px 40px rgba(255, 174, 185, 0.15)' : '0 4px 12px rgba(0,0,0,0.03)',
                        transform: selectedPlan === 'yearly' ? 'scale(1.02)' : 'scale(1)'
                    }}
                >
                    <div style={{
                        position: 'absolute', top: '-14px', right: '20px',
                        background: 'linear-gradient(90deg, #FF8E9D, #FFAEBB)', 
                        color: '#FFFFFF',
                        fontSize: '0.75rem', fontWeight: '800', padding: '6px 12px',
                        borderRadius: '20px', letterSpacing: '0.05em',
                        boxShadow: '0 4px 12px rgba(255, 142, 157, 0.3)'
                    }}>
                        {t('subscription.best_value')}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                            <div style={{ fontWeight: '700', fontSize: '1.3rem', color: '#333333' }}>{t('subscription.yearly')}</div>
                            <div style={{ color: 'var(--color-primary)', fontWeight: '600', fontSize: '0.9rem', marginTop: '4px' }}>
                                {t('subscription.free_trial')}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: '800', fontSize: '1.6rem', color: '#333333' }}>€79,99</div>
                        </div>
                    </div>
                    
                    <p style={{ fontSize: '0.95rem', color: '#666666', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                        {t('subscription.yearly_desc')} <span style={{ color: '#FF8E9D', fontWeight: '700' }}>{t('subscription.yearly_price_highlight')}</span>.
                    </p>

                    <button
                        onClick={(e) => { e.stopPropagation(); handleSubscribe(); }}
                        disabled={isLoading}
                        style={{ 
                            width: '100%', 
                            padding: '1rem', 
                            borderRadius: '16px',
                            fontSize: '1.05rem',
                            fontWeight: '700',
                            border: 'none',
                            cursor: 'pointer',
                            background: selectedPlan === 'yearly' ? 'var(--color-primary)' : '#F5F5F5',
                            color: selectedPlan === 'yearly' ? '#333333' : '#888888',
                            boxShadow: selectedPlan === 'yearly' ? '0 8px 20px rgba(255, 174, 185, 0.3)' : 'none'
                        }}
                    >
                        {isLoading ? t('common.loading') : t('subscription.start_free')}
                    </button>
                </div>

                {/* MONTHLY CARD */}
                <div
                    onClick={() => setSelectedPlan('monthly')}
                    style={{
                        background: '#FFFFFF',
                        border: selectedPlan === 'monthly' ? '2px solid var(--color-primary)' : '1px solid #EEEEEE',
                        borderRadius: '24px',
                        padding: '1.5rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: selectedPlan === 'monthly' ? '0 20px 40px rgba(255, 174, 185, 0.15)' : '0 4px 12px rgba(0,0,0,0.03)',
                        transform: selectedPlan === 'monthly' ? 'scale(1.02)' : 'scale(1)'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                            <div style={{ fontWeight: '700', fontSize: '1.3rem', color: '#333333' }}>{t('subscription.monthly')}</div>
                            <div style={{ color: 'var(--color-primary)', fontWeight: '600', fontSize: '0.9rem', marginTop: '4px' }}>
                                {t('subscription.free_trial')}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: '800', fontSize: '1.6rem', color: '#333333' }}>€7,99</div>
                            <div style={{ fontSize: '0.85rem', color: '#888888' }}>{t('subscription.monthly_price_suffix')}</div>
                        </div>
                    </div>
                    
                    <p style={{ fontSize: '0.95rem', color: '#666666', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                        {t('subscription.monthly_desc')}
                    </p>

                    <button
                        onClick={(e) => { e.stopPropagation(); handleSubscribe(); }}
                        disabled={isLoading}
                        style={{ 
                            width: '100%', 
                            padding: '1rem', 
                            borderRadius: '16px',
                            fontSize: '1.05rem',
                            fontWeight: '700',
                            border: 'none',
                            cursor: 'pointer',
                            background: selectedPlan === 'monthly' ? 'var(--color-primary)' : '#F5F5F5',
                            color: selectedPlan === 'monthly' ? '#333333' : '#888888',
                            boxShadow: selectedPlan === 'monthly' ? '0 8px 20px rgba(255, 174, 185, 0.3)' : 'none'
                        }}
                    >
                        {isLoading ? t('common.loading') : t('subscription.start_free')}
                    </button>
                </div>

            </div>
            )}

            <p style={{ fontSize: '0.85rem', color: '#999999', marginTop: '2.5rem', maxWidth: '300px', lineHeight: '1.4' }}>
                {t('subscription.disclaimer')}
            </p>

            <button
                onClick={() => signOut()}
                style={{
                    background: 'none',
                    border: 'none',
                    color: '#999999',
                    textDecoration: 'underline',
                    marginTop: '2rem',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                }}
            >
                {t('subscription.logout')}
            </button>

        </div>
    );
}
