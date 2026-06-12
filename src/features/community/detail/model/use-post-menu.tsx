import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { communityApi, communityQueries } from '@/entities/community';
import { useCurrentUser, useLoginRequired } from '@/features/auth';
import { useBlock } from '@/features/community/safety';
import { globalToast } from '@/shared/lib';
import { useShare } from '@/shared/model';
import { BottomSheetMenu, type BottomSheetMenuData, useBottomSheet, useModal } from '@/shared/ui';

import { ConfirmDeleteModal } from '../ui/confirm-delete-modal';

export type PostMenuId = 'EDIT' | 'DELETE' | 'REPORT' | 'BLOCK';

const MINE_MENU: readonly BottomSheetMenuData<PostMenuId>[] = [
  { id: 'EDIT', label: '수정하기' },
  { id: 'DELETE', label: '삭제하기', destructive: true }
] as const;
const REPORT_ITEM: BottomSheetMenuData<PostMenuId> = { id: 'REPORT', label: '신고하기', destructive: true };
const BLOCK_ITEM: BottomSheetMenuData<PostMenuId> = { id: 'BLOCK', label: '차단하기', destructive: true };

type UsePostMenuParams = {
  postId: string;
  authorId: string | null | undefined;
  stayOnDelete?: boolean;
};

export const usePostMenu = ({ postId, authorId, stayOnDelete = false }: UsePostMenuParams) => {
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
        queryClient.invalidateQueries({ queryKey: communityQueries.myPostList().queryKey })
      ]);
      if (!stayOnDelete) router.back();
    },
    onError: () => globalToast('게시글을 삭제하지 못했어요', 'fail')
  });

  const handleConfirmDelete = useCallback(() => {
    openModal(
      <ConfirmDeleteModal
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

  const handlePress = useCallback(
    (data: BottomSheetMenuData<PostMenuId>) => {
      switch (data.id) {
        case 'EDIT':
          dismiss();
          router.push(`/(untabs)/community/${postId}/edit`);
          break;
        case 'DELETE':
          dismiss();
          handleConfirmDelete();
          break;
        case 'REPORT':
          dismiss();
          requireLogin(() => {
            router.push({ pathname: '/report', params: { type: 'POST', id: postId } });
          });
          break;
        case 'BLOCK':
          dismiss();
          if (authorId)
            requireLogin(async () => {
              await block(authorId);
              router.back();
            });
          break;
      }
    },
    [dismiss, handleConfirmDelete, block, postId, authorId, requireLogin]
  );

  const menuItems = useMemo<readonly BottomSheetMenuData<PostMenuId>[]>(() => {
    if (isMine) return MINE_MENU;
    return authorId ? [REPORT_ITEM, BLOCK_ITEM] : [REPORT_ITEM];
  }, [isMine, authorId]);

  const openPostMenu = useCallback(() => {
    present(<BottomSheetMenu data={menuItems} value={'' as PostMenuId} onPress={handlePress} mode="action" />, {
      enableDynamicSizing: true
    });
  }, [present, menuItems, handlePress]);

  return { openPostMenu, sharePost: handleShare, isDeleting: deleteMutation.isPending };
};
