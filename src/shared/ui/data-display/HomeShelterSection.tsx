import { PermissionStatus } from 'expo-location';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Dimensions, FlatList, ListRenderItemInfo, Pressable, StyleSheet } from 'react-native';
import { Pressable as GesturePressable } from 'react-native-gesture-handler';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { styled, Text, useTheme, View, XStack } from 'tamagui';

import { ShelterDto, useGetShelterCountsQuery } from '@/domains/shelter';
import { useGetSheltersQuery } from '@/domains/shelter/services';
import { useMap } from '@/shared';
import { CameraParams } from '@/shared/model/types';
import { calcMapRadiusKm } from '@/shared/lib/utils';

import { ViewAllButton } from '../button';
import { DownArrow } from '../icons/mini';
import { MainShelterCard } from './MainShelterCard';
import { ShelterMap } from './ShelterMap';

const CARD_WIDTH = 270;
const CARD_GAP = 12;

export const HomeShelterSection = () => {
  const [enabled, setEnabled] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState<number>();
  const [shelterData, setShelterData] = useState<ShelterDto[]>([]);

  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const { black500 } = useTheme();
  const { camera, setCamera, distance, setDistance, initialLocation, mapRef, permissionStatus } = useMap();

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
  const { data: shelterCountsData } = useGetShelterCountsQuery(
    {
      latitude: initialLocation?.latitude || 0,
      longitude: initialLocation?.longitude || 0
    },
    { enabled: !!initialLocation, staleTime: 1000 * 60 * 60 }
  );

  const handlePressTitle = () => {
    router.push('/shelter');
  };
  const handlePressCard = useCallback((id: number) => {
    router.push({ pathname: '/shelter/[id]', params: { id } });
  }, []);
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

  useEffect(() => {
    if (!sheltersData) return;
    setShelterData(sheltersData);
  }, [sheltersData]);

  const animatedListStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }]
  }));

  const hasLocationStatus = permissionStatus?.status === PermissionStatus.GRANTED;

  return (
    <Container>
      <HeaderContainer>
        <Pressable onPress={handlePressTitle} style={styles.titleWrap}>
          <Title>보호소 찾기</Title>
        </Pressable>

        <Pressable style={styles.flex} onPress={handlePressTitle}>
          <Label>전체보기</Label>
          <DownArrow width={10} height={6} color={black500.val} transform={[{ rotate: '-90deg' }]} />
        </Pressable>
      </HeaderContainer>

      <View px={20}>
        <ShelterMap.DistanceBox
          value={shelterCountsData}
          hasLocationStatus={hasLocationStatus}
          style={{ marginBottom: 16 }}
        />
      </View>

      <View px={20} mb={16}>
        <ShelterMap
          ref={mapRef}
          hasLocation={hasLocationStatus}
          data={shelterData}
          camera={camera}
          onInitialized={() => setEnabled(true)}
          onRefetch={handleRefetch}
          onTapMarker={handleTapMarker}
          selectedMarkerId={selectedMarkerId}
          isShowCompass={false}
          minZoom={10}
        />
      </View>

      <Animated.View style={[{ marginLeft: 20 }, animatedListStyle]}>
        <FlatList
          keyExtractor={(item) => `${item.id}`}
          data={shelterData}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          horizontal
          scrollEventThrottle={40}
          nestedScrollEnabled
          snapToInterval={CARD_WIDTH + CARD_GAP}
          ListFooterComponent={() => <ViewAllButton onPress={handlePressTitle} />}
          ListFooterComponentStyle={[styles.flex, { paddingHorizontal: 20 }]}
          contentContainerStyle={{ gap: CARD_GAP }}
          ListEmptyComponent={
            isLoading ? (
              <XStack gap={16}>
                {Array.from({ length: 4 }).map((_, idx) => (
                  <SkeltonContainer key={idx}>
                    <Skeleton />
                  </SkeltonContainer>
                ))}
              </XStack>
            ) : (
              <Nodata />
            )
          }
        />
      </Animated.View>
    </Container>
  );
};

const Nodata = () => {
  return (
    <NodataContainer>
      <NodataText>가까운 곳에 보호소가 없습니다.</NodataText>
    </NodataContainer>
  );
};

const Container = styled(View, {
  bg: '$white900',
  pb: 80
});
const HeaderContainer = styled(XStack, {
  justify: 'space-between',
  items: 'center',
  px: 20,
  mb: 16
});
const Title = styled(Text, {
  color: '$black900',
  fontSize: 26,
  lineHeight: 36,
  fontWeight: '600'
});
const Label = styled(Text, {
  color: '$black500',
  fontSize: 15,
  lineHeight: 21,
  fontWeight: '500'
});
const SkeltonContainer = styled(View, {
  width: CARD_WIDTH,
  height: 140
});
const Skeleton = styled(View, {
  width: '100%',
  height: '100%',
  rounded: 4
});
const NodataContainer = styled(XStack, {
  width: Dimensions.get('screen').width - 40,
  height: 144,
  bg: '$white900',
  items: 'center',
  justify: 'center',
  rounded: 8
});
const NodataText = styled(Text, {
  color: '$black500',
  fontSize: 14,
  lineHeight: 16,
  fontWeight: '500'
});
const styles = StyleSheet.create({
  titleWrap: {
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center'
  },
  flex: {
    marginTop: 12,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2
  }
});
