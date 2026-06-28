import { useCallback, useMemo, useState } from 'react';

import {
  PERSONAL_FILTER_OPTIONS,
  PersonalAdoptionStatus,
  PersonalGender,
  PersonalHealth,
  PersonalNeuter,
  PersonalProtection,
  PersonalVaccination,
  SHELTER_FILTER_OPTIONS,
  SHELTER_SIDO,
  ShelterAgeBucket
} from '@/entities/adopt';

export type PersonalFilter = {
  region?: string;
  breed?: string;
  gender?: PersonalGender;
  neuter?: PersonalNeuter;
  age?: ShelterAgeBucket;
  protectionType?: PersonalProtection;
  adoptionStatus?: PersonalAdoptionStatus;
  vaccination?: PersonalVaccination;
  healthCheck?: PersonalHealth;
};

const INITIAL_PERSONAL_FILTER: PersonalFilter = { adoptionStatus: 'IN_PROGRESS' };

const sidoLabel = (id?: string) => SHELTER_SIDO.find((s) => s.id === id)?.label;
const ageLabel = (id?: string) => SHELTER_FILTER_OPTIONS.AGE.find((o) => o.id === id)?.label;
const optionLabel = (options: readonly { id: string; label: string }[], id?: string) =>
  id ? options.find((o) => o.id === id)?.label : undefined;
const statusLabel = (status?: PersonalAdoptionStatus) =>
  PERSONAL_FILTER_OPTIONS.STATUS.find((o) => o.id === (status ?? ''))?.label ?? '전체';

export const usePersonalFilter = () => {
  const [applied, setApplied] = useState<PersonalFilter>(INITIAL_PERSONAL_FILTER);

  const setRegion = useCallback((region?: string) => setApplied((p) => ({ ...p, region })), []);
  const setBreed = useCallback((breed?: string) => setApplied((p) => ({ ...p, breed })), []);
  const setGender = useCallback((gender?: PersonalGender) => setApplied((p) => ({ ...p, gender })), []);
  const setNeuter = useCallback((neuter?: PersonalNeuter) => setApplied((p) => ({ ...p, neuter })), []);
  const setAge = useCallback((age?: ShelterAgeBucket) => setApplied((p) => ({ ...p, age })), []);
  const setProtectionType = useCallback(
    (protectionType?: PersonalProtection) => setApplied((p) => ({ ...p, protectionType })),
    []
  );
  const setAdoptionStatus = useCallback(
    (adoptionStatus?: PersonalAdoptionStatus) => setApplied((p) => ({ ...p, adoptionStatus })),
    []
  );
  const setVaccination = useCallback(
    (vaccination?: PersonalVaccination) => setApplied((p) => ({ ...p, vaccination })),
    []
  );
  const setHealthCheck = useCallback((healthCheck?: PersonalHealth) => setApplied((p) => ({ ...p, healthCheck })), []);
  const reset = useCallback(() => setApplied(INITIAL_PERSONAL_FILTER), []);

  const labels = useMemo(
    () => ({
      region: sidoLabel(applied.region),
      breed: applied.breed,
      gender: optionLabel(PERSONAL_FILTER_OPTIONS.GENDER, applied.gender),
      neuter: optionLabel(PERSONAL_FILTER_OPTIONS.NEUTER, applied.neuter),
      age: ageLabel(applied.age),
      protectionType: optionLabel(PERSONAL_FILTER_OPTIONS.PROTECTION, applied.protectionType),
      adoptionStatus: statusLabel(applied.adoptionStatus),
      vaccination: optionLabel(PERSONAL_FILTER_OPTIONS.VACCINATION, applied.vaccination),
      healthCheck: optionLabel(PERSONAL_FILTER_OPTIONS.HEALTH, applied.healthCheck)
    }),
    [applied]
  );

  const activeCount = useMemo(
    () =>
      [
        applied.region,
        applied.breed,
        applied.gender,
        applied.neuter,
        applied.age,
        applied.protectionType,
        applied.vaccination,
        applied.healthCheck
      ].filter(Boolean).length + (applied.adoptionStatus !== 'IN_PROGRESS' ? 1 : 0),
    [applied]
  );

  return {
    applied,
    setRegion,
    setBreed,
    setGender,
    setNeuter,
    setAge,
    setProtectionType,
    setAdoptionStatus,
    setVaccination,
    setHealthCheck,
    reset,
    labels,
    activeCount
  };
};

export type PersonalFilterController = ReturnType<typeof usePersonalFilter>;
