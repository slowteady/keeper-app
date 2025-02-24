import FullViewButton from '@/components/atoms/button/FullViewButton';
import { NavArrowIcon } from '@/components/atoms/icons/ArrowIcon';
import MainShelterCard from '@/components/organisms/card/MainShelterCard';
import { MapTouchableWrapper } from '@/components/organisms/map/MapTouchableWrapper';
import { ShelterMap, ShelterMapDistanceBoxProps } from '@/components/organisms/map/ShelterMap';
import theme from '@/constants/theme';
import { useGetShelterCount, useGetShelters } from '@/hooks/queries/useShelters';
import { ShelterValue } from '@/types/scheme/shelters';
import { Camera, NaverMapViewRef } from '@mj-studio/react-native-naver-map';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, ListRenderItemInfo, Pressable, StyleSheet, Text, View } from 'react-native';

const MainShelterSection = () => {
  const [controlsVisible, setControlsVisible] = useState(true);
  const [camera, setCamera] = useState<Camera>();
  const [enabled, setEnabled] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState(0);
  const [shelterData, setShelterData] = useState<ShelterValue[]>([]);
  const mapRef = useRef<NaverMapViewRef | null>(null);
  const [status, requestPermission] = Location.useForegroundPermissions();

  const { data: sheltersData } = useGetShelters(
    { latitude: camera?.latitude || 0, longitude: camera?.longitude || 0, radius: 50 },
    { enabled: Boolean(camera) && enabled }
  );
  const { data: shelterCountData } = useGetShelterCount({
    latitude: camera?.latitude || 0,
    longitude: camera?.longitude || 0
  });

  useEffect(() => {
    const getCurrentLocation = async () => {
      const response = await requestPermission();

      if (response.status === Location.PermissionStatus.GRANTED) {
        const { coords } = await Location.getCurrentPositionAsync({});
        setCamera(coords);

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

  useEffect(() => {
    if (!sheltersData) return;
    setShelterData(sheltersData);
  }, [sheltersData]);

  const handlePressButton = () => {
    router.push('/shelters');
  };

  const handleRefetch = (camera?: Camera) => {
    setCamera(camera);
    setSelectedMarkerId(0);
  };

  const handleTapMarker = (data: ShelterValue) => {
    setSelectedMarkerId(data.id);
    setShelterData((prev) => [data, ...prev.filter((item) => item.id !== data.id)]);
  };

  const handleTapMap = () => {
    setSelectedMarkerId(0);
  };

  const handleInitMap = () => {
    setEnabled(true);
    setControlsVisible(true);
  };

  const distanceValue: ShelterMapDistanceBoxProps['value'] = {
    '1km': shelterCountData?.find((item) => item.distance === 1)?.count ?? 0,
    '10km': shelterCountData?.find((item) => item.distance === 10)?.count ?? 0,
    '30km': shelterCountData?.find((item) => item.distance === 30)?.count ?? 0,
    '50km': shelterCountData?.find((item) => item.distance === 50)?.count ?? 0
  };

  const hasLocation = Boolean(status) && status?.status === Location.PermissionStatus.GRANTED;
  const hasData = sheltersData && sheltersData.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>우리동네 보호소 찾기</Text>
        <Pressable style={styles.flex} onPress={handlePressButton}>
          <Text style={styles.label}>전체보기</Text>
          <NavArrowIcon />
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 20, flex: 1 }}>
        <ShelterMap.DistanceBox style={{ marginBottom: 16 }} value={distanceValue} />
        <MapTouchableWrapper>
          {/* <View style={{ flex: 1 }}> */}
          <ShelterMap
            ref={mapRef}
            hasLocation={hasLocation}
            data={shelterData}
            camera={camera}
            onRefetch={handleRefetch}
            onTapMarker={handleTapMarker}
            onTapMap={handleTapMap}
            onInitialized={handleInitMap}
            selectedMarkerId={selectedMarkerId}
            isShowCompass={controlsVisible}
            isShowScaleBar={controlsVisible}
            isShowLocationButton={controlsVisible}
            isShowZoomControls={controlsVisible}
            isZoomGesturesEnabled={false}
            isTiltGesturesEnabled={false}
            isRotateGesturesEnabled={false}
            minZoom={10}
            // maxZoom={10}
          />
          {/* </View> */}
        </MapTouchableWrapper>
        {hasData && <ShelterCardList data={shelterData} />}
      </View>
    </View>
  );
};

export default MainShelterSection;

const ShelterCardList = ({ data }: Record<'data', ShelterValue[]>) => {
  const handlePressCard = useCallback((id: number) => {
    router.push({ pathname: '/shelters/[id]', params: { id } });
  }, []);

  const handlePress = () => {
    router.push('/shelters');
  };

  const renderItem = ({ item }: ListRenderItemInfo<ShelterValue>) => {
    const { name, address, tel } = item;

    return (
      <Pressable onPress={() => handlePressCard(item.id)}>
        <MainShelterCard name={name} address={address} tel={tel} onPressLike={() => null} />
      </Pressable>
    );
  };

  return (
    <FlatList
      data={data}
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      horizontal={true}
      bounces
      keyExtractor={(item) => `${item.id}`}
      renderItem={renderItem}
      ListFooterComponent={() => <FullViewButton onPress={handlePress} />}
      ListFooterComponentStyle={[styles.flex, { paddingHorizontal: 20 }]}
      style={{ paddingVertical: 16 }}
      contentContainerStyle={{ gap: 16 }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.default,
    paddingVertical: 48
  },
  headerContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
    paddingHorizontal: 20
  },
  title: {
    color: theme.colors.black[900],
    fontSize: 28,
    fontWeight: '500'
  },
  label: {
    color: theme.colors.black[600],
    fontSize: 15,
    fontWeight: '500'
  },
  flex: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  }
});
