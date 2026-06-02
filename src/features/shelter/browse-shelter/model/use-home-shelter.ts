import { useQuery } from '@tanstack/react-query';

import { shelterQueries } from '@/entities/shelter';
import { useLocation } from '@/shared/model';

const DEFAULT_DISTANCE = 7;

// 홈 "근처 보호소" 섹션 — 현위치 반경 list. 지도·거리카운트는 보호소 탭(useShelterViewport)으로 이관됨.
export const useHomeShelter = () => {
  const { userLocation, isGranted } = useLocation();

  const { data: shelters, isLoading } = useQuery({
    ...shelterQueries.list({
      latitude: userLocation?.latitude ?? 0,
      longitude: userLocation?.longitude ?? 0,
      distance: DEFAULT_DISTANCE,
      userLatitude: userLocation?.latitude,
      userLongitude: userLocation?.longitude
    }),
    enabled: !!userLocation
  });

  return { shelters, isGranted, isLoading };
};
