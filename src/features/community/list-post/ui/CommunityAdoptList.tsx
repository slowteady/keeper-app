import { FlashList } from '@shopify/flash-list';
import { styled, useTheme, View, XStack, YStack } from 'tamagui';

import { ADOPT_ANIMAL_TYPES } from '@/domains/animal';
import { AdoptCard, COMMUNITY_LIST_FILTER } from '@/entities';
import { useCommunityAdoptList } from '@/features';
import { ButtonGroup, ChipButton } from '@/shared';
import { DownArrow } from '@/shared/ui/icons/mini';

export const CommunityAdoptList = () => {
  const { black500 } = useTheme();

  const { state, actions, data } = useCommunityAdoptList();
  const { handleChangeAnimalType, handlePressFilter, moveDetailPage, handlePressLike } = actions;

  const filterText = COMMUNITY_LIST_FILTER.find((filter) => filter.id === state.adoptFilter.filter)?.label || '';

  return (
    <Container>
      <FlashList
        data={data.adoptListData}
        renderItem={({ item }) => (
          <View px={20} py={32}>
            <AdoptCard
              {...item}
              onPressCard={() => moveDetailPage(item.id)}
              onPressLike={() => handlePressLike(item.id)}
              isLoading={false}
            />
          </View>
        )}
        ListEmptyComponent={<></>}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <Divider />}
        ListHeaderComponent={
          <View px={20}>
            <ButtonGroup
              data={ADOPT_ANIMAL_TYPES}
              id={state.adoptFilter.animalType}
              onChange={handleChangeAnimalType}
            />

            <XStack mt={16} gap={4}>
              {/* <ChipButton isPressable onPress={() => handleChangeFilter('LOCATION')}>
                내 근처
              </ChipButton> */}
              {/* <ChipButton isPressable onPress={() => handleChangeFilter('PROMO')}>
                입양홍보
              </ChipButton> */}
              <ChipButton
                onPress={handlePressFilter}
                right={<DownArrow width={12} height={12} color={black500.val} style={{ marginLeft: 4 }} />}
              >
                {filterText}
              </ChipButton>
            </XStack>
          </View>
        }
      />
    </Container>
  );
};

const Container = styled(YStack, {
  flex: 1,
  py: 16
});
const Divider = styled(View, {
  height: 1,
  bg: '$white800'
});
