import { useCallback } from 'react';

import { shelterApi, shelterQueries } from '@/entities/shelter';
import { useLoginRequired } from '@/features/auth';
import { toggleHaptic } from '@/shared/lib';
import { useFavoriteToggle, useIsFavoritePending } from '@/shared/model';

export const FAVORITE_SHELTER_MUTATION_KEY = ['favorite-shelter'] as const;
const SHELTER_PREFIX = shelterQueries.all();
const ME_FAVORITE_PREFIX = ['me-favorite-shelters'] as const;

export const useFavoriteShelter = () => {
  const { requireLogin } = useLoginRequired();

  const mutation = useFavoriteToggle({
    mutationKey: FAVORITE_SHELTER_MUTATION_KEY,
    mutationFn: ({ id, currentlyFavorited }) =>
      currentlyFavorited ? shelterApi.unfavorite(id) : shelterApi.favorite(id),
    syncPrefixes: [SHELTER_PREFIX, ME_FAVORITE_PREFIX],
    onSettledInvalidate: (queryClient) => queryClient.invalidateQueries({ queryKey: SHELTER_PREFIX })
  });

  const toggleFavoriteShelter = useCallback(
    (careRegNo: string, currentlyFavorited: boolean) => {
      toggleHaptic(currentlyFavorited);
      requireLogin(() => mutation.mutate({ id: careRegNo, currentlyFavorited }));
    },
    [mutation, requireLogin]
  );

  return { toggleFavoriteShelter, isPending: mutation.isPending };
};

export const useIsFavoriteShelterPending = (careRegNo: string): boolean =>
  useIsFavoritePending(FAVORITE_SHELTER_MUTATION_KEY, careRegNo);
