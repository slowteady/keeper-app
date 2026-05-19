import { RelativePathString, router } from 'expo-router';
import { Linking, Pressable } from 'react-native';
import { styled, Text, View, YStack } from 'tamagui';

import { logger } from '@/shared/lib';

export type LinkProps = {
  url: string;
  text: string;
};

export const Link = ({ url, text }: LinkProps) => {
  const handlePress = async () => {
    try {
      if (isExternal(url)) {
        await Linking.openURL(url);
      } else {
        router.push(url as RelativePathString);
      }
    } catch (err) {
      logger.error(err);
    }
  };

  // Pressable + opacity feedback — 일반 View onPress 는 press visual 이 없어 클릭 가능 여부 모호.
  return (
    <Pressable onPress={handlePress} hitSlop={12} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
      <YStack self="flex-start" gap={0.5}>
        <Text fontSize={16} fontWeight="700" color="$black650">
          {text}
        </Text>
        <Divider />
      </YStack>
    </Pressable>
  );
};

const isExternal = (url: string) => url.startsWith('http://') || url.startsWith('https://');

const Divider = styled(View, {
  height: 1.4,
  bg: '$black650'
});
