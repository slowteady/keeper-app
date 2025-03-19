import { transformAbandonments, TransformedAbandonments } from '@/business/abandonmentsBusiness';
import { transformShelterData } from '@/business/sheltersBusiness';
import ScrollFloatingButton from '@/components/atoms/button/ScrollFloatingButton';
import { CandyIcon } from '@/components/atoms/icons/CandyIcon';
import { StethoscopeIcon } from '@/components/atoms/icons/StethoscopeIcon';
import { TelIcon } from '@/components/atoms/icons/TelIcon';
import { TimeIcon } from '@/components/atoms/icons/TimeIcon';
import Dropdown from '@/components/molecules/dropdown/Dropdown';
import { BottomSheetMenuData } from '@/components/organisms/bottomSheet/BottomSheet';
import { AnimalCard } from '@/components/organisms/card/AnimalCard';
import { ShelterMap } from '@/components/organisms/map/ShelterMap';
import ShelterTelModal from '@/components/organisms/modal/ShelterTelModal';
import { ABANDONMENTS_FILTERS } from '@/constants/config';
import theme from '@/constants/theme';
import { useLayout } from '@/hooks/useLayout';
import { useMapInit } from '@/hooks/useMapInit';
import useScrollFloatingButton from '@/hooks/useScrollFloatingButton';
import { abandonmentsAtom, abandonmentsFilterValueAtom } from '@/states/abandonments';
import { AbandonmentsFilter } from '@/types/abandonments';
import { AbandonmentData } from '@/types/scheme/abandonments';
import { ShelterValue } from '@/types/scheme/shelters';
import { NaverMapView } from '@mj-studio/react-native-naver-map';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface SheltersDetailTemplateProps {
  shelterData: ShelterValue;
  abandonmentsData?: AbandonmentData;
  isLoading: ShelterDetailTemplateLoading;
  onFetch: () => void;
  refreshControl: React.ReactElement;
}
interface ShelterDetailTemplateLoading {
  shelter: boolean;
  abandonments: boolean;
}
const PADDING_HORIZONTAL = 20;
const IMAGE_WIDTH = Dimensions.get('screen').width / 2 - PADDING_HORIZONTAL;
const IMAGE_HEIGHT = IMAGE_WIDTH * 0.9;
const SheltersDetailTamplate = ({
  shelterData,
  abandonmentsData,
  isLoading,
  onFetch,
  refreshControl
}: SheltersDetailTemplateProps) => {
  const filterValue = useAtomValue(abandonmentsFilterValueAtom);
  const { bottom } = useLayout();
  const { isButtonVisible, handlePress, handleScroll, flatListRef } = useScrollFloatingButton();

  const handlePressCard = useCallback((id: number) => {
    router.push({ pathname: '/abandonments/[id]', params: { id } });
  }, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<TransformedAbandonments>) => {
      return (
        <Pressable onPress={() => handlePressCard(item.id)}>
          <AnimalCard data={item} width={IMAGE_WIDTH} height={IMAGE_HEIGHT} size="small" />
        </Pressable>
      );
    },
    [handlePressCard]
  );
  const renderListFooter = useCallback(() => {
    const { total, page, has_next } = abandonmentsData || {};
    if (!total || page === undefined || page === null) return;
    const totalPage = Math.ceil(total / 16);

    return (
      <View style={{ paddingBottom: 20 }}>
        {has_next && (
          <MoreButtonSection onFetch={onFetch} page={page + 1} total={totalPage} isLoading={isLoading.abandonments} />
        )}
      </View>
    );
  }, [abandonmentsData, isLoading, onFetch]);

  const transformedAbandonments = transformAbandonments(abandonmentsData?.value || [], filterValue.value);

  return (
    <>
      <FlatList
        data={transformedAbandonments}
        renderItem={renderItem}
        onScroll={handleScroll}
        ref={flatListRef}
        keyExtractor={({ id }, idx) => `${id}-${idx}`}
        style={[styles.container]}
        contentContainerStyle={{ paddingBottom: bottom }}
        columnWrapperStyle={styles.columnWrapper}
        bounces
        scrollEventThrottle={40}
        numColumns={2}
        initialNumToRender={16}
        ListHeaderComponent={
          <>
            <MapSection shelterData={shelterData} />
            <View style={styles.divider} />
            <AbandonmentsFilterSection number={abandonmentsData?.total} />
          </>
        }
        ListEmptyComponent={<View style={{ paddingVertical: 100 }}></View>}
        ListFooterComponent={renderListFooter()}
        refreshControl={refreshControl}
      />
      <ScrollFloatingButton visible={isButtonVisible} onPress={handlePress} />
    </>
  );
};

export default SheltersDetailTamplate;

interface MapSectionProps {
  shelterData: ShelterValue;
}
const MapSection = ({ shelterData }: MapSectionProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [enabledMap, setEnabledMap] = useState(false);
  const { name, tel } = shelterData;
  const { camera, setCamera, mapRef, permissionStatus } = useMapInit(true);

  useEffect(() => {
    const hasLocationStatus = permissionStatus?.status === Location.PermissionStatus.GRANTED;
    if (hasLocationStatus) {
      const { latitude, longitude } = shelterData;
      mapRef.current?.setLocationTrackingMode('Follow');
      setCamera({ latitude, longitude, zoom: 11 });
    }
  }, [mapRef, permissionStatus?.status, setCamera, shelterData]);

  const handleInitMap = () => {
    setEnabledMap(true);
  };
  const handlePress = () => {
    setModalOpen(true);
  };
  const handleClose = () => {
    setModalOpen(false);
  };

  return (
    <>
      <View style={styles.titleWrap}>
        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
          {name}
        </Text>
      </View>
      <View style={styles.mapContainer}>
        <NaverMapView
          camera={camera}
          ref={mapRef}
          onInitialized={handleInitMap}
          isExtentBoundedInKorea
          animationDuration={500}
          style={styles.mapInnerContainer}
        >
          {enabledMap && <ShelterMap.Marker data={shelterData} />}
        </NaverMapView>
      </View>

      <ShelterDescription data={shelterData} />
      <View style={styles.buttonContainer}>
        <Text style={styles.buttonTitleText}>보호소에 문의하기</Text>
        <TouchableOpacity style={styles.button} activeOpacity={0.5} onPress={handlePress}>
          <Text style={styles.buttonText}>{tel}</Text>
        </TouchableOpacity>
      </View>

      <ShelterTelModal open={modalOpen} onClose={handleClose} tel={tel} name={name} />
    </>
  );
};

interface ShelterDescriptionProps {
  data: ShelterValue;
}
const ShelterDescription = ({ data }: ShelterDescriptionProps) => {
  const { time, address, person } = transformShelterData(data);

  return (
    <View style={styles.shelterDescriptionContainer}>
      <Text style={styles.shelterTitleText}>보호소 운영정보</Text>
      <View style={styles.shelterDivider} />
      <View style={styles.shelterDescriptionWrap}>
        {time && (
          <View style={styles.flexWrap}>
            <TimeIcon width={20} height={20} />
            <Text style={styles.descriptionText}>{time}</Text>
          </View>
        )}
        {data.tel && (
          <View style={styles.flexWrap}>
            <TelIcon width={20} height={20} />
            <Text style={styles.descriptionText}>{data.tel}</Text>
          </View>
        )}
        {person && (
          <View style={styles.flexWrap}>
            <StethoscopeIcon width={20} height={20} />
            <Text style={styles.descriptionText}>{person}</Text>
          </View>
        )}
        {address && (
          <View style={styles.flexWrap}>
            <CandyIcon width={20} height={20} />
            <Text style={styles.descriptionText}>{address}</Text>
          </View>
        )}
      </View>
      <View style={styles.shelterDivider} />
    </View>
  );
};

interface AbandonmentsFilterProps {
  number?: number;
}
const AbandonmentsFilterSection = ({ number = 0 }: AbandonmentsFilterProps) => {
  const filterValue = useAtomValue(abandonmentsFilterValueAtom);
  const setFilterValue = useSetAtom(abandonmentsAtom);
  const snapPoints = useMemo(() => [200], []);

  const handleChangeFilter = useCallback(
    ({ value }: BottomSheetMenuData<AbandonmentsFilter>) => {
      setFilterValue((prev) => ({ ...prev, filter: value }));
    },
    [setFilterValue]
  );

  return (
    <View style={styles.filterContainer}>
      <View style={styles.filterWrap}>
        <Text style={styles.filterTitle}>보호중인 아이들</Text>
        <Text style={styles.filterText}>{number}마리</Text>
      </View>
      <Dropdown
        data={ABANDONMENTS_FILTERS}
        value={filterValue.value}
        onChange={handleChangeFilter}
        snapPoints={snapPoints}
      />
    </View>
  );
};

interface MoreButtonSectionProps {
  onFetch: () => void;
  isLoading: boolean;
  page?: number;
  total?: number;
}
const MoreButtonSection = ({ onFetch, isLoading, page, total }: MoreButtonSectionProps) => {
  const text = `더보기 ${page}/${total}`;

  return (
    <View style={styles.moreButtonContainer}>
      <TouchableOpacity style={styles.moreButton} activeOpacity={0.5} onPress={onFetch} disabled={isLoading}>
        {isLoading ? <ActivityIndicator size={16} /> : <Text style={styles.moreButtonText}>{text}</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 40
  },
  title: {
    fontSize: 28,
    lineHeight: 38,
    fontWeight: '500',
    color: theme.colors.black[900]
  },
  titleWrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: PADDING_HORIZONTAL
  },
  mapContainer: {
    borderRadius: 10,
    backgroundColor: '#D9D9D9',
    height: Dimensions.get('screen').width * 1.1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    marginHorizontal: PADDING_HORIZONTAL
  },
  mapInnerContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    marginHorizontal: PADDING_HORIZONTAL
  },
  shelterTitleText: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '600',
    color: theme.colors.black[800],
    marginBottom: 24
  },
  shelterDescriptionContainer: {
    paddingHorizontal: PADDING_HORIZONTAL
  },
  shelterDivider: {
    height: 1,
    backgroundColor: theme.colors.black[500]
  },
  divider: {
    height: 8,
    backgroundColor: theme.colors.white[800]
  },
  shelterDescriptionWrap: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 10
  },
  flexWrap: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  descriptionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 24,
    fontWeight: '400',
    color: theme.colors.black[700],
    marginLeft: 20
  },
  buttonContainer: {
    marginTop: 32,
    marginBottom: 48,
    paddingHorizontal: PADDING_HORIZONTAL
  },
  buttonTitleText: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 19,
    color: theme.colors.black[800],
    marginBottom: 20
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: theme.colors.primary.main,
    borderRadius: 10
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 17,
    color: theme.colors.black[900]
  },
  filterContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PADDING_HORIZONTAL,
    marginTop: 56,
    marginBottom: 24
  },
  filterWrap: {
    display: 'flex',
    flexDirection: 'row',
    gap: 6
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 22,
    color: theme.colors.black[800]
  },
  filterText: {
    fontSize: 15,
    lineHeight: 17,
    fontWeight: '400',
    color: theme.colors.black[500],
    alignSelf: 'flex-end'
  },
  columnWrapper: {
    gap: 8,
    justifyContent: 'space-between',
    marginBottom: 40,
    paddingHorizontal: PADDING_HORIZONTAL
  },
  moreButtonContainer: {
    display: 'flex',
    paddingBottom: 30,
    marginBottom: 20,
    alignSelf: 'center'
  },
  moreButton: {
    backgroundColor: theme.colors.black[800],
    borderRadius: 50,
    paddingHorizontal: 28,
    paddingVertical: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'baseline',
    minWidth: 125
  },
  moreButtonText: {
    color: theme.colors.white[900],
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 15
  }
});
