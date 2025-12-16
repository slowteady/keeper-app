import { ViewStyle } from 'react-native';
import { styled, Text, useTheme, XStack } from 'tamagui';

import { Paw } from '../icons/solid';

export interface NoImageProps {
  style?: ViewStyle;
}

export const NoImage = ({ style }: NoImageProps) => {
  const { white600 } = useTheme();

  return (
    <Container style={style}>
      <Text fontSize={19} fontWeight="600" color="$white600">
        No Image
      </Text>

      <Paw width={22} height={22} color={white600.val} />
    </Container>
  );
};

const Container = styled(XStack, {
  rounded: 8,
  width: '100%',
  height: '100%',
  items: 'center',
  justify: 'center',
  gap: 2,
  bg: '$white850'
});
