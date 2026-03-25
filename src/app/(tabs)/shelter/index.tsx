import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { styled, Text, View, YStack } from 'tamagui';

import { ShelterCard, ShelterDto, useShelterMap } from '@/entities/shelter';
import { KakaoAddressDocumentDto, LocationBottomSheet, useLocationBottomSheet } from '@/features/address';
import { useScrollUpButton } from '@/shared/model';
import { ScrollUpButton, Skeleton } from '@/shared/ui';
import { ShelterListHeaderSection, ShelterMapSection } from '@/widgets/shelter-section';

const Page = () => {
  const {
    shelters,
    shelterCounts,
    mapRef,
    camera,
    selectedMarkerId,
    shelterList,
    toggleMapEnabled,
    refetchShelterList,
    toggleTapMarker,
    changeLocation,
    searchLocation,
    hasLocationStatus,
    isLoading,
    isSearchPending
  } = useShelterMap();
  const { isButtonVisible, handlePressButton, handleScroll, scrollRef } = useScrollUpButton();
  const locationBottomSheet = useLocationBottomSheet((item: KakaoAddressDocumentDto) => {
    changeLocation(item);
    locationBottomSheet.actions.dismiss();
  });

  const renderItem = useCallback(({ item }: ListRenderItemInfo<ShelterDto>) => {
    return (
      <View px={20}>
        <ShelterCard onPress={() => router.push({ pathname: '/shelter/[id]', params: { id: item.id } })} data={item} />
      </View>
    );
  }, []);

  return (
    <Container>
      <FlashList
        ref={scrollRef}
        keyExtractor={({ id }, i) => `${id}-${i}`}
        decelerationRate="fast"
        data={shelterList}
        renderItem={renderItem}
        onScroll={handleScroll}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View px={20} mb={20}>
            <View mb={16}>
              <ShelterListHeaderSection
                onSearch={searchLocation}
                onPressLocation={locationBottomSheet.actions.openBottomSheet}
              />
            </View>

            <ShelterMapSection
              ref={mapRef}
              hasLocationStatus={hasLocationStatus}
              data={shelters}
              counts={shelterCounts}
              camera={camera}
              onRefetch={refetchShelterList}
              onTapMarker={toggleTapMarker}
              onInitialized={toggleMapEnabled}
              selectedMarkerId={selectedMarkerId}
            />
          </View>
        }
        ItemSeparatorComponent={() => <View height={10} />}
        ListEmptyComponent={<EmptyComponent isLoading={isLoading || isSearchPending} />}
        contentContainerStyle={{ paddingVertical: 32 }}
      />

      <LocationBottomSheet
        ref={locationBottomSheet.refs.ref}
        addresses={locationBottomSheet.state.searchedAddresses}
        onDismiss={locationBottomSheet.actions.dismiss}
        onSearch={locationBottomSheet.actions.submitGeocode}
        onSelectAddress={locationBottomSheet.actions.getAddress}
        isPending={locationBottomSheet.flags.isPending}
      />

      <ScrollUpButton visible={isButtonVisible} onPress={handlePressButton} />
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
        가까운 곳에 보호소가 없어요.
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
