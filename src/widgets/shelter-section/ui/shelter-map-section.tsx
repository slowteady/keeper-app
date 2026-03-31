import { Camera, NaverMapViewRef } from '@mj-studio/react-native-naver-map';
import { forwardRef } from 'react';
import { View } from 'tamagui';

import { DistanceIndicator, ShelterCountDto, ShelterDto, ShelterMap } from '@/entities/shelter';
import { CameraParams } from '@/shared/model';

export interface ShelterMapSectionProps {
  hasLocationStatus: boolean;
  data?: ShelterDto[];
  counts?: ShelterCountDto[];
  camera?: Camera;
  onRefetch: (params?: CameraParams) => void;
  onTapMarker?: (data: ShelterDto) => void;
  onInitialized: () => void;
  selectedMarkerId?: string;
}

export const ShelterMapSection = forwardRef<NaverMapViewRef, ShelterMapSectionProps>(
  ({ hasLocationStatus, data, counts, camera, onRefetch, onTapMarker, onInitialized, selectedMarkerId }, ref) => {
    return (
      <>
        {hasLocationStatus && (
          <View mb={16}>
            <DistanceIndicator value={counts ?? []} />
          </View>
        )}

        <View>
          <ShelterMap
            ref={ref}
            hasLocation={hasLocationStatus}
            data={data || []}
            camera={camera}
            onRefetch={onRefetch}
            onTapMarker={onTapMarker}
            onInitialized={onInitialized}
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
