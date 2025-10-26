import { styled, View } from 'tamagui';

import { Community } from '@/widgets';

const Page = () => {
  return (
    <Container>
      <Community />
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
