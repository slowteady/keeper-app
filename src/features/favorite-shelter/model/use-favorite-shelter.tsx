import { useIsMutating, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { shelterApi, shelterQueries } from '@/entities/shelter';
import { useLoginRequired } from '@/features/auth';
import { globalToast } from '@/shared/lib';

import { patchFavoritedCache } from '../lib/patch-favorited-cache';

type ToggleVars = { careRegNo: string; currentlyFavorited: boolean };
type FavoriteResponse = { isFavorited: boolean };

export const FAVORITE_SHELTER_MUTATION_KEY = ['favorite-shelter'] as const;
const SHELTER_PREFIX = shelterQueries.all();
const ME_FAVORITE_PREFIX = ['me-favorite-shelters'] as const;

export const useFavoriteShelter = () => {
  const queryClient = useQueryClient();
  const { requireLogin } = useLoginRequired();

  const mutation = useMutation<FavoriteResponse, unknown, ToggleVars, { backup: [readonly unknown[], unknown][] }>({
    mutationKey: [...FAVORITE_SHELTER_MUTATION_KEY],
    mutationFn: ({ careRegNo, currentlyFavorited }) =>
      currentlyFavorited ? shelterApi.unfavorite(careRegNo) : shelterApi.favorite(careRegNo),

    onMutate: async ({ careRegNo, currentlyFavorited }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: SHELTER_PREFIX }),
        queryClient.cancelQueries({ queryKey: ME_FAVORITE_PREFIX })
      ]);
      const backup = [
        ...queryClient.getQueriesData({ queryKey: SHELTER_PREFIX }),
        ...queryClient.getQueriesData({ queryKey: ME_FAVORITE_PREFIX })
      ];

      const next = !currentlyFavorited;
      const matcher = (item: unknown) => (item as { id?: string }).id === careRegNo;
      queryClient.setQueriesData({ queryKey: SHELTER_PREFIX }, (old: unknown) =>
        patchFavoritedCache(old, matcher, next)
      );
      queryClient.setQueriesData({ queryKey: ME_FAVORITE_PREFIX }, (old: unknown) =>
        patchFavoritedCache(old, matcher, next)
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

    onSuccess: (data, { careRegNo }) => {
      const matcher = (item: unknown) => (item as { id?: string }).id === careRegNo;
      queryClient.setQueriesData({ queryKey: SHELTER_PREFIX }, (old: unknown) =>
        patchFavoritedCache(old, matcher, data.isFavorited)
      );
      queryClient.setQueriesData({ queryKey: ME_FAVORITE_PREFIX }, (old: unknown) =>
        patchFavoritedCache(old, matcher, data.isFavorited)
      );
    },

    // 연속 토글 race condition 방지 — 마지막 mutation 만 invalidate trigger.
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: [...FAVORITE_SHELTER_MUTATION_KEY] }) === 1) {
        queryClient.invalidateQueries({ queryKey: SHELTER_PREFIX });
      }
    }
  });

  const toggleFavoriteShelter = useCallback(
    (careRegNo: string, currentlyFavorited: boolean) => {
      requireLogin(() => mutation.mutate({ careRegNo, currentlyFavorited }));
    },
    [mutation, requireLogin]
  );

  return { toggleFavoriteShelter, isPending: mutation.isPending };
};

// 특정 careRegNo 의 찜 mutation 진행 중 여부 — 카드별 isLoading
export const useIsFavoriteShelterPending = (careRegNo: string): boolean => {
  const count = useIsMutating({
    mutationKey: [...FAVORITE_SHELTER_MUTATION_KEY],
    predicate: (m) => (m.state.variables as ToggleVars | undefined)?.careRegNo === careRegNo
  });
  return count > 0;
};
