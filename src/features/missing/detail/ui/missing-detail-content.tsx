import { useScrollToTop } from '@react-navigation/native';
import { FlashList, FlashListRef, ListRenderItemInfo } from '@shopify/flash-list';
import { MoreVertical } from '@tamagui/lucide-icons';
import { useQueryClient } from '@tanstack/react-query';
import { RelativePathString, router } from 'expo-router';
import { ComponentRef, useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, Pressable, RefreshControl } from 'react-native';
import { KeyboardStickyView, useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { styled, Text, useTheme, View, XStack, YStack } from 'tamagui';

import {
  CommentCard,
  CommentCardSkeleton,
  CommentDto,
  CommentFormInput,
  CommentListHeader,
  commentQueries
} from '@/entities/comment';
import { useLoginRequired } from '@/features/auth';
import {
  RepliesSection,
  useCommentMenu,
  useCommunityCommentList,
  useCreateComment,
  useUpdateComment
} from '@/features/community';
import { PosterSaveButton } from '@/features/poster';
import { containsProfanity, globalToast, SCREEN_GUTTER } from '@/shared/lib';
import { useLayout, useListRefreshing, useShare } from '@/shared/model';
import { Carousel, NoImage } from '@/shared/ui';
import { Share as ShareIcon } from '@/shared/ui/icons/outline';

import { hasHeroMedia, toHeroVideoItem } from '../lib/to-hero-video-item';
import { useMissingDetail } from '../model/use-missing-detail';
import { useMissingMenu } from '../model/use-missing-menu';
import { ContactCta } from './contact-cta';
import { MissingInfoSection } from './missing-info-section';
import { MissingLocationMap } from './missing-location-map';
import { MissingMatchSection } from './missing-match-section';
import { MissingStatusBanner } from './missing-status-banner';
import { ResolveToggle } from './resolve-toggle';

export const MissingDetailContent = ({ id }: { id: string }) => {
  const { black600 } = useTheme();
  const [inputHeight, setInputHeight] = useState(0);

  const { bottom } = useLayout();
  const { height: keyboardHeight } = useReanimatedKeyboardAnimation();
  const listBottomSpacerStyle = useAnimatedStyle(() => ({ height: Math.max(0, -keyboardHeight.value) }));

  const { share } = useShare();
  const { missing, refetch } = useMissingDetail(id);
  const isResolved = missing.status === 'RESOLVED';

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

  const queryClient = useQueryClient();
  const refresh = useCallback(async () => {
    await Promise.all([refetch(), queryClient.invalidateQueries({ queryKey: [...commentQueries.all(), 'list', id] })]);
  }, [refetch, queryClient, id]);
  const { refreshing, handleRefresh } = useListRefreshing(refresh);

  const [comment, setComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [replyTarget, setReplyTarget] = useState<{ parentId: string; replyToId?: string; nickname: string } | null>(
    null
  );
  const [repliedParentId, setRepliedParentId] = useState<string | null>(null);
  const commentInputRef = useRef<ComponentRef<typeof CommentFormInput>>(null);
  const { requireLogin, isLoggedIn } = useLoginRequired();

  const focusCommentInput = useCallback(() => {
    requestAnimationFrame(() => commentInputRef.current?.focus());
  }, []);

  const handleTapWhenLoggedOut = useCallback(() => {
    requireLogin(() => {});
  }, [requireLogin]);

  const createCommentMutation = useCreateComment({ postId: id });
  const updateCommentMutation = useUpdateComment({ postId: id });

  const handleEnterEditMode = useCallback(
    (target: { commentId: string; content: string }) => {
      setReplyTarget(null);
      setEditingCommentId(target.commentId);
      setComment(target.content);
      focusCommentInput();
    },
    [focusCommentInput]
  );

  const handleCancelEdit = useCallback(() => {
    setEditingCommentId(null);
    setComment('');
  }, []);

  const handleEnterReplyMode = useCallback(
    async (target: { parentId: string; replyToId?: string; nickname: string }) => {
      await requireLogin(() => {
        setEditingCommentId(null);
        setReplyTarget(target);
        setComment(`@${target.nickname} `);
        focusCommentInput();
      });
    },
    [requireLogin, focusCommentInput]
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

  const { openMissingMenu } = useMissingMenu({
    id,
    authorId: missing.author?.id,
    isOwner: missing.isOwner
  });

  const openMap = useCallback(() => {
    router.push(`/missing/post/${id}/map` as RelativePathString);
  }, [id]);

  const submitComment = useCallback(
    (content: string) => {
      if (containsProfanity(content)) {
        globalToast('비속어 표현이 감지됐어요. 커뮤니티 가이드라인을 확인해주세요.', 'fail');
        return;
      }
      if (editingCommentId !== null) {
        const targetCommentId = editingCommentId;
        setComment('');
        setEditingCommentId(null);
        updateCommentMutation.mutate({ commentId: targetCommentId, content });
      } else {
        const parentId = replyTarget?.parentId;
        const replyToId = replyTarget?.replyToId;
        setComment('');
        setReplyTarget(null);
        createCommentMutation.mutate({ content, parentId, replyToId });
        if (parentId) setRepliedParentId(parentId);
      }
      Keyboard.dismiss();
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
    ({ item }: ListRenderItemInfo<CommentDto>) => (
      <View key={item.id} px={SCREEN_GUTTER} py={24}>
        <CommentCard
          comment={item}
          onPressMore={() =>
            openCommentMenu({ commentId: item.id, authorId: item.user?.id ?? null, content: item.content, postId: id })
          }
          onPressReply={() =>
            handleEnterReplyMode({ parentId: item.id, nickname: item.user?.nickname ?? '탈퇴한 사용자' })
          }
        />
        <RepliesSection
          parentComment={item}
          autoExpand={repliedParentId === item.id}
          onPressReplyMore={(reply) =>
            openCommentMenu({
              commentId: reply.id,
              authorId: reply.user?.id ?? null,
              content: reply.content,
              postId: id
            })
          }
          onPressReplyTo={(reply) =>
            handleEnterReplyMode({
              parentId: item.id,
              replyToId: reply.id,
              nickname: reply.user?.nickname ?? '탈퇴한 사용자'
            })
          }
        />
      </View>
    ),
    [id, openCommentMenu, handleEnterReplyMode, repliedParentId]
  );

  const listHeader = useMemo(
    () => (
      <YStack>
        <MissingStatusBanner
          isResolved={isResolved}
          action={missing.isOwner ? <ResolveToggle id={id} isResolved={isResolved} /> : undefined}
        />

        <Hero mb={16}>
          {hasHeroMedia(missing) ? (
            <Carousel
              data={missing.images}
              videoItem={toHeroVideoItem(missing)}
              showIndicator
              showImageViewer
              imageRadius={0}
            />
          ) : (
            <NoImage style={{ borderRadius: 0 }} />
          )}
          <View position="absolute" t={12} r={16}>
            <PosterSaveButton source={{ type: 'missing', id }} label="포스터 만들기" overlay />
          </View>
        </Hero>
        <XStack px={SCREEN_GUTTER} items="center" justify="flex-end" mb={24}>
          <XStack items="center" gap={16}>
            <Pressable hitSlop={10} onPress={() => share({ type: 'missing', id })} accessibilityLabel="공유">
              <ShareIcon width={22} height={22} color={black600.val} />
            </Pressable>
            <Pressable hitSlop={10} onPress={openMissingMenu} accessibilityLabel="더보기" testID="missing-detail-more">
              <MoreVertical size={22} color={black600.val as never} />
            </Pressable>
          </XStack>
        </XStack>
        <YStack px={SCREEN_GUTTER} gap={32} mb={32}>
          <MissingInfoSection missing={missing} />
          <MissingLocationMap lat={missing.lat} lng={missing.lng} address={missing.address} onPressMap={openMap} />
          {!isResolved && !missing.isOwner && <ContactCta id={id} />}
        </YStack>
        <View mb={8}>
          <MissingMatchSection id={id} />
        </View>
        <CommentListHeader
          commentCount={commentList.length}
          sortOrder={sortOrder}
          onChangeSortOrder={changeSortOrder}
        />
      </YStack>
    ),
    [
      isResolved,
      missing,
      id,
      share,
      black600.val,
      commentList.length,
      sortOrder,
      changeSortOrder,
      openMap,
      openMissingMenu
    ]
  );

  const listFooter = useMemo(
    () => (
      <>
        {isFetchingNextPage && (
          <View py={20} items="center">
            <ActivityIndicator />
          </View>
        )}
        <Animated.View style={listBottomSpacerStyle} />
      </>
    ),
    [isFetchingNextPage, listBottomSpacerStyle]
  );

  return (
    <ContentWrap>
      <FlashList
        data={commentList}
        keyExtractor={(item, i) => `${item.id}-${i}`}
        renderItem={renderItem}
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        ItemSeparatorComponent={() => <View height={1} bg="$backgroundDefault" />}
        contentContainerStyle={{ paddingBottom: commentList.length > 0 ? inputHeight : 0 }}
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
            <View items="center" justify="center" py={48}>
              <EmptyText>{'아직 제보가 없어요\n작은 목격 정보도 큰 도움이 돼요'}</EmptyText>
            </View>
          )
        }
      />

      <KeyboardStickyView offset={{ opened: bottom }}>
        <StickyInner onLayout={(event) => setInputHeight(event.nativeEvent.layout.height)} pb={bottom}>
          <CommentFormInput
            ref={commentInputRef}
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
            placeholder="목격 정보를 남겨주세요"
          />
        </StickyInner>
      </KeyboardStickyView>
    </ContentWrap>
  );
};

const ContentWrap = styled(View, {
  flex: 1
});

const Hero = styled(View, {
  width: '100%',
  aspectRatio: 4 / 3
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
