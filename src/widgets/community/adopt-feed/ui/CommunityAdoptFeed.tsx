import { FlashList } from '@shopify/flash-list';
import { styled, useTheme, View, XStack, YStack } from 'tamagui';

import { COMMUNITY_LIST_FILTER, CommunityAdoptCard } from '@/entities';
import { useCommunityAdoptFeed, useLikePost, usePostFilter } from '@/features';
import { ADOPT_ANIMAL_FILTER, ButtonGroup, ChipButton } from '@/shared';
import { DownArrow } from '@/shared/ui/icons/mini';

export const CommunityAdoptFeed = () => {
  const { black500 } = useTheme();

  const { toggleLike } = useLikePost();
  const { filter, handleChangeAnimalType, handlePressFilter } = usePostFilter();

  const { data, actions } = useCommunityAdoptFeed();
  const { navigateDetailPage: moveDetailPage } = actions;

  const filterText = COMMUNITY_LIST_FILTER.find((f) => f.id === filter.filter)?.label || '';

  return (
    <Container>
      <FlashList
        keyExtractor={({ id }) => id}
        data={data.adoptListData}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <Divider />}
        ListEmptyComponent={<></>}
        ListHeaderComponent={
          <View px={20}>
            <ButtonGroup data={ADOPT_ANIMAL_FILTER} id={filter.animalType} onChange={handleChangeAnimalType} />

            <XStack mt={16} gap={4}>
              <ChipButton
                onPress={handlePressFilter}
                right={<DownArrow width={12} height={12} color={black500.val} style={{ marginLeft: 4 }} />}
              >
                {filterText}
              </ChipButton>
            </XStack>
          </View>
        }
        renderItem={({ item }) => (
          <View px={20} py={32}>
            <CommunityAdoptCard
              {...item}
              onPressCard={() => moveDetailPage(item.id)}
              onPressLike={() => toggleLike(item.id)}
            />
          </View>
        )}
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
