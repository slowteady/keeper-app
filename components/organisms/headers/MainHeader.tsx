import { LogoIcon } from '@/components/atoms/icons/LogoIcon';
import { MenuIcon } from '@/components/atoms/icons/MenuIcon';
import { SearchIcon } from '@/components/atoms/icons/SearchIcon';
import theme from '@/constants/theme';
import { useLayout } from '@/hooks/useLayout';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { memo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

const MainHeader = memo(() => {
  const { headerTop } = useLayout();

  const handlePressMenu = async () => {
    router.push('/menu');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.wrap, { paddingTop: headerTop }]}>
        <LogoIcon />
        <View style={styles.rightContainer}>
          <TouchableOpacity activeOpacity={0.5}>
            <SearchIcon />
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePressMenu} activeOpacity={0.5}>
            <MenuIcon />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

export default MainHeader;

const styles = StyleSheet.create({
  container: {
    position: 'sticky',
    backgroundColor: theme.colors.background.default,
    paddingHorizontal: 20,
    paddingBottom: 16
  },
  wrap: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  rightContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20
  }
});

MainHeader.displayName = 'MainHeader';
