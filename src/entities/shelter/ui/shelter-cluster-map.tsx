import {
  NaverMapMarkerOverlay,
  NaverMapView,
  NaverMapViewProps,
  NaverMapViewRef
} from '@mj-studio/react-native-naver-map';
import { forwardRef, useCallback, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import Supercluster from 'supercluster';
import { styled, Text, useTheme, View, YStack } from 'tamagui';

import { CameraParams, useDebounceFunc, usePermission } from '@/shared/model';
import { Skeleton } from '@/shared/ui';

import { ShelterDto } from '../schema';

const MARKER = require('@/assets/images/marker.png');

export type ShelterProps = { shelter: ShelterDto };
export type ClusterPointFeature =
  | Supercluster.PointFeature<ShelterProps>
  | Supercluster.ClusterFeature<Supercluster.AnyProps>;

const clusterSymbol = (count: number) =>
  count >= 100 ? 'highDensityCluster' : count >= 10 ? 'mediumDensityCluster' : 'lowDensityCluster';

export type ShelterClusterMapProps = {
  hasLocation: boolean;
  userLocation?: { latitude: number; longitude: number };
  clusters?: ClusterPointFeature[];
  selectedMarkerId?: string;
  bottomPadding?: number;
  onCameraChange: (zoom?: number) => void;
  onTapMarker?: (id: string) => void;
  onTapCluster?: (clusterId: number, latitude: number, longitude: number) => void;
} & Omit<NaverMapViewProps, 'onCameraChanged' | 'clusters' | 'onTapClusterLeaf'>;

const Map = forwardRef<NaverMapViewRef, ShelterClusterMapProps>(
  (
    {
      hasLocation,
      userLocation,
      clusters,
      selectedMarkerId,
      bottomPadding,
      onCameraChange,
      onTapMarker,
      onTapCluster,
      ...props
    },
    ref
  ) => {
    const [isMapReady, setIsMapReady] = useState(false);
    const { primaryMain } = useTheme();

    const isFirstCamera = useRef(true);
    const debouncedChange = useDebounceFunc((zoom?: number) => onCameraChange(zoom), 300);
    const handleCameraChanged = useCallback(
      (params: CameraParams) => {
        if (params.reason === 'Location') return;
        if (isFirstCamera.current) {
          isFirstCamera.current = false;
          onCameraChange(params.zoom);
          return;
        }
        debouncedChange(params.zoom);
      },
      [debouncedChange, onCameraChange]
    );

    const onInitializedProp = props.onInitialized;
    const handleInitialized = useCallback(() => {
      setIsMapReady(true);
      onInitializedProp?.();
    }, [onInitializedProp]);

    if (!hasLocation) return <NoLocationFallback />;

    return (
      <View style={StyleSheet.absoluteFill}>
        <NaverMapView
          ref={ref}
          onCameraChanged={handleCameraChanged}
          isExtentBoundedInKorea
          locationOverlay={userLocation ? { isVisible: true, position: userLocation } : undefined}
          mapPadding={bottomPadding ? { bottom: bottomPadding } : undefined}
          animationDuration={400}
          style={StyleSheet.absoluteFill}
          minZoom={6}
          {...props}
          onInitialized={handleInitialized}
        >
          {clusters?.map((feature) => {
            const [longitude, latitude] = feature.geometry.coordinates;
            if ('cluster' in feature.properties && feature.properties.cluster) {
              const count = feature.properties.point_count;
              const clusterId = feature.properties.cluster_id;
              return (
                <NaverMapMarkerOverlay
                  key={`cluster-${clusterId}`}
                  latitude={latitude}
                  longitude={longitude}
                  image={{ symbol: clusterSymbol(count) }}
                  width={44}
                  height={44}
                  anchor={{ x: 0.5, y: 0.5 }}
                  caption={{
                    text: String(count),
                    align: 'Center',
                    textSize: 14,
                    color: '#161717',
                    haloColor: '#FFFFFF'
                  }}
                  onTap={() => onTapCluster?.(clusterId, latitude, longitude)}
                />
              );
            }
            const { shelter } = feature.properties as ShelterProps;
            const selected = shelter.id === selectedMarkerId;
            return (
              <NaverMapMarkerOverlay
                key={shelter.id}
                latitude={latitude}
                longitude={longitude}
                image={MARKER}
                width={28}
                height={32}
                zIndex={selected ? 100 : 0}
                anchor={{ x: 0.5, y: 1 }}
                isHideCollidedCaptions={!selected}
                caption={{
                  text: shelter.name,
                  textSize: 13,
                  color: selected ? primaryMain.val : '#161717',
                  haloColor: '#FFFFFF'
                }}
                onTap={() => onTapMarker?.(shelter.id)}
              />
            );
          })}
        </NaverMapView>
        {!isMapReady && (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Skeleton style={StyleSheet.absoluteFill} />
          </View>
        )}
      </View>
    );
  }
);

Map.displayName = 'ShelterClusterMap';
export { Map as ShelterClusterMap };

const NoLocationFallback = () => {
  const { goSettingMenu } = usePermission();

  return (
    <NoLocationContainer>
      <Text fontSize={16} lineHeight={18} fontWeight="500" color="$black600">
        사용자의 위치설정을 켜주세요
      </Text>
      <SettingButton onPress={goSettingMenu}>
        <Text fontSize={14} lineHeight={16} fontWeight="500" color="$white900">
          위치설정 바로가기
        </Text>
      </SettingButton>
    </NoLocationContainer>
  );
};

const NoLocationContainer = styled(YStack, {
  flex: 1,
  items: 'center',
  justify: 'center',
  gap: 16,
  bg: '$white800'
});

const SettingButton = styled(View, {
  px: 32,
  py: 16,
  rounded: 30,
  bg: '$black900'
});
