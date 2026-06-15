import { Pressable, ScrollView } from 'react-native';
import { styled, Text, useTheme, XStack } from 'tamagui';

import {
  ADOPT_OPTIONS,
  AdoptFilterDto,
  SHELTER_FILTER_OPTIONS,
  SHELTER_SIDO,
  ShelterAgeBucket
} from '@/entities/adopt';
import { CAT_BREEDS, DOG_BREEDS } from '@/shared/model';
import { Dropdown, useBottomSheet, useBottomSheetMenu } from '@/shared/ui';
import { DownArrow } from '@/shared/ui/icons/mini';

import { ShelterFilterController } from '../model/use-shelter-filter';
import { SearchableSelectSheet } from './searchable-select-sheet';

export type ShelterFilterBarProps = {
  filter: ShelterFilterController;
  animalType: string;
  sortValue: AdoptFilterDto;
  onChangeSort: (value: AdoptFilterDto) => void;
};

export const ShelterFilterBar = ({ filter, animalType, sortValue, onChangeSort }: ShelterFilterBarProps) => {
  const { present } = useBottomSheet();
  const { applied, labels, activeCount, setRegion, setBreed, setGender, setNeuter, setAge, reset } = filter;

  const breeds = animalType === 'DOG' ? DOG_BREEDS : animalType === 'CAT' ? CAT_BREEDS : [];
  const breedEnabled = breeds.length > 0;

  const { open: openGender } = useBottomSheetMenu({
    data: SHELTER_FILTER_OPTIONS.GENDER,
    value: applied.gender ?? '',
    onPress: (d) => setGender(d.id === '' ? undefined : (d.id as 'M' | 'F' | 'Q'))
  });
  const { open: openNeuter } = useBottomSheetMenu({
    data: SHELTER_FILTER_OPTIONS.NEUTER,
    value: applied.neuter ?? '',
    onPress: (d) => setNeuter(d.id === '' ? undefined : (d.id as 'Y' | 'N' | 'U'))
  });
  const { open: openAge } = useBottomSheetMenu({
    data: [{ id: '', label: '전체' }, ...SHELTER_FILTER_OPTIONS.AGE],
    value: applied.age ?? '',
    onPress: (d) => setAge(d.id === '' ? undefined : (d.id as ShelterAgeBucket))
  });

  const openRegion = () =>
    present(
      <SearchableSelectSheet
        options={SHELTER_SIDO.map((s) => ({ id: s.id, label: s.label }))}
        value={applied.region}
        onSelect={setRegion}
      />,
      { snapPoints: ['70%'], disableViewWrap: true }
    );
  const openBreed = () =>
    present(
      <SearchableSelectSheet
        showSearch
        placeholder="품종 검색"
        options={breeds.map((b) => ({ id: b.kindCd, label: b.name }))}
        value={applied.breed}
        onSelect={setBreed}
      />,
      { snapPoints: ['80%'], disableViewWrap: true }
    );

  return (
    <XStack items="center" gap={14}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ gap: 6, alignItems: 'center', paddingRight: 12 }}
      >
        {activeCount > 0 && (
          <Pressable onPress={reset}>
            <ResetPill>
              <ResetText>초기화</ResetText>
            </ResetPill>
          </Pressable>
        )}
        <FilterChip label={labels.region ?? '지역'} active={!!applied.region} onPress={openRegion} />
        <FilterChip label={labels.age ?? '연령'} active={!!applied.age} onPress={openAge} />
        <FilterChip label={labels.gender ?? '성별'} active={!!applied.gender} onPress={openGender} />
        <FilterChip label={labels.neuter ?? '중성화'} active={!!applied.neuter} onPress={openNeuter} />
        {breedEnabled && <FilterChip label={labels.breed ?? '품종'} active={!!applied.breed} onPress={openBreed} />}
      </ScrollView>

      <Dropdown data={ADOPT_OPTIONS.FILTER} value={sortValue} onChange={(v) => onChangeSort(v.id as AdoptFilterDto)} />
    </XStack>
  );
};

type FilterChipProps = { label: string; active: boolean; onPress: () => void };
const FilterChip = ({ label, active, onPress }: FilterChipProps) => {
  const { black900, black500 } = useTheme();
  return (
    <Pressable onPress={onPress}>
      <ChipPill active={active}>
        <ChipLabel active={active}>{label}</ChipLabel>
        <DownArrow width={10} height={6} color={active ? black900.val : black500.val} style={{ marginLeft: 4 }} />
      </ChipPill>
    </Pressable>
  );
};

const ChipPill = styled(XStack, {
  items: 'center',
  px: 14,
  py: 10,
  rounded: 44,
  borderWidth: 1,
  bg: 'transparent',
  variants: {
    active: {
      true: { borderColor: '$black900' },
      false: { borderColor: '$white600' }
    }
  } as const
});

const ChipLabel = styled(Text, {
  fontSize: 14,
  lineHeight: 16,
  variants: {
    active: {
      true: { color: '$black900', fontWeight: '600' },
      false: { color: '$black600', fontWeight: '500' }
    }
  } as const
});

const ResetPill = styled(XStack, {
  items: 'center',
  px: 14,
  py: 10,
  rounded: 44,
  borderWidth: 1,
  borderColor: '$white600'
});

const ResetText = styled(Text, {
  fontSize: 14,
  fontWeight: '500',
  color: '$black500'
});
