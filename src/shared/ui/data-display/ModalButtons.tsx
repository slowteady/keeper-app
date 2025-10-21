import { Pressable, StyleSheet } from 'react-native';
import { styled, Text, useTheme, XStack } from 'tamagui';

export interface ModalButtonsProps {
  onPressSecondary: () => void;
  onPressPrimary: () => void;
  text: {
    primary: string;
    secondary: string;
  };
}

export const ModalButtons = ({ onPressSecondary, onPressPrimary, text }: ModalButtonsProps) => {
  const { white800, primaryMain } = useTheme();

  return (
    <XStack gap={6}>
      <Pressable onPress={onPressSecondary} style={[styles.closeButton, { backgroundColor: white800.val }]}>
        <ButtonText>{text.secondary}</ButtonText>
      </Pressable>

      <Pressable onPress={onPressPrimary} style={[styles.primaryButton, { backgroundColor: primaryMain.val }]}>
        <ButtonText>{text.primary}</ButtonText>
      </Pressable>
    </XStack>
  );
};

const ButtonText = styled(Text, {
  fontSize: 14,
  fontWeight: '600',
  lineHeight: 16,
  text: 'center',
  color: '$black800'
});

const styles = StyleSheet.create({
  closeButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 10
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 10
  }
});
