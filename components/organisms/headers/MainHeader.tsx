import { LogoIcon } from '@/components/atoms/icons/LogoIcon';
import { MenuIcon } from '@/components/atoms/icons/MenuIcon';
import theme from '@/constants/theme';
import { useLayout } from '@/hooks/useLayout';
import { DrawerActions } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useNavigation } from 'expo-router';
import { memo } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

const MainHeader = memo(() => {
  const navigation = useNavigation();
  const { top } = useLayout();

  const handlePressMenu = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <View style={styles.container}>
      <View style={[styles.wrap, { paddingTop: top }]}>
        <LogoIcon color={theme.colors.black[900]} />
        <View style={styles.rightContainer}>
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
    backgroundColor: theme.colors.white[900],
    paddingHorizontal: 20,
    paddingBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.14,
        shadowRadius: 4
      },
      android: {
        elevation: 4
      }
    })
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
