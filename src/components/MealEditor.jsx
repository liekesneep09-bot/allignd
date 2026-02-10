import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useUser } from '../context/UserContext'

/**
 * MealEditor Component
 * Create or edit a meal with ingredients
 */
export default function MealEditor({ meal, onSave, onClose }) {
    const { getAccessToken } = useAuth()
    const { user } = useUser()

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
            : item.quantity
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
        const matchesName = food.name_nl.toLowerCase().includes(term)
        const matchesAlias = food.aliases?.some(a => a.toLowerCase().includes(term))
        return matchesName || matchesAlias
    }).slice(0, 20)

    const handleAddIngredient = () => {
        if (!selectedProduct || !quantity) return

        const newItem = {
            product_id: selectedProduct.id,
            product_name: selectedProduct.name_nl,
            quantity: parseFloat(quantity),
            unit: unit,
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
            setError('Vul een naam in')
            return
        }
        if (items.length === 0) {
            setError('Voeg minimaal 1 ingredient toe')
            return
        }

        setSaving(true)
        setError('')

        try {
            // Get user ID
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (!authUser) throw new Error("Je moet ingelogd zijn")

            // Clean items and ensure numbers
            const cleanItems = items.map(item => ({
                product_id: item.product_id,
                product_name: item.product_name,
                quantity: parseFloat(item.quantity) || 0,
                unit: item.unit,
                kcal_100: parseFloat(item.kcal_100) || 0,
                protein_100: parseFloat(item.protein_100) || 0,
                carbs_100: parseFloat(item.carbs_100) || 0,
                fat_100: parseFloat(item.fat_100) || 0
            }))

            // Snapshot totals
            const mealTotals = cleanItems.reduce((acc, item) => {
                const factor = (item.unit === 'g' || item.unit === 'ml') ? item.quantity / 100 : item.quantity
                return {
                    kcal: acc.kcal + (item.kcal_100 * factor),
                    protein: acc.protein + (item.protein_100 * factor),
                    carbs: acc.carbs + (item.carbs_100 * factor),
                    fat: acc.fat + (item.fat_100 * factor)
                }
            }, { kcal: 0, protein: 0, carbs: 0, fat: 0 })

            // Construct payload
            const payload = {
                user_id: authUser.id,
                name: name.trim(),
                category: category || null,
                items: cleanItems,
                totals: {
                    kcal: Math.round(mealTotals.kcal),
                    protein: parseFloat(mealTotals.protein.toFixed(1)),
                    carbs: parseFloat(mealTotals.carbs.toFixed(1)),
                    fat: parseFloat(mealTotals.fat.toFixed(1))
                }
            }

            if (meal?.id) {
                payload.id = meal.id // Update existing
                payload.updated_at = new Date().toISOString()
            }

            const { data, error } = await supabase
                .from('recipes')
                .upsert(payload)
                .select()
                .single()

            if (error) throw error

            onSave(data)
        } catch (e) {
            console.error("Save error:", e)
            setError(e.message || 'Fout bij opslaan')
        } finally {
            setSaving(false)
        }
    }

    const categories = [
        { value: '', label: 'Geen categorie' },
        { value: 'ontbijt', label: 'Ontbijt' },
        { value: 'lunch', label: 'Lunch' },
        { value: 'diner', label: 'Diner' },
        { value: 'snack', label: 'Snack' }
    ]

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <button onClick={onClose} style={styles.backBtn}>←</button>
                <h3 style={styles.title}>{meal?.id ? 'Bewerk gerecht' : 'Nieuw gerecht'}</h3>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        ...styles.saveBtn,
                        opacity: saving ? 0.5 : 1
                    }}
                >
                    {saving ? 'Opslaan...' : 'Opslaan'}
                </button>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            {/* Name input */}
            <div style={styles.inputGroup}>
                <label style={styles.label}>Naam</label>
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Bijv. Kipfilet met rijst"
                    style={styles.input}
                />
            </div>

            {/* Category */}
            <div style={styles.inputGroup}>
                <label style={styles.label}>Categorie (optioneel)</label>
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
                    <span style={styles.sectionTitle}>Ingrediënten</span>
                    <button
                        onClick={() => setShowPicker(true)}
                        style={styles.addBtn}
                    >
                        + Toevoegen
                    </button>
                </div>

                {items.length === 0 ? (
                    <div style={styles.emptyState}>
                        Nog geen ingrediënten toegevoegd
                    </div>
                ) : (
                    <div style={styles.itemsList}>
                        {items.map((item, index) => {
                            const factor = (item.unit === 'g' || item.unit === 'ml')
                                ? item.quantity / 100
                                : item.quantity
                            const itemKcal = Math.round(item.kcal_100 * factor)

                            return (
                                <div key={index} style={styles.itemRow}>
                                    <div style={styles.itemInfo}>
                                        <span style={styles.itemName}>{item.product_name}</span>
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
                    <div style={styles.totalsTitle}>Totalen</div>
                    <div style={styles.totalsGrid}>
                        <TotalStat label="Kcal" value={Math.round(totals.kcal)} />
                        <TotalStat label="Eiwit" value={`${Math.round(totals.protein * 10) / 10}g`} />
                        <TotalStat label="Koolh" value={`${Math.round(totals.carbs * 10) / 10}g`} />
                        <TotalStat label="Vet" value={`${Math.round(totals.fat * 10) / 10}g`} />
                    </div>
                </div>
            )}

            {/* Ingredient picker modal (Portal to escape parent transform/overflow) */}
            {showPicker && createPortal(
                <div style={{ ...styles.pickerOverlay, zIndex: 2000 }} onClick={() => setShowPicker(false)}>
                    <div style={styles.pickerModal} onClick={e => e.stopPropagation()}>
                        <div style={styles.pickerHeader}>
                            <h4 style={{ margin: 0 }}>Kies ingredient</h4>
                            <button onClick={() => setShowPicker(false)} style={styles.closeBtn}>✕</button>
                        </div>

                        {!selectedProduct ? (
                            <>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="Zoek product..."
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
                                            <span>{product.name_nl}</span>
                                            <span style={styles.productKcal}>{product.kcal_100} kcal/100g</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={styles.selectedProduct}>
                                    <strong>{selectedProduct.name_nl}</strong>
                                </div>
                                <div style={styles.quantityRow}>
                                    <div style={styles.quantityGroup}>
                                        <label style={styles.label}>Hoeveelheid</label>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={e => setQuantity(e.target.value)}
                                            style={styles.quantityInput}
                                        />
                                    </div>
                                    <div style={styles.unitGroup}>
                                        <label style={styles.label}>Eenheid</label>
                                        <select
                                            value={unit}
                                            onChange={e => setUnit(e.target.value)}
                                            style={styles.unitSelect}
                                        >
                                            <option value="g">gram</option>
                                            <option value="ml">ml</option>
                                            <option value="stuk">stuks</option>
                                            <option value="portie">porties</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={styles.pickerActions}>
                                    <button
                                        onClick={() => setSelectedProduct(null)}
                                        style={styles.cancelBtn}
                                    >
                                        Terug
                                    </button>
                                    <button
                                        onClick={handleAddIngredient}
                                        style={styles.confirmBtn}
                                    >
                                        Toevoegen
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
        color: '#fff',
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
        color: '#fff',
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
        color: '#fff',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer'
    }
}
