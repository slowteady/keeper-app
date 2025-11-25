import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { useCallback } from 'react';
import { styled, Text, View, XStack } from 'tamagui';

import { ADOPT_CARD_IMAGE_SIZES, ADOPT_LIST_FILTER, AdoptCard, AdoptCardSkeleton, AdoptNodata } from '@/entities';
import { AdoptItem, useAdoptList } from '@/features';
import { ADOPT_ANIMAL_FILTER, ButtonGroup, Dropdown, ViewAllButton } from '@/shared';

export const HomeAdoptSection = () => {
  const { refs, state, data, actions, flags } = useAdoptList();

  const renderItem = useCallback(({ item }: ListRenderItemInfo<AdoptItem>) => {
    const { uri, title, description, chips } = item;

    return (
      <View onPress={() => actions.goDetail(item.id)}>
        <AdoptCard uri={uri} title={title} description={description} chips={chips} />
      </View>
    );
  }, []);

  return (
    <>
      <TitleContainer mb={16} px={20}>
        <Text fontSize={26} lineHeight={36} fontWeight="600" color="$black900">
          오늘의 입양공고
        </Text>

        <View mt={12}>
          <Dropdown
            data={[...ADOPT_LIST_FILTER]}
            value={state.selectedFilter}
            onChange={(value) => actions.changeFilter(value.id)}
            snapPoints={[200]}
          />
        </View>
      </TitleContainer>

      <View px={20} mb={20}>
        <ButtonGroup data={ADOPT_ANIMAL_FILTER} id={state.selectedType} onChange={(id) => actions.changeType(id)} />
      </View>

      <FlashList
        ref={refs.listRef}
        data={data.convertedData}
        keyExtractor={({ id }, idx) => `${id}-${idx}`}
        renderItem={renderItem}
        horizontal
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View width={18} />}
        style={{ paddingLeft: 20 }}
        ListEmptyComponent={<EmptyComponent isLoading={flags.isLoading} />}
        ListFooterComponent={<ViewAllButton onPress={actions.goList} />}
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
    <AdoptNodata />
  );
};

const TitleContainer = styled(XStack, {
  items: 'center',
  justify: 'space-between'
});

{
  /* <YStack gap={20}>
  <NodataWrap>
    <Text fontSize={18} lineHeight={20} fontWeight="500" color="$black500">
      [No Data]
    </Text>
  </NodataWrap>
  <Text fontSize={17} lineHeight={19} fontWeight="500" color="$black900">
    공고가 없습니다.
  </Text>
</YStack>; */
}

// const NodataWrap = styled(XStack, {
//   width: ADOPT_CARD_IMAGE_SIZES.medium,
//   aspectRatio: 5 / 4,
//   items: 'center',
//   justify: 'center',
//   bg: '$backgroundDefault',
//   rounded: 8
// });
