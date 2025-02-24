import theme from '@/constants/theme';
import { ShelterValue } from '@/types/scheme/shelters';
import {
  Camera,
  CameraChangeReason,
  NaverMapMarkerOverlay,
  NaverMapView,
  NaverMapViewProps,
  NaverMapViewRef,
  Region
} from '@mj-studio/react-native-naver-map';
import { applicationId } from 'expo-application';
import * as Haptics from 'expo-haptics';
import { ActivityAction, startActivityAsync } from 'expo-intent-launcher';
import { forwardRef, useRef, useState } from 'react';
import { Dimensions, Linking, Platform, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

export interface ShelterMapProps extends NaverMapViewProps {
  hasLocation: boolean;
  data?: ShelterValue[];
  onRefetch: (camera?: Camera) => void;
  onTapMarker?: (data: ShelterValue) => void;
  selectedMarkerId?: number;
}
const Map = forwardRef<NaverMapViewRef, ShelterMapProps>(
  ({ hasLocation, data, onRefetch, onTapMarker, selectedMarkerId, ...props }, ref) => {
    const [isVisibleButton, setIsVisibleButton] = useState(false);
    const cameraRef = useRef<Camera>();

    const handleChangeCamera = (
      params: Camera & {
        reason: CameraChangeReason;
        region: Region;
      }
    ) => {
      setIsVisibleButton(true);
      cameraRef.current = params;
    };

    const handlePressRefetch = async () => {
      await Haptics.selectionAsync();
      setIsVisibleButton(false);
      onRefetch(cameraRef.current);
    };

    const handleTapMarker = (data: ShelterValue) => {
      if (ref && 'current' in ref && ref.current) {
        ref?.current?.animateCameraTo({ latitude: data.latitude, longitude: data.longitude });
        onTapMarker?.(data);
      }
    };

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
              <TouchableOpacity style={styles.mapButton} activeOpacity={0.5} onPress={handlePressRefetch}>
                <Text style={styles.mapButtonText}>현 지도에서 검색</Text>
              </TouchableOpacity>
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
  value: {
    '1km': number;
    '10km': number;
    '30km': number;
    '50km': number;
  };
  style?: ViewStyle;
}
const DistanceBox = ({ value, style }: ShelterMapDistanceBoxProps) => {
  const convertedValue = Object.entries(value).map(([key, val]) => ({
    label: key,
    value: val
  }));

  return (
    <View style={[styles.distanceContainer, style]}>
      {convertedValue.map(({ label, value }, idx) => {
        const key = `${label}-${idx}`;

        return (
          <View style={styles.textContainer} key={key}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}곳</Text>
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

  return (
    <NaverMapMarkerOverlay
      image={require('@/assets/images/marker.png')}
      latitude={latitude}
      longitude={longitude}
      height={isSelected ? 42 : 32}
      width={isSelected ? 38 : 28}
      onTap={handleTapMarker}
      caption={isSelected ? { text: data.name, textSize: 13 } : undefined}
      globalZIndex={isSelected ? MARKER_DEFAULT_ZINDEX + 1 : MARKER_DEFAULT_ZINDEX}
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
    <View style={styles.requestContainer}>
      <Text>위치 권한 설정이 완료되지 않았습니다.</Text>
      <Text>{`설정 > Keeper > 위치 접근 허용을 설정해주세요.`}</Text>
      <TouchableOpacity
        style={{ padding: 20, borderRadius: 10, backgroundColor: theme.colors.black[500] }}
        activeOpacity={0.5}
        onPress={handlePressSetting}
      >
        <Text>설정하기</Text>
      </TouchableOpacity>
    </View>
  );
};

export const ShelterMap = Object.assign(Map, {
  DistanceBox,
  NoValidMap
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    backgroundColor: '#D9D9D9',
    width: '100%',
    height: Dimensions.get('screen').width * 0.8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  mapContainer: {
    width: '100%',
    height: '100%',
    position: 'relative'
  },
  requestContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  distanceContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 9,
    backgroundColor: theme.colors.white[800],
    borderRadius: 8
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  label: {
    color: theme.colors.black[600],
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 22
  },
  value: {
    color: theme.colors.black[700],
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 22
  },
  mapButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 10,
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
