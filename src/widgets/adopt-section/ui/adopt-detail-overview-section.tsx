import { Dimensions, Pressable } from 'react-native';
import { styled, Text, useTheme, View, XStack, YStack } from 'tamagui';

import { toggleHaptic } from '@/shared/lib';
import { Carousel } from '@/shared/ui';
import { AnimatedHeart } from '@/shared/ui/icons/animation';
import { Share as ShareIcon } from '@/shared/ui/icons/outline';

export type AdoptDetailOverviewSectionProps = {
  title: string;
  images: string[];
  description: { label: string; value: string }[];
  isFavorited?: boolean;
  onPressFavorite?: () => void;
  onPressShare?: () => void;
};

export const AdoptDetailOverviewSection = ({
  title,
  images,
  description,
  isFavorited = false,
  onPressFavorite,
  onPressShare
}: AdoptDetailOverviewSectionProps) => {
  const { black600 } = useTheme();
  const handlePressFavorite = () => {
    if (!onPressFavorite) return;
    toggleHaptic(isFavorited);
    onPressFavorite();
  };
  return (
    <>
      <TitleContainer mb={20} gap={14}>
        <Text numberOfLines={1} ellipsizeMode="tail" fontSize={28} lineHeight={30} fontWeight="500" flex={1}>
          {title}
        </Text>
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
      </TitleContainer>

      <ImageContainer mb={28}>
        <Carousel data={images} showIndicator showImageViewer />
      </ImageContainer>

      <YStack gap={16}>
        {description.map(({ label, value }, idx) => {
          const key = `${label}-${idx}`;

          return (
            <XStack key={key} gap={16} items="center">
              <Text fontSize={15} fontWeight="400" lineHeight={21} color="$black600" minW={70} self="flex-start">
                {label}
              </Text>
              <Text fontSize={15} fontWeight="400" lineHeight={21} color="$black900" flex={1} self="flex-start">
                {value}
              </Text>
            </XStack>
          );
        })}
      </YStack>
    </>
  );
};

const TitleContainer = styled(XStack, {
  justify: 'space-between',
  items: 'center'
});

const ImageContainer = styled(View, {
  width: Dimensions.get('screen').width - 40,
  aspectRatio: 5 / 4
});
