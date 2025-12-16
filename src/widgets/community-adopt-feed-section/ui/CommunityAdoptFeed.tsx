import { FlashList } from '@shopify/flash-list';
import { styled, useTheme, View, XStack, YStack } from 'tamagui';

import { COMMUNITY_LIST_FILTER, CommunityAdoptCard } from '@/entities';
import { useCommunityAdoptFeed, usePostFilter } from '@/features';
import { ADOPT_ANIMAL_FILTER, ButtonGroup, ChipButton, ScrollUpButton, useLikePost, useScrollUpButton } from '@/shared';
import { DownArrow } from '@/shared/ui/icons/mini';

export const CommunityAdoptFeed = () => {
  const { black500 } = useTheme();

  const { handleScroll, handlePressButton, isButtonVisible, scrollRef } = useScrollUpButton();
  const { actions: likeActions } = useLikePost();
  const { state: filterState, actions: filterActions } = usePostFilter();
  const { data, actions: feedActions } = useCommunityAdoptFeed();

  const filterText = COMMUNITY_LIST_FILTER.find((f) => f.id === filterState.selectedFilter)?.label || '';

  return (
    <Container>
      <FlashList
        ref={scrollRef}
        onScroll={handleScroll}
        keyExtractor={({ id }, i) => `${id}-${i}`}
        data={data.adoptList}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <Divider />}
        ListEmptyComponent={<></>}
        ListHeaderComponent={
          <View px={20}>
            <View mb={16}>
              <ButtonGroup
                data={ADOPT_ANIMAL_FILTER}
                id={filterState.selectedAnimalType}
                onChange={filterActions.changeAnimalType}
              />
            </View>

            <XStack gap={4}>
              <ChipButton
                onPress={filterActions.changeFilter}
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
              onPressCard={() => feedActions.goDetailPage(item.id)}
              onPressLike={() => likeActions.toggleLikePost(item.id)}
            />
          </View>
        )}
      />

      <ScrollUpButton visible={isButtonVisible} onPress={handlePressButton} />
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
