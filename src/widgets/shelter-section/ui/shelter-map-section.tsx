import { Camera, NaverMapViewRef } from '@mj-studio/react-native-naver-map';
import { forwardRef } from 'react';
import { styled, Text, View, XStack } from 'tamagui';

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
  searchResultCount?: number;
};

export const ShelterMapSection = forwardRef<NaverMapViewRef, ShelterMapSectionProps>(
  (
    { isGranted, data, counts, camera, onRefetch, onTapMarker, onMapInitialized, selectedMarkerId, searchResultCount },
    ref
  ) => {
    const isSearchMode = searchResultCount !== undefined;

    return (
      <>
        {isSearchMode ? (
          <SearchResultBar mb={16}>
            <Text fontSize={14} lineHeight={20} fontWeight="500" color="$black600">
              검색 결과 {searchResultCount}곳
            </Text>
          </SearchResultBar>
        ) : (
          isGranted && (
            <View mb={16}>
              <DistanceIndicator value={counts ?? []} />
            </View>
          )
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

const SearchResultBar = styled(XStack, {
  items: 'center',
  justify: 'center',
  bg: '$white850',
  rounded: 12,
  height: 42
});

ShelterMapSection.displayName = 'ShelterMapSection';
