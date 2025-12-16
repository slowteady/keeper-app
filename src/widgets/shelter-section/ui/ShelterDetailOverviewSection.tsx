import { useEffect } from 'react';
import { styled, Text, XStack } from 'tamagui';

import { ShelterDto, ShelterMap, useShelterMap } from '@/entities';

export interface ShelterDetailOverviewSectionProps {
  data: ShelterDto;
}

export const ShelterDetailOverviewSection = ({ data }: ShelterDetailOverviewSectionProps) => {
  const { refs, state, actions, flags } = useShelterMap();
  const { name, longitude, latitude } = data;

  useEffect(() => {
    if (flags.hasLocationStatus && state.enabled) {
      actions.moveCamera(latitude, longitude);
    }
  }, [actions, flags.hasLocationStatus, latitude, longitude, state.enabled]);

  return (
    <>
      <TitleContainer mb={30}>
        <Text numberOfLines={2} ellipsizeMode="tail" fontSize={28} lineHeight={38} fontWeight="500" color="$black900">
          {name}
        </Text>
      </TitleContainer>

      <ShelterMap
        ref={refs.mapRef}
        hasLocation={flags.hasLocationStatus}
        data={[data]}
        camera={state.camera}
        onRefetch={actions.refetchShelterList}
        onTapMarker={actions.toggleTapMarker}
        onInitialized={actions.toggleMapEnabled}
        selectedMarkerId={state.selectedMarkerId}
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
