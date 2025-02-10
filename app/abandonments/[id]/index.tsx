import { transformAbandonmentData } from '@/businesses/abandonmentsBusiness';
import { transformShelterData } from '@/businesses/sheltersBusiness';
import DetailHeader from '@/components/organisms/headers/DetailHeader';
import AbandonmentsDetailTemplate from '@/components/templates/abandonments/AbandonmentsDetailTemplate';
import theme from '@/constants/theme';
import { useGetAbandonment } from '@/hooks/queries/useAbandonments';
import { useGetShelter } from '@/hooks/queries/useShelters';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

const Page = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: abandonmentData } = useGetAbandonment(Number(id));
  const { data: shelterData } = useGetShelter(abandonmentData?.shelterId || 0, {
    enabled: Boolean(abandonmentData?.shelterId)
  });

  const transformedAbandonmentData = useMemo(
    () => abandonmentData && transformAbandonmentData(abandonmentData),
    [abandonmentData]
  );
  const transformedShelterData = useMemo(() => shelterData && transformShelterData(shelterData), [shelterData]);

  return (
    <>
      <Stack.Screen options={{ header: () => <DetailHeader /> }} />

      <View style={styles.container}>
        {transformedAbandonmentData && (
          <AbandonmentsDetailTemplate abandonment={transformedAbandonmentData} shelter={transformedShelterData} />
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
