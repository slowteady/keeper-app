import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { commentApi, commentQueries } from '@/entities/comment';
import { useCurrentUser } from '@/features/auth';
import { useReportSheet } from '@/features/community/safety';
import { globalToast } from '@/shared/lib';
import { BottomSheetMenu, type BottomSheetMenuData, useBottomSheet, useModal } from '@/shared/ui';

import { ConfirmDeleteModal } from '../ui/confirm-delete-modal';

export type CommentMenuId = 'DELETE' | 'REPORT';

const MINE_MENU: readonly BottomSheetMenuData<CommentMenuId>[] = [{ id: 'DELETE', label: '삭제' }] as const;
const OTHER_MENU: readonly BottomSheetMenuData<CommentMenuId>[] = [{ id: 'REPORT', label: '신고' }] as const;

export type CommentMenuTarget = {
  commentId: number;
  authorId: number | null | undefined;
};

export const useCommentMenu = ({ postId }: { postId: number }) => {
  const { user } = useCurrentUser();
  const { present, dismiss } = useBottomSheet();
  const { open: openModal, close: closeModal } = useModal();
  const { openReportSheet } = useReportSheet();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (commentId: number) => commentApi.remove(commentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...commentQueries.all(), 'list', postId] });
      globalToast('삭제했어요.', 'success');
    },
    onError: () => globalToast('삭제에 실패했어요. 다시 시도해주세요.', 'fail')
  });

  const openCommentMenu = useCallback(
    ({ commentId, authorId }: CommentMenuTarget) => {
      const isMine = !!user && !!authorId && user.id === authorId;
      const menuItems = isMine ? MINE_MENU : OTHER_MENU;

      const handlePress = (data: BottomSheetMenuData<CommentMenuId>) => {
        switch (data.id) {
          case 'DELETE':
            dismiss();
            openModal(
              <ConfirmDeleteModal
                title="댓글을 삭제하시겠어요?"
                onCancel={closeModal}
                onConfirm={() => {
                  closeModal();
                  deleteMutation.mutate(commentId);
                }}
              />
            );
            break;
          case 'REPORT':
            // 같은 BottomSheet 컨텐츠 교체 — dismiss 호출 시 충돌
            openReportSheet({ type: 'COMMENT', id: commentId });
            break;
        }
      };

      present(<BottomSheetMenu data={menuItems} value={'' as CommentMenuId} onPress={handlePress} />, {
        snapPoints: [180]
      });
    },
    [user, present, dismiss, openModal, closeModal, deleteMutation, openReportSheet]
  );

  return { openCommentMenu, isDeleting: deleteMutation.isPending };
};
