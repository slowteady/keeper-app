import { styled, Text, YStack } from 'tamagui';

import { ModalButtons } from '@/shared/ui';

type LoginRequiredModalProps = {
  onLogin: () => void;
  onCancel: () => void;
};

export const LoginRequiredModal = ({ onLogin, onCancel }: LoginRequiredModalProps) => (
  <Container testID="login-required-modal" accessible={false}>
    <Text mb={12} fontSize={17} fontWeight="600" color="$black800">
      로그인이 필요해요
    </Text>
    <Text mb={32} fontSize={14} fontWeight="400" color="$black500">
      로그인 후 이용해주세요
    </Text>
    <ModalButtons
      onPressSecondary={onCancel}
      onPressPrimary={onLogin}
      text={{ primary: '로그인하기', secondary: '닫기' }}
      testIDSecondary="login-required-cancel"
      testIDPrimary="login-required-confirm"
    />
  </Container>
);

const Container = styled(YStack, {
  width: '80%',
  rounded: 14,
  bg: '$white900',
  px: 20,
  pt: 32,
  pb: 16,
  items: 'flex-start',
  justify: 'center'
});
