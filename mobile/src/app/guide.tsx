import AlligndApp from '@/components/dom/allignd-app';
import { SignInScreen } from '@/components/auth/sign-in-screen';
import { ScreenState } from '@/components/ui';
import { useAuth } from '@/context/auth-context';

export default function GuideRoute() {
  const { session, loading, isPreview, signOut } = useAuth();
  if (loading) return <ScreenState loading title="Je cyclus wordt geopend" description="Je gegevens controleren…" />;
  if (!session && !isPreview) return <SignInScreen />;

  return (
    <AlligndApp
      preview={isPreview && !session}
      initialView="guide"
      accessToken={session?.access_token}
      refreshToken={session?.refresh_token}
      onPreviewSignOut={async () => { await signOut(); }}
      dom={{ style: { flex: 1 }, contentInsetAdjustmentBehavior: 'never' }}
    />
  );
}
