import { useSuspenseQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { Suspense } from 'react';
import { styled, View } from 'tamagui';

import { communityQueries } from '@/entities/community';
import { CommunityAdoptDetailContent, QnaDetailContent } from '@/features/community';
import { DetailErrorBoundary } from '@/shared/ui';
import { PostDetailSkeleton } from '@/widgets/community-post-section';

export const ErrorBoundary = DetailErrorBoundary;

const Page = () => {
  const { id, scrollToComments, commentId, editCommentId } = useLocalSearchParams<{
    id: string;
    scrollToComments?: string;
    commentId?: string;
    editCommentId?: string;
  }>();
  if (!id) return null;

  return (
    <Container>
      <Suspense fallback={<PostDetailSkeleton />}>
        <DetailRouter
          id={id}
          scrollToComments={scrollToComments === '1'}
          commentId={commentId}
          editCommentId={editCommentId}
        />
      </Suspense>
    </Container>
  );
};

type DetailRouterProps = {
  id: string;
  scrollToComments: boolean;
  commentId?: string;
  editCommentId?: string;
};

const DetailRouter = ({ id, scrollToComments, commentId, editCommentId }: DetailRouterProps) => {
  const { data } = useSuspenseQuery(communityQueries.detail(id));
  if (data.kind === 'QNA')
    return (
      <QnaDetailContent
        id={id}
        scrollToComments={scrollToComments}
        commentId={commentId}
        editCommentId={editCommentId}
      />
    );
  return <CommunityAdoptDetailContent id={id} />;
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
