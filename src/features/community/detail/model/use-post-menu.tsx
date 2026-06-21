import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback, useMemo, useRef } from 'react';

import { communityApi, communityQueries } from '@/entities/community';
import { useCurrentUser, useLoginRequired } from '@/features/auth';
import { useBlock } from '@/features/community/safety';
import { globalToast } from '@/shared/lib';
import { useShare } from '@/shared/model';
import { BottomSheetMenu, type BottomSheetMenuData, ConfirmModal, useBottomSheet, useModal } from '@/shared/ui';

export type PostMenuId = 'TOGGLE_ADOPTION' | 'EDIT' | 'DELETE' | 'REPORT' | 'BLOCK';

const EDIT_ITEM: BottomSheetMenuData<PostMenuId> = { id: 'EDIT', label: '수정하기' };
const DELETE_ITEM: BottomSheetMenuData<PostMenuId> = { id: 'DELETE', label: '삭제하기', destructive: true };
const REPORT_ITEM: BottomSheetMenuData<PostMenuId> = { id: 'REPORT', label: '신고하기', destructive: true };
const BLOCK_ITEM: BottomSheetMenuData<PostMenuId> = { id: 'BLOCK', label: '차단하기', destructive: true };

type AdoptionMenu = {
  status: 'IN_PROGRESS' | 'COMPLETED';
  onToggle: () => void;
};

type UsePostMenuParams = {
  postId: string;
  authorId: string | null | undefined;
  stayOnDelete?: boolean;
  hideBlock?: boolean;
  adoption?: AdoptionMenu;
};

export const usePostMenu = ({
  postId,
  authorId,
  stayOnDelete = false,
  hideBlock = false,
  adoption
}: UsePostMenuParams) => {
  const { user } = useCurrentUser();
  const { requireLogin } = useLoginRequired();
  const { present, dismiss } = useBottomSheet();
  const { open: openModal, close: closeModal } = useModal();
  const { block } = useBlock();
  const { share } = useShare();
  const queryClient = useQueryClient();

  const isMine = !!user && !!authorId && user.id === authorId;

  const deleteMutation = useMutation({
    mutationFn: () => communityApi.deletePost(postId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: communityQueries.all() }),
        queryClient.invalidateQueries({ queryKey: communityQueries.myPostListKey() })
      ]);
      if (!stayOnDelete) router.back();
    },
    onError: () => globalToast('게시글을 삭제하지 못했어요', 'fail')
  });

  const handleConfirmDelete = useCallback(() => {
    openModal(
      <ConfirmModal
        title="정말 게시물을 삭제할까요?"
        description="*내가 쓴 글이 완전히 삭제됩니다."
        confirmText="삭제하기"
        cancelText="닫기"
        destructive
        onCancel={closeModal}
        onConfirm={() => {
          closeModal();
          deleteMutation.mutate();
        }}
      />
    );
  }, [openModal, closeModal, deleteMutation]);

  const handleShare = useCallback(() => {
    share({ type: 'community', id: postId });
  }, [share, postId]);

  const reportPost = useCallback(() => {
    requireLogin(() => router.push({ pathname: '/report', params: { type: 'POST', id: postId } }));
  }, [requireLogin, postId]);

  const pendingActionRef = useRef<(() => void) | undefined>(undefined);

  const handlePress = useCallback(
    (data: BottomSheetMenuData<PostMenuId>) => {
      switch (data.id) {
        case 'TOGGLE_ADOPTION':
          pendingActionRef.current = adoption?.onToggle;
          break;
        case 'EDIT':
          pendingActionRef.current = () => router.push(`/(untabs)/community/${postId}/edit`);
          break;
        case 'DELETE':
          pendingActionRef.current = () => handleConfirmDelete();
          break;
        case 'REPORT':
          pendingActionRef.current = () =>
            requireLogin(() => router.push({ pathname: '/report', params: { type: 'POST', id: postId } }));
          break;
        case 'BLOCK':
          pendingActionRef.current = authorId
            ? () =>
                requireLogin(async () => {
                  await block(authorId);
                  router.back();
                })
            : undefined;
          break;
      }
      dismiss();
    },
    [dismiss, handleConfirmDelete, block, postId, authorId, requireLogin, adoption]
  );

  const menuItems = useMemo<readonly BottomSheetMenuData<PostMenuId>[]>(() => {
    if (isMine) {
      const adoptionItem: BottomSheetMenuData<PostMenuId>[] = adoption
        ? [
            {
              id: 'TOGGLE_ADOPTION',
              label: adoption.status === 'COMPLETED' ? '입양중으로 변경' : '입양완료로 변경'
            }
          ]
        : [];
      return [...adoptionItem, EDIT_ITEM, DELETE_ITEM];
    }
    return authorId && !hideBlock ? [REPORT_ITEM, BLOCK_ITEM] : [REPORT_ITEM];
  }, [isMine, authorId, hideBlock, adoption]);

  const openPostMenu = useCallback(() => {
    present(<BottomSheetMenu data={menuItems} value={'' as PostMenuId} onPress={handlePress} mode="action" />, {
      enableDynamicSizing: true,
      onDismiss: () => {
        const action = pendingActionRef.current;
        pendingActionRef.current = undefined;
        action?.();
      }
    });
  }, [present, menuItems, handlePress]);

  return { openPostMenu, sharePost: handleShare, reportPost, isDeleting: deleteMutation.isPending };
};
