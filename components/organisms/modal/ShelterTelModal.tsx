import { useCallback } from 'react';
import { Linking } from 'react-native';
import { BasicModal } from './BasicModal';

interface ShelterTelModalProps {
  open: boolean;
  tel: string;
  onClose: () => void;
  name?: string;
}

const ShelterTelModal = ({ open, tel, onClose, name }: ShelterTelModalProps) => {
  const person = name || '담당자';

  const handlePressContact = useCallback(() => {
    const sanitizedNumber = tel.replace(/-/g, '');
    Linking.openURL(`tel:${sanitizedNumber}`);
  }, [tel]);

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
