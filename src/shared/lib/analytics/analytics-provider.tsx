import { usePathname } from 'expo-router';
import { PostHogProvider, usePostHog } from 'posthog-react-native';
import { PropsWithChildren, useEffect } from 'react';

const POSTHOG_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';
const ENABLED = !__DEV__ && !!POSTHOG_KEY;

const normalizeScreen = (pathname: string): string =>
  pathname
    .split('/')
    .map((segment) => (/^\d+$/.test(segment) || segment.length >= 20 ? '[id]' : segment))
    .join('/');

const ScreenTracker = () => {
  const posthog = usePostHog();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) posthog.screen(normalizeScreen(pathname), { path: pathname });
  }, [pathname, posthog]);

  return null;
};

export const AnalyticsProvider = ({ children }: PropsWithChildren) => (
  <PostHogProvider
    apiKey={POSTHOG_KEY ?? 'phc_disabled'}
    options={{ host: POSTHOG_HOST, disabled: !ENABLED }}
    autocapture={{ captureTouches: false, captureScreens: false }}
  >
    <ScreenTracker />
    {children}
  </PostHogProvider>
);
