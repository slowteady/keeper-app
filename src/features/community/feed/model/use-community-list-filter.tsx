import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { GestureResponderEvent } from 'react-native';

import { ADOPT_OPTIONS } from '@/entities/adopt/constant';
import { COMMUNITY_LIST_FILTER } from '@/entities/community';
import { parseQueryParam } from '@/shared/lib';
import { AnimalTypeDto } from '@/shared/model';
import { useBottomSheetMenu } from '@/shared/ui';

export type CommunityListFilterSchema = {
  animalType: AnimalTypeDto;
  filter: (typeof COMMUNITY_LIST_FILTER)[number]['id'];
};

export const useCommunityListFilter = () => {
  const params = useLocalSearchParams<Partial<CommunityListFilterSchema>>();

  const selectedAnimalType = useMemo(
    () => parseQueryParam(ADOPT_OPTIONS.ANIMAL, ADOPT_OPTIONS.ANIMAL[0].id, params.animalType),
    [params.animalType]
  );

  const selectedFilter = useMemo(
    () => parseQueryParam(COMMUNITY_LIST_FILTER, COMMUNITY_LIST_FILTER[0].id, params.filter),
    [params.filter]
  );

  const { open: openFilterMenu } = useBottomSheetMenu({
    data: COMMUNITY_LIST_FILTER,
    value: selectedFilter,
    onPress: (data) => router.setParams({ filter: data.id })
  });

  const changeAnimalType = useCallback((id: AnimalTypeDto) => {
    router.setParams({ animalType: id });
  }, []);

  const changeFilter = useCallback((_event: GestureResponderEvent) => openFilterMenu(), [openFilterMenu]);

  return { selectedAnimalType, selectedFilter, changeAnimalType, changeFilter };
};
