import { FlashList, FlashListRef, ListRenderItemInfo } from '@shopify/flash-list';
import { useCallback, useEffect, useRef } from 'react';
import { styled, Text, View, XStack, YStack } from 'tamagui';

import { ADOPT_CARD_IMAGE_SIZES, ADOPT_OPTIONS, AdoptCard, AdoptCardSkeleton, AdoptItem } from '@/entities/adopt';
import { useFavoriteAbandonment } from '@/features/favorite-abandonment';
import { ButtonGroup, Dropdown, ViewAllButton } from '@/shared/ui';

const CARD_GAP = 12;
const CARD_SNAP_INTERVAL = ADOPT_CARD_IMAGE_SIZES.medium + CARD_GAP;

export type HomeAdoptSectionProps = {
  selectedFilter: string;
  selectedType: string;
  convertedData: AdoptItem[];
  isLoading: boolean;
  onGoDetail: (id: string) => void;
  onGoList: () => void;
  onChangeFilter: (id: string) => void;
  onChangeType: (id: string) => void;
};

export const HomeAdoptSection = ({
  selectedFilter,
  selectedType,
  convertedData,
  isLoading,
  onGoDetail,
  onGoList,
  onChangeFilter,
  onChangeType
}: HomeAdoptSectionProps) => {
  const scrollRef = useRef<FlashListRef<AdoptItem>>(null);
  const { toggleFavoriteAbandonment } = useFavoriteAbandonment();

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<AdoptItem>) => {
      const { uri, title, description, chips, isFavorited } = item;

      return (
        <AdoptCard
          horizontal
          uri={uri}
          title={title}
          description={description}
          chips={chips}
          isFavorited={isFavorited}
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
  }, [selectedFilter, selectedType]);

  return (
    <>
      <TitleContainer mb={16} px={20}>
        <Text fontSize={26} lineHeight={36} fontWeight="600" color="$black900" onPress={() => onGoList()}>
          입양공고
        </Text>

        <View mt={12}>
          <Dropdown
            data={ADOPT_OPTIONS.FILTER}
            value={selectedFilter}
            onChange={(value) => onChangeFilter(value.id)}
            snapPoints={[200]}
          />
        </View>
      </TitleContainer>

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
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View width={CARD_GAP} />}
        contentContainerStyle={{ minHeight: 350 }}
        style={{ paddingLeft: 20 }}
        ListEmptyComponent={<EmptyComponent isLoading={isLoading} />}
        ListFooterComponent={<ViewAllButton onPress={onGoList} />}
        ListFooterComponentStyle={{ justifyContent: 'center', paddingHorizontal: 40 }}
      />
    </>
  );
};

const EmptyComponent = ({ isLoading }: { isLoading: boolean }) => {
  return isLoading ? (
    <XStack gap={18}>
      {Array.from({ length: 2 }).map((_, idx) => (
        <AdoptCardSkeleton key={`adopt-card-skeleton-${idx}`} width={ADOPT_CARD_IMAGE_SIZES.medium} />
      ))}
    </XStack>
  ) : (
    <YStack gap={20}>
      <NodataWrap>
        <Text fontSize={18} lineHeight={20} fontWeight="500" color="$black500">
          [No Data]
        </Text>
      </NodataWrap>
      <Text fontSize={17} lineHeight={19} fontWeight="500" color="$black900">
        공고가 없습니다
      </Text>
    </YStack>
  );
};

const TitleContainer = styled(XStack, {
  items: 'center',
  justify: 'space-between'
});

const NodataWrap = styled(XStack, {
  width: ADOPT_CARD_IMAGE_SIZES.medium,
  aspectRatio: 5 / 4,
  items: 'center',
  justify: 'center',
  bg: '$backgroundDefault',
  rounded: 8
});
