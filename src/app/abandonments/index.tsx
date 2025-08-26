import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { createStore, Provider, useAtomValue } from 'jotai';
import { useCallback, useMemo } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';

import { AbandonmentsTemplate } from '@/domains/animal/components/templates/AbandonmentsTemplate';
import { useGetInfiniteAbandonmentsQuery } from '@/domains/animal/queries/announcement.queries';
import { announcementAtom } from '@/domains/animal/stores/announcement.stores';
import { ABANDONMENTS_QUERY_KEY } from '@/shared/constants/queryKey.constants';
import { theme } from '@/shared/constants/theme.constants';
import { useRefreshing } from '@/shared/hooks/useRefreshing';

/**
 * 공고 목록 페이지
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
  const { type, filter, search } = useAtomValue(announcementAtom);
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

  const handleFetch = useCallback(async () => {
    if (hasNextPage) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      fetchNextPage();
    }
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
    <View style={styles.container}>
      <AbandonmentsTemplate
        data={data}
        onFetch={handleFetch}
        isLoading={isLoading}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.default,
    flex: 1
  }
});
