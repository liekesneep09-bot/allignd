
import React, { useState } from 'react'
import { useUser } from '../context/UserContext'
import { RECIPES } from '../data/recipes'
import { PHASE_CONTENT } from '../data/phases'

export default function Recipes() {
    const { currentPhase } = useUser()
    const data = RECIPES[currentPhase]
    const phaseContent = PHASE_CONTENT[currentPhase]

    if (!data) return <div className="container">Laden...</div>

    return (
        <div className="container" style={{ paddingBottom: '90px' }}>
            <header style={{ marginTop: '0', marginBottom: '3.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>
                    Voeding voor jouw fase
                </h2>
                <p className="text-muted" style={{ lineHeight: '1.6', marginBottom: '2.5rem' }}>
                    {data.description}
                </p>

                {/* Nutrition Card (Ivory) - Synced with Today View */}
                {phaseContent && phaseContent.nutrients && phaseContent.nutrients.length > 0 && (
                    <div style={{
                        background: '#FAF9F6', // Ivory
                        borderRadius: '24px',
                        padding: '2rem 1.5rem',
                        border: 'none'
                    }}>
                        <h3 style={{
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: 'var(--color-text)',
                            marginBottom: '1.5rem',
                            lineHeight: '1.4'
                        }}>
                            Voedingsstoffen die je lichaam in deze fase kunnen ondersteunen
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {phaseContent.nutrients.map((nutrient, index) => (
                                <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                    <span style={{
                                        fontSize: '0.95rem',
                                        fontWeight: '700',
                                        color: 'var(--color-text)',
                                        letterSpacing: '-0.01em'
                                    }}>
                                        {nutrient.name}
                                    </span>
                                    <span style={{
                                        fontSize: '0.9rem',
                                        color: 'var(--color-text-muted)',
                                        lineHeight: '1.6',
                                    }}>
                                        {nutrient.description}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {['ontbijt', 'lunch', 'diner', 'snack'].map(category => (
                    <section key={category}>
                        <h3 style={{
                            fontSize: '1rem',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            color: 'var(--color-primary)',
                            marginBottom: '1rem',
                            borderBottom: '2px solid var(--color-border)',
                            paddingBottom: '0.5rem'
                        }}>
                            {category}
                        </h3>

                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {data.meals[category].map((item, index) => (
                                <RecipeCard key={index} item={item} />
                            ))}
                        </div>
                    </section>
                ))}

            </div>
        </div>
    )
}

function RecipeCard({ item }) {
    const [expanded, setExpanded] = useState(false)

    return (
        <div
            className="card"
            style={{
                padding: '0',
                marginBottom: '0',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
            }}
            onClick={() => setExpanded(!expanded)}
        >
            <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', flex: 1, color: 'var(--color-text)' }}>{item.title}</h4>
                    <span style={{
                        color: 'var(--color-primary)',
                        fontSize: '1.2rem',
                        lineHeight: '1',
                        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                        marginLeft: '1rem'
                    }}>
                        ▾
                    </span>
                </div>
                <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', lineHeight: '1.5', marginTop: '0.5rem' }}>
                    {item.explanation}
                </p>

                {expanded && (
                    <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>

                        <div style={{ marginBottom: '1rem' }}>
                            <h5 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Ingrediënten</h5>
                            <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                                {item.ingredients.map((ing, i) => (
                                    <li key={i} style={{ fontSize: '0.95rem', marginBottom: '0.25rem', color: 'var(--color-text)' }}>{ing}</li>
                                ))}
                            </ul>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <h5 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Bereiding</h5>
                            <ol style={{ paddingLeft: '1.2rem', margin: 0 }}>
                                {item.instructions.map((step, i) => (
                                    <li key={i} style={{ fontSize: '0.95rem', marginBottom: '0.25rem', color: 'var(--color-text)' }}>{step}</li>
                                ))}
                            </ol>
                        </div>

                        <div style={{
                            backgroundColor: 'rgba(0,0,0,0.2)',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '0.85rem',
                            color: 'var(--color-text-muted)'
                        }}>
                            <span><strong>Eiwit:</strong> {item.macros.p}g</span>
                            <span><strong>Koolh:</strong> {item.macros.c}g</span>
                            <span><strong>Vet:</strong> {item.macros.f}g</span>
                        </div>

                    </div>
                )}
            </div>
        </div>
    )
}
