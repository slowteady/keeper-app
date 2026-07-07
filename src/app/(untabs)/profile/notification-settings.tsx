import { LogIn } from '@tamagui/lucide-icons';
import { useState } from 'react';
import { Pressable } from 'react-native';
import { ScrollView, styled, Text, View, XStack, YStack } from 'tamagui';

import { NOTIFICATION_CATEGORY_META, NotificationCategoryDto } from '@/entities/notification';
import { useCurrentUser, useOpenLoginSheet } from '@/features/auth';
import {
  NotificationToggleRow,
  PermissionBanner,
  useNotificationPermission,
  useNotificationPreferences
} from '@/features/notification';
import { SCREEN_GUTTER } from '@/shared/lib';
import { useAnalytics } from '@/shared/lib/analytics';
import { NavigateHeader } from '@/shared/ui';

const Page = () => {
  const { user } = useCurrentUser();
  const isLoggedIn = Boolean(user);
  const isAdmin = user?.role === 'ADMIN';
  const openLoginSheet = useOpenLoginSheet();
  const { isGranted, openSettings } = useNotificationPermission();
  const { categories, isEnabled, toggle } = useNotificationPreferences(isLoggedIn);

  const { optOut, optIn, optedOut } = useAnalytics();
  const [analyticsAllowed, setAnalyticsAllowed] = useState(!optedOut);
  const handleAnalyticsToggle = (next: boolean) => {
    setAnalyticsAllowed(next);
    if (next) optIn();
    else optOut();
  };

  const generalCategories = categories.filter((category) => NOTIFICATION_CATEGORY_META[category].section === 'general');
  const adminCategories = categories.filter((category) => NOTIFICATION_CATEGORY_META[category].section === 'admin');

  const renderToggle = (category: NotificationCategoryDto) => (
    <NotificationToggleRow
      key={category}
      label={NOTIFICATION_CATEGORY_META[category].label}
      description={NOTIFICATION_CATEGORY_META[category].description}
      value={isEnabled(category)}
      onChange={(next) => toggle(category, next)}
    />
  );

  return (
    <Container>
      <NavigateHeader text="알림 설정" />
      <ScrollView pt={8} pb={24}>
        {!isGranted && <PermissionBanner onPress={openSettings} />}

        <YStack px={SCREEN_GUTTER} position="relative" mt={16}>
          <YStack opacity={isLoggedIn ? 1 : 0.35} pointerEvents={isLoggedIn ? undefined : 'none'}>
            {generalCategories.map(renderToggle)}
          </YStack>

          {!isLoggedIn && (
            <Overlay>
              <LogIn size={22} color="$black700" />
              <OverlayText>로그인하면 알림을 설정할 수 있어요</OverlayText>
              <Pressable onPress={() => openLoginSheet()} accessibilityRole="button">
                <LoginButton>
                  <LoginButtonText>로그인</LoginButtonText>
                </LoginButton>
              </Pressable>
            </Overlay>
          )}
        </YStack>

        {isAdmin && adminCategories.length > 0 && (
          <YStack px={SCREEN_GUTTER} mt={32}>
            <SectionTitle>운영자 알림</SectionTitle>
            {adminCategories.map(renderToggle)}
          </YStack>
        )}

        <YStack px={SCREEN_GUTTER} mt={32}>
          <SectionTitle>개인정보</SectionTitle>
          <NotificationToggleRow
            label="이용 정보 분석 허용"
            description="서비스 개선을 위한 익명 사용 통계 수집에 동의해요"
            value={analyticsAllowed}
            onChange={handleAnalyticsToggle}
          />
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

const SectionTitle = styled(Text, {
  mb: 4,
  fontSize: 14,
  fontWeight: '500',
  lineHeight: 18,
  letterSpacing: -0.25,
  color: '$black500'
});

const Overlay = styled(YStack, {
  position: 'absolute',
  t: 0,
  l: 0,
  r: 0,
  b: 0,
  pt: 16,
  items: 'center',
  justify: 'center',
  gap: 10
});

const OverlayText = styled(Text, {
  fontSize: 14,
  fontWeight: '500',
  lineHeight: 18,
  letterSpacing: -0.28,
  color: '$black700'
});

const LoginButton = styled(XStack, {
  px: 18,
  py: 9,
  rounded: 8,
  bg: '$black800',
  items: 'center',
  justify: 'center'
});

const LoginButtonText = styled(Text, {
  fontSize: 13,
  fontWeight: '600',
  color: '$white900'
});
