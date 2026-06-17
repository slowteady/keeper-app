import { NaverMapViewRef } from '@mj-studio/react-native-naver-map';
import { FlashListRef, ListRenderItemInfo } from '@shopify/flash-list';
import { RelativePathString, router, useLocalSearchParams } from 'expo-router';
import { Suspense, useCallback, useRef, useState } from 'react';
import { showLocation } from 'react-native-map-link';
import { styled, Text, View, XStack, YStack } from 'tamagui';

import { ADOPT_OPTIONS, AdoptCard, AdoptItem } from '@/entities/adopt';
import { useFavoriteAbandonment } from '@/features/favorite-abandonment';
import { useFavoriteShelter } from '@/features/favorite-shelter';
import { useShelter, useShelterAdoptList } from '@/features/shelter';
import { useLocation, useShare } from '@/shared/model';
import { BottomButton, CallModal, DetailErrorBoundary, Dropdown, ShowMoreButton, SuspenseFallback } from '@/shared/ui';
import { AdoptListSection } from '@/widgets/adopt-section';
import { ShelterDetailDescriptionSection, ShelterDetailOverviewSection } from '@/widgets/shelter-section';

export const ErrorBoundary = DetailErrorBoundary;

const Page = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  if (!id) return null;

  return (
    <Container>
      <Suspense fallback={<SuspenseFallback />}>
        <ShelterDetailContent id={id} />
      </Suspense>
    </Container>
  );
};

export default Page;

const ShelterDetailContent = ({ id }: { id: string }) => {
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [buttonHeight, setButtonHeight] = useState(0);
  const { isGranted, permissionStatus } = useLocation();
  const mapRef = useRef<NaverMapViewRef>(null);

  const { shelterData, refresh: refreshShelter, hasCallNumber } = useShelter({ id });
  const { toggleFavoriteShelter } = useFavoriteShelter();
  const { toggleFavoriteAbandonment } = useFavoriteAbandonment();
  const { share } = useShare();

  const handlePressShare = () => {
    if (!shelterData) return;
    share({ type: 'shelter', id: shelterData.id });
  };
  const {
    selectedFilter,
    convertedData,
    moreButtonText,
    isLoading: adoptsLoading,
    hasNextPage,
    isFetchingNextPage,
    changeFilter,
    refresh: refreshAdopts,
    fetchNextPage,
    goDetail
  } = useShelterAdoptList({ id });
  const scrollRef = useRef<FlashListRef<AdoptItem>>(null);

  const handleMapInitialized = useCallback(() => {
    if (shelterData) {
      mapRef.current?.animateCameraTo({
        latitude: shelterData.latitude,
        longitude: shelterData.longitude
      });
    }
  }, [shelterData]);

  const refreshFetch = useCallback(async () => {
    await Promise.all([refreshShelter(), refreshAdopts()]);
  }, [refreshShelter, refreshAdopts]);

  const handleDirections = useCallback(() => {
    if (!shelterData) return;
    showLocation({
      latitude: shelterData.latitude,
      longitude: shelterData.longitude,
      title: shelterData.name,
      directionsMode: 'car',
      dialogTitle: '길찾기',
      dialogMessage: '길찾기에 사용할 지도 앱을 선택해주세요',
      cancelText: '취소'
    });
  }, [shelterData]);

  const handleOpenMap = useCallback(() => {
    router.push(`/shelter/${id}/map` as RelativePathString);
  }, [id]);

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<AdoptItem>) => {
      const isLeft = index % 2 === 0;

      return (
        <View pl={isLeft ? 20 : 4} pr={isLeft ? 4 : 20} mb={32}>
          <AdoptCard
            uri={item.uri}
            title={item.title}
            description={item.description}
            chips={item.chips}
            isFavorited={item.isFavorited}
            status={item.status}
            onPress={() => goDetail(item.id)}
            onPressFavorite={() => toggleFavoriteAbandonment(item.id, item.isFavorited ?? false)}
          />
        </View>
      );
    },
    [goDetail, toggleFavoriteAbandonment]
  );

  if (!shelterData) return null;

  return (
    <>
      <AdoptListSection
        ref={scrollRef}
        data={convertedData ?? []}
        isLoading={adoptsLoading}
        onRefreshCallback={refreshFetch}
        renderItem={renderItem}
        emptyComponentVariant="list"
        contentContainerStyle={{ paddingTop: 48, paddingBottom: buttonHeight + 40 }}
        header={
          <YStack mb={24} gap={28}>
            <View px={20}>
              <ShelterDetailOverviewSection
                data={shelterData}
                mapRef={mapRef}
                isGranted={isGranted}
                isLocationPending={permissionStatus === undefined}
                onMapInitialized={handleMapInitialized}
                onPressFavorite={() => toggleFavoriteShelter(shelterData.id, shelterData.isFavorited ?? false)}
                onPressShare={handlePressShare}
                onPressDirections={handleDirections}
                onPressMap={handleOpenMap}
              />
            </View>
            <View px={20}>
              <ShelterDetailDescriptionSection
                time={shelterData.time}
                person={shelterData.person}
                tel={shelterData.tel ?? ''}
              />
            </View>

            <XStack items="center" justify="space-between" px={20}>
              <XStack gap={6} items="flex-end">
                <Text fontSize={20} fontWeight="600" lineHeight={24} letterSpacing={-0.25} color="$black800">
                  보호중인 아이들
                </Text>
                <Text fontSize={15} fontWeight="500" lineHeight={17} letterSpacing={-0.25} color="$black500">
                  {convertedData.length}마리
                </Text>
              </XStack>

              <Dropdown
                data={ADOPT_OPTIONS.FILTER}
                value={selectedFilter}
                onChange={(value) => changeFilter(value.id)}
              />
            </XStack>
          </YStack>
        }
        footer={
          hasNextPage ? (
            <View mb={24} justify="center">
              <ShowMoreButton text={moreButtonText} onPress={fetchNextPage} isLoading={isFetchingNextPage} />
            </View>
          ) : undefined
        }
      />

      <BottomButton
        disabled={!hasCallNumber}
        onPress={hasCallNumber ? () => setCallModalOpen((prev) => !prev) : undefined}
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          setButtonHeight((prev) => (prev === h ? prev : h));
        }}
        topContent={
          !hasCallNumber ? (
            <Text mb={8} self="center" fontSize={13} lineHeight={18} fontWeight={500} color="$black500">
              등록된 연락처가 없어요
            </Text>
          ) : undefined
        }
      >
        <Text fontSize={15} fontWeight={600} lineHeight={18} color={hasCallNumber ? '$black900' : '$black500'}>
          보호소에 문의하기
        </Text>
      </BottomButton>

      {hasCallNumber && (
        <CallModal
          open={callModalOpen}
          onClose={() => setCallModalOpen(false)}
          tel={shelterData.tel!}
          title={`${shelterData.name}에 문의하기`}
          description="*원활한 소통을 위해 상담원이 상담, 휴대폰 번호, 주소 등을 수집할 수 있습니다"
        />
      )}
    </>
  );
};

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
