import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';

export default function DebugView() {
    const { user, isOnboarded } = useUser();
    const { user: authUser } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    // Only show in development or via hidden toggle
    // For now, simple toggle button in bottom right

    if (!isOpen) {
        return (
            <div
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: '10px',
                    right: '10px',
                    background: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    fontSize: '10px',
                    cursor: 'pointer',
                    zIndex: 9999
                }}
            >
                DEBUG
            </div>
        )
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            width: '300px',
            maxHeight: '80vh',
            overflowY: 'auto',
            background: '#1a1a1a',
            color: '#00ff00',
            padding: '10px',
            borderRadius: '8px',
            fontSize: '11px',
            fontFamily: 'monospace',
            zIndex: 9999,
            border: '1px solid #333',
            boxShadow: '0 -5px 20px rgba(0,0,0,0.5)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #333', paddingBottom: '5px' }}>
                <strong>DEBUG VIEW</strong>
                <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: '#ff5555', cursor: 'pointer' }}>CLOSE</button>
            </div>

            <div style={{ marginBottom: '10px' }}>
                <strong>AUTH:</strong>
                <div style={{ color: authUser ? '#55ffff' : '#ff5555' }}>
                    {authUser ? `User: ${authUser.email}` : 'Not Logged In'}
                </div>
                <div>ID: {authUser?.id?.substring(0, 8)}...</div>
            </div>

            <div style={{ marginBottom: '10px' }}>
                <strong>STATE:</strong>
                <div>Is Onboarded: <span style={{ color: isOnboarded ? '#55ffff' : '#ff5555' }}>{String(isOnboarded)}</span></div>
            </div>

            <div style={{ marginBottom: '10px' }}>
                <strong>MACRO TARGETS (DB):</strong>
                {user.macroTargets ? (
                    <div style={{ paddingLeft: '10px', borderLeft: '2px solid #55ffff' }}>
                        <div>Kcal: {user.macroTargets.calories}</div>
                        <div>Prot: {user.macroTargets.protein}g</div>
                        <div>Carb: {user.macroTargets.carbs}g</div>
                        <div>Fat:  {user.macroTargets.fat}g</div>
                    </div>
                ) : (
                    <div style={{ color: '#ff5555' }}>MISSING</div>
                )}
            </div>

            <div style={{ marginBottom: '16px' }}>
                <strong>Nutrition (Deterministic):</strong>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>
                    BMR: {user.nutritionDebug?.bmr || '-'} <br />
                    TDEE: {user.nutritionDebug?.tdee || '-'} <br />
                    Activity Factor: {user.nutritionDebug?.activityFactor || '-'} <br />
                    Goal: {user.goal || '-'} <br />
                    Pace: {user.resultTempo || '-'}
                </div>
            </div>

            <div style={{ marginBottom: '10px' }}>
                <strong>PROFILE INPUTS:</strong>
                <div style={{ paddingLeft: '10px' }}>
                    <div>Goal: {user.goal}</div>
                    <div>Tempo: {user.resultTempo}</div>
                    <div>Weight: {user.weight}</div>
                    <div>Freq: {user.trainingFrequency}</div>
                    <div>Cycle: {user.cycleLength}d</div>
                </div>
            </div>
        </div>
    );
}
