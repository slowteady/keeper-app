import { styled, Text, View, XStack, YStack } from 'tamagui';

import { UserDto } from '@/entities/auth';
import { EmptyAvatar, UserAvatar } from '@/entities/profile';
import { Skeleton } from '@/shared/ui';

type ProfileHeaderProps = {
  user?: UserDto | null;
  isLoading: boolean;
  onLogin: () => void;
  onAccount: () => void;
  onChangeProfileImage: () => void;
};

export const ProfileHeader = ({ user, isLoading, onLogin, onAccount, onChangeProfileImage }: ProfileHeaderProps) => {
  return (
    <View px={20} mb={24} pt={40}>
      {isLoading ? (
        <XStack gap={16} items="flex-start">
          <Skeleton style={{ width: 72, height: 72, borderRadius: 8 }} />
          <YStack flex={1} gap={0} py={2}>
            <XStack items="flex-start" justify="space-between" gap={12}>
              <Skeleton style={{ width: 120, height: 20, borderRadius: 4 }} />
              <Skeleton style={{ width: 50, height: 13, borderRadius: 4 }} />
            </XStack>
            <Skeleton style={{ width: 180, height: 13, borderRadius: 4, marginTop: 12 }} />
          </YStack>
        </XStack>
      ) : user ? (
        <XStack gap={16} items="flex-start">
          <UserAvatar image={user.image} onPressAdd={onChangeProfileImage} onPressEdit={onChangeProfileImage} />

          <YStack flex={1} gap={0} py={2}>
            <XStack items="flex-start" justify="space-between" gap={12}>
              <Text fontSize={20} lineHeight={20} fontWeight="500" color="$black900">
                {user.nickname}님
              </Text>
              <LoginButton onPress={onAccount}>
                <Text fontSize={13} lineHeight={13} fontWeight="600" color="$black600">
                  계정관리
                </Text>
              </LoginButton>
            </XStack>
            <Text fontSize={13} lineHeight={13} fontWeight="500" color="$black500">
              {user.email}
            </Text>
          </YStack>
        </XStack>
      ) : (
        <XStack gap={16} items="flex-start">
          <EmptyAvatar onPress={onLogin} />
          <YStack flex={1} gap={0} py={2}>
            <XStack items="flex-start" justify="space-between" gap={12}>
              <Text fontSize={20} lineHeight={20} fontWeight="500" color="$black900">
                반갑습니다:)
              </Text>
              <LoginButton onPress={onLogin}>
                <Text fontSize={13} lineHeight={13} fontWeight="600" color="$black600">
                  로그인
                </Text>
              </LoginButton>
            </XStack>
            <Text fontSize={13} lineHeight={13} fontWeight="500" color="$black500" letterSpacing={-0.39}>
              로그인 후 이용 가능해요
            </Text>
          </YStack>
        </XStack>
      )}
    </View>
  );
};

const LoginButton = styled(View, {
  borderWidth: 1,
  borderColor: '$white600',
  rounded: 34,
  px: 14,
  py: 10
});
