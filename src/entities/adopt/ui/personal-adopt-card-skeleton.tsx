import { View, XStack, YStack } from 'tamagui';

import { Skeleton } from '@/shared/ui';

const Bar = ({ width, height = 12 }: { width: number | `${number}%`; height?: number }) => (
  <View height={height} width={width}>
    <Skeleton style={{ width: '100%', height: '100%', borderRadius: 4 }} />
  </View>
);

export const PersonalAdoptCardSkeleton = () => {
  return (
    <YStack width="100%">
      <View aspectRatio={4 / 3} mb={18}>
        <Skeleton style={{ width: '100%', height: '100%', borderRadius: 12 }} />
      </View>
      <View mb={14}>
        <Bar width="70%" height={20} />
      </View>
      <View mb={8}>
        <Bar width="95%" />
      </View>
      <View mb={16}>
        <Bar width="55%" />
      </View>
      <View mb={8}>
        <Bar width="40%" />
      </View>
      <View mb={16}>
        <Bar width="48%" />
      </View>
      <XStack gap={4}>
        <Bar width={48} height={20} />
        <Bar width={36} height={20} />
        <Bar width={56} height={20} />
      </XStack>
    </YStack>
  );
};
