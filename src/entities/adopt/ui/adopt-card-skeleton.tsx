import { styled, View, YStack } from 'tamagui';

import { Skeleton } from '@/shared/ui';

type AdoptCardSkeletonProps = {
  width: number;
};

export const AdoptCardSkeleton = ({ width }: AdoptCardSkeletonProps) => {
  return (
    <YStack width={width}>
      <SkeletonWrap width={width} mb={20}>
        <Skeleton style={{ width: '100%', height: '100%', borderRadius: 8 }} />
      </SkeletonWrap>

      <View mb={30} height={20} width="50%">
        <Skeleton style={{ width: '100%', height: '100%', borderRadius: 4 }} />
      </View>

      <View mb={20}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <View key={idx} mb={16} height={10}>
            <Skeleton style={{ width: '100%', height: '100%', borderRadius: 4 }} />
          </View>
        ))}
      </View>

      <View mb={20} height={10}>
        <Skeleton style={{ width: '100%', height: '100%', borderRadius: 4 }} />
      </View>
    </YStack>
  );
};

const SkeletonWrap = styled(View, {
  aspectRatio: 5 / 4
});
