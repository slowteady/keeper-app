import { PermissionStatus } from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { ShelterDto, useGetShelterCounts, useGetShelters, useShelterMap } from '@/entities';
import { calcMapRadiusKm, CameraParams } from '@/shared';

export const useHomeShelterSection = () => {
  const [enabled, setEnabled] = useState(false);
  const [shelterList, setShelterList] = useState<ShelterDto[]>([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState<number>();

  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);

  const { camera, setCamera, distance, setDistance, initialLocation, mapRef, permissionStatus } = useShelterMap();

  const { data: shelters, isLoading } = useGetShelters(
    {
      latitude: camera?.latitude || 0,
      longitude: camera?.longitude || 0,
      distance,
      userLatitude: initialLocation?.latitude || 0,
      userLongitude: initialLocation?.longitude || 0
    },
    { enabled: !!camera && enabled }
  );

  const { data: shelterCounts } = useGetShelterCounts(
    {
      latitude: initialLocation?.latitude || 0,
      longitude: initialLocation?.longitude || 0
    },
    { enabled: !!initialLocation }
  );

  const toggleMapEnabled = useCallback(() => {
    setEnabled((prev) => !prev);
  }, []);

  const refetchShelterList = useCallback(
    (params?: CameraParams) => {
      if (!params) return null;

      const { latitude, longitude, zoom, region } = params;
      setCamera({ latitude, longitude, zoom });
      setSelectedMarkerId(undefined);

      const radius = calcMapRadiusKm({
        longitudeDelta: region?.longitudeDelta || 0,
        latitudeDelta: region?.latitudeDelta || 0,
        latitude,
        longitude
      });
      setDistance(radius);
    },
    [setCamera, setDistance]
  );

  const toggleTapMarker = useCallback(
    (data: ShelterDto) => {
      opacity.value = withTiming(0, { duration: 100 });
      translateY.value = withTiming(50, { duration: 300 });

      setTimeout(() => {
        opacity.value = withTiming(1, { duration: 300 });
        translateY.value = withTiming(0, {
          duration: 300,
          easing: Easing.out(Easing.exp)
        });
      }, 200);

      setSelectedMarkerId(data.id);
      setShelterList((prev) => [data, ...prev.filter((item) => item.id !== data.id)]);
    },
    [opacity, translateY]
  );

  useEffect(() => {
    if (!shelters) return;
    setShelterList(shelters);
  }, [shelters]);

  const animatedListStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }]
  }));

  const hasLocationStatus = permissionStatus?.status === PermissionStatus.GRANTED;

  return {
    data: { shelters, shelterCounts },
    refs: { mapRef },
    state: { camera, selectedMarkerId, shelterList },
    actions: { toggleMapEnabled, refetchShelterList, toggleTapMarker },
    flags: { hasLocationStatus, isLoading },
    styles: { animatedListStyle }
  };
};
