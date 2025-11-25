import { Image } from 'expo-image';
import { Text, YStack } from 'tamagui';

export interface AdoptNodataProps {
  text?: string;
  width?: number;
  height?: number;
}

export const AdoptNodata = ({ text = '아직 공고가 없어요!', width = 100, height = 120 }: AdoptNodataProps) => {
  return (
    <YStack gap={20} items="center" justify="center">
      <Image source={require('@/assets/images/puppy.png')} contentFit="contain" style={{ width, height }} />
      <Text fontSize={18} lineHeight={20} fontWeight="500" color="$black500" letterSpacing={-0.25}>
        {text}
      </Text>
    </YStack>
  );
};
