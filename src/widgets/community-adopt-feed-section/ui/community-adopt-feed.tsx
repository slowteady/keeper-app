import { useScrollToTop } from '@react-navigation/native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useCallback, useEffect } from 'react';
import { ActivityIndicator, RefreshControl } from 'react-native';
import { styled, useTheme, View, XStack, YStack } from 'tamagui';

import { ADOPT_OPTIONS } from '@/entities/adopt';
import type { CommunityAdoptListDto } from '@/entities/community';
import { COMMUNITY_LIST_FILTER, CommunityAdoptCard } from '@/entities/community';
import { useCommunityAdoptFeed, useCommunityListFilter } from '@/features/community';
import { useLikePost } from '@/features/like-post';
import { AnimalTypeDto, useListRefreshing, useScrollUpButton } from '@/shared/model';
import { ButtonGroup, ChipButton, FeedNodata, ScrollUpButton, ShowMoreButton } from '@/shared/ui';
import { DownArrow } from '@/shared/ui/icons/mini';

export const CommunityAdoptFeed = () => {
  const { black500 } = useTheme();

  const { toggleLikePost } = useLikePost();
  const { selectedFilter, selectedAnimalType, changeFilter, changeAnimalType } = useCommunityListFilter();
  // 'ALL'은 백엔드 enum에 없어 undefined로 전달 (전체 조회)
  const {
    adoptList,
    moreButtonText,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    refresh,
    fetchNextPage,
    goDetailPage
  } = useCommunityAdoptFeed({
    animalType: selectedAnimalType === 'ALL' ? undefined : selectedAnimalType,
    sort: selectedFilter
  });

  const { handleScroll, handlePressButton, isButtonVisible, scrollRef } = useScrollUpButton();
  useScrollToTop(scrollRef);
  const { refreshing, handleRefresh } = useListRefreshing(refresh);

  // 필터 변경 시 스크롤 상단으로 리셋 (adopt 패턴 차용)
  useEffect(() => {
    scrollRef.current?.scrollToOffset({ animated: false, offset: 0 });
  }, [selectedAnimalType, selectedFilter, scrollRef]);

  const filterText = COMMUNITY_LIST_FILTER.find((f) => f.id === selectedFilter)?.label || '';

  const handleFetchNextPage = useCallback(() => {
    impactAsync(ImpactFeedbackStyle.Medium);
    fetchNextPage();
  }, [fetchNextPage]);

  // 카드에 전달하는 콜백은 안정 ref 로 유지해야 매 스크롤/스트레치 시 카드 재렌더가 발생하지 않는다.
  const handlePressCard = useCallback((id: number) => goDetailPage(String(id)), [goDetailPage]);
  const handlePressLike = useCallback((id: number, isLiked: boolean) => toggleLikePost(id, isLiked), [toggleLikePost]);

  const renderItem = useCallback<ListRenderItem<CommunityAdoptListDto>>(
    ({ item }) => (
      <View px={20} py={32}>
        <CommunityAdoptCard
          {...item}
          content={item.content ?? ''}
          onPressCard={handlePressCard}
          onPressLike={handlePressLike}
        />
      </View>
    ),
    [handlePressCard, handlePressLike]
  );

  return (
    <Container>
      <FlashList
        ref={scrollRef}
        onScroll={handleScroll}
        keyExtractor={({ id }, i) => `${id}-${i}`}
        data={adoptList}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <Divider />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={<EmptyState isLoading={isLoading} />}
        ListHeaderComponent={
          <View px={20}>
            <View mb={16}>
              <ButtonGroup
                data={ADOPT_OPTIONS.ANIMAL}
                id={selectedAnimalType}
                onChange={(id) => changeAnimalType(id as AnimalTypeDto)}
              />
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
        ListFooterComponent={
          hasNextPage ? (
            <View my={24} justify="center">
              <ShowMoreButton text={moreButtonText} onPress={handleFetchNextPage} isLoading={isFetchingNextPage} />
            </View>
          ) : null
        }
        renderItem={renderItem}
        contentContainerStyle={{ flexGrow: 1 }}
      />

      <ScrollUpButton visible={isButtonVisible} onPress={handlePressButton} />
    </Container>
  );
};

const EmptyState = ({ isLoading }: { isLoading: boolean }) => {
  if (isLoading) {
    return (
      <View flex={1} items="center" justify="center" minH={300}>
        <ActivityIndicator />
      </View>
    );
  }
  return (
    <View flex={1} items="center" justify="center" mb={20} minH={300}>
      <FeedNodata text="아직 공고가 없어요!" />
    </View>
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
