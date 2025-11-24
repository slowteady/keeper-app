import { styled, Text, View, XStack } from 'tamagui';

import { ShelterDto } from '../model';

export interface ShelterCardProps {
  data: ShelterDto;
  onPress: (id: number) => void;
  size?: 'medium';
}

export const ShelterCard = ({ data, onPress, size = 'medium' }: ShelterCardProps) => {
  const { name, distance, address } = data;
  const convertedDistance = Math.round(distance * 10) / 10;
  const convertedAddress = address.split(' ').slice(0, 3).join(' ');

  return (
    <Container size={size}>
      <View onPress={() => onPress(data.id)}>
        <View p={20}>
          <XStack items="center" gap={8} mb={10}>
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
              {convertedAddress}
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
  rounded: 12,
  variants: {
    size: {
      medium: {
        width: 270
      }
    }
  } as const
});
