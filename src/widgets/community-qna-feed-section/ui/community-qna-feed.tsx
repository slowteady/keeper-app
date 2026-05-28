import { useScrollToTop } from '@react-navigation/native';
import { FlashList, FlashListRef, ListRenderItem } from '@shopify/flash-list';
import { useCallback, useRef } from 'react';
import { ActivityIndicator, RefreshControl } from 'react-native';
import { styled, View, YStack } from 'tamagui';

import {
  CommunityQnaCard,
  CommunityQnaListItemDto,
  QNA_ANIMAL_TYPE_OPTIONS,
  QNA_CATEGORY_OPTIONS,
  QnaTypeDto
} from '@/entities/community';
import { useCommunityQnaFeed, useCommunityQnaFilter } from '@/features/community';
import { AnimalTypeDto, useListRefreshing } from '@/shared/model';
import { ChipGroup, FeedNodata } from '@/shared/ui';

export const CommunityQnAFeed = () => {
  const { type, animalType, toggleType, toggleAnimalType } = useCommunityQnaFilter();
  const { qnaList, isLoading, isFetchingNextPage, hasNextPage, refresh, fetchNextPage, goDetailPage } =
    useCommunityQnaFeed({ type, animalType });

  const scrollRef = useRef<FlashListRef<CommunityQnaListItemDto>>(null);
  useScrollToTop(scrollRef);
  const { refreshing, handleRefresh } = useListRefreshing(refresh);

  const handlePressCard = useCallback((id: number) => goDetailPage(String(id)), [goDetailPage]);

  const renderItem = useCallback<ListRenderItem<CommunityQnaListItemDto>>(
    ({ item }) => (
      <View px={20}>
        <CommunityQnaCard
          data={item}
          categoryLabel={QNA_CATEGORY_OPTIONS.find((o) => o.value === item.type)?.label ?? ''}
          animalLabel={
            item.animalType !== 'OTHER'
              ? QNA_ANIMAL_TYPE_OPTIONS.find((o) => o.value === item.animalType)?.label
              : undefined
          }
          onPress={handlePressCard}
        />
      </View>
    ),
    [handlePressCard]
  );

  return (
    <Container>
      <FlashList
        ref={scrollRef}
        keyExtractor={({ id }, i) => `${id}-${i}`}
        data={qnaList}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={<EmptyState isLoading={isLoading} />}
        ListHeaderComponent={
          <YStack px={20} gap={12} pb={8}>
            <ChipGroup
              variant="secondary"
              options={QNA_CATEGORY_OPTIONS}
              value={type ?? ''}
              onChange={(v) => v && toggleType(v as QnaTypeDto)}
              clearable
            />
            <ChipGroup
              variant="secondary"
              options={QNA_ANIMAL_TYPE_OPTIONS}
              value={animalType ?? ''}
              onChange={(v) => v && toggleAnimalType(v as AnimalTypeDto)}
              clearable
            />
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
      <FeedNodata text="아직 궁금해요 글이 없어요!" />
    </View>
  );
};

const Container = styled(YStack, {
  flex: 1,
  py: 16
});
