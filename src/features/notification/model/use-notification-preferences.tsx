import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import {
  NOTIFICATION_CATEGORIES,
  notificationApi,
  NotificationCategoryDto,
  NotificationPreferenceListDto,
  notificationQueries
} from '@/entities/notification';

export const useNotificationPreferences = (enabled = true) => {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({ ...notificationQueries.preferences(), enabled });

  const preferenceKey = [...notificationQueries.all(), 'preferences'] as const;

  const { mutate, isPending } = useMutation({
    mutationFn: notificationApi.updatePreference,
    onMutate: async ({ category, enabled }) => {
      await queryClient.cancelQueries({ queryKey: preferenceKey });
      const previous = queryClient.getQueryData<NotificationPreferenceListDto>(preferenceKey);
      queryClient.setQueryData<NotificationPreferenceListDto>(preferenceKey, (current) => {
        const list = current ?? [];
        const exists = list.some((p) => p.category === category);
        return exists
          ? list.map((p) => (p.category === category ? { ...p, enabled } : p))
          : [...list, { category, enabled }];
      });
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(preferenceKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: preferenceKey });
    }
  });

  const isEnabled = useCallback(
    (category: NotificationCategoryDto) => {
      const pref = data?.find((p) => p.category === category);
      return pref ? pref.enabled : true;
    },
    [data]
  );

  const toggle = useCallback(
    (category: NotificationCategoryDto, enabled: boolean) => mutate({ category, enabled }),
    [mutate]
  );

  return { categories: NOTIFICATION_CATEGORIES, isEnabled, toggle, isLoading, isError, isPending, refetch };
};
