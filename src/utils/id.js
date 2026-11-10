import { v4 as uuidv4 } from 'uuid';

/**
 * Create a UUID in browsers and native WebViews.
 * The uuid package falls back to crypto.getRandomValues when randomUUID is absent.
 */
export function createId() {
    return uuidv4();
}
