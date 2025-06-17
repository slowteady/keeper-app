import theme from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { RightArrow } from '../icons/outline';

interface FullViewButtonProps {
  onPress: () => void;
}

const FullViewButton = ({ onPress }: FullViewButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container} activeOpacity={1}>
      <View style={styles.arrowContainer}>
        <RightArrow width={26} height={26} color={theme.colors.black[400]} />
      </View>
      <Text style={styles.text}>전체보기</Text>
    </TouchableOpacity>
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
    gap: 10
  },
  arrowContainer: {
    backgroundColor: theme.colors.white[800],
    borderRadius: 5,
    opacity: 0.7,
    padding: 12
  },
  text: {
    fontSize: 15,
    lineHeight: 17,
    color: theme.colors.black[700],
    fontWeight: '400',
    textAlign: 'center'
  }
});
