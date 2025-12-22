import { router } from 'expo-router';
import { Avatar, styled, Text, View, XStack, YStack } from 'tamagui';

import { useCurrentUser, useLogout } from '@/features';

export const ProfileUserSection = () => {
  const { data: userData, flags: userFlags } = useCurrentUser();
  const { actions: logoutActions } = useLogout();

  const { nickname, email, image } = userData?.user || {};
  const grade = '일반회원';

  return (
    <Container>
      {userFlags.isLoggedIn ? (
        <>
          <StyledAvatar>
            <Avatar.Image source={{ uri: image }} />
            <Avatar.Fallback backgroundColor="$black400" />
          </StyledAvatar>

          <YStack flex={1}>
            <Text fontSize={20} fontWeight="500" color="$black900" mb={6}>
              {nickname}님
            </Text>
            <View px={6} py={4} mb={10} bg="$white850" rounded={3} self="baseline">
              <Text fontSize={11} fontWeight="500" color="$black500" letterSpacing={-0.25}>
                {grade}
              </Text>
            </View>
            <Text fontSize={13} fontWeight="500" color="$black500">
              {email}
            </Text>
          </YStack>

          <YStack gap={24}>
            <LogoutButton onPress={logoutActions.executeLogout}>
              <Text fontSize={13} fontWeight="600" color="$black600">
                로그아웃
              </Text>
            </LogoutButton>
            <View self="center">
              <Text fontSize={13} fontWeight="600" color="$white600">
                계정관리
              </Text>
            </View>
          </YStack>
        </>
      ) : (
        <NoAuthSection onPress={() => router.push({ pathname: '/login', params: { redirect: '/profile' } })} />
      )}
    </Container>
  );
};

const NoAuthSection = ({ onPress }: { onPress: () => void }) => {
  return (
    <View onPress={onPress} hitSlop={12}>
      <Text fontSize={32} lineHeight={38} fontWeight="600" color="$black900">
        {`로그인 >`}
      </Text>
    </View>
  );
};

const Container = styled(XStack, {
  gap: 16
});

const StyledAvatar = styled(Avatar, {
  size: 72,
  rounded: 8
});

const LogoutButton = styled(View, {
  borderWidth: 1,
  borderColor: '$white600',
  rounded: 34,
  px: 14,
  py: 10
});
