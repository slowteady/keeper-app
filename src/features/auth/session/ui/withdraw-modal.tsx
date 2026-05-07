import { styled, Text, View, XStack } from 'tamagui';

type WithdrawModalProps = {
  onWithdraw: () => void;
  onClose: () => void;
};

export const WithdrawModal = ({ onWithdraw, onClose }: WithdrawModalProps) => (
  <Container>
    <Text fontSize={17} fontWeight="600" color="$black800" lineHeight={20} mb={12}>
      정말 탈퇴하실건가요?
    </Text>
    <Text mb={32} fontSize={14} fontWeight="400" color="$black500" lineHeight={19}>
      {`탈퇴 후 계정 복구는 불가하며,\n작성한 게시글은 '탈퇴한 회원'으로 표시됩니다`}
    </Text>
    <XStack gap={6}>
      <ModalButton onPress={onClose} bg="$white800">
        <ModalButtonText>취소</ModalButtonText>
      </ModalButton>
      <ModalButton onPress={onWithdraw} bg="$errorMain">
        <ModalButtonText color="$white900">탈퇴하기</ModalButtonText>
      </ModalButton>
    </XStack>
  </Container>
);

const Container = styled(View, { width: '80%', rounded: 18, bg: '$white900', px: 20, pt: 32, pb: 16 });
const ModalButton = styled(View, { rounded: 10, py: 16, flex: 1 });
const ModalButtonText = styled(Text, {
  fontSize: 14,
  fontWeight: '600',
  lineHeight: 16,
  text: 'center',
  color: '$black800'
});
