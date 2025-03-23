import SheltersTemplate from '@/components/templates/shelters/SheltersTemplate';
import { SHELTER_COUNT_QUERY_KEY } from '@/constants/queryKeys';
import theme from '@/constants/theme';
import { useGetShelterCountQuery, useGetShelterSearchMutation, useGetSheltersQuery } from '@/hooks/queries/useShelters';
import { useMapInit } from '@/hooks/useMapInit';
import { GetShelterSearchParams } from '@/services/sheltersService';
import { CameraParams } from '@/types/map';
import { ShelterValue } from '@/types/scheme/shelters';
import { calcMapRadiusKm } from '@/utils/mapUtils';
import { useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

/**
 * 보호소 목록 페이지
 * TODO
 * [ ] 보호소 검색 기능 구현
 */
const Page = () => {
  const methods = useForm<GetShelterSearchParams>({ defaultValues: { search: '' } });
  const [mapEnabled, setMapEnabled] = useState(false);
  const [sheltersData, setSheltersData] = useState<ShelterValue[]>();
  const { camera, setCamera, distance, setDistance, initialLocation, mapRef, permissionStatus } = useMapInit();
  const { name } = useRoute();

  const { data: sheltersFetchData, isLoading: sheltersLoading } = useGetSheltersQuery(
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
      enabled: !!camera && mapEnabled,
      staleTime: 1000 * 60 * 60
    }
  );
  const { mutate, isPending: searchPending } = useGetShelterSearchMutation();
  const { data: shelterCountData } = useGetShelterCountQuery(
    {
      latitude: initialLocation?.latitude || 0,
      longitude: initialLocation?.longitude || 0
    },
    { queryKey: [SHELTER_COUNT_QUERY_KEY, name], enabled: !!initialLocation, staleTime: 0 }
  );

  useEffect(() => {
    const hasSheltersData = !!sheltersFetchData && sheltersFetchData.length > 0;
    if (hasSheltersData) setSheltersData(sheltersFetchData);
  }, [sheltersFetchData]);

  const handleSubmit = () => {
    const search = methods.getValues('search');
    if (search) {
      mutate(
        { search, userLatitude: initialLocation?.latitude || 0, userLongitude: initialLocation?.longitude || 0 },
        {
          onSuccess: ({ data }) => {
            setSheltersData(data);
          }
        }
      );
    } else {
      setSheltersData(sheltersFetchData);
    }
  };
  const handleRefetch = useCallback(
    (params: CameraParams) => {
      const { latitude, longitude, zoom, region } = params;
      setCamera({ latitude, longitude, zoom });

      const radius = calcMapRadiusKm({
        latitudeDelta: region?.latitudeDelta || 0,
        longitudeDelta: region?.longitudeDelta || 0,
        latitude,
        longitude
      });
      setDistance(radius);
    },
    [setCamera, setDistance]
  );
  const handleInitMap = () => {
    setMapEnabled(true);
  };

  const data = useMemo(
    () => ({
      sheltersData,
      shelterCountData
    }),
    [shelterCountData, sheltersData]
  );

  const isLoading = sheltersLoading || searchPending;

  return (
    <FormProvider {...methods}>
      <View style={styles.container}>
        <SheltersTemplate
          data={data}
          camera={camera}
          onRefetch={handleRefetch}
          onSubmitSearch={handleSubmit}
          permissionStatus={permissionStatus}
          onInitMap={handleInitMap}
          ref={mapRef}
          isLoading={isLoading}
        />
      </View>
    </FormProvider>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.default,
    flex: 1
  }
});
