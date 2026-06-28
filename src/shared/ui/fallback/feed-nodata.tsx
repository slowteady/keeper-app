import { Image } from 'expo-image';
import { Pressable } from 'react-native';
import { styled, Text, View, YStack } from 'tamagui';

export type FeedNodataProps = {
  text?: string;
  description?: string;
  width?: number;
  height?: number;
  cta?: { label: string; onPress: () => void };
};

export const FeedNodata = ({
  text = '아직 공고가 없어요!',
  description,
  width = 100,
  height = 120,
  cta
}: FeedNodataProps) => {
  return (
    <YStack gap={20} items="center" justify="center">
      <Image source={require('@/assets/images/puppy.png')} contentFit="contain" style={{ width, height }} />
      <YStack gap={6} items="center">
        <Text fontSize={18} lineHeight={20} fontWeight="500" color="$black500" letterSpacing={-0.25}>
          {text}
        </Text>
        {description ? (
          <Text fontSize={14} lineHeight={20} fontWeight="400" color="$black400" letterSpacing={-0.2}>
            {description}
          </Text>
        ) : null}
      </YStack>
      {cta ? (
        <Pressable onPress={cta.onPress}>
          <CtaButton>
            <CtaText>{cta.label}</CtaText>
          </CtaButton>
        </Pressable>
      ) : null}
    </YStack>
  );
};

const CtaButton = styled(View, {
  self: 'center',
  px: 28,
  py: 16,
  rounded: 50,
  bg: '$black800',
  items: 'center',
  justify: 'center'
});

const CtaText = styled(Text, {
  fontSize: 13,
  lineHeight: 15,
  fontWeight: '600',
  color: '$white900'
});
