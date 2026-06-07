import { useScrollToTop } from '@react-navigation/native';
import { FlashList, FlashListRef, ListRenderItem } from '@shopify/flash-list';
import { memo, useCallback, useEffect, useRef } from 'react';
import { ActivityIndicator, RefreshControl } from 'react-native';
import { styled, useTheme, View, XStack, YStack } from 'tamagui';

import { ADOPT_OPTIONS } from '@/entities/adopt/constant';
import type { CommunityAdoptListDto } from '@/entities/community';
import { COMMUNITY_LIST_FILTER, CommunityAdoptCard, CommunityAdoptCardSkeleton } from '@/entities/community';
import { useCommunityAdoptFeed } from '@/features/community/feed/model/use-community-adopt-feed';
import { useCommunityListFilter } from '@/features/community/feed/model/use-community-list-filter';
import { useIsLikePending, useLikePost } from '@/features/like-post';
import { AnimalTypeDto, useListRefreshing } from '@/shared/model';
import { ButtonGroup, ChipButton, FeedNodata } from '@/shared/ui';
import { DownArrow } from '@/shared/ui/icons/mini';

export const CommunityAdoptFeed = () => {
  const { black500 } = useTheme();

  const { toggleLikePost } = useLikePost();
  const { selectedFilter, selectedAnimalType, changeFilter, changeAnimalType } = useCommunityListFilter();
  // 'ALL'은 백엔드 enum에 없어 undefined로 전달 (전체 조회)
  const { adoptList, isLoading, isFetchingNextPage, hasNextPage, refresh, fetchNextPage, goDetailPage } =
    useCommunityAdoptFeed({
      animalType: selectedAnimalType === 'ALL' ? undefined : selectedAnimalType,
      sort: selectedFilter
    });

  const scrollRef = useRef<FlashListRef<CommunityAdoptListDto>>(null);
  useScrollToTop(scrollRef);
  const { refreshing, handleRefresh } = useListRefreshing(refresh);

  // 필터 변경 시 스크롤 상단으로 리셋 (adopt 패턴 차용)
  useEffect(() => {
    scrollRef.current?.scrollToOffset({ animated: false, offset: 0 });
  }, [selectedAnimalType, selectedFilter, scrollRef]);

  const filterText = COMMUNITY_LIST_FILTER.find((f) => f.id === selectedFilter)?.label || '';

  // 카드에 전달하는 콜백은 안정 ref 로 유지해야 매 스크롤/스트레치 시 카드 재렌더가 발생하지 않는다.
  const handlePressCard = useCallback((id: string) => goDetailPage(id), [goDetailPage]);
  const handlePressLike = useCallback((id: string, isLiked: boolean) => toggleLikePost(id, isLiked), [toggleLikePost]);

  const renderItem = useCallback<ListRenderItem<CommunityAdoptListDto>>(
    ({ item }) => <FeedCardItem item={item} onPressCard={handlePressCard} onPressLike={handlePressLike} />,
    [handlePressCard, handlePressLike]
  );

  return (
    <Container>
      <FlashList
        ref={scrollRef}
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
        onEndReached={hasNextPage ? fetchNextPage : undefined}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View py={24} items="center">
              <ActivityIndicator />
            </View>
          ) : null
        }
        renderItem={renderItem}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </Container>
  );
};

// 카드별 isPending 격리 — useIsLikePending 으로 그 postId 의 mutation 만 추적해 다른 카드 영향 없음.
type FeedCardItemProps = {
  item: CommunityAdoptListDto;
  onPressCard: (id: string) => void;
  onPressLike: (id: string, isLiked: boolean) => void;
};
const FeedCardItem = memo(({ item, onPressCard, onPressLike }: FeedCardItemProps) => {
  const isPending = useIsLikePending(item.id);
  return (
    <View px={20} py={32}>
      <CommunityAdoptCard
        {...item}
        content={item.content ?? ''}
        isLoading={isPending}
        onPressCard={onPressCard}
        onPressLike={onPressLike}
      />
    </View>
  );
});
FeedCardItem.displayName = 'FeedCardItem';

const EmptyState = ({ isLoading }: { isLoading: boolean }) => {
  if (isLoading) {
    return (
      <YStack>
        {Array.from({ length: 3 }).map((_, idx) => (
          <View key={idx}>
            <CommunityAdoptCardSkeleton />
            {idx < 2 && <Divider />}
          </View>
        ))}
      </YStack>
    );
  }
  return (
    <View flex={1} items="center" justify="center" mb={20} minH={300}>
      <FeedNodata text="아직 글이 없어요" />
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
