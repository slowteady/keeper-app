import { LogoEmblem } from '@/components/atoms/icons/LogoIcon';
import theme from '@/constants/theme';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

const NoImage = ({ style }: Record<string, ViewStyle>) => {
  return (
    <View style={[styles.image, styles.flex, { backgroundColor: theme.colors.background.default }, style]}>
      <Text style={styles.noImageText}>No Image</Text>
      <LogoEmblem />
    </View>
  );
};

export default NoImage;

const styles = StyleSheet.create({
  image: {
    borderRadius: 8,
    width: '100%',
    height: '100%'
  },
  flex: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8
  },
  noImageText: {
    color: theme.colors.black[400],
    fontSize: 19,
    fontWeight: '600'
  }
});
