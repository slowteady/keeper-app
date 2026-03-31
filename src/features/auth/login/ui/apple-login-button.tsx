import {
  AppleAuthenticationButton,
  AppleAuthenticationButtonStyle,
  AppleAuthenticationButtonType
} from 'expo-apple-authentication';
import { useState } from 'react';

import { socialAuth, SocialAuthResult } from '@/shared/api';
import { logger } from '@/shared/lib';

type AppleLoginButtonProps = {
  onResponse: (result: SocialAuthResult) => void;
};

export const AppleLoginButton = ({ onResponse }: AppleLoginButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async () => {
    try {
      if (isLoading) return;
      setIsLoading(true);
      const result = await socialAuth.apple.login();
      onResponse(result);
    } catch (error) {
      logger.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppleAuthenticationButton
      buttonType={AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthenticationButtonStyle.BLACK}
      style={{ width: '100%', height: 50 }}
      cornerRadius={5}
      onPress={handlePress}
    />
  );
};
