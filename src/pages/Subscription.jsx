import React, { useState } from 'react';


// Simple Check Icon Component
const IconCheck = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12l5 5l10 -10" />
    </svg>
);

export default function Subscription() {
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
                alert("Kon checkout niet starten. Probeer het later opnieuw.");
            }
        } catch (error) {
            console.error("Subscription Error:", error);
            alert("Er ging iets mis. Controleer je verbinding.");
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
                Start jouw cycle-aligned journey
            </h1>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2.5rem', maxWidth: '400px' }}>
                Krijg toegang tot persoonlijke schema's, recepten en inzichten afgestemd op jouw lichaam.
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
                            position: 'absolute', top: '-10px', right: '1rem',
                            background: 'var(--color-primary)', color: '#fff',
                            padding: '0.2rem 0.6rem', borderRadius: '12px',
                            fontSize: '0.75rem', fontWeight: 'bold'
                        }}>
                            BESTE WAARDE
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>Jaarlijks</span>
                        <span style={{ fontWeight: '700', fontSize: '1.2rem' }}>€99</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                        Betaal één keer per jaar.
                        <br />
                        <span style={{ color: 'var(--color-primary)', fontWeight: '500' }}>Bespaar 20%</span>
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
                        <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>Maandelijks</span>
                        <span style={{ fontWeight: '700', fontSize: '1.2rem' }}>€9,99</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                        Flexibel opzegbaar.
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
                    {isLoading ? 'Laden...' : 'Start 7 dagen gratis'}
                </button>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '1rem' }}>
                    Geen kosten tijdens de proefperiode. Je kunt op elk moment annuleren.
                </p>
            </div>

        </div>
    );
}
