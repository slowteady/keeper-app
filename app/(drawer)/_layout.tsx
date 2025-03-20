import MainHeader from '@/components/organisms/headers/MainHeader';
import { Drawer } from 'expo-router/drawer';

const DrawerLayout = () => {
  return (
    <Drawer screenOptions={{ drawerPosition: 'right' }}>
      <Drawer.Screen name="index" options={{ header: () => <MainHeader /> }} />
    </Drawer>
  );
};

export default DrawerLayout;
