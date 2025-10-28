import { BottomSheetView } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { GestureResponderEvent } from 'react-native';

import { adoptListValue, COMMUNITY_LIST_FILTER } from '@/entities';
import { BottomSheetMenu, TAnimalTypeSchema, useBottomSheet, useLoginRequired } from '@/shared';

export interface CommunityFilterSchema {
  animalType: TAnimalTypeSchema;
  filter: (typeof COMMUNITY_LIST_FILTER)[number]['id'];
}

export const useCommunityAdoptList = () => {
  const [adoptFilter, setAdoptFilter] = useState<CommunityFilterSchema>({
    animalType: 'ALL',
    filter: 'NEW'
  });

  const { requireLogin } = useLoginRequired();
  const { present, dismiss } = useBottomSheet();

  const handleChangeAnimalType = useCallback(
    (id: TAnimalTypeSchema) => {
      setAdoptFilter((prev) => ({ ...prev, animalType: id }));
    },
    [setAdoptFilter]
  );

  const handleChangeFilter = useCallback((filter: 'LOCATION' | 'PROMO') => {}, []);

  const handlePressFilter = useCallback(
    (event: GestureResponderEvent) => {
      present(
        <BottomSheetView>
          <BottomSheetMenu
            data={COMMUNITY_LIST_FILTER}
            value={adoptFilter.filter}
            onPress={(data) => {
              setAdoptFilter((prev) => ({ ...prev, filter: data.id }));
              dismiss();
            }}
          />
        </BottomSheetView>,
        { snapPoints: [280] }
      );
    },
    [adoptFilter.filter, dismiss, present, setAdoptFilter]
  );

  const handlePressCard = useCallback((id: string) => {
    router.push({ pathname: '/community/[id]', params: { id } });
  }, []);

  const handlePressLike = useCallback(
    (id: string) => {
      // TODO: 좋아요 처리
      requireLogin(() => {});
    },
    [requireLogin]
  );

  const adoptListData = adoptListValue();

  return {
    state: {
      adoptFilter
    },
    actions: {
      handleChangeAnimalType,
      handleChangeFilter,
      handlePressFilter,
      handlePressLike,
      moveDetailPage: handlePressCard
    },
    data: { adoptListData }
  };
};
