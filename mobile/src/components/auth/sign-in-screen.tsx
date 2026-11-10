import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { AppText, Card, Field, InlineMessage, NativeButton } from '@/components/ui';
import { colors, spacing } from '@/theme';

export function SignInScreen() {
  const router = useRouter();
  const { signIn, signUp, enterPreview, configurationError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setMessage(null);
    if (!email.trim() || !email.includes('@')) {
      setError('Vul een geldig e-mailadres in.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Je wachtwoord moet minimaal 6 tekens bevatten.');
      return;
    }

    setPending(true);
    try {
      if (creatingAccount) {
        const hasSession = await signUp(email, password);
        if (!hasSession) {
          setMessage('Je account is aangemaakt. Bevestig je e-mailadres via de link in je mailbox en log daarna in.');
          setCreatingAccount(false);
        }
      } else {
        await signIn(email, password);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Inloggen is niet gelukt. Probeer het opnieuw.');
    } finally {
      setPending(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.lg, width: '100%', maxWidth: 520, alignSelf: 'center' }}
      >
        <View style={{ alignItems: 'center', gap: spacing.sm }}>
          <AppText variant="largeTitle" style={{ color: colors.primary }}>Allignd</AppText>
          <AppText variant="label" style={{ textAlign: 'center' }}>Jouw cyclus, voeding en dagelijkse check-in op één plek.</AppText>
        </View>

        <Card>
          <AppText variant="title">{creatingAccount ? 'Account maken' : 'Welkom terug'}</AppText>
          <Field label="E-mailadres" value={email} onChangeText={setEmail} placeholder="jij@voorbeeld.nl" keyboardType="email-address" />
          <Field label="Wachtwoord" value={password} onChangeText={setPassword} placeholder="Minimaal 6 tekens" secureTextEntry />
          {configurationError && <InlineMessage error>{configurationError}</InlineMessage>}
          {error && <InlineMessage error>{error}</InlineMessage>}
          {message && <InlineMessage>{message}</InlineMessage>}
          <NativeButton label={creatingAccount ? 'Account maken' : 'Inloggen'} onPress={() => void submit()} loading={pending} />
          <NativeButton
            label={creatingAccount ? 'Ik heb al een account' : 'Nieuw bij Allignd? Account maken'}
            onPress={() => { setCreatingAccount((value) => !value); setError(null); setMessage(null); }}
            variant="text"
            disabled={Boolean(configurationError)}
          />
        </Card>

        <Card>
          <AppText variant="heading">Eerst rustig rondkijken?</AppText>
          <AppText variant="label">Bekijk het scherm met voorbeeldgegevens. De demo verandert of bewaart niets in je account.</AppText>
          <NativeButton label="Bekijk de demo" onPress={enterPreview} variant="outlined" />
        </Card>

        <NativeButton label="Bekijk de onboarding" onPress={() => router.push('/onboarding-preview' as Href)} variant="text" />
        <NativeButton label="Open de bestaande website" onPress={() => router.push('/website' as Href)} variant="text" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
