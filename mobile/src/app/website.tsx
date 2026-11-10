import { useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

export default function WebsiteScreen() {
  const [hasLoadError, setHasLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <Stack.Screen options={{ title: 'Allignd website', headerShown: true }} />
      <StatusBar style="dark" />
      <WebView
        key={reloadKey}
        source={{ uri: 'https://www.allignd.fit' }}
        style={styles.webView}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        allowsBackForwardNavigationGestures
        startInLoadingState
        renderLoading={() => (
          <View style={styles.stateView}>
            <Text style={styles.wordmark}>Allignd</Text>
            <ActivityIndicator color="#FF8FA3" size="small" style={styles.spinner} />
          </View>
        )}
        onLoadStart={() => setHasLoadError(false)}
        onError={() => setHasLoadError(true)}
      />
      {hasLoadError && (
        <View style={styles.errorOverlay}>
          <View style={styles.stateView}>
            <Text style={styles.wordmark}>Allignd</Text>
            <Text style={styles.title}>Geen verbinding</Text>
            <Text style={styles.description}>Controleer je internetverbinding en probeer het opnieuw.</Text>
            <View style={styles.button}>
              <Button color="#B05669" title="Opnieuw proberen" onPress={() => { setHasLoadError(false); setReloadKey((key) => key + 1); }} />
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  webView: { flex: 1 },
  stateView: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, backgroundColor: '#FFFFFF' },
  wordmark: { color: '#262326', fontSize: 32, fontWeight: '700', letterSpacing: -1 },
  title: { color: '#262326', fontSize: 20, fontWeight: '600', textAlign: 'center', marginTop: 36 },
  description: { color: '#777277', fontSize: 16, lineHeight: 24, textAlign: 'center', marginTop: 12, maxWidth: 320 },
  spinner: { marginTop: 20 },
  button: { marginTop: 20 },
  errorOverlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
});
