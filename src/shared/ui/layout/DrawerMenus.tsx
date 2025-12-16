import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { useToastController } from '@tamagui/toast';
import { Route, router } from 'expo-router';
import { useCallback } from 'react';
import { Pressable } from 'react-native';
import { styled, Text, useTheme, XStack, YStack } from 'tamagui';

import { useDeleteUser, useLogout } from '@/entities';
import { clearUserContext, removeToken } from '@/shared/lib';
import { useLayout } from '@/shared/model';
import { Chat, Heart, Location, Login } from '@/shared/ui/icons/outline';

interface MenuItem {
  icon: React.ComponentType<{ width: number; height: number; color: string }>;
  label: string;
  route: Route;
}

const MENU_ITEMS: MenuItem[] = [
  { icon: Heart, label: '입양공고', route: '/adopt' },
  { icon: Location, label: '보호소', route: '/shelter' },
  { icon: Chat, label: '커뮤니티', route: '/community' },
  { icon: Login, label: '로그인', route: '/login' }
];

export const DrawerMenus = ({ ...props }: DrawerContentComponentProps) => {
  const { black900 } = useTheme();
  const { show } = useToastController();
  const { top, bottom } = useLayout();

  const { mutateAsync: logoutMutate, isPending: isLogoutPending } = useLogout();
  const { mutateAsync: deleteUserMutate, isPending: isDeleteUserPending } = useDeleteUser();

  const handleRoute = useCallback(
    (link: Route) => {
      props.navigation.closeDrawer();
      setTimeout(() => router.push(link), 100);
    },
    [props.navigation]
  );

  const handlePress = useCallback(
    async (type: 'logout' | 'withdraw') => {
      try {
        const mutateAsync = type === 'logout' ? logoutMutate : deleteUserMutate;
        const successMessage = type === 'logout' ? '로그아웃이 완료되었어요' : '회원탈퇴가 완료되었어요';

        const response = await mutateAsync();
        const isSuccess = response.data.data;
        if (!isSuccess) return;

        await removeToken();
        clearUserContext();
        show(successMessage, { customData: { status: 'success' } });

        props.navigation.closeDrawer();
        if (router.canDismiss()) router.dismissAll();
      } catch {
        show('요청에 실패했어요. 다시 시도해주세요.', { customData: { status: 'fail' } });
      }
    },
    [deleteUserMutate, logoutMutate, props.navigation, show]
  );

  const renderMenuItem = ({ icon: Icon, label, route }: MenuItem) => {
    return (
      <Pressable key={label} onPress={() => handleRoute(route)}>
        <XStack items="center" gap={20}>
          <Icon width={24} height={24} color={black900.val} />
          <StyledText>{label}</StyledText>
        </XStack>
      </Pressable>
    );
  };

  const headerTop = top + 39;

  return (
    <YStack mt={headerTop} flex={1} justify="space-between" px={24}>
      <YStack flex={1} gap={32}>
        {MENU_ITEMS.map(renderMenuItem)}
      </YStack>
    </YStack>
  );
};

const StyledText = styled(Text, {
  fontSize: 17,
  lineHeight: 19,
  fontWeight: '500',
  color: '$black800'
});
