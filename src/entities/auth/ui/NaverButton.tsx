import NaverLogin from '@react-native-seoul/naver-login';
import { useState } from 'react';
import { styled, Text, View, XStack } from 'tamagui';

import { logger } from '@/shared';
import { Naver } from '@/shared/ui/icons/etc';

import { SocialLoginType } from '../model';

export const NaverButton = ({ onResponse }: { onResponse: (category: SocialLoginType, token: string) => void }) => {
  const [isLoading, setIsLoading] = useState(false);

  const loginNaver = async () => {
    try {
      if (isLoading) return;
      setIsLoading(true);

      const response = await NaverLogin.login();
      if (!response.successResponse) return;

      onResponse('NAVER', response.successResponse.accessToken);
    } catch (error) {
      logger.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container onPress={loginNaver}>
      <IconWrap>
        <Naver width={22} height={22} />
      </IconWrap>
      <Text fontSize={16} fontWeight="600" lineHeight={24} ml={18} flex={1} color="$white900">
        Naver로 로그인
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
  bg: '#03C75A'
});

const IconWrap = styled(View, {
  flexBasis: '30%',
  items: 'flex-end'
});
