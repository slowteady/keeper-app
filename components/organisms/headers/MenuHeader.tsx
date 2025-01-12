import { CloseIcon } from '@/components/atoms/icons/CloseIcon';
import { HomeIcon } from '@/components/atoms/icons/HomeIcon';
import { LogoIcon } from '@/components/atoms/icons/LogoIcon';
import theme from '@/constants/theme';
import { router } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MenuHeader = () => {
  const { top = 16 } = useSafeAreaInsets();

  const handlePressHome = () => {
    router.replace('/');
  };

  const handlePressMenuClose = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <TouchableOpacity onPress={handlePressHome}>
        <HomeIcon />
      </TouchableOpacity>
      <LogoIcon />
      <TouchableOpacity onPress={handlePressMenuClose}>
        <CloseIcon />
      </TouchableOpacity>
    </View>
  );
};

export default MenuHeader;

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: theme.colors.white[900],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.black[900],
    borderStyle: 'solid'
  }
});
