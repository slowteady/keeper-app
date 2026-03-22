import {
  AppleAuthenticationButton,
  AppleAuthenticationButtonStyle,
  AppleAuthenticationButtonType,
  AppleAuthenticationScope,
  signInAsync
} from 'expo-apple-authentication';
import { useState } from 'react';

import { logger } from '@/shared/lib';

import { SocialLoginType } from '../model';

export const AppleButton = ({ onResponse }: { onResponse: (category: SocialLoginType, token: string) => void }) => {
  const [isLoading, setIsLoading] = useState(false);

  const loginApple = async () => {
    try {
      if (isLoading) return;
      setIsLoading(true);

      const response = await signInAsync({
        requestedScopes: [AppleAuthenticationScope.FULL_NAME, AppleAuthenticationScope.EMAIL]
      });
      if (!response.identityToken) return;

      onResponse('APPLE', response.identityToken);
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
      onPress={loginApple}
    />
  );
};
