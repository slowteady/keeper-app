import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { useToastController } from '@tamagui/toast';
import { Route, router } from 'expo-router';
import { useAtomValue } from 'jotai';
import { useResetAtom } from 'jotai/utils';
import { useCallback } from 'react';
import { Pressable } from 'react-native';
import { Stack, styled, Text, useTheme, YStack } from 'tamagui';

import { Chat } from '@/components/atoms/icons/outline';
import { useDeleteUserMutation, useLogoutMutation, userAtom } from '@/domains/auth';
import { Button } from '@/shared/components';
import { Heart, Location, Login } from '@/shared/components/atoms/icons/outline';
import { useLayout } from '@/shared/hooks';
import { removeToken } from '@/shared/utils';

// TODO
// [ ] Drawer -> 바텀 네비게이션으로 변경
// [ ] 로그아웃 -> 로그인 페이지로 인계 안되도록 수정
// [ ] 회원탈퇴 -> 로그인 페이지로 인계 안되도록 수정

export const DrawerMenus = ({ ...props }: DrawerContentComponentProps) => {
  const user = useAtomValue(userAtom);
  const resetUser = useResetAtom(userAtom);

  const { black900 } = useTheme();
  const { show } = useToastController();
  const { top, bottom } = useLayout();

  const { mutateAsync: logoutMutate, isPending: isLogoutPending } = useLogoutMutation();
  const { mutateAsync: deleteUserMutate, isPending: isDeleteUserPending } = useDeleteUserMutation();

  const handleRoute = useCallback(
    (link: Route) => {
      props.navigation.closeDrawer();
      setTimeout(() => router.push(link), 500);
    },
    [props.navigation]
  );

  const handlePress = useCallback(
    async (type: 'logout' | 'withdraw') => {
      try {
        if (type === 'logout') {
          const response = await logoutMutate();
          const isSuccess = response.data.data;
          if (!isSuccess) return;

          await removeToken();
          resetUser();
          show('로그아웃이 완료되었어요', { customData: { status: 'success' } });

          props.navigation.closeDrawer();
          if (router.canDismiss()) router.dismissAll();
        } else if (type === 'withdraw') {
          const response = await deleteUserMutate();
          const isSuccess = response.data.data;
          if (!isSuccess) return;

          await removeToken();
          resetUser();
          show('회원탈퇴가 완료되었어요', { customData: { status: 'success' } });

          props.navigation.closeDrawer();
          if (router.canDismiss()) router.dismissAll();
        }
      } catch {
        show('요청에 실패했어요. 다시 시도해주세요.', { customData: { status: 'fail' } });
      }
    },
    [deleteUserMutate, logoutMutate, props.navigation, resetUser, show]
  );

  const userText = `로그인 된 유저: ${user.nickname}`;
  const headerTop = top + 39;

  return (
    <YStack mt={headerTop} flex={1} justify="space-between" px={24}>
      <YStack flex={1} gap={32}>
        <Menu onPress={() => handleRoute('/abandonments')}>
          <Heart width={24} height={24} color={black900.val} />
          <StyledText>입양공고</StyledText>
        </Menu>
        <Menu onPress={() => handleRoute('/shelters')}>
          <Location width={24} height={24} color={black900.val} />
          <StyledText>보호소</StyledText>
        </Menu>
        <Menu onPress={() => handleRoute('/login')}>
          <Login width={24} height={24} color={black900.val} />
          <StyledText>로그인</StyledText>
        </Menu>
        <Menu onPress={() => handleRoute('/login')}>
          <Chat width={24} height={24} color={black900.val} />
          <StyledText>커뮤니티</StyledText>
        </Menu>
      </YStack>

      <Stack pb={bottom} gap={12}>
        <StyledText>{userText}</StyledText>
        <Button onPress={() => handlePress('logout')} disabled={isLogoutPending} isLoading={isLogoutPending}>
          로그아웃
        </Button>
        <Button onPress={() => handlePress('withdraw')} disabled={isDeleteUserPending} isLoading={isDeleteUserPending}>
          회원탈퇴
        </Button>
      </Stack>
    </YStack>
  );
};

const Menu = styled(Pressable, {
  display: 'flex',
  flexDirection: 'row',
  gap: 20,
  items: 'center'
});
const StyledText = styled(Text, {
  fontSize: 17,
  lineHeight: 19,
  fontWeight: '500',
  color: '$black800'
});
