import FullViewButton from '@/components/atoms/button/FullViewButton';
import { DropDownArrowDownIcon, MenuArrowIcon } from '@/components/atoms/icons/ArrowIcon';
import MainShelterCard from '@/components/organisms/card/MainShelterCard';
import { ShelterMap } from '@/components/organisms/map/ShelterMap';
import theme from '@/constants/theme';
import { useGetShelterCount, useGetShelters } from '@/hooks/queries/useShelters';
import { useMapInit } from '@/hooks/useMapInit';
import { CameraParams } from '@/types/map';
import { ShelterValue } from '@/types/scheme/shelters';
import { calcMapRadiusKm } from '@/utils/mapUtils';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, ListRenderItemInfo, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const MainShelterSection = () => {
  const [enabled, setEnabled] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState<number>();
  const [shelterData, setShelterData] = useState<ShelterValue[]>([]);
  const { camera, setCamera, distance, setDistance, initialLocation, mapRef, permissionStatus } = useMapInit();
  const scale = useSharedValue(1);

  const { data: sheltersData } = useGetShelters(
    {
      latitude: camera?.latitude || 0,
      longitude: camera?.longitude || 0,
      distance,
      userLatitude: initialLocation?.latitude || 0,
      userLongitude: initialLocation?.longitude || 0
    },
    { enabled: !!camera && enabled, staleTime: 1000 * 60 * 60 }
  );

  const { data: shelterCountData } = useGetShelterCount({
    latitude: initialLocation?.latitude || 0,
    longitude: initialLocation?.longitude || 0
  });

  useEffect(() => {
    if (!sheltersData) return;
    setShelterData(sheltersData);
  }, [sheltersData]);

  const handlePressTitle = () => {
    router.push('/shelters');
  };
  const handleRefetch = (params?: CameraParams) => {
    if (!params) return null;

    const { latitude, longitude, zoom, region } = params;
    setCamera({ latitude, longitude, zoom });
    setSelectedMarkerId(undefined);

    const radius = calcMapRadiusKm({ ...region, latitude, longitude });
    setDistance(radius);
  };
  const handleTapMarker = (data: ShelterValue) => {
    setSelectedMarkerId(data.id);
    setShelterData((prev) => [data, ...prev.filter((item) => item.id !== data.id)]);
    scale.value = withTiming(0.7, { duration: 100 }, () => {
      scale.value = withTiming(1, { duration: 100 });
    });
  };
  const handleInitMap = () => {
    setEnabled(true);
  };

  const animatedListStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const hasLocationStatus = permissionStatus?.status === Location.PermissionStatus.GRANTED;
  const hasData = sheltersData !== undefined && sheltersData.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Pressable onPress={handlePressTitle} style={styles.titleWrap}>
          <Text style={styles.title}>보호소 찾기</Text>
          <MenuArrowIcon strokeWidth={2} />
        </Pressable>

        <Pressable style={styles.flex} onPress={handlePressTitle}>
          <Text style={styles.label}>전체보기</Text>
          <DropDownArrowDownIcon color={theme.colors.black[500]} transform={[{ rotate: '-90deg' }]} />
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 20, flex: 1 }}>
        <ShelterMap.DistanceBox value={shelterCountData} style={{ marginBottom: 16 }} />
        <View style={{ marginBottom: 20 }}>
          <ShelterMap
            ref={mapRef}
            hasLocation={hasLocationStatus}
            data={shelterData}
            camera={camera}
            onInitialized={handleInitMap}
            onRefetch={handleRefetch}
            onTapMarker={handleTapMarker}
            selectedMarkerId={selectedMarkerId}
            isShowCompass={false}
            minZoom={10}
          />
        </View>
        {hasData && (
          <Animated.View style={[{ marginBottom: 20 }, animatedListStyle]}>
            <ShelterCardList data={shelterData} />
          </Animated.View>
        )}
      </View>
    </View>
  );
};

export default MainShelterSection;

const ShelterCardList = ({ data }: Record<'data', ShelterValue[]>) => {
  const handlePressCard = useCallback((id: number) => {
    router.push({ pathname: '/shelters/[id]', params: { id } });
  }, []);
  const handlePress = useCallback(() => {
    router.push('/shelters');
  }, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ShelterValue>) => {
      const { name, address, tel } = item;

      return (
        <Pressable onPress={() => handlePressCard(item.id)}>
          <MainShelterCard name={name} address={address} tel={tel} />
        </Pressable>
      );
    },
    [handlePressCard]
  );

  return (
    <FlatList
      data={data}
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      horizontal={true}
      scrollEventThrottle={40}
      bounces
      keyExtractor={(item) => `${item.id}`}
      nestedScrollEnabled={true}
      renderItem={renderItem}
      snapToInterval={270 + 16}
      ListFooterComponent={() => <FullViewButton onPress={handlePress} />}
      ListFooterComponentStyle={[styles.flex, { paddingHorizontal: 20 }]}
      contentContainerStyle={{ gap: 16 }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.default,
    paddingVertical: 56
  },
  headerContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 20
  },
  titleWrap: {
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center'
  },
  title: {
    color: theme.colors.black[900],
    fontSize: 32,
    fontWeight: '500'
  },
  label: {
    color: theme.colors.black[500],
    fontSize: 15,
    lineHeight: 17,
    fontWeight: '500'
  },
  flex: {
    marginTop: 12,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2
  },
  distanceSkelton: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 6,
    width: '100%',
    height: 40,
    marginBottom: 16
  }
});
