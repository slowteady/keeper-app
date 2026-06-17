import { NaverMapViewRef } from '@mj-studio/react-native-naver-map';
import { LocateFixed } from '@tamagui/lucide-icons';
import { useLocalSearchParams } from 'expo-router';
import { Suspense, useCallback, useRef } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { styled, useTheme, View } from 'tamagui';

import { ShelterMap } from '@/entities/shelter';
import { useShelter } from '@/features/shelter';
import { useLocation } from '@/shared/model';
import { DetailErrorBoundary, SuspenseFallback } from '@/shared/ui';

export const ErrorBoundary = DetailErrorBoundary;

const Page = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  if (!id) return null;

  return (
    <Container>
      <Suspense fallback={<SuspenseFallback />}>
        <ShelterMapContent id={id} />
      </Suspense>
    </Container>
  );
};

export default Page;

const ShelterMapContent = ({ id }: { id: string }) => {
  const { shelterData } = useShelter({ id });
  const { isGranted } = useLocation();
  const { white900 } = useTheme();
  const mapRef = useRef<NaverMapViewRef>(null);

  const handleInitialized = useCallback(() => {
    if (!shelterData) return;
    if (isGranted) mapRef.current?.setLocationTrackingMode('NoFollow');
    mapRef.current?.animateCameraTo({ latitude: shelterData.latitude, longitude: shelterData.longitude });
  }, [shelterData, isGranted]);

  const handleRecenter = useCallback(() => {
    mapRef.current?.setLocationTrackingMode('Follow');
  }, []);

  if (!shelterData) return null;

  return (
    <View flex={1}>
      <ShelterMap
        ref={mapRef}
        hasLocation
        data={[shelterData]}
        camera={{ latitude: shelterData.latitude, longitude: shelterData.longitude, zoom: 16 }}
        selectedMarkerId={shelterData.id}
        onRefetch={() => {}}
        onInitialized={handleInitialized}
        enableRefetch={false}
        fill
      />
      {isGranted && (
        <Pressable
          style={[styles.locateButton, { backgroundColor: white900.val }]}
          onPress={handleRecenter}
          accessibilityLabel="내 위치로"
        >
          <LocateFixed size={22} color="$black700" />
        </Pressable>
      )}
    </View>
  );
};

const Container = styled(View, {
  flex: 1,
  bg: '$pageBackground'
});

const styles = StyleSheet.create({
  locateButton: {
    position: 'absolute',
    right: 16,
    bottom: 32,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 4
  }
});
