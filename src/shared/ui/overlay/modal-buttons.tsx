import { styled, Text, View, XStack } from 'tamagui';

export type ModalButtonsProps = {
  onPressSecondary: () => void;
  onPressPrimary: () => void;
  text: {
    primary: string;
    secondary: string;
  };
  testIDSecondary?: string;
  testIDPrimary?: string;
};

export const ModalButtons = ({
  onPressSecondary,
  onPressPrimary,
  text,
  testIDSecondary,
  testIDPrimary
}: ModalButtonsProps) => {
  return (
    <XStack gap={6}>
      <Button onPress={onPressSecondary} bg="$white800" testID={testIDSecondary}>
        <ButtonText>{text.secondary}</ButtonText>
      </Button>

      <Button onPress={onPressPrimary} bg="$primaryMain" testID={testIDPrimary}>
        <ButtonText>{text.primary}</ButtonText>
      </Button>
    </XStack>
  );
};

const Button = styled(View, {
  rounded: 10,
  py: 16,
  flex: 1
});

const ButtonText = styled(Text, {
  fontSize: 14,
  fontWeight: '600',
  lineHeight: 16,
  text: 'center',
  color: '$black800'
});
