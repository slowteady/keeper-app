import { NaverMapViewRef } from '@mj-studio/react-native-naver-map';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';

import { ShelterDto, shelterQueries, ShelterWithinParamsDto } from '@/entities/shelter';
import { calcMapBounds } from '@/shared/lib';
import { CameraParams, useLocation } from '@/shared/model';

const DEFAULT_ZOOM = 13;

export const useShelterViewport = () => {
  const { userLocation, isGranted } = useLocation();
  const mapRef = useRef<NaverMapViewRef>(null);

  const [bounds, setBounds] = useState<Omit<ShelterWithinParamsDto, 'userLatitude' | 'userLongitude'>>();
  const [selectedShelterId, setSelectedShelterId] = useState<string>();
  const [isMapReady, setIsMapReady] = useState(false);

  const { data: shelters, isLoading } = useQuery({
    ...shelterQueries.within({
      minLatitude: bounds?.minLatitude ?? 0,
      maxLatitude: bounds?.maxLatitude ?? 0,
      minLongitude: bounds?.minLongitude ?? 0,
      maxLongitude: bounds?.maxLongitude ?? 0,
      userLatitude: userLocation?.latitude,
      userLongitude: userLocation?.longitude
    }),
    enabled: !!bounds && isMapReady
  });

  const handleRefetch = useCallback((params?: CameraParams) => {
    if (!params?.region) return;
    setBounds(calcMapBounds(params.region));
  }, []);

  const handleTapMarker = useCallback((data: ShelterDto) => {
    setSelectedShelterId(data.id);
  }, []);

  const handleMapInitialized = useCallback(() => {
    setIsMapReady(true);

    if (userLocation && mapRef.current) {
      mapRef.current.animateCameraTo({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        zoom: DEFAULT_ZOOM
      });
    }
  }, [userLocation]);

  const moveTo = useCallback((coord: { latitude: number; longitude: number }) => {
    mapRef.current?.animateCameraTo({ ...coord, zoom: DEFAULT_ZOOM });
  }, []);

  const initialCamera = userLocation ? { ...userLocation, zoom: DEFAULT_ZOOM } : undefined;

  return {
    shelters,
    mapRef,
    camera: initialCamera,
    selectedShelterId,
    isGranted,
    isLoading,
    onMapInitialized: handleMapInitialized,
    onRefetch: handleRefetch,
    onTapMarker: handleTapMarker,
    selectShelter: setSelectedShelterId,
    moveTo
  };
};
