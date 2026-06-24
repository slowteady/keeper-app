import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';

import { useCurrentUser } from '@/features/auth';
import { resolveNotificationPath } from '@/shared/lib/deeplink';

import { useNotificationPermission } from '../model/use-notification-permission';
import { useRegisterPushToken } from '../model/use-register-push-token';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
});

const routeFromData = (data: Record<string, unknown> | undefined) => {
  if (!data) return;
  const refType = typeof data.refType === 'string' ? data.refType : null;
  const refId = typeof data.refId === 'string' ? data.refId : null;
  const path = resolveNotificationPath(refType, refId);
  if (path) router.push(path as never);
};

export const NotificationGate = () => {
  const { isLoggedIn } = useCurrentUser();
  const { requestOnce } = useNotificationPermission();
  useRegisterPushToken(isLoggedIn);

  useEffect(() => {
    requestOnce();
  }, [requestOnce]);

  useEffect(() => {
    Notifications.getLastNotificationResponseAsync().then((response) => {
      routeFromData(response?.notification.request.content.data as Record<string, unknown> | undefined);
    });

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      routeFromData(response.notification.request.content.data as Record<string, unknown> | undefined);
    });

    return () => subscription.remove();
  }, []);

  return null;
};
