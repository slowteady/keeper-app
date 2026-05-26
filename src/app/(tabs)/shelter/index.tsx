import { useScrollToTop } from '@react-navigation/native';
import { FlashList, FlashListRef, ListRenderItemInfo } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useCallback, useRef } from 'react';
import { styled, Text, View, YStack } from 'tamagui';

import { ShelterCard, ShelterDto } from '@/entities/shelter';
import { KakaoAddressDocumentDto, LocationBottomSheet, useLocationBottomSheet } from '@/features/address';
import { useFavoriteShelter } from '@/features/favorite-shelter';
import { useShelterMap } from '@/features/shelter';
import { RouteErrorBoundary, Skeleton } from '@/shared/ui';
import { ShelterListHeaderSection, ShelterMapSection } from '@/widgets/shelter-section';

export const ErrorBoundary = RouteErrorBoundary;

const Page = () => {
  const {
    shelters,
    shelterCounts,
    shelterList,
    searchResults,
    mapRef,
    camera,
    selectedMarkerId,
    isGranted,
    isLoading,
    isSearchPending,
    onMapInitialized,
    onRefetch,
    onTapMarker,
    changeLocation,
    searchLocation
  } = useShelterMap();
  const scrollRef = useRef<FlashListRef<ShelterDto>>(null);
  useScrollToTop(scrollRef);

  const {
    ref: locationRef,
    searchedAddresses,
    isPending: isLocationPending,
    openBottomSheet,
    submitGeocode,
    getAddress,
    dismiss: dismissLocation
  } = useLocationBottomSheet((item: KakaoAddressDocumentDto) => {
    changeLocation(item);
  });

  const { toggleFavoriteShelter } = useFavoriteShelter();

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ShelterDto>) => {
      return (
        <View px={20}>
          <ShelterCard
            onPress={() => router.push({ pathname: '/shelter/[id]', params: { id: item.id } })}
            onPressFavorite={toggleFavoriteShelter}
            data={item}
          />
        </View>
      );
    },
    [toggleFavoriteShelter]
  );

  return (
    <Container>
      <FlashList
        ref={scrollRef}
        keyExtractor={({ id }) => id}
        data={shelterList}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View px={20} mb={20}>
            <View mb={16}>
              <ShelterListHeaderSection onSearch={searchLocation} onPressLocation={openBottomSheet} />
            </View>

            <ShelterMapSection
              ref={mapRef}
              isGranted={isGranted}
              data={searchResults ?? shelters}
              counts={shelterCounts}
              camera={camera}
              onRefetch={onRefetch}
              onTapMarker={onTapMarker}
              onMapInitialized={onMapInitialized}
              selectedMarkerId={selectedMarkerId}
              searchResultCount={searchResults?.length}
            />
          </View>
        }
        ItemSeparatorComponent={() => <View height={10} />}
        ListEmptyComponent={<EmptyComponent isLoading={isLoading || isSearchPending} />}
        contentContainerStyle={{ paddingVertical: 32 }}
      />

      <LocationBottomSheet
        ref={locationRef}
        addresses={searchedAddresses}
        onDismiss={dismissLocation}
        onSearch={submitGeocode}
        onSelectAddress={getAddress}
        isPending={isLocationPending}
      />
    </Container>
  );
};

export default Page;

const EmptyComponent = ({ isLoading }: { isLoading: boolean }) => {
  return isLoading ? (
    <YStack gap={12} mx={20}>
      {Array.from({ length: 4 }).map((_, idx) => (
        <View key={`shelter-card-skeleton-${idx}`} height={80}>
          <Skeleton style={{ width: '100%', height: '100%', borderRadius: 12 }} />
        </View>
      ))}
    </YStack>
  ) : (
    <NodataContainer mx={20} py={42}>
      <Text fontSize={15} lineHeight={17} fontWeight="500" color="$black500">
        가까운 곳에 보호소가 없어요
      </Text>
    </NodataContainer>
  );
};

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});

const NodataContainer = styled(View, {
  items: 'center',
  justify: 'center',
  borderColor: '$white800',
  borderWidth: 1,
  rounded: 12
});
