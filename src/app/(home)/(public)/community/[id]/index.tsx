import { styled, View } from 'tamagui';

import { CommunityAdoptDetailFeed, useCommunityAdoptDetailFeed } from '@/widgets';

const Page = () => {
  const vm = useCommunityAdoptDetailFeed();

  return (
    <Container>
      <CommunityAdoptDetailFeed vm={vm} />
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
