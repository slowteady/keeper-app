import { ComponentType, useState } from 'react';
import { styled, Text, useTheme, View, XStack } from 'tamagui';

import { socialAuth, SocialAuthResult } from '@/shared/api';
import { logger } from '@/shared/lib';

type SocialLoginButtonProps = {
  provider: keyof typeof socialAuth;
  label: string;
  icon: ComponentType<{ width: number; height: number; color?: string }>;
  bg: string;
  textColor?: string;
  borderColor?: string;
  onResponse: (result: SocialAuthResult) => void;
};

export const SocialLoginButton = ({
  provider,
  label,
  icon: Icon,
  bg,
  textColor = '$black900',
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
      <IconWrap>
        <Icon width={22} height={22} color={black900?.val} />
      </IconWrap>
      <Text fontSize={16} fontWeight="600" lineHeight={24} ml={18} flex={1} style={{ color: textColor }}>
        {label}
      </Text>
    </Container>
  );
};

const Container = styled(XStack, {
  position: 'relative',
  items: 'center',
  justify: 'center',
  width: '100%',
  py: 14,
  rounded: 5
});

const IconWrap = styled(View, { flexBasis: '30%', items: 'flex-end' });
