import { NaverMapViewRef } from '@mj-studio/react-native-naver-map';
import { RefObject } from 'react';
import { styled, Text, XStack } from 'tamagui';

import { ShelterDto, ShelterMap } from '@/entities/shelter';

export type ShelterDetailOverviewSectionProps = {
  data: ShelterDto;
  mapRef: RefObject<NaverMapViewRef | null>;
  isGranted: boolean;
  onMapInitialized: () => void;
};

export const ShelterDetailOverviewSection = ({
  data,
  mapRef,
  isGranted,
  onMapInitialized
}: ShelterDetailOverviewSectionProps) => {
  const { name, longitude, latitude } = data;

  return (
    <>
      <TitleContainer mb={30}>
        <Text numberOfLines={2} ellipsizeMode="tail" fontSize={28} lineHeight={38} fontWeight="500" color="$black900">
          {name}
        </Text>
      </TitleContainer>

      <ShelterMap
        ref={mapRef}
        hasLocation={isGranted}
        data={[data]}
        camera={{ latitude, longitude, zoom: 15 }}
        onRefetch={() => {}}
        onInitialized={onMapInitialized}
        selectedMarkerId={data.id}
        isShowCompass={false}
        minZoom={10}
        readOnly
      />
    </>
  );
};

const TitleContainer = styled(XStack, {
  flex: 1,
  items: 'center',
  justify: 'space-between'
});
