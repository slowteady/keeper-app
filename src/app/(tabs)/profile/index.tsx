import { styled, View } from 'tamagui';

import { useCurrentUser } from '@/features/auth';
import { ProfileContentSection, ProfileHeader, ProfileMenuList } from '@/widgets/profile';

const Page = () => {
  const { data, flags } = useCurrentUser();

  return (
    <Container>
      <ProfileHeader user={data.user} isLoading={flags.isLoading} />
      <ProfileContentSection />
      <ProfileMenuList />
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
