import { FlashList } from '@shopify/flash-list';
import { styled, View, YStack } from 'tamagui';

import { FeedNodata } from '@/shared/ui';

export const ProfileNoticeScene = () => {
  return (
    <Container>
      <FlashList
        data={[]}
        renderItem={({ item }) => <View></View>}
        ListEmptyComponent={<EmptyComponent />}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </Container>
  );
};

const EmptyComponent = () => {
  return (
    <View flex={1} items="center" justify="center">
      <FeedNodata text="아직 공지사항이 없어요!" />
    </View>
  );
};

const Container = styled(YStack, {
  flex: 1,
  py: 16
});
