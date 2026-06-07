import { FlashList } from '@shopify/flash-list';
import { styled, View, YStack } from 'tamagui';

import { ProfileEmptyState } from './profile-empty-state';

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
  <ProfileEmptyState text="문의 내역이 없어요" description="문의한 내용과 답변을 여기에서 확인할 수 있어요" />
);

const Container = styled(YStack, {
  flex: 1,
  bg: '$pageBackground'
});
