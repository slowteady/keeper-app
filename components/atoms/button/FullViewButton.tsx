import theme from '@/constants/theme';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NavArrowIcon } from '../icons/ArrowIcon';

interface FullViewButtonProps {
  onPress: () => void;
}

const FullViewButton = ({ onPress }: FullViewButtonProps) => {
  return (
    <Pressable>
      <View style={styles.container}>
        <NavArrowIcon width={48} height={48} stroke={theme.colors.white[900]} strokeWidth={1.5} />
      </View>
      <Text style={styles.text}>전체보기</Text>
    </Pressable>
  );
};

export default FullViewButton;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.black[700],
    borderRadius: 5,
    opacity: 0.7,
    marginBottom: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    fontSize: 14,
    color: theme.colors.black[800],
    fontWeight: '400'
  }
});
