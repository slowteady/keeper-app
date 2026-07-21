import { NaverMapViewRef, Region } from '@mj-studio/react-native-naver-map';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Supercluster from 'supercluster';

import {
  attachDistance,
  ClusterPointFeature,
  hasShelterCoords,
  SHELTER_NATION_BOUNDS,
  ShelterDto,
  ShelterProps,
  shelterQueries
} from '@/entities/shelter';
import { useLocation } from '@/shared/model';

import { useSetShelterSearchCoord, useShelterSearchCoord } from './shelter-search-coord';

const DEFAULT_ZOOM = 12;
const CLUSTER_MAX_ZOOM = 16;
const CLUSTER_RADIUS = 60;
const FALLBACK_COORD = { latitude: 37.5665, longitude: 126.978 };

export const useShelterViewport = () => {
  const { userLocation, isGranted, permissionStatus } = useLocation();
  const mapRef = useRef<NaverMapViewRef>(null);

  const searchCoord = useShelterSearchCoord();
  const setSearchCoord = useSetShelterSearchCoord();

  const [selectedShelterId, setSelectedShelterId] = useState<string>();
  const [isMapReady, setIsMapReady] = useState(false);
  const zoomRef = useRef(DEFAULT_ZOOM);
  const regionRef = useRef<Region | undefined>(undefined);

  const { data: allShelters, isLoading } = useQuery({
    ...shelterQueries.within(SHELTER_NATION_BOUNDS),
    enabled: isMapReady,
    select: (data) => attachDistance(data, userLocation)
  });

  const index = useMemo(() => {
    if (!allShelters) return null;
    const supercluster = new Supercluster<ShelterProps>({ radius: CLUSTER_RADIUS, maxZoom: CLUSTER_MAX_ZOOM });
    supercluster.load(
      allShelters.filter(hasShelterCoords).map((shelter) => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [shelter.longitude, shelter.latitude] },
        properties: { shelter }
      }))
    );
    return supercluster;
  }, [allShelters]);

  const [clusters, setClusters] = useState<ClusterPointFeature[]>([]);
  const [shelters, setShelters] = useState<ShelterDto[]>();

  const recompute = useCallback(
    (region: Region) => {
      if (!index) return;
      const bbox: [number, number, number, number] = [
        region.longitude,
        region.latitude,
        region.longitude + region.longitudeDelta,
        region.latitude + region.latitudeDelta
      ];
      const result = index.getClusters(bbox, Math.min(Math.round(zoomRef.current), CLUSTER_MAX_ZOOM));
      setClusters(result);
      const flat = result.flatMap((feature) =>
        'cluster' in feature.properties && feature.properties.cluster
          ? index.getLeaves(feature.properties.cluster_id, Infinity).map((leaf) => leaf.properties.shelter)
          : [(feature.properties as ShelterProps).shelter]
      );
      flat.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
      setShelters(flat);
    },
    [index]
  );

  const handleCameraChange = useCallback(
    (zoom?: number, region?: Region) => {
      if (zoom !== undefined) zoomRef.current = zoom;
      if (region) {
        regionRef.current = region;
        recompute(region);
      }
    },
    [recompute]
  );

  useEffect(() => {
    if (regionRef.current) recompute(regionRef.current);
  }, [index, recompute]);

  const handleTapMarker = useCallback(
    (id: string) => {
      if (selectedShelterId === id) {
        setSelectedShelterId(undefined);
        return;
      }
      setSelectedShelterId(id);
      const target = allShelters?.find((shelter) => shelter.id === id);
      if (target && hasShelterCoords(target)) {
        mapRef.current?.animateCameraTo({ latitude: target.latitude, longitude: target.longitude });
      }
    },
    [selectedShelterId, allShelters]
  );

  const handleDeselect = useCallback(() => setSelectedShelterId(undefined), []);

  const selectedShelter = useMemo(
    () => allShelters?.find((shelter) => shelter.id === selectedShelterId),
    [allShelters, selectedShelterId]
  );

  const handleTapCluster = useCallback(
    (clusterId: number, latitude: number, longitude: number) => {
      if (!index) return;
      const expansionZoom = Math.min(index.getClusterExpansionZoom(clusterId), CLUSTER_MAX_ZOOM);
      mapRef.current?.animateCameraTo({ latitude, longitude, zoom: expansionZoom });
    },
    [index]
  );

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

  useEffect(() => {
    if (!searchCoord || !isMapReady) return;
    mapRef.current?.animateCameraTo({ ...searchCoord, zoom: DEFAULT_ZOOM });
    setSearchCoord(null);
  }, [searchCoord, isMapReady, setSearchCoord]);

  const moveToCurrentLocation = useCallback(() => {
    if (userLocation) mapRef.current?.animateCameraTo({ ...userLocation, zoom: DEFAULT_ZOOM });
  }, [userLocation]);

  const initialCamera = { ...(userLocation ?? FALLBACK_COORD), zoom: DEFAULT_ZOOM };

  return {
    clusters,
    shelters,
    selectedShelter,
    mapRef,
    camera: initialCamera,
    userLocation,
    selectedShelterId,
    isGranted,
    permissionStatus,
    isInitializing: isLoading || shelters === undefined,
    onMapInitialized: handleMapInitialized,
    onCameraChange: handleCameraChange,
    onTapMarker: handleTapMarker,
    onTapCluster: handleTapCluster,
    onDeselect: handleDeselect,
    moveToCurrentLocation
  };
};
