import { BottomSheetView } from '@gorhom/bottom-sheet';
import { useCallback, useState } from 'react';
import { GestureResponderEvent } from 'react-native';

import { COMMUNITY_LIST_FILTER } from '@/entities/community';
import { BottomSheetMenu, TAnimalTypeSchema, useBottomSheet } from '@/shared';

export interface CommunityFilterSchema {
  animalType: TAnimalTypeSchema;
  filter: (typeof COMMUNITY_LIST_FILTER)[number]['id'];
}

export const usePostFilter = () => {
  const [filter, setFilter] = useState<CommunityFilterSchema>({
    animalType: 'ALL',
    filter: 'NEW'
  });

  const { present, dismiss } = useBottomSheet();

  const handleChangeAnimalType = useCallback(
    (id: TAnimalTypeSchema) => {
      setFilter((prev) => ({ ...prev, animalType: id }));
    },
    [setFilter]
  );

  const handlePressFilter = useCallback(
    (_event: GestureResponderEvent) => {
      present(
        <BottomSheetView>
          <BottomSheetMenu
            data={COMMUNITY_LIST_FILTER}
            value={filter.filter}
            onPress={(data) => {
              setFilter((prev) => ({ ...prev, filter: data.id }));
              dismiss();
            }}
          />
        </BottomSheetView>,
        { snapPoints: [280] }
      );
    },
    [filter.filter, dismiss, present, setFilter]
  );

  return {
    filter,
    setFilter,
    handleChangeAnimalType,
    handlePressFilter
  };
};
