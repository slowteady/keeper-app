import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback } from 'react';

import { commentApi, commentQueries } from '@/entities/comment';
import { communityQueries, MyCommentItemDto } from '@/entities/community';
import { useCurrentUser, useLoginRequired } from '@/features/auth';
import { useBlock } from '@/features/community/safety';
import { globalToast, pressHaptic } from '@/shared/lib';
import { BottomSheetMenu, type BottomSheetMenuData, ConfirmModal, useBottomSheet, useModal } from '@/shared/ui';

import { patchPostCommentCount } from '../lib/patch-comment-count';

export type CommentMenuId = 'EDIT' | 'DELETE' | 'REPORT' | 'BLOCK';

const MINE_MENU: readonly BottomSheetMenuData<CommentMenuId>[] = [
  { id: 'EDIT', label: '수정하기' },
  { id: 'DELETE', label: '삭제하기', destructive: true }
] as const;
const REPORT_ITEM: BottomSheetMenuData<CommentMenuId> = { id: 'REPORT', label: '신고하기', destructive: true };
const BLOCK_ITEM: BottomSheetMenuData<CommentMenuId> = { id: 'BLOCK', label: '차단하기', destructive: true };

export type CommentMenuTarget = {
  commentId: string;
  authorId: string | null | undefined;
  content: string;
  postId?: string;
};

export type UseCommentMenuParams = {
  onEdit: (target: { commentId: string; content: string; postId?: string }) => void;
  onDeleteSuccess?: () => void;
};

type MyCommentPage = { items: MyCommentItemDto[]; total: number } & Record<string, unknown>;
type CommentListPage = { items: { id: string }[] } & Record<string, unknown>;

export const useCommentMenu = ({ onEdit, onDeleteSuccess }: UseCommentMenuParams) => {
  const { user } = useCurrentUser();
  const { requireLogin } = useLoginRequired();
  const { present, dismiss } = useBottomSheet();
  const { open: openModal, close: closeModal } = useModal();
  const { block } = useBlock();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: ({ commentId }: { commentId: string; postId?: string }) => commentApi.remove(commentId),
    onSuccess: async (_, { commentId, postId }) => {
      if (postId) patchPostCommentCount(queryClient, postId, -1);
      queryClient.setQueriesData<InfiniteData<MyCommentPage>>(
        { queryKey: communityQueries.myCommentList().queryKey },
        (old) =>
          old && {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.filter((comment) => comment.id !== commentId),
              total: Math.max(0, page.total - 1)
            }))
          }
      );
      const removeFromList = (old?: InfiniteData<CommentListPage>) =>
        old && {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: page.items.filter((comment) => comment.id !== commentId)
          }))
        };
      queryClient.setQueriesData<InfiniteData<CommentListPage>>(
        { queryKey: [...commentQueries.all(), 'list'] },
        removeFromList
      );
      queryClient.setQueriesData<InfiniteData<CommentListPage>>(
        { queryKey: [...commentQueries.all(), 'replies'] },
        removeFromList
      );
      onDeleteSuccess?.();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: commentQueries.all() }),
        queryClient.invalidateQueries({ queryKey: communityQueries.myCommentList().queryKey }),
        queryClient.invalidateQueries({ queryKey: [...communityQueries.all(), 'detail'] })
      ]);
    },
    onError: () => globalToast('댓글을 삭제하지 못했어요', 'fail')
  });

  const openCommentMenu = useCallback(
    ({ commentId, authorId, content, postId }: CommentMenuTarget) => {
      pressHaptic();
      const isMine = !!user && !!authorId && user.id === authorId;
      const menuItems: readonly BottomSheetMenuData<CommentMenuId>[] = isMine
        ? MINE_MENU
        : authorId
          ? [REPORT_ITEM, BLOCK_ITEM]
          : [REPORT_ITEM];

      const handlePress = (data: BottomSheetMenuData<CommentMenuId>) => {
        switch (data.id) {
          case 'EDIT':
            dismiss();
            onEdit({ commentId, content, ...(postId ? { postId } : {}) });
            break;
          case 'DELETE':
            dismiss();
            openModal(
              <ConfirmModal
                title="정말 댓글을 삭제할까요?"
                description="*내가 쓴 댓글이 완전히 삭제됩니다."
                confirmText="삭제하기"
                cancelText="닫기"
                destructive
                onCancel={closeModal}
                onConfirm={() => {
                  closeModal();
                  deleteMutation.mutate({ commentId, postId });
                }}
              />
            );
            break;
          case 'REPORT':
            dismiss();
            requireLogin(() => {
              router.push({ pathname: '/report', params: { type: 'COMMENT', id: commentId } });
            });
            break;
          case 'BLOCK':
            dismiss();
            if (authorId)
              requireLogin(() => {
                block(authorId);
              });
            break;
        }
      };

      present(<BottomSheetMenu data={menuItems} value={'' as CommentMenuId} onPress={handlePress} mode="action" />, {
        enableDynamicSizing: true
      });
    },
    [user, requireLogin, present, dismiss, openModal, closeModal, deleteMutation, block, onEdit]
  );

  return { openCommentMenu, isDeleting: deleteMutation.isPending };
};
