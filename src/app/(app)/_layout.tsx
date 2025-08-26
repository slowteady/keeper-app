import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { useToastController } from '@tamagui/toast';
import { Route, router } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { useAtomValue } from 'jotai';
import { useResetAtom } from 'jotai/utils';
import { Dimensions, Pressable, StyleSheet, Text } from 'react-native';
import ErrorBoundary from 'react-native-error-boundary';
import { Stack, YStack } from 'tamagui';

import { Chat } from '@/components/atoms/icons/outline';
import { useDeleteUserMutation, useLogoutMutation } from '@/domains/auth/services';
import { userAtom } from '@/domains/auth/stores';
import { Button } from '@/shared/components';
import { Heart, Location, Login } from '@/shared/components/atoms/icons/outline';
import { MainHeader } from '@/shared/components/organisms/MainHeader';
import { theme } from '@/shared/constants/theme.constants';
import { useLayout } from '@/shared/hooks/useLayout';
import { removeToken } from '@/shared/utils/token.utils';

import ErrorFallback from '../ErrorFallback';

const DrawerLayout = () => {
  const drawerWidth = (Dimensions.get('window').width * 2) / 3;

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Drawer
        drawerContent={(props: any) => <MenuList {...props} />}
        screenOptions={{
          drawerPosition: 'right',
          drawerType: 'front',
          drawerStyle: { width: drawerWidth }
        }}
      >
        <Drawer.Screen name="index" options={{ header: () => <MainHeader /> }} />
      </Drawer>
    </ErrorBoundary>
  );
};

export default DrawerLayout;

const MenuList = ({ ...props }: DrawerContentComponentProps) => {
  const { top, bottom } = useLayout();
  const { show } = useToastController();
  const user = useAtomValue(userAtom);
  const resetUser = useResetAtom(userAtom);

  const { mutateAsync: logoutMutate, isPending: isLogoutPending } = useLogoutMutation();
  const { mutateAsync: deleteUserMutate, isPending: isDeleteUserPending } = useDeleteUserMutation();

  const handleRoute = (link: Route) => {
    props.navigation.closeDrawer();
    setTimeout(() => router.push(link), 500);
  };

  const handlePress = async (type: 'logout' | 'withdraw') => {
    // TODO
    // [ ] Drawer -> 바텀 네비게이션으로 변경
    // [ ] 로그아웃 -> 로그인 페이지로 인계 안되도록 수정
    // [ ] 회원탈퇴 -> 로그인 페이지로 인계 안되도록 수정

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
  };

  const userText = `로그인 된 유저: ${user.nickname}`;
  const headerTop = top + 39;

  return (
    <YStack mt={headerTop} flex={1} justify="space-between" px={24}>
      <YStack flex={1} gap={32}>
        <Pressable style={styles.menuWrap} onPress={() => handleRoute('/abandonments')}>
          <Heart width={24} height={24} color={theme.colors.black[900]} />
          <Text style={styles.text}>입양공고</Text>
        </Pressable>
        <Pressable style={styles.menuWrap} onPress={() => handleRoute('/shelters')}>
          <Location width={24} height={24} color={theme.colors.black[900]} />
          <Text style={styles.text}>보호소</Text>
        </Pressable>
        <Pressable style={styles.menuWrap} onPress={() => handleRoute('/login')}>
          <Login width={24} height={24} color={theme.colors.black[900]} />
          <Text style={styles.text}>로그인</Text>
        </Pressable>
        <Pressable style={styles.menuWrap} onPress={() => handleRoute('/community')}>
          <Chat width={24} height={24} color={theme.colors.black[900]} />
          <Text style={styles.text}>커뮤니티</Text>
        </Pressable>
      </YStack>

      <Stack pb={bottom} gap={12}>
        <Text style={styles.text}>{userText}</Text>
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

const styles = StyleSheet.create({
  menuWrap: {
    display: 'flex',
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center'
  },
  text: {
    fontSize: 17,
    lineHeight: 19,
    fontWeight: '500',
    color: theme.colors.black[800]
  }
});
