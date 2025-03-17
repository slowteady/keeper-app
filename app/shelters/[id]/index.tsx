import DetailHeader from '@/components/organisms/headers/DetailHeader';
import SheltersDetailTamplate from '@/components/templates/shelters/SheltersDetailTamplate';
import { SHELTER_ABANDONMENTS_QUERY_KEY, SHELTER_QUERY_KEY } from '@/constants/queryKeys';
import theme from '@/constants/theme';
import { useGetShelterAbandonmentsQuery, useGetShelterQuery } from '@/hooks/queries/useShelters';
import useRefreshing from '@/hooks/useRefreshing';
import { useQueryClient } from '@tanstack/react-query';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';

const Page = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: shelterData, isLoading: isShelterLoading } = useGetShelterQuery(Number(id), { enabled: !!id });
  const {
    data: abandonmentsData,
    isLoading: isAbandonmentsLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage
  } = useGetShelterAbandonmentsQuery(Number(id), {
    size: 16
  });
  const queryClient = useQueryClient();

  const handleFetch = useCallback(() => {
    if (hasNextPage) fetchNextPage();
  }, [fetchNextPage, hasNextPage]);

  const onRefreshCallback = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [SHELTER_ABANDONMENTS_QUERY_KEY] }),
      queryClient.invalidateQueries({ queryKey: [SHELTER_QUERY_KEY] })
    ]);
  }, [queryClient]);

  const { refreshing, handleRefresh } = useRefreshing(onRefreshCallback);

  const isLoading = useMemo(
    () => ({
      shelter: isShelterLoading,
      abandonments: isAbandonmentsLoading || isFetching || isFetchingNextPage
    }),
    [isAbandonmentsLoading, isFetching, isFetchingNextPage, isShelterLoading]
  );

  return (
    <>
      <Stack.Screen options={{ header: () => <DetailHeader /> }} />

      {shelterData && (
        <View style={styles.container}>
          <SheltersDetailTamplate
            shelterData={shelterData}
            abandonmentsData={abandonmentsData}
            isLoading={isLoading}
            onFetch={handleFetch}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          />
        </View>
      )}
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
