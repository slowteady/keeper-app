import { DrawerActions } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { router, useNavigation } from 'expo-router';
import { memo } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { useLayout } from '@/shared';
import { theme } from '@/shared';

import { Button } from '../button';
import { Logo, Menu } from '../icons/outline';

export interface MainHeaderProps {
  useDrawer?: boolean;
}
export const MainHeader = memo(({ useDrawer = true }: MainHeaderProps) => {
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
            <Button onPress={handlePressMenu}>
              <Menu width={24} height={24} color={theme.colors.black[900]} />
            </Button>
          </View>
        )}
      </View>
    </View>
  );
});

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
