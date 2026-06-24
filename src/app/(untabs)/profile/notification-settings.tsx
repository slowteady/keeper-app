import { Pressable } from 'react-native';
import { ScrollView, Separator, styled, Text, View, YStack } from 'tamagui';

import { NOTIFICATION_CATEGORY_META } from '@/entities/notification';
import { useCurrentUser, useOpenLoginSheet } from '@/features/auth';
import {
  NotificationToggleRow,
  PermissionBanner,
  useNotificationPermission,
  useNotificationPreferences
} from '@/features/notification';
import { SCREEN_GUTTER } from '@/shared/lib';
import { NavigateHeader } from '@/shared/ui';

const Page = () => {
  const { user } = useCurrentUser();
  const isLoggedIn = Boolean(user);
  const openLoginSheet = useOpenLoginSheet();
  const { isGranted, openSettings } = useNotificationPermission();
  const { categories, isEnabled, toggle } = useNotificationPreferences(isLoggedIn);

  return (
    <Container>
      <NavigateHeader text="알림 설정" />
      <ScrollView py={24}>
        {!isGranted && <PermissionBanner onPress={openSettings} />}

        <YStack px={SCREEN_GUTTER} mb={24}>
          <NavText mb={4}>필수 통지</NavText>
          <NotificationToggleRow
            label="법적 통지"
            description="신고 처리·계정 정지 등 법적 통지라 끌 수 없어요"
            value
            locked
          />
        </YStack>

        <Separator borderColor="$backgroundDefault" mb={24} />

        <YStack px={SCREEN_GUTTER}>
          <NavText mb={4}>선택 알림</NavText>
          {isLoggedIn ? (
            categories.map((category) => (
              <NotificationToggleRow
                key={category}
                label={NOTIFICATION_CATEGORY_META[category].label}
                description={NOTIFICATION_CATEGORY_META[category].description}
                value={isEnabled(category)}
                onChange={(next) => toggle(category, next)}
              />
            ))
          ) : (
            <Pressable onPress={() => openLoginSheet()} accessibilityRole="button">
              <LoginPrompt>로그인하면 알림 종류를 설정할 수 있어요</LoginPrompt>
            </Pressable>
          )}
        </YStack>
      </ScrollView>
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});

const NavText = styled(Text, {
  fontSize: 14,
  fontWeight: '500',
  lineHeight: 18,
  letterSpacing: -0.25,
  color: '$black500'
});

const LoginPrompt = styled(Text, {
  py: 16,
  fontSize: 14,
  fontWeight: '500',
  lineHeight: 18,
  letterSpacing: -0.25,
  color: '$black600'
});
