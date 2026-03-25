import { router } from 'expo-router';
import { styled, Text, View, XStack, YStack } from 'tamagui';

import { UserDto } from '@/entities/auth';
import { EmptyAvatar, UserAvatar } from '@/entities/profile';
import { useLogout } from '@/features/auth';
import { Skeleton } from '@/shared/ui';

interface ProfileHeaderProps {
  user?: UserDto | null;
  isLoading: boolean;
}

export const ProfileHeader = ({ user, isLoading }: ProfileHeaderProps) => {
  const { logout } = useLogout();

  const navigateToLogin = () => {
    router.push({
      pathname: '/login',
      params: { redirect: '/profile' }
    });
  };

  return (
    <View px={20} mb={24} pt={40}>
      <XStack gap={16}>
        {isLoading ? (
          <Skeleton style={{ width: '100%', height: 72, borderRadius: 8 }} />
        ) : user ? (
          <>
            <UserAvatar image={user.image} onPressAdd={navigateToLogin} />

            <YStack flex={1}>
              <Text fontSize={20} fontWeight="500" color="$black900" mb={6}>
                {user.nickname}님
              </Text>
              <View px={6} py={4} mb={10} bg="$white850" rounded={3} self="baseline">
                <Text fontSize={11} fontWeight="500" color="$black500" letterSpacing={-0.25}>
                  일반회원
                </Text>
              </View>
              <Text fontSize={13} fontWeight="500" color="$black500">
                {user.email}
              </Text>
            </YStack>

            <YStack gap={24}>
              <LogButton onPress={logout}>
                <Text fontSize={13} fontWeight="600" color="$black600">
                  로그아웃
                </Text>
              </LogButton>

              <View
                b={3}
                r={6}
                self="flex-end"
                hitSlop={12}
                onPress={() => router.push({ pathname: '/profile/account' })}
              >
                <Text fontSize={13} fontWeight="600" color="$white600">
                  계정관리
                </Text>
              </View>
            </YStack>
          </>
        ) : (
          <XStack gap={16} flex={1}>
            <EmptyAvatar onPress={navigateToLogin} />
            <YStack gap={12} flex={1}>
              <Text fontSize={20} fontWeight="500" color="$black900" lineHeight={22}>
                반갑습니다 :)
              </Text>
              <Text fontSize={13} fontWeight="500" color="$black500" letterSpacing={-0.25}>
                로그인 후 이용 가능해요
              </Text>
            </YStack>

            <View>
              <LogButton onPress={navigateToLogin}>
                <Text fontSize={13} fontWeight="600" color="$black600">
                  로그인
                </Text>
              </LogButton>
            </View>
          </XStack>
        )}
      </XStack>
    </View>
  );
};

const LogButton = styled(View, {
  borderWidth: 1,
  borderColor: '$white600',
  rounded: 34,
  px: 14,
  py: 10
});
