import { FlashList } from '@shopify/flash-list';
import { styled, useTheme, View, XStack, YStack } from 'tamagui';

import { makeAdoptOption } from '@/entities/adopt';
import { COMMUNITY_LIST_FILTER, CommunityAdoptCard } from '@/entities/community';
import { useLikePost } from '@/features/common';
import { useCommunityAdoptFeed, useCommunityListFilter } from '@/features/community';
import { useScrollUpButton } from '@/shared/model';
import { ButtonGroup, ChipButton, ScrollUpButton } from '@/shared/ui';
import { DownArrow } from '@/shared/ui/icons/mini';

export const CommunityAdoptFeed = () => {
  const { black500 } = useTheme();

  const { handleScroll, handlePressButton, isButtonVisible, scrollRef } = useScrollUpButton();
  const { toggleLikePost } = useLikePost();
  const { selectedFilter, selectedAnimalType, changeFilter, changeAnimalType } = useCommunityListFilter();
  const { adoptList, goDetailPage } = useCommunityAdoptFeed();

  const filterText = COMMUNITY_LIST_FILTER.find((f) => f.id === selectedFilter)?.label || '';

  return (
    <Container>
      <FlashList
        ref={scrollRef}
        onScroll={handleScroll}
        keyExtractor={({ id }, i) => `${id}-${i}`}
        data={adoptList}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <Divider />}
        ListEmptyComponent={<></>}
        ListHeaderComponent={
          <View px={20}>
            <View mb={16}>
              <ButtonGroup data={makeAdoptOption('ANIMAL')} id={selectedAnimalType} onChange={changeAnimalType} />
            </View>

            <XStack gap={4}>
              <ChipButton
                onPress={changeFilter}
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
              onPressCard={() => goDetailPage(item.id)}
              onPressLike={() => toggleLikePost(item.id)}
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
