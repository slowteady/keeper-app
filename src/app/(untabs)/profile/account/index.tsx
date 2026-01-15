import { ScrollView, Separator, styled, View } from 'tamagui';

import { useCurrentUser } from '@/features/auth';
import { AccountHeader } from '@/widgets/profile';

const Page = () => {
  const { data } = useCurrentUser();
  const user = data.user;
  if (!user) return null;

  return (
    <Container>
      <ScrollView py={32}>
        <View px={20} mb={24}>
          <AccountHeader user={user} />
        </View>
        <Separator borderColor="$backgroundDefault" />
      </ScrollView>
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
