import { useEffect } from 'react';
import { styled, Text, XStack } from 'tamagui';

import { ShelterDto, ShelterMap, useShelterMap } from '@/entities/shelter';

export interface ShelterDetailOverviewSectionProps {
  data: ShelterDto;
}

export const ShelterDetailOverviewSection = ({ data }: ShelterDetailOverviewSectionProps) => {
  const {
    mapRef,
    camera,
    selectedMarkerId,
    enabled,
    toggleMapEnabled,
    refetchShelterList,
    toggleTapMarker,
    moveCamera,
    hasLocationStatus
  } = useShelterMap();
  const { name, longitude, latitude } = data;

  useEffect(() => {
    if (hasLocationStatus && enabled) {
      moveCamera(latitude, longitude);
    }
  }, [moveCamera, hasLocationStatus, latitude, longitude, enabled]);

  return (
    <>
      <TitleContainer mb={30}>
        <Text numberOfLines={2} ellipsizeMode="tail" fontSize={28} lineHeight={38} fontWeight="500" color="$black900">
          {name}
        </Text>
      </TitleContainer>

      <ShelterMap
        ref={mapRef}
        hasLocation={hasLocationStatus}
        data={[data]}
        camera={camera}
        onRefetch={refetchShelterList}
        onTapMarker={toggleTapMarker}
        onInitialized={toggleMapEnabled}
        selectedMarkerId={selectedMarkerId}
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
