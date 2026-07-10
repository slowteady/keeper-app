import { usePostHog } from 'posthog-react-native';
import { useMemo } from 'react';

import { AnalyticsEvent } from './events';

type Props = Record<string, string | number | boolean | null>;

export const useAnalytics = () => {
  const posthog = usePostHog() as ReturnType<typeof usePostHog> | undefined;

  return useMemo(
    () => ({
      track: (event: AnalyticsEvent, properties?: Props) => posthog?.capture(event, properties),
      screen: (name: string, properties?: Props) => posthog?.screen(name, properties),
      identify: (distinctId: string, properties?: Props) => posthog?.identify(distinctId, properties),
      reset: () => posthog?.reset()
    }),
    [posthog]
  );
};
