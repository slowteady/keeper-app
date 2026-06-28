import { useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { router, usePathname } from 'expo-router';
import { useEffect, useRef } from 'react';

import { notificationQueries } from '@/entities/notification';
import { useCurrentUser } from '@/features/auth';
import { globalToast } from '@/shared/lib';
import { resolveNotificationPath } from '@/shared/lib/deeplink';

import { useNotificationPermission } from '../model/use-notification-permission';
import { useRegisterPushToken } from '../model/use-register-push-token';
import { useUnreadCount } from '../model/use-unread-count';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: false,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false
  })
});

const routeFromData = (data: Record<string, unknown> | undefined) => {
  if (!data) return;
  const refType = typeof data.refType === 'string' ? data.refType : null;
  const refId = typeof data.refId === 'string' ? data.refId : null;
  const type = typeof data.type === 'string' ? data.type : null;
  const path = resolveNotificationPath(refType, refId, type);
  if (path) router.push(path as never);
};

export const NotificationGate = () => {
  const { isLoggedIn } = useCurrentUser();
  const { requestOnce } = useNotificationPermission();
  const { count } = useUnreadCount();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  useRegisterPushToken(isLoggedIn);

  useEffect(() => {
    requestOnce();
  }, [requestOnce]);

  useEffect(() => {
    Notifications.setBadgeCountAsync(count).catch(() => undefined);
  }, [count]);

  useEffect(() => {
    Notifications.getLastNotificationResponseAsync().then((response) => {
      routeFromData(response?.notification.request.content.data as Record<string, unknown> | undefined);
    });

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      routeFromData(response.notification.request.content.data as Record<string, unknown> | undefined);
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      queryClient.invalidateQueries({ queryKey: [...notificationQueries.all(), 'list'] });
      queryClient.invalidateQueries({ queryKey: [...notificationQueries.all(), 'unread-count'] });

      if (pathnameRef.current?.startsWith('/notifications')) return;
      globalToast(notification.request.content.title ?? '새 알림이 도착했어요');
    });

    return () => subscription.remove();
  }, [queryClient]);

  return null;
};
