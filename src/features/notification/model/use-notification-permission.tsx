import { PermissionResponse, PermissionStatus } from 'expo-modules-core';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { logger } from '@/shared/lib';
import { usePermission } from '@/shared/model';

type PermissionState = {
  status: PermissionStatus | undefined;
  canAskAgain: boolean;
};

const getPermissions = () => Notifications.getPermissionsAsync() as unknown as Promise<PermissionResponse>;
const requestPermissions = () => Notifications.requestPermissionsAsync() as unknown as Promise<PermissionResponse>;

const toState = (res: PermissionResponse): PermissionState => ({
  status: res.status,
  canAskAgain: res.canAskAgain
});

export const useNotificationPermission = () => {
  const { goSettingMenu } = usePermission();
  const [state, setState] = useState<PermissionState>({ status: undefined, canAskAgain: true });
  const requestedRef = useRef(false);

  const check = useCallback(async () => {
    try {
      const res = await getPermissions();
      setState(toState(res));
      return res.status;
    } catch (error) {
      logger.error('[notification] getPermissionsAsync failed', error);
      return undefined;
    }
  }, []);

  const requestOnce = useCallback(async () => {
    if (requestedRef.current) return state.status;
    requestedRef.current = true;
    try {
      const current = await getPermissions();
      if (current.status !== PermissionStatus.UNDETERMINED) {
        setState(toState(current));
        return current.status;
      }
      const res = await requestPermissions();
      setState(toState(res));
      return res.status;
    } catch (error) {
      logger.error('[notification] requestPermissionsAsync failed', error);
      return undefined;
    }
  }, [state.status]);

  useEffect(() => {
    check();
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active') check();
    });
    return () => subscription.remove();
  }, [check]);

  const isGranted = state.status === PermissionStatus.GRANTED;

  return {
    status: state.status,
    canAskAgain: state.canAskAgain,
    isGranted,
    check,
    requestOnce,
    openSettings: goSettingMenu
  };
};
