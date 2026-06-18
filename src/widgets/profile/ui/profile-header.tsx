import { ChevronRight, FileText, Heart } from '@tamagui/lucide-icons';
import { styled, Text, View, XStack, YStack } from 'tamagui';

import { SocialLoginType, UserDto } from '@/entities/auth';
import { EmptyAvatar, UserAvatar } from '@/entities/profile';
import { Skeleton } from '@/shared/ui';

type ProfileHeaderProps = {
  user?: UserDto | null;
  isLoading: boolean;
  isUpdatingImage?: boolean;
  onLogin: () => void;
  onAccount: () => void;
  onLike: () => void;
  onActivity: () => void;
  onChangeProfileImage: () => void;
};

const SOCIAL_LABEL: Record<SocialLoginType, string> = {
  KAKAO: '카카오',
  GOOGLE: '구글',
  APPLE: '애플'
};

export const ProfileHeader = ({
  user,
  isLoading,
  isUpdatingImage,
  onLogin,
  onAccount,
  onLike,
  onActivity,
  onChangeProfileImage
}: ProfileHeaderProps) => {
  return (
    <View px={20} mb={8} pt={40}>
      {isLoading ? (
        <YStack gap={20}>
          <XStack gap={16} items="center">
            <Skeleton style={{ width: 72, height: 72, borderRadius: 8 }} />
            <YStack flex={1} gap={10}>
              <Skeleton style={{ width: 120, height: 20, borderRadius: 4 }} />
              <Skeleton style={{ width: 100, height: 13, borderRadius: 4 }} />
            </YStack>
          </XStack>
          <XStack gap={10}>
            <Skeleton style={{ flex: 1, height: 54, borderRadius: 10 }} />
            <Skeleton style={{ flex: 1, height: 54, borderRadius: 10 }} />
          </XStack>
        </YStack>
      ) : (
        <YStack gap={20}>
          <XStack gap={16} items="center">
            {user ? (
              <>
                <UserAvatar
                  image={user.image}
                  loading={isUpdatingImage}
                  onPressAdd={onChangeProfileImage}
                  onPressEdit={onChangeProfileImage}
                />
                <YStack flex={1} gap={8}>
                  <Text numberOfLines={1} fontSize={20} lineHeight={20} fontWeight="500" color="$black900">
                    {user.nickname}님
                  </Text>
                  <Text numberOfLines={1} fontSize={13} lineHeight={16} fontWeight="500" color="$black500">
                    {SOCIAL_LABEL[user.socialType]} 계정으로 로그인했어요
                  </Text>
                </YStack>
                <AccountAction onPress={onAccount}>
                  <Text fontSize={13} lineHeight={16} fontWeight="600" color="$black600">
                    계정관리
                  </Text>
                  <ChevronRight size={14} color="$black500" />
                </AccountAction>
              </>
            ) : (
              <>
                <EmptyAvatar onPress={onLogin} />
                <LoginAction onPress={onLogin}>
                  <Text fontSize={20} lineHeight={24} fontWeight="600" color="$black900">
                    로그인하기
                  </Text>
                  <ChevronRight size={18} color="$black700" />
                </LoginAction>
              </>
            )}
          </XStack>

          <XStack gap={10}>
            <QuickAction onPress={user ? onLike : onLogin}>
              <Heart size={18} color="$black700" />
              <QuickActionLabel>관심 목록</QuickActionLabel>
            </QuickAction>
            <QuickAction onPress={user ? onActivity : onLogin}>
              <FileText size={18} color="$black700" />
              <QuickActionLabel>내 활동</QuickActionLabel>
            </QuickAction>
          </XStack>
        </YStack>
      )}
    </View>
  );
};

const LoginAction = styled(XStack, {
  flex: 1,
  height: 44,
  items: 'center',
  gap: 4
});

const AccountAction = styled(XStack, {
  height: 44,
  items: 'center',
  gap: 2
});

const QuickAction = styled(YStack, {
  flex: 1,
  height: 54,
  items: 'center',
  justify: 'center',
  gap: 6,
  bg: '$white850',
  rounded: 10
});

const QuickActionLabel = styled(Text, {
  fontSize: 12,
  lineHeight: 14,
  fontWeight: '600',
  color: '$black700'
});
