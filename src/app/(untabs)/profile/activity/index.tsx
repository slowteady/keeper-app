import { styled, View } from 'tamagui';

import { ProfileActivityScene } from '@/widgets/profile';

const Page = () => {
  return (
    <Container>
      <ProfileActivityScene />
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
