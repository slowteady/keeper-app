import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { styled, YStack } from 'tamagui';

import { InquiryListItem, InquiryListItemDto } from '@/entities/inquiry';
import { useMyInquiries } from '@/features/inquiry';

import { ProfileCommentListSkeleton } from './profile-comment-list-skeleton';
import { ProfileEmptyState } from './profile-empty-state';

export const InquiryHistoryScene = () => {
  const { items, isLoading, isError, refetch } = useMyInquiries();

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<InquiryListItemDto>) => (
      <InquiryListItem data={item} onPress={(id) => router.push(`/(untabs)/profile/inquiry/${id}`)} />
    ),
    []
  );

  if (isLoading) {
    return (
      <Container>
        <YStack px={20}>
          <ProfileCommentListSkeleton />
        </YStack>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container>
        <ProfileEmptyState
          text="문의 내역을 불러오지 못했어요"
          description="잠시 후 다시 시도해주세요"
          cta={{ label: '다시 불러오기', onPress: () => refetch() }}
        />
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container>
        <ProfileEmptyState text="문의 내역이 없어요" description="문의한 내용과 답변을 여기에서 확인할 수 있어요" />
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
