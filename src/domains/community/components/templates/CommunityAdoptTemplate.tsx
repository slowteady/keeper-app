import { BottomSheetView } from '@gorhom/bottom-sheet';
import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { GestureResponderEvent } from 'react-native';
import { useTheme, XStack } from 'tamagui';

import { ADOPT_ANIMAL_TYPES, AnimalType } from '@/domains/animal';
import { ChipButton } from '@/shared/components/_atoms/ChipButton/ChipButton';
import { DownArrow } from '@/shared/components/_atoms/icons/mini';
import { ButtonGroup } from '@/shared/components/_molecules/ButtonGroup';
import { BottomSheetMenu, useBottomSheet } from '@/shared/components/_organisms/BottomSheet';

import { COMMUNITY_LIST_FILTER } from '../../constants';
import { communityAdoptFilterAtom } from '../../stores';
import { CommunityAdoptList } from '../organisms';

// TODO
// [ ] 리스트 카드 완성
// [ ] mock 데이터 삽입

interface CommunityAdoptTemplateProps {
  data: {
    user: { image: string; nickname: string };
    displayTime: string;
  }[];
}

export const CommunityAdoptTemplate = ({ data }: CommunityAdoptTemplateProps) => {
  const [adoptFilter, setAdoptFilter] = useAtom(communityAdoptFilterAtom);

  const { present, dismiss } = useBottomSheet();
  const { black500 } = useTheme();

  const handleChangeAnimalType = useCallback(
    (id: AnimalType) => {
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
        { snapPoints: [300] }
      );
    },
    [adoptFilter.filter, dismiss, present, setAdoptFilter]
  );

  const filterText = COMMUNITY_LIST_FILTER.find((filter) => filter.id === adoptFilter.filter)?.label || '';

  return (
    <>
      <ButtonGroup data={ADOPT_ANIMAL_TYPES} id={adoptFilter.animalType} onChange={handleChangeAnimalType} />

      <XStack mt={16} gap={6}>
        <ChipButton toggleOnPress onPress={() => handleChangeFilter('LOCATION')}>
          내 근처
        </ChipButton>
        <ChipButton toggleOnPress onPress={() => handleChangeFilter('PROMO')}>
          입양홍보
        </ChipButton>
        <ChipButton
          onPress={handlePressFilter}
          right={<DownArrow width={12} height={12} color={black500.val} style={{ marginLeft: 4 }} />}
        >
          {filterText}
        </ChipButton>
      </XStack>

      <CommunityAdoptList data={data} />
    </>
  );
};
