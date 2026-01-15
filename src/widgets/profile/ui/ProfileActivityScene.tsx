import { styled, View, YStack } from 'tamagui';

import { FeedNodata } from '@/shared/ui';

export const ProfileActivityScene = () => {
  return (
    <Container>
      <View items="center" justify="center" flex={1}>
        <FeedNodata text="아직 활동이 없어요!" />
      </View>
    </Container>
  );
};

const Container = styled(YStack, {
  flex: 1,
  py: 16
});
