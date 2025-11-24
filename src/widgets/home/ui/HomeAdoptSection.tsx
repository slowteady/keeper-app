import { ADOPT_CARD_IMAGE_SIZES, ADOPT_LIST_FILTER, AdoptCard } from '@/entities';
import { ViewAllButton } from '@/features';
import { ADOPT_ANIMAL_FILTER, ButtonGroup, CardSkeleton, Dropdown } from '@/shared';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { useCallback } from 'react';
import { styled, Text, View, XStack, YStack } from 'tamagui';
import { AdoptItem, useHomeAdoptSection } from '../model';

export const HomeAdoptSection = () => {
  const { refs, state, data, actions, flags } = useHomeAdoptSection();

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

      <ButtonGroupWrap px={20} mb={20}>
        <ButtonGroup data={ADOPT_ANIMAL_FILTER} id={state.selectedType} onChange={(id) => actions.changeType(id)} />
      </ButtonGroupWrap>

      <XStack>
        <FlashList
          ref={refs.listRef}
          data={data.list}
          keyExtractor={({ id }, idx) => `${id}-${idx}`}
          renderItem={renderItem}
          horizontal
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ width: 18 }} />}
          style={{ paddingLeft: 20, minHeight: 390 }}
          ListEmptyComponent={<EmptyComponent isLoading={flags.isLoading} />}
          ListFooterComponent={<ViewAllButton onPress={actions.goList} />}
          ListFooterComponentStyle={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}
        />
      </XStack>
    </>
  );
};

const EmptyComponent = ({ isLoading }: { isLoading: boolean }) => {
  return isLoading ? (
    <XStack gap={18}>
      {Array.from({ length: 4 }).map((_, idx) => (
        <CardSkeleton key={idx} width={ADOPT_CARD_IMAGE_SIZES.medium} />
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
        공고가 없습니다.
      </Text>
    </YStack>
  );
};

const TitleContainer = styled(XStack, {
  items: 'center',
  justify: 'space-between'
});

const ButtonGroupWrap = styled(View, {
  self: 'baseline',
  width: '100%'
});

const NodataWrap = styled(XStack, {
  width: ADOPT_CARD_IMAGE_SIZES.medium,
  aspectRatio: 5 / 4,
  items: 'center',
  justify: 'center',
  bg: '$backgroundDefault',
  rounded: 8
});
