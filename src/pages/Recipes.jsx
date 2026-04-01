
import React, { useState } from 'react'
import { useUser } from '../context/UserContext'
import { RECIPES } from '../data/recipes'
import { PHASE_CONTENT } from '../data/phases'

const CATEGORIES = [
    { key: 'ontbijt', label: 'Ontbijt' },
    { key: 'lunch', label: 'Lunch' },
    { key: 'diner', label: 'Diner' },
    { key: 'snack', label: 'Snack' }
]

// Phase accent colors (matching App.jsx)
const PHASE_COLORS = {
    menstrual: { accent: '#a86473', accentLight: 'rgba(168,100,115,0.1)', accentMid: 'rgba(168,100,115,0.15)' },
    follicular: { accent: '#5bc4d4', accentLight: 'rgba(91,196,212,0.1)', accentMid: 'rgba(91,196,212,0.15)' },
    ovulatory: { accent: '#f5a89c', accentLight: 'rgba(245,168,156,0.1)', accentMid: 'rgba(245,168,156,0.15)' },
    luteal: { accent: '#a3b899', accentLight: 'rgba(163,184,153,0.1)', accentMid: 'rgba(163,184,153,0.15)' }
}

export default function Recipes() {
    const { currentPhase, user } = useUser()
    const [activeCategory, setActiveCategory] = useState('ontbijt')
    const [expandedIndex, setExpandedIndex] = useState(null)

    const data = RECIPES[currentPhase]
    const phaseContent = PHASE_CONTENT[currentPhase]
    const colors = PHASE_COLORS[currentPhase] || PHASE_COLORS.menstrual

    if (!data) return <div className="container">Laden...</div>

    const meals = data.meals[activeCategory] || []

    const handleExpand = (index) => {
        setExpandedIndex(expandedIndex === index ? null : index)
    }

    const handleCategoryChange = (key) => {
        setActiveCategory(key)
        setExpandedIndex(null)
    }

    return (
        <div style={{ paddingBottom: '100px', minHeight: '100vh' }}>

            {/* Header */}
            <div style={{ padding: '0 20px', marginBottom: '1.5rem' }}>
                <h2 style={{
                    fontSize: '1.6rem',
                    fontWeight: '700',
                    color: 'var(--color-text)',
                    marginBottom: '0.5rem',
                    letterSpacing: '-0.02em'
                }}>
                    Recepten
                </h2>
                <p style={{
                    fontSize: '0.95rem',
                    color: 'var(--color-text-muted)',
                    lineHeight: '1.6',
                    margin: 0
                }}>
                    {data.description}
                </p>
            </div>

            {/* Special Phase Recipe Highlight */}
            {data.meals && data.meals.diner && data.meals.diner.length > 0 && (
                <div style={{ padding: '0 20px', marginBottom: '1.5rem' }}>
                    <div style={{
                        background: `${colors.accent}15`,
                        borderRadius: '16px',
                        padding: '1rem',
                        border: `1px solid ${colors.accent}30`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '50%',
                            background: 'white', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                            🥗
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: colors.accent, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
                                Highlight voor deze fase
                            </div>
                            <h4 style={{ 
                                margin: 0, 
                                fontSize: '1rem', 
                                fontWeight: '700', 
                                color: 'var(--color-text)',
                                lineHeight: '1.2'
                            }}>
                                {data.meals.diner[0].title}
                            </h4>
                            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {data.meals.diner[0].explanation}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Nutrient Chips */}
            {phaseContent?.nutrients?.length > 0 && (
                <div style={{
                    padding: '0 20px',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px'
                }}>
                    {phaseContent.nutrients.map((nutrient, i) => (
                        <div key={i} style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            background: colors.accentLight,
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            color: colors.accent,
                            whiteSpace: 'nowrap'
                        }}>
                            <span style={{ fontSize: '0.7rem' }}>●</span>
                            {nutrient.name}
                        </div>
                    ))}
                </div>
            )}

            {/* Category Tabs */}
            <div style={{
                position: 'sticky',
                top: '48px',
                zIndex: 10,
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                padding: '12px 20px',
                marginBottom: '1rem'
            }}>
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}>
                    {CATEGORIES.map(cat => {
                        const isActive = activeCategory === cat.key
                        return (
                            <button
                                key={cat.key}
                                onClick={() => handleCategoryChange(cat.key)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '10px 18px',
                                    borderRadius: '24px',
                                    border: 'none',
                                    background: isActive ? colors.accent : 'rgba(0,0,0,0.04)',
                                    color: isActive ? '#FFFFFF' : 'var(--color-text-muted)',
                                    fontSize: '0.9rem',
                                    fontWeight: isActive ? '600' : '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0
                                }}
                            >
                                {cat.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Recipe Cards */}
            <div style={{
                padding: '0 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
            }}>
                {meals.map((item, index) => (
                    <RecipeCard
                        key={`${activeCategory}-${index}`}
                        item={item}
                        index={index}
                        isExpanded={expandedIndex === index}
                        onToggle={() => handleExpand(index)}
                        colors={colors}
                        userGoal={user.goal}
                    />
                ))}
            </div>

            {/* Focus Points */}
            {data.focusPoints?.length > 0 && (
                <div style={{
                    margin: '2rem 20px 0',
                    padding: '1.25rem',
                    borderRadius: '16px',
                    background: 'rgba(0,0,0,0.02)',
                    border: '1px solid rgba(0,0,0,0.04)'
                }}>
                    <h4 style={{
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: 'var(--color-text-muted)',
                        marginBottom: '0.75rem',
                        fontWeight: '600'
                    }}>
                        Focus deze fase
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {data.focusPoints.map((point, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '8px',
                                fontSize: '0.9rem',
                                color: 'var(--color-text)',
                                lineHeight: '1.5'
                            }}>
                                <span style={{ color: colors.accent, flexShrink: 0, marginTop: '2px' }}>✦</span>
                                {point}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

function RecipeCard({ item, index, isExpanded, onToggle, colors, userGoal }) {
    const { logFood } = useUser()
    const [showConfirm, setShowConfirm] = useState(false)
    const [isLogged, setIsLogged] = useState(false)
    const isSuitable = item.suitability?.includes(userGoal)

    const handleLog = (e) => {
        e.stopPropagation()
        setShowConfirm(true)
    }

    const confirmLog = () => {
        logFood('recipe-' + index, null, {
            foodName: item.title,
            calculatedMacros: {
                kcal: item.macros.kcal,
                protein: item.macros.p,
                carbs: item.macros.c,
                fat: item.macros.f,
                fiber: item.macros.fiber
            },
            quantity: 1
        })
        setShowConfirm(false)
        setIsLogged(true)
        setTimeout(() => setIsLogged(false), 3000)
    }

    return (
        <>
            <div
                onClick={onToggle}
                style={{
                    borderRadius: '20px',
                    background: '#FFFFFF',
                    border: isExpanded ? `2px solid ${colors.accent}` : '1px solid rgba(0,0,0,0.06)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    boxShadow: isExpanded
                        ? `0 8px 24px ${colors.accentLight}`
                        : '0 2px 8px rgba(0,0,0,0.04)'
                }}
            >
                {/* Card Header */}
                <div style={{ padding: '1.25rem 1.25rem 1rem' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '14px'
                    }}>
                        {/* Title & Description */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '4px'
                            }}>
                                <h4 style={{
                                    fontSize: '1.05rem',
                                    fontWeight: '600',
                                    color: 'var(--color-text)',
                                    margin: 0,
                                    lineHeight: '1.3'
                                }}>
                                    {item.title}
                                </h4>
                                <span style={{
                                    fontSize: '0.85rem',
                                    color: colors.accent,
                                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.2s ease',
                                    marginLeft: '8px',
                                    flexShrink: 0
                                }}>
                                    ▾
                                </span>
                            </div>
                            <p style={{
                                fontSize: '0.85rem',
                                color: 'var(--color-text-muted)',
                                lineHeight: '1.5',
                                margin: 0
                            }}>
                                {item.explanation}
                            </p>
                        </div>
                    </div>

                    {/* Macro Line */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginTop: '12px',
                        paddingTop: '10px',
                        borderTop: '1px solid rgba(0,0,0,0.04)'
                    }}>
                        <MacroBadge label="Eiwit" value={`${item.macros.p}g`} />
                        <MacroBadge label="Koolh" value={`${item.macros.c}g`} />
                        <MacroBadge label="Vet" value={`${item.macros.f}g`} />
                        <MacroBadge label="Vezel" value={`${item.macros.fiber}g`} />
                        <div style={{ marginLeft: 'auto' }}>
                            <span style={{
                                fontSize: '0.85rem',
                                fontWeight: '700',
                                color: colors.accent
                            }}>
                                {item.macros.kcal} kcal
                            </span>
                        </div>
                    </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                    <div style={{
                        padding: '0 1.25rem 1.25rem',
                        animation: 'fadeIn 0.2s ease'
                    }}>
                        {/* Ingredients */}
                        <div style={{
                            background: 'rgba(0,0,0,0.02)',
                            borderRadius: '14px',
                            padding: '1rem 1.25rem',
                            marginBottom: '12px'
                        }}>
                            <h5 style={{
                                fontSize: '0.75rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                color: 'var(--color-text-muted)',
                                marginBottom: '0.75rem',
                                fontWeight: '600'
                            }}>
                                Ingrediënten
                            </h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {item.ingredients.map((ing, i) => (
                                    <div key={i} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        fontSize: '0.9rem',
                                        color: 'var(--color-text)'
                                    }}>
                                        <span style={{
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            background: colors.accent,
                                            flexShrink: 0
                                        }} />
                                        {ing}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Instructions */}
                        <div style={{
                            background: 'rgba(0,0,0,0.02)',
                            borderRadius: '14px',
                            padding: '1rem 1.25rem'
                        }}>
                            <h5 style={{
                                fontSize: '0.75rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                color: 'var(--color-text-muted)',
                                marginBottom: '0.75rem',
                                fontWeight: '600'
                            }}>
                                Bereiding
                            </h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {item.instructions.map((step, i) => (
                                    <div key={i} style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '12px',
                                        fontSize: '0.9rem',
                                        color: 'var(--color-text)',
                                        lineHeight: '1.5'
                                    }}>
                                        <span style={{
                                            width: '22px',
                                            height: '22px',
                                            borderRadius: '50%',
                                            background: colors.accentMid,
                                            color: colors.accent,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.7rem',
                                            fontWeight: '700',
                                            flexShrink: 0,
                                            marginTop: '1px'
                                        }}>
                                            {i + 1}
                                        </span>
                                        {step}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Suitability Badge */}
                        {isSuitable && (
                            <div style={{
                                marginTop: '1rem',
                                padding: '10px 14px',
                                borderRadius: '12px',
                                background: 'rgba(165, 220, 201, 0.1)',
                                border: '1px solid rgba(165, 220, 201, 0.2)',
                                color: '#3A4A45',
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontWeight: '600'
                            }}>
                                <span style={{ fontSize: '1rem' }}>✨</span> Perfect voor jouw doel: <strong>{
                                    userGoal === 'lose_fat' ? 'Afvallen' :
                                    userGoal === 'recomp' ? 'Afvallen & Spieropbouw' :
                                    userGoal === 'gain_muscle' ? 'Spiermassa' : 'Gezond blijven'
                                }</strong>
                            </div>
                        )}

                        {/* Log Button */}
                        <button
                            onClick={handleLog}
                            className={`btn ${isLogged ? '' : 'btn-primary'} ${isLogged ? 'pulse-success' : ''}`}
                            style={{
                                width: '100%',
                                marginTop: '1rem',
                                background: isLogged ? '#A5DCC9' : undefined,
                                color: isLogged ? '#2D3436' : undefined,
                                boxShadow: isLogged ? '0 4px 12px rgba(165,220,201,0.3)' : 'var(--shadow-soft)',
                                transition: 'all 0.3s ease',
                                border: isLogged ? 'none' : undefined
                            }}
                        >
                            {isLogged ? (
                                <>✓ Toegevoegd!</>
                            ) : (
                                <>+ Voeg toe aan dagdoel</>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Custom Styled Confirm Modal */}
            {showConfirm && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 2000,
                    background: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '24px',
                        width: '100%',
                        maxWidth: '340px',
                        padding: '24px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: 'rgba(255, 174, 185, 0.15)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem',
                            color: '#ffaeb9',
                            fontSize: '1.5rem',
                            fontWeight: '700'
                        }}>
                            +
                        </div>
                        <h3 style={{
                            fontSize: '1.2rem',
                            fontWeight: '700',
                            marginBottom: '0.75rem',
                            color: 'var(--color-text)'
                        }}>
                            Recept toevoegen
                        </h3>
                        <p style={{
                            fontSize: '0.95rem',
                            color: 'var(--color-text-muted)',
                            lineHeight: '1.5',
                            marginBottom: '1.5rem'
                        }}>
                            Wil je "{item.title}" toevoegen aan je dagdoel van vandaag?
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setShowConfirm(false)}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '14px',
                                    border: '1px solid rgba(0,0,0,0.1)',
                                    background: 'none',
                                    color: 'var(--color-text-muted)',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Annuleer
                            </button>
                            <button
                                onClick={confirmLog}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '14px',
                                    border: 'none',
                                    background: '#ffaeb9',
                                    color: '#FFFFFF',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(255,174,185,0.2)'
                                }}
                            >
                                Ja, voeg toe
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

function MacroBadge({ label, value }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.8rem'
        }}>
            <span style={{ color: 'var(--color-text-muted)', fontWeight: '500' }}>{label}</span>
            <span style={{ color: 'var(--color-text)', fontWeight: '600' }}>{value}</span>
        </div>
    )
}
