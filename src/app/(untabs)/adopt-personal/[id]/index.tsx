import { useSuspenseQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { Suspense } from 'react';
import { styled, View } from 'tamagui';

import { communityQueries } from '@/entities/community';
import { CommunityAdoptDetailContent } from '@/features/community';
import { DetailErrorBoundary } from '@/shared/ui';
import { PostDetailSkeleton } from '@/widgets/community-post-section';

export const ErrorBoundary = DetailErrorBoundary;

const Page = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  if (!id) return null;

  return (
    <Container>
      <Suspense fallback={<PostDetailSkeleton />}>
        <PersonalDetailGuard id={id} />
      </Suspense>
    </Container>
  );
};

const PersonalDetailGuard = ({ id }: { id: string }) => {
  const { data } = useSuspenseQuery(communityQueries.detail(id));
  if (data.kind !== 'ADOPT') {
    throw new Error('개인 공고가 아닌 글입니다.');
  }
  return <CommunityAdoptDetailContent id={id} />;
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
