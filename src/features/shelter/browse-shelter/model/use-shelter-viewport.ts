import { NaverMapViewRef } from '@mj-studio/react-native-naver-map';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Supercluster from 'supercluster';

import {
  ClusterPointFeature,
  ShelterDto,
  ShelterProps,
  shelterQueries,
  ShelterWithinParamsDto
} from '@/entities/shelter';
import { useLocation } from '@/shared/model';

import { useSetShelterSearchCoord, useShelterSearchCoord } from './shelter-search-coord';

const DEFAULT_ZOOM = 12;
const CLUSTER_MAX_ZOOM = 16;
const CLUSTER_RADIUS = 60;

const NATION_BOUNDS: Omit<ShelterWithinParamsDto, 'userLatitude' | 'userLongitude'> = {
  minLatitude: 33,
  maxLatitude: 38.7,
  minLongitude: 124.5,
  maxLongitude: 131.9
};

type VisibleInsets = {
  visibleTop: number;
  visibleBottom: number;
  screenWidth: number;
  screenHeight: number;
};

export const useShelterViewport = ({ visibleTop, visibleBottom, screenWidth, screenHeight }: VisibleInsets) => {
  const { userLocation, isGranted } = useLocation();
  const mapRef = useRef<NaverMapViewRef>(null);

  const searchCoord = useShelterSearchCoord();
  const setSearchCoord = useSetShelterSearchCoord();

  const [selectedShelterId, setSelectedShelterId] = useState<string>();
  const [isMapReady, setIsMapReady] = useState(false);
  const zoomRef = useRef(DEFAULT_ZOOM);

  const { data: allShelters, isLoading } = useQuery({
    ...shelterQueries.within({
      ...NATION_BOUNDS,
      userLatitude: userLocation?.latitude,
      userLongitude: userLocation?.longitude
    }),
    enabled: isMapReady
  });

  const index = useMemo(() => {
    if (!allShelters) return null;
    const supercluster = new Supercluster<ShelterProps>({ radius: CLUSTER_RADIUS, maxZoom: CLUSTER_MAX_ZOOM });
    supercluster.load(
      allShelters.map((shelter) => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [shelter.longitude, shelter.latitude] },
        properties: { shelter }
      }))
    );
    return supercluster;
  }, [allShelters]);

  const [clusters, setClusters] = useState<ClusterPointFeature[]>([]);
  const [shelters, setShelters] = useState<ShelterDto[]>();
  const [hasViewport, setHasViewport] = useState(false);

  const recompute = useCallback(async () => {
    const map = mapRef.current;
    if (!map || !index) return;
    try {
      const topLeft = await map.screenToCoordinate({ screenX: 0, screenY: visibleTop });
      const bottomRight = await map.screenToCoordinate({
        screenX: screenWidth,
        screenY: screenHeight - visibleBottom
      });
      if (!topLeft.isValid || !bottomRight.isValid) return;
      const bbox: [number, number, number, number] = [
        topLeft.longitude,
        bottomRight.latitude,
        bottomRight.longitude,
        topLeft.latitude
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
      setHasViewport(true);
    } catch {
      // map ref not ready yet
    }
  }, [index, visibleTop, visibleBottom, screenWidth, screenHeight]);

  useEffect(() => {
    recompute();
  }, [recompute]);

  const handleCameraChange = useCallback(
    (zoom?: number) => {
      if (zoom !== undefined) zoomRef.current = zoom;
      recompute();
    },
    [recompute]
  );

  const handleTapMarker = useCallback(
    (id: string) => {
      if (selectedShelterId === id) {
        setSelectedShelterId(undefined);
        return;
      }
      setSelectedShelterId(id);
      const target = allShelters?.find((shelter) => shelter.id === id);
      if (target) mapRef.current?.animateCameraTo({ latitude: target.latitude, longitude: target.longitude });
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

  const initialCamera = userLocation ? { ...userLocation, zoom: DEFAULT_ZOOM } : undefined;

  return {
    clusters,
    shelters,
    selectedShelter,
    mapRef,
    camera: initialCamera,
    userLocation,
    selectedShelterId,
    isGranted,
    isLoading,
    onMapInitialized: handleMapInitialized,
    onCameraChange: handleCameraChange,
    onTapMarker: handleTapMarker,
    onTapCluster: handleTapCluster,
    onDeselect: handleDeselect,
    selectShelter: setSelectedShelterId,
    moveToCurrentLocation,
    isViewport: hasViewport
  };
};
