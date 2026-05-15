import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { commentApi, commentQueries } from '@/entities/comment';
import { useCurrentUser } from '@/features/auth';
import { useBlock, useReportSheet } from '@/features/community/safety';
import { globalToast } from '@/shared/lib';
import { BottomSheetMenu, type BottomSheetMenuData, useBottomSheet, useModal } from '@/shared/ui';

import { ConfirmDeleteModal } from '../ui/confirm-delete-modal';

export type CommentMenuId = 'EDIT' | 'DELETE' | 'REPORT' | 'BLOCK';

const MINE_MENU: readonly BottomSheetMenuData<CommentMenuId>[] = [
  { id: 'EDIT', label: '수정' },
  { id: 'DELETE', label: '삭제' }
] as const;
const OTHER_MENU: readonly BottomSheetMenuData<CommentMenuId>[] = [
  { id: 'REPORT', label: '신고' },
  { id: 'BLOCK', label: '차단' }
] as const;

export type CommentMenuTarget = {
  commentId: number;
  authorId: number | null | undefined;
  content: string;
};

export type UseCommentMenuParams = {
  postId: number;
  onEdit: (target: { commentId: number; content: string }) => void;
};

export const useCommentMenu = ({ postId, onEdit }: UseCommentMenuParams) => {
  const { user } = useCurrentUser();
  const { present, dismiss } = useBottomSheet();
  const { open: openModal, close: closeModal } = useModal();
  const { openReportSheet } = useReportSheet();
  const { block } = useBlock();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (commentId: number) => commentApi.remove(commentId),
    onSuccess: async () => {
      // 댓글 list + 답글(replies) 캐시 모두 무효화 — 답글 삭제 시에도 화면 즉시 갱신
      await queryClient.invalidateQueries({ queryKey: commentQueries.all() });
      globalToast('삭제했어요.', 'success');
    },
    onError: () => globalToast('삭제에 실패했어요. 다시 시도해주세요.', 'fail')
  });

  const openCommentMenu = useCallback(
    ({ commentId, authorId, content }: CommentMenuTarget) => {
      const isMine = !!user && !!authorId && user.id === authorId;
      const menuItems = isMine ? MINE_MENU : OTHER_MENU;

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
          case 'BLOCK':
            dismiss();
            if (authorId) block(authorId);
            break;
        }
      };

      present(<BottomSheetMenu data={menuItems} value={'' as CommentMenuId} onPress={handlePress} />, {
        snapPoints: [200]
      });
    },
    [user, present, dismiss, openModal, closeModal, deleteMutation, openReportSheet, block, onEdit]
  );

  return { openCommentMenu, isDeleting: deleteMutation.isPending };
};
