import { styled, View } from 'tamagui';

import { useCurrentUser } from '@/features/auth';
import { ProfileContentSection, ProfileHeader, ProfileMenuList } from '@/widgets/profile';

const Page = () => {
  const { user, isLoading } = useCurrentUser();

  return (
    <Container>
      <ProfileHeader user={user} isLoading={isLoading} />
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
