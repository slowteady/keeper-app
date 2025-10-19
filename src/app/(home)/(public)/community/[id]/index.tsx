import { styled, Text, View } from 'tamagui';

const Page = () => {
  return (
    <View>
      <Text>CommunityDetailPage</Text>
    </View>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
