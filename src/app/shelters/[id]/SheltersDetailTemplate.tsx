import { transformAbandonments, TransformedAbandonments } from '@/business/abandonmentsBusiness';
import { transformShelterData } from '@/business/sheltersBusiness';
import Button from '@/components/atoms/button/Button';
import ScrollFloatingButton from '@/components/atoms/button/ScrollFloatingButton';
import Dropdown from '@/components/molecules/dropdown/Dropdown';
import { CardSkeleton } from '@/components/molecules/placeholder/CardSkeleton';
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
import { Image } from 'expo-image';
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
const CARD_GAP = 8;
const IMAGE_WIDTH = (Dimensions.get('screen').width - 2 * PADDING_HORIZONTAL - CARD_GAP) / 2;
const SheltersDetailTemplate = ({
  shelterData,
  abandonmentsData,
  isLoading,
  onFetch,
  refreshControl
}: SheltersDetailTemplateProps) => {
  const filterValue = useAtomValue(abandonmentsFilterValueAtom);
  const { bottom } = useLayout();
  const { isButtonVisible, handlePress, handleScroll, flatListRef } = useScrollFloatingButton();

  const handlePressCard = useCallback((id: string) => {
    router.push({ pathname: '/abandonments/[id]', params: { id } });
  }, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<TransformedAbandonments>) => {
      return (
        <Pressable onPress={() => handlePressCard(item.id)}>
          <AnimalCard
            data={item}
            width={IMAGE_WIDTH}
            size="small"
            style={{ backgroundColor: theme.colors.white[900] }}
          />
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
        refreshControl={refreshControl}
        ListHeaderComponent={
          <>
            <MapSection shelterData={shelterData} />
            <View style={styles.divider} />
            <AbandonmentsFilterSection number={abandonmentsData?.total} />
          </>
        }
        ListFooterComponent={renderListFooter()}
        ListEmptyComponent={
          isLoading.abandonments ? (
            <>
              {Array.from({ length: 2 }).map((_, idx) => (
                <View key={idx} style={styles.skeltonContainer}>
                  <CardSkeleton width={IMAGE_WIDTH} />
                  <CardSkeleton width={IMAGE_WIDTH} />
                </View>
              ))}
            </>
          ) : (
            <Nodata />
          )
        }
      />
      <ScrollFloatingButton visible={isButtonVisible} onPress={handlePress} />
    </>
  );
};

export default SheltersDetailTemplate;

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
    if (hasLocationStatus && enabledMap) {
      const { latitude, longitude } = shelterData;
      mapRef.current?.setLocationTrackingMode('Follow');
      setCamera({ latitude, longitude, zoom: 10 });
    }
  }, [enabledMap, mapRef, permissionStatus?.status, setCamera, shelterData]);

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
        <Button style={styles.button} onPress={handlePress}>
          <Text style={styles.buttonText}>보호소에 문의하기</Text>
        </Button>
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
            <Image
              source={require('@/assets/images/clock.png')}
              contentFit="contain"
              style={{ width: 20, height: 20 }}
            />
            <Text style={styles.descriptionText}>{time}</Text>
          </View>
        )}
        {data.tel && (
          <View style={styles.flexWrap}>
            <Image
              source={require('@/assets/images/phone.png')}
              contentFit="contain"
              style={{ width: 20, height: 20 }}
            />
            <Text style={styles.descriptionText}>{data.tel}</Text>
          </View>
        )}
        {person && (
          <View style={styles.flexWrap}>
            <Image
              source={require('@/assets/images/stethoscope.png')}
              contentFit="contain"
              style={{ width: 20, height: 20 }}
            />
            <Text style={styles.descriptionText}>{person}</Text>
          </View>
        )}
        {address && (
          <View style={styles.flexWrap}>
            <Image
              source={require('@/assets/images/noticebar.png')}
              contentFit="contain"
              style={{ width: 20, height: 20 }}
            />
            <Text style={styles.descriptionText}>{address}</Text>
          </View>
        )}
      </View>
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
      <Button style={styles.moreButton} onPress={onFetch} disabled={isLoading}>
        {isLoading ? <ActivityIndicator size={16} /> : <Text style={styles.moreButtonText}>{text}</Text>}
      </Button>
    </View>
  );
};

const Nodata = () => {
  return (
    <View style={styles.noDataContainer}>
      <Text style={styles.noDataText}>공고가 없습니다.</Text>
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
    paddingTop: 32,
    paddingBottom: 40,
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
  },
  noDataContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 200
  },
  noDataText: {
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 19,
    color: theme.colors.black[500]
  },
  skeltonContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: CARD_GAP,
    marginHorizontal: PADDING_HORIZONTAL
  }
});
