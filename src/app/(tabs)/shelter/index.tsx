import { LocateFixed } from '@tamagui/lucide-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styled, View } from 'tamagui';

import { DistancePermissionPrompt, ShelterCard, ShelterClusterMap, ShelterDto } from '@/entities/shelter';
import { useFavoriteShelter } from '@/features/favorite-shelter';
import { ShelterSearchBar, useShelterViewport } from '@/features/shelter';
import { RouteErrorBoundary } from '@/shared/ui';
import { ShelterBottomSheet } from '@/widgets/shelter-section';

export const ErrorBoundary = RouteErrorBoundary;

const SHEET_PEEK_RATIO = 0.12;
const SEARCH_BAR_AREA = 72;
const CONTROL_HIDE_THRESHOLD = 0.15;

const Page = () => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const peekHeight = height * SHEET_PEEK_RATIO;
  const topInset = insets.top + SEARCH_BAR_AREA;

  const {
    clusters,
    shelters,
    selectedShelter,
    mapRef,
    camera,
    userLocation,
    selectedShelterId,
    isGranted,
    isLoading,
    onMapInitialized,
    onCameraChange,
    onTapMarker,
    onTapCluster,
    onDeselect,
    selectShelter,
    moveToCurrentLocation,
    isViewport
  } = useShelterViewport({
    visibleTop: topInset,
    visibleBottom: peekHeight,
    screenWidth: width,
    screenHeight: height
  });
  const { toggleFavoriteShelter } = useFavoriteShelter();

  const animatedIndex = useSharedValue(0);
  const [controlsActive, setControlsActive] = useState(true);
  useAnimatedReaction(
    () => animatedIndex.value < CONTROL_HIDE_THRESHOLD,
    (active, prev) => {
      if (active !== prev) runOnJS(setControlsActive)(active);
    }
  );
  const controlsFade = useDerivedValue(() => interpolate(animatedIndex.value, [0, 0.25], [1, 0], Extrapolation.CLAMP));
  const fabStyle = useAnimatedStyle(() => ({ opacity: controlsFade.value }));

  const cardPresence = useSharedValue(0);
  const [displayShelter, setDisplayShelter] = useState<ShelterDto | undefined>(undefined);
  useEffect(() => {
    if (selectedShelter) {
      setDisplayShelter(selectedShelter);
      cardPresence.value = withTiming(1, { duration: 220 });
    } else {
      cardPresence.value = withTiming(0, { duration: 220 }, (finished) => {
        if (finished) runOnJS(setDisplayShelter)(undefined);
      });
    }
  }, [selectedShelter, cardPresence]);
  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardPresence.value * controlsFade.value
  }));

  const handlePressCard = useCallback(
    (id: string) => {
      selectShelter(id);
      router.push({ pathname: '/shelter/[id]', params: { id } });
    },
    [selectShelter]
  );

  if (!isGranted) {
    return (
      <Container items="center" justify="center" px={32}>
        <DistancePermissionPrompt variant="fullscreen" />
      </Container>
    );
  }

  return (
    <Container>
      <ShelterClusterMap
        ref={mapRef}
        hasLocation={isGranted}
        userLocation={userLocation}
        clusters={clusters}
        selectedMarkerId={selectedShelterId}
        camera={camera}
        bottomPadding={peekHeight}
        onCameraChange={onCameraChange}
        onTapMarker={onTapMarker}
        onTapCluster={onTapCluster}
        onTapMap={onDeselect}
        onInitialized={onMapInitialized}
        isShowCompass={false}
        isShowZoomControls={controlsActive}
      />

      <View style={{ position: 'absolute', top: insets.top + 12, left: 20, right: 20, zIndex: 10 }}>
        <ShelterSearchBar onPress={() => router.push('/shelter/search')} />
      </View>

      <Animated.View
        pointerEvents={controlsActive ? 'auto' : 'none'}
        style={[{ position: 'absolute', right: 20, bottom: peekHeight + 16, zIndex: 10 }, fabStyle]}
      >
        <LocationFab onPress={moveToCurrentLocation}>
          <LocateFixed size={24} color="$black700" />
        </LocationFab>
      </Animated.View>

      {displayShelter && (
        <Animated.View
          pointerEvents={controlsActive ? 'auto' : 'none'}
          style={[
            {
              position: 'absolute',
              left: 20,
              right: 20,
              bottom: peekHeight + 16,
              zIndex: 11,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 4
            },
            cardStyle
          ]}
        >
          <ShelterCard
            data={displayShelter}
            isSelected
            onPress={handlePressCard}
            onPressFavorite={toggleFavoriteShelter}
          />
        </Animated.View>
      )}

      <ShelterBottomSheet
        shelters={shelters}
        selectedShelterId={selectedShelterId}
        isLoading={isLoading}
        isViewport={isViewport}
        animatedIndex={animatedIndex}
        topInset={topInset}
        onPressCard={handlePressCard}
        onPressFavorite={toggleFavoriteShelter}
      />
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  flex: 1,
  bg: '$pageBackground'
});

const LocationFab = styled(View, {
  width: 44,
  height: 44,
  rounded: 999,
  bg: '$white900',
  items: 'center',
  justify: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 6,
  elevationAndroid: 3
});
