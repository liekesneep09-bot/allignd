
const API_URL = '/api'; // Relative path, proxied by Vite

export const api = {
    /**
     * Bootstrap app state from backend logs
     * @param {string} deviceId - Device identifier
     * @param {string} [authToken] - Optional auth token for logged-in users
     */
    async bootstrap(deviceId, authToken) {
        const headers = {
            'X-Device-Id': deviceId
        }

        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`
        }

        const res = await fetch(`${API_URL}/bootstrap`, { headers });

        if (!res.ok) {
            throw new Error(`Bootstrap failed: ${res.statusText}`);
        }

        return res.json();
    },

    /**
     * Send a single log entry to the backend
     * @param {Object} options
     * @param {string} [options.deviceId] - Device identifier
     * @param {string} [options.userId] - User identifier (from auth)
     * @param {string} options.type - Log type (food, cycle, workout, profile_update)
     * @param {Object} options.data - Log data
     * @param {string} [options.date] - Date string
     */
    async log({ deviceId, userId, type, data, date = new Date().toISOString() }) {
        const body = { date, type, data }
        if (deviceId) body.deviceId = deviceId
        if (userId) body.userId = userId

        const res = await fetch(`${API_URL}/log`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            throw new Error(`Log failed: ${res.statusText}`);
        }

        return res.json();
    },

    /**
     * Sync a batch of logs (e.g. from offline storage)
     */
    async syncBatch(deviceId, logs) {
        const res = await fetch(`${API_URL}/logs/batch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                deviceId,
                logs
            })
        });

        if (!res.ok) {
            throw new Error(`Batch sync failed: ${res.statusText}`);
        }

        return res.json();
    }
};
