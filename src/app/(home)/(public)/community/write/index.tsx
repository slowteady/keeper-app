import { styled, View } from 'tamagui';

import { PostEditor } from '@/widgets';

const Page = () => {
  return (
    <Container>
      <PostEditor />
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$white900',
  flex: 1
});
