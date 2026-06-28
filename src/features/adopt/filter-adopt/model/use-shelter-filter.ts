import { useCallback, useMemo, useState } from 'react';

import { SHELTER_FILTER_OPTIONS, SHELTER_SIDO, ShelterAgeBucket } from '@/entities/adopt';
import { CAT_BREEDS, DOG_BREEDS } from '@/shared/model';

export type ShelterFilter = {
  region?: string;
  breed?: string;
  gender?: 'M' | 'F' | 'Q';
  neuter?: 'Y' | 'N' | 'U';
  age?: ShelterAgeBucket;
};

const EMPTY_SHELTER_FILTER: ShelterFilter = {};

const sidoLabel = (id?: string) => SHELTER_SIDO.find((s) => s.id === id)?.label;
const breedLabel = (kindCd?: string) =>
  kindCd ? [...DOG_BREEDS, ...CAT_BREEDS].find((b) => b.kindCd === kindCd)?.name : undefined;
const genderLabel = (id?: string) => SHELTER_FILTER_OPTIONS.GENDER.find((o) => o.id === id)?.label;
const neuterLabel = (id?: string) => SHELTER_FILTER_OPTIONS.NEUTER.find((o) => o.id === id)?.label;
const ageLabel = (id?: string) => SHELTER_FILTER_OPTIONS.AGE.find((o) => o.id === id)?.label;

type ShelterFilterLabels = {
  region?: string;
  breed?: string;
  gender?: string;
  neuter?: string;
  age?: string;
};

export const useShelterFilter = () => {
  const [applied, setApplied] = useState<ShelterFilter>(EMPTY_SHELTER_FILTER);

  const setRegion = useCallback((region?: string) => setApplied((p) => ({ ...p, region })), []);
  const setBreed = useCallback((breed?: string) => setApplied((p) => ({ ...p, breed })), []);
  const setGender = useCallback((gender?: 'M' | 'F' | 'Q') => setApplied((p) => ({ ...p, gender })), []);
  const setNeuter = useCallback((neuter?: 'Y' | 'N' | 'U') => setApplied((p) => ({ ...p, neuter })), []);
  const setAge = useCallback((age?: ShelterAgeBucket) => setApplied((p) => ({ ...p, age })), []);
  const reset = useCallback(() => setApplied(EMPTY_SHELTER_FILTER), []);

  const labels = useMemo<ShelterFilterLabels>(
    () => ({
      region: sidoLabel(applied.region),
      breed: breedLabel(applied.breed),
      gender: applied.gender ? genderLabel(applied.gender) : undefined,
      neuter: applied.neuter ? neuterLabel(applied.neuter) : undefined,
      age: ageLabel(applied.age)
    }),
    [applied]
  );

  const activeCount = useMemo(
    () => [applied.region, applied.breed, applied.gender, applied.neuter, applied.age].filter(Boolean).length,
    [applied]
  );

  return { applied, setRegion, setBreed, setGender, setNeuter, setAge, reset, labels, activeCount };
};

export type ShelterFilterController = ReturnType<typeof useShelterFilter>;
