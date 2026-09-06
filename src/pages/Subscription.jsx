import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';

const IconCheck = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12l5 5l10 -10" />
    </svg>
);

const IconCrown = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 20h20M5 20V10l7-5 7 5v10M9 20v-4h6v4" />
    </svg>
);

export default function Subscription() {
    const { t } = useLanguage();
    const { user, signOut } = useAuth();
    const [selectedPlan, setSelectedPlan] = useState('yearly');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!user?.id) return;
        
        let pollCount = 0;
        const MAX_POLLS = 100;
        
        const checkStatus = async () => {
            pollCount++;
            if (pollCount > MAX_POLLS) {
                clearInterval(interval);
                return;
            }
            
            try {
                const { data } = await supabase
                    .from('profiles')
                    .select('subscription_status')
                    .eq('id', user.id)
                    .single();
                
                if (data?.subscription_status === 'active') {
                    window.location.reload();
                }
            } catch (err) {
                console.error("Polling error", err);
            }
        };

        const interval = setInterval(checkStatus, 3000);
        return () => clearInterval(interval);
    }, [user]);

    const handleSubscribe = () => {
        if (!user) {
            console.error("Geen gebruiker ingelogd");
            return;
        }

        setIsLoading(true);
        
        const YEARLY_LINK = import.meta.env.VITE_STRIPE_YEARLY_LINK || 'https://buy.stripe.com/test_eVqcN55vC6DI2Ho3Nkb7y01';
        const MONTHLY_LINK = import.meta.env.VITE_STRIPE_MONTHLY_LINK || 'https://buy.stripe.com/test_cNieVdgage6adm2cjQb7y02';

        let checkoutUrl = selectedPlan === 'monthly' ? MONTHLY_LINK : YEARLY_LINK;
        
        if (checkoutUrl.includes('?')) {
            checkoutUrl += `&client_reference_id=${user.id}&prefilled_email=${encodeURIComponent(user.email)}`;
        } else {
            checkoutUrl += `?client_reference_id=${user.id}&prefilled_email=${encodeURIComponent(user.email)}`;
        }
        
        window.location.href = checkoutUrl;
    };

    const isProcessingPayment = window.location.search.includes('session_id');

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '100vh', 
            textAlign: 'center', 
            padding: 'var(--space-8) var(--space-6)',
            background: 'linear-gradient(180deg, #FFF5F7 0%, #FFFFFF 50%)'
        }}>

            <div style={{ marginBottom: 'var(--space-10)' }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '56px',
                    height: '56px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--color-primary-light)',
                    marginBottom: 'var(--space-6)'
                }}>
                    <IconCrown />
                </div>
                <h1 style={{ 
                    fontSize: 'var(--font-size-3xl)', 
                    marginBottom: 'var(--space-3)', 
                    color: 'var(--color-text)',
                    lineHeight: '1.1',
                    fontWeight: '700',
                    letterSpacing: '-0.02em'
                }}>
                    {t('subscription.heading')} <span style={{ color: 'var(--color-primary)' }}>{t('subscription.heading_highlight')}</span>{t('subscription.heading_suffix')}
                </h1>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-lg)', maxWidth: '400px', margin: '0 auto', lineHeight: '1.5' }}>
                    {t('subscription.tagline')}
                </p>
            </div>

            {/* Features list */}
            <div style={{ marginBottom: 'var(--space-8)', maxWidth: '360px', width: '100%', textAlign: 'left' }}>
                {[
                    t('subscription.feature_cycle'),
                    t('subscription.feature_nutrition'),
                    t('subscription.feature_fitness'),
                    t('subscription.feature_community')
                ].map((feature, i) => (
                    <div key={i} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 'var(--space-3)', 
                        marginBottom: i < 3 ? 'var(--space-3)' : 0,
                        padding: 'var(--space-2) 0'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '24px',
                            height: '24px',
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--color-primary-light)',
                            flexShrink: 0
                        }}>
                            <IconCheck size={14} color="var(--color-primary)" />
                        </div>
                        <span style={{ color: 'var(--color-text)', fontSize: 'var(--font-size-base)', fontWeight: '500' }}>
                            {feature}
                        </span>
                    </div>
                ))}
            </div>

            {isProcessingPayment ? (
                <div className="card-elevated" style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: 'var(--space-4)',
                    padding: 'var(--space-10)',
                    maxWidth: '380px',
                    width: '100%'
                }}>
                    <div className="spinner" style={{ 
                        width: '40px', 
                        height: '40px', 
                        border: '3px solid var(--color-border-light)',
                        borderTop: '3px solid var(--color-primary)',
                        borderRadius: 'var(--radius-full)'
                    }} />
                    <h3 style={{ margin: 0, color: 'var(--color-text)' }}>{t('subscription.processing')}</h3>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
                        {t('subscription.processing_desc')}
                    </p>
                </div>
            ) : (
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 'var(--space-4)', 
                    width: '100%', 
                    maxWidth: '380px' 
                }}>

                    {/* YEARLY CARD */}
                    <div
                        onClick={() => setSelectedPlan('yearly')}
                        style={{
                            background: 'var(--color-surface)',
                            border: selectedPlan === 'yearly' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--space-6)',
                            cursor: 'pointer',
                            position: 'relative',
                            textAlign: 'left',
                            transition: 'all var(--transition-base)',
                            boxShadow: selectedPlan === 'yearly' ? 'var(--shadow-lg)' : 'var(--shadow-sm)'
                        }}
                    >
                        <div style={{
                            position: 'absolute', 
                            top: '-12px', 
                            right: 'var(--space-5)',
                            background: 'var(--color-primary)', 
                            color: '#FFFFFF',
                            fontSize: 'var(--font-size-xs)', 
                            fontWeight: '700', 
                            padding: 'var(--space-1) var(--space-3)',
                            borderRadius: 'var(--radius-full)',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase'
                        }}>
                            {t('subscription.best_value')}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                            <div>
                                <div style={{ fontWeight: '700', fontSize: 'var(--font-size-xl)', color: 'var(--color-text)' }}>
                                    {t('subscription.yearly')}
                                </div>
                                <div style={{ color: 'var(--color-primary)', fontWeight: '600', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-1)' }}>
                                    {t('subscription.free_trial')}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: '800', fontSize: 'var(--font-size-2xl)', color: 'var(--color-text)' }}>
                                    {t('subscription.yearly_price')}
                                </div>
                            </div>
                        </div>
                        
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)', lineHeight: '1.5' }}>
                            {t('subscription.yearly_desc')} <span style={{ color: 'var(--color-primary)', fontWeight: '700' }}>{t('subscription.yearly_price_highlight')}</span>.
                        </p>

                        <button
                            onClick={(e) => { e.stopPropagation(); handleSubscribe(); }}
                            disabled={isLoading}
                            className="btn btn-primary"
                            style={{ 
                                background: selectedPlan === 'yearly' ? 'var(--color-primary)' : 'var(--color-border-light)',
                                color: selectedPlan === 'yearly' ? '#FFFFFF' : 'var(--color-text-secondary)'
                            }}
                        >
                            {isLoading ? t('common.loading') : t('subscription.start_free')}
                        </button>
                    </div>

                    {/* MONTHLY CARD */}
                    <div
                        onClick={() => setSelectedPlan('monthly')}
                        style={{
                            background: 'var(--color-surface)',
                            border: selectedPlan === 'monthly' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--space-6)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all var(--transition-base)',
                            boxShadow: selectedPlan === 'monthly' ? 'var(--shadow-lg)' : 'var(--shadow-sm)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                            <div>
                                <div style={{ fontWeight: '700', fontSize: 'var(--font-size-xl)', color: 'var(--color-text)' }}>
                                    {t('subscription.monthly')}
                                </div>
                                <div style={{ color: 'var(--color-primary)', fontWeight: '600', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-1)' }}>
                                    {t('subscription.free_trial')}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: '800', fontSize: 'var(--font-size-2xl)', color: 'var(--color-text)' }}>
                                    {t('subscription.monthly_price')}
                                </div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>
                                    {t('subscription.monthly_price_suffix')}
                                </div>
                            </div>
                        </div>
                        
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)', lineHeight: '1.5' }}>
                            {t('subscription.monthly_desc')}
                        </p>

                        <button
                            onClick={(e) => { e.stopPropagation(); handleSubscribe(); }}
                            disabled={isLoading}
                            className="btn btn-primary"
                            style={{ 
                                background: selectedPlan === 'monthly' ? 'var(--color-primary)' : 'var(--color-border-light)',
                                color: selectedPlan === 'monthly' ? '#FFFFFF' : 'var(--color-text-secondary)'
                            }}
                        >
                            {isLoading ? t('common.loading') : t('subscription.start_free')}
                        </button>
                    </div>

                </div>
            )}

            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginTop: 'var(--space-8)', maxWidth: '280px', lineHeight: '1.5' }}>
                {t('subscription.disclaimer')}
            </p>

            <button
                onClick={() => signOut()}
                style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-tertiary)',
                    textDecoration: 'underline',
                    marginTop: 'var(--space-4)',
                    fontSize: 'var(--font-size-sm)',
                    cursor: 'pointer'
                }}
            >
                {t('subscription.logout')}
            </button>

        </div>
    );
}
