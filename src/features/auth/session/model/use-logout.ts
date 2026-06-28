import * as Sentry from '@sentry/react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useCallback } from 'react';

import { authQueries, logout, UserDto } from '@/entities/auth';
import { notificationApi } from '@/entities/notification';
import { getRefreshToken, globalToast, removeToken } from '@/shared/lib';

import { useSetIsAuthenticated } from '../../lib/auth-state';
import { signOutSocialSession } from '../../lib/sign-out-social-session';

const clearPushToken = async () => {
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return;
  await Notifications.getExpoPushTokenAsync({ projectId })
    .then(({ data }) => (data ? notificationApi.deletePushToken(data) : undefined))
    .catch(() => undefined);
};

export const useLogout = () => {
  const qc = useQueryClient();
  const setIsAuthenticated = useSetIsAuthenticated();

  const { mutateAsync, isPending } = useMutation({ mutationFn: logout });

  const handleLogout = useCallback(async () => {
    if (isPending) return;

    try {
      const cachedUser = qc.getQueryData<UserDto>(authQueries.me().queryKey);

      const refreshToken = await getRefreshToken();
      await clearPushToken();
      await mutateAsync(refreshToken ?? undefined);
      if (cachedUser?.socialType) {
        await signOutSocialSession(cachedUser.socialType);
      }
      await removeToken();
      Sentry.setUser(null);
      qc.removeQueries();

      setIsAuthenticated(false);
      router.dismissTo('/(tabs)/profile');
    } catch {
      globalToast('로그아웃하지 못했어요', 'fail');
    }
  }, [isPending, mutateAsync, qc, setIsAuthenticated]);

  return { logout: handleLogout, isPending };
};
