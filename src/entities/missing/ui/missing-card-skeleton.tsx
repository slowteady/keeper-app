import { View, YStack } from 'tamagui';

import { Skeleton } from '@/shared/ui';

const Bar = ({ width, height = 15 }: { width: number | `${number}%`; height?: number }) => (
  <View height={height} width={width}>
    <Skeleton style={{ width: '100%', height: '100%', borderRadius: 4 }} />
  </View>
);

export const MissingCardSkeleton = () => {
  return (
    <YStack width="100%">
      <View aspectRatio={4 / 3} mb={18}>
        <Skeleton style={{ width: '100%', height: '100%', borderRadius: 12 }} />
      </View>
      <View mb={14}>
        <Bar width="40%" height={18} />
      </View>
      <View mb={14}>
        <Bar width="85%" height={14} />
      </View>
      <YStack gap={10}>
        <Bar width="45%" height={13} />
        <Bar width="60%" height={13} />
      </YStack>
    </YStack>
  );
};
