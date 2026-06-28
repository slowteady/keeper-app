import { View, XStack, YStack } from 'tamagui';

import { Skeleton } from '@/shared/ui';

export const PostListItemSkeleton = () => (
  <XStack py={16} gap={16} items="flex-start">
    <YStack flex={1} gap={8}>
      <XStack gap={8} items="center">
        <View height={22} width={56}>
          <Skeleton style={{ width: '100%', height: '100%', borderRadius: 4 }} />
        </View>
        <View height={14} width={40}>
          <Skeleton style={{ width: '100%', height: '100%', borderRadius: 4 }} />
        </View>
      </XStack>
      <View height={20}>
        <Skeleton style={{ width: '100%', height: '100%', borderRadius: 4 }} />
      </View>
      <View height={20} width="60%">
        <Skeleton style={{ width: '100%', height: '100%', borderRadius: 4 }} />
      </View>
    </YStack>
    <View width={64} height={64}>
      <Skeleton style={{ width: '100%', height: '100%', borderRadius: 8 }} />
    </View>
  </XStack>
);
