import { NaverMapMarkerOverlay, NaverMapView, NaverMapViewRef } from '@mj-studio/react-native-naver-map';
import { LocateFixed } from '@tamagui/lucide-icons';
import { useLocalSearchParams } from 'expo-router';
import { Suspense, useCallback, useRef } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useTheme, View } from 'tamagui';

import { useMissingDetail } from '@/features/missing';
import { useLocation } from '@/shared/model';
import { DetailErrorBoundary, SuspenseFallback } from '@/shared/ui';

export const ErrorBoundary = DetailErrorBoundary;

const Page = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  if (!id) return null;

  return (
    <View flex={1}>
      <Suspense fallback={<SuspenseFallback />}>
        <MissingMapContent id={id} />
      </Suspense>
    </View>
  );
};

export default Page;

const MissingMapContent = ({ id }: { id: string }) => {
  const { missing } = useMissingDetail(id);
  const { isGranted } = useLocation();
  const { white900 } = useTheme();
  const mapRef = useRef<NaverMapViewRef>(null);

  const handleRecenter = useCallback(() => {
    mapRef.current?.animateCameraTo({ latitude: missing.lat, longitude: missing.lng, zoom: 16 });
  }, [missing.lat, missing.lng]);

  return (
    <View flex={1}>
      <NaverMapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialCamera={{ latitude: missing.lat, longitude: missing.lng, zoom: 16 }}
        isShowLocationButton={false}
      >
        <NaverMapMarkerOverlay
          latitude={missing.lat}
          longitude={missing.lng}
          width={28}
          height={32}
          anchor={{ x: 0.5, y: 1 }}
        />
      </NaverMapView>

      {isGranted && (
        <Pressable
          style={[styles.locateButton, { backgroundColor: white900.val }]}
          onPress={handleRecenter}
          accessibilityLabel="실종 장소로"
        >
          <LocateFixed size={22} color="$black700" />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  locateButton: {
    position: 'absolute',
    right: 16,
    bottom: 32,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3
  }
});
