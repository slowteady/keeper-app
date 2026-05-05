import { FlashList } from '@shopify/flash-list';
import { styled, View, YStack } from 'tamagui';

import { FeedNodata } from '@/shared/ui';

export const InquiryHistoryScene = () => {
  return (
    <Container>
      <FlashList
        data={[]}
        renderItem={() => <View />}
        ListEmptyComponent={<EmptyComponent />}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </Container>
  );
};

const EmptyComponent = () => (
  <View flex={1} items="center" justify="center">
    <FeedNodata text="아직 문의 내역이 없어요!" />
  </View>
);

const Container = styled(YStack, {
  flex: 1,
  bg: '$pageBackground'
});
