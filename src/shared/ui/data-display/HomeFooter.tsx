import { Linking, Pressable } from 'react-native';
import { styled, Text, useTheme, YStack } from 'tamagui';

import { Logo } from '../icons/outline';

export const HomeFooter = () => {
  const { black900 } = useTheme();

  const handlePressContact = () => {
    const email = process.env.EXPO_PUBLIC_DEVELOPER_EMAIL;
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <Container>
      <Logo width={96} height={30} color={black900.val} />

      <MenuContainer>
        <Pressable onPress={handlePressContact}>
          <CustomText>contact us</CustomText>
        </Pressable>
      </MenuContainer>

      <Copyright>©2025, All right reserved.</Copyright>
    </Container>
  );
};

const Container = styled(YStack, {
  bg: '$white850',
  px: 20,
  py: 40
});
const MenuContainer = styled(YStack, {
  gap: 12,
  mt: 20,
  mb: 40
});
const CustomText = styled(Text, {
  fontSize: 14,
  lineHeight: 16,
  fontWeight: '400'
});
const Copyright = styled(Text, {
  fontSize: 13,
  lineHeight: 15,
  fontWeight: '300',
  color: '$black500'
});
