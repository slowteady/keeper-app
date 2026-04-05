import { BottomSheetView } from '@gorhom/bottom-sheet';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { GestureResponderEvent } from 'react-native';

import { ADOPT_OPTIONS } from '@/entities/adopt';
import { COMMUNITY_LIST_FILTER } from '@/entities/community';
import { parseQueryParam } from '@/shared/lib';
import { AnimalTypeDto } from '@/shared/model';
import { BottomSheetMenu, useBottomSheet } from '@/shared/ui';

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

  const { present, dismiss } = useBottomSheet();

  const changeAnimalType = useCallback((id: AnimalTypeDto) => {
    router.setParams({ animalType: id });
  }, []);

  const changeFilter = useCallback(
    (_event: GestureResponderEvent) => {
      present(
        <BottomSheetView>
          <BottomSheetMenu
            data={COMMUNITY_LIST_FILTER}
            value={selectedFilter}
            onPress={(data) => {
              router.setParams({ filter: data.id });
              dismiss();
            }}
          />
        </BottomSheetView>,
        { snapPoints: [280] }
      );
    },
    [present, selectedFilter, dismiss]
  );

  return { selectedAnimalType, selectedFilter, changeAnimalType, changeFilter };
};
