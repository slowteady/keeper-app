import { Linking } from 'react-native';
import { styled, Text, View, YStack } from 'tamagui';

export interface LinkProps {
  url: string;
  text: string;
}

export const Link = ({ url, text }: LinkProps) => {
  return (
    <View onPress={() => Linking.openURL(url)} hitSlop={12}>
      <YStack self="flex-start" gap={0.5}>
        <Text fontSize={16} fontWeight="400" color="#707070">
          {text}
        </Text>

        <Divider />
      </YStack>
    </View>
  );
};

const Divider = styled(View, {
  height: 1,
  bg: '#707070'
});
