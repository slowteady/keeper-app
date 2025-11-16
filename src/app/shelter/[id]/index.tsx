import { useQueryClient } from '@tanstack/react-query';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useLocalSearchParams, usePathname } from 'expo-router';
import { useAtomValue } from 'jotai';
import { useCallback, useMemo } from 'react';
import { RefreshControl } from 'react-native';
import { styled, View } from 'tamagui';

import { adoptFilterAtomFamily } from '@/domains/animal';
import { SheltersDetailTemplate, useGetShelterAdoptNoticesQuery, useGetShelterQuery } from '@/domains/shelter';
import { SHELTER_ADOPT_NOTICES_QUERY_KEY, SHELTER_QUERY_KEY, useRefreshing } from '@/shared';

const Page = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pathname = usePathname();
  const adoptFilter = useAtomValue(adoptFilterAtomFamily(pathname));
  const queryClient = useQueryClient();

  const { data: shelterData, isLoading: isShelterLoading } = useGetShelterQuery(id, { enabled: !!id });
  const {
    data: adoptData,
    isLoading: isAdoptLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage
  } = useGetShelterAdoptNoticesQuery(Number(id), { size: 16, filter: adoptFilter.filter });

  const handleFetch = useCallback(async () => {
    if (hasNextPage) {
      await impactAsync(ImpactFeedbackStyle.Medium);
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage]);
  const onRefreshCallback = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [SHELTER_ADOPT_NOTICES_QUERY_KEY] }),
      queryClient.invalidateQueries({ queryKey: [SHELTER_QUERY_KEY] })
    ]);
  }, [queryClient]);
  const { refreshing, handleRefresh } = useRefreshing(onRefreshCallback);

  const isLoading = useMemo(
    () => ({
      shelter: isShelterLoading,
      adopt: isAdoptLoading || isFetching || isFetchingNextPage
    }),
    [isAdoptLoading, isFetching, isFetchingNextPage, isShelterLoading]
  );

  if (!shelterData) return null;

  return (
    <Container>
      <SheltersDetailTemplate
        shelterData={shelterData}
        adoptData={adoptData}
        isLoading={isLoading}
        onFetch={handleFetch}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      />
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
