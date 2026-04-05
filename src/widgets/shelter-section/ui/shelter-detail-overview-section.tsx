import { RefObject, useEffect } from 'react';
import { styled, Text, XStack } from 'tamagui';

import { ShelterDto, ShelterMap } from '@/entities/shelter';
import { CameraParams } from '@/shared/model';

export type ShelterDetailOverviewSectionProps = {
  data: ShelterDto;
  mapRef: RefObject<any>;
  camera?: CameraParams;
  selectedMarkerId?: string;
  enabled: boolean;
  hasLocationStatus: boolean;
  onToggleMapEnabled: () => void;
  onRefetchShelterList: (params?: CameraParams) => void;
  onToggleTapMarker: (data: ShelterDto) => void;
  onMoveCamera: (latitude: number, longitude: number) => void;
};

export const ShelterDetailOverviewSection = ({
  data,
  mapRef,
  camera,
  selectedMarkerId,
  enabled,
  hasLocationStatus,
  onToggleMapEnabled,
  onRefetchShelterList,
  onToggleTapMarker,
  onMoveCamera
}: ShelterDetailOverviewSectionProps) => {
  const { name, longitude, latitude } = data;

  useEffect(() => {
    if (hasLocationStatus && enabled) {
      onMoveCamera(latitude, longitude);
    }
  }, [onMoveCamera, hasLocationStatus, latitude, longitude, enabled]);

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
        onRefetch={onRefetchShelterList}
        onTapMarker={onToggleTapMarker}
        onInitialized={onToggleMapEnabled}
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
