import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback } from 'react';

import { commentApi, commentQueries } from '@/entities/comment';
import { communityQueries, MyCommentItemDto } from '@/entities/community';
import { useCurrentUser, useLoginRequired } from '@/features/auth';
import { useBlock } from '@/features/community/safety';
import { globalToast } from '@/shared/lib';
import { BottomSheetMenu, type BottomSheetMenuData, useBottomSheet, useModal } from '@/shared/ui';

import { ConfirmDeleteModal } from '../ui/confirm-delete-modal';

export type CommentMenuId = 'EDIT' | 'DELETE' | 'REPORT' | 'BLOCK';

const MINE_MENU: readonly BottomSheetMenuData<CommentMenuId>[] = [
  { id: 'EDIT', label: '수정하기' },
  { id: 'DELETE', label: '삭제하기' }
] as const;
const REPORT_ITEM: BottomSheetMenuData<CommentMenuId> = { id: 'REPORT', label: '신고하기' };
const BLOCK_ITEM: BottomSheetMenuData<CommentMenuId> = { id: 'BLOCK', label: '차단하기' };

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

export const useCommentMenu = ({ onEdit, onDeleteSuccess }: UseCommentMenuParams) => {
  const { user } = useCurrentUser();
  const { requireLogin } = useLoginRequired();
  const { present, dismiss } = useBottomSheet();
  const { open: openModal, close: closeModal } = useModal();
  const { block } = useBlock();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => commentApi.remove(commentId),
    onSuccess: async (_, commentId) => {
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
      onDeleteSuccess?.();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: commentQueries.all() }),
        queryClient.invalidateQueries({ queryKey: communityQueries.myCommentList().queryKey })
      ]);
    },
    onError: () => globalToast('삭제에 실패했어요. 다시 시도해주세요.', 'fail')
  });

  const openCommentMenu = useCallback(
    ({ commentId, authorId, content, postId }: CommentMenuTarget) => {
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
              <ConfirmDeleteModal
                title="정말 댓글을 삭제할까요?"
                description="*내가 쓴 댓글이 완전히 삭제됩니다."
                onCancel={closeModal}
                onConfirm={() => {
                  closeModal();
                  deleteMutation.mutate(commentId);
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

      present(<BottomSheetMenu data={menuItems} value={'' as CommentMenuId} onPress={handlePress} />, {
        enableDynamicSizing: true
      });
    },
    [user, requireLogin, present, dismiss, openModal, closeModal, deleteMutation, block, onEdit]
  );

  return { openCommentMenu, isDeleting: deleteMutation.isPending };
};
