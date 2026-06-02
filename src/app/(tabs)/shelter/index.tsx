import { router } from 'expo-router';
import { useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styled, View } from 'tamagui';

import { ShelterClusterMap } from '@/entities/shelter';
import { KakaoAddressDocumentDto, LocationBottomSheet, useLocationBottomSheet } from '@/features/address';
import { useFavoriteShelter } from '@/features/favorite-shelter';
import { ShelterSearchBar, useShelterViewport } from '@/features/shelter';
import { RouteErrorBoundary } from '@/shared/ui';
import { ShelterBottomSheet } from '@/widgets/shelter-section';

export const ErrorBoundary = RouteErrorBoundary;

const Page = () => {
  const insets = useSafeAreaInsets();
  const {
    shelters,
    mapRef,
    camera,
    selectedShelterId,
    isGranted,
    isLoading,
    onMapInitialized,
    onRefetch,
    onTapMarker,
    selectShelter,
    moveTo
  } = useShelterViewport();
  const { toggleFavoriteShelter } = useFavoriteShelter();

  const {
    ref: locationRef,
    searchedAddresses,
    isPending,
    openBottomSheet,
    submitGeocode,
    getAddress,
    dismiss
  } = useLocationBottomSheet((item: KakaoAddressDocumentDto) => {
    moveTo({ latitude: Number(item.y), longitude: Number(item.x) });
  });

  const handlePressCard = useCallback(
    (id: string) => {
      selectShelter(id);
      router.push({ pathname: '/shelter/[id]', params: { id } });
    },
    [selectShelter]
  );

  return (
    <Container>
      <ShelterClusterMap
        ref={mapRef}
        hasLocation={isGranted}
        data={shelters}
        camera={camera}
        selectedMarkerId={selectedShelterId}
        onRefetch={onRefetch}
        onTapMarker={onTapMarker}
        onInitialized={onMapInitialized}
        isShowCompass={false}
      />

      <View style={{ position: 'absolute', top: insets.top + 12, left: 20, right: 20, zIndex: 10 }}>
        <ShelterSearchBar onPress={openBottomSheet} />
      </View>

      <ShelterBottomSheet
        shelters={shelters}
        selectedShelterId={selectedShelterId}
        isLoading={isLoading}
        onPressCard={handlePressCard}
        onPressFavorite={toggleFavoriteShelter}
      />

      <LocationBottomSheet
        ref={locationRef}
        addresses={searchedAddresses}
        onDismiss={dismiss}
        onSearch={submitGeocode}
        onSelectAddress={getAddress}
        isPending={isPending}
      />
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  flex: 1,
  bg: '$pageBackground'
});
