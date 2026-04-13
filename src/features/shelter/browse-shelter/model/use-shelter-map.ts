import { useToastController } from '@tamagui/toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { PermissionStatus } from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { searchShelters, ShelterDto, shelterQueries } from '@/entities/shelter';
import { calcMapRadiusKm } from '@/shared/lib';
import { CameraParams, useMap } from '@/shared/model';

export const useShelterMap = () => {
  const [enabled, setEnabled] = useState(false);
  const [shelterList, setShelterList] = useState<ShelterDto[]>([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string>();

  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const { show } = useToastController();

  const { camera, setCamera, distance, setDistance, initialLocation, mapRef, permissionStatus } = useMap();

  const { data: shelters, isLoading } = useQuery({
    ...shelterQueries.list({
      latitude: camera?.latitude || 0,
      longitude: camera?.longitude || 0,
      distance,
      userLatitude: initialLocation?.latitude || 0,
      userLongitude: initialLocation?.longitude || 0
    }),
    enabled: !!camera && enabled
  });

  const { data: shelterCounts } = useQuery({
    ...shelterQueries.counts({
      latitude: initialLocation?.latitude || 0,
      longitude: initialLocation?.longitude || 0
    }),
    enabled: !!initialLocation
  });

  const { mutate, isPending } = useMutation({ mutationFn: searchShelters });

  const toggleMapEnabled = useCallback(() => {
    setEnabled((prev) => !prev);
  }, []);

  const refetchShelterList = useCallback(
    (params?: CameraParams) => {
      if (!params) return;

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

  const changeLocation = useCallback(
    (item: { x: string; y: string }) => {
      if (mapRef && mapRef.current) {
        const { x, y } = item;
        mapRef.current.animateCameraTo({ longitude: Number(x), latitude: Number(y) });
      }
    },
    [mapRef]
  );

  const searchLocation = useCallback(
    (text: string) => {
      mutate(
        {
          search: text,
          userLatitude: initialLocation?.latitude || 0,
          userLongitude: initialLocation?.longitude || 0
        },
        {
          onSuccess: ({ data }) => {
            if (!data.data.length) {
              show('검색 결과가 없어요.', { customData: { status: 'fail' } });
              return;
            }
            setShelterList(data.data);
          }
        }
      );
    },
    [initialLocation?.latitude, initialLocation?.longitude, mutate, show]
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

  const moveCamera = useCallback(
    (latitude: number, longitude: number) => {
      if (mapRef && mapRef.current) {
        mapRef.current.animateCameraTo({ latitude, longitude });
      }
    },
    [mapRef]
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
    shelters,
    shelterCounts,
    mapRef,
    camera,
    selectedMarkerId,
    shelterList,
    enabled,
    toggleMapEnabled,
    refetchShelterList,
    toggleTapMarker,
    changeLocation,
    searchLocation,
    moveCamera,
    hasLocationStatus,
    isLoading,
    isSearchPending: isPending,
    animatedListStyle
  };
};
