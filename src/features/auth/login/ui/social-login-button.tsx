import { ComponentType, useState } from 'react';
import { ColorTokens, styled, Text, useTheme, XStack } from 'tamagui';

import { socialAuth, SocialAuthResult } from '@/shared/api';
import { logger } from '@/shared/lib';

type SocialLoginButtonProps = {
  provider: keyof typeof socialAuth;
  label: string;
  icon: ComponentType<{ width: number; height: number; color?: string }>;
  bg: string;
  textColor?: ColorTokens;
  iconColor?: string;
  borderColor?: string;
  onResponse: (result: SocialAuthResult) => void;
};

export const SocialLoginButton = ({
  provider,
  label,
  icon: Icon,
  bg,
  textColor = '$black900',
  iconColor,
  borderColor,
  onResponse
}: SocialLoginButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { black900 } = useTheme();

  const handlePress = async () => {
    try {
      if (isLoading) return;
      setIsLoading(true);
      const result = await socialAuth[provider].login();
      onResponse(result);
    } catch (error) {
      logger.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container
      onPress={handlePress}
      style={{ backgroundColor: bg, borderColor: borderColor || 'transparent', borderWidth: borderColor ? 1 : 0 }}
    >
      <Icon width={22} height={22} color={iconColor ?? black900?.val} />
      <Text fontSize={16} fontWeight="600" lineHeight={24} ml={10} color={textColor}>
        {label}
      </Text>
    </Container>
  );
};

const Container = styled(XStack, {
  items: 'center',
  justify: 'center',
  width: '100%',
  py: 14,
  rounded: 5
});
