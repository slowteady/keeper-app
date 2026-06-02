import { useScrollToTop } from '@react-navigation/native';
import { FlashList, FlashListRef, ListRenderItem } from '@shopify/flash-list';
import { useCallback, useRef } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { styled, View, YStack } from 'tamagui';

import { ADOPT_OPTIONS } from '@/entities/adopt';
import {
  CommunityQnaCard,
  CommunityQnaListItemDto,
  QNA_CATEGORY_FILTER_OPTIONS,
  QNA_CATEGORY_OPTIONS
} from '@/entities/community';
import { QnaCategoryFilter, useCommunityQnaFeed, useCommunityQnaFilter } from '@/features/community';
import { useLikePost } from '@/features/like-post';
import { AnimalTypeDto, useListRefreshing } from '@/shared/model';
import { ButtonGroup, ChipGroup, FeedNodata } from '@/shared/ui';

export const CommunityQnAFeed = () => {
  const { qnaType, animalType, changeQnaType, changeAnimalType } = useCommunityQnaFilter();
  const { toggleLikePost } = useLikePost();
  const { qnaList, isLoading, isFetchingNextPage, hasNextPage, refresh, fetchNextPage, goDetailPage } =
    useCommunityQnaFeed({
      qnaType: qnaType === 'ALL' ? undefined : qnaType,
      animalType: animalType === 'ALL' ? undefined : animalType
    });

  const scrollRef = useRef<FlashListRef<CommunityQnaListItemDto>>(null);
  useScrollToTop(scrollRef);
  const { refreshing, handleRefresh } = useListRefreshing(refresh);

  const handlePressCard = useCallback((id: string) => goDetailPage(id), [goDetailPage]);
  const handlePressLike = useCallback((id: string, isLiked: boolean) => toggleLikePost(id, isLiked), [toggleLikePost]);

  const renderItem = useCallback<ListRenderItem<CommunityQnaListItemDto>>(
    ({ item }) => (
      <View px={20}>
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ItemSeparatorComponent={() => <Divider />}
        ListEmptyComponent={<EmptyState isLoading={isLoading} />}
        ListHeaderComponent={
          <YStack gap={12} pb={8}>
            <View px={20}>
              <ButtonGroup
                data={ADOPT_OPTIONS.ANIMAL}
                id={animalType}
                onChange={(id) => changeAnimalType(id as AnimalTypeDto)}
              />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              <ChipGroup
                variant="secondary"
                options={QNA_CATEGORY_FILTER_OPTIONS}
                value={qnaType}
                onChange={(v) => changeQnaType(v as QnaCategoryFilter)}
              />
            </ScrollView>
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

const EmptyState = ({ isLoading }: { isLoading: boolean }) => {
  if (isLoading) {
    return (
      <View flex={1} items="center" justify="center" py={48}>
        <ActivityIndicator />
      </View>
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
