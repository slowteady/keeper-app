import { useCallback, useEffect } from 'react';
import { styled, Text, View } from 'tamagui';

import { ModalButtons } from './modal-buttons';
import { useModal } from './modal-provider';

export type CancelModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
};

export const CancelModal = ({
  open,
  onClose,
  onConfirm,
  title = '정말 나가시겠어요?',
  description
}: CancelModalProps) => {
  const { open: openModal, close: closeModal } = useModal();

  const executeClose = useCallback(() => {
    closeModal();
  }, [closeModal]);

  const executeConfirm = useCallback(() => {
    onConfirm();
    closeModal();
  }, [closeModal, onConfirm]);

  useEffect(() => {
    if (!open) {
      closeModal();
      return;
    }

    const modalContent = (
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
          onPressSecondary={executeClose}
          onPressPrimary={executeConfirm}
          text={{ primary: '나가기', secondary: '닫기' }}
        />
      </Container>
    );

    openModal(modalContent, { onDismiss: onClose });
  }, [open, title, description, openModal, closeModal, onClose, executeClose, executeConfirm]);

  return null;
};

const Container = styled(View, {
  width: '80%',
  rounded: 18,
  bg: '$white900',
  px: 20,
  pt: 32,
  pb: 16
});
