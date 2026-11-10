declare module '@/components/dom/allignd-app' {
  import type { ComponentType } from 'react';
  import type { DOMProps } from 'expo/dom';

  type AlligndAppProps = {
    preview?: boolean;
    initialView?: 'today' | 'community' | 'fitness' | 'recipes' | 'guide';
    showOnboarding?: boolean;
    accessToken?: string | null;
    refreshToken?: string | null;
    onPreviewSignOut?: () => Promise<void>;
    dom?: DOMProps;
  };

  const AlligndApp: ComponentType<AlligndAppProps>;
  export default AlligndApp;
}
