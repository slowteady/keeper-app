import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { Drawer } from 'expo-router/drawer';
import { Dimensions } from 'react-native';

import { DrawerMenus } from '@/domains/menus';

const DrawerLayout = () => {
  const drawerWidth = (Dimensions.get('window').width * 2) / 3;

  return (
    <Drawer
      drawerContent={(props: DrawerContentComponentProps) => <DrawerMenus {...props} />}
      screenOptions={{
        lazy: false,
        drawerPosition: 'right',
        drawerType: 'front',
        drawerStyle: { width: drawerWidth },
        headerShown: false
      }}
    >
      <Drawer.Screen name="index" />
    </Drawer>
  );
};

export default DrawerLayout;
