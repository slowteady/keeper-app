import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useCallback } from 'react';
import { Pressable } from 'react-native';
import { styled, Text, View, XStack } from 'tamagui';

import { AnimatedHeart } from '@/shared/ui/icons/animation';

import { ShelterDto } from '../schema';

export type ShelterCardProps = {
  data: ShelterDto;
  onPress: (id: string) => void;
  onPressFavorite?: (careRegNo: string, currentlyFavorited: boolean) => void;
};

export const ShelterCard = ({ data, onPress, onPressFavorite }: ShelterCardProps) => {
  const { id, name, distance, address, isFavorited = false } = data;
  const convertedDistance = Math.round((distance ?? 0) * 10) / 10;
  const convertedAddress = address.split(' ').slice(0, 3).join(' ');

  const handlePressFavorite = useCallback(() => {
    if (!onPressFavorite) return;
    impactAsync(isFavorited ? ImpactFeedbackStyle.Light : ImpactFeedbackStyle.Medium).catch(() => undefined);
    onPressFavorite(id, isFavorited);
  }, [id, isFavorited, onPressFavorite]);

  return (
    <Container>
      <View onPress={() => onPress(id)}>
        <View px={16} py={18}>
          <XStack items="center" justify="space-between" gap={8} mb={10}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              fontSize={16}
              lineHeight={18}
              fontWeight="500"
              color="$black900"
            >
              {name}
            </Text>
            <Pressable hitSlop={10} onPress={handlePressFavorite} disabled={!onPressFavorite}>
              <AnimatedHeart isLiked={isFavorited} size={20} />
            </Pressable>
          </XStack>

          <XStack items="center">
            <Text fontSize={13} lineHeight={15} fontWeight="400" color="$black800">
              {convertedDistance}km
            </Text>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              fontSize={13}
              lineHeight={15}
              fontWeight="400"
              color="$black500"
              ml={4}
            >
              | {convertedAddress}
            </Text>
          </XStack>
        </View>
      </View>
    </Container>
  );
};

const Container = styled(View, {
  borderColor: '$white800',
  borderWidth: 1,
  rounded: 12
});
