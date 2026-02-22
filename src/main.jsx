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

// FORCE UNREGISTER SERVICE WORKER (Fix for Stale Cache)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
        for (let registration of registrations) {
            registration.unregister()
            console.log('Service Worker Unregistered')
        }
    })
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
