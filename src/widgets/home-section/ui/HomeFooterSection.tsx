import { Linking } from 'react-native';
import { styled, Text, useTheme, View, YStack } from 'tamagui';

import { Logo } from '@/shared/ui/icons/outline';

export const HomeFooterSection = () => {
  const { black900 } = useTheme();

  const handlePressContact = () => {
    const email = process.env.EXPO_PUBLIC_DEVELOPER_EMAIL;
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <Container px={20} py={40}>
      <Logo width={96} height={30} color={black900.val} />

      <YStack mt={20} mb={40} gap={12}>
        <View onPress={handlePressContact} hitSlop={12}>
          <Text fontSize={14} lineHeight={16} fontWeight="400">
            contact us
          </Text>
        </View>
      </YStack>

      <Text fontSize={13} lineHeight={15} fontWeight="300" color="$black500">
        ©2025, All right reserved.
      </Text>
    </Container>
  );
};

const Container = styled(YStack, {
  bg: '$white850'
});
