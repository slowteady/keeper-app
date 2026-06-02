import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useCallback } from 'react';
import { Pressable } from 'react-native';
import { styled, Text, useTheme, View, XStack, YStack } from 'tamagui';

import { AnimatedHeart } from '@/shared/ui/icons/animation';

import { formatShelterHours } from '../lib';
import { ShelterDto } from '../schema';

export type ShelterCardProps = {
  data: ShelterDto;
  size?: 'compact' | 'full';
  onPress: (id: string) => void;
  onPressFavorite?: (careRegNo: string, currentlyFavorited: boolean) => void;
};

export const ShelterCard = ({ data, size = 'full', onPress, onPressFavorite }: ShelterCardProps) => {
  const { black500 } = useTheme();
  const { id, name, distance, address, isFavorited = false } = data;
  const hasDistance = typeof distance === 'number' && distance > 0;
  const convertedDistance = Math.round((distance ?? 0) * 10) / 10;
  const convertedAddress = address.split(' ').slice(0, 3).join(' ');
  const hours = formatShelterHours(data);

  const handlePressFavorite = useCallback(() => {
    if (!onPressFavorite) return;
    impactAsync(isFavorited ? ImpactFeedbackStyle.Light : ImpactFeedbackStyle.Medium).catch(() => undefined);
    onPressFavorite(id, isFavorited);
  }, [id, isFavorited, onPressFavorite]);

  return (
    <Container size={size}>
      {/* 카드 전체 클릭은 Pressable, 하트는 형제 Pressable 로 분리 — 부모/자식 onPress 충돌 방지 */}
      <Pressable onPress={() => onPress(id)}>
        <YStack px={16} py={18} gap={8}>
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
      </Pressable>

      <Pressable
        style={{ position: 'absolute', top: 16, right: 16 }}
        hitSlop={10}
        onPress={handlePressFavorite}
        disabled={!onPressFavorite}
      >
        <AnimatedHeart isLiked={isFavorited} size={20} inactiveColor={black500.val} />
      </Pressable>
    </Container>
  );
};

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
