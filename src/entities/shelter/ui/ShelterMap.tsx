import {
  NaverMapMarkerOverlay,
  NaverMapView,
  NaverMapViewProps,
  NaverMapViewRef
} from '@mj-studio/react-native-naver-map';
import { applicationId } from 'expo-application';
import * as Haptics from 'expo-haptics';
import { ActivityAction, startActivityAsync } from 'expo-intent-launcher';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Platform, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { styled, Text, useTheme, View, XStack, YStack } from 'tamagui';

import { useDebounceFunc } from '@/shared';
import { isCameraChanged } from '@/shared/lib/utils/map';
import { CameraParams } from '@/shared/model';
import { Button } from '@/shared/ui/button';

import { ShelterDto } from '../model';

export interface ShelterMapProps extends NaverMapViewProps {
  hasLocation: boolean;
  data?: ShelterDto[];
  onRefetch: (params?: CameraParams) => void;
  onTapMarker?: (data: ShelterDto) => void;
  selectedMarkerId?: number;
  readOnly?: boolean;
}

const Map = forwardRef<NaverMapViewRef, ShelterMapProps>(
  ({ hasLocation, data, onRefetch, onTapMarker, selectedMarkerId, readOnly, ...props }, ref) => {
    const [isVisibleButton, setIsVisibleButton] = useState(false);
    const cameraRef = useRef<CameraParams | null>(null);
    const scale = useSharedValue(0);
    const { primaryMain } = useTheme();

    useEffect(() => {
      scale.value = withTiming(isVisibleButton ? 1 : 0, { duration: 200 });
    }, [scale, isVisibleButton]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: scale.value
    }));

    const moveCamera = useDebounceFunc((params: CameraParams) => {
      if (cameraRef.current && !isCameraChanged(cameraRef.current, params)) {
        return;
      }

      setIsVisibleButton(true);
      cameraRef.current = params;
    }, 500);

    const handlePressRefetch = useCallback(() => {
      Haptics.selectionAsync();
      setIsVisibleButton(false);
      onRefetch(cameraRef.current ?? undefined);
    }, [onRefetch]);

    const handleTapMarker = useCallback(
      (data: ShelterDto) => {
        if (ref && 'current' in ref && ref.current) {
          ref?.current?.animateCameraTo({ latitude: data.latitude, longitude: data.longitude });
          onTapMarker?.(data);
        }
      },
      [onTapMarker, ref]
    );

    return (
      <Container>
        {hasLocation ? (
          <>
            <NaverMapView
              ref={ref}
              onCameraChanged={moveCamera}
              isExtentBoundedInKorea
              animationDuration={500}
              style={{ width: '100%', height: '100%', position: 'relative' }}
              {...(readOnly
                ? {
                    isZoomGesturesEnabled: false,
                    isScrollGesturesEnabled: false,
                    isRotateGesturesEnabled: false,
                    isTiltGesturesEnabled: false
                  }
                : {})}
              {...props}
            >
              {data?.map((item) => (
                <Marker data={item} key={item.id} onTap={handleTapMarker} isSelectedId={selectedMarkerId} />
              ))}
            </NaverMapView>

            {isVisibleButton && !readOnly && (
              <Animated.View style={[styles.mapButton, { backgroundColor: primaryMain.val }, animatedStyle]}>
                <Button variant="ghost" onPress={handlePressRefetch}>
                  <Text fontSize={13} fontWeight="600" lineHeight={22} color="$black900">
                    현 지도에서 검색
                  </Text>
                </Button>
              </Animated.View>
            )}
          </>
        ) : (
          <NoValidMap />
        )}
      </Container>
    );
  }
);

interface ShelterMapMarkerProps {
  data: ShelterDto;
  onTap?: (data: ShelterDto) => void;
  isSelectedId?: number;
}
const MARKER_DEFAULT_ZINDEX = 200000;
const Marker = ({ data, onTap, isSelectedId }: ShelterMapMarkerProps) => {
  const { id, latitude, longitude } = data;
  const { white900 } = useTheme();

  const handleTapMarker = () => {
    onTap?.(data);
  };

  const isSelected = isSelectedId === id;
  const captionStyle = isSelected
    ? { textSize: 13, haloColor: white900.val }
    : { textSize: 11, haloColor: white900.val };

  return (
    <NaverMapMarkerOverlay
      image={require('@/assets/images/marker.png')}
      latitude={latitude}
      longitude={longitude}
      height={isSelected ? 42 : 32}
      width={isSelected ? 38 : 28}
      onTap={handleTapMarker}
      caption={{ text: data.name, minZoom: 10, ...captionStyle }}
      globalZIndex={isSelected ? MARKER_DEFAULT_ZINDEX : MARKER_DEFAULT_ZINDEX - 1}
    />
  );
};

const NoValidMap = () => {
  const goSettingMenu = async () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else if (Platform.OS === 'android') {
      startActivityAsync(ActivityAction.APPLICATION_DETAILS_SETTINGS, {
        data: `package:${applicationId}`
      });
    }
  };

  return (
    <NoValidContainer>
      <Text fontSize={15} lineHeight={17} fontWeight="500" color="$black600">
        사용자의 위치설정을 켜주세요.
      </Text>
      <SettingButton onPress={goSettingMenu}>
        <Text fontSize={14} lineHeight={16} fontWeight="500" color="$white900">
          위치설정 바로가기
        </Text>
      </SettingButton>
    </NoValidContainer>
  );
};

export const ShelterMap = Object.assign(Map, {
  Marker
});

const Container = styled(XStack, {
  rounded: 10,
  bg: '#D9D9D9',
  width: '100%',
  aspectRatio: 4 / 5,
  items: 'center',
  justify: 'center',
  overflow: 'hidden'
});

const NoValidContainer = styled(YStack, {
  position: 'relative',
  width: '100%',
  flex: 1,
  items: 'center',
  justify: 'center',
  bg: '$white900'
});

const SettingButton = styled(View, {
  position: 'absolute',
  px: 32,
  py: 16,
  rounded: 30,
  bg: '$black900'
});

const styles = StyleSheet.create({
  mapButton: {
    display: 'flex',
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

Map.displayName = 'ShelterMap';
