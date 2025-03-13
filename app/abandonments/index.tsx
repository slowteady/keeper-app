import DetailHeader from '@/components/organisms/headers/DetailHeader';
import AbandonmentsTemplate from '@/components/templates/abandonments/AbandonmentsTemplate';
import { ABANDONMENTS_QUERY_KEY } from '@/constants/queryKeys';
import theme from '@/constants/theme';
import { useGetInfiniteAbandonmentsQuery } from '@/hooks/queries/useAbandonments';
import useRefreshing from '@/hooks/useRefreshing';
import { abandonmentsAtom } from '@/states/abandonments';
import { useQueryClient } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { createStore, Provider, useAtomValue } from 'jotai';
import { useCallback, useMemo } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';

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
  const { type, filter, search } = useAtomValue(abandonmentsAtom);
  const param = useMemo(() => ({ animalType: type, filter, search, size: 16 }), [filter, search, type]);

  const queryClient = useQueryClient();
  const {
    data,
    isLoading: isFetchLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage
  } = useGetInfiniteAbandonmentsQuery(param);

  const handleFetch = useCallback(() => {
    if (hasNextPage) fetchNextPage();
  }, [fetchNextPage, hasNextPage]);

  const isLoading = useMemo(
    () => isFetchLoading || isFetching || isFetchingNextPage,
    [isFetchLoading, isFetching, isFetchingNextPage]
  );

  const onRefreshCallback = useCallback(async () => {
    await Promise.all([queryClient.invalidateQueries({ queryKey: [ABANDONMENTS_QUERY_KEY] })]);
  }, [queryClient]);

  const { refreshing, handleRefresh } = useRefreshing(onRefreshCallback);

  return (
    <>
      <Stack.Screen options={{ header: () => <DetailHeader /> }} />

      <View style={styles.container}>
        <AbandonmentsTemplate
          data={data}
          onFetch={handleFetch}
          isLoading={isLoading}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.default,
    flex: 1
  }
});
