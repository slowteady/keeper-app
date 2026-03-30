import { Text, XStack, YStack } from 'tamagui';

import { UserDto } from '@/entities/auth';
import { UserAvatar } from '@/entities/profile';
import { useAccount } from '@/features/auth';

export const AccountHeader = ({ user }: { user: UserDto }) => {
  const { changeProfileImage } = useAccount();

  const createdAt = `25.09.23`;
  const signupType = '카카오';

  return (
    <XStack gap={20}>
      <UserAvatar image={user.image} onPressEdit={changeProfileImage} onPressAdd={changeProfileImage} />
      <YStack>
        <Text fontSize={20} fontWeight="500" color="$black900" lineHeight={22} mb={12}>
          {user.nickname}님
        </Text>
        <Text fontSize={13} lineHeight={15} fontWeight="500" color="$black600" mb={10}>
          {user.email}
        </Text>
        <Text fontSize={12} lineHeight={14} fontWeight="500" color="$white600" letterSpacing={-0.25}>
          {createdAt} {signupType} 간편 가입
        </Text>
      </YStack>
    </XStack>
  );
};
