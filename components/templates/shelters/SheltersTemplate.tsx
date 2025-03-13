import ScrollFloatingButton from '@/components/atoms/button/ScrollFloatingButton';
import Searchbar from '@/components/molecules/input/Searchbar';
import LocationBottomSheet from '@/components/organisms/bottomSheet/LocationBottomSheet';
import ShelterCard from '@/components/organisms/card/ShelterCard';
import { ShelterMap } from '@/components/organisms/map/ShelterMap';
import theme from '@/constants/theme';
import { useGetShelterCountQuery, useGetSheltersQuery } from '@/hooks/queries/useShelters';
import { useMapInit } from '@/hooks/useMapInit';
import useScrollFloatingButton from '@/hooks/useScrollFloatingButton';
import { CameraParams } from '@/types/map';
import { ShelterValue } from '@/types/scheme/shelters';
import { calcMapRadiusKm } from '@/utils/mapUtils';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, ListRenderItemInfo, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// TODO
// [ ] geocode 데이터 패칭 통해 데이터 받아서 리스트 출력
const PADDING_HORIZONTAL = 20;
const SheltersTemplate = () => {
  const [shelterValues, setShelterValues] = useState<ShelterValue[]>([]);
  const { isButtonVisible, handlePress, handleScroll, flatListRef } = useScrollFloatingButton();

  const handlePressCard = useCallback((id: number) => {
    router.push({ pathname: '/shelters/[id]', params: { id } });
  }, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ShelterValue>) => {
      return <ShelterCard onPress={handlePressCard} data={item} />;
    },
    [handlePressCard]
  );

  return (
    <>
      <FlatList
        data={shelterValues}
        renderItem={renderItem}
        ListHeaderComponent={<MapSection shelterValues={shelterValues} onChange={setShelterValues} />}
        onScroll={handleScroll}
        ref={flatListRef}
        decelerationRate="fast"
        bounces
        initialNumToRender={8}
        keyExtractor={({ id }, idx) => `${id}-${idx}`}
        scrollEventThrottle={40}
        showsVerticalScrollIndicator={false}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      />
      <ScrollFloatingButton visible={isButtonVisible} onPress={handlePress} />
    </>
  );
};

export default SheltersTemplate;

interface MapSectionProps {
  shelterValues: ShelterValue[];
  onChange: (data: ShelterValue[]) => void;
}
const MapSection = ({ shelterValues, onChange }: MapSectionProps) => {
  const [enabled, setEnabled] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState<number>();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => [400], []);

  const { camera, setCamera, distance, setDistance, initialLocation, mapRef, permissionStatus } = useMapInit();
  // const { mutate, isPending } = useGeocodeMutation();

  const { data: sheltersData } = useGetSheltersQuery(
    {
      latitude: camera?.latitude || 0,
      longitude: camera?.longitude || 0,
      distance,
      userLatitude: initialLocation?.latitude || 0,
      userLongitude: initialLocation?.longitude || 0
    },
    {
      select: ({ data }) => {
        return data.sort((a, b) => a.distance - b.distance);
      },
      enabled: !!camera && enabled,
      staleTime: 1000 * 60 * 60
    }
  );
  const { data: shelterCountData } = useGetShelterCountQuery({
    latitude: initialLocation?.latitude || 0,
    longitude: initialLocation?.longitude || 0
  });

  useEffect(() => {
    if (!sheltersData) return;
    onChange(sheltersData);
  }, [onChange, sheltersData]);

  const handleInitMap = () => {
    setEnabled(true);
  };
  const handleRefetch = (params?: CameraParams) => {
    if (!params) return null;

    const { latitude, longitude, zoom, region } = params;
    setCamera({ latitude, longitude, zoom });
    setSelectedMarkerId(undefined);

    const radius = calcMapRadiusKm({ ...region, latitude, longitude });
    setDistance(radius);
  };
  const handleTapMarker = (data: ShelterValue) => {
    setSelectedMarkerId(data.id);
    onChange([data, ...shelterValues]);
    // setShelterData((prev) => [data, ...prev.filter((item) => item.id !== data.id)]);
  };
  const handlePress = () => {
    bottomSheetModalRef.current?.present();
  };
  const handleAnimate = (fromIndex: number, toIndex: number) => {
    if (toIndex === 0) bottomSheetModalRef.current?.dismiss();
  };

  const hasLocationStatus = permissionStatus?.status === Location.PermissionStatus.GRANTED;
  const hasData = sheltersData !== undefined && sheltersData.length > 0;

  return (
    <>
      <View style={styles.titleWrap}>
        <Text style={styles.title}>보호소 찾기</Text>
        <TouchableOpacity activeOpacity={0.8} style={styles.button} onPress={handlePress}>
          <Text style={styles.buttonText}>위치설정</Text>
        </TouchableOpacity>
      </View>
      <Searchbar onSubmit={() => null} ViewStyle={{ marginBottom: 24 }} />

      <ShelterMap.DistanceBox
        hasLocationStatus={hasLocationStatus}
        value={shelterCountData}
        style={{ marginBottom: 16 }}
      />
      <ShelterMap
        ref={mapRef}
        hasLocation={hasLocationStatus}
        data={shelterValues}
        camera={camera}
        onRefetch={handleRefetch}
        onInitialized={handleInitMap}
        onTapMarker={handleTapMarker}
        selectedMarkerId={selectedMarkerId}
        isShowCompass={false}
        minZoom={10}
      />

      <LocationBottomSheet
        snapPoints={snapPoints}
        onAnimate={handleAnimate}
        ref={bottomSheetModalRef}
        onSubmit={() => null}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: PADDING_HORIZONTAL,
    flex: 1,
    paddingVertical: 48
  },
  contentContainer: {
    gap: 12,
    paddingBottom: 100
  },
  titleWrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '500',
    color: theme.colors.black[900]
  },
  button: {
    borderRadius: 50,
    borderWidth: 1,
    borderColor: theme.colors.black[500],
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  buttonText: {
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '400',
    color: theme.colors.black[600]
  }
});
