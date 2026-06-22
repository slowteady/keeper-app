import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { styled, YStack } from 'tamagui';

import { NoticeListItem, NoticeListItemDto } from '@/entities/notice';
import { isNoticeFresh, useNoticeList, useReadNotices } from '@/features/notice';
import { SCREEN_GUTTER } from '@/shared/lib';

import { ProfileCommentListSkeleton } from './profile-comment-list-skeleton';
import { ProfileEmptyState } from './profile-empty-state';

export const ProfileNoticeScene = () => {
  const { items, isLoading, isError, refetch } = useNoticeList();
  const { readIds } = useReadNotices();

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<NoticeListItemDto>) => (
      <NoticeListItem
        data={item}
        isRead={readIds.includes(item.id)}
        unread={isNoticeFresh(item.createdAt) && !readIds.includes(item.id)}
        onPress={(id) => router.push(`/(untabs)/profile/notice/${id}`)}
      />
    ),
    [readIds]
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
          text="공지사항을 불러오지 못했어요"
          description="잠시 후 다시 시도해주세요"
          cta={{ label: '다시 불러오기', onPress: () => refetch() }}
        />
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container>
        <ProfileEmptyState text="공지사항이 없어요" description="새로운 소식이 등록되면 알려드릴게요" />
      </Container>
    );
  }

  return (
    <Container>
      <FlashList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onRefresh={refetch}
        refreshing={false}
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
