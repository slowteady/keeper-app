import { styled, Text, View } from 'tamagui';

// TODO
// [ ] write page ui 구현

const Page = () => {
  return (
    <Container>
      <Text>WritePage</Text>
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  flex: 1,
  bg: '$white900'
});
