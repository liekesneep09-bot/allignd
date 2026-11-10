import AlligndApp from '@/components/dom/allignd-app';
import { useRouter } from 'expo-router';

export default function OnboardingPreviewRoute() {
  const router = useRouter();

  return (
    <AlligndApp
      preview
      showOnboarding
      onPreviewSignOut={async () => { router.replace('/'); }}
      dom={{ style: { flex: 1 }, contentInsetAdjustmentBehavior: 'never' }}
    />
  );
}
