import { FlashList, FlashListProps, FlashListRef } from '@shopify/flash-list';
import { ForwardedRef, forwardRef, ReactElement } from 'react';
import { RefreshControl } from 'react-native';
import { Text, View, XStack } from 'tamagui';

import { ADOPT_CARD_IMAGE_SIZES, AdoptCardSkeleton } from '@/entities/adopt';
import { useListRefreshing } from '@/shared/model';
import { FeedNodata } from '@/shared/ui';

export type AdoptListSectionProps<T> = {
  data: T[];
  header?: React.ReactElement;
  footer?: React.ReactElement;
  renderItem: FlashListProps<T>['renderItem'];
  onRefreshCallback: () => Promise<void>;
  isLoading?: boolean;
  style?: FlashListProps<T>['style'];
  onScroll?: FlashListProps<T>['onScroll'];
  contentContainerStyle?: FlashListProps<T>['contentContainerStyle'];
  emptyComponentVariant?: 'feed' | 'list';
  numColumns?: number;
};

const AdoptListSectionInner = <T extends { id: string }>(
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
    emptyComponentVariant = 'feed',
    numColumns = 2
  }: AdoptListSectionProps<T>,
  ref: ForwardedRef<FlashListRef<T>>
) => {
  const { refreshing, handleRefresh } = useListRefreshing(onRefreshCallback);

  return (
    <FlashList
      ref={ref}
      data={data}
      renderItem={renderItem}
      onScroll={onScroll}
      scrollEventThrottle={16}
      numColumns={numColumns}
      keyExtractor={({ id }) => id}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      ListHeaderComponent={header ?? null}
      ListFooterComponent={footer ?? null}
      ListEmptyComponent={<EmptyComponent isLoading={isLoading} emptyComponentVariant={emptyComponentVariant} />}
      contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
      style={style}
    />
  );
};

export const AdoptListSection = forwardRef(AdoptListSectionInner) as <T extends { id: string }>(
  props: AdoptListSectionProps<T> & { ref?: ForwardedRef<FlashListRef<T>> }
) => ReactElement;

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
        보호중인 아이들이 없어요
      </Text>
    </View>
  );
};
