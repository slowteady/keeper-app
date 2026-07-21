import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { ChevronRight } from '@tamagui/lucide-icons';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { Dimensions, Pressable } from 'react-native';
import { styled, Text, View, XStack, YStack } from 'tamagui';

import { DistancePermissionPrompt, ShelterCard, ShelterDto } from '@/entities/shelter';
import { useFavoriteShelter } from '@/features/favorite-shelter';
import { SCREEN_GUTTER } from '@/shared/lib';
import { Skeleton } from '@/shared/ui';

const CARD_WIDTH = 270;
const CARD_GAP = 12;
const CARD_SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;
const CARD_MIN_HEIGHT = 102;
const SCREEN_GUTTER_PX = 20;
const NODATA_WIDTH = Dimensions.get('window').width - SCREEN_GUTTER_PX * 2;

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
      <HeaderContainer px={SCREEN_GUTTER} mb={16}>
        <Text fontSize={26} lineHeight={36} fontWeight="700" color="$black900">
          내 주변 보호소
        </Text>
        <XStack items="center" mt={12} onPress={() => router.push('/shelter')}>
          <Text fontSize={15} lineHeight={21} fontWeight="500" color="$black500">
            전체보기
          </Text>
        </XStack>
      </HeaderContainer>

      {!isGranted ? (
        <View px={SCREEN_GUTTER}>
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

const NODATA_COLOR = '#7E7E7E';

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
    <NodataCard />
  );
};

const NodataCard = () => (
  <NodataContainer>
    <YStack flex={1}>
      <NodataText>가까운 곳에 보호소가 없어요</NodataText>
      <XStack items="center" justify="space-between">
        <NodataText>좀 더 넓은 범위로 설정해보세요</NodataText>
        <Pressable
          onPress={() => router.push('/shelter')}
          accessibilityRole="button"
          accessibilityLabel="전체 보호소 보기"
          hitSlop={10}
        >
          <ChevronRight size={20} color={'#ADB3AF' as never} />
        </Pressable>
      </XStack>
    </YStack>
  </NodataContainer>
);

const HeaderContainer = styled(XStack, {
  justify: 'space-between',
  items: 'center'
});

const NodataContainer = styled(XStack, {
  width: NODATA_WIDTH,
  bg: '#F7F7F7',
  items: 'center',
  justify: 'space-between',
  rounded: 16,
  px: 20,
  py: 24
});

const NodataText = styled(Text, {
  fontSize: 16,
  lineHeight: 24,
  fontWeight: '500',
  color: NODATA_COLOR
});
