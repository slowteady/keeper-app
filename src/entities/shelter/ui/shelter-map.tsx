import {
  NaverMapMarkerOverlay,
  NaverMapView,
  NaverMapViewProps,
  NaverMapViewRef
} from '@mj-studio/react-native-naver-map';
import * as Haptics from 'expo-haptics';
import { forwardRef, memo, useCallback, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { styled, Text, useTheme, View, XStack, YStack } from 'tamagui';

import { CameraParams, useDebounceFunc, usePermission } from '@/shared/model';
import { Button, Skeleton } from '@/shared/ui';

import { hasShelterCoords, ShelterDto, ShelterWithCoords } from '../schema';

export type ShelterMapProps = {
  hasLocation: boolean;
  isLocationPending?: boolean;
  data?: ShelterDto[];
  onRefetch: (params?: CameraParams) => void;
  onTapMarker?: (data: ShelterDto) => void;
  selectedMarkerId?: string;
  readOnly?: boolean;
  mapAspectRatio?: number;
  enableRefetch?: boolean;
  fill?: boolean;
} & Omit<NaverMapViewProps, 'onCameraChanged'>;

const Map = forwardRef<NaverMapViewRef, ShelterMapProps>(
  (
    {
      hasLocation,
      isLocationPending,
      data,
      onRefetch,
      onTapMarker,
      selectedMarkerId,
      readOnly,
      mapAspectRatio = 4 / 5,
      enableRefetch = true,
      fill = false,
      ...props
    },
    ref
  ) => {
    const [isRefetchVisible, setIsRefetchVisible] = useState(false);
    const [isMapReady, setIsMapReady] = useState(false);
    const cameraRef = useRef<CameraParams | null>(null);
    const { primaryMain } = useTheme();
    const scale = useSharedValue(0);

    useEffect(() => {
      scale.value = withTiming(isRefetchVisible ? 1 : 0, { duration: 200 });
    }, [scale, isRefetchVisible]);

    const refetchButtonStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: scale.value
    }));

    const handleCameraChanged = useDebounceFunc((params: CameraParams) => {
      // Gesture(사용자 패닝) + Developer(animateCameraTo, 위치설정 BS) 둘 다 처리.
      // Location(자동 추적) 만 제외 — 최초 마운트/추적 시 버튼이 깜빡 뜨는 노이즈 방지.
      if (params.reason === 'Location') return;

      setIsRefetchVisible(true);
      cameraRef.current = params;
    }, 200);

    const handlePressRefetch = useCallback(() => {
      Haptics.selectionAsync();
      setIsRefetchVisible(false);
      onRefetch(cameraRef.current ?? undefined);
    }, [onRefetch]);

    const onInitializedProp = props.onInitialized;
    const handleInitialized = useCallback(() => {
      setIsMapReady(true);
      onInitializedProp?.();
    }, [onInitializedProp]);

    const handleTapMarker = useCallback(
      (data: ShelterWithCoords) => {
        (ref as React.RefObject<NaverMapViewRef>)?.current?.animateCameraTo({
          latitude: data.latitude,
          longitude: data.longitude,
          zoom: 15
        });
        onTapMarker?.(data);
      },
      [onTapMarker, ref]
    );

    return (
      <Container {...(fill ? { flex: 1, rounded: 0 } : { aspectRatio: mapAspectRatio })}>
        {isLocationPending ? (
          <Skeleton style={styles.map} />
        ) : hasLocation ? (
          <>
            <NaverMapView
              ref={ref}
              onCameraChanged={handleCameraChanged}
              isExtentBoundedInKorea
              animationDuration={500}
              style={styles.map}
              {...(readOnly && {
                isZoomGesturesEnabled: false,
                isScrollGesturesEnabled: false,
                isRotateGesturesEnabled: false,
                isTiltGesturesEnabled: false,
                isShowZoomControls: false,
                isShowScaleBar: false,
                isShowLocationButton: false
              })}
              {...props}
              onInitialized={handleInitialized}
            >
              {data?.filter(hasShelterCoords).map((item) => (
                <ShelterMarker
                  key={item.id}
                  data={item}
                  onTap={handleTapMarker}
                  isSelected={selectedMarkerId === item.id}
                />
              ))}
            </NaverMapView>

            {!readOnly && enableRefetch && isMapReady && (
              <Animated.View style={[styles.refetchButton, { backgroundColor: primaryMain.val }, refetchButtonStyle]}>
                <Button variant="ghost" onPress={handlePressRefetch}>
                  <Text fontSize={13} fontWeight="600" lineHeight={22} color="$black900">
                    현 지도에서 검색
                  </Text>
                </Button>
              </Animated.View>
            )}

            {!isMapReady && (
              <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <Skeleton style={styles.map} />
              </View>
            )}
          </>
        ) : (
          <NoLocationFallback />
        )}
      </Container>
    );
  }
);

Map.displayName = 'ShelterMap';
export { Map as ShelterMap };

// --- Marker ---

const MARKER_BASE_ZINDEX = 200000;

type ShelterMarkerProps = {
  data: ShelterWithCoords;
  onTap: (data: ShelterWithCoords) => void;
  isSelected: boolean;
};

const ShelterMarker = memo(({ data, onTap, isSelected }: ShelterMarkerProps) => {
  const { white900 } = useTheme();

  const handleTap = useCallback(() => {
    onTap(data);
  }, [onTap, data]);

  return (
    <NaverMapMarkerOverlay
      image={require('@/assets/images/marker.png')}
      latitude={data.latitude}
      longitude={data.longitude}
      height={isSelected ? 37 : 32}
      width={isSelected ? 33 : 28}
      onTap={handleTap}
      caption={{
        text: data.name,
        minZoom: 10,
        textSize: isSelected ? 13 : 11,
        haloColor: white900.val
      }}
      globalZIndex={isSelected ? MARKER_BASE_ZINDEX : MARKER_BASE_ZINDEX - 1}
    />
  );
});

ShelterMarker.displayName = 'ShelterMarker';

// --- NoLocationFallback ---

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

// --- Styles ---

const Container = styled(XStack, {
  rounded: 10,
  bg: '$white800',
  width: '100%',
  items: 'center',
  justify: 'center',
  overflow: 'hidden'
});

const NoLocationContainer = styled(YStack, {
  width: '100%',
  flex: 1,
  items: 'center',
  justify: 'center',
  gap: 16
});

const SettingButton = styled(View, {
  px: 32,
  py: 16,
  rounded: 30,
  bg: '$black900'
});

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%'
  },
  refetchButton: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 16,
    borderRadius: 24,
    paddingHorizontal: 18,
    height: 40,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3
      },
      android: {
        elevation: 4
      }
    })
  }
});
