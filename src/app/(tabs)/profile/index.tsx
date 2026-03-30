import { styled, View } from 'tamagui';

import { useCurrentUser, useLogout } from '@/features/auth';
import { ProfileContentSection, ProfileHeader, ProfileMenuList } from '@/widgets/profile';

const Page = () => {
  const { user, isLoading } = useCurrentUser();
  const { logout } = useLogout();

  return (
    <Container>
      <ProfileHeader user={user} isLoading={isLoading} onLogout={logout} />
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
