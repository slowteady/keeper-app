import { useCallback, useRef } from 'react';
import { ActivityIndicator, LayoutChangeEvent } from 'react-native';
import { styled, Text, View } from 'tamagui';

export interface ShowMoreButtonProps {
  text: string;
  onPress: () => void;
  isLoading: boolean;
}

export const ShowMoreButton = ({ text, onPress, isLoading }: ShowMoreButtonProps) => {
  const minWidth = useRef(0);

  const setMinWidth = useCallback((event: LayoutChangeEvent) => {
    minWidth.current = event.nativeEvent.layout.width;
  }, []);

  return (
    <Button onPress={onPress} disabled={isLoading}>
      {isLoading ? (
        <ActivityIndicator size={16} style={{ minWidth: minWidth.current }} />
      ) : (
        <Text fontWeight="600" fontSize={13} lineHeight={15} color="$white900" onLayout={setMinWidth}>
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
