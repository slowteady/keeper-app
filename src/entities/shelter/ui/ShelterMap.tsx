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
import { Linking, Platform, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { styled, Text, useTheme, View, YStack } from 'tamagui';

import { theme, useDebounceFunc } from '@/shared';
import { isCameraChanged } from '@/shared/lib/utils/map.utils';
import { CameraParams } from '@/shared/model';
import { Button } from '@/shared/ui/button';

import { ShelterCountDto, ShelterDto } from '../model';

export interface ShelterMapProps extends NaverMapViewProps {
  hasLocation: boolean;
  data?: ShelterDto[];
  onRefetch: (params?: CameraParams) => void;
  onTapMarker?: (data: ShelterDto) => void;
  selectedMarkerId?: number;
}

const Map = forwardRef<NaverMapViewRef, ShelterMapProps>(
  ({ hasLocation, data, onRefetch, onTapMarker, selectedMarkerId, ...props }, ref) => {
    const [isVisibleButton, setIsVisibleButton] = useState(false);
    const cameraRef = useRef<CameraParams | null>(null);
    const scale = useSharedValue(0);

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
      <View style={[styles.container]}>
        {hasLocation ? (
          <>
            <NaverMapView
              ref={ref}
              onCameraChanged={moveCamera}
              isExtentBoundedInKorea
              animationDuration={500}
              style={styles.mapContainer}
              {...props}
            >
              {data?.map((item) => (
                <Marker data={item} key={item.id} onTap={handleTapMarker} isSelectedId={selectedMarkerId} />
              ))}
            </NaverMapView>

            {isVisibleButton && (
              <Animated.View style={[styles.mapButton, animatedStyle]}>
                <Button variant="ghost" onPress={handlePressRefetch}>
                  <Text style={styles.mapButtonText}>현 지도에서 검색</Text>
                </Button>
              </Animated.View>
            )}
          </>
        ) : (
          <NoValidMap />
        )}
      </View>
    );
  }
);

export interface ShelterMapDistanceBoxProps {
  value?: ShelterCountDto[];
  hasLocationStatus: boolean;
  style?: ViewStyle;
}
const DistanceBox = ({ value, hasLocationStatus, style }: ShelterMapDistanceBoxProps) => {
  const DISTANCES = [1, 5, 10, 30];

  return (
    <View style={[styles.distanceContainer, style]}>
      {DISTANCES.map((dist, idx) => {
        const key = `${dist}-${idx}`;
        const matchedCount = value?.find(({ distance }) => distance === dist);
        const count = hasLocationStatus ? (matchedCount?.count ?? 0) : 0;

        return (
          <View key={key} style={styles.textContainer}>
            <Text style={styles.label}>{dist}km</Text>
            <Text style={styles.value}>{count}곳</Text>
          </View>
        );
      })}
    </View>
  );
};

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
  // DistanceBox,
  Marker
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
  container: {
    borderRadius: 10,
    backgroundColor: '#D9D9D9',
    width: '100%',
    aspectRatio: 4 / 5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  mapContainer: {
    width: '100%',
    height: '100%',
    position: 'relative'
  },
  distanceContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 10,
    backgroundColor: theme.colors.background.default,
    borderRadius: 6
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  label: {
    color: theme.colors.black[600],
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 22
  },
  value: {
    color: theme.colors.black[700],
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 22
  },
  mapButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 16,
    borderRadius: 24,
    backgroundColor: theme.colors.primary.main,
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
  },
  mapButtonText: {
    color: theme.colors.black[900],
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 22
  }
});

Map.displayName = 'ShelterMap';
