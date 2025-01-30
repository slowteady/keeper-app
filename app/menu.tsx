import MenuTemplate from '@/components/templates/MenuTemplate';
import theme from '@/constants/theme';
import { StyleSheet, View } from 'react-native';

const Menu = () => {
  return (
    <View style={styles.container}>
      <MenuTemplate />
    </View>
  );
};

export default Menu;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.default,
    flex: 1
  }
});
