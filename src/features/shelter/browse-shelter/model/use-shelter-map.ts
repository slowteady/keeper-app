import { useToastController } from '@tamagui/toast';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';

import { searchShelters, ShelterDto } from '@/entities/shelter';

import { useHomeShelter } from './use-home-shelter';

export const useShelterMap = () => {
  const base = useHomeShelter();
  const { show } = useToastController();

  const [searchResults, setSearchResults] = useState<ShelterDto[]>();
  const [reorderedShelter, setReorderedShelter] = useState<ShelterDto>();
  const { mutate: searchMutate, isPending: isSearchPending } = useMutation({ mutationFn: searchShelters });

  const shelterList = useMemo(() => {
    const source = searchResults ?? base.shelters ?? [];
    if (!reorderedShelter) return source;
    return [reorderedShelter, ...source.filter((item) => item.id !== reorderedShelter.id)];
  }, [searchResults, base.shelters, reorderedShelter]);

  const handleRefetch = useCallback(
    (...args: Parameters<typeof base.onRefetch>) => {
      setSearchResults(undefined);
      setReorderedShelter(undefined);
      base.onRefetch(...args);
    },
    [base.onRefetch]
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
      searchMutate(
        {
          search: text,
          userLatitude: base.camera?.latitude ?? 0,
          userLongitude: base.camera?.longitude ?? 0
        },
        {
          onSuccess: ({ data }) => {
            if (!data.data.length) {
              show('검색 결과가 없어요.', { customData: { status: 'fail' } });
              return;
            }
            setSearchResults(data.data);
            setReorderedShelter(undefined);
          }
        }
      );
    },
    [base.camera?.latitude, base.camera?.longitude, searchMutate, show]
  );

  return {
    ...base,
    shelterList,
    isSearchPending,
    onRefetch: handleRefetch,
    onTapMarker: handleTapMarker,
    changeLocation,
    searchLocation
  };
};
