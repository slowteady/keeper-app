import theme from '@/constants/theme';
import { Camera, CameraChangeReason, NaverMapView, NaverMapViewRef, Region } from '@mj-studio/react-native-naver-map';
import { applicationId } from 'expo-application';
import { ActivityAction, startActivityAsync } from 'expo-intent-launcher';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, Linking, Platform, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

const Map = () => {
  const [status, requestPermission] = Location.useForegroundPermissions();
  const [camera, setCamera] = useState<Camera>();
  const mapRef = useRef<NaverMapViewRef | null>(null);

  useEffect(() => {
    const getCurrentLocation = async () => {
      const response = await requestPermission();

      if (response.status === Location.PermissionStatus.GRANTED) {
        const { coords } = await Location.getCurrentPositionAsync({});

        mapRef.current?.animateCameraTo({
          latitude: coords.latitude,
          longitude: coords.longitude,
          zoom: 13
        });
        mapRef.current?.setLocationTrackingMode('Follow');
      }
    };

    getCurrentLocation();
  }, [requestPermission]);

  const handlePressSetting = async () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else if (Platform.OS === 'android') {
      startActivityAsync(ActivityAction.APPLICATION_DETAILS_SETTINGS, {
        data: `package:${applicationId}`
      });
    }
  };

  const handleTapLeaf = () => {
    // NOTE: 리프 마커 클릭 시 -> 보호소 배열 정렬 1등으로 나오도록
  };

  const handleChangeCamera = (
    params: Camera & {
      reason: CameraChangeReason;
      region: Region;
    }
  ) => {
    setCamera(params);
  };

  const hasLocation = Boolean(status) && status?.status === Location.PermissionStatus.GRANTED;

  return (
    <View style={[styles.container]}>
      {hasLocation ? (
        <NaverMapView
          camera={camera}
          ref={mapRef}
          onTapClusterLeaf={handleTapLeaf}
          onCameraChanged={handleChangeCamera}
          isExtentBoundedInKorea
          isShowLocationButton={true}
          isShowScaleBar={false}
          isShowZoomControls={false}
          minZoom={13}
          maxZoom={13}
          isZoomGesturesEnabled={false}
          style={styles.mapContainer}
        ></NaverMapView>
      ) : (
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
      )}
    </View>
  );
};

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

export const ShelterMap = Object.assign(Map, {
  DistanceBox
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    backgroundColor: '#D9D9D9',
    width: '100%',
    height: Dimensions.get('screen').width,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  mapContainer: {
    width: '100%',
    height: '100%'
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
  }
});
