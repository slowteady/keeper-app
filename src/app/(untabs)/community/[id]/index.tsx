import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { useLocalSearchParams } from 'expo-router';
import { Suspense, useCallback, useMemo, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { styled, Text, View, YStack } from 'tamagui';

import { CommentCard, CommentCardSkeleton, CommentDto, CommentFormInput, CommentListHeader } from '@/entities/comment';
import { CommunityAdoptCardStats } from '@/entities/community';
import { useLoginRequired } from '@/features/auth';
import {
  RepliesSection,
  useCommentHelpful,
  useCommentMenu,
  useCommunityAdoptDetailFeed,
  useCommunityCommentList,
  useCreateComment,
  usePostMenu,
  useUpdateComment
} from '@/features/community';
import { useLikePost } from '@/features/like-post';
import { useLayout, useScrollUpButton } from '@/shared/model';
import { Button, CallModal, DetailErrorBoundary, ScrollUpButton } from '@/shared/ui';
import { AdoptDetailInfoSection } from '@/widgets/adopt-section';
import {
  CommunityDetailDescriptionSection,
  CommunityDetailOverviewSection,
  PostDetailSkeleton
} from '@/widgets/community-adopt-feed-section';

export const ErrorBoundary = DetailErrorBoundary;

const Page = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  if (!id) return null;

  // Suspense — useSuspenseQuery 로 본문 도착 전 스켈레톤 fallback. 댓글창이 먼저 보이는 mount 깜빡임 제거.
  return (
    <Suspense fallback={<PostDetailSkeleton />}>
      <CommunityDetailContent id={id} />
    </Suspense>
  );
};

const CommunityDetailContent = ({ id }: { id: string }) => {
  const [inputHeight, setInputHeight] = useState(0);
  const [callModalOpen, setCallModalOpen] = useState(false);

  const { bottom } = useLayout();

  const numId = Number(id);
  const { data } = useCommunityAdoptDetailFeed(id);
  const { handleScroll, handlePressButton, isButtonVisible, scrollRef } = useScrollUpButton();
  const {
    sortOrder,
    commentList,
    changeSortOrder,
    fetchNextPage,
    isFetchingNextPage,
    isLoading: isCommentLoading
  } = useCommunityCommentList(numId);
  const { toggleLikePost } = useLikePost();

  const detailPost = data.detailPost;
  const isLiked = detailPost?.isLiked ?? false;
  const authorId = detailPost?.user?.id ?? null;
  const phoneContact = useMemo(
    () => detailPost?.contacts.find((c) => c.type === 'PHONE')?.value ?? '',
    [detailPost?.contacts]
  );
  const hasPhone = phoneContact.length > 0;

  const { openPostMenu, sharePost } = usePostMenu({
    postId: numId,
    authorId,
    shareInfo: detailPost ? { title: detailPost.title, image: detailPost.images[0] } : undefined
  });

  // 댓글 작성/수정/답글 인라인 모드 분기
  // - editingCommentId 있으면 update
  // - replyTarget 있으면 create (with parentId)
  // - 둘 다 없으면 일반 create
  const [comment, setComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [replyTarget, setReplyTarget] = useState<{ parentId: number; nickname: string } | null>(null);
  const { requireLogin } = useLoginRequired();
  const createCommentMutation = useCreateComment({ postId: numId });
  const updateCommentMutation = useUpdateComment({ postId: numId });

  const handleEnterEditMode = useCallback((target: { commentId: number; content: string }) => {
    setReplyTarget(null);
    setEditingCommentId(target.commentId);
    setComment(target.content);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingCommentId(null);
    setComment('');
  }, []);

  const handleEnterReplyMode = useCallback(
    async (target: { parentId: number; nickname: string }) => {
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

  const { openCommentMenu } = useCommentMenu({ postId: numId, onEdit: handleEnterEditMode });
  const { toggleHelpful } = useCommentHelpful();

  const handleToggleHelpful = useCallback(
    (c: { id: number; isHelpful: boolean; helpfulCount: number }) => {
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
        updateCommentMutation.mutate(
          { commentId: editingCommentId, content },
          {
            onSuccess: () => {
              setComment('');
              setEditingCommentId(null);
            }
          }
        );
      } else {
        const parentId = replyTarget?.parentId;
        createCommentMutation.mutate(
          { content, parentId },
          {
            onSuccess: () => {
              setComment('');
              setReplyTarget(null);
            }
          }
        );
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
    <Container>
      <FlashList
        data={commentList}
        keyExtractor={(item, i) => `${item.id}-${i}`}
        renderItem={renderItem}
        onScroll={handleScroll}
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        onEndReached={fetchNextPage}
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
                  onPressLike={() => toggleLikePost(numId, isLiked)}
                  onPressShare={sharePost}
                  onPressMore={openPostMenu}
                />
              </View>
            )}

            <Divider mb={32} />

            {detailPost && (
              <>
                <YStack px={20} mb={40}>
                  <AdoptDetailInfoSection {...(data.infos as Parameters<typeof AdoptDetailInfoSection>[0])} />
                </YStack>
                <View px={20} mb={32}>
                  <CommunityDetailDescriptionSection
                    {...(data.descriptions as Parameters<typeof CommunityDetailDescriptionSection>[0])}
                  />
                </View>
                {hasPhone && (
                  <View px={20} mb={20}>
                    <Button onPress={() => setCallModalOpen((prev) => !prev)}>문의하기</Button>
                  </View>
                )}
                <View px={20} mb={16}>
                  <CommunityAdoptCardStats {...detailPost.counts} />
                </View>
              </>
            )}

            <CommentListHeader
              commentCount={detailPost?.counts?.comment ?? 0}
              sortOrder={sortOrder}
              onChangeSortOrder={changeSortOrder}
            />
          </>
        )}
        contentContainerStyle={{ paddingBottom: inputHeight, paddingTop: 32, flexGrow: 1 }}
        ListEmptyComponent={() =>
          isCommentLoading ? (
            <YStack>
              {Array.from({ length: 3 }).map((_, idx) => (
                <View key={idx}>
                  <CommentCardSkeleton />
                  {idx < 2 && <View height={1} bg="$backgroundDefault" />}
                </View>
              ))}
            </YStack>
          ) : (
            <View items="center" justify="center" height={200}>
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
          />
          <ScrollUpButton visible={isButtonVisible} onPress={handlePressButton} bottom={inputHeight + 20} />
        </StickyInner>
      </KeyboardStickyView>

      <CallModal
        open={callModalOpen}
        onClose={() => setCallModalOpen(false)}
        tel={phoneContact}
        title={`${detailPost?.user?.nickname ?? '탈퇴한 사용자'}님에게 문의하기`}
        description={`*보호자에게 직접 문의해 정보를 확인할 수 있어요`}
      />
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
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
