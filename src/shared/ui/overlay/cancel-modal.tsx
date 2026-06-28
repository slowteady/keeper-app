import { Pressable, StyleSheet } from 'react-native';
import { styled, Text, View } from 'tamagui';

import { ModalButtons } from './modal-buttons';

export type CancelModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
};

export const CancelModal = ({
  open,
  onClose,
  onConfirm,
  title = '정말 나가시겠어요?',
  description,
  confirmText = '나가기',
  cancelText = '닫기'
}: CancelModalProps) => {
  if (!open) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Pressable onPress={onClose} style={[StyleSheet.absoluteFill, styles.dim]} />
      <View style={styles.centered} pointerEvents="box-none">
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
            onPressSecondary={onClose}
            onPressPrimary={onConfirm}
            text={{ primary: confirmText, secondary: cancelText }}
          />
        </Container>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dim: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  centered: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' }
});

const Container = styled(View, {
  width: '80%',
  rounded: 18,
  bg: '$white900',
  px: 20,
  pt: 32,
  pb: 16
});
