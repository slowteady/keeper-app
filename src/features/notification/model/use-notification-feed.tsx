import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';

import { notificationApi, NotificationDto, notificationQueries } from '@/entities/notification';
import { resolveNotificationPath } from '@/shared/lib/deeplink';
import { ConfirmModal, useModal } from '@/shared/ui';

export const useNotificationFeed = () => {
  const queryClient = useQueryClient();
  const { open, close } = useModal();

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage: fetchNextPageQuery,
    refetch
  } = useInfiniteQuery(notificationQueries.list());

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [...notificationQueries.all(), 'list'] });
    queryClient.invalidateQueries({ queryKey: [...notificationQueries.all(), 'unread-count'] });
  }, [queryClient]);

  const markReadMutation = useMutation({ mutationFn: notificationApi.markRead, onSuccess: invalidate });
  const markAllReadMutation = useMutation({ mutationFn: notificationApi.markAllRead, onSuccess: invalidate });
  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => notificationApi.remove(id))),
    onSuccess: invalidate
  });
  const deleteAllMutation = useMutation({ mutationFn: notificationApi.removeAll, onSuccess: invalidate });

  const fetchNextPage = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) await fetchNextPageQuery();
  }, [hasNextPage, isFetchingNextPage, fetchNextPageQuery]);

  const openItem = useCallback(
    (item: NotificationDto) => {
      if (!item.readAt) markReadMutation.mutate(item.id);
      const path = resolveNotificationPath(item.refType, item.refId, item.type);
      if (path) router.push(path as never);
    },
    [markReadMutation]
  );

  const markAllRead = useCallback(() => markAllReadMutation.mutate(), [markAllReadMutation]);

  const enterSelectMode = useCallback(() => {
    setSelectMode(true);
    setSelectedIds([]);
  }, []);

  const exitSelectMode = useCallback(() => {
    setSelectMode(false);
    setSelectedIds([]);
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  }, []);

  const deleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    deleteMutation.mutate(selectedIds, { onSuccess: exitSelectMode });
  }, [selectedIds, deleteMutation, exitSelectMode]);

  const deleteAll = useCallback(() => {
    if (total === 0) return;
    open(
      <ConfirmModal
        title="알림 전체 삭제"
        description="모든 알림을 삭제할까요?"
        confirmText="전체 삭제"
        destructive
        onConfirm={() => {
          deleteAllMutation.mutate(undefined, { onSuccess: exitSelectMode });
          close();
        }}
        onCancel={close}
      />
    );
  }, [total, deleteAllMutation, exitSelectMode, open, close]);

  return {
    items,
    total,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage: hasNextPage ?? false,
    refetch,
    fetchNextPage,
    openItem,
    markAllRead,
    selectMode,
    selectedIds,
    enterSelectMode,
    exitSelectMode,
    toggleSelect,
    deleteSelected,
    deleteAll
  };
};
