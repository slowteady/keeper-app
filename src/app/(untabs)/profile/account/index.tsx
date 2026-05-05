import { router } from 'expo-router';
import { ScrollView, Separator, styled, Text, View, XStack, YStack } from 'tamagui';

import { useCurrentUser, useLogout } from '@/features/auth';
import { useProfileImage } from '@/features/profile';
import { usePermission } from '@/shared/model';
import { Menu } from '@/shared/ui';
import { AccountHeader } from '@/widgets/profile';

const Page = () => {
  const { user } = useCurrentUser();
  const { logout } = useLogout();
  const { changeProfileImage } = useProfileImage();
  const { goSettingMenu } = usePermission();

  if (!user) return null;

  return (
    <Container>
      <ScrollView py={32}>
        <View px={20} mb={24}>
          <AccountHeader user={user} onChangeProfileImage={changeProfileImage} />
        </View>

        <Separator borderColor="$backgroundDefault" mb={24} />

        <YStack px={20} mb={24}>
          <NavText mb={4}>계정설정</NavText>
          <Menu label="닉네임 설정" style={{ paddingVertical: 16 }} onPress={() => router.push('/nickname')} />
        </YStack>

        <YStack px={20} mb={24}>
          <NavText mb={4}>환경설정</NavText>
          <XStack items="center" justify="space-between" py={16}>
            <Label>위치 설정</Label>
            <SettingButton onPress={goSettingMenu}>
              <Text fontSize={12} fontWeight="600" lineHeight={14} letterSpacing={-0.25} color="$black500">
                설정하기
              </Text>
            </SettingButton>
          </XStack>
        </YStack>

        <Separator borderColor="$backgroundDefault" mb={24} />

        <YStack px={20}>
          <Menu label="로그아웃" style={{ paddingVertical: 14 }} onPress={logout} />
          <Menu
            label="회원탈퇴"
            labelColor="$errorMain"
            style={{ paddingVertical: 14 }}
            onPress={() => router.push('/withdraw')}
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

const Label = styled(Text, {
  fontSize: 16,
  fontWeight: '500',
  lineHeight: 21,
  color: '$black900',
  letterSpacing: -0.25
});

const SettingButton = styled(XStack, {
  items: 'center',
  justify: 'center',
  rounded: 6,
  px: 12,
  py: 8,
  borderWidth: 1,
  borderColor: '$white600'
});

const NavText = styled(Text, {
  fontSize: 14,
  fontWeight: '500',
  lineHeight: 18,
  letterSpacing: -0.25,
  color: '$black500'
});
