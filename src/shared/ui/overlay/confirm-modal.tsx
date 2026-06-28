import { styled, Text, View } from 'tamagui';

import { ModalButtons } from './modal-buttons';

export type ConfirmModalProps = {
  title: string;
  description?: string;
  confirmText: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmModal = ({
  title,
  description,
  confirmText,
  cancelText = '취소',
  destructive = false,
  onConfirm,
  onCancel
}: ConfirmModalProps) => (
  <Container>
    <Text mb={description ? 12 : 32} fontSize={17} fontWeight="600" color="$black800" lineHeight={24}>
      {title}
    </Text>
    {description && (
      <Text mb={32} fontSize={14} fontWeight="400" color="$black500" lineHeight={21}>
        {description}
      </Text>
    )}
    <ModalButtons
      onPressSecondary={onCancel}
      onPressPrimary={onConfirm}
      text={{ primary: confirmText, secondary: cancelText }}
      destructive={destructive}
    />
  </Container>
);

const Container = styled(View, {
  width: '80%',
  rounded: 18,
  bg: '$white900',
  px: 20,
  pt: 32,
  pb: 16
});
