import { useScrollToTop } from '@react-navigation/native';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { useRef } from 'react';
import { styled, View, YStack } from 'tamagui';

import { FeedNodata } from '@/shared/ui';

export const CommunityLifeFeed = () => {
  const scrollRef = useRef<FlashListRef<unknown>>(null);
  useScrollToTop(scrollRef);

  return (
    <Container>
      <FlashList
        ref={scrollRef}
        data={[]}
        renderItem={() => <View />}
        ListEmptyComponent={<EmptyComponent />}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </Container>
  );
};

const EmptyComponent = () => {
  return (
    <View flex={1} items="center" justify="center">
      <FeedNodata text="아직 게시물이 없어요!" />
    </View>
  );
};

const Container = styled(YStack, {
  flex: 1,
  py: 16
});
