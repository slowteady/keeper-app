import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RelativePathString, router } from 'expo-router';
import { useCallback, useMemo, useRef } from 'react';

import { missingApi, missingQueries } from '@/entities/missing';
import { useLoginRequired } from '@/features/auth';
import { useBlock } from '@/features/community/safety';
import { globalToast, pressHaptic } from '@/shared/lib';
import { BottomSheetMenu, type BottomSheetMenuData, ConfirmModal, useBottomSheet, useModal } from '@/shared/ui';

export type MissingMenuId = 'EDIT' | 'DELETE' | 'REPORT' | 'BLOCK';

const EDIT_ITEM: BottomSheetMenuData<MissingMenuId> = { id: 'EDIT', label: '수정하기' };
const DELETE_ITEM: BottomSheetMenuData<MissingMenuId> = { id: 'DELETE', label: '삭제하기', destructive: true };
const REPORT_ITEM: BottomSheetMenuData<MissingMenuId> = { id: 'REPORT', label: '신고하기', destructive: true };
const BLOCK_ITEM: BottomSheetMenuData<MissingMenuId> = { id: 'BLOCK', label: '차단하기', destructive: true };

type UseMissingMenuParams = {
  id: string;
  authorId: string | null | undefined;
  isOwner: boolean;
  stayOnDelete?: boolean;
};

export const useMissingMenu = ({ id, authorId, isOwner, stayOnDelete = false }: UseMissingMenuParams) => {
  const { requireLogin } = useLoginRequired();
  const { present, dismiss } = useBottomSheet();
  const { open: openModal, close: closeModal } = useModal();
  const { block } = useBlock();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => missingApi.remove(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: missingQueries.all() }),
        // communityQueries 를 import 하면 순환 참조가 생겨 리터럴 키를 쓴다 (entities/community: myPostListKey).
        queryClient.invalidateQueries({ queryKey: ['me-posts'] })
      ]);
      globalToast('실종 신고를 삭제했어요', 'success');
      if (!stayOnDelete) router.back();
    },
    onError: () => globalToast('실종 신고를 삭제하지 못했어요', 'fail')
  });

  const handleConfirmDelete = useCallback(() => {
    openModal(
      <ConfirmModal
        title="정말 삭제할까요?"
        description="*작성한 실종 신고가 완전히 삭제됩니다."
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

  const pendingActionRef = useRef<(() => void) | undefined>(undefined);

  const handlePress = useCallback(
    (data: BottomSheetMenuData<MissingMenuId>) => {
      switch (data.id) {
        case 'EDIT':
          pendingActionRef.current = () => router.push(`/(untabs)/missing/post/${id}/edit` as RelativePathString);
          break;
        case 'DELETE':
          pendingActionRef.current = () => handleConfirmDelete();
          break;
        case 'REPORT':
          pendingActionRef.current = () =>
            requireLogin(() => router.push({ pathname: '/report', params: { type: 'POST', id } }));
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
    [dismiss, handleConfirmDelete, block, id, authorId, requireLogin]
  );

  const menuItems = useMemo<readonly BottomSheetMenuData<MissingMenuId>[]>(() => {
    if (isOwner) return [EDIT_ITEM, DELETE_ITEM];
    return authorId ? [REPORT_ITEM, BLOCK_ITEM] : [REPORT_ITEM];
  }, [isOwner, authorId]);

  const openMissingMenu = useCallback(() => {
    pressHaptic();
    present(<BottomSheetMenu data={menuItems} value={'' as MissingMenuId} onPress={handlePress} mode="action" />, {
      enableDynamicSizing: true,
      onDismiss: () => {
        const action = pendingActionRef.current;
        pendingActionRef.current = undefined;
        action?.();
      }
    });
  }, [present, menuItems, handlePress]);

  return { openMissingMenu, isDeleting: deleteMutation.isPending };
};
