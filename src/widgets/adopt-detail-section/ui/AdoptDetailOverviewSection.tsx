import { Dimensions } from 'react-native';
import { styled, Text, View, XStack, YStack } from 'tamagui';

import { Carousel } from '@/shared';

export interface AdoptDetailOverviewSectionProps {
  title: string;
  images: string[];
  description: { label: string; value: string }[];
}

export const AdoptDetailOverviewSection = ({ title, images, description }: AdoptDetailOverviewSectionProps) => {
  return (
    <>
      <TitleContainer mb={30} gap={8}>
        <Text numberOfLines={1} ellipsizeMode="tail" fontSize={28} lineHeight={30} fontWeight="500" flex={1}>
          {title}
        </Text>
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
