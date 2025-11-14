import { styled, View } from 'tamagui';

import { CreatePost } from '@/features';

const Page = () => {
  return (
    <Container>
      <CreatePost />
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
