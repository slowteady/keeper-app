import { useScrollToTop } from '@react-navigation/native';
import { FlashList, FlashListRef, ListRenderItemInfo } from '@shopify/flash-list';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { styled, Text, View, YStack } from 'tamagui';

import {
  CommentCard,
  CommentCardSkeleton,
  CommentDto,
  CommentFormInput,
  CommentListHeader,
  commentQueries
} from '@/entities/comment';
import { communityQueries, PostStats } from '@/entities/community';
import { useLoginRequired } from '@/features/auth';
import { useLikePost } from '@/features/like-post';
import { useLayout, useListRefreshing } from '@/shared/model';
import { PostDetailHeader } from '@/widgets/community-post-section';

import { useCommentMenu } from '../../detail/model/use-comment-menu';
import { useCommunityCommentList } from '../../detail/model/use-community-comment-list';
import { useCreateComment } from '../../detail/model/use-create-comment';
import { usePostMenu } from '../../detail/model/use-post-menu';
import { useUpdateComment } from '../../detail/model/use-update-comment';
import { FocusedCommentContext } from '../../detail/ui/focused-comment-context';
import { RepliesSection } from '../../detail/ui/replies-section';
import { useCommunityQnaDetailFeed } from '../model/use-community-qna-detail-feed';

type QnaDetailContentProps = {
  id: string;
  scrollToComments: boolean;
  commentId?: string;
  editCommentId?: string;
};

export const QnaDetailContent = ({ id, scrollToComments, commentId, editCommentId }: QnaDetailContentProps) => {
  const [inputHeight, setInputHeight] = useState(0);

  const { bottom } = useLayout();

  const { qna, overview } = useCommunityQnaDetailFeed(id);
  const scrollRef = useRef<FlashListRef<CommentDto>>(null);
  useScrollToTop(scrollRef);
  const {
    sortOrder,
    commentList,
    changeSortOrder,
    fetchNextPage,
    isFetchingNextPage,
    isLoading: isCommentLoading
  } = useCommunityCommentList(id);
  const { toggleLikePost } = useLikePost();

  const scrolledRef = useRef(false);
  useEffect(() => {
    if (!scrollToComments || scrolledRef.current || isCommentLoading || commentList.length === 0) return;
    scrolledRef.current = true;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToIndex({ index: 0, animated: true });
    });
  }, [scrollToComments, isCommentLoading, commentList.length]);

  const queryClient = useQueryClient();
  const refresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [...communityQueries.all(), 'detail', id] }),
      queryClient.invalidateQueries({ queryKey: [...commentQueries.all(), 'list', id] })
    ]);
  }, [queryClient, id]);
  const { refreshing, handleRefresh } = useListRefreshing(refresh);

  const isLiked = qna?.isLiked ?? false;
  const authorId = qna?.user?.id ?? null;

  const { openPostMenu, sharePost } = usePostMenu({
    postId: id,
    authorId
  });

  const [comment, setComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [replyTarget, setReplyTarget] = useState<{ parentId: string; nickname: string } | null>(null);
  const { requireLogin, isLoggedIn } = useLoginRequired();

  const handleTapWhenLoggedOut = useCallback(() => {
    requireLogin(() => {});
  }, [requireLogin]);
  const createCommentMutation = useCreateComment({ postId: id });
  const updateCommentMutation = useUpdateComment({ postId: id });

  const handleEnterEditMode = useCallback((target: { commentId: string; content: string }) => {
    setReplyTarget(null);
    setEditingCommentId(target.commentId);
    setComment(target.content);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingCommentId(null);
    setComment('');
  }, []);

  const handleEnterReplyMode = useCallback(
    async (target: { parentId: string; nickname: string }) => {
      await requireLogin(() => {
        setEditingCommentId(null);
        setReplyTarget(target);
        setComment(`@${target.nickname} `);
      });
    },
    [requireLogin]
  );

  const handleCancelReply = useCallback(() => {
    setReplyTarget(null);
    setComment('');
  }, []);

  const handleChangeComment = useCallback(
    (text: string) => {
      setComment(text);
      if (replyTarget && !text.startsWith(`@${replyTarget.nickname}`)) {
        setReplyTarget(null);
      }
    },
    [replyTarget]
  );

  const { openCommentMenu } = useCommentMenu({ onEdit: handleEnterEditMode });

  const submitComment = useCallback(
    (content: string) => {
      if (editingCommentId !== null) {
        const targetCommentId = editingCommentId;
        setComment('');
        setEditingCommentId(null);
        updateCommentMutation.mutate({ commentId: targetCommentId, content });
      } else {
        const parentId = replyTarget?.parentId;
        setComment('');
        setReplyTarget(null);
        createCommentMutation.mutate({ content, parentId });
      }
    },
    [editingCommentId, replyTarget, createCommentMutation, updateCommentMutation]
  );

  const handleSubmitComment = useCallback(async () => {
    const content = comment.trim();
    if (!content) return;
    await requireLogin(() => {
      submitComment(content);
    });
  }, [comment, requireLogin, submitComment]);

  const isEditing = editingCommentId !== null;
  const isReplying = replyTarget !== null;
  const isSubmitPending = createCommentMutation.isPending || updateCommentMutation.isPending;

  const formBanner = isEditing
    ? { label: '댓글 수정 중', onCancel: handleCancelEdit }
    : isReplying
      ? { label: `@${replyTarget!.nickname}에게 답글 작성 중`, onCancel: handleCancelReply }
      : undefined;
  const submitLabel = isEditing ? '수정' : '등록';
  const showAllComments = useCallback(() => {
    router.replace({ pathname: '/(untabs)/community/[id]', params: { id } });
  }, [id]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<CommentDto>) => {
      return (
        <View key={item.id} px={20} py={24}>
          <CommentCard
            comment={item}
            onPressMore={() =>
              openCommentMenu({ commentId: item.id, authorId: item.user?.id ?? null, content: item.content })
            }
            onPressReply={() =>
              handleEnterReplyMode({ parentId: item.id, nickname: item.user?.nickname ?? '탈퇴한 사용자' })
            }
          />
          <RepliesSection
            parentComment={item}
            onPressReplyMore={(reply) =>
              openCommentMenu({ commentId: reply.id, authorId: reply.user?.id ?? null, content: reply.content })
            }
          />
        </View>
      );
    },
    [openCommentMenu, handleEnterReplyMode]
  );

  return (
    <ContentWrap>
      <FlashList
        data={commentId ? [] : commentList}
        keyExtractor={(item, i) => `${item.id}-${i}`}
        renderItem={renderItem}
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        onEndReached={commentId ? undefined : fetchNextPage}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View py={20} items="center">
              <ActivityIndicator />
            </View>
          ) : null
        }
        ItemSeparatorComponent={() => <View height={1} bg="$backgroundDefault" />}
        ListHeaderComponent={() => (
          <>
            {overview && qna && (
              <>
                <View px={20} mb={32}>
                  <PostDetailHeader
                    {...overview}
                    onPressLike={() => toggleLikePost(id, isLiked)}
                    onPressShare={sharePost}
                    onPressMore={openPostMenu}
                  />
                </View>
                <View px={20} mb={16}>
                  <PostStats {...qna.counts} />
                </View>
              </>
            )}

            {commentId ? (
              <FocusedCommentContext
                postId={id}
                commentId={commentId}
                autoEdit={editCommentId === commentId}
                onEdit={handleEnterEditMode}
                onShowAll={showAllComments}
              />
            ) : (
              <CommentListHeader
                commentCount={qna?.counts?.comment ?? 0}
                sortOrder={sortOrder}
                onChangeSortOrder={changeSortOrder}
              />
            )}
          </>
        )}
        contentContainerStyle={{
          paddingBottom: commentList.length > 0 ? inputHeight : 0,
          paddingTop: 32
        }}
        ListEmptyComponent={() =>
          commentId ? null : isCommentLoading ? (
            <YStack>
              {Array.from({ length: 3 }).map((_, idx) => (
                <View key={idx}>
                  <CommentCardSkeleton />
                  {idx < 2 && <View height={1} bg="$backgroundDefault" />}
                </View>
              ))}
            </YStack>
          ) : (
            <View items="center" justify="center" py={64}>
              <EmptyText>{'아직 댓글이 없어요\n가장 먼저 댓글을 남겨보세요'}</EmptyText>
            </View>
          )
        }
      />

      <KeyboardStickyView offset={{ opened: bottom }}>
        <StickyInner onLayout={(event) => setInputHeight(event.nativeEvent.layout.height)} pb={bottom}>
          <CommentFormInput
            flex={1}
            maxH={48}
            value={comment}
            onChangeText={handleChangeComment}
            onSubmit={handleSubmitComment}
            banner={formBanner}
            submitLabel={submitLabel}
            isPending={isSubmitPending}
            disabled={!isLoggedIn}
            onTapWhenDisabled={handleTapWhenLoggedOut}
          />
        </StickyInner>
      </KeyboardStickyView>
    </ContentWrap>
  );
};

const ContentWrap = styled(View, {
  flex: 1
});

const EmptyText = styled(Text, {
  fontSize: 15,
  lineHeight: 23,
  color: '$black500',
  fontWeight: 500,
  text: 'center'
});

const StickyInner = styled(View, {
  position: 'relative',
  bg: '$pageBackground'
});
