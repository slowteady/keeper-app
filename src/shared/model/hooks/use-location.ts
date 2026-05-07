import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { logger } from '@/shared/lib';

type Coords = {
  latitude: number;
  longitude: number;
};

export const useLocation = () => {
  const [userLocation, setUserLocation] = useState<Coords>();
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus>();
  const initializedRef = useRef(false);

  const [, requestPermission] = Location.useForegroundPermissions();

  const checkPermission = useCallback(async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    setPermissionStatus(status);
    return status;
  }, []);

  const fetchLocation = useCallback(async () => {
    try {
      const { coords } = await Location.getCurrentPositionAsync();
      const location = { latitude: coords.latitude, longitude: coords.longitude };

      if (!initializedRef.current) {
        setUserLocation(location);
        initializedRef.current = true;
      }

      return location;
    } catch (error) {
      // kCLErrorLocationUnknown 등 일시적 실패는 무시하고 다음 트리거(AppState 등)에 재시도
      logger.warn('[useLocation] getCurrentPositionAsync failed', error);
      return undefined;
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const { status } = await requestPermission();
        setPermissionStatus(status);

        if (status === Location.PermissionStatus.GRANTED) {
          await fetchLocation();
        }
      } catch (error) {
        logger.warn('[useLocation] init failed', error);
      }
    };

    init();
  }, [requestPermission, fetchLocation]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState !== 'active') return;

      try {
        const status = await checkPermission();

        if (status === Location.PermissionStatus.GRANTED && !initializedRef.current) {
          await fetchLocation();
        }
      } catch (error) {
        logger.warn('[useLocation] resume failed', error);
      }
    });

    return () => subscription.remove();
  }, [checkPermission, fetchLocation]);

  const isGranted = permissionStatus === Location.PermissionStatus.GRANTED;

  return { userLocation, isGranted, permissionStatus };
};
