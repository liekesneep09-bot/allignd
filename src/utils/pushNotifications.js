import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from './supabaseClient';
import { isNativePlatform, getPlatform } from './platform';

let isRegistered = false;

/**
 * Request permission and register for push notifications
 */
export async function registerPushNotifications() {
  // Only register on native platforms
  if (!isNativePlatform()) {
    console.log('Push notifications only available on native platforms');
    return;
  }

  if (isRegistered) return;

  try {
    // Request permission
    const permissionResult = await PushNotifications.requestPermissions();

    if (permissionResult.receive === 'granted') {
      // Register with Apple / Google
      await PushNotifications.register();

      // Listen for token
      PushNotifications.addListener('registration', async (token) => {
        console.log('Push token:', token.value);
        await savePushToken(token.value);
      });

      // Listen for registration error
      PushNotifications.addListener('registrationError', (error) => {
        console.error('Push registration error:', error);
      });

      // Listen for incoming notifications
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push notification received:', notification);
        dispatchNavigationEvent(notification);
      });

      // Listen for notification action
      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push notification action performed:', notification);
        dispatchNavigationEvent(notification);
      });

      isRegistered = true;
    } else {
      console.log('Push notification permission denied');
    }
  } catch (error) {
    console.error('Error registering push notifications:', error);
  }
}

/**
 * Dispatch a custom event so the app shell can navigate to the right view
 * when a notification is tapped while the app is open or brought to the foreground.
 */
function dispatchNavigationEvent(notification) {
  const data = notification?.notification?.data || notification?.data || {};
  const view = typeof data.view === 'string' ? data.view : 'today';
  window.dispatchEvent(new CustomEvent('allignd-push-navigate', { detail: { view } }));
}

/**
 * Save push token to Supabase user profile
 */
async function savePushToken(token) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ push_token: token, push_platform: getPlatform() })
      .eq('id', user.id);

    if (error) {
      console.error('Error saving push token:', error);
    } else {
      console.log('Push token saved successfully');
    }
  } catch (error) {
    console.error('Error in savePushToken:', error);
  }
}

/**
 * Remove push token from profile (on logout)
 */
export async function removePushToken() {
  // Only remove on native platforms
  if (!isNativePlatform()) {
    return;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('profiles')
      .update({ push_token: null, push_platform: null })
      .eq('id', user.id);

    await PushNotifications.removeAllListeners();
    isRegistered = false;
  } catch (error) {
    console.error('Error removing push token:', error);
  }
}
