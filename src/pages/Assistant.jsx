import React, { useState, useEffect, useRef } from 'react'
import { useUser } from '../context/UserContext'

export default function Assistant() {
    const { currentPhase, currentDay, user, targets, getTodayStats } = useUser()
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef(null)

    // Load history from local storage
    useEffect(() => {
        const saved = localStorage.getItem('cyclus_chat_history')
        if (saved) {
            setMessages(JSON.parse(saved))
        } else {
            // Initial welcome message
            setMessages([{
                role: 'assistant',
                content: 'Hoi! Ik ben jouw cyclus-assistent. Hoe voel je je vandaag? Ik kan je helpen met training, voeding of gewoon even luisteren.'
            }])
        }
    }, [])

    // Save history
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('cyclus_chat_history', JSON.stringify(messages))
        }
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const handleSend = async (e) => {
        e.preventDefault()
        if (!input.trim()) return

        const userMessage = { role: 'user', content: input }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        // Prepare context
        const stats = getTodayStats()
        const context = {
            cycle_phase: currentPhase,
            cycle_day: currentDay,
            fitness_goal: 'Algemeen (MVP)', // In a real app, this would be from settings
            macro_targets: targets,
            macro_progress_today: stats
        }

        try {
            const res = await fetch("/api/assistant", {

                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: userMessage.content
                })
            })

            const data = await res.json()

            if (data.error) {
                throw new Error(data.error)
            }

            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])

        } catch (error) {
            console.error(error)
            let errorMessage = 'Sorry, ik kan even geen verbinding maken.'

            if (error.message.includes('No API Key')) {
                errorMessage = 'De OpenAI API key ontbreekt. Voeg deze toe in het .env bestand.'
            } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                errorMessage = 'Kan de server niet bereiken. Controleer of "node server.js" draait.'
            }

            setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }])
        } finally {
            setIsLoading(false)
        }
    }

    const quickChips = [
        "Wat kan ik vandaag het beste trainen?",
        "Ik heb veel trek in zoet",
        "Ik voel me moe",
        "Wat is een goed recept?"
    ]

    return (
        <div className="container" style={{ paddingBottom: '90px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header style={{ marginTop: '0', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Assistent</h2>
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>Jouw coach voor elke fase.</p>
            </header>

            {/* Chat Area */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                paddingBottom: '1rem'
            }}>
                {messages.map((msg, idx) => (
                    <div key={idx} style={{
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        background: msg.role === 'user' ? 'var(--color-primary)' : '#FFF',
                        color: msg.role === 'user' ? '#FFF' : 'var(--color-text)',
                        padding: '0.75rem 1rem',
                        borderRadius: '16px',
                        borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                        borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '16px',
                        maxWidth: '85%',
                        boxShadow: msg.role === 'assistant' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                        lineHeight: '1.5'
                    }}>
                        {msg.content}
                    </div>
                ))}
                {isLoading && (
                    <div style={{ alignSelf: 'flex-start', background: '#FFF', padding: '0.75rem', borderRadius: '16px', color: 'var(--color-text-muted)' }}>
                        Typen...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ paddingTop: '1rem' }}>
                {/* Chips */}
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '0.5rem' }}>
                    {quickChips.map(chip => (
                        <button
                            key={chip}
                            onClick={() => setInput(chip)}
                            style={{
                                whiteSpace: 'nowrap',
                                background: 'var(--color-bg)',
                                border: '1px solid var(--color-border)',
                                padding: '0.4rem 0.8rem',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                color: 'var(--color-text)'
                            }}
                        >
                            {chip}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Typ een bericht..."
                        style={{
                            flex: 1,
                            padding: '0.8rem',
                            borderRadius: '24px',
                            border: '1px solid var(--color-border)',
                            fontSize: '1rem',
                            background: '#FFF'
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        style={{
                            background: 'var(--color-primary)',
                            color: '#FFF',
                            border: 'none',
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            opacity: (!input.trim() || isLoading) ? 0.5 : 1
                        }}
                    >
                        ➤
                    </button>
                </form>
            </div>
        </div>
    )
}
