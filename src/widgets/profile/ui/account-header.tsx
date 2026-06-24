import dayjs from 'dayjs';
import { Text, XStack, YStack } from 'tamagui';

import { SOCIAL_LABEL, UserDto } from '@/entities/auth';
import { UserAvatar } from '@/entities/profile';

type AccountHeaderProps = {
  user: UserDto;
  isUpdatingImage?: boolean;
  onChangeProfileImage: () => void;
};

export const AccountHeader = ({ user, isUpdatingImage, onChangeProfileImage }: AccountHeaderProps) => {
  const createdAt = user.createdAt ? dayjs(user.createdAt).format('YY.MM.DD') : null;
  const signupType = SOCIAL_LABEL[user.socialType];

  return (
    <XStack gap={20}>
      <UserAvatar
        image={user.image}
        loading={isUpdatingImage}
        onPressEdit={onChangeProfileImage}
        onPressAdd={onChangeProfileImage}
      />
      <YStack>
        <Text fontSize={20} fontWeight="500" color="$black900" lineHeight={22} mb={12}>
          {user.nickname}님
        </Text>
        <Text fontSize={13} lineHeight={15} fontWeight="500" color="$black600" mb={10}>
          {user.email}
        </Text>
        <Text fontSize={12} lineHeight={14} fontWeight="500" color="$white600" letterSpacing={-0.25}>
          {createdAt ? `${createdAt} ` : ''}
          {signupType} 간편 가입
        </Text>
      </YStack>
    </XStack>
  );
};
