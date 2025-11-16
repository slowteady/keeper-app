import { useMemo } from 'react';
import { XStack } from 'tamagui';

import { InfoItem, StatusList } from '@/shared';

export interface CommunityDetailInfoSectionProps {
  age: string;
  gender: string;
  weight: string;
  healthCheck: string;
  neuterYn: string;
  vaccinationCheck: string;
}

export const CommunityDetailInfoSection = ({
  age,
  gender,
  weight,
  healthCheck,
  neuterYn,
  vaccinationCheck
}: CommunityDetailInfoSectionProps) => {
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
        <InfoItem label="나이" value={age} subLabel="년생" />
        <InfoItem label="성별" value={gender} />
        <InfoItem label="크기/몸무게" value={weight} />
      </XStack>

      <StatusList data={statusList} />
    </>
  );
};
