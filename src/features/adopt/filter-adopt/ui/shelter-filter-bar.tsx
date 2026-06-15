import { ScrollView } from 'react-native';
import { XStack } from 'tamagui';

import {
  ADOPT_OPTIONS,
  AdoptFilterDto,
  SHELTER_FILTER_OPTIONS,
  SHELTER_SIDO,
  ShelterAgeBucket
} from '@/entities/adopt';
import { CAT_BREEDS, DOG_BREEDS } from '@/shared/model';
import { Dropdown, useBottomSheet, useBottomSheetMenu } from '@/shared/ui';

import { ShelterFilterController } from '../model/use-shelter-filter';
import { FilterChip, ResetChip } from './filter-chip';
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
        {activeCount > 0 && <ResetChip onPress={reset} />}
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
