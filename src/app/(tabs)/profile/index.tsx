import { styled, View } from 'tamagui';

import { MENU_ITEMS, useProfileImage, useProfileMain } from '@/features/profile';
import { RouteErrorBoundary } from '@/shared/ui';
import { ProfileContentSection, ProfileHeader, ProfileMenuList } from '@/widgets/profile';

export const ErrorBoundary = RouteErrorBoundary;

const Page = () => {
  const { user, isLoading, promptReview, shareApp, goLogin, goAccount, goLike, goActivity, goMenu } = useProfileMain();
  const { changeProfileImage } = useProfileImage();

  return (
    <Container>
      <ProfileHeader
        user={user}
        isLoading={isLoading}
        onLogin={() => goLogin()}
        onAccount={goAccount}
        onLike={goLike}
        onActivity={goActivity}
        onChangeProfileImage={changeProfileImage}
      />
      <ProfileContentSection onReview={promptReview} onShare={shareApp} />
      <ProfileMenuList items={MENU_ITEMS} isLoggedIn={Boolean(user)} onSelect={goMenu} />
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
