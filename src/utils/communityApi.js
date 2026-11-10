import { getApiBaseUrl } from './platform'

export async function requestCommunity(path, { token, method = 'GET', body } = {}) {
    const response = await fetch(`${getApiBaseUrl()}/api/community/${path}`, {
        method,
        headers: {
            Authorization: `Bearer ${token}`,
            ...(body ? { 'Content-Type': 'application/json' } : {})
        },
        ...(body ? { body: JSON.stringify(body) } : {})
    })

    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
        const error = new Error(result.error || 'Community request failed')
        error.code = result.code
        error.status = response.status
        throw error
    }

    return result
}
