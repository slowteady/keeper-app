import { BottomSheetView } from '@gorhom/bottom-sheet';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { GestureResponderEvent } from 'react-native';

import { AnimalTypeDto } from '@/entities';
import { COMMUNITY_LIST_FILTER } from '@/entities/community';
import { ADOPT_ANIMAL_FILTER, BottomSheetMenu, parseQueryParam, useBottomSheet } from '@/shared';

export interface CommunityFilterSchema {
  animalType: AnimalTypeDto;
  filter: (typeof COMMUNITY_LIST_FILTER)[number]['id'];
}

export const usePostFilter = () => {
  const params = useLocalSearchParams<Partial<CommunityFilterSchema>>();

  const selectedAnimalType = useMemo(
    () => parseQueryParam(ADOPT_ANIMAL_FILTER, ADOPT_ANIMAL_FILTER[0].id, params.animalType),
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

  return {
    state: { selectedAnimalType, selectedFilter },
    actions: { changeAnimalType, changeFilter }
  };
};
