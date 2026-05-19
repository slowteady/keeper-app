import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { communityApi, communityQueries } from '@/entities/community';
import { useCurrentUser, useLoginRequired } from '@/features/auth';
import { useRequireCommunityPolicy } from '@/features/community/policy';
import { useBlock, useReportSheet } from '@/features/community/safety';
import { globalToast } from '@/shared/lib';
import { useShare } from '@/shared/model';
import { BottomSheetMenu, type BottomSheetMenuData, useBottomSheet, useModal } from '@/shared/ui';

import { ConfirmDeleteModal } from '../ui/confirm-delete-modal';

export type PostMenuId = 'SHARE' | 'EDIT' | 'DELETE' | 'REPORT' | 'BLOCK';

export type PostMenuShareInfo = {
  title: string;
  image?: string;
};

const SHARE_ITEM: BottomSheetMenuData<PostMenuId> = { id: 'SHARE', label: '공유하기' };
const MINE_TAIL: readonly BottomSheetMenuData<PostMenuId>[] = [
  { id: 'EDIT', label: '수정하기' },
  { id: 'DELETE', label: '삭제하기' }
] as const;
const OTHER_TAIL: readonly BottomSheetMenuData<PostMenuId>[] = [
  { id: 'REPORT', label: '신고하기' },
  { id: 'BLOCK', label: '차단하기' }
] as const;

export const usePostMenu = ({
  postId,
  authorId,
  shareInfo
}: {
  postId: number;
  authorId: number | null | undefined;
  shareInfo?: PostMenuShareInfo;
}) => {
  const { user } = useCurrentUser();
  const { requireLogin } = useLoginRequired();
  const { requirePolicy } = useRequireCommunityPolicy();
  const { present, dismiss } = useBottomSheet();
  const { open: openModal, close: closeModal } = useModal();
  const { openReportSheet } = useReportSheet();
  const { block } = useBlock();
  const { share } = useShare();
  const queryClient = useQueryClient();

  const isMine = !!user && !!authorId && user.id === authorId;

  const deleteMutation = useMutation({
    mutationFn: () => communityApi.deletePost(postId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: communityQueries.all() });
      globalToast('삭제했어요.', 'success');
      router.back();
    },
    onError: () => globalToast('삭제에 실패했어요. 다시 시도해주세요.', 'fail')
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
    if (!shareInfo) return;
    share({
      id: String(postId),
      path: 'community',
      title: shareInfo.title,
      desc: '유기동물들의 가족이 되어주세요',
      image: shareInfo.image
    });
  }, [share, postId, shareInfo]);

  const handlePress = useCallback(
    (data: BottomSheetMenuData<PostMenuId>) => {
      switch (data.id) {
        case 'SHARE':
          dismiss();
          handleShare();
          break;
        case 'EDIT':
          dismiss();
          router.push(`/(untabs)/community/${postId}/edit`);
          break;
        case 'DELETE':
          dismiss();
          handleConfirmDelete();
          break;
        case 'REPORT':
          requireLogin(async () => {
            await requirePolicy(() => openReportSheet({ type: 'POST', id: postId }));
          });
          break;
        case 'BLOCK':
          dismiss();
          if (authorId)
            requireLogin(async () => {
              await requirePolicy(() => block(authorId));
            });
          break;
      }
    },
    [dismiss, handleShare, handleConfirmDelete, openReportSheet, block, postId, authorId, requireLogin, requirePolicy]
  );

  const menuItems = useMemo(() => [SHARE_ITEM, ...(isMine ? MINE_TAIL : OTHER_TAIL)], [isMine]);

  const openPostMenu = useCallback(() => {
    present(<BottomSheetMenu data={menuItems} value={'' as PostMenuId} onPress={handlePress} />, {
      snapPoints: [240]
    });
  }, [present, menuItems, handlePress]);

  return { openPostMenu, isDeleting: deleteMutation.isPending };
};
