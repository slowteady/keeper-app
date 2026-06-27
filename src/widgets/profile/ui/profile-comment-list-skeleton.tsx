import { YStack } from 'tamagui';

import { PostListItemSkeleton } from '@/entities/community';

export const ProfileCommentListSkeleton = ({ count = 5 }: { count?: number }) => (
  <YStack>
    {Array.from({ length: count }).map((_, index) => (
      <PostListItemSkeleton key={index} />
    ))}
  </YStack>
);
