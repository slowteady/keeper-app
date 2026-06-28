import Constants from 'expo-constants';
import { PermissionStatus } from 'expo-modules-core';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';

import { notificationApi, PushPlatformDto } from '@/entities/notification';
import { logger } from '@/shared/lib';

import { useNotificationPermission } from './use-notification-permission';

const resolvePlatform = (): PushPlatformDto | null => {
  if (Platform.OS === 'ios') return 'IOS';
  if (Platform.OS === 'android') return 'ANDROID';
  return null;
};

const getProjectId = (): string | undefined =>
  Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

export const useRegisterPushToken = (enabled: boolean) => {
  const { isGranted, check } = useNotificationPermission();
  const lastTokenRef = useRef<string | null>(null);

  const register = useCallback(async () => {
    if (!enabled) return;
    try {
      const status = await check();
      if (status !== PermissionStatus.GRANTED) return;

      const platform = resolvePlatform();
      const projectId = getProjectId();
      if (!platform || !projectId) return;

      const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
      if (!token || token === lastTokenRef.current) return;

      await notificationApi.registerPushToken({ token, platform });
      lastTokenRef.current = token;
    } catch (error) {
      logger.log('[notification] push token register skipped', error);
    }
  }, [enabled, check]);

  useEffect(() => {
    if (enabled && isGranted) register();
  }, [enabled, isGranted, register]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active') register();
    });
    return () => subscription.remove();
  }, [register]);

  return { register };
};
