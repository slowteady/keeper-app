import { router } from 'expo-router';
import { Linking } from 'react-native';
import { styled, Text, useTheme, View, XStack, YStack } from 'tamagui';

import { Logo } from '@/shared/ui/icons/outline';

export const HomeFooterSection = () => {
  const { black900 } = useTheme();
  const year = new Date().getFullYear();

  const handlePressContact = () => {
    Linking.openURL(`mailto:${process.env.EXPO_PUBLIC_DEVELOPER_EMAIL}`);
  };

  return (
    <Container px={20} py={40}>
      <Logo width={96} height={30} color={black900.val} />

      <YStack mt={20} mb={32} gap={14}>
        <XStack gap={6} items="center" flexWrap="wrap">
          <View onPress={() => router.push('/terms')} hitSlop={8}>
            <LinkText>이용약관</LinkText>
          </View>
          <LinkText color="$black500">·</LinkText>
          <View onPress={() => router.push('/privacy')} hitSlop={8}>
            <LinkText fontWeight="600">개인정보처리방침</LinkText>
          </View>
          <LinkText color="$black500">·</LinkText>
          <View onPress={() => router.push('/community-guideline')} hitSlop={8}>
            <LinkText>커뮤니티 가이드라인</LinkText>
          </View>
        </XStack>

        <View onPress={handlePressContact} hitSlop={12}>
          <LinkText>문의하기</LinkText>
        </View>
      </YStack>

      <Text fontSize={13} lineHeight={15} fontWeight="300" color="$black500">
        © {year} keeper. All rights reserved.
      </Text>
    </Container>
  );
};

const Container = styled(YStack, {
  bg: '$white850'
});

const LinkText = styled(Text, {
  fontSize: 14,
  lineHeight: 16,
  fontWeight: '400',
  color: '$black900'
});
