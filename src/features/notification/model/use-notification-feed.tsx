import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';

import { notificationApi, NotificationDto, notificationQueries } from '@/entities/notification';
import { resolveNotificationPath } from '@/shared/lib/deeplink';

export const useNotificationFeed = () => {
  const queryClient = useQueryClient();

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

  const fetchNextPage = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) await fetchNextPageQuery();
  }, [hasNextPage, isFetchingNextPage, fetchNextPageQuery]);

  const openItem = useCallback(
    (item: NotificationDto) => {
      if (!item.readAt) markReadMutation.mutate(item.id);
      const path = resolveNotificationPath(item.refType, item.refId);
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
    deleteSelected
  };
};
