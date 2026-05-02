import { NaverMapViewRef } from '@mj-studio/react-native-naver-map';
import { ListRenderItemInfo } from '@shopify/flash-list';
import { useLocalSearchParams } from 'expo-router';
import { Suspense, useCallback, useRef, useState } from 'react';
import { styled, Text, View, XStack, YStack } from 'tamagui';

import { ADOPT_OPTIONS, AdoptCard, AdoptItem } from '@/entities/adopt';
import { useShelter, useShelterAdoptList } from '@/features/shelter';
import { useLocation, useScrollUpButton } from '@/shared/model';
import {
  Button,
  CallModal,
  DetailErrorBoundary,
  Dropdown,
  ScrollUpButton,
  ShowMoreButton,
  SuspenseFallback
} from '@/shared/ui';
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
  const { isGranted } = useLocation();
  const mapRef = useRef<NaverMapViewRef>(null);

  const { shelterData, refresh: refreshShelter, hasCallNumber } = useShelter({ id });
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
  const { handleScroll, handlePressButton, isButtonVisible, scrollRef } = useScrollUpButton();

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

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<AdoptItem>) => {
      const isLeft = index % 2 === 0;

      return (
        <View pl={isLeft ? 20 : 4} pr={isLeft ? 4 : 20} mb={32} onPress={() => goDetail(item.id)}>
          <AdoptCard uri={item.uri} title={item.title} description={item.description} chips={item.chips} />
        </View>
      );
    },
    [goDetail]
  );

  if (!shelterData) return null;

  return (
    <>
      <AdoptListSection
        ref={scrollRef}
        data={convertedData ?? []}
        isLoading={adoptsLoading}
        onScroll={handleScroll}
        onRefreshCallback={refreshFetch}
        renderItem={renderItem}
        emptyComponentVariant="list"
        contentContainerStyle={{ paddingVertical: 48 }}
        header={
          <YStack mb={24}>
            <View mb={30} px={20}>
              <ShelterDetailOverviewSection
                data={shelterData}
                mapRef={mapRef}
                isGranted={isGranted}
                onMapInitialized={handleMapInitialized}
              />
            </View>
            <View mb={32} px={20}>
              <ShelterDetailDescriptionSection
                time={shelterData.time}
                address={shelterData.address}
                person={shelterData.person}
                tel={shelterData.tel ?? '정보 없음'}
              />
            </View>

            {hasCallNumber ? (
              <View mb={40} px={20}>
                <Button size="large" onPress={() => setCallModalOpen((prev) => !prev)}>
                  <Text fontSize={15} fontWeight={600} lineHeight={18} color="$black900">
                    보호소에 문의하기
                  </Text>
                </Button>
              </View>
            ) : (
              <Divider mb={40} />
            )}

            <XStack items="flex-end" justify="space-between" px={20}>
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
                snapPoints={[200]}
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

      <ScrollUpButton visible={isButtonVisible} onPress={handlePressButton} />

      {hasCallNumber && (
        <CallModal
          open={callModalOpen}
          onClose={() => setCallModalOpen(false)}
          tel={shelterData.tel!}
          title={`${shelterData.name}에 문의하기`}
          description="*원활한 소통을 위해 상담원이 상담, 휴대폰 번호, 주소 등을 수집할 수 있습니다."
        />
      )}
    </>
  );
};

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});

const Divider = styled(View, {
  height: 8,
  bg: '$white850'
});
