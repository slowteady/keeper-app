import { ScrollView, styled, View } from 'tamagui';

import { MENU_SECTIONS, useProfileImage, useProfileMain } from '@/features/profile';
import { RouteErrorBoundary } from '@/shared/ui';
import { ProfileHeader, ProfileMenuList } from '@/widgets/profile';

export const ErrorBoundary = RouteErrorBoundary;

const Page = () => {
  const { user, isLoading, promptReview, shareApp, goLogin, goAccount, goLike, goActivity, goMenu, goSettingMenu } =
    useProfileMain();
  const { changeProfileImage, isPending: isUpdatingImage } = useProfileImage();

  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 } as never}>
        <ProfileHeader
          user={user}
          isLoading={isLoading}
          isUpdatingImage={isUpdatingImage}
          onLogin={() => goLogin()}
          onAccount={goAccount}
          onLike={goLike}
          onActivity={goActivity}
          onChangeProfileImage={changeProfileImage}
        />
        <ProfileMenuList
          sections={MENU_SECTIONS}
          isLoggedIn={Boolean(user)}
          onNavigate={goMenu}
          onReview={promptReview}
          onShare={shareApp}
          onLocationSettings={goSettingMenu}
        />
      </ScrollView>
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
