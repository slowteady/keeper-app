import { FlashList } from '@shopify/flash-list';
import { styled, View, YStack } from 'tamagui';

import { useScrollUpButton } from '@/shared/model';
import { FeedNodata, ScrollUpButton } from '@/shared/ui';

export const CommunityLifeFeed = () => {
  const { handleScroll, handlePressButton, isButtonVisible, scrollRef } = useScrollUpButton();

  return (
    <Container>
      <FlashList
        ref={scrollRef}
        onScroll={handleScroll}
        data={[]}
        renderItem={({ item }) => <View></View>}
        ListEmptyComponent={<EmptyComponent />}
        contentContainerStyle={{ flexGrow: 1 }}
      />

      <ScrollUpButton visible={isButtonVisible} onPress={handlePressButton} />
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
