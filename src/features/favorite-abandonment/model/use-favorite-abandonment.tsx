import { useCallback } from 'react';

import { adoptApi, adoptQueries } from '@/entities/adopt';
import { shelterQueries } from '@/entities/shelter';
import { useLoginRequired } from '@/features/auth';
import { toggleHaptic } from '@/shared/lib';
import { ANALYTICS_EVENT, useAnalytics } from '@/shared/lib/analytics';
import { useFavoriteToggle, useIsFavoritePending } from '@/shared/model';

export const FAVORITE_ABANDONMENT_MUTATION_KEY = ['favorite-abandonment'] as const;
const ADOPT_PREFIX = adoptQueries.all();
const SHELTER_PREFIX = shelterQueries.all();
const ME_FAVORITE_PREFIX = ['me-favorite-abandonments'] as const;

export const useFavoriteAbandonment = () => {
  const { requireLogin } = useLoginRequired();
  const { track } = useAnalytics();

  const mutation = useFavoriteToggle({
    mutationKey: FAVORITE_ABANDONMENT_MUTATION_KEY,
    mutationFn: ({ id, currentlyFavorited }) => (currentlyFavorited ? adoptApi.unfavorite(id) : adoptApi.favorite(id)),
    syncPrefixes: [ADOPT_PREFIX, SHELTER_PREFIX, ME_FAVORITE_PREFIX],
    onSettledInvalidate: (queryClient) => {
      queryClient.invalidateQueries({ queryKey: ADOPT_PREFIX, refetchType: 'none' });
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === SHELTER_PREFIX[0] && query.queryKey[1] === 'adopts',
        refetchType: 'none'
      });
    }
  });

  const toggleFavoriteAbandonment = useCallback(
    (desertionNo: string, currentlyFavorited: boolean) => {
      toggleHaptic(currentlyFavorited);
      requireLogin(() => {
        if (!currentlyFavorited) track(ANALYTICS_EVENT.adoptFavorited, { adopt_id: desertionNo });
        mutation.mutate({ id: desertionNo, currentlyFavorited });
      });
    },
    [mutation, requireLogin, track]
  );

  return { toggleFavoriteAbandonment, isPending: mutation.isPending };
};

export const useIsFavoriteAbandonmentPending = (desertionNo: string): boolean =>
  useIsFavoritePending(FAVORITE_ABANDONMENT_MUTATION_KEY, desertionNo);
