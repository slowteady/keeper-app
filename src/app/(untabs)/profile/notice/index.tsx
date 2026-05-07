import { styled, View } from 'tamagui';

import { ProfileNoticeScene } from '@/widgets/profile';

const Page = () => {
  return (
    <Container>
      <ProfileNoticeScene />
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
