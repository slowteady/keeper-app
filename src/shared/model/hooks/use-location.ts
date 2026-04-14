import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

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
    const { coords } = await Location.getCurrentPositionAsync();
    const location = { latitude: coords.latitude, longitude: coords.longitude };

    if (!initializedRef.current) {
      setUserLocation(location);
      initializedRef.current = true;
    }

    return location;
  }, []);

  useEffect(() => {
    const init = async () => {
      const { status } = await requestPermission();
      setPermissionStatus(status);

      if (status === Location.PermissionStatus.GRANTED) {
        await fetchLocation();
      }
    };

    init();
  }, [requestPermission, fetchLocation]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active') {
        const status = await checkPermission();

        if (status === Location.PermissionStatus.GRANTED && !initializedRef.current) {
          await fetchLocation();
        }
      }
    });

    return () => subscription.remove();
  }, [checkPermission, fetchLocation]);

  const isGranted = permissionStatus === Location.PermissionStatus.GRANTED;

  return { userLocation, isGranted, permissionStatus };
};
