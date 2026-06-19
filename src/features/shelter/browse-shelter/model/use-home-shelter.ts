import { useQuery } from '@tanstack/react-query';

import {
  attachDistance,
  filterWithinKm,
  SHELTER_NATION_BOUNDS,
  shelterQueries,
  sortByDistance
} from '@/entities/shelter';
import { useLocation } from '@/shared/model';

const DEFAULT_DISTANCE = 7;

export const useHomeShelter = () => {
  const { userLocation, isGranted } = useLocation();

  const { data: shelters, isLoading } = useQuery({
    ...shelterQueries.within(SHELTER_NATION_BOUNDS),
    enabled: !!userLocation,
    select: (data) =>
      userLocation ? sortByDistance(filterWithinKm(attachDistance(data, userLocation), DEFAULT_DISTANCE)) : []
  });

  return { shelters, isGranted, isLoading };
};
