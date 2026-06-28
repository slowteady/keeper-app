import { memo, useCallback, useMemo } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { styled, Text, useTheme, View, XStack, YStack } from 'tamagui';

import { CARD_PADDING, toggleHaptic } from '@/shared/lib';
import { AnimatedHeart } from '@/shared/ui/icons/animation';

import { formatShelterHours } from '../lib';
import { ShelterDto } from '../schema';

export type ShelterCardProps = {
  data: ShelterDto;
  size?: 'compact' | 'full';
  isSelected?: boolean;
  onPress: (id: string) => void;
  onPressFavorite?: (careRegNo: string, currentlyFavorited: boolean) => void;
};

const ShelterCardComponent = ({
  data,
  size = 'full',
  isSelected = false,
  onPress,
  onPressFavorite
}: ShelterCardProps) => {
  const { black500 } = useTheme();
  const { id, name, distance, address, isFavorited = false } = data;
  const hasDistance = typeof distance === 'number' && distance > 0;
  const convertedDistance = Math.round((distance ?? 0) * 10) / 10;
  const convertedAddress = address.split(' ').slice(0, 3).join(' ');
  const hours = formatShelterHours(data);

  const handlePressFavorite = useCallback(() => {
    if (!onPressFavorite) return;
    toggleHaptic(isFavorited);
    onPressFavorite(id, isFavorited);
  }, [id, isFavorited, onPressFavorite]);

  const { cardTap, heartTap } = useMemo(() => {
    const heart = Gesture.Tap()
      .maxDuration(250)
      .maxDeltaX(8)
      .maxDeltaY(8)
      .onEnd((_e, success) => {
        if (success) handlePressFavorite();
      })
      .runOnJS(true);

    const card = Gesture.Tap()
      .maxDistance(10)
      .requireExternalGestureToFail(heart)
      .onEnd((_e, success) => {
        if (success) onPress(id);
      })
      .runOnJS(true);

    return { cardTap: card, heartTap: heart };
  }, [handlePressFavorite, id, onPress]);

  return (
    <Container size={size} borderColor={isSelected ? '$primaryMain' : '$white800'}>
      <GestureDetector gesture={cardTap}>
        <YStack px={CARD_PADDING} py={18} gap={8}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            fontSize={16}
            lineHeight={18}
            fontWeight="500"
            color="$black900"
            pr={28}
          >
            {name}
          </Text>

          <XStack items="center">
            {hasDistance && (
              <Text fontSize={13} lineHeight={15} fontWeight="400" color="$black800">
                {convertedDistance}km
              </Text>
            )}
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              flex={1}
              fontSize={13}
              lineHeight={15}
              fontWeight="400"
              color="$black500"
              ml={hasDistance ? 4 : 0}
            >
              {hasDistance ? `| ${convertedAddress}` : convertedAddress}
            </Text>
          </XStack>

          {hours ? (
            <Text fontSize={13} lineHeight={15} fontWeight="400" color="$black600">
              {hours}
            </Text>
          ) : (
            <View height={15} />
          )}
        </YStack>
      </GestureDetector>

      <GestureDetector gesture={heartTap}>
        <View style={{ position: 'absolute', top: 16, right: 16 }} hitSlop={10}>
          <AnimatedHeart isLiked={isFavorited} size={20} inactiveColor={black500.val} />
        </View>
      </GestureDetector>
    </Container>
  );
};

export const ShelterCard = memo(ShelterCardComponent);
ShelterCard.displayName = 'ShelterCard';

const Container = styled(View, {
  borderColor: '$white800',
  borderWidth: 1,
  rounded: 12,
  bg: '$white900',
  variants: {
    size: {
      full: { width: '100%' },
      compact: { width: 270 }
    }
  } as const
});
