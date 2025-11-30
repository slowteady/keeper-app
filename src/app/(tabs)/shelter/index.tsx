import { FlashList } from '@shopify/flash-list';
import { styled, View } from 'tamagui';

import { LocationBottomSheet, useLocationBottomSheet } from '@/features';
import { ShelterListHeaderSection, ShelterMapSection } from '@/widgets';

/**
 * 보호소 목록 페이지
 */
const Page = () => {
  // const [mapEnabled, setMapEnabled] = useState(false);
  // const [sheltersData, setSheltersData] = useState<ShelterDto[]>();
  // const { camera, setCamera, distance, setDistance, initialLocation, mapRef, permissionStatus } = useShelterMap();

  // const methods = useForm<ShelterSearchParams>({ defaultValues: { search: '' } });

  // const { mutate: searchMutate, isPending: isSearchLoading } = useGetShelterSearchMutation();
  // const { data: sheltersFetchData, isLoading: sheltersLoading } = useGetSheltersQuery(
  //   {
  //     latitude: camera?.latitude || 0,
  //     longitude: camera?.longitude || 0,
  //     distance,
  //     userLatitude: initialLocation?.latitude || 0,
  //     userLongitude: initialLocation?.longitude || 0
  //   },
  //   {
  //     select: ({ data }) => {
  //       return data.data.sort((a, b) => a.distance - b.distance);
  //     },
  //     enabled: !!camera && mapEnabled
  //   }
  // );
  // const { data: shelterCountData } = useGetShelterCountsQuery(
  //   {
  //     latitude: initialLocation?.latitude || 0,
  //     longitude: initialLocation?.longitude || 0
  //   },
  //   { enabled: !!initialLocation }
  // );

  // const handleSubmit = () => {
  //   const search = methods.getValues('search');
  //   if (search) {
  //     searchMutate(
  //       { search, userLatitude: initialLocation?.latitude || 0, userLongitude: initialLocation?.longitude || 0 },
  //       {
  //         onSuccess: ({ data }) => {
  //           setSheltersData(data.data);
  //         }
  //       }
  //     );
  //   } else {
  //     setSheltersData(sheltersFetchData);
  //   }
  // };
  // const handleRefetch = useCallback(
  //   (params: CameraParams) => {
  //     const { latitude, longitude, zoom, region } = params;
  //     setCamera({ latitude, longitude, zoom });

  //     const radius = calcMapRadiusKm({
  //       latitudeDelta: region?.latitudeDelta || 0,
  //       longitudeDelta: region?.longitudeDelta || 0,
  //       latitude,
  //       longitude
  //     });
  //     setDistance(radius);
  //   },
  //   [setCamera, setDistance]
  // );

  // useEffect(() => {
  //   const hasSheltersData = !!sheltersFetchData && sheltersFetchData.length > 0;
  //   if (hasSheltersData) setSheltersData(sheltersFetchData);
  // }, [sheltersFetchData]);

  // const data = useMemo(
  //   () => ({
  //     sheltersData,
  //     shelterCountData
  //   }),
  //   [shelterCountData, sheltersData]
  // );

  // const isLoading = sheltersLoading || isSearchLoading;

  // <FormProvider {...methods}>
  //     <SheltersTemplate
  //       data={data}
  //       camera={camera}
  //       onRefetch={handleRefetch}
  //       onSubmitSearch={handleSubmit}
  //       permissionStatus={permissionStatus}
  //       onInitMap={() => setMapEnabled(true)}
  //       ref={mapRef}
  //       isLoading={isLoading}
  //     />
  // </FormProvider>
  const { state, refs, flags, actions } = useLocationBottomSheet((selectedAddress) => {});

  return (
    <Container>
      <FlashList
        data={[]}
        renderItem={() => <View />}
        ListHeaderComponent={
          <>
            <View px={20}>
              <ShelterListHeaderSection
                onSubmitSearch={actions.submitGeocode}
                onPressLocation={actions.openBottomSheet}
              />
            </View>
            <ShelterMapSection />
          </>
        }
        contentContainerStyle={{ paddingVertical: 32 }}
      />

      <LocationBottomSheet
        ref={refs.ref}
        addresses={state.searchedAddresses}
        onDismiss={actions.dismiss}
        onSearch={actions.submitGeocode}
        onSelectAddress={actions.getAddress}
        isPending={flags.isPending}
      />
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
