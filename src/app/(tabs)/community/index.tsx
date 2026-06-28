import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { styled, View } from 'tamagui';

import { useLoginRequired } from '@/features/auth';
import { RouteErrorBoundary, WriteFab } from '@/shared/ui';
import { CommunityQnAFeed } from '@/widgets/community-qna-feed-section';

export const ErrorBoundary = RouteErrorBoundary;

const Page = () => {
  const router = useRouter();
  const { requireLogin } = useLoginRequired();
  const scrollY = useSharedValue(0);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollY.value = e.nativeEvent.contentOffset.y;
    },
    [scrollY]
  );

  const handlePressWrite = useCallback(() => {
    requireLogin(() => router.push('/community-qna-write'));
  }, [requireLogin, router]);

  return (
    <Container>
      <CommunityQnAFeed onScroll={handleScroll} />
      <WriteFab label="글 올리기" onPress={handlePressWrite} scrollY={scrollY} testID="community-write-fab" />
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
