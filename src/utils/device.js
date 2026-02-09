
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'allignd_device_id';

/**
 * Gets the unique device ID for this browser.
 * Generates one if it doesn't exist.
 */
export const getDeviceId = () => {
    let deviceId = localStorage.getItem(STORAGE_KEY);

    if (!deviceId) {
        deviceId = uuidv4();
        localStorage.setItem(STORAGE_KEY, deviceId);
    }

    return deviceId;
};
