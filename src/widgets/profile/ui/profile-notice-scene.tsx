import { FlashList } from '@shopify/flash-list';
import { styled, View, YStack } from 'tamagui';

import { ProfileEmptyState } from './profile-empty-state';

export const ProfileNoticeScene = () => {
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
  <ProfileEmptyState text="공지사항이 없어요" description="새로운 소식이 등록되면 알려드릴게요" />
);

const Container = styled(YStack, {
  flex: 1,
  py: 16
});
