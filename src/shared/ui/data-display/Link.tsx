import { RelativePathString, router } from 'expo-router';
import { Linking } from 'react-native';
import { styled, Text, View, YStack } from 'tamagui';

export interface LinkProps {
  url: string;
  text: string;
}

export const Link = ({ url, text }: LinkProps) => {
  const handlePress = () => {
    if (isExternal(url)) {
      Linking.openURL(url);
    } else {
      router.push(url as RelativePathString);
    }
  };

  return (
    <View onPress={handlePress} hitSlop={12}>
      <YStack self="flex-start" gap={0.5}>
        <Text fontSize={16} fontWeight="400" color="#707070">
          {text}
        </Text>

        <Divider />
      </YStack>
    </View>
  );
};

const isExternal = (url: string) => url.startsWith('http://') || url.startsWith('https://');

const Divider = styled(View, {
  height: 1,
  bg: '#707070'
});
