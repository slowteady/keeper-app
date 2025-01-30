import theme from '@/constants/theme';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NavArrowIcon } from '../icons/ArrowIcon';

interface FullViewButtonProps {
  onPress: () => void;
}

const FullViewButton = ({ onPress }: FullViewButtonProps) => {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={styles.arrowContainer}>
        <NavArrowIcon width={48} height={48} stroke={theme.colors.white[900]} strokeWidth={1.5} />
      </View>
      <Text style={styles.text}>전체보기</Text>
    </Pressable>
  );
};

export default FullViewButton;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  arrowContainer: {
    backgroundColor: theme.colors.black[700],
    borderRadius: 5,
    opacity: 0.7
  },
  text: {
    fontSize: 14,
    color: theme.colors.black[800],
    fontWeight: '400',
    textAlign: 'center'
  }
});
