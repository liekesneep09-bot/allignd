import React, { useState, useEffect, useCallback } from 'react'
import { useUser } from '../context/UserContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabaseClient'

const CATEGORIES = [
    { key: 'alles', label: 'Alles' },
    { key: 'voeding', label: 'Voeding' },
    { key: 'training', label: 'Training' },
    { key: 'cyclus', label: 'Cyclus' },
    { key: 'algemeen', label: 'Algemeen' }
]

const PHASE_LABELS = {
    menstrual: 'Menstruatie',
    follicular: 'Folliculair',
    ovulatory: 'Ovulatie',
    luteal: 'Luteaal'
}

const PHASE_COLORS = {
    menstrual: '#a86473',
    follicular: '#5bc4d4',
    ovulatory: '#f5a89c',
    luteal: '#e2a9f1'
}

function timeAgo(dateStr) {
    const now = new Date()
    const date = new Date(dateStr)
    const diff = Math.floor((now - date) / 1000)
    if (diff < 60) return 'zojuist'
    if (diff < 3600) return `${Math.floor(diff / 60)}min`
    if (diff < 86400) return `${Math.floor(diff / 3600)}u`
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`
    return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
}

// ─── Post Card ───────────────────────────────────────────
function PostCard({ post, onOpen, onLike, isLiked }) {
    return (
        <div
            onClick={() => onOpen(post)}
            style={{
                background: 'var(--color-surface)',
                borderRadius: '12px',
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                transition: 'transform 0.1s',
                border: '1px solid var(--color-border)'
            }}
        >
            {/* Header: author + time */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                        width: '26px', height: '26px', borderRadius: '50%',
                        background: post.is_anonymous ? '#E8ECEF' : 'var(--color-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', color: 'white', fontWeight: '600',
                        flexShrink: 0
                    }}>
                        {post.is_anonymous ? '🌸' : (post.author_name?.[0] || '?').toUpperCase()}
                    </span>
                    <div>
                        <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--color-text)' }}>
                            {post.is_anonymous ? 'Anoniem' : post.author_name}
                        </span>
                        {post.phase_tag && (
                            <span style={{
                                marginLeft: '0.5rem',
                                fontSize: '0.7rem',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                background: `${PHASE_COLORS[post.phase_tag]}20`,
                                color: PHASE_COLORS[post.phase_tag],
                                fontWeight: '500'
                            }}>
                                {PHASE_LABELS[post.phase_tag]}
                            </span>
                        )}
                    </div>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{timeAgo(post.created_at)}</span>
            </div>

            {/* Category pill */}
            <div style={{ marginBottom: '0.2rem' }}>
                <span style={{
                    fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em',
                    color: 'var(--color-text-muted)', fontWeight: '500'
                }}>
                    {post.category}
                </span>
            </div>

            {/* Title only – full body visible on click */}
            <h3 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: 0, color: 'var(--color-text)' }}>
                {post.title}
            </h3>

            {/* Footer: likes + comments */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', alignItems: 'center' }}>
                <button
                    onClick={(e) => { e.stopPropagation(); onLike(post.id) }}
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                        display: 'flex', alignItems: 'center', gap: '4px',
                        color: isLiked ? '#ef4444' : 'var(--color-text-muted)',
                        fontSize: '0.85rem'
                    }}
                >
                    {isLiked ? '❤️' : '🤍'} {post.likes_count || 0}
                </button>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    💬 {post.comments_count || 0}
                </span>
            </div>
        </div>
    )
}

// ─── Main Community Component ────────────────────────────
export default function Community() {
    const { user, currentPhase } = useUser()
    const { user: authUser } = useAuth()

    const [view, setView] = useState('feed')  // 'feed', 'detail', 'new'
    const [posts, setPosts] = useState([])
    const [selectedPost, setSelectedPost] = useState(null)
    const [comments, setComments] = useState([])
    const [myLikes, setMyLikes] = useState(new Set()) // post IDs the user has liked
    const [myCommentLikes, setMyCommentLikes] = useState(new Set())
    const [myCommentedPosts, setMyCommentedPosts] = useState(new Set()) // post IDs the user commented on
    const [activeCategory, setActiveCategory] = useState('alles')
    const [sortOrder, setSortOrder] = useState('nieuwste') // 'nieuwste', 'oudste', 'populairst'
    const [activeFilter, setActiveFilter] = useState(null) // null | 'mijn' | 'geliked' | 'gereageerd'
    const [isLoading, setIsLoading] = useState(false)
    const [commentText, setCommentText] = useState('')

    // New post form
    const [newTitle, setNewTitle] = useState('')
    const [newBody, setNewBody] = useState('')
    const [newCategory, setNewCategory] = useState('algemeen')
    const [newPhaseTag, setNewPhaseTag] = useState(currentPhase || null)
    const [newAnonymous, setNewAnonymous] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [deleteConfirmId, setDeleteConfirmId] = useState(null) // post ID awaiting delete confirmation

    // ─── Fetch Posts ──────────────────────────────────────
    const fetchPosts = useCallback(async () => {
        setIsLoading(true)
        try {
            // For 'populairst' we still fetch by date then sort client-side
            const orderCol = 'created_at'
            const ascending = sortOrder === 'oudste'

            let query = supabase
                .from('community_posts')
                .select('*')
                .order(orderCol, { ascending })
                .limit(50)

            if (activeCategory !== 'alles') {
                // Use ilike to make it case-insensitive, just in case some posts 
                // were saved with "Voeding" instead of "voeding"
                query = query.ilike('category', activeCategory)
            }

            const { data, error } = await query
            if (error) throw error

            let sorted = data || []
            if (sortOrder === 'populairst') {
                sorted = [...sorted].sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
            }
            setPosts(sorted)
        } catch (e) {
            console.error('Failed to fetch posts:', e)
        } finally {
            setIsLoading(false)
        }
    }, [activeCategory, sortOrder])

    // ─── Fetch My Likes ──────────────────────────────────
    const fetchMyLikes = useCallback(async () => {
        if (!authUser) return
        try {
            const { data } = await supabase
                .from('community_likes')
                .select('post_id, comment_id')
                .eq('user_id', authUser.id)

            const postLikes = new Set()
            const commentLikes = new Set()
                ; (data || []).forEach(l => {
                    if (l.post_id) postLikes.add(l.post_id)
                    if (l.comment_id) commentLikes.add(l.comment_id)
                })
            setMyLikes(postLikes)
            setMyCommentLikes(commentLikes)
        } catch (e) {
            console.error('Failed to fetch likes:', e)
        }
    }, [authUser])

    // ─── Fetch My Commented Posts ─────────────────────────
    const fetchMyCommentedPosts = useCallback(async () => {
        if (!authUser) return
        try {
            const { data } = await supabase
                .from('community_comments')
                .select('post_id')
                .eq('user_id', authUser.id)
            const postIds = new Set((data || []).map(c => c.post_id))
            setMyCommentedPosts(postIds)
        } catch (e) {
            console.error('Failed to fetch commented posts:', e)
        }
    }, [authUser])

    useEffect(() => { fetchPosts() }, [fetchPosts])
    useEffect(() => { fetchMyLikes() }, [fetchMyLikes])
    useEffect(() => { fetchMyCommentedPosts() }, [fetchMyCommentedPosts])

    // ─── Toggle Like on Post ─────────────────────────────
    const togglePostLike = async (postId) => {
        if (!authUser) return
        const liked = myLikes.has(postId)

        // Optimistic
        setMyLikes(prev => {
            const next = new Set(prev)
            liked ? next.delete(postId) : next.add(postId)
            return next
        })
        setPosts(prev => prev.map(p =>
            p.id === postId ? { ...p, likes_count: (p.likes_count || 0) + (liked ? -1 : 1) } : p
        ))
        if (selectedPost?.id === postId) {
            setSelectedPost(prev => ({ ...prev, likes_count: (prev.likes_count || 0) + (liked ? -1 : 1) }))
        }

        try {
            if (liked) {
                await supabase.from('community_likes').delete().match({ user_id: authUser.id, post_id: postId })
            } else {
                await supabase.from('community_likes').insert({ user_id: authUser.id, post_id: postId })
            }
        } catch (e) {
            console.error('Like failed:', e)
            // Rollback
            setMyLikes(prev => {
                const next = new Set(prev)
                liked ? next.add(postId) : next.delete(postId)
                return next
            })
            fetchPosts()
        }
    }

    // ─── Toggle Like on Comment ──────────────────────────
    const toggleCommentLike = async (commentId) => {
        if (!authUser) return
        const liked = myCommentLikes.has(commentId)

        setMyCommentLikes(prev => {
            const next = new Set(prev)
            liked ? next.delete(commentId) : next.add(commentId)
            return next
        })
        setComments(prev => prev.map(c =>
            c.id === commentId ? { ...c, likes_count: (c.likes_count || 0) + (liked ? -1 : 1) } : c
        ))

        try {
            if (liked) {
                await supabase.from('community_likes').delete().match({ user_id: authUser.id, comment_id: commentId })
            } else {
                await supabase.from('community_likes').insert({ user_id: authUser.id, comment_id: commentId })
            }
        } catch (e) {
            console.error('Comment like failed:', e)
        }
    }

    // ─── Open Post Detail ────────────────────────────────
    const openPost = async (post) => {
        setSelectedPost(post)
        setView('detail')

        try {
            const { data } = await supabase
                .from('community_comments')
                .select('*')
                .eq('post_id', post.id)
                .order('created_at', { ascending: true })
            setComments(data || [])
        } catch (e) {
            console.error('Failed to fetch comments:', e)
        }
    }

    // ─── Submit Comment ──────────────────────────────────
    const submitComment = async () => {
        if (!commentText.trim() || !authUser || !selectedPost) return
        const authorName = user?.name || 'Gebruiker'

        const newComment = {
            post_id: selectedPost.id,
            user_id: authUser.id,
            author_name: authorName,
            body: commentText.trim()
        }

        setIsSubmitting(true)
        try {
            const { data, error } = await supabase
                .from('community_comments')
                .insert(newComment)
                .select()
                .single()
            if (error) throw error

            setComments(prev => [...prev, data])
            setSelectedPost(prev => ({ ...prev, comments_count: (prev.comments_count || 0) + 1 }))
            setMyCommentedPosts(prev => new Set(prev).add(selectedPost.id))
            setCommentText('')
        } catch (e) {
            console.error('Failed to post comment:', e)
            alert('Reactie plaatsen mislukt')
        } finally {
            setIsSubmitting(false)
        }
    }

    // ─── Submit New Post ─────────────────────────────────
    const submitPost = async () => {
        if (!newTitle.trim() || !newBody.trim() || !authUser) return
        const authorName = newAnonymous ? 'Anoniem' : (user?.name || 'Gebruiker')

        setIsSubmitting(true)
        try {
            const { error } = await supabase.from('community_posts').insert({
                user_id: authUser.id,
                author_name: authorName,
                is_anonymous: newAnonymous,
                category: newCategory,
                phase_tag: newPhaseTag,
                title: newTitle.trim(),
                body: newBody.trim()
            })
            if (error) throw error

            // Reset form & go back
            setNewTitle('')
            setNewBody('')
            setNewCategory('algemeen')
            setNewPhaseTag(currentPhase || null)
            setNewAnonymous(false)
            setView('feed')
            fetchPosts()
        } catch (e) {
            console.error('Failed to create post:', e)
            alert('Post plaatsen mislukt')
        } finally {
            setIsSubmitting(false)
        }
    }

    // ─── Delete own post ─────────────────────────────────
    const confirmDeletePost = (postId) => {
        setDeleteConfirmId(postId)
    }

    const cancelDelete = () => {
        setDeleteConfirmId(null)
    }

    const executeDelete = async () => {
        if (!deleteConfirmId || !authUser) return
        const postId = deleteConfirmId
        setDeleteConfirmId(null)
        try {
            const { error } = await supabase
                .from('community_posts')
                .delete()
                .eq('id', postId)
                .eq('user_id', authUser.id)
            if (error) {
                console.error('Delete failed:', error)
                alert('Verwijderen mislukt: ' + error.message)
                return
            }
            setView('feed')
            fetchPosts()
        } catch (e) {
            console.error('Failed to delete post:', e)
            alert('Verwijderen mislukt')
        }
    }

    // ───────────────────────────────────────────────────────
    // VIEW: New Post
    // ───────────────────────────────────────────────────────
    if (view === 'new') {
        return (
            <div className="container" style={{ paddingBottom: '120px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <button
                        onClick={() => setView('feed')}
                        style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '0.95rem', cursor: 'pointer' }}
                    >
                        ← Terug
                    </button>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Nieuw bericht</h2>
                    <div style={{ width: '48px' }} />
                </div>

                {/* Category selector */}
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--color-text-muted)', marginBottom: '0.5rem', display: 'block' }}>Categorie</label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {CATEGORIES.filter(c => c.key !== 'alles').map(cat => (
                            <button
                                key={cat.key}
                                onClick={() => setNewCategory(cat.key)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '20px',
                                    border: newCategory === cat.key ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                    background: newCategory === cat.key ? 'rgba(112,193,163,0.1)' : 'var(--color-surface)',
                                    color: newCategory === cat.key ? 'var(--color-primary)' : 'var(--color-text)',
                                    fontSize: '0.85rem',
                                    fontWeight: newCategory === cat.key ? '600' : '400',
                                    cursor: 'pointer'
                                }}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Phase tag */}
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--color-text-muted)', marginBottom: '0.5rem', display: 'block' }}>
                        Fase-label <span style={{ fontWeight: '400' }}>(optioneel)</span>
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {Object.entries(PHASE_LABELS).map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => setNewPhaseTag(newPhaseTag === key ? null : key)}
                                style={{
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '16px',
                                    border: newPhaseTag === key ? `2px solid ${PHASE_COLORS[key]}` : '1px solid var(--color-border)',
                                    background: newPhaseTag === key ? `${PHASE_COLORS[key]}20` : 'var(--color-surface)',
                                    color: newPhaseTag === key ? PHASE_COLORS[key] : 'var(--color-text-muted)',
                                    fontSize: '0.8rem',
                                    fontWeight: newPhaseTag === key ? '600' : '400',
                                    cursor: 'pointer'
                                }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Title */}
                <div style={{ marginBottom: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Titel van je bericht"
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        maxLength={120}
                        style={{
                            width: '100%', padding: '0.875rem 1rem', borderRadius: '12px',
                            border: '1px solid var(--color-border)', background: 'var(--color-surface)',
                            color: 'var(--color-text)', fontSize: '1rem', fontWeight: '500'
                        }}
                    />
                </div>

                {/* Body */}
                <div style={{ marginBottom: '1rem' }}>
                    <textarea
                        placeholder="Wat wil je delen?"
                        value={newBody}
                        onChange={e => setNewBody(e.target.value)}
                        rows={5}
                        style={{
                            width: '100%', padding: '0.875rem 1rem', borderRadius: '12px',
                            border: '1px solid var(--color-border)', background: 'var(--color-surface)',
                            color: 'var(--color-text)', fontSize: '0.95rem', lineHeight: '1.5',
                            resize: 'vertical', fontFamily: 'inherit'
                        }}
                    />
                </div>

                {/* Anonymous toggle */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.875rem 1rem', borderRadius: '12px',
                    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                    marginBottom: '1.5rem'
                }}>
                    <div>
                        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Post anoniem</span>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                            Je naam wordt niet getoond
                        </p>
                    </div>
                    <button
                        onClick={() => setNewAnonymous(!newAnonymous)}
                        style={{
                            width: '48px', height: '28px', borderRadius: '14px',
                            background: newAnonymous ? 'var(--color-primary)' : '#E8ECEF',
                            border: 'none', cursor: 'pointer', position: 'relative',
                            transition: 'background 0.2s'
                        }}
                    >
                        <div style={{
                            width: '22px', height: '22px', borderRadius: '50%', background: 'white',
                            position: 'absolute', top: '3px',
                            left: newAnonymous ? '23px' : '3px',
                            transition: 'left 0.2s',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                        }} />
                    </button>
                </div>

                {/* Submit */}
                <button
                    onClick={submitPost}
                    disabled={!newTitle.trim() || !newBody.trim() || isSubmitting}
                    style={{
                        width: '100%', padding: '1rem', borderRadius: '14px',
                        border: 'none', background: 'var(--color-primary)', color: 'white',
                        fontSize: '1rem', fontWeight: '600', cursor: 'pointer',
                        opacity: (!newTitle.trim() || !newBody.trim() || isSubmitting) ? 0.5 : 1,
                        boxShadow: '0 4px 12px rgba(112,193,163,0.25)'
                    }}
                >
                    {isSubmitting ? 'Plaatsen...' : 'Plaats bericht'}
                </button>
            </div>
        )
    }

    // ───────────────────────────────────────────────────────
    // VIEW: Post Detail
    // ───────────────────────────────────────────────────────
    if (view === 'detail' && selectedPost) {
        const isOwner = authUser?.id === selectedPost.user_id
        console.log('[Circle] isOwner check:', { authUserId: authUser?.id, postUserId: selectedPost.user_id, isOwner })
        return (
            <div className="container" style={{ paddingBottom: '120px' }}>
                {/* Back */}
                <button
                    onClick={() => { setView('feed'); setComments([]); fetchPosts() }}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '0.95rem', cursor: 'pointer', marginBottom: '1rem' }}
                >
                    ← Terug
                </button>

                {/* Full Post */}
                <div style={{ background: 'var(--color-surface)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1rem', border: '1px solid var(--color-border)' }}>
                    {/* Author */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                background: selectedPost.is_anonymous ? '#E8ECEF' : 'var(--color-primary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.85rem', color: 'white', fontWeight: '600'
                            }}>
                                {selectedPost.is_anonymous ? '🌸' : (selectedPost.author_name?.[0] || '?').toUpperCase()}
                            </span>
                            <div>
                                <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>
                                    {selectedPost.is_anonymous ? 'Anoniem' : selectedPost.author_name}
                                </span>
                                {selectedPost.phase_tag && (
                                    <span style={{
                                        marginLeft: '0.5rem', fontSize: '0.7rem', padding: '2px 8px',
                                        borderRadius: '10px', background: `${PHASE_COLORS[selectedPost.phase_tag]}20`,
                                        color: PHASE_COLORS[selectedPost.phase_tag], fontWeight: '500'
                                    }}>
                                        {PHASE_LABELS[selectedPost.phase_tag]}
                                    </span>
                                )}
                            </div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{timeAgo(selectedPost.created_at)}</span>
                    </div>

                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: '500' }}>
                        {selectedPost.category}
                    </span>

                    <h2 style={{ fontSize: '1.15rem', fontWeight: '600', margin: '0.5rem 0', color: 'var(--color-text)' }}>
                        {selectedPost.title}
                    </h2>
                    <p style={{ fontSize: '0.95rem', color: 'var(--color-text)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                        {selectedPost.body}
                    </p>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
                        <button
                            onClick={() => togglePostLike(selectedPost.id)}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                                display: 'flex', alignItems: 'center', gap: '4px',
                                color: myLikes.has(selectedPost.id) ? '#ef4444' : 'var(--color-text-muted)',
                                fontSize: '0.9rem'
                            }}
                        >
                            {myLikes.has(selectedPost.id) ? '❤️' : '🤍'} {selectedPost.likes_count || 0}
                        </button>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                            💬 {comments.length}
                        </span>
                        {(isOwner || user?.isAdmin) && (
                            <button
                                onClick={() => confirmDeletePost(selectedPost.id)}
                                style={{
                                    marginLeft: 'auto', background: 'rgba(239,68,68,0.1)', border: 'none',
                                    color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer', padding: '0.3rem 0.6rem',
                                    borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.25rem'
                                }}
                            >
                                {user?.isAdmin && !isOwner && '🛡️ '}Verwijderen
                            </button>
                        )}
                    </div>
                </div>

                {/* Comments */}
                <h3 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--color-text)' }}>
                    Reacties ({comments.length})
                </h3>

                {comments.length === 0 && (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem 0' }}>
                        Nog geen reacties. Wees de eerste!
                    </p>
                )}

                {comments.map(comment => (
                    <div key={comment.id} style={{
                        background: 'var(--color-surface)', borderRadius: '12px', padding: '1rem',
                        marginBottom: '0.5rem', border: '1px solid var(--color-border)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                            <span style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--color-text)' }}>
                                {comment.author_name}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                                {timeAgo(comment.created_at)}
                            </span>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text)', lineHeight: '1.5', margin: 0 }}>
                            {comment.body}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                            <button
                                onClick={() => toggleCommentLike(comment.id)}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                    color: myCommentLikes.has(comment.id) ? '#ef4444' : 'var(--color-text-muted)',
                                    fontSize: '0.8rem'
                                }}
                            >
                                {myCommentLikes.has(comment.id) ? '❤️' : '🤍'} {comment.likes_count || 0}
                            </button>

                            {(comment.user_id === authUser?.id || user?.isAdmin) && (
                                <button
                                    onClick={() => {
                                        if (confirm('Wil je deze reactie verwijderen?')) {
                                            removeCommentFromUI(comment.id)
                                        }
                                    }}
                                    style={{
                                        background: 'none', border: 'none', color: '#ef4444',
                                        fontSize: '0.75rem', cursor: 'pointer', padding: '0.2rem 0.5rem',
                                        opacity: 0.7,
                                        display: 'flex', alignItems: 'center', gap: '4px'
                                    }}
                                    title="Reactie verwijderen"
                                >
                                    🗑️
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {/* Add comment */}
                <div style={{
                    position: 'fixed', bottom: '70px', left: 0, right: 0,
                    background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)',
                    padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem',
                    maxWidth: '480px', margin: '0 auto'
                }}>
                    <input
                        type="text"
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        placeholder="Schrijf een reactie..."
                        onKeyDown={e => e.key === 'Enter' && submitComment()}
                        style={{
                            flex: 1, padding: '0.7rem 1rem', borderRadius: '24px',
                            border: '1px solid var(--color-border)', background: 'var(--color-bg)',
                            color: 'var(--color-text)', fontSize: '0.9rem'
                        }}
                    />
                    <button
                        onClick={submitComment}
                        disabled={!commentText.trim() || isSubmitting}
                        style={{
                            background: 'var(--color-primary)', color: 'white', border: 'none',
                            width: '42px', height: '42px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', fontSize: '1.1rem',
                            opacity: (!commentText.trim() || isSubmitting) ? 0.5 : 1
                        }}
                    >
                        ➤
                    </button>
                </div>

                {/* Delete Confirmation Modal */}
                {deleteConfirmId && (
                    <div
                        onClick={cancelDelete}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.5)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            zIndex: 1000, padding: '1rem'
                        }}
                    >
                        <div
                            onClick={e => e.stopPropagation()}
                            style={{
                                background: 'var(--color-surface)', borderRadius: '16px',
                                padding: '1.5rem', maxWidth: '320px', width: '100%',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                                textAlign: 'center'
                            }}
                        >
                            <p style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--color-text)' }}>
                                Bericht verwijderen?
                            </p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
                                Dit kan niet ongedaan worden gemaakt.
                            </p>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    onClick={cancelDelete}
                                    style={{
                                        flex: 1, padding: '0.7rem', borderRadius: '12px',
                                        border: '1px solid var(--color-border)', background: 'var(--color-bg)',
                                        color: 'var(--color-text)', fontSize: '0.9rem', fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Annuleren
                                </button>
                                <button
                                    onClick={executeDelete}
                                    style={{
                                        flex: 1, padding: '0.7rem', borderRadius: '12px',
                                        border: 'none', background: '#ef4444',
                                        color: 'white', fontSize: '0.9rem', fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Verwijderen
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // ───────────────────────────────────────────────────────
    // VIEW: Feed (default)
    // ───────────────────────────────────────────────────────
    return (
        <div className="container" style={{ paddingBottom: '120px' }}>
            {/* Header */}
            <div style={{ marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.25rem' }}>The Circle</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Deel je ervaring. Stel je vraag. Groei samen.</p>
            </div>

            {/* Category tabs */}
            <div style={{
                display: 'flex', gap: '0.5rem', overflowX: 'auto',
                paddingBottom: '0.5rem', marginBottom: '0.75rem',
                msOverflowStyle: 'none', scrollbarWidth: 'none'
            }}>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.key}
                        onClick={() => setActiveCategory(cat.key)}
                        style={{
                            padding: '0.5rem 1rem', borderRadius: '20px', whiteSpace: 'nowrap',
                            border: activeCategory === cat.key ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                            background: activeCategory === cat.key ? 'rgba(112,193,163,0.1)' : 'var(--color-surface)',
                            color: activeCategory === cat.key ? 'var(--color-primary)' : 'var(--color-text)',
                            fontSize: '0.85rem', fontWeight: activeCategory === cat.key ? '600' : '400',
                            cursor: 'pointer', flexShrink: 0
                        }}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Sort selector + Mijn posts */}
            <div style={{
                display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', alignItems: 'center',
                overflowX: 'auto', paddingBottom: '0.5rem', msOverflowStyle: 'none', scrollbarWidth: 'none'
            }}>
                {/* Horizontal scroll container for all filters */}
                <div style={{ display: 'flex', gap: '0.4rem', minWidth: 'max-content' }}>
                    {[{ key: 'nieuwste', label: 'Nieuwste' }, { key: 'populairst', label: 'Populairst' }].map(opt => (
                        <button
                            key={opt.key}
                            onClick={() => {
                                setSortOrder(opt.key);
                                setActiveFilter(null);
                            }}
                            style={{
                                padding: '0.3rem 0.7rem', borderRadius: '14px', fontSize: '0.75rem',
                                border: 'none', cursor: 'pointer',
                                background: (sortOrder === opt.key && !activeFilter) ? 'var(--color-primary)' : 'transparent',
                                color: (sortOrder === opt.key && !activeFilter) ? 'white' : 'var(--color-text-muted)',
                                fontWeight: (sortOrder === opt.key && !activeFilter) ? '600' : '400',
                                transition: 'all 0.15s'
                            }}
                        >
                            {opt.label}
                        </button>
                    ))}

                    {/* Separator */}
                    <span style={{ width: '1px', height: '16px', background: 'var(--color-border)', margin: '0 0.2rem', alignSelf: 'center' }} />

                    {/* Personal filters */}
                    {[{ key: 'mijn', label: 'Mijn posts' }, { key: 'geliked', label: '♥' }, { key: 'gereageerd', label: '💬' }].map(f => (
                        <button
                            key={f.key}
                            onClick={() => setActiveFilter(prev => prev === f.key ? null : f.key)}
                            style={{
                                padding: '0.3rem 0.7rem', borderRadius: '14px', fontSize: '0.75rem',
                                border: activeFilter === f.key ? '1.5px solid var(--color-primary)' : 'none',
                                cursor: 'pointer',
                                background: activeFilter === f.key ? 'rgba(112,193,163,0.15)' : 'transparent',
                                color: activeFilter === f.key ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                fontWeight: activeFilter === f.key ? '600' : '400',
                                transition: 'all 0.15s',
                                whiteSpace: 'nowrap',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Posts */}
            {(() => {
                // Filter the fetched posts based on the active personal filter
                let displayPosts = posts
                if (activeFilter === 'mijn') {
                    displayPosts = posts.filter(p => p.user_id === authUser?.id)
                } else if (activeFilter === 'geliked') {
                    displayPosts = posts.filter(p => myLikes.has(p.id))
                } else if (activeFilter === 'gereageerd') {
                    displayPosts = posts.filter(p => myCommentedPosts.has(p.id))
                }

                const emptyMessages = {
                    mijn: 'Je hebt nog geen berichten geplaatst.',
                    geliked: 'Je hebt nog geen berichten geliked.',
                    gereageerd: 'Je hebt nog nergens op gereageerd.'
                }

                if (isLoading) {
                    return <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem 0' }}>Laden...</p>
                }
                if (displayPosts.length === 0) {
                    return (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
                            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💬</p>
                            <p style={{ fontSize: '1rem' }}>
                                {activeFilter
                                    ? emptyMessages[activeFilter]
                                    : `Nog geen berichten${activeCategory !== 'alles' ? ` in ${activeCategory}` : ''}.`}
                            </p>
                            <p style={{ fontSize: '0.9rem' }}>{activeFilter ? '' : 'Wees de eerste die iets deelt!'}</p>
                        </div>
                    )
                }
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {displayPosts.map(post => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onOpen={openPost}
                                onLike={togglePostLike}
                                isLiked={myLikes.has(post.id)}
                            />
                        ))}
                    </div>
                )
            })()}

            {/* FAB: New Post */}
            <button
                onClick={() => setView('new')}
                style={{
                    position: 'fixed', bottom: '90px', right: '20px',
                    width: '56px', height: '56px', borderRadius: '50%',
                    background: 'var(--color-primary)', color: 'white',
                    border: 'none', fontSize: '1.5rem', cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(112,193,163,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 50
                }}
            >
                +
            </button>
        </div>
    )
}
