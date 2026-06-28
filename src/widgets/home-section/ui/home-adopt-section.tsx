import { FlashList, FlashListRef, ListRenderItemInfo } from '@shopify/flash-list';
import { useCallback, useRef } from 'react';
import { Dimensions } from 'react-native';
import { styled, Text, View, XStack } from 'tamagui';

import { ADOPT_CARD_IMAGE_SIZES, AdoptCard, AdoptCardSkeleton, AdoptItem } from '@/entities/adopt';
import { useFavoriteAbandonment } from '@/features/favorite-abandonment';
import { SCREEN_GUTTER } from '@/shared/lib';
import { FeedNodata } from '@/shared/ui';

const CARD_GAP = 12;
const CARD_SNAP_INTERVAL = ADOPT_CARD_IMAGE_SIZES.medium + CARD_GAP;

export type HomeAdoptSectionProps = {
  convertedData: AdoptItem[];
  isLoading: boolean;
  onGoDetail: (id: string) => void;
  onGoList: () => void;
};

export const HomeAdoptSection = ({ convertedData, isLoading, onGoDetail, onGoList }: HomeAdoptSectionProps) => {
  const scrollRef = useRef<FlashListRef<AdoptItem>>(null);
  const { toggleFavoriteAbandonment } = useFavoriteAbandonment();

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<AdoptItem>) => {
      const { uri, title, description, chips, isFavorited, status } = item;

      return (
        <AdoptCard
          horizontal
          coreChipsOnly
          uri={uri}
          title={title}
          description={description}
          chips={chips}
          isFavorited={isFavorited}
          status={status}
          onPress={() => onGoDetail(item.id)}
          onPressFavorite={() => toggleFavoriteAbandonment(item.id, isFavorited ?? false)}
        />
      );
    },
    [onGoDetail, toggleFavoriteAbandonment]
  );

  return (
    <>
      <HeaderContainer px={SCREEN_GUTTER} mb={16}>
        <Text fontSize={26} lineHeight={36} fontWeight="600" color="$black900">
          보호소 공고
        </Text>
        <XStack items="center" mt={12} onPress={onGoList}>
          <Text fontSize={15} lineHeight={21} fontWeight="500" color="$black500">
            전체보기
          </Text>
        </XStack>
      </HeaderContainer>

      <FlashList
        ref={scrollRef}
        data={convertedData ?? []}
        keyExtractor={({ id }, idx) => `${id}-${idx}`}
        renderItem={renderItem}
        horizontal
        snapToInterval={CARD_SNAP_INTERVAL}
        snapToAlignment="start"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View width={CARD_GAP} />}
        contentContainerStyle={{ paddingRight: 20 }}
        style={{ paddingLeft: 20, height: 350 }}
        ListEmptyComponent={<EmptyComponent isLoading={isLoading} />}
      />
    </>
  );
};

const EmptyComponent = ({ isLoading }: { isLoading: boolean }) => {
  if (isLoading) {
    return (
      <XStack gap={18}>
        {Array.from({ length: 2 }).map((_, idx) => (
          <AdoptCardSkeleton key={`adopt-card-skeleton-${idx}`} width={ADOPT_CARD_IMAGE_SIZES.medium} />
        ))}
      </XStack>
    );
  }

  return (
    <EmptyWrap>
      <FeedNodata />
    </EmptyWrap>
  );
};

const HeaderContainer = styled(XStack, {
  justify: 'space-between',
  items: 'center'
});

const EmptyWrap = styled(View, {
  width: Dimensions.get('window').width - 40,
  items: 'center',
  justify: 'center'
});
