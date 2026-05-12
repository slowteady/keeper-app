import { useIsMutating, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { adoptApi, adoptQueries } from '@/entities/adopt';
import { useLoginRequired } from '@/features/auth';
import { globalToast } from '@/shared/lib';

import { patchFavoritedCache } from '../lib/patch-favorited-cache';

type ToggleVars = { desertionNo: string; currentlyFavorited: boolean };
type FavoriteResponse = { isFavorited: boolean };

export const FAVORITE_ABANDONMENT_MUTATION_KEY = ['favorite-abandonment'] as const;
const ADOPT_PREFIX = adoptQueries.all();

export const useFavoriteAbandonment = () => {
  const queryClient = useQueryClient();
  const { requireLogin } = useLoginRequired();

  const mutation = useMutation<FavoriteResponse, unknown, ToggleVars, { backup: [readonly unknown[], unknown][] }>({
    mutationKey: [...FAVORITE_ABANDONMENT_MUTATION_KEY],
    mutationFn: ({ desertionNo, currentlyFavorited }) =>
      currentlyFavorited ? adoptApi.unfavorite(desertionNo) : adoptApi.favorite(desertionNo),

    onMutate: async ({ desertionNo, currentlyFavorited }) => {
      await queryClient.cancelQueries({ queryKey: ADOPT_PREFIX });
      const backup = queryClient.getQueriesData({ queryKey: ADOPT_PREFIX });

      const next = !currentlyFavorited;
      queryClient.setQueriesData({ queryKey: ADOPT_PREFIX }, (old: unknown) =>
        patchFavoritedCache(old, (item) => (item as { id?: string }).id === desertionNo, next)
      );

      return { backup };
    },

    onError: (_err, _vars, context) => {
      if (context?.backup) {
        for (const [key, value] of context.backup) {
          queryClient.setQueryData(key, value);
        }
      }
      globalToast('찜 처리에 실패했어요. 잠시 후 다시 시도해주세요', 'fail');
    },

    onSuccess: (data, { desertionNo }) => {
      queryClient.setQueriesData({ queryKey: ADOPT_PREFIX }, (old: unknown) =>
        patchFavoritedCache(old, (item) => (item as { id?: string }).id === desertionNo, data.isFavorited)
      );
    }
  });

  const toggleFavoriteAbandonment = useCallback(
    (desertionNo: string, currentlyFavorited: boolean) => {
      requireLogin(() => mutation.mutate({ desertionNo, currentlyFavorited }));
    },
    [mutation, requireLogin]
  );

  return { toggleFavoriteAbandonment, isPending: mutation.isPending };
};

export const useIsFavoriteAbandonmentPending = (desertionNo: string): boolean => {
  const count = useIsMutating({
    mutationKey: [...FAVORITE_ABANDONMENT_MUTATION_KEY],
    predicate: (m) => (m.state.variables as ToggleVars | undefined)?.desertionNo === desertionNo
  });
  return count > 0;
};
