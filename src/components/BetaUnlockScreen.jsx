import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import logo from '../assets/logo-primary.png';

export default function BetaUnlockScreen() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const { t } = useLanguage();

    const handleSubmit = (e) => {
        e.preventDefault();
        // Check the strong password
        if (password === 'LIE207sneNelis18!#') {
            localStorage.setItem('admin_override', 'true');
            // Redirect to the main app
            window.location.href = '/';
        } else {
            setError(true);
            setTimeout(() => setError(false), 2000); // Reset error state after 2 seconds
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#ffffff',
            padding: '2rem',
            fontFamily: 'Inter, sans-serif'
        }}>
            <div style={{
                background: 'var(--color-surface, #ffffff)',
                padding: '3rem 2rem',
                borderRadius: '24px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                width: '100%',
                maxWidth: '400px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                animation: 'fadeIn 0.5s ease-out'
            }}>
                <img 
                    src={logo} 
                    alt="Allignd Logo" 
                    style={{ height: '60px', marginBottom: '2rem', objectFit: 'contain' }} 
                />
                
                <h2 style={{ 
                    fontSize: '1.5rem', 
                    color: 'var(--color-text, #1E1B1B)', 
                    marginBottom: '0.5rem',
                    fontWeight: '700'
                }}>
                    Beta Access
                </h2>
                
                <p style={{ 
                    color: 'var(--color-text-muted, #666666)', 
                    fontSize: '0.9rem', 
                    marginBottom: '2rem',
                    lineHeight: '1.5'
                }}>
                    Voer het wachtwoord in om de vroege versie van de Allignd app te openen.
                </p>

                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Wachtwoord"
                        style={{
                            width: '100%',
                            padding: '14px 16px',
                            borderRadius: '12px',
                            border: error ? '2px solid #FF4D4D' : '1px solid #E0E0E0',
                            fontSize: '1rem',
                            marginBottom: '1rem',
                            outline: 'none',
                            transition: 'all 0.2s',
                            backgroundColor: '#F9F9F9'
                        }}
                        autoFocus
                    />
                    
                    {error && (
                        <p style={{ color: '#FF4D4D', fontSize: '0.8rem', marginTop: '-0.5rem', marginBottom: '1rem', textAlign: 'left' }}>
                            Onjuist wachtwoord. Probeer het opnieuw.
                        </p>
                    )}

                    <button 
                        type="submit"
                        style={{
                            width: '100%',
                            background: 'var(--color-primary, #c4506a)',
                            color: '#ffffff',
                            border: 'none',
                            padding: '14px',
                            borderRadius: '30px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'transform 0.1s, opacity 0.2s',
                            opacity: password.length > 0 ? 1 : 0.7
                        }}
                    >
                        Ontgrendel App
                    </button>
                </form>

                <button 
                    onClick={() => window.location.href = '/'}
                    style={{
                        marginTop: '1.5rem',
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-muted, #999)',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                    }}
                >
                    Terug naar Waitlist
                </button>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
