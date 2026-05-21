import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { commentApi, commentQueries } from '@/entities/comment';
import { useCurrentUser, useLoginRequired } from '@/features/auth';
import { useBlock, useReportSheet } from '@/features/community/safety';
import { globalToast } from '@/shared/lib';
import { BottomSheetMenu, type BottomSheetMenuData, useBottomSheet, useModal } from '@/shared/ui';

import { ConfirmDeleteModal } from '../ui/confirm-delete-modal';

export type CommentMenuId = 'EDIT' | 'DELETE' | 'REPORT' | 'BLOCK';

const MINE_MENU: readonly BottomSheetMenuData<CommentMenuId>[] = [
  { id: 'EDIT', label: '수정' },
  { id: 'DELETE', label: '삭제' }
] as const;
const REPORT_ITEM: BottomSheetMenuData<CommentMenuId> = { id: 'REPORT', label: '신고' };
const BLOCK_ITEM: BottomSheetMenuData<CommentMenuId> = { id: 'BLOCK', label: '차단' };

export type CommentMenuTarget = {
  commentId: number;
  authorId: number | null | undefined;
  content: string;
};

export type UseCommentMenuParams = {
  onEdit: (target: { commentId: number; content: string }) => void;
};

export const useCommentMenu = ({ onEdit }: UseCommentMenuParams) => {
  const { user } = useCurrentUser();
  const { requireLogin } = useLoginRequired();
  const { present, dismiss } = useBottomSheet();
  const { open: openModal, close: closeModal } = useModal();
  const { openReportSheet } = useReportSheet();
  const { block } = useBlock();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (commentId: number) => commentApi.remove(commentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: commentQueries.all() });
    },
    onError: () => globalToast('삭제에 실패했어요. 다시 시도해주세요.', 'fail')
  });

  const openCommentMenu = useCallback(
    ({ commentId, authorId, content }: CommentMenuTarget) => {
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
            onEdit({ commentId, content });
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
            requireLogin(() => {
              openReportSheet({ type: 'COMMENT', id: commentId });
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
        snapPoints: [200]
      });
    },
    [user, requireLogin, present, dismiss, openModal, closeModal, deleteMutation, openReportSheet, block, onEdit]
  );

  return { openCommentMenu, isDeleting: deleteMutation.isPending };
};
