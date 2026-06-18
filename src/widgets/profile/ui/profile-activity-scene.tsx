import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { styled, View, YStack } from 'tamagui';

import {
  CommentListItem,
  CommunityPostListItem,
  CommunityPostListItemStatus,
  MyCommentItemDto,
  MyPostItemDto
} from '@/entities/community';
import { useCurrentUser } from '@/features/auth';
import { useCommentMenu, usePostMenu } from '@/features/community';
import { useMyComments, useMyPosts } from '@/features/profile';
import { ButtonGroup } from '@/shared/ui';

import { ProfileCommentListSkeleton } from './profile-comment-list-skeleton';
import { ProfileEmptyState } from './profile-empty-state';

const ACTIVITY_OPTIONS = [
  { id: 'post', label: '내 글' },
  { id: 'comment', label: '내 댓글' }
] as const;

type ActivityOption = (typeof ACTIVITY_OPTIONS)[number]['id'];

const CATEGORY_LABEL: Record<MyPostItemDto['category'], string> = {
  ADOPTION_PERSONAL: '내 공고',
  ADOPTION_LIFE: '입양생활',
  QNA: '궁금해요'
};

const adoptionStatusChip = (item: MyPostItemDto): CommunityPostListItemStatus | undefined => {
  if (item.category !== 'ADOPTION_PERSONAL' || !item.adoptionStatus) return undefined;
  return item.adoptionStatus === 'COMPLETED'
    ? { label: '입양완료', tone: 'success' }
    : { label: '입양중', tone: 'notice' };
};

export const ProfileActivityScene = () => {
  const [selected, setSelected] = useState<ActivityOption>('post');

  return (
    <Container>
      <ButtonGroupWrap>
        <ButtonGroup id={selected} data={ACTIVITY_OPTIONS} onChange={setSelected} />
      </ButtonGroupWrap>
      {selected === 'post' ? <MyPostList /> : <MyCommentList />}
    </Container>
  );
};

const MyPostList = () => {
  const { items, isLoading, isFetchingNextPage, fetchNextPage, refetch } = useMyPosts();

  const renderItem = useCallback(({ item }: ListRenderItemInfo<MyPostItemDto>) => <MyPostListItem item={item} />, []);

  if (!isLoading && items.length === 0) {
    return (
      <ProfileEmptyState
        text="작성한 글이 없어요"
        description="커뮤니티에 첫 글을 남겨보세요"
        cta={{ label: '커뮤니티 둘러보기', onPress: () => router.navigate('/(tabs)/community') }}
      />
    );
  }

  return (
    <FlashList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      onEndReached={fetchNextPage}
      onEndReachedThreshold={0.5}
      onRefresh={refetch}
      refreshing={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
      ListEmptyComponent={isLoading ? <ProfileCommentListSkeleton /> : null}
      ListFooterComponent={isFetchingNextPage ? <ProfileCommentListSkeleton count={1} /> : null}
    />
  );
};

const MyPostListItem = ({ item }: { item: MyPostItemDto }) => {
  const { user } = useCurrentUser();
  const { openPostMenu } = usePostMenu({ postId: item.id, authorId: user?.id, stayOnDelete: true });

  return (
    <CommunityPostListItem
      data={item}
      categoryLabel={CATEGORY_LABEL[item.category]}
      status={adoptionStatusChip(item)}
      onPress={(id) => router.push(`/(untabs)/community/${id}`)}
      onPressMore={openPostMenu}
    />
  );
};

const MyCommentList = () => {
  const { items, isLoading, isFetchingNextPage, fetchNextPage, refetch } = useMyComments();
  const { user } = useCurrentUser();
  const { openCommentMenu } = useCommentMenu({
    onEdit: ({ commentId, postId }) => {
      if (!postId) return;
      router.push({
        pathname: '/(untabs)/community/[id]',
        params: { id: postId, commentId, editCommentId: commentId }
      });
    }
  });

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<MyCommentItemDto>) => (
      <CommentListItem
        data={item}
        onPress={(postId, commentId) =>
          router.push({ pathname: '/(untabs)/community/[id]', params: { id: postId, commentId } })
        }
        onPressMore={(comment) =>
          openCommentMenu({
            commentId: comment.id,
            authorId: user?.id,
            content: comment.content,
            postId: comment.postId
          })
        }
      />
    ),
    [openCommentMenu, user?.id]
  );

  if (!isLoading && items.length === 0) {
    return (
      <ProfileEmptyState
        text="작성한 댓글이 없어요"
        description="커뮤니티 이야기에 참여해보세요"
        cta={{ label: '커뮤니티 둘러보기', onPress: () => router.navigate('/(tabs)/community') }}
      />
    );
  }

  return (
    <FlashList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      onEndReached={fetchNextPage}
      onEndReachedThreshold={0.5}
      onRefresh={refetch}
      refreshing={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
      ListEmptyComponent={isLoading ? <ProfileCommentListSkeleton /> : null}
      ListFooterComponent={isFetchingNextPage ? <ProfileCommentListSkeleton count={1} /> : null}
    />
  );
};

const Container = styled(YStack, {
  flex: 1
});

const ButtonGroupWrap = styled(View, {
  px: 20,
  pt: 16,
  pb: 12
});
