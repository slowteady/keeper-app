import { useLocalSearchParams } from 'expo-router';
import { Suspense } from 'react';
import { styled, View } from 'tamagui';

import { MissingDetailContent } from '@/features/missing';
import { DetailErrorBoundary, SuspenseFallback } from '@/shared/ui';

export const ErrorBoundary = DetailErrorBoundary;

const Page = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  if (!id) return null;

  return (
    <Container>
      <Suspense fallback={<SuspenseFallback />}>
        <MissingDetailContent id={id} />
      </Suspense>
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
