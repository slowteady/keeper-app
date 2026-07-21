import { ChevronRight, FileText, Heart } from '@tamagui/lucide-icons';
import { styled, Text, useTheme, View, XStack, YStack } from 'tamagui';

import { SOCIAL_LABEL, UserDto } from '@/entities/auth';
import { EmptyAvatar, UserAvatar } from '@/entities/profile';
import { SCREEN_GUTTER } from '@/shared/lib';
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
  const { black500 } = useTheme();
  const chevronColor = black500.val;
  return (
    <View px={SCREEN_GUTTER} mb={8} pt={40}>
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
                  <XStack items="center" justify="space-between" gap={12}>
                    <Text numberOfLines={1} fontSize={20} lineHeight={20} fontWeight="500" color="$black900" flex={1}>
                      {user.nickname}님
                    </Text>
                    <AccountAction onPress={onAccount}>
                      <Text fontSize={13} lineHeight={16} fontWeight="600" style={{ color: chevronColor }}>
                        계정관리
                      </Text>
                      <ChevronRight size={14} color={chevronColor as never} />
                    </AccountAction>
                  </XStack>
                  <Text numberOfLines={1} fontSize={13} lineHeight={16} fontWeight="500" color="$black500">
                    {SOCIAL_LABEL[user.socialType]} 계정으로 로그인했어요
                  </Text>
                </YStack>
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
              <QuickActionLabel>관심</QuickActionLabel>
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
