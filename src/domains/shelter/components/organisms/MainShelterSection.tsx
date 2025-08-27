import { useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Dimensions, FlatList, ListRenderItemInfo, Pressable, StyleSheet, Text, View } from 'react-native';
import { Pressable as GesturePressable } from 'react-native-gesture-handler';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { FullViewButton } from '@/shared/components/atoms/FullViewButton';
import { DownArrow } from '@/shared/components/atoms/icons/mini';
import { RightArrow } from '@/shared/components/atoms/icons/solid';
import { Skeleton } from '@/shared/components/molecules/Skeleton';
import { MainShelterCard } from '@/shared/components/organisms/MainShelterCard';
import { ShelterMap } from '@/shared/components/organisms/ShelterMap';
import { SHELTER_COUNT_QUERY_KEY } from '@/shared/constants/queryKey.constants';
import { theme } from '@/shared/constants/theme.constants';
import { useMap } from '@/shared/hooks/useMap';
import { CameraParams } from '@/shared/types/map.types';
import { calcMapRadiusKm } from '@/shared/utils/map.utils';

import { useGetShelterCountsQuery, useGetSheltersQuery } from '../../services/shelter.services';
import { ShelterDto } from '../../types/shelter.types';

export const MainShelterSection = () => {
  const [enabled, setEnabled] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState<number>();
  const [shelterData, setShelterData] = useState<ShelterDto[]>([]);
  const { camera, setCamera, distance, setDistance, initialLocation, mapRef, permissionStatus } = useMap();
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const { name } = useRoute();

  const { data: sheltersData, isLoading } = useGetSheltersQuery(
    {
      latitude: camera?.latitude || 0,
      longitude: camera?.longitude || 0,
      distance,
      userLatitude: initialLocation?.latitude || 0,
      userLongitude: initialLocation?.longitude || 0
    },
    {
      select: ({ data }) => {
        return data.data.sort((a, b) => a.distance - b.distance);
      },
      enabled: !!camera && enabled,
      staleTime: 1000 * 60 * 60
    }
  );

  const { data: shelterCountData } = useGetShelterCountsQuery(
    {
      latitude: initialLocation?.latitude || 0,
      longitude: initialLocation?.longitude || 0
    },
    { queryKey: [SHELTER_COUNT_QUERY_KEY, name], enabled: !!initialLocation, staleTime: 0 }
  );

  useEffect(() => {
    if (!sheltersData) return;
    setShelterData(sheltersData);
  }, [sheltersData]);

  const handleInitMap = () => {
    setEnabled(true);
  };
  const handlePressTitle = () => {
    router.push('/shelter');
  };
  const handleRefetch = (params?: CameraParams) => {
    if (!params) return null;

    const { latitude, longitude, zoom, region } = params;
    setCamera({ latitude, longitude, zoom });
    setSelectedMarkerId(undefined);

    const radius = calcMapRadiusKm({
      longitudeDelta: region?.longitudeDelta || 0,
      latitudeDelta: region?.latitudeDelta || 0,
      latitude,
      longitude
    });
    setDistance(radius);
  };
  const handleTapMarker = (data: ShelterDto) => {
    opacity.value = withTiming(0, { duration: 100 });
    translateY.value = withTiming(50, { duration: 300 });

    setTimeout(() => {
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.exp)
      });
    }, 200);

    setSelectedMarkerId(data.id);
    setShelterData((prev) => [data, ...prev.filter((item) => item.id !== data.id)]);
  };

  const animatedListStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }]
  }));

  const hasLocationStatus = permissionStatus?.status === Location.PermissionStatus.GRANTED;

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Pressable onPress={handlePressTitle} style={styles.titleWrap}>
          <Text style={styles.title}>보호소 찾기</Text>
          <RightArrow width={11} height={18} color={theme.colors.black[900]} />
        </Pressable>

        <Pressable style={styles.flex} onPress={handlePressTitle}>
          <Text style={styles.label}>전체보기</Text>
          <DownArrow width={10} height={6} color={theme.colors.black[500]} transform={[{ rotate: '-90deg' }]} />
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 20 }}>
        <ShelterMap.DistanceBox
          value={shelterCountData}
          hasLocationStatus={hasLocationStatus}
          style={{ marginBottom: 16 }}
        />
      </View>
      <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
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
      <Animated.View style={[{ marginLeft: 20, marginBottom: 20 }, animatedListStyle]}>
        <ShelterCardList data={shelterData} isLoading={isLoading} />
      </Animated.View>
    </View>
  );
};

interface ShelterCardListProps {
  data: ShelterDto[];
  isLoading: boolean;
}
const ShelterCardList = ({ data, isLoading }: ShelterCardListProps) => {
  const handlePressCard = useCallback((id: number) => {
    router.push({ pathname: '/shelter/[id]', params: { id } });
  }, []);
  const handlePress = useCallback(() => {
    router.push('/shelter');
  }, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ShelterDto>) => {
      const { name, address, tel } = item;

      return (
        <GesturePressable onPress={() => handlePressCard(item.id)}>
          <MainShelterCard name={name} address={address} tel={tel} />
        </GesturePressable>
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
      ListEmptyComponent={
        isLoading ? (
          <View style={{ flexDirection: 'row', gap: 16 }}>
            {Array.from({ length: 4 }).map((_, idx) => (
              <View key={idx} style={styles.skeletonContainer}>
                <Skeleton style={styles.skeleton} />
              </View>
            ))}
          </View>
        ) : (
          <Nodata />
        )
      }
      contentContainerStyle={{ gap: 16 }}
    />
  );
};

const Nodata = () => {
  return (
    <View style={styles.noDataContainer}>
      <Text style={styles.noDataText}>가까운 곳에 보호소가 없습니다.</Text>
    </View>
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
    lineHeight: 40,
    fontWeight: '500'
  },
  label: {
    color: theme.colors.black[500],
    fontSize: 15,
    lineHeight: 21,
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
  },
  noDataContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: Dimensions.get('screen').width - 40,
    height: 144,
    backgroundColor: theme.colors.white[900],
    borderRadius: 8
  },
  noDataText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 16,
    color: theme.colors.black[500]
  },
  skeletonContainer: {
    width: 270,
    height: 140
  },
  skeleton: {
    width: '100%',
    height: '100%',
    borderRadius: 4
  }
});
