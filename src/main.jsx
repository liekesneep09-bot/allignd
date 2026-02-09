import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Debug Env Vars (Dev Only)
if (import.meta.env.DEV) {
    const url = import.meta.env.VITE_SUPABASE_URL
    console.log("Supabase URL:", url ? url.substring(0, 15) + "..." : "MISSING")
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
