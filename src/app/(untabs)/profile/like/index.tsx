import { styled, View } from 'tamagui';

import { ProfileLikeScene } from '@/widgets/profile';

const Page = () => {
  return (
    <Container>
      <ProfileLikeScene />
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
