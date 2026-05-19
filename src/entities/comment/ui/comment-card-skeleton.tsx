import { View, XStack, YStack } from 'tamagui';

import { Skeleton } from '@/shared/ui';

export const CommentCardSkeleton = () => {
  return (
    <YStack px={20} py={24}>
      <XStack mb={16} gap={8} items="center">
        <Skeleton style={{ width: 24, height: 24, borderRadius: 4 }} />
        <View height={14} width={80}>
          <Skeleton style={{ width: '100%', height: '100%', borderRadius: 4 }} />
        </View>
        <View height={12} width={50}>
          <Skeleton style={{ width: '100%', height: '100%', borderRadius: 4 }} />
        </View>
      </XStack>
      <View height={14} mb={6}>
        <Skeleton style={{ width: '100%', height: '100%', borderRadius: 4 }} />
      </View>
      <View height={14} mb={6} width="80%">
        <Skeleton style={{ width: '100%', height: '100%', borderRadius: 4 }} />
      </View>
      <View height={14} width="60%">
        <Skeleton style={{ width: '100%', height: '100%', borderRadius: 4 }} />
      </View>
    </YStack>
  );
};
