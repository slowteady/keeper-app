import { NaverMapViewRef } from '@mj-studio/react-native-naver-map';
import { MapPin, Navigation } from '@tamagui/lucide-icons';
import { RefObject } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { styled, Text, useTheme, View, XStack, YStack } from 'tamagui';

import { ShelterDto, ShelterMap } from '@/entities/shelter';
import { toggleHaptic } from '@/shared/lib';
import { AnimatedHeart } from '@/shared/ui/icons/animation';
import { Share as ShareIcon } from '@/shared/ui/icons/outline';

export type ShelterDetailOverviewSectionProps = {
  data: ShelterDto;
  mapRef: RefObject<NaverMapViewRef | null>;
  isGranted: boolean;
  isLocationPending?: boolean;
  onMapInitialized: () => void;
  onPressFavorite?: () => void;
  onPressShare?: () => void;
  onPressDirections?: () => void;
  onPressMap?: () => void;
};

export const ShelterDetailOverviewSection = ({
  data,
  mapRef,
  isGranted,
  isLocationPending,
  onMapInitialized,
  onPressFavorite,
  onPressShare,
  onPressDirections,
  onPressMap
}: ShelterDetailOverviewSectionProps) => {
  const { name, address, longitude, latitude, isFavorited = false } = data;
  const { black500, black600 } = useTheme();

  const handlePressFavorite = () => {
    if (!onPressFavorite) return;
    toggleHaptic(isFavorited);
    onPressFavorite();
  };

  return (
    <YStack gap={14}>
      <TitleRow>
        <Title numberOfLines={2} ellipsizeMode="tail">
          {name}
        </Title>
        <Actions>
          {onPressFavorite && (
            <Pressable hitSlop={10} onPress={handlePressFavorite}>
              <AnimatedHeart isLiked={isFavorited} size={26} inactiveColor={black600.val} />
            </Pressable>
          )}
          {onPressShare && (
            <Pressable hitSlop={10} onPress={onPressShare} accessibilityLabel="공유">
              <ShareIcon width={24} height={24} color={black600.val} />
            </Pressable>
          )}
        </Actions>
      </TitleRow>

      <MapWrap>
        <ShelterMap
          ref={mapRef}
          hasLocation={isGranted}
          isLocationPending={isLocationPending}
          data={[data]}
          camera={{ latitude: latitude ?? 0, longitude: longitude ?? 0, zoom: 15 }}
          onRefetch={() => {}}
          onInitialized={onMapInitialized}
          selectedMarkerId={data.id}
          isShowCompass={false}
          minZoom={10}
          mapAspectRatio={16 / 9}
          readOnly
        />
        {onPressMap && (
          <Pressable style={StyleSheet.absoluteFill} onPress={onPressMap} accessibilityLabel="지도에서 위치 보기" />
        )}
      </MapWrap>

      <AddressRow>
        <MapPin size={18} color={black500.val as never} />
        <AddressText numberOfLines={2}>{address}</AddressText>
        {onPressDirections && (
          <Pressable hitSlop={8} onPress={onPressDirections} accessibilityLabel="길찾기">
            <DirectionsButton>
              <Navigation size={14} color={black600.val as never} />
              <DirectionsText>길찾기</DirectionsText>
            </DirectionsButton>
          </Pressable>
        )}
      </AddressRow>
    </YStack>
  );
};

const TitleRow = styled(XStack, {
  items: 'center',
  justify: 'space-between',
  gap: 12
});

const Actions = styled(XStack, {
  items: 'center',
  gap: 16,
  shrink: 0
});

const MapWrap = styled(View, {
  position: 'relative',
  rounded: 10,
  overflow: 'hidden'
});

const Title = styled(Text, {
  flex: 1,
  fontSize: 24,
  lineHeight: 32,
  fontWeight: '600',
  color: '$black900'
});

const AddressRow = styled(XStack, {
  items: 'center',
  gap: 8
});

const AddressText = styled(Text, {
  flex: 1,
  fontSize: 15,
  lineHeight: 22,
  fontWeight: '500',
  color: '$black700'
});

const DirectionsButton = styled(XStack, {
  items: 'center',
  gap: 4,
  px: 12,
  py: 7,
  rounded: 999,
  bg: '$backgroundDefault'
});

const DirectionsText = styled(Text, {
  fontSize: 13,
  lineHeight: 15,
  fontWeight: '600',
  color: '$black700'
});
