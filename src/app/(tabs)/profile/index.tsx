import { styled, View } from 'tamagui';

import { MENU_ITEMS, useProfileMain } from '@/features/profile';
import { RouteErrorBoundary } from '@/shared/ui';
import { ProfileContentSection, ProfileHeader, ProfileMenuList } from '@/widgets/profile';

export const ErrorBoundary = RouteErrorBoundary;

const Page = () => {
  const { user, isLoading, version, logout, promptReview, shareApp, goLogin, goAccount, goMenu } = useProfileMain();

  return (
    <Container>
      <ProfileHeader user={user} isLoading={isLoading} onLogout={logout} onLogin={goLogin} onAccount={goAccount} />
      <ProfileContentSection version={version} onReview={promptReview} onShare={shareApp} />
      <ProfileMenuList items={MENU_ITEMS} onSelect={goMenu} />
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
