import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { styled, Text, View, XStack } from 'tamagui';

import { DistancePermissionPrompt, ShelterCard, ShelterDto } from '@/entities/shelter';
import { useFavoriteShelter } from '@/features/favorite-shelter';
import { Skeleton } from '@/shared/ui';

const CARD_WIDTH = 270;
const CARD_GAP = 12;
const CARD_SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;
const CARD_MIN_HEIGHT = 102;

export type HomeShelterSectionProps = {
  shelters?: ShelterDto[];
  isGranted: boolean;
  isLoading: boolean;
};

export const HomeShelterSection = ({ shelters, isGranted, isLoading }: HomeShelterSectionProps) => {
  const { toggleFavoriteShelter } = useFavoriteShelter();

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ShelterDto>) => (
      <ShelterCard
        data={item}
        size="compact"
        onPress={(id) => router.push({ pathname: '/shelter/[id]', params: { id } })}
        onPressFavorite={toggleFavoriteShelter}
      />
    ),
    [toggleFavoriteShelter]
  );

  return (
    <>
      <HeaderContainer px={20} mb={16}>
        <Text fontSize={26} lineHeight={36} fontWeight="600" color="$black900">
          내 주변 보호소
        </Text>
        <XStack items="center" mt={12} onPress={() => router.push('/shelter')}>
          <Text fontSize={15} lineHeight={21} fontWeight="500" color="$black500">
            전체보기
          </Text>
        </XStack>
      </HeaderContainer>

      {!isGranted ? (
        <View px={20}>
          <DistancePermissionPrompt />
        </View>
      ) : (
        <FlashList
          keyExtractor={({ id }) => id}
          data={shelters}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View width={CARD_GAP} />}
          ListEmptyComponent={<EmptyComponent isLoading={isLoading} />}
          contentContainerStyle={{ paddingRight: 20 }}
          style={{ paddingLeft: 20, minHeight: CARD_MIN_HEIGHT }}
          snapToInterval={CARD_SNAP_INTERVAL}
          snapToAlignment="start"
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          horizontal
        />
      )}
    </>
  );
};

const EmptyComponent = ({ isLoading }: { isLoading: boolean }) => {
  return isLoading ? (
    <XStack gap={16}>
      {Array.from({ length: 2 }).map((_, idx) => (
        <View key={`home-shelter-card-skeleton-${idx}`} width={CARD_WIDTH} height={CARD_MIN_HEIGHT}>
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
  width: CARD_WIDTH,
  bg: '$white900',
  items: 'center',
  justify: 'center',
  borderColor: '$white800',
  borderWidth: 1,
  rounded: 12,
  height: CARD_MIN_HEIGHT
});
