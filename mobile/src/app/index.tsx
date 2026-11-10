import AlligndApp from '@/components/dom/allignd-app';
import { SignInScreen } from '@/components/auth/sign-in-screen';
import { ScreenState } from '@/components/ui';
import { useAuth } from '@/context/auth-context';

export default function HomeScreen() {
  const { session, loading, isPreview, signOut } = useAuth();
  if (loading) return <ScreenState loading title="Allignd wordt geopend" description="Je veilige sessie controleren…" />;
  if (!session && !isPreview) return <SignInScreen />;

  return (
    <AlligndApp
      preview={isPreview && !session}
      initialView="today"
      accessToken={session?.access_token}
      refreshToken={session?.refresh_token}
      onPreviewSignOut={async () => { await signOut(); }}
      dom={{ style: { flex: 1 }, contentInsetAdjustmentBehavior: 'never' }}
    />
  );
}
