import { FlashList, FlashListRef, ListRenderItemInfo } from '@shopify/flash-list';
import { useCallback, useEffect, useRef } from 'react';
import { Dimensions } from 'react-native';
import { styled, Text, useTheme, View, XStack } from 'tamagui';

import { ADOPT_CARD_IMAGE_SIZES, ADOPT_OPTIONS, AdoptCard, AdoptCardSkeleton, AdoptItem } from '@/entities/adopt';
import { useFavoriteAbandonment } from '@/features/favorite-abandonment';
import { ButtonGroup, FeedNodata } from '@/shared/ui';
import { DownArrow } from '@/shared/ui/icons/mini';

const CARD_GAP = 12;
const CARD_SNAP_INTERVAL = ADOPT_CARD_IMAGE_SIZES.medium + CARD_GAP;

export type HomeAdoptSectionProps = {
  selectedType: string;
  convertedData: AdoptItem[];
  isLoading: boolean;
  onGoDetail: (id: string) => void;
  onGoList: () => void;
  onChangeType: (id: string) => void;
};

export const HomeAdoptSection = ({
  selectedType,
  convertedData,
  isLoading,
  onGoDetail,
  onGoList,
  onChangeType
}: HomeAdoptSectionProps) => {
  const scrollRef = useRef<FlashListRef<AdoptItem>>(null);
  const { black500 } = useTheme();
  const { toggleFavoriteAbandonment } = useFavoriteAbandonment();

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<AdoptItem>) => {
      const { uri, title, description, chips, isFavorited, status } = item;

      return (
        <AdoptCard
          horizontal
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToOffset({ animated: false, offset: 0 });
    }
  }, [selectedType]);

  return (
    <>
      <HeaderContainer px={20} mb={16}>
        <Text fontSize={26} lineHeight={36} fontWeight="600" color="$black900">
          최근 입양공고
        </Text>
        <XStack items="center" gap={2} mt={12} onPress={onGoList}>
          <Text fontSize={15} lineHeight={21} fontWeight="500" color="$black500">
            전체보기
          </Text>
          <DownArrow width={10} height={6} color={black500.val} transform={[{ rotate: '-90deg' }]} />
        </XStack>
      </HeaderContainer>

      <View px={20} mb={20}>
        <ButtonGroup data={ADOPT_OPTIONS.ANIMAL} id={selectedType} onChange={(id) => onChangeType(id)} />
      </View>

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
        contentContainerStyle={{ minHeight: 350, paddingRight: 20 }}
        style={{ paddingLeft: 20 }}
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
