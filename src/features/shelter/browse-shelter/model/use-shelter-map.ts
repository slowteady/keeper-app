import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';

import { searchShelters, ShelterDto, shelterQueries } from '@/entities/shelter';
import { globalToast } from '@/shared/lib';

import { useHomeShelter } from './use-home-shelter';

// 검색 결과를 react-query cache 에 두는 이유 — useFavoriteShelter 의 setQueriesData(['shelters'])
// prefix 매칭으로 검색 모드에서도 찜 토글 낙관 업데이트가 자동 적용된다.
const SEARCH_RESULT_KEY = shelterQueries.searchResult();

export const useShelterMap = () => {
  const base = useHomeShelter();
  const queryClient = useQueryClient();

  const [reorderedShelter, setReorderedShelter] = useState<ShelterDto>();
  const { mutate: searchMutate, isPending: isSearchPending } = useMutation({ mutationFn: searchShelters });

  // setQueryData 로만 채우는 cache-only query. v5 에서 queryFn 의무 → skipToken 으로 명시 (fetch 하지 않음).
  const { data: searchResults } = useQuery<ShelterDto[] | undefined>({
    queryKey: SEARCH_RESULT_KEY,
    queryFn: skipToken,
    staleTime: Infinity,
    gcTime: Infinity
  });

  const shelterList = useMemo(() => {
    const source = searchResults ?? base.shelters ?? [];
    if (!reorderedShelter) return source;
    // reorderedShelter 는 마커 탭 시점 snapshot — cache patch (찜 토글) 가 반영되도록 live lookup 우선.
    const live = source.find((item) => item.id === reorderedShelter.id) ?? reorderedShelter;
    return [live, ...source.filter((item) => item.id !== reorderedShelter.id)];
  }, [searchResults, base.shelters, reorderedShelter]);

  const handleRefetch = useCallback(
    (...args: Parameters<typeof base.onRefetch>) => {
      queryClient.setQueryData<ShelterDto[] | undefined>(SEARCH_RESULT_KEY, undefined);
      setReorderedShelter(undefined);
      base.onRefetch(...args);
    },
    [base.onRefetch, queryClient]
  );

  const handleTapMarker = useCallback(
    (data: ShelterDto) => {
      base.onTapMarker(data);
      setReorderedShelter(data);
    },
    [base.onTapMarker]
  );

  const changeLocation = useCallback(
    (item: { x: string; y: string }) => {
      base.mapRef.current?.animateCameraTo({
        longitude: Number(item.x),
        latitude: Number(item.y)
      });
    },
    [base.mapRef]
  );

  const searchLocation = useCallback(
    (text: string) => {
      // 빈 입력으로 submit (X 후 돋보기) → 검색 모드 해제, base 복귀
      if (!text.trim()) {
        queryClient.setQueryData<ShelterDto[] | undefined>(SEARCH_RESULT_KEY, undefined);
        setReorderedShelter(undefined);
        return;
      }
      searchMutate(
        {
          search: text,
          userLatitude: base.camera?.latitude,
          userLongitude: base.camera?.longitude
        },
        {
          onSuccess: (data) => {
            if (!data.length) {
              globalToast('검색 결과가 없어요', 'fail');
              return;
            }
            queryClient.setQueryData<ShelterDto[]>(SEARCH_RESULT_KEY, data);
            setReorderedShelter(undefined);
          }
        }
      );
    },
    [base.camera?.latitude, base.camera?.longitude, searchMutate, queryClient]
  );

  return {
    ...base,
    shelterList,
    searchResults,
    isSearchPending,
    onRefetch: handleRefetch,
    onTapMarker: handleTapMarker,
    changeLocation,
    searchLocation
  };
};
