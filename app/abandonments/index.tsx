import DetailHeader from '@/components/organisms/headers/DetailHeader';
import AbandonmentsTemplate from '@/components/templates/abandonments/AbandonmentsTemplate';
import { ABANDONMENTS_CONF } from '@/constants/config';
import theme from '@/constants/theme';
import { useGetInfiniteAbandonments } from '@/hooks/queries/useAbandonments';
import { AbandonmentsConfigValue } from '@/types/abandonments';
import { Stack } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

const DEFAULT_SIZE = 10;
const Page = () => {
  const [abandonmentsFilter, setAbandonmentsFilter] = useState<AbandonmentsConfigValue>(ABANDONMENTS_CONF[0]);

  const { data, isLoading, fetchNextPage, hasNextPage } = useGetInfiniteAbandonments({
    animalType: 'DOG',
    filter: abandonmentsFilter.value,
    size: DEFAULT_SIZE
  });

  const handleChangeFilter = useCallback((value: AbandonmentsConfigValue) => {
    setAbandonmentsFilter(value);
  }, []);

  const handleFetch = useCallback(() => {
    if (hasNextPage) fetchNextPage();
  }, [fetchNextPage, hasNextPage]);

  return (
    <>
      <Stack.Screen options={{ header: () => <DetailHeader /> }} />

      <View style={styles.container}>
        <AbandonmentsTemplate
          abandonmentsFilter={abandonmentsFilter}
          data={data}
          isLoading={isLoading}
          onChange={handleChangeFilter}
          onFetch={handleFetch}
        />
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
