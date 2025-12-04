import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useState } from 'react';
import { styled, Text, View, XStack } from 'tamagui';

import { logger } from '@/shared';
import { Google } from '@/shared/ui/icons/etc';

import { SocialLoginType } from '../model';

export const GoogleButton = ({ onResponse }: { onResponse: (category: SocialLoginType, token: string) => void }) => {
  const [isLoading, setIsLoading] = useState(false);

  const loginGoogle = async () => {
    try {
      if (isLoading) return;
      setIsLoading(true);

      const response = await GoogleSignin.signIn();
      if (!response.data?.idToken) return;

      onResponse('GOOGLE', response.data.idToken);
    } catch (error) {
      logger.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container onPress={loginGoogle}>
      <IconWrap>
        <Google width={22} height={22} />
      </IconWrap>
      <Text fontSize={16} fontWeight="600" lineHeight={24} ml={18} flex={1} color="$black900" opacity={0.54}>
        Google로 로그인
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
  rounded: 5,
  bg: '#FFFFFF',
  borderColor: '#D9D9D9',
  borderWidth: 1
});

const IconWrap = styled(View, {
  flexBasis: '30%',
  items: 'flex-end'
});
