import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Camera, NaverMapViewRef } from '@mj-studio/react-native-naver-map';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Dimensions, FlatList, ListRenderItemInfo, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/shared/components/atoms/Button';
import { ScrollFloatingButton } from '@/shared/components/atoms/ScrollFloatingButton';
import { Searchbar } from '@/shared/components/molecules/Searchbar';
import { Skeleton } from '@/shared/components/molecules/Skeleton';
import { LocationBottomSheet } from '@/shared/components/organisms/LocationBottomSheet';
import { ShelterCard } from '@/shared/components/organisms/ShelterCard';
import { ShelterMap } from '@/shared/components/organisms/ShelterMap';
import { theme } from '@/shared/constants/theme.constants';
import { useScrollFloatingButton } from '@/shared/hooks/useScrollFloatingButton';
import { CameraParams, KakaoAddressDocument } from '@/shared/types/map.types';

import { useKakaoGeocodeMutation } from '../../queries/geocode.queries';
import { ShelterCountDto, ShelterDto, ShelterSearchParams } from '../../types/shelter.types';

interface SheltersTemplateProps {
  data: SheltersTemplateData;
  isLoading: boolean;
  onRefetch: (params: CameraParams) => void;
  permissionStatus: Location.LocationPermissionResponse | null;
  onInitMap: () => void;
  onSubmitSearch: () => void;
  camera?: Camera;
}
interface SheltersTemplateData {
  sheltersData?: ShelterDto[];
  shelterCountData?: ShelterCountDto[];
}
const PADDING_HORIZONTAL = 20;
const SheltersTemplate = forwardRef<NaverMapViewRef, SheltersTemplateProps>((props, ref) => {
  const { data, isLoading, camera, permissionStatus, onSubmitSearch, onRefetch, onInitMap } = props;
  const [addresses, setAddresses] = useState<KakaoAddressDocument[]>();
  const [shelterValues, setShelterValues] = useState<ShelterDto[]>([]);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => [400], []);
  const { isButtonVisible, handlePress, handleScroll, flatListRef } = useScrollFloatingButton();
  const { mutateAsync: geocodeMutate, isPending } = useKakaoGeocodeMutation();

  useEffect(() => {
    if (data.sheltersData) {
      setShelterValues(data.sheltersData);
    }
  }, [data.sheltersData]);

  const handlePressCard = useCallback((id: number) => {
    router.push({ pathname: '/shelter/[id]', params: { id } });
  }, []);
  const handlePressLocation = () => {
    bottomSheetModalRef.current?.present();
  };
  const handleAnimate = useCallback((fromIndex: number, toIndex: number) => {
    if (toIndex === -1) {
      bottomSheetModalRef.current?.dismiss();
      setAddresses(undefined);
    }
  }, []);
  const handleSubmitGeocode = async (value: string) => {
    try {
      const { data } = await geocodeMutate({ query: value });
      const { documents } = data;
      setAddresses(documents);
    } catch {}
  };
  const handlePressAddress = useCallback(
    (item: KakaoAddressDocument) => {
      if (ref && 'current' in ref && ref.current) {
        const { x, y } = item;
        ref.current.animateCameraTo({ longitude: Number(x), latitude: Number(y) });
      }
      bottomSheetModalRef.current?.dismiss();
      setAddresses(undefined);
    },
    [ref]
  );
  const handleShelterValues = (data: ShelterDto) => {
    setShelterValues((prev) => [data, ...prev]);
  };

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ShelterDto>) => {
      return <ShelterCard onPress={handlePressCard} data={item} />;
    },
    [handlePressCard]
  );

  return (
    <>
      <FlatList
        data={shelterValues}
        renderItem={renderItem}
        ListHeaderComponent={
          <MapSection
            data={data}
            camera={camera}
            onInitMap={onInitMap}
            onChange={handleShelterValues}
            onPressLocation={handlePressLocation}
            permissionStatus={permissionStatus}
            onRefetch={onRefetch}
            onSubmitSearch={onSubmitSearch}
            ref={ref}
          />
        }
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
        ListEmptyComponent={
          isLoading ? (
            <View style={{ gap: 12 }}>
              {Array.from({ length: 4 }).map((_, idx) => (
                <View key={idx} style={styles.skeletonContainer}>
                  <Skeleton style={styles.skeleton} />
                </View>
              ))}
            </View>
          ) : (
            <NoData />
          )
        }
      />
      <ScrollFloatingButton visible={isButtonVisible} onPress={handlePress} />
      <LocationBottomSheet
        addresses={addresses}
        snapPoints={snapPoints}
        onAnimate={handleAnimate}
        ref={bottomSheetModalRef}
        onSubmit={handleSubmitGeocode}
        onPressAddress={handlePressAddress}
        isPending={isPending}
      />
    </>
  );
});

export default SheltersTemplate;

interface MapSectionProps {
  data: SheltersTemplateData;
  permissionStatus: Location.LocationPermissionResponse | null;
  onInitMap: () => void;
  onChange: (data: ShelterDto) => void;
  onRefetch: (params: CameraParams) => void;
  onPressLocation: () => void;
  onSubmitSearch: () => void;
  camera?: Camera;
}
const MapSection = forwardRef<NaverMapViewRef, MapSectionProps>((props, ref) => {
  const { handleSubmit, setValue } = useFormContext<ShelterSearchParams>();
  const {
    data,
    camera,
    permissionStatus = null,
    onInitMap,
    onRefetch,
    onChange,
    onPressLocation,
    onSubmitSearch
  } = props;
  const [selectedMarkerId, setSelectedMarkerId] = useState<number>();

  const handleRefetch = useCallback(
    (params?: CameraParams) => {
      if (!params) return null;
      setSelectedMarkerId(undefined);
      onRefetch(params);
    },
    [onRefetch]
  );
  const handleTapMarker = (data: ShelterDto) => {
    setSelectedMarkerId(data.id);
    onChange(data);
  };
  const handleSubmitSearch = useCallback(
    (text: string) => {
      setValue('search', text);
      handleSubmit(onSubmitSearch)();
    },
    [handleSubmit, onSubmitSearch, setValue]
  );

  if (permissionStatus === null) return null;

  const hasLocationStatus = permissionStatus?.status === Location.PermissionStatus.GRANTED;

  return (
    <>
      <View style={styles.titleWrap}>
        <Text style={styles.title}>보호소 찾기</Text>
        <Button style={styles.button} onPress={onPressLocation}>
          <Text style={styles.buttonText}>위치설정</Text>
        </Button>
      </View>
      <Searchbar
        onSubmit={handleSubmitSearch}
        placeholder="보호소명 또는 주소로 검색해주세요."
        ViewStyle={{ marginBottom: 24 }}
      />

      <ShelterMap.DistanceBox
        hasLocationStatus={hasLocationStatus}
        value={data.shelterCountData}
        style={{ marginBottom: 16 }}
      />
      <ShelterMap
        ref={ref}
        hasLocation={hasLocationStatus}
        data={data.sheltersData}
        camera={camera}
        onRefetch={handleRefetch}
        onInitialized={onInitMap}
        onTapMarker={handleTapMarker}
        selectedMarkerId={selectedMarkerId}
        isShowCompass={false}
        minZoom={10}
      />
    </>
  );
});

const NoData = () => {
  return (
    <View style={styles.noDataContainer}>
      <Text style={styles.noDataText}>가까운 곳에 보호소가 없습니다.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: PADDING_HORIZONTAL,
    flex: 1,
    paddingVertical: 40
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
  },
  noDataContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: Dimensions.get('screen').width - 40,
    backgroundColor: theme.colors.white[900],
    borderRadius: 8,
    height: 80
  },
  noDataText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 16,
    color: theme.colors.black[500]
  },
  noDataButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: theme.colors.black[600]
  },
  noDataButtonText: {
    fontSize: 13,
    lineHeight: 15,
    fontWeight: '600',
    color: theme.colors.black[700]
  },
  skeletonContainer: {
    height: 80
  },
  skeleton: {
    width: '100%',
    height: '100%',
    borderRadius: 4
  }
});

SheltersTemplate.displayName = 'SheltersTemplate';
MapSection.displayName = 'MapSection';
