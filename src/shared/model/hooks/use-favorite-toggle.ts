import { QueryClient, useIsMutating, useMutation, useQueryClient } from '@tanstack/react-query';

import { globalToast } from '@/shared/lib';
import { patchFavoritedCache } from '@/shared/lib/query/patch-favorited-cache';

type ToggleVars = { id: string; currentlyFavorited: boolean };
type FavoriteResponse = { isFavorited: boolean };
type Backup = [readonly unknown[], unknown][];

type FavoriteToggleConfig = {
  mutationKey: readonly string[];
  mutationFn: (vars: ToggleVars) => Promise<FavoriteResponse>;
  syncPrefixes: readonly (readonly unknown[])[];
  onSettledInvalidate: (queryClient: QueryClient) => void;
};

export const useFavoriteToggle = ({
  mutationKey,
  mutationFn,
  syncPrefixes,
  onSettledInvalidate
}: FavoriteToggleConfig) => {
  const queryClient = useQueryClient();

  return useMutation<FavoriteResponse, unknown, ToggleVars, { backup: Backup }>({
    mutationKey: [...mutationKey],
    mutationFn,

    onMutate: async ({ id, currentlyFavorited }) => {
      await Promise.all(syncPrefixes.map((prefix) => queryClient.cancelQueries({ queryKey: prefix })));
      const backup = syncPrefixes.flatMap((prefix) => queryClient.getQueriesData({ queryKey: prefix }));

      const next = !currentlyFavorited;
      const matcher = (item: unknown) => (item as { id?: string }).id === id;
      syncPrefixes.forEach((prefix) =>
        queryClient.setQueriesData({ queryKey: prefix }, (old: unknown) => patchFavoritedCache(old, matcher, next))
      );

      return { backup };
    },

    onError: (_err, _vars, context) => {
      if (context?.backup) {
        for (const [key, value] of context.backup) {
          queryClient.setQueryData(key, value);
        }
      }
      globalToast('찜을 처리하지 못했어요', 'fail');
    },

    onSuccess: (data, { id }) => {
      const matcher = (item: unknown) => (item as { id?: string }).id === id;
      syncPrefixes.forEach((prefix) =>
        queryClient.setQueriesData({ queryKey: prefix }, (old: unknown) =>
          patchFavoritedCache(old, matcher, data.isFavorited)
        )
      );
    },

    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: [...mutationKey] }) === 1) {
        onSettledInvalidate(queryClient);
      }
    }
  });
};

export const useIsFavoritePending = (mutationKey: readonly string[], id: string): boolean => {
  const count = useIsMutating({
    mutationKey: [...mutationKey],
    predicate: (m) => (m.state.variables as ToggleVars | undefined)?.id === id
  });
  return count > 0;
};
