import { login } from '@react-native-kakao/user';
import { useState } from 'react';
import { styled, Text, useTheme, View, XStack } from 'tamagui';

import { logger } from '@/shared/lib';
import { Kakao } from '@/shared/ui/icons/etc';

import { SocialLoginType } from '../model';
import { SOCIAL_LOGIN_TYPE } from '../model/constant';

export const KakaoButton = ({ onResponse }: { onResponse: (category: SocialLoginType, token: string) => void }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { black900 } = useTheme();

  const loginKakao = async () => {
    try {
      if (isLoading) return;
      setIsLoading(true);

      const response = await login();
      if (!response.idToken) return;

      onResponse(SOCIAL_LOGIN_TYPE.KAKAO, response.accessToken);
    } catch (error) {
      logger.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container onPress={loginKakao}>
      <IconWrap>
        <Kakao width={22} height={22} color={black900.val} />
      </IconWrap>
      <Text fontSize={16} fontWeight="600" lineHeight={24} ml={18} flex={1}>
        Kakao로 로그인
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
  bg: '#FEE500'
});

const IconWrap = styled(View, {
  flexBasis: '30%',
  items: 'flex-end'
});
