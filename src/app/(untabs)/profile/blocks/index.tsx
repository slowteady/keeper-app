import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { useCallback } from 'react';
import { ActivityIndicator } from 'react-native';
import { styled, View, YStack } from 'tamagui';

import type { BlockedUserDto } from '@/entities/community';
import { BlockListRow, useBlockList } from '@/features/profile';
import { useListRefreshing } from '@/shared/model';
import { RouteErrorBoundary } from '@/shared/ui';
import { ProfileEmptyState } from '@/widgets/profile';

export const ErrorBoundary = RouteErrorBoundary;

const Page = () => {
  const { items, isLoading, isFetchingNextPage, hasNext, fetchNextPage, refetch, unblock, pendingUnblockId } =
    useBlockList();
  const { refreshing, handleRefresh } = useListRefreshing(async () => {
    await refetch();
  });

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<BlockedUserDto>) => (
      <BlockListRow user={item} onUnblock={() => unblock(item.id)} isPending={pendingUnblockId === item.id} />
    ),
    [unblock, pendingUnblockId]
  );

  return (
    <Container>
      <FlashList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onEndReached={hasNext ? fetchNextPage : undefined}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={<EmptyComponent isLoading={isLoading} />}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View py={20} items="center">
              <ActivityIndicator />
            </View>
          ) : null
        }
        contentContainerStyle={{ paddingVertical: 8, flexGrow: 1 }}
      />
    </Container>
  );
};

export default Page;

const EmptyComponent = ({ isLoading }: { isLoading: boolean }) => (
  <>
    {isLoading ? (
      <View flex={1} items="center" justify="center">
        <ActivityIndicator />
      </View>
    ) : (
      <ProfileEmptyState text="차단한 사용자가 없어요" description="차단한 사용자는 이곳에서 관리할 수 있어요" />
    )}
  </>
);

const Container = styled(YStack, {
  flex: 1,
  bg: '$pageBackground'
});
