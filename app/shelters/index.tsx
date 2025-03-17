import DetailHeader from '@/components/organisms/headers/DetailHeader';
import SheltersTemplate from '@/components/templates/shelters/SheltersTemplate';
import { SHELTER_COUNT_QUERY_KEY } from '@/constants/queryKeys';
import theme from '@/constants/theme';
import { useGetShelterCountQuery, useGetSheltersQuery } from '@/hooks/queries/useShelters';
import { useMapInit } from '@/hooks/useMapInit';
import { CameraParams } from '@/types/map';
import { calcMapRadiusKm } from '@/utils/mapUtils';
import { useRoute } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

const Page = () => {
  const [mapEnabled, setMapEnabled] = useState(false);
  const { camera, setCamera, distance, setDistance, initialLocation, mapRef, permissionStatus } = useMapInit();
  const { name } = useRoute();

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
      enabled: !!camera && mapEnabled,
      staleTime: 1000 * 60 * 60
    }
  );
  const { data: shelterCountData } = useGetShelterCountQuery(
    {
      latitude: initialLocation?.latitude || 0,
      longitude: initialLocation?.longitude || 0
    },
    { queryKey: [SHELTER_COUNT_QUERY_KEY, name], enabled: !!initialLocation, staleTime: 0 }
  );
  const data = useMemo(
    () => ({
      sheltersData,
      shelterCountData
    }),
    [shelterCountData, sheltersData]
  );

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

  return (
    <>
      <Stack.Screen options={{ header: () => <DetailHeader /> }} />

      <View style={styles.container}>
        <SheltersTemplate
          data={data}
          camera={camera}
          onRefetch={handleRefetch}
          permissionStatus={permissionStatus}
          onInitMap={handleInitMap}
          ref={mapRef}
        />
      </View>
    </>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.default,
    flex: 1
  }
});
