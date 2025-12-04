import { useToastController } from '@tamagui/toast';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { styled, Text, View } from 'tamagui';

import { ModalButtons, useModal } from '@/shared';

export interface CallShelterModalProps {
  open: boolean;
  tel: string;
  onClose: () => void;
  name?: string;
}

export const CallShelterModal = ({ open, tel, onClose, name }: CallShelterModalProps) => {
  const { show } = useToastController();
  const { open: openModal, close: closeModal } = useModal();

  const person = name || '담당자';

  const executeCopy = useCallback(
    async (tel: string) => {
      closeModal();
      onClose();

      await Clipboard.setStringAsync(tel);
      show('전화번호를 복사했어요.', { customData: { status: 'success' } });
    },
    [closeModal, onClose, show]
  );

  const executeCall = useCallback(async () => {
    const sanitizedNumber = tel.replace(/[^0-9]/g, '').trim();
    const telLink = `tel:${sanitizedNumber}`;

    try {
      if (Platform.OS === 'ios' && Platform.isPad) {
        await executeCopy(sanitizedNumber);
        return;
      }

      await Linking.openURL(telLink);
      closeModal();
      onClose();
    } catch {
      await executeCopy(sanitizedNumber);
    }
  }, [executeCopy, closeModal, onClose, tel]);

  const executeClose = useCallback(() => {
    closeModal();
    onClose();
  }, [closeModal, onClose]);

  useEffect(() => {
    if (!open) {
      closeModal();
      return;
    }

    const modalContent = (
      <Container>
        <Text
          mb={12}
          fontSize={17}
          fontWeight="600"
          color="$black800"
          lineHeight={19}
        >{`${person}에 전화 문의하기`}</Text>
        <Text mb={32} fontSize={14} fontWeight="400" color="$black500" lineHeight={19}>
          *원활한 소통을 위해 상담원이 상담, 휴대폰 번호, 주소 등을 수집할 수 있습니다.
        </Text>

        <ModalButtons
          onPressSecondary={executeClose}
          onPressPrimary={executeCall}
          text={{ primary: '문의하기', secondary: '닫기' }}
        />
      </Container>
    );

    openModal(modalContent, { onDismiss: onClose });
  }, [open, person, executeClose, executeCall, openModal, closeModal, onClose]);

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
