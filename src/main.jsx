import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App2.jsx'
import './index.css'

// Debug Env Vars (Dev Only)
if (import.meta.env.DEV) {
    const url = import.meta.env.VITE_SUPABASE_URL
    console.log("Supabase URL:", url ? url.substring(0, 15) + "..." : "MISSING")
}

// GLOBAL ERROR HANDLER FOR DEBUGGING WHITE SCREENS
window.onerror = function (msg, url, line, col, error) {
    // Ignore minor resize observation errors
    if (msg.includes('ResizeObserver')) return;

    alert("CRASH ERROR: " + msg + "\nLine: " + line);
};

window.onunhandledrejection = function (event) {
    alert("PROMISE ERROR: " + event.reason);
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
