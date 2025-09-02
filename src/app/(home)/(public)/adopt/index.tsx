import { useQueryClient } from '@tanstack/react-query';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useNavigation, usePathname } from 'expo-router';
import { useAtomValue } from 'jotai';
import { useResetAtom } from 'jotai/utils';
import { useCallback, useEffect, useMemo } from 'react';
import { RefreshControl } from 'react-native';
import { styled, View } from 'tamagui';

import { adoptFilterAtomFamily, useGetAdoptNoticesQuery } from '@/domains/animal';
import { AbandonmentsTemplate } from '@/domains/animal/components/templates/AbandonmentsTemplate';
import { ADOPT_NOTICES_QUERY_KEY } from '@/shared/constants';
import { useRefreshing } from '@/shared/hooks';

/**
 * 입양 공고 목록 페이지
 */
const Page = () => {
  const pathname = usePathname();
  const adoptFilter = useAtomValue(adoptFilterAtomFamily(pathname));
  const resetFilter = useResetAtom(adoptFilterAtomFamily(pathname));

  const param = useMemo(() => ({ ...adoptFilter, size: 16 }), [adoptFilter]);
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const {
    data,
    isLoading: isFetchLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage
  } = useGetAdoptNoticesQuery(param);

  const handleFetch = useCallback(async () => {
    if (hasNextPage) {
      await impactAsync(ImpactFeedbackStyle.Medium);
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage]);

  const onRefreshCallback = useCallback(async () => {
    await Promise.all([queryClient.invalidateQueries({ queryKey: [ADOPT_NOTICES_QUERY_KEY, param] })]);
  }, [param, queryClient]);

  const { refreshing, handleRefresh } = useRefreshing(onRefreshCallback);

  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', () => {
      resetFilter();
    });
    return unsub;
  }, [navigation, resetFilter]);

  const isLoading = useMemo(
    () => isFetchLoading || isFetching || isFetchingNextPage,
    [isFetchLoading, isFetching, isFetchingNextPage]
  );

  return (
    <Container>
      <AbandonmentsTemplate
        data={data}
        onFetch={handleFetch}
        isLoading={isLoading}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      />
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$backgroundDefault',
  flex: 1
});
