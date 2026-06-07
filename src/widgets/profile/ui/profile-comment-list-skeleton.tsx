import { YStack } from 'tamagui';

import { CommentCardSkeleton } from '@/entities/comment';

export const ProfileCommentListSkeleton = ({ count = 5 }: { count?: number }) => (
  <YStack>
    {Array.from({ length: count }).map((_, index) => (
      <CommentCardSkeleton key={index} />
    ))}
  </YStack>
);
