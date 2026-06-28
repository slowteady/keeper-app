import { FlashList, FlashListProps, FlashListRef } from '@shopify/flash-list';
import { ForwardedRef, forwardRef, ReactElement } from 'react';
import { RefreshControl } from 'react-native';
import { Text, View, XStack, YStack } from 'tamagui';

import { ADOPT_CARD_IMAGE_SIZES, AdoptCardSkeleton, PersonalAdoptCardSkeleton } from '@/entities/adopt';
import { useListRefreshing } from '@/shared/model';
import { FeedNodata } from '@/shared/ui';

const SKELETON_ROWS = 3;

export type AdoptListSectionProps<T> = {
  data: T[];
  header?: React.ReactElement;
  footer?: React.ReactElement;
  renderItem: FlashListProps<T>['renderItem'];
  onRefreshCallback: () => Promise<void>;
  isLoading?: boolean;
  isError?: boolean;
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
    isError = false,
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
      maintainVisibleContentPosition={{ disabled: true }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      ListHeaderComponent={header ?? null}
      ListFooterComponent={footer ?? null}
      ListEmptyComponent={
        <EmptyComponent
          isLoading={isLoading}
          isError={isError}
          onRetry={handleRefresh}
          emptyComponentVariant={emptyComponentVariant}
          numColumns={numColumns}
        />
      }
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
  isError,
  onRetry,
  emptyComponentVariant,
  numColumns
}: {
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  emptyComponentVariant: 'feed' | 'list';
  numColumns: number;
}) => {
  if (isLoading) {
    if (numColumns === 1) {
      return (
        <YStack gap={32}>
          {Array.from({ length: SKELETON_ROWS }).map((_, idx) => (
            <PersonalAdoptCardSkeleton key={`personal-skeleton-${idx}`} />
          ))}
        </YStack>
      );
    }
    return (
      <YStack gap={32}>
        {Array.from({ length: SKELETON_ROWS }).map((_, row) => (
          <XStack key={`adopt-skeleton-row-${row}`} gap={8}>
            <AdoptCardSkeleton width={ADOPT_CARD_IMAGE_SIZES.small} />
            <AdoptCardSkeleton width={ADOPT_CARD_IMAGE_SIZES.small} />
          </XStack>
        ))}
      </YStack>
    );
  }

  if (isError) {
    if (emptyComponentVariant === 'feed') {
      return (
        <View flex={1} items="center" justify="center" mb={20}>
          <FeedNodata
            text="공고를 불러오지 못했어요"
            description="잠시 후 다시 시도해 주세요"
            cta={{ label: '다시 시도', onPress: onRetry }}
          />
        </View>
      );
    }
    return (
      <View flex={1} items="center" justify="center" minH={160}>
        <Text fontSize={15} lineHeight={17} fontWeight="500" color="$black400">
          공고를 불러오지 못했어요
        </Text>
      </View>
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
