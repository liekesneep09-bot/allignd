import React, { useState, useEffect } from 'react'
import { useUser } from '../context/UserContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabaseClient'
import { useLanguage } from '../context/LanguageContext'
import MealEditor from './MealEditor'

export default function FoodModal({ onClose, onAdd }) {
    const { user, updateUser, addCustomFood, logFood } = useUser()
    const { getAccessToken } = useAuth()
    const { language, t } = useLanguage()

    // Main tab state: 'producten' or 'gerechten'
    const [activeTab, setActiveTab] = useState('producten')

    // Products view state
    const [view, setView] = useState('list') // 'list' | 'entry' | 'create'
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedFood, setSelectedFood] = useState(null)
    const [grams, setGrams] = useState('')
    const [unitType, setUnitType] = useState('g') // 'g' | 'unit'
    const getMealCategoryFromTime = () => {
        const hour = new Date().getHours()
        if (hour >= 5 && hour < 11.5) return 'breakfast'
        if (hour >= 11.5 && hour < 15.5) return 'lunch'
        if (hour >= 15.5 && hour < 18.5) return 'snack'
        if (hour >= 18.5 && hour < 23) return 'dinner'
        return 'snack'
    }
    const [mealCategory, setMealCategory] = useState(getMealCategoryFromTime())

    // Form state for new product
    const [newFood, setNewFood] = useState({
        name_nl: '',
        kcal_100: '',
        protein_100: '',
        carbs_100: '',
        fat_100: '',
        fiber_100: '',
        unit_name: '',
        unit_weight: ''
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

            // Fetch meals
            const { data: mealsData, error: mealsError } = await supabase
                .from('meals')
                .select('*')
                .eq('user_id', authUser.id)
                .order('created_at', { ascending: false })

            if (mealsError) throw mealsError

            // Fetch all meal_items for these meals
            const mealIds = (mealsData || []).map(m => m.id)
            let itemsMap = {}

            if (mealIds.length > 0) {
                const { data: items, error: itemsError } = await supabase
                    .from('meal_items')
                    .select('*')
                    .in('meal_id', mealIds)

                if (itemsError) throw itemsError

                    ; (items || []).forEach(item => {
                        if (!itemsMap[item.meal_id]) itemsMap[item.meal_id] = []
                        itemsMap[item.meal_id].push(item)
                    })
            }

            // Calculate totals for each meal
            const mealsWithTotals = (mealsData || []).map(meal => {
                const mealItems = itemsMap[meal.id] || []
                const totals = mealItems.reduce((acc, item) => {
                    const factor = (item.unit === 'g' || item.unit === 'ml')
                        ? item.quantity / 100
                        : (item.quantity * (item.unit_weight || 100)) / 100
                    return {
                        kcal: acc.kcal + (item.kcal_100 * factor),
                        protein: acc.protein + (item.protein_100 * factor),
                        carbs: acc.carbs + (item.carbs_100 * factor),
                        fat: acc.fat + (item.fat_100 * factor),
                        fiber: acc.fiber + ((item.fiber_100 || 0) * factor)
                    }
                }, { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 })

                return {
                    ...meal,
                    items: mealItems,
                    totals: {
                        kcal: Math.round(totals.kcal),
                        protein: Math.round(totals.protein * 10) / 10,
                        carbs: Math.round(totals.carbs * 10) / 10,
                        fat: Math.round(totals.fat * 10) / 10,
                        fiber: Math.round(totals.fiber * 10) / 10
                    }
                }
            })

            setMeals(mealsWithTotals)
        } catch (e) {
            console.error('Fetch meals error:', e)
            setMealsError(t('food_modal.fetch_error'))
        } finally {
            setMealsLoading(false)
        }
    }

    const handleLogMeal = async (meal) => {
        try {
            await logFood('meal-' + meal.id, null, {
                foodName: meal.name,
                configId: 'meal-' + meal.id,
                quantity: 1,
                selectedVariants: null,
                meal_category: meal.category || null,
                calculatedMacros: {
                    kcal: meal.totals?.kcal || 0,
                    protein: meal.totals?.protein || 0,
                    carbs: meal.totals?.carbs || 0,
                    fat: meal.totals?.fat || 0,
                    fiber: meal.totals?.fiber || 0
                }
            })
            onClose()
        } catch (e) {
            console.error('Log meal error:', e)
            alert(t('food_modal.log_error'))
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
        if (!confirm(t('food_modal.delete_confirm'))) return
        try {
            const { error } = await supabase
                .from('meals')
                .delete()
                .eq('id', mealId)

            if (error) throw error
            setMeals(meals.filter(m => m.id !== mealId))
        } catch (e) {
            console.error('Delete meal error:', e)
            alert(t('food_modal.delete_error'))
        }
    }

    // Derived values for preview (regular foods)
    const calculatePreview = () => {
        if (!selectedFood || !grams) return { kcal: 0, p: 0, c: 0, f: 0, fiber: 0 }
        const parsedValue = parseFloat(String(grams).replace(',', '.')) || 0
        
        let factor = 0
        if (unitType === 'unit' && selectedFood.unit_weight) {
            factor = (parsedValue * selectedFood.unit_weight) / 100
        } else {
            factor = parsedValue / 100
        }

        return {
            kcal: Math.round(selectedFood.kcal_100 * factor),
            p: (selectedFood.protein_100 * factor).toFixed(1),
            c: (selectedFood.carbs_100 * factor).toFixed(1),
            f: (selectedFood.fat_100 * factor).toFixed(1),
            fiber: ((selectedFood.fiber_100 || 0) * factor).toFixed(1)
        }
    }

    // Filter products
    const filteredFoods = (user.foods || [])
        .filter(food => {
            const term = searchTerm.toLowerCase()
            const matchesNameNl = food.name_nl.toLowerCase().includes(term)
            const matchesNameEn = (food.name_en || '').toLowerCase().includes(term)
            const matchesAlias = food.aliases?.some(a => a.toLowerCase().includes(term))
            return matchesNameNl || matchesNameEn || matchesAlias
        })
        .sort((a, b) => {
            const term = searchTerm.toLowerCase()
            if (!term) return 0

            const aName = (language === 'en' && a.name_en ? a.name_en : a.name_nl).toLowerCase()
            const bName = (language === 'en' && b.name_en ? b.name_en : b.name_nl).toLowerCase()

            // 1. Exact match
            if (aName === term && bName !== term) return -1
            if (bName === term && aName !== term) return 1

            // 2. Starts with "term " (word boundary)
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
        setUnitType(food.unit_name ? 'unit' : 'g')
        setView('entry')
    }

    const handleSubmit = () => {
        if (!selectedFood || !grams) return
        const parsedValue = parseFloat(String(grams).replace(',', '.')) || 0
        if (parsedValue <= 0) return
        onAdd(selectedFood.id, parsedValue, null, { unitType, meal_category: mealCategory })
        onClose()
    }

    const handleCreate = () => {
        if (!newFood.name_nl || !newFood.kcal_100) return

        const createdFood = {
            id: crypto.randomUUID(), // Valid UUID for DB
            name_nl: newFood.name_nl,
            name_en: newFood.name_nl, // Assuming custom foods are same in EN unless they edit
            aliases: [],
            unit_type: 'per_100g',
            unit_name: newFood.unit_name || null,
            unit_weight: newFood.unit_weight ? parseFloat(String(newFood.unit_weight).replace(',', '.')) : null,
            kcal_100: Math.round(parseFloat(String(newFood.kcal_100).replace(',', '.')) || 0),
            protein_100: parseFloat(String(newFood.protein_100).replace(',', '.')) || 0,
            carbs_100: parseFloat(String(newFood.carbs_100).replace(',', '.')) || 0,
            fat_100: parseFloat(String(newFood.fat_100).replace(',', '.')) || 0,
            fiber_100: parseFloat(String(newFood.fiber_100).replace(',', '.')) || 0,
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
                        {t('food_modal.tab_products')}
                    </button>
                    <button
                        onClick={() => setActiveTab('gerechten')}
                        style={{
                            ...tabStyles.tab,
                            ...(activeTab === 'gerechten' ? tabStyles.activeTab : {})
                        }}
                    >
                        {t('food_modal.tab_meals')}
                    </button>
                </div>

                {/* PRODUCTEN TAB CONTENT */}
                {activeTab === 'producten' && (
                    <>
                        {view === 'list' && (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-text)' }}>{t('food_modal.add_food_title')}</h3>
                                    <button 
                                        onClick={onClose} 
                                        aria-label={t('common.close')}
                                        style={{ 
                                            width: '32px', 
                                            height: '32px', 
                                            borderRadius: '50%', 
                                            background: 'rgba(0,0,0,0.05)', 
                                            border: 'none',
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            color: 'var(--color-text-muted)',
                                            fontSize: '1rem',
                                            transition: 'background 0.2s',
                                            flexShrink: 0
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Search Bar */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <input
                                        type="text"
                                        placeholder={t('food_modal.search_placeholder')}
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
                                    />
                                </div>

                                <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', marginBottom: '1rem' }}>
                                    {/* Regular Foods Section */}
                                    {filteredFoods.length > 0 && (
                                        <div>
                                            {filteredFoods.map(food => (
                                                <button
                                                    key={food.id}
                                                    onClick={() => handleSelectFood(food)}
                                                    className="food-item-btn"
                                                >
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontWeight: '600', color: 'var(--color-text)' }}>
                                                            {language === 'en' && food.name_en ? food.name_en : food.name_nl}
                                                        </span>
                                                    </div>
                                                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>{food.kcal_100} {t('food_modal.kcal_per_100g')}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {filteredFoods.length === 0 && (
                                        <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem' }}>
                                            <div style={{ marginBottom: '1rem' }}>{t('food_modal.no_results')}</div>
                                            <button
                                                onClick={() => setView('create')}
                                                className="btn btn-primary"
                                                style={{ width: 'auto', padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
                                            >
                                                {t('food_modal.add_new_product')}
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
                                    + {t('food_modal.add_new_product')}
                                </button>
                            </>
                        )}

                        {view === 'create' && (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <button
                                        onClick={() => setView('list')}
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: 'rgba(0,0,0,0.05)',
                                            border: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            color: 'var(--color-text-muted)',
                                            fontSize: '1.1rem',
                                            marginRight: '0.75rem',
                                            transition: 'background 0.2s',
                                            flexShrink: 0
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                                    >
                                        ←
                                    </button>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-text)' }}>{t('food_modal.new_product_title')}</h3>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, minHeight: 0, overflowY: 'auto' }}>
                                    <div className="input-group">
                                        <label>{t('food_modal.product_name_label')}</label>
                                        <input
                                            type="text"
                                            placeholder={t('food_modal.product_name_placeholder')}
                                            value={newFood.name_nl}
                                            onChange={e => setNewFood({ ...newFood, name_nl: e.target.value })}
                                        />
                                    </div>

                                    <div className="input-group">
                                        <label>{t('food_modal.kcal_label')}</label>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            placeholder="0"
                                            value={newFood.kcal_100}
                                            onChange={e => setNewFood({ ...newFood, kcal_100: e.target.value })}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem' }}>
                                        <div className="input-group">
                                            <label>{t('food_modal.protein_label')}</label>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                placeholder="0"
                                                value={newFood.protein_100}
                                                onChange={e => setNewFood({ ...newFood, protein_100: e.target.value })}
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>{t('food_modal.carbs_label')}</label>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                placeholder="0"
                                                value={newFood.carbs_100}
                                                onChange={e => setNewFood({ ...newFood, carbs_100: e.target.value })}
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>{t('food_modal.fat_label')}</label>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                placeholder="0"
                                                value={newFood.fat_100}
                                                onChange={e => setNewFood({ ...newFood, fat_100: e.target.value })}
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>{t('food_modal.fiber_label')}</label>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                placeholder="0"
                                                value={newFood.fiber_100}
                                                onChange={e => setNewFood({ ...newFood, fiber_100: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ padding: '1rem', background: 'var(--color-bg)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                                        <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--color-text)' }}>
                                            {t('food_modal.standard_unit_title')}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div className="input-group" style={{ marginBottom: 0 }}>
                                                <label>{t('food_modal.unit_name_label')}</label>
                                                <input
                                                    type="text"
                                                    placeholder={t('food_modal.unit_name_placeholder')}
                                                    style={{ fontSize: '1rem', padding: '0.75rem', fontWeight: '400' }}
                                                    value={newFood.unit_name}
                                                    onChange={e => setNewFood({ ...newFood, unit_name: e.target.value })}
                                                />
                                            </div>
                                            <div className="input-group" style={{ marginBottom: 0 }}>
                                                <label>{t('food_modal.unit_weight_label')}</label>
                                                <input
                                                    type="text"
                                                    inputMode="decimal"
                                                    placeholder="0"
                                                    style={{ fontSize: '1rem', padding: '0.75rem', fontWeight: '400' }}
                                                    value={newFood.unit_weight}
                                                    onChange={e => setNewFood({ ...newFood, unit_weight: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                                            {t('food_modal.unit_info')}
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
                                    {t('food_modal.save_select')}
                                </button>
                            </>
                        )}

                        {view === 'entry' && selectedFood && (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <button
                                        onClick={() => setView('list')}
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: 'rgba(0,0,0,0.05)',
                                            border: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            color: 'var(--color-text-muted)',
                                            fontSize: '1.1rem',
                                            marginRight: '0.75rem',
                                            transition: 'background 0.2s',
                                            flexShrink: 0
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                                    >
                                        ←
                                    </button>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-text)' }}>
                                        {language === 'en' && selectedFood.name_en ? selectedFood.name_en : selectedFood.name_nl}
                                    </h3>
                                </div>

                                {/* Segmented Unit Type Selector */}
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', background: 'var(--color-bg)', padding: '4px', borderRadius: '14px', border: '1px solid var(--color-border)' }}>
                                    <button
                                        onClick={() => setUnitType('g')}
                                        style={{
                                            flex: 1,
                                            padding: '0.65rem',
                                            borderRadius: '10px',
                                            border: 'none',
                                            background: unitType === 'g' ? '#ffffff' : 'transparent',
                                            color: unitType === 'g' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                            fontWeight: '700',
                                            boxShadow: unitType === 'g' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        {selectedFood?.unit_type === 'per_100ml' ? 'ml' : t('food_modal.gram')}
                                    </button>
                                    {selectedFood.unit_name && (
                                        <button
                                            onClick={() => setUnitType('unit')}
                                            style={{
                                                flex: 1,
                                                padding: '0.65rem',
                                                borderRadius: '10px',
                                                border: 'none',
                                                background: unitType === 'unit' ? '#ffffff' : 'transparent',
                                                color: unitType === 'unit' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                                fontWeight: '700',
                                                boxShadow: unitType === 'unit' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                fontSize: '0.9rem',
                                                textTransform: 'capitalize'
                                            }}
                                        >
                                            {selectedFood.unit_name}
                                        </button>
                                    )}
                                </div>

                                {/* Redesigned Premium Mobile-Friendly Amount Input */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '1rem 0 1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            placeholder="0"
                                            value={grams}
                                            onChange={e => setGrams(e.target.value)}
                                            onFocus={e => e.target.select()}
                                            autoFocus
                                            style={{
                                                width: '120px',
                                                border: 'none',
                                                borderBottom: '2px solid var(--color-primary)',
                                                borderRadius: 0,
                                                background: 'transparent',
                                                fontSize: '2.5rem',
                                                fontWeight: '800',
                                                textAlign: 'center',
                                                padding: '4px 0',
                                                outline: 'none',
                                                color: 'var(--color-text)'
                                            }}
                                        />
                                        <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text-muted)' }}>
                                            {unitType === 'g' ? (selectedFood?.unit_type === 'per_100ml' ? 'ml' : 'g') : selectedFood.unit_name}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-muted)', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                        {t('food_modal.amount_label')}
                                    </div>
                                </div>

                                {/* Live Preview Card */}
                                <div style={{
                                    background: 'var(--color-bg)',
                                    padding: '1rem 0.5rem',
                                    borderRadius: '16px',
                                    marginBottom: '1.5rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    border: '1px solid var(--color-border)'
                                }}>
                                    <PreviewStat label="Kcal" value={preview.kcal} color="var(--color-calories)" />
                                    <PreviewStat label={t('food_modal.carbs_label')} value={preview.c + 'g'} color="var(--color-carbs)" />
                                    <PreviewStat label={t('food_modal.fat_label')} value={preview.f + 'g'} color="#e4c464" />
                                    <PreviewStat label={t('food_modal.protein_label')} value={preview.p + 'g'} color="var(--color-protein)" />
                                    <PreviewStat label={t('food_modal.fiber_label')} value={preview.fiber + 'g'} color="var(--color-text-muted)" hasBorder={false} />
                                </div>

                                {/* Meal Category Selector */}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{
                                        fontSize: '0.7rem',
                                        fontWeight: '700',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.06em',
                                        color: 'var(--color-text-muted)',
                                        marginBottom: '0.6rem'
                                    }}>
                                        {t('food_modal.meal_moment')}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {[
                                            { key: 'breakfast', label: t('meal_editor.breakfast') },
                                            { key: 'lunch',     label: t('meal_editor.lunch') },
                                            { key: 'dinner',    label: t('meal_editor.dinner') },
                                            { key: 'snack',     label: t('meal_editor.snack') }
                                        ].map(cat => (
                                            <button
                                                key={cat.key}
                                                onClick={() => setMealCategory(mealCategory === cat.key ? null : cat.key)}
                                                style={{
                                                    padding: '0.45rem 1rem',
                                                    borderRadius: '20px',
                                                    border: mealCategory === cat.key
                                                        ? '2px solid var(--color-primary)'
                                                        : '1px solid var(--color-border)',
                                                    background: mealCategory === cat.key
                                                        ? 'rgba(255,174,185,0.08)'
                                                        : 'var(--color-surface)',
                                                    color: mealCategory === cat.key
                                                        ? 'var(--color-primary)'
                                                        : 'var(--color-text-muted)',
                                                    fontSize: '0.82rem',
                                                    fontWeight: mealCategory === cat.key ? '700' : '500',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s ease',
                                                    fontFamily: 'inherit'
                                                }}
                                            >
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    className="btn btn-primary"
                                    onClick={handleSubmit}
                                    disabled={!grams || parseFloat(String(grams).replace(',', '.')) <= 0}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        borderRadius: '16px',
                                        background: 'var(--color-primary)',
                                        color: '#333333',
                                        fontWeight: '700',
                                        fontSize: '1rem',
                                        border: 'none',
                                        boxShadow: 'var(--shadow-soft)',
                                        cursor: 'pointer',
                                        opacity: (!grams || parseFloat(String(grams).replace(',', '.')) <= 0) ? 0.5 : 1,
                                        transition: 'transform 0.15s, opacity 0.15s'
                                    }}
                                >
                                    {t('food_modal.add_to_today')}
                                </button>
                            </>
                        )}
                    </>
                )}

                {activeTab === 'gerechten' && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-text)' }}>{t('food_modal.my_meals_title')}</h3>
                            <button 
                                onClick={onClose} 
                                style={{ 
                                    width: '32px', 
                                    height: '32px', 
                                    borderRadius: '50%', 
                                    background: 'rgba(0,0,0,0.05)', 
                                    border: 'none',
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'var(--color-text-muted)',
                                    fontSize: '1rem',
                                    transition: 'background 0.2s',
                                    flexShrink: 0
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                            >
                                ✕
                            </button>
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
                                {t('food_modal.loading')}
                            </div>
                        ) : (
                            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', marginBottom: '1rem' }}>
                                {meals.length === 0 ? (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '2rem',
                                        color: 'var(--color-text-muted)',
                                        background: 'var(--color-bg)',
                                        borderRadius: '12px',
                                        border: '1px dashed var(--color-border)'
                                    }}>
                                        <div style={{ marginBottom: '0.5rem' }}>{t('food_modal.no_meals_yet')}</div>
                                        <div style={{ fontSize: '0.85rem' }}>{t('food_modal.no_meals_desc')}</div>
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
                                                    <span>{t('food_modal.protein_label').charAt(0)}: {meal.totals?.protein || 0}g</span>
                                                    <span>{t('food_modal.carbs_label').charAt(0)}: {meal.totals?.carbs || 0}g</span>
                                                    <span>{t('food_modal.fat_label').charAt(0)}: {meal.totals?.fat || 0}g</span>
                                                    <span>{t('food_modal.fiber_label').charAt(0)}: {meal.totals?.fiber || 0}g</span>
                                                </div>

                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        onClick={() => handleLogMeal(meal)}
                                                        style={{
                                                            flex: 1,
                                                            padding: '0.5rem',
                                                            background: 'var(--color-primary)',
                                                            color: '#333333',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            fontWeight: '600',
                                                            fontSize: '0.85rem',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {t('food_modal.add')}
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
                                                        {t('food_modal.edit')}
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
                            {t('food_modal.create_new_meal')}
                        </button>
                    </>
                )}
            </div>

            <style>{modalStyles}</style>
        </div>
    )
}

function PreviewStat({ label, value, color, hasBorder = true }) {
    return (
        <div style={{ 
            flex: 1, 
            textAlign: 'center', 
            borderRight: hasBorder ? '1.5px solid var(--color-border)' : 'none'
        }}>
            <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '2px' }}>{label}</span>
            <span style={{ fontWeight: '800', fontSize: '1rem', color: color || 'var(--color-text)' }}>{value}</span>
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
        color: 'var(--color-text-muted)',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontSize: '0.9rem'
    },
    activeTab: {
        background: 'var(--color-surface)',
        color: 'var(--color-primary)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }
}

const modalStyles = `
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: flex-end;
        z-index: 1000;
        backdrop-filter: blur(4px);
    }

    .modal-content {
        background: var(--color-surface);
        width: 100%;
        max-width: 500px;
        max-height: 90vh;
        border-radius: 24px 24px 0 0;
        padding: 1.5rem;
        padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
        display: flex;
        flex-direction: column;
        box-shadow: 0 -10px 25px rgba(0, 0, 0, 0.1);
        animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
    }

    .input-group {
        margin-bottom: 1rem;
    }

    .input-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--color-text-muted);
    }

    .input-group input, .input-group select {
        width: 100%;
        padding: 0.8rem 1rem;
        border: 1px solid var(--color-border);
        border-radius: 12px;
        background: var(--color-bg);
        color: var(--color-text);
        font-size: 1rem;
        outline: none;
        transition: border-color 0.2s;
    }

    .input-group input:focus {
        border-color: var(--color-primary);
    }

    .btn {
        padding: 1rem;
        border-radius: 14px;
        border: none;
        font-weight: 700;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }

    .btn-primary {
        background: var(--color-primary);
        color: white;
    }

    .btn-primary:active {
        transform: scale(0.98);
    }

    .food-item-btn {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: var(--color-bg);
        border: 1px solid var(--color-border);
        border-radius: 12px;
        margin-bottom: 0.5rem;
        text-align: left;
        cursor: pointer;
        transition: all 0.15s ease-out;
        font-family: inherit;
    }

    .food-item-btn:hover {
        border-color: var(--color-primary);
        background: rgba(255, 174, 185, 0.04);
    }

    .food-item-btn:active {
        transform: scale(0.98);
        background: rgba(255, 174, 185, 0.08);
    }
`
