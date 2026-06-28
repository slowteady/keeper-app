import { styled, View, XStack, YStack } from 'tamagui';

import { SCREEN_GUTTER } from '@/shared/lib';
import { Skeleton } from '@/shared/ui';

export const PostCardSkeleton = () => {
  return (
    <YStack px={SCREEN_GUTTER} py={32}>
      <XStack mb={16} gap={8} items="center">
        <Skeleton style={{ width: 32, height: 32, borderRadius: 4 }} />
        <View flex={1}>
          <View height={14} mb={6} width="40%">
            <Skeleton style={{ width: '100%', height: '100%', borderRadius: 4 }} />
          </View>
          <View height={12} width="25%">
            <Skeleton style={{ width: '100%', height: '100%', borderRadius: 4 }} />
          </View>
        </View>
      </XStack>

      <View height={20} mb={20} width="80%">
        <Skeleton style={{ width: '100%', height: '100%', borderRadius: 4 }} />
      </View>

      <CarouselWrap mb={16}>
        <Skeleton style={{ width: '100%', height: '100%', borderRadius: 8 }} />
      </CarouselWrap>

      <XStack mb={16} gap={6}>
        {Array.from({ length: 3 }).map((_, idx) => (
          <View key={idx} height={20} width={50}>
            <Skeleton style={{ width: '100%', height: '100%', borderRadius: 4 }} />
          </View>
        ))}
      </XStack>

      <View height={14} mb={6}>
        <Skeleton style={{ width: '100%', height: '100%', borderRadius: 4 }} />
      </View>
      <View height={14} width="60%">
        <Skeleton style={{ width: '100%', height: '100%', borderRadius: 4 }} />
      </View>
    </YStack>
  );
};

const CarouselWrap = styled(View, {
  aspectRatio: 5 / 4
});
