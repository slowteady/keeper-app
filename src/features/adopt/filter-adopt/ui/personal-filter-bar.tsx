import { ScrollView } from 'react-native';
import { XStack } from 'tamagui';

import {
  PERSONAL_FILTER_OPTIONS,
  PERSONAL_SORT_OPTIONS,
  PersonalGender,
  PersonalHealth,
  PersonalNeuter,
  PersonalProtection,
  PersonalSort,
  PersonalVaccination,
  SHELTER_FILTER_OPTIONS,
  SHELTER_SIDO,
  ShelterAgeBucket
} from '@/entities/adopt';
import { CAT_BREEDS, DOG_BREEDS } from '@/shared/model';
import { Dropdown, useBottomSheet, useBottomSheetMenu } from '@/shared/ui';

import { PersonalFilterController } from '../model/use-personal-filter';
import { FilterChip, ResetChip } from './filter-chip';
import { SearchableSelectSheet } from './searchable-select-sheet';

export type PersonalFilterBarProps = {
  filter: PersonalFilterController;
  animalType: string;
  sortValue: PersonalSort;
  onChangeSort: (value: PersonalSort) => void;
};

export const PersonalFilterBar = ({ filter, animalType, sortValue, onChangeSort }: PersonalFilterBarProps) => {
  const { present } = useBottomSheet();
  const {
    applied,
    labels,
    activeCount,
    setRegion,
    setBreed,
    setGender,
    setNeuter,
    setAge,
    setProtectionType,
    setAdoptionStatus,
    setVaccination,
    setHealthCheck,
    reset
  } = filter;

  const breeds = animalType === 'DOG' ? DOG_BREEDS : animalType === 'CAT' ? CAT_BREEDS : [];
  const breedEnabled = breeds.length > 0;

  const { open: openGender } = useBottomSheetMenu({
    data: PERSONAL_FILTER_OPTIONS.GENDER,
    value: applied.gender ?? '',
    onPress: (d) => setGender(d.id === '' ? undefined : (d.id as PersonalGender))
  });
  const { open: openNeuter } = useBottomSheetMenu({
    data: PERSONAL_FILTER_OPTIONS.NEUTER,
    value: applied.neuter ?? '',
    onPress: (d) => setNeuter(d.id === '' ? undefined : (d.id as PersonalNeuter))
  });
  const { open: openAge } = useBottomSheetMenu({
    data: [{ id: '', label: '전체' }, ...SHELTER_FILTER_OPTIONS.AGE],
    value: applied.age ?? '',
    onPress: (d) => setAge(d.id === '' ? undefined : (d.id as ShelterAgeBucket))
  });
  const { open: openProtection } = useBottomSheetMenu({
    data: PERSONAL_FILTER_OPTIONS.PROTECTION,
    value: applied.protectionType ?? '',
    onPress: (d) => setProtectionType(d.id === '' ? undefined : (d.id as PersonalProtection))
  });
  const { open: openStatus } = useBottomSheetMenu({
    data: PERSONAL_FILTER_OPTIONS.STATUS,
    value: applied.adoptionStatus ?? '',
    onPress: (d) => setAdoptionStatus(d.id === '' ? undefined : (d.id as 'IN_PROGRESS' | 'COMPLETED'))
  });
  const { open: openVaccination } = useBottomSheetMenu({
    data: PERSONAL_FILTER_OPTIONS.VACCINATION,
    value: applied.vaccination ?? '',
    onPress: (d) => setVaccination(d.id === '' ? undefined : (d.id as PersonalVaccination))
  });
  const { open: openHealth } = useBottomSheetMenu({
    data: PERSONAL_FILTER_OPTIONS.HEALTH,
    value: applied.healthCheck ?? '',
    onPress: (d) => setHealthCheck(d.id === '' ? undefined : (d.id as PersonalHealth))
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
        options={breeds.map((b) => ({ id: b.name, label: b.name }))}
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
        {breedEnabled && <FilterChip label={labels.breed ?? '품종'} active={!!applied.breed} onPress={openBreed} />}
        <FilterChip label={labels.region ?? '지역'} active={!!applied.region} onPress={openRegion} />
        <FilterChip label={labels.age ?? '연령'} active={!!applied.age} onPress={openAge} />
        <FilterChip label={labels.gender ?? '성별'} active={!!applied.gender} onPress={openGender} />
        <FilterChip label={labels.neuter ?? '중성화'} active={!!applied.neuter} onPress={openNeuter} />
        <FilterChip
          label={labels.protectionType ?? '입양 유형'}
          active={!!applied.protectionType}
          onPress={openProtection}
        />
        <FilterChip
          label={labels.adoptionStatus}
          active={applied.adoptionStatus !== 'IN_PROGRESS'}
          onPress={openStatus}
        />
        <FilterChip label={labels.vaccination ?? '예방접종'} active={!!applied.vaccination} onPress={openVaccination} />
        <FilterChip label={labels.healthCheck ?? '건강검진'} active={!!applied.healthCheck} onPress={openHealth} />
      </ScrollView>

      <Dropdown data={PERSONAL_SORT_OPTIONS} value={sortValue} onChange={(v) => onChangeSort(v.id as PersonalSort)} />
    </XStack>
  );
};
