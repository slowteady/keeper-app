import { NaverMapViewRef } from '@mj-studio/react-native-naver-map';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { ShelterDto, shelterQueries } from '@/entities/shelter';
import { calcMapRadiusKm } from '@/shared/lib';
import { CameraParams, useLocation } from '@/shared/model';

const DEFAULT_ZOOM = 11;
const DEFAULT_DISTANCE = 7;

export const useHomeShelter = () => {
  const { userLocation, isGranted } = useLocation();
  const mapRef = useRef<NaverMapViewRef>(null);

  const [mapCamera, setMapCamera] = useState<CameraParams>();
  const [distance, setDistance] = useState(DEFAULT_DISTANCE);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string>();
  const [isMapReady, setIsMapReady] = useState(false);
  const [reorderedShelter, setReorderedShelter] = useState<ShelterDto>();

  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);

  const queryCamera = mapCamera ?? (userLocation ? { ...userLocation, zoom: DEFAULT_ZOOM } : undefined);

  const { data: queryShelters, isLoading } = useQuery({
    ...shelterQueries.list({
      latitude: queryCamera?.latitude ?? 0,
      longitude: queryCamera?.longitude ?? 0,
      distance,
      userLatitude: userLocation?.latitude ?? 0,
      userLongitude: userLocation?.longitude ?? 0
    }),
    enabled: !!queryCamera && isMapReady
  });

  const shelters = useMemo(() => {
    const source = queryShelters ?? [];
    if (!reorderedShelter) return source;
    return [reorderedShelter, ...source.filter((item) => item.id !== reorderedShelter.id)];
  }, [queryShelters, reorderedShelter]);

  const { data: shelterCounts } = useQuery({
    ...shelterQueries.counts({
      latitude: userLocation?.latitude ?? 0,
      longitude: userLocation?.longitude ?? 0
    }),
    enabled: !!userLocation
  });

  const animatedListStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }]
  }));

  const handleMapInitialized = useCallback(() => {
    setIsMapReady(true);

    if (userLocation && mapRef.current) {
      mapRef.current.animateCameraTo({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      });
    }
  }, [userLocation]);

  const handleRefetch = useCallback((params?: CameraParams) => {
    if (!params) return;

    const { latitude, longitude, zoom, region } = params;
    setMapCamera({ latitude, longitude, zoom });
    setSelectedMarkerId(undefined);
    setReorderedShelter(undefined);

    if (region) {
      const radius = calcMapRadiusKm({
        longitudeDelta: region.longitudeDelta ?? 0,
        latitudeDelta: region.latitudeDelta ?? 0,
        latitude,
        longitude
      });
      setDistance(radius);
    }
  }, []);

  const handleTapMarker = useCallback(
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
      setReorderedShelter(data);
    },
    [opacity, translateY]
  );

  const initialCamera = userLocation ? { ...userLocation, zoom: DEFAULT_ZOOM } : undefined;

  return {
    shelters,
    shelterCounts,
    mapRef,
    camera: initialCamera,
    selectedMarkerId,
    isGranted,
    isLoading,
    animatedListStyle,
    onMapInitialized: handleMapInitialized,
    onRefetch: handleRefetch,
    onTapMarker: handleTapMarker
  };
};
