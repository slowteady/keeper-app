import { usePathname } from 'expo-router';
import { PostHogProvider, usePostHog } from 'posthog-react-native';
import { PropsWithChildren, useEffect } from 'react';

import { subscribeDeeplink } from '../deeplink';
import { ANALYTICS_EVENT } from './events';

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

const DeeplinkTracker = () => {
  const posthog = usePostHog();

  useEffect(
    () =>
      subscribeDeeplink(({ type, id, utmSource, utmMedium, utmContent, initial }) =>
        posthog.capture(ANALYTICS_EVENT.deeplinkOpened, {
          type,
          id,
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_content: utmContent,
          initial
        })
      ),
    [posthog]
  );

  return null;
};

export const AnalyticsProvider = ({ children }: PropsWithChildren) => (
  <PostHogProvider
    apiKey={POSTHOG_KEY ?? 'phc_disabled'}
    options={{ host: POSTHOG_HOST, disabled: !ENABLED }}
    autocapture={{ captureTouches: false, captureScreens: false }}
  >
    <ScreenTracker />
    <DeeplinkTracker />
    {children}
  </PostHogProvider>
);
