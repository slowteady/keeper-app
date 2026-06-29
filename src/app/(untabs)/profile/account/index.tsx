import { router } from 'expo-router';
import { ScrollView, Separator, styled, Text, View, YStack } from 'tamagui';

import { useCurrentUser, useLogout } from '@/features/auth';
import { useProfileImage } from '@/features/profile';
import { SCREEN_GUTTER } from '@/shared/lib';
import { Menu } from '@/shared/ui';
import { AccountHeader } from '@/widgets/profile';

const Page = () => {
  const { user } = useCurrentUser();
  const { logout, isPending: isLoggingOut } = useLogout();
  const { changeProfileImage, isPending: isUpdatingImage } = useProfileImage();

  if (!user) return null;

  return (
    <Container>
      <ScrollView py={32}>
        <View px={SCREEN_GUTTER} mb={24}>
          <AccountHeader user={user} isUpdatingImage={isUpdatingImage} onChangeProfileImage={changeProfileImage} />
        </View>

        <Separator borderColor="$backgroundDefault" mb={24} />

        <YStack px={SCREEN_GUTTER} mb={24}>
          <NavText mb={4}>계정설정</NavText>
          <Menu label="닉네임 설정" style={{ paddingVertical: 16 }} onPress={() => router.push('/nickname')} />
          <Menu label="차단 관리" style={{ paddingVertical: 16 }} onPress={() => router.push('/profile/blocks')} />
        </YStack>

        <Separator borderColor="$backgroundDefault" mb={24} />

        <YStack px={SCREEN_GUTTER}>
          <Menu
            label="로그아웃"
            style={{ paddingVertical: 14 }}
            onPress={logout}
            isLoading={isLoggingOut}
            testID="account-logout"
          />
          <Menu
            label="회원탈퇴"
            labelColor="$errorMain"
            style={{ paddingVertical: 14 }}
            onPress={() => router.push('/withdraw')}
            testID="account-withdraw"
          />
        </YStack>
      </ScrollView>
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});

const NavText = styled(Text, {
  fontSize: 14,
  fontWeight: '500',
  lineHeight: 18,
  letterSpacing: -0.25,
  color: '$black500'
});
