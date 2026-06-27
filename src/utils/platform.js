/**
 * Platform detection utilities for Capacitor native apps.
 * 
 * When the app runs inside a Capacitor webview (iOS/Android),
 * relative API paths like `/api/bootstrap` won't work because the
 * webview loads from `capacitor://localhost` (iOS) or `https://localhost` (Android),
 * not from our Vercel domain. This module detects the platform and
 * provides the correct base URL for API calls.
 */

/**
 * Check if the app is running as a native Capacitor app (iOS or Android).
 * Capacitor injects a global `Capacitor` object with a `isNativePlatform` flag.
 */
export function isNativePlatform() {
    return typeof window !== 'undefined' &&
        window.Capacitor &&
        window.Capacitor.isNativePlatform === true;
}

/**
 * Get the current platform: 'ios', 'android', or 'web'.
 */
export function getPlatform() {
    if (typeof window !== 'undefined' && window.Capacitor) {
        return window.Capacitor.getPlatform?.() || 'web';
    }
    return 'web';
}

/**
 * Get the base URL for API calls.
 * - On web (Vercel): returns '' (empty string) so `/api/bootstrap` works via proxy/same-origin.
 * - On native (Capacitor): returns the full Vercel production URL.
 */
export function getApiBaseUrl() {
    if (isNativePlatform()) {
        // In production, this points to the Vercel deployment
        return import.meta.env.VITE_API_BASE_URL || 'https://allignd.nl';
    }
    return '';
}
