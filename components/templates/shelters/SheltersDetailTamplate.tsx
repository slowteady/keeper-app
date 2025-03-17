import {
  TransformedShelterAbandonmentsValue,
  transformShelterAbandonmentsData,
  transformShelterData
} from '@/business/sheltersBusiness';
import { TelIcon } from '@/components/atoms/icons/TelIcon';
import { TimeIcon } from '@/components/atoms/icons/TimeIcon';
import { ShelterMap } from '@/components/organisms/map/ShelterMap';
import theme from '@/constants/theme';
import { useMapInit } from '@/hooks/useMapInit';
import { AbandonmentData } from '@/types/scheme/abandonments';
import { ShelterValue } from '@/types/scheme/shelters';
import { NaverMapView } from '@mj-studio/react-native-naver-map';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { Dimensions, FlatList, ListRenderItemInfo, StyleSheet, Text, View } from 'react-native';

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
const SheltersDetailTamplate = ({
  shelterData,
  abandonmentsData,
  isLoading,
  onFetch,
  refreshControl
}: SheltersDetailTemplateProps) => {
  const data = transformShelterAbandonmentsData(shelterData, abandonmentsData?.value);

  const renderItem = useCallback((item: ListRenderItemInfo<TransformedShelterAbandonmentsValue[number]>) => {
    return <></>;
  }, []);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      style={styles.container}
      ListHeaderComponent={<MapSection shelterData={shelterData} />}
    />
  );
};

export default SheltersDetailTamplate;

interface MapSectionProps {
  shelterData: ShelterValue;
}
const MapSection = ({ shelterData }: MapSectionProps) => {
  const [enabledMap, setEnabledMap] = useState(false);
  const { name } = shelterData;
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
            <TimeIcon width={24} height={24} />
            <Text style={styles.descriptionText}>{time}</Text>
          </View>
        )}
        {data.tel && (
          <View style={styles.flexWrap}>
            <TelIcon width={24} height={24} />
            <Text style={styles.descriptionText}>{data.tel}</Text>
          </View>
        )}
        {person && (
          <View style={styles.flexWrap}>
            <TimeIcon width={24} height={24} />
            <Text style={styles.descriptionText}>{person}</Text>
          </View>
        )}
        {address && (
          <View style={styles.flexWrap}>
            <TimeIcon width={24} height={24} />
            <Text style={styles.descriptionText}>{address}</Text>
          </View>
        )}
      </View>
      <View style={styles.shelterDivider} />
    </View>
  );
};

const PADDING_HORIZONTAL = 20;
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
    height: Dimensions.get('screen').width * 1.2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    marginHorizontal: PADDING_HORIZONTAL
  },
  mapInnerContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    marginHorizontal: PADDING_HORIZONTAL
  },
  shelterTitleText: {
    fontSize: 17,
    lineHeight: 19,
    fontWeight: '600',
    color: theme.colors.black[800],
    marginBottom: 19
  },
  shelterDescriptionContainer: {
    paddingHorizontal: PADDING_HORIZONTAL
  },
  shelterDivider: {
    height: 1,
    backgroundColor: theme.colors.white[800]
  },
  divider: {
    height: 8,
    backgroundColor: theme.colors.white[800]
  },
  shelterDescriptionWrap: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 10
  },
  flexWrap: {
    display: 'flex',
    flexDirection: 'row'
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 24,
    fontWeight: '400',
    color: theme.colors.black[700],
    marginLeft: 20
  }
});
