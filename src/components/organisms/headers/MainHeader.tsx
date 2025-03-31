import { Logo, Menu } from '@/components/atoms/icons/outline';
import theme from '@/constants/theme';
import { useLayout } from '@/hooks/useLayout';
import { DrawerActions } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { router, useNavigation } from 'expo-router';
import { memo } from 'react';
import { Platform, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';

interface MainHeaderProps {
  useDrawer?: boolean;
}
const MainHeader = memo(({ useDrawer = true }: MainHeaderProps) => {
  const navigation = useNavigation();
  const { top } = useLayout();

  const handlePressMenu = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.dispatch(DrawerActions.openDrawer());
  };
  const handlePress = () => {
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.wrap, { paddingTop: top }]}>
        <Pressable onPress={handlePress}>
          <Logo width={96} height={30} color={theme.colors.black[900]} />
        </Pressable>

        {useDrawer && (
          <View style={styles.rightContainer}>
            <TouchableOpacity onPress={handlePressMenu} activeOpacity={0.5}>
              <Menu width={24} height={24} color={theme.colors.black[900]} />
            </TouchableOpacity>
          </View>
        )}
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
