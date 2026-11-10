import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/context/auth-context';
import { TodayProvider } from '@/context/today-context';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <TodayProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="guide" options={{ title: 'Cyclusgids', headerShown: false }} />
            <Stack.Screen name="website" options={{ headerShown: false }} />
          </Stack>
        </TodayProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
