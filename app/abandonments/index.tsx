import DetailHeader from '@/components/organisms/headers/DetailHeader';
import AbandonmentsTemplate from '@/components/templates/abandonments/AbandonmentsTemplate';
import { ABANDONMENTS_QUERY_KEY } from '@/constants/queryKeys';
import theme from '@/constants/theme';
import { useGetInfiniteAbandonments } from '@/hooks/queries/useAbandonments';
import { abandonmentsAtom } from '@/states/abandonments';
import { useQueryClient } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { createStore, Provider, useAtomValue } from 'jotai';
import { useCallback, useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

const DEFAULT_SIZE = 16;
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
  const queryClient = useQueryClient();
  const { type, filter, search } = useAtomValue(abandonmentsAtom);
  const param = useMemo(() => ({ animalType: type, filter, search, size: DEFAULT_SIZE }), [filter, search, type]);

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: [ABANDONMENTS_QUERY_KEY, param] });
  }, [param, queryClient]);

  const {
    data,
    isLoading: isFetchLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage
  } = useGetInfiniteAbandonments(param);

  const handleFetch = useCallback(() => {
    if (hasNextPage) fetchNextPage();
  }, [fetchNextPage, hasNextPage]);

  const isLoading = isFetchLoading || isFetching || isFetchingNextPage;

  return (
    <>
      <Stack.Screen options={{ header: () => <DetailHeader /> }} />

      <View style={styles.container}>
        <AbandonmentsTemplate data={data} onFetch={handleFetch} isLoading={isLoading} />
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
