import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import { BasicModal } from './BasicModal';

interface ShelterTelModalProps {
  open: boolean;
  tel: string;
  onClose: () => void;
  name?: string;
}

const ShelterTelModal = ({ open, tel, onClose, name }: ShelterTelModalProps) => {
  const person = name || '담당자';

  const handleCopy = useCallback(
    async (tel: string) => {
      onClose();
      await Clipboard.setStringAsync(tel);
      Alert.alert('', '전화번호를 복사했습니다.', [{ text: '확인' }]);
    },
    [onClose]
  );

  const handlePressContact = useCallback(async () => {
    const sanitizedNumber = tel.replace(/[^0-9]/g, '').trim();
    const telLink = `tel:${sanitizedNumber}`;

    if (Platform.OS === 'ios' && Platform.isPad) {
      await handleCopy(sanitizedNumber);
      onClose();
      return;
    }

    try {
      await Linking.openURL(telLink);
      onClose();
    } catch {
      await handleCopy(sanitizedNumber);
    }
  }, [handleCopy, onClose, tel]);

  return (
    <BasicModal open={open} onPressBackdrop={onClose} containerStyle={{ paddingTop: 32, paddingBottom: 16 }}>
      <BasicModal.Title value={`${person}에 전화 문의하기`} style={{ marginBottom: 12 }} />
      <BasicModal.Description
        value={'*원활한 소통을 위해 상담원이 상담, 휴대폰 번호, 주소 등을 수집할 수 있습니다.'}
        style={{ marginBottom: 32 }}
      />
      <BasicModal.Buttons
        onPress={handlePressContact}
        onClose={onClose}
        PrimaryTextProps={{ children: '문의하기' }}
        SecondaryTextProps={{ children: '닫기' }}
      />
    </BasicModal>
  );
};

export default ShelterTelModal;
