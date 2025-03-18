import DetailHeader from '@/components/organisms/headers/DetailHeader';
import SheltersDetailTamplate from '@/components/templates/shelters/SheltersDetailTamplate';
import { SHELTER_ABANDONMENTS_QUERY_KEY, SHELTER_QUERY_KEY } from '@/constants/queryKeys';
import theme from '@/constants/theme';
import { useGetShelterAbandonmentsQuery, useGetShelterQuery } from '@/hooks/queries/useShelters';
import useRefreshing from '@/hooks/useRefreshing';
import { abandonmentsFilterValueAtom } from '@/states/abandonments';
import { useQueryClient } from '@tanstack/react-query';
import { Stack, useLocalSearchParams } from 'expo-router';
import { createStore, Provider, useAtomValue } from 'jotai';
import { useCallback, useMemo } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';

/**
 * 보호소 상세 페이지
 * TODO
 * [ ] 보호소 설명 박스 아이콘 교체
 * [ ] 공고 노데이터 처리
 * [ ] 공고 스켈레톤 처리
 */
const Layout = () => {
  const store = createStore();

  return (
    <Provider store={store}>
      <Page />
    </Provider>
  );
};

export default Layout;

const Page = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const filterValue = useAtomValue(abandonmentsFilterValueAtom);

  const { data: shelterData, isLoading: isShelterLoading } = useGetShelterQuery(Number(id), { enabled: !!id });
  const {
    data: abandonmentsData,
    isLoading: isAbandonmentsLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage
  } = useGetShelterAbandonmentsQuery(Number(id), { size: 16, filter: filterValue.value });
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.default,
    flex: 1
  }
});
