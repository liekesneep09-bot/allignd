import React from 'react'
import { useUser } from '../context/UserContext'

/**
 * DEBUG OVERLAY - DEV ONLY
 * Shows calculation details for verification
 */
export default function DebugOverlay() {
    const { user } = useUser()

    // Only show in development
    if (!import.meta.env.DEV) return null

    const debug = user.nutritionDebug || {}
    const targets = user.macroTargets || {}

    return (
        <div style={{
            position: 'fixed',
            bottom: '80px',
            right: '16px',
            background: 'rgba(0, 0, 0, 0.9)',
            color: '#00ff00',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '11px',
            fontFamily: 'monospace',
            maxWidth: '300px',
            zIndex: 9999,
            border: '1px solid #00ff00'
        }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#00ff00' }}>
                🔬 DEBUG (DEV ONLY)
            </div>

            <div style={{ marginBottom: '4px' }}>
                <strong>User ID:</strong> {user.id || 'N/A'}
            </div>

            <div style={{ marginBottom: '4px' }}>
                <strong>Goal:</strong> {user.goal || 'N/A'}
            </div>

            <div style={{ marginBottom: '4px' }}>
                <strong>Pace:</strong> {user.resultTempo || user.pace || 'N/A'}
            </div>

            <div style={{ marginBottom: '4px' }}>
                <strong>Strength:</strong> {user.trainingFrequency || user.strength_sessions_per_week || 0}x/week
            </div>

            <hr style={{ margin: '8px 0', borderColor: '#00ff00' }} />

            <div style={{ marginBottom: '4px' }}>
                <strong>BMR:</strong> {debug.bmr || 'N/A'} kcal
            </div>

            <div style={{ marginBottom: '4px' }}>
                <strong>Activity Factor:</strong> {debug.activityFactor || debug.activity_factor || 'N/A'}
            </div>

            <div style={{ marginBottom: '4px' }}>
                <strong>TDEE:</strong> {debug.tdee || 'N/A'} kcal
            </div>

            <hr style={{ margin: '8px 0', borderColor: '#00ff00' }} />

            <div style={{ marginBottom: '4px' }}>
                <strong>Target:</strong> {targets.calories || targets.cal_target || 'N/A'} kcal
            </div>

            <div style={{ marginBottom: '4px' }}>
                <strong>Protein:</strong> {targets.p || targets.protein_g || 'N/A'}g
            </div>

            <div style={{ marginBottom: '4px' }}>
                <strong>Carbs:</strong> {targets.c || targets.carbs_g || 'N/A'}g
            </div>

            <div style={{ marginBottom: '4px' }}>
                <strong>Fat:</strong> {targets.f || targets.fat_g || 'N/A'}g
            </div>
        </div>
    )
}
