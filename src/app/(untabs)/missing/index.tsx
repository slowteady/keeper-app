import { styled, View } from 'tamagui';

import { MissingListSection } from '@/widgets/missing-section';

const Page = () => {
  return (
    <Container>
      <MissingListSection />
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  flex: 1,
  pt: 12,
  bg: '$pageBackground'
});
