import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { useCallback } from 'react';
import { styled, YStack } from 'tamagui';

import { NotificationDto, NotificationItem } from '@/entities/notification';
import { NotificationListBar, useNotificationFeed } from '@/features/notification';
import { SCREEN_GUTTER } from '@/shared/lib';
import { ProfileCommentListSkeleton, ProfileEmptyState } from '@/widgets/profile';

export type NotificationFeedProps = {
  feed: ReturnType<typeof useNotificationFeed>;
};

export const NotificationFeed = ({ feed }: NotificationFeedProps) => {
  const {
    items,
    total,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    openItem,
    markAllRead,
    selectMode,
    selectedIds,
    exitSelectMode,
    toggleSelect,
    deleteSelected
  } = feed;

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<NotificationDto>) => (
      <NotificationItem
        data={item}
        selectMode={selectMode}
        selected={selectedIds.includes(item.id)}
        onPress={openItem}
        onToggleSelect={toggleSelect}
      />
    ),
    [selectMode, selectedIds, openItem, toggleSelect]
  );

  if (isLoading) {
    return (
      <Container>
        <YStack px={SCREEN_GUTTER}>
          <ProfileCommentListSkeleton />
        </YStack>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container>
        <ProfileEmptyState
          text="알림을 불러오지 못했어요"
          description="잠시 후 다시 시도해주세요"
          cta={{ label: '다시 불러오기', onPress: () => refetch() }}
        />
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container>
        <ProfileEmptyState text="알림이 없어요" description="새로운 소식이 등록되면 알려드릴게요" />
      </Container>
    );
  }

  return (
    <Container>
      <NotificationListBar
        total={total}
        selectMode={selectMode}
        selectedCount={selectedIds.length}
        onMarkAllRead={markAllRead}
        onDeleteSelected={deleteSelected}
        onCloseSelectMode={exitSelectMode}
      />
      <FlashList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onRefresh={refetch}
        refreshing={false}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={0.5}
        maintainVisibleContentPosition={{ disabled: true }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      />
    </Container>
  );
};

const Container = styled(YStack, {
  flex: 1,
  bg: '$pageBackground'
});
