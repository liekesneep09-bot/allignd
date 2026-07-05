import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'nl.allignd.app',
  appName: 'Allignd',
  webDir: 'dist',
  // Use the live Vercel backend for API calls
  server: {
    // On native, we load the built web assets from disk.
    // API calls use absolute URLs (see src/utils/platform.js)
    androidScheme: 'https',
  },
  plugins: {
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#FFFFFF',
    },
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#FFFFFF',
    preferredContentMode: 'mobile',
  },
  android: {
    backgroundColor: '#FFFFFF',
  },
};

export default config;
