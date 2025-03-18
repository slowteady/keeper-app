import { transformAbandonmentDetail } from '@/business/abandonmentsBusiness';
import { transformShelterData } from '@/business/sheltersBusiness';
import DetailHeader from '@/components/organisms/headers/DetailHeader';
import AbandonmentsDetailTemplate from '@/components/templates/abandonments/AbandonmentsDetailTemplate';
import theme from '@/constants/theme';
import { useGetAbandonmentQuery } from '@/hooks/queries/useAbandonments';
import { useGetShelterQuery } from '@/hooks/queries/useShelters';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * 공고 상세 페이지
 * TODO
 * [ ] 보호소 클릭 시, 이동할 수 있게 보호소 링킹 처리
 * [ ] 스켈레톤 처리
 */
const Page = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: abandonmentData } = useGetAbandonmentQuery(Number(id));
  const { data: shelterData } = useGetShelterQuery(abandonmentData?.shelterId || 0, {
    enabled: Boolean(abandonmentData?.shelterId)
  });

  const transformedAbandonmentDetailData = useMemo(
    () => abandonmentData && transformAbandonmentDetail(abandonmentData),
    [abandonmentData]
  );
  const transformedShelterData = useMemo(() => shelterData && transformShelterData(shelterData), [shelterData]);

  return (
    <>
      <Stack.Screen options={{ header: () => <DetailHeader /> }} />

      <View style={styles.container}>
        {transformedAbandonmentDetailData && (
          <AbandonmentsDetailTemplate abandonment={transformedAbandonmentDetailData} shelter={transformedShelterData} />
        )}
      </View>
    </>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.default,
    flex: 1
  }
});
