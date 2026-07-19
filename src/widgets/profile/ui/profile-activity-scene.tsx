import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { styled, View, YStack } from 'tamagui';

import {
  CommentListItem,
  CommunityPostListItem,
  CommunityPostListItemStatus,
  MyCommentItemDto,
  MyPostItemDto,
  MyPostType
} from '@/entities/community';
import { useCurrentUser } from '@/features/auth';
import { useAdoptionStatus, useCommentMenu, usePostMenu } from '@/features/community';
import { useMissingMenu } from '@/features/missing/detail/model/use-missing-menu';
import { useMyComments, useMyPosts } from '@/features/profile';
import { useListRefreshing, useScrollToTop } from '@/shared/model';
import { ButtonGroup, ScrollToTopButton } from '@/shared/ui';

import { ProfileCommentListSkeleton } from './profile-comment-list-skeleton';
import { ProfileEmptyState } from './profile-empty-state';

const ACTIVITY_OPTIONS = [
  { id: 'adopt', label: '공고' },
  { id: 'post', label: '게시글' },
  { id: 'comment', label: '댓글' }
] as const;

type ActivityOption = (typeof ACTIVITY_OPTIONS)[number]['id'];

const CATEGORY_LABEL: Record<MyPostItemDto['category'], string> = {
  ADOPTION_PERSONAL: '개인공고',
  MISSING: '실종',
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
  const [selected, setSelected] = useState<ActivityOption>('adopt');

  return (
    <Container>
      <ButtonGroupWrap>
        <ButtonGroup id={selected} data={ACTIVITY_OPTIONS} onChange={setSelected} />
      </ButtonGroupWrap>
      {selected === 'adopt' && <MyPostList type="personal" />}
      {selected === 'post' && <MyPostList type="community" />}
      {selected === 'comment' && <MyCommentList />}
    </Container>
  );
};

const POST_EMPTY = {
  personal: {
    text: '올린 공고가 없어요',
    description: '입양 보낼 아이의 공고를 올리면 여기에 모여요',
    cta: { label: '공고 올리기', pathname: '/community-write' }
  },
  community: {
    text: '작성한 글이 없어요',
    description: '커뮤니티에 글을 남기면 여기에 모여요',
    cta: { label: '커뮤니티 둘러보기', pathname: '/(tabs)/community' }
  }
} as const;

const MyPostList = ({ type }: { type: MyPostType }) => {
  const { items, isLoading, isFetchingNextPage, fetchNextPage, refetch } = useMyPosts(type);
  const { refreshing, handleRefresh } = useListRefreshing(async () => {
    await refetch();
  });
  const { ref, scrollY, onScroll, scrollToTop } = useScrollToTop<MyPostItemDto>();
  const empty = POST_EMPTY[type];

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<MyPostItemDto>) => <MyPostListItem item={item} type={type} />,
    [type]
  );

  if (!isLoading && items.length === 0) {
    return (
      <ProfileEmptyState
        text={empty.text}
        description={empty.description}
        cta={{ label: empty.cta.label, onPress: () => router.navigate(empty.cta.pathname) }}
      />
    );
  }

  return (
    <View flex={1}>
      <FlashList
        ref={ref}
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={0.5}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
        ListEmptyComponent={isLoading ? <ProfileCommentListSkeleton /> : null}
        ListFooterComponent={isFetchingNextPage ? <ProfileCommentListSkeleton count={1} /> : null}
      />
      <ScrollToTopButton scrollY={scrollY} onPress={scrollToTop} threshold={400} />
    </View>
  );
};

const MyPostListItem = ({ item, type }: { item: MyPostItemDto; type: MyPostType }) => {
  const { user } = useCurrentUser();
  const { setCompleted, setInProgress } = useAdoptionStatus(item.id);
  const isMissing = item.category === 'MISSING';
  const isPersonal = type === 'personal' && !!item.adoptionStatus;
  const { openMissingMenu } = useMissingMenu({
    id: item.id,
    authorId: user?.id,
    isOwner: true,
    stayOnDelete: true
  });
  const { openPostMenu } = usePostMenu({
    postId: item.id,
    authorId: user?.id,
    stayOnDelete: true,
    adoption: isPersonal
      ? {
          status: item.adoptionStatus!,
          onToggle: item.adoptionStatus === 'COMPLETED' ? setInProgress : setCompleted
        }
      : undefined
  });

  return (
    <CommunityPostListItem
      data={item}
      categoryLabel={CATEGORY_LABEL[item.category]}
      status={adoptionStatusChip(item)}
      onPress={(id) =>
        router.push(
          isMissing
            ? `/(untabs)/missing/post/${id}`
            : type === 'personal'
              ? `/(untabs)/adopt-personal/${id}`
              : `/(untabs)/community/${id}`
        )
      }
      onPressMore={isMissing ? openMissingMenu : openPostMenu}
      hideCategory={type === 'personal' && !isMissing}
      hideLikeCount
    />
  );
};

const MyCommentList = () => {
  const { items, isLoading, isFetchingNextPage, fetchNextPage, refetch } = useMyComments();
  const { refreshing, handleRefresh } = useListRefreshing(async () => {
    await refetch();
  });
  const { ref, scrollY, onScroll, scrollToTop } = useScrollToTop<MyCommentItemDto>();
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
        description="댓글을 남기면 여기에 모여요"
        cta={{ label: '커뮤니티 둘러보기', onPress: () => router.navigate('/(tabs)/community') }}
      />
    );
  }

  return (
    <View flex={1}>
      <FlashList
        ref={ref}
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={0.5}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
        ListEmptyComponent={isLoading ? <ProfileCommentListSkeleton /> : null}
        ListFooterComponent={isFetchingNextPage ? <ProfileCommentListSkeleton count={1} /> : null}
      />
      <ScrollToTopButton scrollY={scrollY} onPress={scrollToTop} threshold={400} />
    </View>
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
