import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Debug Env Vars (Dev Only)
if (import.meta.env.DEV) {
    const url = import.meta.env.VITE_SUPABASE_URL
    console.log("Supabase URL:", url ? url.substring(0, 15) + "..." : "MISSING")
}

// Global error handlers (silent in production, log to console)
window.onerror = function (msg, url, line, col, error) {
    if (msg.includes('ResizeObserver')) return;
    console.error('[Allignd Error]', msg, 'Line:', line);
};

window.onunhandledrejection = function (event) {
    console.error('[Allignd Promise Error]', event.reason);
};

// PWA Service Worker is managed by vite-plugin-pwa

// Staging bookmarks open the demo with its sample cycle day and requested tab.
if (import.meta.env.DEV && /^#(?:eten|voeding|beweging)-dag-(?:[1-9]|1[0-9]|2[0-8])$/.test(window.location.hash)) {
    window.location.replace('./preview.html' + window.location.search + window.location.hash)
} else {
    ReactDOM.createRoot(document.getElementById('root')).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    )
}
