import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { useCallback } from 'react';
import { RefreshControl } from 'react-native';
import { XStack } from 'tamagui';

import { ADOPT_CARD_IMAGE_SIZES, AdoptCardSkeleton, AdoptNodata } from '@/entities';
import { AdoptItem } from '@/features';
import { useRefreshing } from '@/shared';

export interface AdoptListProps {
  data: AdoptItem[];
  header?: React.ReactElement;
  footer?: React.ReactElement;
  onRefreshCallback: () => Promise<void>;
  isLoading?: boolean;
}

export const AdoptList = ({ data, header, footer, onRefreshCallback, isLoading = false }: AdoptListProps) => {
  const { refreshing, handleRefresh } = useRefreshing(onRefreshCallback);

  const renderItem = useCallback(({ item }: ListRenderItemInfo<AdoptItem>) => {
    return <></>;
  }, []);

  return (
    <FlashList
      data={data}
      renderItem={renderItem}
      keyExtractor={({ id }, i) => `${id}-${i}`}
      showsVerticalScrollIndicator={false}
      decelerationRate="fast"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      ListHeaderComponent={header}
      ListFooterComponent={footer}
      ListEmptyComponent={<EmptyComponent isLoading={isLoading} />}
      ListFooterComponentStyle={{ justifyContent: 'center', paddingBottom: 20 }}
      // columnWrapperStyle={{ gap: 8, marginBottom: 32, justifyContent: 'space-between' }}
      // contentContainerStyle={{ paddingHorizontal: 20 }}
    />
  );
};

const EmptyComponent = ({ isLoading }: { isLoading: boolean }) => {
  return isLoading ? (
    <XStack gap={18}>
      {Array.from({ length: 2 }).map((_, idx) => (
        <AdoptCardSkeleton key={`adopt-card-skeleton-${idx}`} width={ADOPT_CARD_IMAGE_SIZES.medium} />
      ))}
    </XStack>
  ) : (
    <AdoptNodata />
  );
};
