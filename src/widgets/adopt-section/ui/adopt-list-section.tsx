import { FlashList, FlashListProps, FlashListRef } from '@shopify/flash-list';
import { forwardRef } from 'react';
import { RefreshControl } from 'react-native';
import { Text, View, XStack } from 'tamagui';

import { ADOPT_CARD_IMAGE_SIZES, AdoptCardSkeleton, AdoptItem } from '@/entities/adopt';
import { useListRefreshing } from '@/shared/model';
import { FeedNodata } from '@/shared/ui';

export type AdoptListSectionProps = {
  data: AdoptItem[];
  header?: React.ReactElement;
  footer?: React.ReactElement;
  renderItem: FlashListProps<AdoptItem>['renderItem'];
  onRefreshCallback: () => Promise<void>;
  isLoading?: boolean;
  style?: FlashListProps<AdoptItem>['style'];
  onScroll?: FlashListProps<AdoptItem>['onScroll'];
  contentContainerStyle?: FlashListProps<AdoptItem>['contentContainerStyle'];
  emptyComponentVariant?: 'feed' | 'list';
};

export const AdoptListSection = forwardRef<FlashListRef<AdoptItem>, AdoptListSectionProps>(
  (
    {
      data,
      header,
      footer,
      renderItem,
      onRefreshCallback,
      isLoading = false,
      style,
      onScroll,
      contentContainerStyle,
      emptyComponentVariant = 'feed'
    }: AdoptListSectionProps,
    ref
  ) => {
    const { refreshing, handleRefresh } = useListRefreshing(onRefreshCallback);

    return (
      <FlashList
        ref={ref}
        data={data}
        renderItem={renderItem}
        onScroll={onScroll}
        numColumns={2}
        keyExtractor={({ id }) => id}
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListHeaderComponent={header ?? null}
        ListFooterComponent={footer ?? null}
        ListEmptyComponent={<EmptyComponent isLoading={isLoading} emptyComponentVariant={emptyComponentVariant} />}
        contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
        style={style}
      />
    );
  }
);

const EmptyComponent = ({
  isLoading,
  emptyComponentVariant
}: {
  isLoading: boolean;
  emptyComponentVariant: 'feed' | 'list';
}) => {
  if (isLoading) {
    return (
      <XStack gap={8}>
        {Array.from({ length: 2 }).map((_, idx) => (
          <AdoptCardSkeleton key={`adopt-card-skeleton-${idx}`} width={ADOPT_CARD_IMAGE_SIZES.small} />
        ))}
      </XStack>
    );
  }

  if (emptyComponentVariant === 'feed') {
    return (
      <View flex={1} items="center" justify="center" mb={20}>
        <FeedNodata />
      </View>
    );
  }

  return (
    <View flex={1} items="center" justify="center" minH={160}>
      <Text fontSize={15} lineHeight={17} fontWeight="500" color="$black400">
        보호중인 아이들이 없어요.
      </Text>
    </View>
  );
};

AdoptListSection.displayName = 'AdoptListSection';
