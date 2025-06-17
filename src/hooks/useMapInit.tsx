import { Camera, NaverMapViewRef } from '@mj-studio/react-native-naver-map';
import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

export const useMapInit = (readOnly?: boolean) => {
  const [camera, setCamera] = useState<Camera>();
  const [distance, setDistance] = useState(7);
  const [initialLocation, setInitialLocation] = useState<Camera>();
  const [permissionStatus, setPermissionStatus] = useState<Location.LocationPermissionResponse | null>(null);
  const mapRef = useRef<NaverMapViewRef | null>(null);

  const [, requestPermission] = Location.useForegroundPermissions();

  const updateLocation = useCallback(async () => {
    const permissions = await Location.getForegroundPermissionsAsync();
    setPermissionStatus(permissions);

    if (permissions.status === Location.PermissionStatus.GRANTED && !readOnly) {
      const { coords } = await Location.getCurrentPositionAsync();
      mapRef.current?.animateCameraTo({ latitude: coords.latitude, longitude: coords.longitude });
      mapRef.current?.setLocationTrackingMode('Follow');
      setInitialLocation({ latitude: coords.latitude, longitude: coords.longitude });
      setCamera({ latitude: coords.latitude, longitude: coords.longitude, zoom: 11 });
    }
  }, [readOnly]);

  useEffect(() => {
    const getCurrentLocation = async () => {
      const response = await requestPermission();
      if (response.status === Location.PermissionStatus.GRANTED) {
        updateLocation();
      }
    };

    getCurrentLocation();
  }, [requestPermission, updateLocation]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active') {
        updateLocation();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [updateLocation]);

  return { camera, setCamera, distance, setDistance, initialLocation, permissionStatus, mapRef };
};
