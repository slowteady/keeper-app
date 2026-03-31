import { ChevronRight } from '@tamagui/lucide-icons';
import * as Application from 'expo-application';
import { router } from 'expo-router';
import { ScrollView, Separator, styled, Text, View, XStack, YStack } from 'tamagui';

import { useCurrentUser } from '@/features/auth';
import { usePermission } from '@/shared/model';
import { Menu } from '@/shared/ui';
import { AccountHeader } from '@/widgets/profile';

const Page = () => {
  const { user } = useCurrentUser();
  // TODO: Phase 5에서 features/profile/change-profile-image로 이동
  const changeProfileImage = () => {};
  const permission = usePermission();

  if (!user) return null;

  const version = Application.nativeApplicationVersion;

  return (
    <Container>
      <ScrollView py={32}>
        <View px={20} mb={24}>
          <AccountHeader user={user} onChangeProfileImage={changeProfileImage} />
        </View>

        <Separator borderColor="$backgroundDefault" mb={24} />

        <YStack px={20} mb={8}>
          <NavText mb={4}>계정설정</NavText>
          <Menu
            label="닉네임 설정"
            style={{ paddingVertical: 16, marginBottom: 12 }}
            onPress={() => router.push('/nickname')}
          />
          <XStack items="center" justify="space-between" mb={12}>
            <Label>위치 설정</Label>
            <SettingButton onPress={permission.actions.goSettingMenu}>
              <Text fontSize={12} fontWeight="600" lineHeight={14} letterSpacing={-0.25} color="$black500">
                설정하기
              </Text>
              <ChevronRight size={12} color="$black500" mx={-4} />
            </SettingButton>
          </XStack>
          <Menu label="회원탈퇴" style={{ paddingVertical: 16 }} onPress={() => router.push('/withdraw')} />
        </YStack>

        <Separator borderColor="$backgroundDefault" mb={24} />

        <YStack px={20}>
          <NavText mb={6}>약관 및 정책</NavText>
          <Menu label="이용약관" style={{ paddingVertical: 14 }} onPress={() => router.push('/terms')} />
          <Menu
            label="개인정보처리방침"
            style={{ paddingVertical: 14, marginBottom: 14 }}
            onPress={() => router.push('/privacy')}
          />
          <YStack gap={6}>
            <Label>버전 정보</Label>
            <Text fontSize={14} fontWeight="500" lineHeight={16} letterSpacing={-0.25} color="$white600">
              현재버전 {version}
            </Text>
          </YStack>
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
  gap: 4,
  rounded: 6,
  px: 10,
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
