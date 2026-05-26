import dayjs from 'dayjs';
import { Text, XStack, YStack } from 'tamagui';

import { SocialLoginType, UserDto } from '@/entities/auth';
import { UserAvatar } from '@/entities/profile';

type AccountHeaderProps = {
  user: UserDto;
  onChangeProfileImage: () => void;
};

const SOCIAL_LABEL: Record<SocialLoginType, string> = {
  KAKAO: '카카오',
  NAVER: '네이버',
  GOOGLE: '구글',
  APPLE: '애플'
};

export const AccountHeader = ({ user, onChangeProfileImage }: AccountHeaderProps) => {
  const createdAt = user.createdAt ? dayjs(user.createdAt).format('YY.MM.DD') : null;
  const signupType = SOCIAL_LABEL[user.socialType];

  return (
    <XStack gap={20}>
      <UserAvatar image={user.image} onPressEdit={onChangeProfileImage} onPressAdd={onChangeProfileImage} />
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
