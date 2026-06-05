import { useIsMutating, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { adoptApi, adoptQueries } from '@/entities/adopt';
import { shelterQueries } from '@/entities/shelter';
import { useLoginRequired } from '@/features/auth';
import { globalToast, toggleHaptic } from '@/shared/lib';

import { patchFavoritedCache } from '../lib/patch-favorited-cache';

type ToggleVars = { desertionNo: string; currentlyFavorited: boolean };
type FavoriteResponse = { isFavorited: boolean };

export const FAVORITE_ABANDONMENT_MUTATION_KEY = ['favorite-abandonment'] as const;
const ADOPT_PREFIX = adoptQueries.all();
// 보호소 상세 안 공고 목록 (shelterQueries.adopts) 도 sync — id matcher 가 desertionNo 만 패치하므로
// 보호소 list/detail cache 는 무영향 (no-op).
const SHELTER_PREFIX = shelterQueries.all();
// 마이페이지 관심 list 는 도메인 prefix 와 별도 namespace — optimistic patch 만, invalidate 는 안 함 (29cm 잔존).
const ME_FAVORITE_PREFIX = ['me-favorite-abandonments'] as const;

export const useFavoriteAbandonment = () => {
  const queryClient = useQueryClient();
  const { requireLogin } = useLoginRequired();

  const mutation = useMutation<FavoriteResponse, unknown, ToggleVars, { backup: [readonly unknown[], unknown][] }>({
    mutationKey: [...FAVORITE_ABANDONMENT_MUTATION_KEY],
    mutationFn: ({ desertionNo, currentlyFavorited }) =>
      currentlyFavorited ? adoptApi.unfavorite(desertionNo) : adoptApi.favorite(desertionNo),

    onMutate: async ({ desertionNo, currentlyFavorited }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ADOPT_PREFIX }),
        queryClient.cancelQueries({ queryKey: SHELTER_PREFIX }),
        queryClient.cancelQueries({ queryKey: ME_FAVORITE_PREFIX })
      ]);
      const backup = [
        ...queryClient.getQueriesData({ queryKey: ADOPT_PREFIX }),
        ...queryClient.getQueriesData({ queryKey: SHELTER_PREFIX }),
        ...queryClient.getQueriesData({ queryKey: ME_FAVORITE_PREFIX })
      ];

      const next = !currentlyFavorited;
      const matcher = (item: unknown) => (item as { id?: string }).id === desertionNo;
      queryClient.setQueriesData({ queryKey: ADOPT_PREFIX }, (old: unknown) => patchFavoritedCache(old, matcher, next));
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
      globalToast('찜 처리에 실패했어요. 잠시 후 다시 시도해주세요', 'fail');
    },

    onSuccess: (data, { desertionNo }) => {
      const matcher = (item: unknown) => (item as { id?: string }).id === desertionNo;
      queryClient.setQueriesData({ queryKey: ADOPT_PREFIX }, (old: unknown) =>
        patchFavoritedCache(old, matcher, data.isFavorited)
      );
      queryClient.setQueriesData({ queryKey: SHELTER_PREFIX }, (old: unknown) =>
        patchFavoritedCache(old, matcher, data.isFavorited)
      );
      queryClient.setQueriesData({ queryKey: ME_FAVORITE_PREFIX }, (old: unknown) =>
        patchFavoritedCache(old, matcher, data.isFavorited)
      );
    },

    // 연속 토글 race condition 방지 — 마지막 mutation 끝날 때만 invalidate.
    // 현재 settled 중인 자기 자신도 카운트되므로 === 1 비교.
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: [...FAVORITE_ABANDONMENT_MUTATION_KEY] }) === 1) {
        queryClient.invalidateQueries({ queryKey: ADOPT_PREFIX });
        queryClient.invalidateQueries({ queryKey: SHELTER_PREFIX });
      }
    }
  });

  const toggleFavoriteAbandonment = useCallback(
    (desertionNo: string, currentlyFavorited: boolean) => {
      toggleHaptic(currentlyFavorited);
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
