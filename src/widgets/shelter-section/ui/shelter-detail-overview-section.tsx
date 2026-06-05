import { NaverMapViewRef } from '@mj-studio/react-native-naver-map';
import { RefObject } from 'react';
import { Pressable } from 'react-native';
import { styled, Text, useTheme, XStack } from 'tamagui';

import { ShelterDto, ShelterMap } from '@/entities/shelter';
import { toggleHaptic } from '@/shared/lib';
import { AnimatedHeart } from '@/shared/ui/icons/animation';
import { Share as ShareIcon } from '@/shared/ui/icons/outline';

export type ShelterDetailOverviewSectionProps = {
  data: ShelterDto;
  mapRef: RefObject<NaverMapViewRef | null>;
  isGranted: boolean;
  onMapInitialized: () => void;
  onPressFavorite?: () => void;
  onPressShare?: () => void;
};

export const ShelterDetailOverviewSection = ({
  data,
  mapRef,
  isGranted,
  onMapInitialized,
  onPressFavorite,
  onPressShare
}: ShelterDetailOverviewSectionProps) => {
  const { name, longitude, latitude, isFavorited = false } = data;
  const { black500 } = useTheme();
  const handlePressFavorite = () => {
    if (!onPressFavorite) return;
    toggleHaptic(isFavorited);
    onPressFavorite();
  };

  return (
    <>
      <TitleContainer mb={30} gap={14}>
        <Text
          numberOfLines={2}
          ellipsizeMode="tail"
          fontSize={28}
          lineHeight={38}
          fontWeight="500"
          color="$black900"
          flex={1}
        >
          {name}
        </Text>
        {onPressFavorite && (
          <Pressable hitSlop={10} onPress={handlePressFavorite}>
            <AnimatedHeart isLiked={isFavorited} size={26} inactiveColor={black500.val} />
          </Pressable>
        )}
        {onPressShare && (
          <Pressable hitSlop={10} onPress={onPressShare} accessibilityLabel="공유">
            <ShareIcon width={24} height={24} color={black500.val} />
          </Pressable>
        )}
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
