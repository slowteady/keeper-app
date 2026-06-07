import { View, XStack, YStack } from 'tamagui';

import { Skeleton } from '@/shared/ui';

export const ShelterCardSkeleton = () => {
  return (
    <YStack px={16} py={18} gap={8} borderWidth={1} borderColor="$white800" rounded={12} bg="$white900">
      <XStack justify="space-between" items="center">
        <View width="55%" height={18}>
          <Skeleton style={{ width: '100%', height: '100%', borderRadius: 4 }} />
        </View>
        <Skeleton style={{ width: 20, height: 20, borderRadius: 10 }} />
      </XStack>
      <View width="75%" height={15}>
        <Skeleton style={{ width: '100%', height: '100%', borderRadius: 4 }} />
      </View>
      <View width="45%" height={15}>
        <Skeleton style={{ width: '100%', height: '100%', borderRadius: 4 }} />
      </View>
    </YStack>
  );
};
