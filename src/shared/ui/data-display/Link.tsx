import { Linking, Pressable } from 'react-native';
import { styled, Text, View, YStack } from 'tamagui';

export interface LinkProps {
  url: string;
  text: string;
}

export const Link = ({ url, text }: LinkProps) => {
  return (
    <Pressable onPress={() => Linking.openURL(url)}>
      <YStack self="flex-start" gap={0.5}>
        <LinkText>{text}</LinkText>
        <Divider />
      </YStack>
    </Pressable>
  );
};

const LinkText = styled(Text, {
  fontSize: 16,
  fontWeight: 400,
  color: '$black800'
});
const Divider = styled(View, {
  height: 1,
  bg: '#707070'
});
