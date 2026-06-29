import { useScrollToTop } from '@react-navigation/native';
import { FlashList, FlashListRef, ListRenderItem } from '@shopify/flash-list';
import { useCallback, useRef } from 'react';
import { ActivityIndicator, NativeScrollEvent, NativeSyntheticEvent, RefreshControl } from 'react-native';
import { styled, View, XStack, YStack } from 'tamagui';

import { ADOPT_OPTIONS } from '@/entities/adopt';
import {
  CommunityQnaCard,
  CommunityQnaListItemDto,
  QNA_CATEGORY_FILTER_OPTIONS,
  QNA_CATEGORY_OPTIONS,
  QNA_SORT_OPTIONS,
  QnaSortDto
} from '@/entities/community';
import { QnaCategoryFilter, useCommunityQnaFeed, useCommunityQnaFilter } from '@/features/community';
import { useLikePost } from '@/features/like-post';
import { SCREEN_GUTTER } from '@/shared/lib';
import { AnimalTypeDto, useListRefreshing } from '@/shared/model';
import { ButtonGroup, ChipGroup, Dropdown, FadeEdgesScrollView, FeedNodata } from '@/shared/ui';

export type CommunityQnAFeedProps = {
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

export const CommunityQnAFeed = ({ onScroll }: CommunityQnAFeedProps) => {
  const { qnaType, animalType, sort, changeQnaType, changeAnimalType, changeSort } = useCommunityQnaFilter();
  const { toggleLikePost } = useLikePost();
  const {
    qnaList,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    refresh,
    fetchNextPage,
    goDetailPage,
    goCreatePage
  } = useCommunityQnaFeed({
    qnaType: qnaType === 'ALL' ? undefined : qnaType,
    animalType: animalType === 'ALL' ? undefined : animalType,
    sort
  });

  const scrollRef = useRef<FlashListRef<CommunityQnaListItemDto>>(null);
  useScrollToTop(scrollRef);
  const { refreshing, handleRefresh } = useListRefreshing(refresh);

  const handlePressCard = useCallback((id: string) => goDetailPage(id), [goDetailPage]);
  const handlePressLike = useCallback((id: string, isLiked: boolean) => toggleLikePost(id, isLiked), [toggleLikePost]);

  const renderItem = useCallback<ListRenderItem<CommunityQnaListItemDto>>(
    ({ item }) => (
      <View px={SCREEN_GUTTER}>
        <CommunityQnaCard
          data={item}
          categoryLabel={QNA_CATEGORY_OPTIONS.find((o) => o.value === item.qnaType)?.label ?? ''}
          onPress={handlePressCard}
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
        keyExtractor={({ id }, i) => `${id}-${i}`}
        data={qnaList}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ItemSeparatorComponent={() => <Divider />}
        ListEmptyComponent={
          <EmptyState isLoading={isLoading} isError={isError} onRetry={refresh} onPressCreate={goCreatePage} />
        }
        ListHeaderComponent={
          <YStack gap={12} pb={8}>
            <View px={SCREEN_GUTTER}>
              <ButtonGroup
                data={ADOPT_OPTIONS.ANIMAL}
                id={animalType}
                onChange={(id) => changeAnimalType(id as AnimalTypeDto)}
              />
            </View>
            <XStack items="center" gap={8} pr={20}>
              <FadeEdgesScrollView contentContainerStyle={{ paddingLeft: 20 }}>
                <ChipGroup
                  variant="secondary"
                  options={QNA_CATEGORY_FILTER_OPTIONS}
                  value={qnaType}
                  onChange={(v) => changeQnaType(v as QnaCategoryFilter)}
                />
              </FadeEdgesScrollView>
              <Dropdown data={QNA_SORT_OPTIONS} value={sort} onChange={(v) => changeSort(v.id as QnaSortDto)} />
            </XStack>
          </YStack>
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

const EmptyState = ({
  isLoading,
  isError,
  onRetry,
  onPressCreate
}: {
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onPressCreate: () => void;
}) => {
  if (isLoading) {
    return (
      <View flex={1} items="center" justify="center" py={48}>
        <ActivityIndicator />
      </View>
    );
  }
  if (isError) {
    return (
      <View flex={1} items="center" justify="center" mb={20} minH={300}>
        <FeedNodata
          text="글을 불러오지 못했어요"
          description="잠시 후 다시 시도해 주세요"
          cta={{ label: '다시 시도', onPress: onRetry }}
        />
      </View>
    );
  }
  return (
    <View flex={1} items="center" justify="center" mb={20} minH={300}>
      <FeedNodata text="아직 글이 없어요" cta={{ label: '첫 글 올리기', onPress: onPressCreate }} />
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
