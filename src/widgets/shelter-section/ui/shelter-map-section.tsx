import { Camera, NaverMapViewRef } from '@mj-studio/react-native-naver-map';
import { forwardRef } from 'react';
import { View } from 'tamagui';

import { DistanceIndicator, ShelterCountDto, ShelterDto, ShelterMap } from '@/entities/shelter';
import { CameraParams } from '@/shared/model';

export type ShelterMapSectionProps = {
  isGranted: boolean;
  data?: ShelterDto[];
  counts?: ShelterCountDto[];
  camera?: Camera;
  onRefetch: (params?: CameraParams) => void;
  onTapMarker?: (data: ShelterDto) => void;
  onMapInitialized: () => void;
  selectedMarkerId?: string;
};

export const ShelterMapSection = forwardRef<NaverMapViewRef, ShelterMapSectionProps>(
  ({ isGranted, data, counts, camera, onRefetch, onTapMarker, onMapInitialized, selectedMarkerId }, ref) => {
    return (
      <>
        {isGranted && (
          <View mb={16}>
            <DistanceIndicator value={counts ?? []} />
          </View>
        )}

        <View>
          <ShelterMap
            ref={ref}
            hasLocation={isGranted}
            data={data}
            camera={camera}
            onRefetch={onRefetch}
            onTapMarker={onTapMarker}
            onInitialized={onMapInitialized}
            selectedMarkerId={selectedMarkerId}
            isShowCompass={false}
            minZoom={10}
          />
        </View>
      </>
    );
  }
);

ShelterMapSection.displayName = 'ShelterMapSection';
