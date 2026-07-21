import { ListRenderItemInfo } from '@shopify/flash-list';
import dayjs from 'dayjs';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { View, YStack } from 'tamagui';

import { ADOPT_OPTIONS } from '@/entities/adopt';
import { MissingCard, MissingCardSkeleton, MissingFeedItemDto } from '@/entities/missing';
import { MissingFilterBar, useMissingFeed, useMissingFilter } from '@/features/missing';
import { globalToast } from '@/shared/lib';
import { useScrollToTop } from '@/shared/model';
import { ButtonGroup, FeedNodata, ScrollToTopButton, ShowMoreButton } from '@/shared/ui';
import { AdoptListSection } from '@/widgets/adopt-section';

const SKELETON_ROWS = 3;

type AnimalType = (typeof ADOPT_OPTIONS.ANIMAL)[number]['id'];

export const MissingListSection = () => {
  const router = useRouter();
  const [animalType, setAnimalType] = useState<AnimalType>('ALL');
  const { ref, scrollY, onScroll, scrollToTop } = useScrollToTop<MissingFeedItemDto>();
  const { region, applyNearby, clear } = useMissingFilter();
  const { items, isLoading, isError, isFetchingNextPage, hasNextPage, refresh, fetchNextPage } = useMissingFeed({
    animalType: animalType === 'ALL' ? undefined : animalType,
    sido: region?.sido,
    sigungu: region?.sigungu
  });

  useEffect(() => {
    ref.current?.scrollToOffset({ offset: 0, animated: false });
  }, [animalType, region, ref]);

  const goDetail = useCallback(
    (item: MissingFeedItemDto) => {
      if (item.source === 'USER') {
        router.push({ pathname: '/missing/post/[id]', params: { id: item.id } });
      } else {
        router.push({ pathname: '/missing/[id]', params: { id: item.id } });
      }
    },
    [router]
  );

  const handlePressNearby = useCallback(async () => {
    if (region) {
      clear();
      return;
    }
    const result = await applyNearby();
    if (!result.ok) {
      globalToast(result.reason === 'permission' ? '위치 권한을 켜주세요' : '현재 위치를 확인하지 못했어요', 'fail');
    }
  }, [region, applyNearby, clear]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<MissingFeedItemDto>) => (
      <View mb={32}>
        <MissingCard
          uri={item.thumbnail ?? ''}
          kind={item.kindLabel}
          region={item.region}
          date={dayjs(item.sortDate).format('YYYY.MM.DD')}
          status={item.status}
          onPress={() => goDetail(item)}
        />
      </View>
    ),
    [goDetail]
  );

  const handleMore = useCallback(() => {
    impactAsync(ImpactFeedbackStyle.Medium);
    fetchNextPage();
  }, [fetchNextPage]);

  return (
    <View flex={1}>
      <AdoptListSection
        ref={ref}
        data={items}
        numColumns={1}
        isLoading={isLoading}
        onRefreshCallback={refresh}
        onScroll={onScroll}
        renderItem={renderItem}
        header={
          <YStack mb={16} gap={14}>
            <ButtonGroup data={ADOPT_OPTIONS.ANIMAL} id={animalType} onChange={setAnimalType} />
            <MissingFilterBar active={!!region} onPressNearby={handlePressNearby} />
          </YStack>
        }
        footer={
          hasNextPage ? (
            <View mb={24} justify="center">
              <ShowMoreButton text="더보기" onPress={handleMore} isLoading={isFetchingNextPage} />
            </View>
          ) : undefined
        }
        emptyComponent={
          <EmptyComponent isLoading={isLoading} isError={isError} filtered={!!region} onRetry={refresh} />
        }
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 24, paddingHorizontal: 20 }}
      />
      <ScrollToTopButton scrollY={scrollY} onPress={scrollToTop} threshold={400} />
    </View>
  );
};

const EmptyComponent = ({
  isLoading,
  isError,
  filtered,
  onRetry
}: {
  isLoading: boolean;
  isError: boolean;
  filtered: boolean;
  onRetry: () => void;
}) => {
  if (isLoading) {
    return (
      <YStack gap={32}>
        {Array.from({ length: SKELETON_ROWS }).map((_, idx) => (
          <MissingCardSkeleton key={`missing-skeleton-${idx}`} />
        ))}
      </YStack>
    );
  }

  if (isError) {
    return (
      <View flex={1} items="center" justify="center" mb={20}>
        <FeedNodata
          text="실종 정보를 불러오지 못했어요"
          description="잠시 후 다시 시도해 주세요"
          cta={{ label: '다시 시도', onPress: onRetry }}
        />
      </View>
    );
  }

  return (
    <View flex={1} items="center" justify="center" mb={20}>
      <FeedNodata text={filtered ? '이 지역엔 등록된 실종 정보가 없어요' : '등록된 실종 정보가 없어요'} />
    </View>
  );
};
