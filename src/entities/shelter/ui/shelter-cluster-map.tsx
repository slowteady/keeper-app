import { NaverMapView, NaverMapViewProps, NaverMapViewRef } from '@mj-studio/react-native-naver-map';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { styled, Text, View, YStack } from 'tamagui';

import { CameraParams, useDebounceFunc, usePermission } from '@/shared/model';
import { Skeleton } from '@/shared/ui';

import { ShelterDto } from '../schema';

const MARKER = require('@/assets/images/marker.png');

export type ShelterClusterMapProps = {
  hasLocation: boolean;
  data?: ShelterDto[];
  onRefetch: (params?: CameraParams) => void;
  onTapMarker?: (data: ShelterDto) => void;
  selectedMarkerId?: string;
} & Omit<NaverMapViewProps, 'onCameraChanged' | 'clusters' | 'onTapClusterLeaf'>;

const Map = forwardRef<NaverMapViewRef, ShelterClusterMapProps>(
  ({ hasLocation, data, onRefetch, onTapMarker, selectedMarkerId, ...props }, ref) => {
    const [isMapReady, setIsMapReady] = useState(false);

    const clusters = useMemo(
      () => [
        {
          markers: (data ?? []).map((item) => ({
            identifier: item.id,
            latitude: item.latitude,
            longitude: item.longitude,
            image: MARKER,
            width: item.id === selectedMarkerId ? 38 : 28,
            height: item.id === selectedMarkerId ? 42 : 32
          })),
          width: 40,
          height: 40,
          screenDistance: 70,
          minZoom: 0,
          maxZoom: 16,
          animate: true
        }
      ],
      [data, selectedMarkerId]
    );

    // viewport 자동 로드 — Gesture(패닝)/Developer(animateCameraTo, 검색 이동) 처리.
    // Location(자동 추적)만 제외 — 최초 마운트/추적 시 불필요한 fetch 방지.
    const handleCameraChanged = useDebounceFunc((params: CameraParams) => {
      if (params.reason === 'Location') return;
      onRefetch(params);
    }, 600);

    const handleTapLeaf = useCallback(
      ({ markerIdentifier }: { markerIdentifier: string }) => {
        const found = data?.find((item) => item.id === markerIdentifier);
        if (found) onTapMarker?.(found);
      },
      [data, onTapMarker]
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
          animationDuration={500}
          style={StyleSheet.absoluteFill}
          clusters={clusters}
          onTapClusterLeaf={handleTapLeaf}
          minZoom={10}
          {...props}
          onInitialized={handleInitialized}
        />
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
