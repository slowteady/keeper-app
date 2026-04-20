import { useMemo } from 'react';
import { XStack } from 'tamagui';

import { InfoItem } from './info-item';
import { StatusList } from './status-list';

export type AdoptDetailInfoSectionProps = {
  age: string;
  gender: string;
  weight: string;
  healthCheck: string;
  neuterYn: string;
  vaccinationCheck: string;
};

export const AdoptDetailInfoSection = ({
  age,
  gender,
  weight,
  healthCheck,
  neuterYn,
  vaccinationCheck
}: AdoptDetailInfoSectionProps) => {
  const statusList = useMemo(
    () => [
      { label: '중성화', status: neuterYn },
      { label: '백신접종', status: vaccinationCheck },
      { label: '건강검진', status: healthCheck }
    ],
    [healthCheck, neuterYn, vaccinationCheck]
  );

  return (
    <>
      <XStack gap={8} justify="space-between" flex={1} mb={12}>
        <InfoItem label="나이" value={age} />
        <InfoItem label="성별" value={gender} />
        <InfoItem label="크기/몸무게" value={weight} />
      </XStack>

      <StatusList data={statusList} />
    </>
  );
};
