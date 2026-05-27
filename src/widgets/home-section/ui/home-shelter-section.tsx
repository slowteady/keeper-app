import { Camera, NaverMapViewRef } from '@mj-studio/react-native-naver-map';
import { FlashList, FlashListRef, ListRenderItemInfo } from '@shopify/flash-list';
import { router } from 'expo-router';
import { RefObject, useCallback, useEffect, useRef } from 'react';
import { ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { styled, Text, useTheme, View, XStack } from 'tamagui';

import {
  DistanceIndicator,
  DistancePermissionPrompt,
  HOME_SHELTER_CARD_SIZE,
  HomeShelterCard,
  ShelterCountDto,
  ShelterDto,
  ShelterMap
} from '@/entities/shelter';
import { useFavoriteShelter } from '@/features/favorite-shelter';
import { CameraParams } from '@/shared/model';
import { Skeleton, ViewAllButton } from '@/shared/ui';
import { DownArrow } from '@/shared/ui/icons/mini';

const SHELTER_CARD_MIN_HEIGHT = 144;

export type HomeShelterSectionProps = {
  shelters?: ShelterDto[];
  shelterCounts?: ShelterCountDto[];
  mapRef: RefObject<NaverMapViewRef | null>;
  camera?: Camera;
  selectedMarkerId?: string;
  isGranted: boolean;
  isLoading: boolean;
  animatedListStyle: ViewStyle;
  onMapInitialized: () => void;
  onRefetch: (params?: CameraParams) => void;
  onTapMarker: (data: ShelterDto) => void;
};

export const HomeShelterSection = ({
  shelters,
  shelterCounts,
  mapRef,
  camera,
  selectedMarkerId,
  isGranted,
  isLoading,
  animatedListStyle,
  onMapInitialized,
  onRefetch,
  onTapMarker
}: HomeShelterSectionProps) => {
  const { black500 } = useTheme();
  const listRef = useRef<FlashListRef<ShelterDto>>(null);
  const { toggleFavoriteShelter } = useFavoriteShelter();

  useEffect(() => {
    if (selectedMarkerId && listRef.current) {
      listRef.current.scrollToOffset({ animated: true, offset: 0 });
    }
  }, [selectedMarkerId]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ShelterDto>) => {
      return (
        <View onPress={() => router.push({ pathname: '/shelter/[id]', params: { id: item.id } })}>
          <HomeShelterCard
            careRegNo={item.id}
            name={item.name}
            address={item.address}
            tel={item.tel ?? '-'}
            isFavorited={item.isFavorited}
            onPressFavorite={toggleFavoriteShelter}
          />
        </View>
      );
    },
    [toggleFavoriteShelter]
  );

  return (
    <>
      <HeaderContainer px={20} mb={16}>
        <Text fontSize={26} lineHeight={36} fontWeight="600" color="$black900" onPress={() => router.push('/shelter')}>
          보호소 찾기
        </Text>
        <XStack items="center" gap={2} mt={12} onPress={() => router.push('/shelter')}>
          <Text fontSize={15} lineHeight={21} fontWeight="500" color="$black500">
            전체보기
          </Text>
          <DownArrow width={10} height={6} color={black500.val} transform={[{ rotate: '-90deg' }]} />
        </XStack>
      </HeaderContainer>

      <View px={20} mb={16}>
        {isGranted ? <DistanceIndicator value={shelterCounts ?? []} /> : <DistancePermissionPrompt />}
      </View>

      <View px={20} mb={16}>
        <ShelterMap
          data={shelters}
          ref={mapRef}
          camera={camera}
          selectedMarkerId={selectedMarkerId}
          onInitialized={onMapInitialized}
          onRefetch={onRefetch}
          onTapMarker={onTapMarker}
          hasLocation={isGranted}
          isShowCompass={false}
          minZoom={10}
        />
      </View>

      {isGranted && (
        <Animated.View style={animatedListStyle}>
          <FlashList
            ref={listRef}
            keyExtractor={({ id }) => id}
            data={shelters}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View width={12} />}
            ListEmptyComponent={<EmptyComponent isLoading={isLoading} />}
            ListFooterComponent={() => <ViewAllButton onPress={() => router.push('/shelter')} />}
            ListFooterComponentStyle={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}
            style={{ paddingLeft: 20, minHeight: SHELTER_CARD_MIN_HEIGHT }}
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            horizontal
          />
        </Animated.View>
      )}
    </>
  );
};

const EmptyComponent = ({ isLoading }: { isLoading: boolean }) => {
  return isLoading ? (
    <XStack gap={16}>
      {Array.from({ length: 2 }).map((_, idx) => (
        <View
          key={`home-shelter-card-skeleton-${idx}`}
          width={HOME_SHELTER_CARD_SIZE.SMALL}
          height={SHELTER_CARD_MIN_HEIGHT}
        >
          <Skeleton style={{ width: '100%', height: '100%', borderRadius: 12 }} />
        </View>
      ))}
    </XStack>
  ) : (
    <NodataContainer>
      <Text fontSize={14} lineHeight={16} fontWeight="500" color="$black500">
        가까운 곳에 보호소가 없어요
      </Text>
    </NodataContainer>
  );
};

const HeaderContainer = styled(XStack, {
  justify: 'space-between',
  items: 'center'
});

const NodataContainer = styled(XStack, {
  width: HOME_SHELTER_CARD_SIZE.SMALL,
  bg: '$white900',
  items: 'center',
  justify: 'center',
  borderColor: '$white800',
  borderWidth: 1,
  rounded: 12
});
