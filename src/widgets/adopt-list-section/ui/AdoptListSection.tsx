import { FlashList, FlashListProps, FlashListRef, ListRenderItemInfo } from '@shopify/flash-list';
import { forwardRef, useCallback } from 'react';
import { RefreshControl } from 'react-native';
import { View, XStack } from 'tamagui';

import { ADOPT_CARD_IMAGE_SIZES, AdoptCard, AdoptCardSkeleton, AdoptNodata } from '@/entities';
import { AdoptItem } from '@/features';
import { useRefreshing } from '@/shared';

export interface AdoptListSectionProps {
  data: AdoptItem[];
  header?: React.ReactElement;
  footer?: React.ReactElement;
  onRefreshCallback: () => Promise<void>;
  isLoading?: boolean;
  style?: FlashListProps<AdoptItem>['style'];
}

export const AdoptListSection = forwardRef<FlashListRef<AdoptItem>, AdoptListSectionProps>(
  ({ data, header, footer, onRefreshCallback, isLoading = false, style }: AdoptListSectionProps, ref) => {
    const { refreshing, handleRefresh } = useRefreshing(onRefreshCallback);

    const renderItem = useCallback(({ item, index }: ListRenderItemInfo<AdoptItem>) => {
      const isLeft = index % 2 === 0;

      return (
        <View pl={isLeft ? 0 : 4} pr={isLeft ? 4 : 0} mb={32}>
          <AdoptCard uri={item.uri} title={item.title} description={item.description} chips={item.chips} />
        </View>
      );
    }, []);

    return (
      <FlashList
        ref={ref}
        data={data}
        renderItem={renderItem}
        numColumns={2}
        keyExtractor={({ id }, i) => `${id}-${i}`}
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListHeaderComponent={header ?? null}
        ListFooterComponent={footer ?? null}
        ListEmptyComponent={<EmptyComponent isLoading={isLoading} />}
        contentContainerStyle={{ paddingHorizontal: 20, flexGrow: 1 }}
        style={style}
      />
    );
  }
);

const EmptyComponent = ({ isLoading }: { isLoading: boolean }) => {
  return isLoading ? (
    <XStack gap={8}>
      {Array.from({ length: 2 }).map((_, idx) => (
        <AdoptCardSkeleton key={`adopt-card-skeleton-${idx}`} width={ADOPT_CARD_IMAGE_SIZES.small} />
      ))}
    </XStack>
  ) : (
    <View flex={1} items="center" justify="center">
      <AdoptNodata />
    </View>
  );
};

AdoptListSection.displayName = 'AdoptListSection';
