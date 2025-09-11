import { styled, View } from 'tamagui';

import { CommunityWriteTemplate } from '@/domains/community';

const Page = () => {
  return (
    <Container>
      <CommunityWriteTemplate />
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  flex: 1,
  bg: '$white900'
});
