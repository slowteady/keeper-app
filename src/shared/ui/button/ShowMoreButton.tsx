import { ActivityIndicator } from 'react-native';
import { styled, Text, View } from 'tamagui';

export interface ShowMoreButtonProps {
  text: string;
  onPress: () => void;
  isLoading?: boolean;
}

export const ShowMoreButton = ({ text, onPress, isLoading = false }: ShowMoreButtonProps) => {
  return (
    <Button onPress={onPress} disabled={isLoading}>
      {isLoading ? (
        <ActivityIndicator size={12} style={{ minWidth: 54 }} />
      ) : (
        <Text fontWeight="600" fontSize={13} lineHeight={15} color="$white900">
          {text}
        </Text>
      )}
    </Button>
  );
};

const Button = styled(View, {
  self: 'center',
  px: 28,
  py: 16,
  bg: '$black800',
  rounded: 50
});
