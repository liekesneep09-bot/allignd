import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useUser } from '../context/UserContext'
import { useLanguage } from '../context/LanguageContext'

/**
 * MealEditor Component
 * Create or edit a meal with ingredients
 */
export default function MealEditor({ meal, onSave, onClose }) {
    const { getAccessToken } = useAuth()
    const { user } = useUser()
    const { language, t } = useLanguage()

    // Form state
    const [name, setName] = useState(meal?.name || '')
    const [category, setCategory] = useState(meal?.category || '')
    const [items, setItems] = useState(meal?.items || [])
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    // Ingredient picker state
    const [showPicker, setShowPicker] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [quantity, setQuantity] = useState('100')
    const [unit, setUnit] = useState('g')

    // Calculate totals
    const totals = items.reduce((acc, item) => {
        const factor = (item.unit === 'g' || item.unit === 'ml')
            ? item.quantity / 100
            : (item.quantity * (item.unit_weight || 100)) / 100
        return {
            kcal: acc.kcal + (item.kcal_100 * factor),
            protein: acc.protein + (item.protein_100 * factor),
            carbs: acc.carbs + (item.carbs_100 * factor),
            fat: acc.fat + (item.fat_100 * factor)
        }
    }, { kcal: 0, protein: 0, carbs: 0, fat: 0 })

    // Filter products for search
    const filteredProducts = user.foods.filter(food => {
        const term = searchTerm.toLowerCase()
        const matchesNameNl = food.name_nl.toLowerCase().includes(term)
        const matchesNameEn = (food.name_en || '').toLowerCase().includes(term)
        const matchesAlias = food.aliases?.some(a => a.toLowerCase().includes(term))
        return matchesNameNl || matchesNameEn || matchesAlias
    }).slice(0, 20)

    const handleAddIngredient = () => {
        if (!selectedProduct || !quantity) return

        const parsedQuantity = parseFloat(String(quantity).replace(',', '.')) || 0
        if (parsedQuantity <= 0) return

        const newItem = {
            product_id: selectedProduct.id,
            product_name: selectedProduct.name_nl, // Keep original name_nl as fallback
            quantity: parsedQuantity,
            unit: unit,
            unit_weight: selectedProduct.unit_name === unit ? selectedProduct.unit_weight : null,
            kcal_100: selectedProduct.kcal_100,
            protein_100: selectedProduct.protein_100,
            carbs_100: selectedProduct.carbs_100,
            fat_100: selectedProduct.fat_100
        }

        setItems([...items, newItem])
        setSelectedProduct(null)
        setQuantity('100')
        setUnit('g')
        setSearchTerm('')
        setShowPicker(false)
    }

    const handleRemoveIngredient = (index) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const handleSave = async () => {
        if (!name.trim()) {
            setError(t('meal_editor.error_name'))
            return
        }
        if (items.length === 0) {
            setError(t('meal_editor.error_min_ingredients'))
            return
        }

        setSaving(true)
        setError('')

        try {
            // Get user ID
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (!authUser) throw new Error(t('meal_editor.error_auth'))

            // Clean items and ensure numbers
            const cleanItems = items.map(item => ({
                product_id: item.product_id,
                product_name: item.product_name,
                quantity: parseFloat(String(item.quantity).replace(',', '.')) || 0,
                unit: item.unit || 'g',
                unit_weight: item.unit_weight,
                kcal_100: parseFloat(String(item.kcal_100).replace(',', '.')) || 0,
                protein_100: parseFloat(String(item.protein_100).replace(',', '.')) || 0,
                carbs_100: parseFloat(String(item.carbs_100).replace(',', '.')) || 0,
                fat_100: parseFloat(String(item.fat_100).replace(',', '.')) || 0
            }))

            let savedMeal

            if (meal?.id) {
                // ── UPDATE existing meal ──
                const { error: updateError } = await supabase
                    .from('meals')
                    .update({
                        name: name.trim(),
                        category: category || null
                    })
                    .eq('id', meal.id)
                    .eq('user_id', authUser.id)

                if (updateError) throw updateError

                // Replace all items: delete old, insert new
                await supabase.from('meal_items').delete().eq('meal_id', meal.id)

                if (cleanItems.length > 0) {
                    const itemRecords = cleanItems.map(item => ({
                        meal_id: meal.id,
                        product_id: item.product_id,
                        product_name: item.product_name,
                        quantity: item.quantity,
                        unit: item.unit,
                        unit_weight: item.unit_weight,
                        kcal_100: item.kcal_100,
                        protein_100: item.protein_100,
                        carbs_100: item.carbs_100,
                        fat_100: item.fat_100
                    }))

                    const { error: itemsError } = await supabase
                        .from('meal_items')
                        .insert(itemRecords)

                    if (itemsError) throw itemsError
                }

                // Fetch updated meal
                const { data: updatedMeal } = await supabase
                    .from('meals')
                    .select('*')
                    .eq('id', meal.id)
                    .single()

                savedMeal = updatedMeal
            } else {
                // ── CREATE new meal ──
                const { data: newMeal, error: mealError } = await supabase
                    .from('meals')
                    .insert({
                        user_id: authUser.id,
                        name: name.trim(),
                        category: category || null
                    })
                    .select()
                    .single()

                if (mealError) throw mealError

                // Insert items
                if (cleanItems.length > 0) {
                    const itemRecords = cleanItems.map(item => ({
                        meal_id: newMeal.id,
                        product_id: item.product_id,
                        product_name: item.product_name,
                        quantity: item.quantity,
                        unit: item.unit,
                        unit_weight: item.unit_weight,
                        kcal_100: item.kcal_100,
                        protein_100: item.protein_100,
                        carbs_100: item.carbs_100,
                        fat_100: item.fat_100
                    }))

                    const { error: itemsError } = await supabase
                        .from('meal_items')
                        .insert(itemRecords)

                    if (itemsError) throw itemsError
                }

                savedMeal = newMeal
            }

            // Calculate totals for the callback
            const mealTotals = cleanItems.reduce((acc, item) => {
                const factor = (item.unit === 'g' || item.unit === 'ml') 
                    ? item.quantity / 100 
                    : (item.quantity * (item.unit_weight || 100)) / 100
                return {
                    kcal: acc.kcal + (item.kcal_100 * factor),
                    protein: acc.protein + (item.protein_100 * factor),
                    carbs: acc.carbs + (item.carbs_100 * factor),
                    fat: acc.fat + (item.fat_100 * factor)
                }
            }, { kcal: 0, protein: 0, carbs: 0, fat: 0 })

            // Return full meal object with items and totals
            onSave({
                ...savedMeal,
                items: cleanItems,
                totals: {
                    kcal: Math.round(mealTotals.kcal),
                    protein: Math.round(mealTotals.protein * 10) / 10,
                    carbs: Math.round(mealTotals.carbs * 10) / 10,
                    fat: Math.round(mealTotals.fat * 10) / 10
                }
            })
        } catch (e) {
            console.error("Save error:", e)
            setError(e.message || t('meal_editor.error_save'))
        } finally {
            setSaving(false)
        }
    }

    const categories = [
        { value: '', label: t('meal_editor.no_category') },
        { value: 'ontbijt', label: t('meal_editor.breakfast') },
        { value: 'lunch', label: t('meal_editor.lunch') },
        { value: 'diner', label: t('meal_editor.dinner') },
        { value: 'snack', label: t('meal_editor.snack') }
    ]

    const getLocalizedProductName = (item) => {
        const product = user.foods.find(f => f.id === item.product_id)
        if (product) {
            return language === 'en' && product.name_en ? product.name_en : product.name_nl
        }
        return item.product_name // Fallback
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <button onClick={onClose} style={styles.backBtn}>←</button>
                <h3 style={styles.title}>{meal?.id ? t('meal_editor.edit_meal') : t('meal_editor.new_meal')}</h3>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        ...styles.saveBtn,
                        opacity: saving ? 0.5 : 1
                    }}
                >
                    {saving ? t('meal_editor.saving') : t('meal_editor.save')}
                </button>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            {/* Name input */}
            <div style={styles.inputGroup}>
                <label style={styles.label}>{t('meal_editor.name_label')}</label>
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={t('meal_editor.name_placeholder')}
                    style={styles.input}
                />
            </div>

            {/* Category */}
            <div style={styles.inputGroup}>
                <label style={styles.label}>{t('meal_editor.category_label')}</label>
                <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    style={styles.select}
                >
                    {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                </select>
            </div>

            {/* Ingredients section */}
            <div style={styles.section}>
                <div style={styles.sectionHeader}>
                    <span style={styles.sectionTitle}>{t('meal_editor.ingredients')}</span>
                    <button
                        onClick={() => setShowPicker(true)}
                        style={styles.addBtn}
                    >
                        {t('meal_editor.add_ingredient')}
                    </button>
                </div>

                {items.length === 0 ? (
                    <div style={styles.emptyState}>
                        {t('meal_editor.no_ingredients')}
                    </div>
                ) : (
                    <div style={styles.itemsList}>
                        {items.map((item, index) => {
                            const factor = (item.unit === 'g' || item.unit === 'ml')
                                ? item.quantity / 100
                                : (item.quantity * (item.unit_weight || 100)) / 100
                            const itemKcal = Math.round(item.kcal_100 * factor)

                            return (
                                <div key={index} style={styles.itemRow}>
                                    <div style={styles.itemInfo}>
                                        <span style={styles.itemName}>{getLocalizedProductName(item)}</span>
                                        <span style={styles.itemMeta}>
                                            {item.quantity}{item.unit} • {itemKcal} kcal
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveIngredient(index)}
                                        style={styles.removeBtn}
                                    >
                                        ✕
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Live totals */}
            {items.length > 0 && (
                <div style={styles.totalsCard}>
                    <div style={styles.totalsTitle}>{t('meal_editor.totals')}</div>
                    <div style={styles.totalsGrid}>
                        <TotalStat label="Kcal" value={Math.round(totals.kcal)} />
                        <TotalStat label={t('food_modal.protein_label')} value={`${Math.round(totals.protein * 10) / 10}g`} />
                        <TotalStat label={t('food_modal.carbs_label')} value={`${Math.round(totals.carbs * 10) / 10}g`} />
                        <TotalStat label={t('food_modal.fat_label')} value={`${Math.round(totals.fat * 10) / 10}g`} />
                    </div>
                </div>
            )}

            {/* Ingredient picker modal (Portal to escape parent transform/overflow) */}
            {showPicker && createPortal(
                <div style={{ ...styles.pickerOverlay, zIndex: 2000 }} onClick={() => setShowPicker(false)}>
                    <div style={styles.pickerModal} onClick={e => e.stopPropagation()}>
                        <div style={styles.pickerHeader}>
                            <h4 style={{ margin: 0 }}>{t('meal_editor.choose_ingredient')}</h4>
                            <button onClick={() => setShowPicker(false)} style={styles.closeBtn}>✕</button>
                        </div>

                        {!selectedProduct ? (
                            <>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    placeholder={t('meal_editor.search_placeholder')}
                                    style={styles.searchInput}
                                    autoFocus
                                />
                                <div style={styles.productList}>
                                    {filteredProducts.map(product => (
                                        <button
                                            key={product.id}
                                            onClick={() => setSelectedProduct(product)}
                                            style={styles.productBtn}
                                        >
                                            <span>{language === 'en' && product.name_en ? product.name_en : product.name_nl}</span>
                                            <span style={styles.productKcal}>{product.kcal_100} kcal/100g</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={styles.selectedProduct}>
                                    <strong>{language === 'en' && selectedProduct.name_en ? selectedProduct.name_en : selectedProduct.name_nl}</strong>
                                </div>
                                <div style={styles.quantityRow}>
                                    <div style={styles.quantityGroup}>
                                        <label style={styles.label}>{t('meal_editor.amount')}</label>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={quantity}
                                            onChange={e => setQuantity(e.target.value)}
                                            style={styles.quantityInput}
                                        />
                                    </div>
                                    <div style={styles.unitGroup}>
                                        <label style={styles.label}>{t('meal_editor.unit')}</label>
                                        <select
                                            value={unit}
                                            onChange={e => setUnit(e.target.value)}
                                            style={styles.unitSelect}
                                        >
                                            <option value="g">{t('common.gram')}</option>
                                            <option value="ml">{t('common.ml')}</option>
                                            {selectedProduct.unit_name && (
                                                <option value={selectedProduct.unit_name}>{selectedProduct.unit_name}</option>
                                            )}
                                            <option value="portie">{t('common.portions')}</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={styles.pickerActions}>
                                    <button
                                        onClick={() => setSelectedProduct(null)}
                                        style={styles.cancelBtn}
                                    >
                                        {t('meal_editor.back')}
                                    </button>
                                    <button
                                        onClick={handleAddIngredient}
                                        style={styles.confirmBtn}
                                    >
                                        {t('meal_editor.add')}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}

function TotalStat({ label, value }) {
    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{label}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-primary)' }}>{value}</div>
        </div>
    )
}

const styles = {
    container: {
        padding: '1rem',
        paddingBottom: '2rem'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1.5rem'
    },
    backBtn: {
        background: 'none',
        border: 'none',
        fontSize: '1.5rem',
        cursor: 'pointer',
        padding: 0
    },
    title: {
        flex: 1,
        margin: 0,
        fontSize: '1.25rem'
    },
    saveBtn: {
        background: 'var(--color-primary)',
        color: '#333333',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    error: {
        background: 'rgba(220, 38, 38, 0.1)',
        color: '#dc2626',
        padding: '0.75rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        fontSize: '0.9rem'
    },
    inputGroup: {
        marginBottom: '1rem'
    },
    label: {
        display: 'block',
        marginBottom: '0.5rem',
        fontSize: '0.9rem',
        color: 'var(--color-text-muted)'
    },
    input: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid var(--color-border)',
        borderRadius: '10px',
        fontSize: '1rem',
        background: 'var(--color-bg)'
    },
    select: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid var(--color-border)',
        borderRadius: '10px',
        fontSize: '1rem',
        background: 'var(--color-bg)'
    },
    section: {
        marginTop: '1.5rem'
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem'
    },
    sectionTitle: {
        fontSize: '1rem',
        fontWeight: '600'
    },
    addBtn: {
        background: 'var(--color-primary)',
        color: '#333333',
        border: 'none',
        padding: '0.4rem 0.75rem',
        borderRadius: '6px',
        fontSize: '0.85rem',
        fontWeight: '500',
        cursor: 'pointer'
    },
    emptyState: {
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--color-text-muted)',
        background: 'var(--color-bg)',
        borderRadius: '12px',
        border: '1px dashed var(--color-border)'
    },
    itemsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    },
    itemRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem',
        background: 'var(--color-surface)',
        borderRadius: '10px',
        border: '1px solid var(--color-border)'
    },
    itemInfo: {
        display: 'flex',
        flexDirection: 'column'
    },
    itemName: {
        fontWeight: '600',
        fontSize: '0.95rem'
    },
    itemMeta: {
        fontSize: '0.8rem',
        color: 'var(--color-text-muted)'
    },
    removeBtn: {
        background: 'none',
        border: 'none',
        color: 'var(--color-text-muted)',
        fontSize: '1rem',
        cursor: 'pointer',
        padding: '0.25rem'
    },
    totalsCard: {
        marginTop: '1.5rem',
        padding: '1rem',
        background: 'var(--color-bg)',
        borderRadius: '12px'
    },
    totalsTitle: {
        fontSize: '0.85rem',
        color: 'var(--color-text-muted)',
        marginBottom: '0.5rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    totalsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.5rem'
    },
    pickerOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 100
    },
    pickerModal: {
        background: '#fff',
        width: '100%',
        maxWidth: '480px',
        maxHeight: '80vh',
        borderRadius: '20px 20px 0 0',
        padding: '1.5rem',
        overflow: 'auto'
    },
    pickerHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        fontSize: '1.25rem',
        color: 'var(--color-text-muted)',
        cursor: 'pointer'
    },
    searchInput: {
        width: '100%',
        padding: '0.75rem 1rem',
        border: '1px solid var(--color-border)',
        borderRadius: '10px',
        fontSize: '1rem',
        marginBottom: '1rem'
    },
    productList: {
        maxHeight: '300px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    },
    productBtn: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem',
        background: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: '10px',
        cursor: 'pointer',
        textAlign: 'left'
    },
    productKcal: {
        fontSize: '0.8rem',
        color: 'var(--color-text-muted)'
    },
    selectedProduct: {
        padding: '1rem',
        background: 'var(--color-bg)',
        borderRadius: '10px',
        marginBottom: '1rem'
    },
    quantityRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        marginBottom: '1rem'
    },
    quantityGroup: {},
    unitGroup: {},
    quantityInput: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid var(--color-border)',
        borderRadius: '10px',
        fontSize: '1.25rem',
        fontWeight: '600'
    },
    unitSelect: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid var(--color-border)',
        borderRadius: '10px',
        fontSize: '1rem'
    },
    pickerActions: {
        display: 'flex',
        gap: '0.75rem'
    },
    cancelBtn: {
        flex: 1,
        padding: '0.75rem',
        border: '1px solid var(--color-border)',
        borderRadius: '10px',
        background: 'transparent',
        fontSize: '1rem',
        cursor: 'pointer'
    },
    confirmBtn: {
        flex: 1,
        padding: '0.75rem',
        border: 'none',
        borderRadius: '10px',
        background: 'var(--color-primary)',
        color: '#333333',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer'
    }
}
