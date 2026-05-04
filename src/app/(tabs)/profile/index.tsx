import { styled, View } from 'tamagui';

import { MENU_ITEMS, useProfileImage, useProfileMain } from '@/features/profile';
import { RouteErrorBoundary } from '@/shared/ui';
import { ProfileContentSection, ProfileHeader, ProfileMenuList } from '@/widgets/profile';

export const ErrorBoundary = RouteErrorBoundary;

const Page = () => {
  const { user, isLoading, promptReview, shareApp, goLogin, goAccount, goMenu } = useProfileMain();
  const { changeProfileImage } = useProfileImage();

  return (
    <Container>
      <ProfileHeader
        user={user}
        isLoading={isLoading}
        onLogin={() => goLogin()}
        onAccount={goAccount}
        onChangeProfileImage={changeProfileImage}
      />
      <ProfileContentSection onReview={promptReview} onShare={shareApp} />
      <ProfileMenuList items={MENU_ITEMS} onSelect={goMenu} />
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
