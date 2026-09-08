import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from './supabaseClient';
import { isNativePlatform } from './platform';

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
      });

      // Listen for notification action
      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push notification action performed:', notification);
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
 * Save push token to Supabase user profile
 */
async function savePushToken(token) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ push_token: token })
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
      .update({ push_token: null })
      .eq('id', user.id);

    await PushNotifications.removeAllListeners();
    isRegistered = false;
  } catch (error) {
    console.error('Error removing push token:', error);
  }
}
