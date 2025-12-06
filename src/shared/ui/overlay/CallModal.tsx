import { useCallback, useEffect, useMemo } from 'react';
import { styled, Text, View } from 'tamagui';

import { ModalButtons, useCall, useModal } from '@/shared';

export interface CallModalProps {
  open: boolean;
  tel: string;
  onClose: () => void;
  name?: string;
  title?: string;
  description?: string;
}

export const CallModal = ({ open, tel, onClose, name, title, description }: CallModalProps) => {
  const { actions: callActions } = useCall();
  const { open: openModal, close: closeModal } = useModal();

  const executeCall = useCallback(async () => {
    callActions.executeCall(tel);
    closeModal();
  }, [callActions, closeModal, tel]);

  const executeClose = useCallback(() => {
    closeModal();
    onClose();
  }, [closeModal, onClose]);

  const modalContent = useMemo(() => {
    const person = name || '담당자님';

    return (
      <Container>
        <Text mb={12} fontSize={17} fontWeight="600" color="$black800" lineHeight={19}>
          {title || `${person}에게 문의하기`}
        </Text>

        {description && (
          <Text mb={32} fontSize={14} fontWeight="400" color="$black500" lineHeight={19}>
            {description}
          </Text>
        )}

        <ModalButtons
          onPressSecondary={executeClose}
          onPressPrimary={executeCall}
          text={{ primary: '문의하기', secondary: '닫기' }}
        />
      </Container>
    );
  }, [description, executeCall, executeClose, name, title]);

  useEffect(() => {
    if (!open) {
      closeModal();
      return;
    }

    openModal(modalContent, { onDismiss: onClose });
  }, [closeModal, modalContent, onClose, open, openModal]);

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
