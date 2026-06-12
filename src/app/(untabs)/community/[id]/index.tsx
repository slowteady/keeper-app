import { useScrollToTop } from '@react-navigation/native';
import { FlashList, FlashListRef, ListRenderItemInfo } from '@shopify/flash-list';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { CommunityAdoptCardStats, communityQueries } from '@/entities/community';
import { useLoginRequired } from '@/features/auth';
import {
  FocusedCommentContext,
  QnaDetailContent,
  RepliesSection,
  useCommentHelpful,
  useCommentMenu,
  useCommunityAdoptDetailFeed,
  useCommunityCommentList,
  useCreateComment,
  usePostMenu,
  useUpdateComment
} from '@/features/community';
import { ContactSheet } from '@/features/community/detail/ui/contact-sheet';
import { useLikePost } from '@/features/like-post';
import { useLayout, useListRefreshing } from '@/shared/model';
import { Button, DetailErrorBoundary, useBottomSheet } from '@/shared/ui';
import { AdoptDetailInfoSection } from '@/widgets/adopt-section';
import {
  CommunityDetailDescriptionSection,
  CommunityDetailOverviewSection,
  PostDetailSkeleton
} from '@/widgets/community-adopt-feed-section';

export const ErrorBoundary = DetailErrorBoundary;

const Page = () => {
  const { id, scrollToComments, commentId, editCommentId } = useLocalSearchParams<{
    id: string;
    scrollToComments?: string;
    commentId?: string;
    editCommentId?: string;
  }>();
  if (!id) return null;

  // Suspense — useSuspenseQuery 로 본문 도착 전 스켈레톤 fallback. 댓글창이 먼저 보이는 mount 깜빡임 제거.
  return (
    <Container>
      <Suspense fallback={<PostDetailSkeleton />}>
        <DetailRouter
          id={id}
          scrollToComments={scrollToComments === '1'}
          commentId={commentId}
          editCommentId={editCommentId}
        />
      </Suspense>
    </Container>
  );
};

// 응답 category 로 분기 — QNA 는 QnaDetailContent, 그 외는 개인입양 detail.
// 같은 queryKey(communityQueries.detail) 라 하위 content 의 useSuspenseQuery 는 캐시 hit (네트워크 1 회).
type DetailRouterProps = {
  id: string;
  scrollToComments: boolean;
  commentId?: string;
  editCommentId?: string;
};

const DetailRouter = ({ id, scrollToComments, commentId, editCommentId }: DetailRouterProps) => {
  const { data } = useSuspenseQuery(communityQueries.detail(id));
  if (data.kind === 'QNA')
    return (
      <QnaDetailContent
        id={id}
        scrollToComments={scrollToComments}
        commentId={commentId}
        editCommentId={editCommentId}
      />
    );
  return (
    <CommunityDetailContent
      id={id}
      scrollToComments={scrollToComments}
      commentId={commentId}
      editCommentId={editCommentId}
    />
  );
};

const CommunityDetailContent = ({ id, scrollToComments, commentId, editCommentId }: DetailRouterProps) => {
  const [inputHeight, setInputHeight] = useState(0);

  const { bottom } = useLayout();
  const { present, dismiss } = useBottomSheet();

  const { data } = useCommunityAdoptDetailFeed(id);
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

  // 관심 댓글 chip 에서 진입 시 댓글 섹션까지 스크롤 — ListHeader(글 본문) 끝, 첫 댓글 위치로.
  // 댓글 list 도착 후 1회만 트리거.
  const scrolledRef = useRef(false);
  useEffect(() => {
    if (!scrollToComments || scrolledRef.current || isCommentLoading || commentList.length === 0) return;
    scrolledRef.current = true;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToIndex({ index: 0, animated: true });
    });
  }, [scrollToComments, isCommentLoading, commentList.length]);

  // pull-to-refresh: 본문 + 카운트/좋아요 + 댓글 list 첫 페이지부터 fresh fetch (Twitter/Instagram BP)
  const queryClient = useQueryClient();
  const refresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [...communityQueries.all(), 'detail', id] }),
      queryClient.invalidateQueries({ queryKey: [...commentQueries.all(), 'list', id] })
    ]);
  }, [queryClient, id]);
  const { refreshing, handleRefresh } = useListRefreshing(refresh);

  const detailPost = data.detailPost;
  const descriptions = data.descriptions as Parameters<typeof CommunityDetailDescriptionSection>[0];
  const hasDescription = !!(descriptions?.health?.trim() || descriptions?.relatedLink?.trim());
  const isLiked = detailPost?.isLiked ?? false;
  const authorId = detailPost?.user?.id ?? null;
  const contacts = useMemo(
    () => detailPost?.contacts?.filter((c) => c.value && c.value.length > 0) ?? [],
    [detailPost?.contacts]
  );
  const hasContact = contacts.length > 0;

  const { openPostMenu, sharePost } = usePostMenu({
    postId: id,
    authorId
  });

  // 댓글 작성/수정/답글 인라인 모드 분기
  // - editingCommentId 있으면 update
  // - replyTarget 있으면 create (with parentId)
  // - 둘 다 없으면 일반 create
  const [comment, setComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [replyTarget, setReplyTarget] = useState<{ parentId: string; nickname: string } | null>(null);
  const { requireLogin, isLoggedIn } = useLoginRequired();

  const openContactSheet = useCallback(() => {
    requireLogin(() => {
      present(<ContactSheet contacts={contacts} />, { enableDynamicSizing: true, onDismiss: dismiss });
    });
  }, [requireLogin, present, dismiss, contacts]);

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

  // 답글 모드에서 @닉네임 prefix 를 지우면 일반 댓글로 전환 (트위터/카톡 BP).
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
  const { toggleHelpful } = useCommentHelpful();

  const handleToggleHelpful = useCallback(
    (c: { id: string; isHelpful: boolean; helpfulCount: number }) => {
      toggleHelpful({
        commentId: c.id,
        currentlyHelpful: c.isHelpful,
        currentCount: c.helpfulCount
      });
    },
    [toggleHelpful]
  );

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
              openCommentMenu({
                commentId: item.id,
                authorId: item.user?.id ?? null,
                content: item.content
              })
            }
            onPressReply={() =>
              handleEnterReplyMode({
                parentId: item.id,
                nickname: item.user?.nickname ?? '탈퇴한 사용자'
              })
            }
            onPressHelpful={() => handleToggleHelpful(item)}
          />
          <RepliesSection
            parentComment={item}
            onPressReplyMore={(reply) =>
              openCommentMenu({
                commentId: reply.id,
                authorId: reply.user?.id ?? null,
                content: reply.content
              })
            }
            onPressReplyHelpful={(reply) => handleToggleHelpful(reply)}
          />
        </View>
      );
    },
    [openCommentMenu, handleEnterReplyMode, handleToggleHelpful]
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
            {detailPost && (
              <View px={20} mb={32}>
                <CommunityDetailOverviewSection
                  {...(data.overviews as Parameters<typeof CommunityDetailOverviewSection>[0])}
                  onPressLike={() => toggleLikePost(id, isLiked)}
                  onPressShare={sharePost}
                  onPressMore={openPostMenu}
                />
              </View>
            )}

            <Divider mb={32} />

            {detailPost && (
              <>
                <YStack px={20} mb={hasDescription ? 40 : 24}>
                  <AdoptDetailInfoSection {...(data.infos as Parameters<typeof AdoptDetailInfoSection>[0])} />
                </YStack>
                {hasDescription && (
                  <View px={20} mb={32}>
                    <CommunityDetailDescriptionSection {...descriptions} />
                  </View>
                )}
                {hasContact && (
                  <View px={20} mb={20}>
                    <Button onPress={openContactSheet}>문의하기</Button>
                  </View>
                )}
                <View px={20} mb={16}>
                  <CommunityAdoptCardStats {...detailPost.counts} />
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
                commentCount={detailPost?.counts?.comment ?? 0}
                sortOrder={sortOrder}
                onChangeSortOrder={changeSortOrder}
              />
            )}
          </>
        )}
        // 댓글 있을 때만 입력영역만큼 paddingBottom — nodata 시 빈 공백 방지
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
              <EmptyText>{'아직 댓글이 없습니다\n여러분의 의견을 적어주세요:)'}</EmptyText>
            </View>
          )
        }
      />

      {/* offset.opened={bottom} — 키보드 열릴 때 safe-area padding 상쇄 (BP) */}
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

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});

const ContentWrap = styled(View, {
  flex: 1
});

const Divider = styled(View, {
  height: 8,
  bg: '$white850'
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
