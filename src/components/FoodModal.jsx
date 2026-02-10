import React, { useState, useEffect } from 'react'
import { useUser } from '../context/UserContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabaseClient'
import MealEditor from './MealEditor'

export default function FoodModal({ onClose, onAdd }) {
    const { user, updateUser, addCustomFood } = useUser()
    const { getAccessToken } = useAuth()

    // Main tab state: 'producten' or 'gerechten'
    const [activeTab, setActiveTab] = useState('producten')

    // Products view state
    const [view, setView] = useState('list') // 'list' | 'entry' | 'create'
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedFood, setSelectedFood] = useState(null)
    const [grams, setGrams] = useState('')

    // Form state for new product
    const [newFood, setNewFood] = useState({
        name_nl: '',
        kcal_100: '',
        protein_100: '',
        carbs_100: '',
        fat_100: ''
    })

    // Gerechten (Meals) state
    const [meals, setMeals] = useState([])
    const [mealsLoading, setMealsLoading] = useState(false)
    const [mealsError, setMealsError] = useState('')
    const [showMealEditor, setShowMealEditor] = useState(false)
    const [editingMeal, setEditingMeal] = useState(null)

    // Fetch meals when tab changes to gerechten
    useEffect(() => {
        if (activeTab === 'gerechten') {
            fetchMeals()
        }
    }, [activeTab])

    const fetchMeals = async () => {
        setMealsLoading(true)
        setMealsError('')
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (!authUser) {
                setMeals([])
                return
            }

            const { data, error } = await supabase
                .from('recipes')
                .select('*')
                .eq('user_id', authUser.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setMeals(data || [])
        } catch (e) {
            console.error('Fetch meals error:', e)
            setMealsError('Kon gerechten niet laden')
        } finally {
            setMealsLoading(false)
        }
    }

    const handleLogMeal = (meal) => {
        try {
            // Call onAdd with meal log data so Today refreshes
            onAdd('meal-' + meal.id, null, {
                foodName: meal.name,
                calculatedMacros: {
                    kcal: meal.totals?.kcal || 0,
                    protein: meal.totals?.protein || 0,
                    carbs: meal.totals?.carbs || 0,
                    fat: meal.totals?.fat || 0
                }
            })
            onClose() // Close modal after logging
        } catch (e) {
            console.error('Log meal error:', e)
            alert('Kon gerecht niet loggen')
        }
    }

    const handleMealSaved = (meal) => {
        if (editingMeal) {
            setMeals(meals.map(m => m.id === meal.id ? meal : m))
        } else {
            setMeals([meal, ...meals])
        }
        setShowMealEditor(false)
        setEditingMeal(null)
    }

    const handleDeleteMeal = async (mealId) => {
        if (!confirm('Weet je zeker dat je dit gerecht wilt verwijderen?')) return
        try {
            const { error } = await supabase
                .from('recipes')
                .delete()
                .eq('id', mealId)

            if (error) throw error
            setMeals(meals.filter(m => m.id !== mealId))
        } catch (e) {
            console.error('Delete meal error:', e)
            alert('Kon gerecht niet verwijderen')
        }
    }

    // Derived values for preview (regular foods)
    const calculatePreview = () => {
        if (!selectedFood || !grams) return { kcal: 0, p: 0, c: 0, f: 0 }
        const factor = parseInt(grams) / 100
        return {
            kcal: Math.round(selectedFood.kcal_100 * factor),
            p: (selectedFood.protein_100 * factor).toFixed(1),
            c: (selectedFood.carbs_100 * factor).toFixed(1),
            f: (selectedFood.fat_100 * factor).toFixed(1)
        }
    }

    // Filter products
    const filteredFoods = (user.foods || [])
        .filter(food => {
            const term = searchTerm.toLowerCase()
            const matchesName = food.name_nl.toLowerCase().includes(term)
            const matchesAlias = food.aliases?.some(a => a.toLowerCase().includes(term))
            return matchesName || matchesAlias
        })
        .sort((a, b) => {
            const term = searchTerm.toLowerCase()
            if (!term) return 0

            const aName = a.name_nl.toLowerCase()
            const bName = b.name_nl.toLowerCase()

            // 1. Exact match
            if (aName === term && bName !== term) return -1
            if (bName === term && aName !== term) return 1

            // 2. Starts with "term " (word boundary)
            // Prioritizes "Ei (gekookt)" over "Eierkoek" when searching "Ei"
            const aWordStart = aName.startsWith(term + ' ')
            const bWordStart = bName.startsWith(term + ' ')
            if (aWordStart && !bWordStart) return -1
            if (!aWordStart && bWordStart) return 1

            // 3. Starts with
            const aStarts = aName.startsWith(term)
            const bStarts = bName.startsWith(term)
            if (aStarts && !bStarts) return -1
            if (!aStarts && bStarts) return 1

            // 3. Length (shorter is more relevant)
            if (aStarts && bStarts) {
                return aName.length - bName.length
            }

            // 4. Alphabetical fallback
            return aName.localeCompare(bName)
        })
        .slice(0, 50)

    const handleSelectFood = (food) => {
        setSelectedFood(food)
        setGrams('')
        setView('entry')
    }

    const handleSubmit = () => {
        if (!selectedFood || !grams) return
        onAdd(selectedFood.id, grams)
        onClose()
    }

    const handleCreate = () => {
        if (!newFood.name_nl || !newFood.kcal_100) return

        const createdFood = {
            id: crypto.randomUUID(), // Valid UUID for DB
            name_nl: newFood.name_nl,
            aliases: [],
            unit_type: 'per_100g',
            kcal_100: parseInt(newFood.kcal_100),
            protein_100: parseFloat(newFood.protein_100) || 0,
            carbs_100: parseFloat(newFood.carbs_100) || 0,
            fat_100: parseFloat(newFood.fat_100) || 0,
            isCustom: true
        }

        // Save to DB via Context
        if (addCustomFood) {
            addCustomFood(createdFood)
        } else {
            updateUser({
                foods: [...user.foods, createdFood]
            })
        }

        // Select and proceed
        setSelectedFood(createdFood)
        setGrams('100')
        setView('entry')
    }

    const preview = calculatePreview()



    // If showing meal editor, render that instead
    if (showMealEditor) {
        return (
            <div className="modal-overlay" onClick={() => { setShowMealEditor(false); setEditingMeal(null) }}>
                <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: 0 }}>
                    <MealEditor
                        meal={editingMeal}
                        onSave={handleMealSaved}
                        onClose={() => { setShowMealEditor(false); setEditingMeal(null) }}
                    />
                </div>
                <style>{modalStyles}</style>
            </div>
        )
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                {/* TAB SWITCHER */}
                <div style={tabStyles.container}>
                    <button
                        onClick={() => { setActiveTab('producten'); setView('list') }}
                        style={{
                            ...tabStyles.tab,
                            ...(activeTab === 'producten' ? tabStyles.activeTab : {})
                        }}
                    >
                        Producten
                    </button>
                    <button
                        onClick={() => setActiveTab('gerechten')}
                        style={{
                            ...tabStyles.tab,
                            ...(activeTab === 'gerechten' ? tabStyles.activeTab : {})
                        }}
                    >
                        Gerechten
                    </button>
                </div>

                {/* PRODUCTEN TAB CONTENT */}
                {activeTab === 'producten' && (
                    <>
                        {view === 'list' && (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Voeg eten toe</h3>
                                    <button onClick={onClose} style={{ fontSize: '1.5rem', background: 'none', color: 'var(--color-text-muted)' }}>&times;</button>
                                </div>

                                {/* Search Bar */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <input
                                        type="text"
                                        placeholder="Zoek eten..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.8rem 1rem',
                                            borderRadius: '12px',
                                            border: '1px solid var(--color-border)',
                                            background: 'var(--color-bg)',
                                            fontSize: '1rem',
                                            outline: 'none'
                                        }}
                                        autoFocus
                                    />
                                </div>

                                <div style={{ maxHeight: '45vh', overflowY: 'auto', marginBottom: '1rem' }}>
                                    {/* Regular Foods Section */}
                                    {filteredFoods.length > 0 && (
                                        <div>
                                            {filteredFoods.map(food => (
                                                <button
                                                    key={food.id}
                                                    onClick={() => handleSelectFood(food)}
                                                    style={{
                                                        width: '100%',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        padding: '1rem',
                                                        background: 'var(--color-bg)',
                                                        border: '1px solid var(--color-border)',
                                                        borderRadius: '12px',
                                                        marginBottom: '0.5rem',
                                                        textAlign: 'left'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontWeight: '600', color: 'var(--color-text)' }}>{food.name_nl}</span>
                                                    </div>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{food.kcal_100} kcal/100g</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {filteredFoods.length === 0 && (
                                        <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem' }}>
                                            <div style={{ marginBottom: '1rem' }}>Geen resultaten gevonden.</div>
                                            <button
                                                onClick={() => setView('create')}
                                                className="btn btn-primary"
                                                style={{ width: 'auto', padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
                                            >
                                                Nieuw product toevoegen
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Permanent Create Button */}
                                <button
                                    onClick={() => setView('create')}
                                    className="btn btn-primary"
                                    style={{ width: '100%' }}
                                >
                                    + Nieuw product toevoegen
                                </button>
                            </>
                        )}



                        {view === 'create' && (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <button
                                        onClick={() => setView('list')}
                                        style={{
                                            background: 'none',
                                            fontSize: '1.5rem',
                                            marginRight: '1rem',
                                            padding: 0
                                        }}
                                    >
                                        ←
                                    </button>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Nieuw product</h3>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '60vh', overflowY: 'auto' }}>
                                    <div className="input-group">
                                        <label>Naam product</label>
                                        <input
                                            type="text"
                                            placeholder="Bijv. Eierkoek"
                                            value={newFood.name_nl}
                                            onChange={e => setNewFood({ ...newFood, name_nl: e.target.value })}
                                        />
                                    </div>

                                    <div className="input-group">
                                        <label>Kcal (per 100g)</label>
                                        <input
                                            type="number"
                                            inputMode="numeric"
                                            placeholder="0"
                                            value={newFood.kcal_100}
                                            onChange={e => setNewFood({ ...newFood, kcal_100: e.target.value })}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                                        <div className="input-group">
                                            <label>Eiwit</label>
                                            <input
                                                type="number"
                                                inputMode="numeric"
                                                placeholder="0"
                                                value={newFood.protein_100}
                                                onChange={e => setNewFood({ ...newFood, protein_100: e.target.value })}
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>Koolh</label>
                                            <input
                                                type="number"
                                                inputMode="numeric"
                                                placeholder="0"
                                                value={newFood.carbs_100}
                                                onChange={e => setNewFood({ ...newFood, carbs_100: e.target.value })}
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>Vet</label>
                                            <input
                                                type="number"
                                                inputMode="numeric"
                                                placeholder="0"
                                                value={newFood.fat_100}
                                                onChange={e => setNewFood({ ...newFood, fat_100: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    className="btn btn-primary"
                                    onClick={handleCreate}
                                    disabled={!newFood.name_nl || !newFood.kcal_100}
                                    style={{
                                        width: '100%',
                                        marginTop: '1.5rem',
                                        opacity: (!newFood.name_nl || !newFood.kcal_100) ? 0.5 : 1
                                    }}
                                >
                                    Opslaan en kiezen
                                </button>
                            </>
                        )}

                        {view === 'entry' && selectedFood && (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <button
                                        onClick={() => setView('list')}
                                        style={{
                                            background: 'none',
                                            fontSize: '1.5rem',
                                            marginRight: '1rem',
                                            padding: 0
                                        }}
                                    >
                                        ←
                                    </button>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{selectedFood.name_nl}</h3>
                                </div>

                                <div className="input-group">
                                    <label>Hoeveelheid (gram)</label>
                                    <input
                                        type="number"
                                        inputMode="numeric"
                                        placeholder="0"
                                        value={grams}
                                        onChange={e => setGrams(e.target.value)}
                                        autoFocus
                                    />
                                </div>

                                {/* Live Preview Card */}
                                <div style={{
                                    background: 'var(--color-bg)',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    marginBottom: '1.5rem',
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                }}>
                                    <PreviewStat label="Kcal" value={preview.kcal} />
                                    <PreviewStat label="Eiwit" value={preview.p + 'g'} />
                                    <PreviewStat label="Koolh" value={preview.c + 'g'} />
                                    <PreviewStat label="Vet" value={preview.f + 'g'} />
                                </div>

                                <button
                                    className="btn btn-primary"
                                    onClick={handleSubmit}
                                    disabled={!grams || parseInt(grams) <= 0}
                                    style={{
                                        width: '100%',
                                        opacity: (!grams || parseInt(grams) <= 0) ? 0.5 : 1
                                    }}
                                >
                                    Voeg toe aan vandaag
                                </button>
                            </>
                        )}
                    </>
                )}

                {/* GERECHTEN TAB CONTENT */}
                {activeTab === 'gerechten' && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Mijn gerechten</h3>
                            <button onClick={onClose} style={{ fontSize: '1.5rem', background: 'none', color: 'var(--color-text-muted)' }}>&times;</button>
                        </div>

                        {mealsError && (
                            <div style={{
                                background: 'rgba(220, 38, 38, 0.1)',
                                color: '#dc2626',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                marginBottom: '1rem',
                                fontSize: '0.9rem'
                            }}>
                                {mealsError}
                            </div>
                        )}

                        {mealsLoading ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                                Laden...
                            </div>
                        ) : (
                            <div style={{ maxHeight: '50vh', overflowY: 'auto', marginBottom: '1rem' }}>
                                {meals.length === 0 ? (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '2rem',
                                        color: 'var(--color-text-muted)',
                                        background: 'var(--color-bg)',
                                        borderRadius: '12px',
                                        border: '1px dashed var(--color-border)'
                                    }}>
                                        <div style={{ marginBottom: '0.5rem' }}>Nog geen gerechten</div>
                                        <div style={{ fontSize: '0.85rem' }}>Maak je eerste gerecht om snel te loggen</div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {meals.map(meal => (
                                            <div
                                                key={meal.id}
                                                style={{
                                                    background: 'var(--color-surface)',
                                                    border: '1px solid var(--color-border)',
                                                    borderRadius: '12px',
                                                    padding: '1rem'
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                    <div>
                                                        <div style={{ fontWeight: '600', fontSize: '1rem' }}>{meal.name}</div>
                                                        {meal.category && (
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                                                                {meal.category}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-primary)' }}>
                                                        {meal.totals?.kcal || 0} kcal
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                                                    <span>E: {meal.totals?.protein || 0}g</span>
                                                    <span>K: {meal.totals?.carbs || 0}g</span>
                                                    <span>V: {meal.totals?.fat || 0}g</span>
                                                </div>

                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        onClick={() => handleLogMeal(meal)}
                                                        style={{
                                                            flex: 1,
                                                            padding: '0.5rem',
                                                            background: 'var(--color-primary)',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            fontWeight: '600',
                                                            fontSize: '0.85rem',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        Voeg toe
                                                    </button>
                                                    <button
                                                        onClick={() => { setEditingMeal(meal); setShowMealEditor(true) }}
                                                        style={{
                                                            padding: '0.5rem 0.75rem',
                                                            background: 'transparent',
                                                            border: '1px solid var(--color-border)',
                                                            borderRadius: '8px',
                                                            fontSize: '0.85rem',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        Bewerk
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteMeal(meal.id)}
                                                        style={{
                                                            padding: '0.5rem 0.75rem',
                                                            background: 'transparent',
                                                            border: '1px solid var(--color-border)',
                                                            borderRadius: '8px',
                                                            fontSize: '0.85rem',
                                                            color: 'var(--color-text-muted)',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            onClick={() => { setEditingMeal(null); setShowMealEditor(true) }}
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                        >
                            + Nieuw gerecht maken
                        </button>
                    </>
                )}
            </div>

            <style>{modalStyles}</style>
        </div>
    )
}

function PreviewStat({ label, value }) {
    return (
        <div style={{ textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{label}</span>
            <span style={{ fontWeight: '700', color: 'var(--color-primary)' }}>{value}</span>
        </div>
    )
}

const tabStyles = {
    container: {
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1rem',
        padding: '0.25rem',
        background: 'var(--color-bg)',
        borderRadius: '10px'
    },
    tab: {
        flex: 1,
        padding: '0.6rem 1rem',
        border: 'none',
        borderRadius: '8px',
        background: 'transparent',
        fontSize: '0.9rem',
        fontWeight: '500',
        cursor: 'pointer',
        color: 'var(--color-text-muted)',
        transition: 'all 0.2s ease'
    },
    activeTab: {
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        fontWeight: '600',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }
}

const modalStyles = `
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.4);
        display: flex;
        align-items: flex-end;
        justify-content: center;
        z-index: 1000;
    }
    
    @media(min-width: 480px) {
        .modal-overlay {
            align-items: center;
        }
    }

    .modal-content {
        background: #FFFFFF;
        width: 100%;
        max-width: 480px;
        padding: 1.5rem;
        padding-bottom: 2rem;
        border-radius: 20px 20px 0 0;
        animation: slideUp 0.3s ease-out;
        max-height: 90vh;
        overflow-y: auto;
    }

    @media(min-width: 480px) {
        .modal-content {
            border-radius: 20px;
            width: 90%;
        }
    }

    @keyframes slideUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
    }

    .input-group {
        margin-bottom: 1.5rem;
    }
    
    .input-group label {
        display: block;
        margin-bottom: 0.5rem;
        color: var(--color-text-muted);
        font-size: 0.9rem;
    }

    .input-group input {
        width: 100%;
        padding: 1rem;
        border: 1px solid var(--color-border);
        border-radius: 12px;
        font-size: 1.5rem;
        font-weight: 700;
        background: var(--color-bg);
    }
`
