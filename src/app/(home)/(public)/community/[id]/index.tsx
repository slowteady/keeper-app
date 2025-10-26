import { styled, Text, View } from 'tamagui';

const Page = () => {
  return (
    <Container>
      <Text>CommunityDetailPage</Text>
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
