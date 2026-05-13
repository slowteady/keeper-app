import { styled, Text, View } from 'tamagui';

import { ModalButtons } from '@/shared/ui';

export type ConfirmDeleteModalProps = {
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmDeleteModal = ({
  title = '정말 삭제하시겠어요?',
  description,
  onConfirm,
  onCancel
}: ConfirmDeleteModalProps) => {
  return (
    <Container>
      <Text mb={description ? 12 : 32} fontSize={17} fontWeight="600" color="$black800" lineHeight={19}>
        {title}
      </Text>
      {description && (
        <Text mb={32} fontSize={14} fontWeight="400" color="$black500" lineHeight={19}>
          {description}
        </Text>
      )}

      <ModalButtons
        onPressSecondary={onCancel}
        onPressPrimary={onConfirm}
        text={{ primary: '삭제', secondary: '닫기' }}
      />
    </Container>
  );
};

const Container = styled(View, {
  width: '80%',
  rounded: 18,
  bg: '$white900',
  px: 20,
  pt: 32,
  pb: 16
});
