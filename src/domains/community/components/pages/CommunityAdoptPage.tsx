import { styled, YStack } from 'tamagui';

import { CommunityAdoptTemplate } from '../templates';

export const CommunityAdoptPage = () => {
  return (
    <Container>
      <CommunityAdoptTemplate />
    </Container>
  );
};

const Container = styled(YStack, {
  flex: 1,
  bg: '$backgroundDefault',
  px: 20,
  py: 16
});
