import React, { useCallback, useEffect, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { requestCommunity } from '../utils/communityApi'

function QueueItem({ item, type, onApprove, onRemove, t }) {
    const text = type === 'post'
        ? `${item.title}\n\n${item.body}`
        : item.body

    return (
        <article style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '0.75rem'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.6rem' }}>
                <strong style={{ fontSize: '0.9rem' }}>{item.author_name || t('community.anonymous')}</strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                    {new Date(item.created_at).toLocaleDateString()}
                </span>
            </div>
            <p style={{ whiteSpace: 'pre-wrap', margin: '0 0 1rem', lineHeight: 1.5, fontSize: '0.9rem' }}>{text}</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-primary" onClick={() => onApprove(type, item.id)}>{t('community.moderation_approve')}</button>
                <button className="btn" onClick={() => onRemove(type, item.id)}>{t('community.moderation_remove')}</button>
            </div>
        </article>
    )
}

export default function CommunityModerationPanel({ token, onBack }) {
    const { t } = useLanguage()
    const [queue, setQueue] = useState({ pendingPosts: [], pendingComments: [], reports: [] })
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [busyKey, setBusyKey] = useState('')

    const refresh = useCallback(async () => {
        setIsLoading(true)
        setError('')
        try {
            setQueue(await requestCommunity('moderation', { token }))
        } catch (requestError) {
            setError(requestError.message)
        } finally {
            setIsLoading(false)
        }
    }, [token])

    useEffect(() => { refresh() }, [refresh])

    const moderateItem = async (contentType, contentId, action) => {
        const key = `${contentType}:${contentId}`
        setBusyKey(key)
        try {
            await requestCommunity(`moderation/${action}`, {
                token,
                method: 'POST',
                body: { contentType, contentId }
            })
            await refresh()
        } catch (requestError) {
            setError(requestError.message)
        } finally {
            setBusyKey('')
        }
    }

    const resolveReport = async (reportId, removeContent = false, contentType, contentId) => {
        const key = `report:${reportId}`
        setBusyKey(key)
        try {
            if (removeContent && contentType && contentId) {
                await requestCommunity('moderation/remove', {
                    token,
                    method: 'POST',
                    body: { contentType, contentId }
                })
            }
            await requestCommunity('moderation/resolve-report', {
                token,
                method: 'POST',
                body: { reportId }
            })
            await refresh()
        } catch (requestError) {
            setError(requestError.message)
        } finally {
            setBusyKey('')
        }
    }

    const reportedContentText = report => {
        if (!report.content) return t('community.moderation_content_unavailable')
        return report.content_type === 'post'
            ? `${report.content.title}\n\n${report.content.body}`
            : report.content.body
    }

    return (
        <div className="container" style={{ padding: '1rem 0 8rem' }}>
            <button onClick={onBack} className="btn" style={{ marginBottom: '1rem' }}>
                ← {t('community.back')}
            </button>
            <h1 style={{ fontSize: '1.4rem', margin: '0 0 1rem' }}>{t('community.moderation_title')}</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                {t('community.moderation_sla')}
            </p>

            {error && <p role="alert" style={{ color: '#b3261e' }}>{error}</p>}
            {isLoading && <p>{t('common.loading')}</p>}

            {!isLoading && (
                <>
                    <section style={{ marginTop: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.05rem' }}>
                            {t('community.moderation_pending')} ({queue.pendingPosts.length + queue.pendingComments.length})
                        </h2>
                        {queue.pendingPosts.map(item => (
                            <QueueItem
                                key={`post:${item.id}`}
                                item={item}
                                type="post"
                                t={t}
                                onApprove={(type, id) => moderateItem(type, id, 'approve')}
                                onRemove={(type, id) => moderateItem(type, id, 'remove')}
                            />
                        ))}
                        {queue.pendingComments.map(item => (
                            <QueueItem
                                key={`comment:${item.id}`}
                                item={item}
                                type="comment"
                                t={t}
                                onApprove={(type, id) => moderateItem(type, id, 'approve')}
                                onRemove={(type, id) => moderateItem(type, id, 'remove')}
                            />
                        ))}
                        {queue.pendingPosts.length + queue.pendingComments.length === 0 && (
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{t('community.moderation_empty')}</p>
                        )}
                    </section>

                    <section style={{ marginTop: '2rem' }}>
                        <h2 style={{ fontSize: '1.05rem' }}>{t('community.moderation_reports')} ({queue.reports.length})</h2>
                        {queue.reports.map(report => (
                            <article key={report.id} style={{
                                background: 'var(--color-surface)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                padding: '1rem',
                                marginBottom: '0.75rem'
                            }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                                    {t(`community.report_type_${report.content_type}`)} · {new Date(report.created_at).toLocaleDateString()}
                                </div>
                                <p style={{ whiteSpace: 'pre-wrap', margin: '0 0 0.5rem', lineHeight: 1.5 }}>{reportedContentText(report)}</p>
                                {report.reason && <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{t('community.report_reason')}: {report.reason}</p>}
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {report.content && (
                                        <button
                                            className="btn"
                                            disabled={busyKey === `report:${report.id}`}
                                            onClick={() => resolveReport(report.id, true, report.content_type, report.content_id)}
                                        >
                                            {t('community.moderation_remove_and_resolve')}
                                        </button>
                                    )}
                                    <button
                                        className="btn btn-primary"
                                        disabled={busyKey === `report:${report.id}`}
                                        onClick={() => resolveReport(report.id)}
                                    >
                                        {t('community.moderation_resolve')}
                                    </button>
                                </div>
                            </article>
                        ))}
                        {queue.reports.length === 0 && (
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{t('community.moderation_no_reports')}</p>
                        )}
                    </section>
                </>
            )}
        </div>
    )
}
