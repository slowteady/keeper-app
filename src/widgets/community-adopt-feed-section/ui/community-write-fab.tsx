import { Pencil } from '@tamagui/lucide-icons';
import { Pressable, StyleSheet } from 'react-native';
import { useTheme } from 'tamagui';

export type CommunityWriteFabProps = {
  onPress: () => void;
};

export const CommunityWriteFab = ({ onPress }: CommunityWriteFabProps) => {
  const { primaryMain } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={[styles.button, { backgroundColor: primaryMain.val }]}
      accessibilityRole="button"
      accessibilityLabel="글쓰기"
      testID="community-write-fab"
    >
      <Pencil size={24} color="white" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6
  }
});
