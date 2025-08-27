import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { styled, View } from 'tamagui';

import { useGetAdoptNoticeQuery } from '@/domains/animal';
import { transformAbandonmentDetail } from '@/domains/animal/business/announcement.business';
import { AbandonmentsDetailTemplate } from '@/domains/animal/components/templates/AbandonmentsDetailTemplate';
import { transformShelterData } from '@/domains/shelter/business/shelter.business';
import { useGetShelterQuery } from '@/domains/shelter/services';
import { useAppReview } from '@/shared/hooks';

/**
 * 입양 공고 상세 페이지
 */
const Page = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  useAppReview();
  const { data: abandonmentData } = useGetAdoptNoticeQuery(id);
  const { data: shelterData } = useGetShelterQuery(abandonmentData?.shelterId || '', {
    enabled: Boolean(abandonmentData?.shelterId)
  });

  const transformedAbandonmentDetailData = useMemo(
    () => abandonmentData && transformAbandonmentDetail(abandonmentData),
    [abandonmentData]
  );
  const transformedShelterData = useMemo(() => shelterData && transformShelterData(shelterData), [shelterData]);

  return (
    <Container>
      {transformedAbandonmentDetailData && (
        <AbandonmentsDetailTemplate abandonment={transformedAbandonmentDetailData} shelter={transformedShelterData} />
      )}
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$backgroundDefault',
  flex: 1
});
