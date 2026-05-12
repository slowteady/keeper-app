import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useCallback } from 'react';
import { Pressable } from 'react-native';
import { styled, Text, View, XStack, YStack } from 'tamagui';

import { AnimatedHeart } from '@/shared/ui/icons/animation';

export type HomeShelterCardProps = {
  careRegNo: string;
  name: string;
  address: string;
  tel: string;
  isFavorited?: boolean;
  onPressFavorite?: (careRegNo: string, currentlyFavorited: boolean) => void;
};

export const HOME_SHELTER_CARD_SIZE = {
  SMALL: 270
};

export const HomeShelterCard = ({
  careRegNo,
  name,
  address,
  tel,
  isFavorited = false,
  onPressFavorite
}: HomeShelterCardProps) => {
  const descriptions = [
    { label: '주소', value: address },
    { label: '전화', value: tel }
  ];

  const handlePressFavorite = useCallback(() => {
    if (!onPressFavorite) return;
    impactAsync(isFavorited ? ImpactFeedbackStyle.Light : ImpactFeedbackStyle.Medium).catch(() => undefined);
    onPressFavorite(careRegNo, isFavorited);
  }, [careRegNo, isFavorited, onPressFavorite]);

  return (
    <Container>
      <XStack items="center" justify="space-between" mb={12}>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          flex={1}
          fontSize={18}
          lineHeight={20}
          fontWeight="600"
          color="$black900"
        >
          {name}
        </Text>
        <Pressable hitSlop={10} onPress={handlePressFavorite} disabled={!onPressFavorite}>
          <AnimatedHeart isLiked={isFavorited} size={18} />
        </Pressable>
      </XStack>

      <Divider mb={16} />

      <YStack gap={10} px={6}>
        {descriptions.map(({ label, value }, idx) => (
          <XStack key={`${label}-${idx}`} items="center" gap={12}>
            <Text fontSize={14} lineHeight={16} fontWeight="500" color="$black600">
              {label}
            </Text>
            <Description>{value}</Description>
          </XStack>
        ))}
      </YStack>
    </Container>
  );
};

const Container = styled(View, {
  rounded: 12,
  borderColor: '$white800',
  borderWidth: 1,
  bg: '$white900',
  px: 18,
  py: 20,
  width: HOME_SHELTER_CARD_SIZE.SMALL
});

const Divider = styled(View, {
  height: 1,
  bg: '$white800'
});

const Description = styled(Text, {
  fontSize: 14,
  lineHeight: 16,
  fontWeight: '500',
  color: '$black600',
  flex: 1,
  letterSpacing: -0.25,
  numberOfLines: 1,
  ellipsizeMode: 'tail'
});
