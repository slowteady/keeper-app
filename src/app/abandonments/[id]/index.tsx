import { transformAbandonmentDetail } from '@/domains/animal/business/announcement.business';
import { AbandonmentsDetailTemplate } from '@/domains/animal/components/templates/AbandonmentsDetailTemplate';
import { useGetAbandonmentQuery } from '@/domains/animal/queries/announcement.queries';
import { transformShelterData } from '@/domains/shelter/business/shelter.business';
import { useGetShelterQuery } from '@/domains/shelter/queries/shelter.queries';
import { theme } from '@/shared/constants/theme.constants';
import { useAppReview } from '@/shared/hooks/useAppReview';
import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * 공고 상세 페이지
 */
const Page = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  useAppReview();
  const { data: abandonmentData } = useGetAbandonmentQuery(id);
  const { data: shelterData } = useGetShelterQuery(abandonmentData?.shelterId || '', {
    enabled: Boolean(abandonmentData?.shelterId)
  });

  const transformedAbandonmentDetailData = useMemo(
    () => abandonmentData && transformAbandonmentDetail(abandonmentData),
    [abandonmentData]
  );
  const transformedShelterData = useMemo(() => shelterData && transformShelterData(shelterData), [shelterData]);

  return (
    <View style={styles.container}>
      {transformedAbandonmentDetailData && (
        <AbandonmentsDetailTemplate abandonment={transformedAbandonmentDetailData} shelter={transformedShelterData} />
      )}
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.default,
    flex: 1
  }
});
