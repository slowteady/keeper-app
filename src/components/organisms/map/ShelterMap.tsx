import Button from '@/components/atoms/button/Button';
import theme from '@/constants/theme';
import { useDebounce } from '@/hooks/useDebounce';
import { CameraParams } from '@/types/map';
import { ShelterCountValue, ShelterValue } from '@/types/scheme/shelters';
import { isCameraChanged } from '@/utils/mapUtils';
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
import { Linking, Platform, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export interface ShelterMapProps extends NaverMapViewProps {
  hasLocation: boolean;
  data?: ShelterValue[];
  onRefetch: (params?: CameraParams) => void;
  onTapMarker?: (data: ShelterValue) => void;
  selectedMarkerId?: number;
}
const Map = forwardRef<NaverMapViewRef, ShelterMapProps>(
  ({ hasLocation, data, onRefetch, onTapMarker, selectedMarkerId, ...props }, ref) => {
    const [isVisibleButton, setIsVisibleButton] = useState(false);
    const cameraRef = useRef<CameraParams>();
    const scale = useSharedValue(0);

    useEffect(() => {
      scale.value = withTiming(isVisibleButton ? 1 : 0, { duration: 200 });
    }, [scale, isVisibleButton]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: scale.value
    }));

    const handleChangeCamera = useDebounce((params: CameraParams) => {
      if (cameraRef.current && !isCameraChanged(cameraRef.current, params)) {
        return;
      }

      setIsVisibleButton(true);
      cameraRef.current = params;
    }, 500);
    const handlePressRefetch = async () => {
      await Haptics.selectionAsync();
      setIsVisibleButton(false);
      onRefetch(cameraRef.current);
    };
    const handleTapMarker = useCallback(
      (data: ShelterValue) => {
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
              onCameraChanged={handleChangeCamera}
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
                <Button onPress={handlePressRefetch}>
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
  value?: ShelterCountValue[];
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
  data: ShelterValue;
  onTap?: (data: ShelterValue) => void;
  isSelectedId?: number;
}
const MARKER_DEFAULT_ZINDEX = 200000;
const Marker = ({ data, onTap, isSelectedId }: ShelterMapMarkerProps) => {
  const { id, latitude, longitude } = data;

  const handleTapMarker = () => {
    onTap?.(data);
  };

  const isSelected = isSelectedId === id;
  const captionStyle = isSelected
    ? { textSize: 13, haloColor: theme.colors.white[900] }
    : { textSize: 11, haloColor: theme.colors.white[900] };

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
  const handlePressSetting = async () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else if (Platform.OS === 'android') {
      startActivityAsync(ActivityAction.APPLICATION_DETAILS_SETTINGS, {
        data: `package:${applicationId}`
      });
    }
  };

  return (
    <View style={styles.reqContainer}>
      <Text style={styles.reqText}>사용자의 위치설정을 켜주세요.</Text>
      <Button onPress={handlePressSetting} style={styles.settingButton}>
        <Text style={styles.settingButtonText}>위치설정 바로가기</Text>
      </Button>
    </View>
  );
};

export const ShelterMap = Object.assign(Map, {
  DistanceBox,
  NoValidMap,
  Marker
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    backgroundColor: '#D9D9D9',
    width: '100%',
    height: undefined,
    aspectRatio: 4 / 5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  mapContainer: {
    width: '100%',
    height: '100%',
    position: 'relative'
  },
  reqContainer: {
    position: 'relative',
    width: '100%',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white[900]
  },
  reqText: {
    fontSize: 15,
    lineHeight: 17,
    fontWeight: '500',
    color: theme.colors.black[600]
  },
  distanceContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 10,
    backgroundColor: theme.colors.white[800],
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
  },
  settingButton: {
    position: 'absolute',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    backgroundColor: theme.colors.black[900],
    borderWidth: 1,
    bottom: 24
  },
  settingButtonText: {
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '500',
    color: theme.colors.white[900]
  }
});

Map.displayName = 'ShelterMap';
